import { createFileRoute } from "@tanstack/react-router";

const WEBHOOK_URL =
  "https://maxo.app.n8n.cloud/webhook/58004ac5-d674-4526-bb13-17a06469bffd";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

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
          return new Response(
            JSON.stringify({ ok: res.ok, status: res.status, response: text }),
            {
              status: res.ok ? 200 : 502,
              headers: { "Content-Type": "application/json", ...CORS },
            }
          );
        } catch (err) {
          return new Response(
            JSON.stringify({ ok: false, error: (err as Error).message }),
            {
              status: 500,
              headers: { "Content-Type": "application/json", ...CORS },
            }
          );
        }
      },
    },
  },
});
