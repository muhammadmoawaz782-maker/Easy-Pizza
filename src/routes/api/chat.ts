import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, tool, stepCountIs, type UIMessage } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";
import { menuSummary, RESTAURANT_INFO } from "@/lib/chat-menu";
import { findPizza } from "@/lib/menu";

const ORDER_WEBHOOK_URL =
  "https://maxo.app.n8n.cloud/webhook/58004ac5-d674-4526-bb13-17a06469bffd";
const DELIVERY_FEE = 200;

const systemPrompt = `You are the friendly ordering assistant for ${RESTAURANT_INFO.name}, a wood-fired Neapolitan pizzeria.

Use the available tools to answer questions:
- get_restaurant_info: hours, delivery, payment, general info about the shop.
- get_menu: full pizza menu with names, descriptions, tags, and prices in Rs (Pakistani Rupees).
- place_order: ONLY call this AFTER the customer has clearly confirmed the order (items, name, phone, email, address).

Order flow you MUST follow:
1. Help the customer pick pizzas. Use get_menu to show options. Quantities default to 1.
2. Collect: full name, phone, email, delivery address, and any optional notes.
3. Show a clear summary (pizzas with qty and line totals, Rs ${DELIVERY_FEE} delivery fee, grand total) and explicitly ask "Shall I place this order?"
4. ONLY after the user replies yes / confirm / place it, call place_order.
5. After place_order succeeds, share the order ID and ETA. If it fails, apologise and offer to retry.

Be concise, warm, and use markdown. Prices are in Rs (e.g. "Rs 1,400"). Never invent menu items or prices — always reference get_menu.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as { messages?: UIMessage[] };
        if (!Array.isArray(messages)) {
          return new Response("messages required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const gateway = createLovableAiGatewayProvider(key);
        const model = gateway("google/gemini-3-flash-preview");

        const result = streamText({
          model,
          system: systemPrompt,
          messages: await convertToModelMessages(messages),
          stopWhen: stepCountIs(50),
          tools: {
            get_restaurant_info: tool({
              description: "Returns hours, delivery info, payment methods, and general info about Easy Pizza.",
              inputSchema: z.object({}),
              execute: async () => RESTAURANT_INFO,
            }),
            get_menu: tool({
              description: "Returns the full Easy Pizza menu with ids, names, descriptions, tags, and prices in Rs.",
              inputSchema: z.object({}),
              execute: async () => ({ currency: "PKR", pizzas: menuSummary() }),
            }),
            place_order: tool({
              description:
                "Place the customer's pizza order. Only call after the user has explicitly confirmed.",
              inputSchema: z.object({
                customer: z.object({
                  name: z.string().min(2).max(80),
                  phone: z.string().min(7).max(20),
                  email: z.string().email().max(160),
                  address: z.string().min(5).max(200),
                  notes: z.string().max(300).optional(),
                }),
                items: z
                  .array(
                    z.object({
                      pizzaId: z.string().describe("Pizza id from get_menu"),
                      qty: z.number().int().min(1).max(20),
                    }),
                  )
                  .min(1),
              }),
              execute: async ({ customer, items }) => {
                const lines = items
                  .map((i) => {
                    const p = findPizza(i.pizzaId);
                    if (!p) return null;
                    return { name: p.name, qty: i.qty, price: p.price, lineTotal: p.price * i.qty };
                  })
                  .filter((l): l is NonNullable<typeof l> => l !== null);
                if (lines.length === 0) {
                  return { ok: false, error: "No valid pizzas in order." };
                }
                const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
                const total = subtotal + DELIVERY_FEE;
                const orderId = "FV-" + Math.random().toString(36).slice(2, 7).toUpperCase();
                const payload = {
                  "Order ID": orderId,
                  Name: customer.name,
                  Address: customer.address,
                  Email: customer.email,
                  Phone: customer.phone,
                  Items: lines.map((l) => `${l.qty}x ${l.name}`).join(", "),
                  Subtotal: subtotal,
                  "Delivery Fee": DELIVERY_FEE,
                  "Grand Total": total,
                  Time: new Date().toLocaleString("en-PK", {
                    timeZone: "Asia/Karachi",
                    dateStyle: "medium",
                    timeStyle: "short",
                  }),
                  Note: customer.notes && customer.notes.length > 0 ? customer.notes : "NULL",
                  Source: "Chatbot",
                };
                try {
                  const res = await fetch(ORDER_WEBHOOK_URL, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                  });
                  if (!res.ok) {
                    return {
                      ok: false,
                      error: `Order webhook responded ${res.status}. Please try again shortly.`,
                    };
                  }
                  return {
                    ok: true,
                    orderId,
                    subtotal,
                    deliveryFee: DELIVERY_FEE,
                    total,
                    eta: "35–45 minutes",
                    items: lines,
                  };
                } catch (err) {
                  return {
                    ok: false,
                    error: err instanceof Error ? err.message : "Could not reach order webhook.",
                  };
                }
              },
            }),
          },
        });

        return result.toUIMessageStreamResponse({ originalMessages: messages });
      },
    },
  },
});
