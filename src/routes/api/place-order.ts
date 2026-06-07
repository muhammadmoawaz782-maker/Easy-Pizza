import { createFileRoute } from "@tanstack/react-router";

const WEBHOOK_URL =
  "https://maxo.app.n8n.cloud/webhook-test/58004ac5-d674-4526-bb13-17a06469bffd";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

export const Route = createFileRoute("/api/place-order")({
  server: {
    handlers: {
      OPTIONS: async () =>
        new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        try {
          const body = await request.text();
          const res = await fetch(WEBHOOK_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body,
          });
          const text = await res.text();

          if (!res.ok) {
            return json({
              ok: false,
              status: res.status,
              message:
                res.status === 404
                  ? "The n8n production webhook is not active. Please activate the workflow in n8n and try again."
                  : "The order webhook rejected the request. Please try again.",
              response: text,
            });
          }

          return json({ ok: true, status: res.status, response: text });
        } catch (err) {
          return json({
            ok: false,
            message: "Could not reach the order webhook. Please try again.",
            error: err instanceof Error ? err.message : String(err),
          });
        }
      },
    },
  },
});
