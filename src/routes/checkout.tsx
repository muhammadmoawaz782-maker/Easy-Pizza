import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, Loader2 } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { findPizza } from "@/lib/menu";
import { toast } from "sonner";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Forno Vero" },
      { name: "description", content: "Complete your pizza order." },
    ],
  }),
  component: CheckoutPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(80),
  phone: z.string().trim().min(7, "Valid phone required").max(20),
  email: z.string().trim().email("Valid email required").max(160),
  fulfillment: z.enum(["pickup", "delivery"]),
  address: z.string().trim().max(200).optional(),
  notes: z.string().trim().max(300).optional(),
});

const DELIVERY_FEE = 200;
const WEBHOOK_URL = "/api/place-order";

const fmt = (n: number) =>
  `Rs ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

function CheckoutPage() {
  const { items, clear } = useCart();
  const navigate = useNavigate();
  const [fulfillment, setFulfillment] = useState<"pickup" | "delivery">("pickup");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState<{ id: string; eta: string } | null>(null);

  const lines = items
    .map((i) => {
      const pizza = findPizza(i.id);
      if (!pizza) return null;
      return { ...i, pizza, lineTotal: pizza.price * i.qty };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const delivery = fulfillment === "delivery" ? DELIVERY_FEE : 0;
  const total = subtotal + delivery;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const data = {
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      fulfillment,
      address: form.get("address") ? String(form.get("address")) : undefined,
      notes: form.get("notes") ? String(form.get("notes")) : undefined,
    };
    const parsed = schema.safeParse(data);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string") fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the highlighted fields");
      return;
    }
    if (fulfillment === "delivery" && (!parsed.data.address || parsed.data.address.length < 5)) {
      setErrors({ address: "Delivery address required" });
      return;
    }
    setErrors({});

    const orderId = "FV-" + Math.random().toString(36).slice(2, 7).toUpperCase();

    setSubmitting(true);
    try {
      const payload = {
        "Order ID": orderId,
        "Name": parsed.data.name,
        "Address": parsed.data.address ?? "",
        "Email": parsed.data.email,
        "Phone": parsed.data.phone,
        "Subtotal": subtotal,
        "Delivery Fee": delivery,
        "Grand Total": total,
        "Time": new Date().toLocaleString("en-PK", {
          timeZone: "Asia/Karachi",
          dateStyle: "medium",
          timeStyle: "short",
        }),
        "Note": parsed.data.notes ?? "",
      };

      const res = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string }
        | null;

      if (!res.ok || !result?.ok) {
        throw new Error(result?.message ?? `Webhook responded ${res.status}`);
      }

      setPlaced({
        id: orderId,
        eta: fulfillment === "pickup" ? "20 minutes" : "35–45 minutes",
      });
      clear();
    } catch (err) {
      console.error("Order webhook failed", err);
      toast.error(err instanceof Error ? err.message : "Could not place order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (placed) {
    return (
      <section className="mx-auto max-w-xl px-6 py-32 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-8 font-display text-5xl text-foreground">Order in the oven</h1>
        <p className="mt-4 text-muted-foreground">
          Confirmation <span className="font-mono text-foreground">{placed.id}</span> — ready in about{" "}
          <span className="text-foreground">{placed.eta}</span>.
        </p>
        <div className="mt-10 flex justify-center gap-3">
          <Link
            to="/menu"
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
          >
            Order more
          </Link>
          <button
            onClick={() => navigate({ to: "/" })}
            className="rounded-full border border-border bg-card/60 px-6 py-3 text-sm font-semibold text-foreground"
          >
            Home
          </button>
        </div>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-xl px-6 py-32 text-center">
        <h1 className="font-display text-4xl text-foreground">Nothing to check out</h1>
        <p className="mt-3 text-muted-foreground">Add some pizzas first.</p>
        <Link to="/menu" className="mt-8 inline-flex rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
          See the menu
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-5xl text-foreground">Checkout</h1>
      <p className="mt-2 text-muted-foreground">Just a few details and we'll fire it up.</p>

      <form onSubmit={onSubmit} className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8 rounded-2xl border border-border/60 bg-card/40 p-7">
          <Fieldset legend="Your details">
            <Input name="name" label="Full name" error={errors.name} />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input name="phone" label="Phone" type="tel" error={errors.phone} />
              <Input name="email" label="Email" type="email" error={errors.email} />
            </div>
          </Fieldset>

          <Fieldset legend="How would you like it?">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["pickup", "delivery"] as const).map((opt) => (
                <label
                  key={opt}
                  className={`cursor-pointer rounded-xl border p-4 transition-colors ${
                    fulfillment === opt
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background/40 hover:border-border/80"
                  }`}
                >
                  <input
                    type="radio"
                    name="fulfillment"
                    value={opt}
                    checked={fulfillment === opt}
                    onChange={() => setFulfillment(opt)}
                    className="sr-only"
                  />
                  <div className="font-display text-lg capitalize text-foreground">{opt}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {opt === "pickup" ? "Ready in ~20 min · No fee" : `35–45 min · ${fmt(DELIVERY_FEE)} delivery`}
                  </div>
                </label>
              ))}
            </div>
            {fulfillment === "delivery" && (
              <Input name="address" label="Delivery address" error={errors.address} />
            )}
          </Fieldset>

          <Fieldset legend="Anything we should know?">
            <textarea
              name="notes"
              rows={3}
              maxLength={300}
              placeholder="Allergies, gate codes, slicing preferences..."
              className="w-full rounded-xl border border-border bg-background/60 p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary"
            />
          </Fieldset>
        </div>

        <aside className="h-fit rounded-2xl border border-border/60 bg-card/60 p-7">
          <h2 className="font-display text-2xl text-foreground">Order summary</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {lines.map(({ pizza, qty, lineTotal }) => (
              <li key={pizza.id} className="flex justify-between text-muted-foreground">
                <span>
                  <span className="text-foreground">{qty}×</span> {pizza.name}
                </span>
                <span>{fmt(lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-border/60 pt-5 text-sm">
            <Row label="Subtotal" value={fmt(subtotal)} />
            {fulfillment === "delivery" && <Row label="Delivery Fee" value={fmt(delivery)} />}
          </dl>
          <div className="mt-4 flex justify-between border-t border-border/60 pt-4">
            <span className="font-display text-lg text-foreground">Grand Total</span>
            <span className="font-display text-lg text-foreground">{fmt(total)}</span>
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-ember)] transition-all hover:brightness-110 active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Placing order…" : `Place order · ${fmt(total)}`}
          </button>
          <p className="mt-3 text-center text-xs text-muted-foreground">You'll pay on pickup or delivery.</p>
        </aside>
      </form>
    </section>
  );
}

function Fieldset({ legend, children }: { legend: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="font-display text-lg text-foreground">{legend}</legend>
      {children}
    </fieldset>
  );
}

function Input({
  name,
  label,
  type = "text",
  error,
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <input
        name={name}
        type={type}
        maxLength={200}
        className={`w-full rounded-xl border bg-background/60 px-3.5 py-2.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary ${
          error ? "border-destructive" : "border-border"
        }`}
      />
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-muted-foreground">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
