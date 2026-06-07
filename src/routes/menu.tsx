import { createFileRoute } from "@tanstack/react-router";
import { PizzaCard } from "@/components/pizza-card";
import { pizzas } from "@/lib/menu";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Forno Vero" },
      { name: "description", content: "Our full menu of wood-fired Neapolitan pizzas. Order online for pickup or delivery." },
      { property: "og:title", content: "Menu — Forno Vero" },
      { property: "og:description", content: "Wood-fired Neapolitan pizzas, made to order." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Il Menu</p>
        <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl text-balance">
          Every pie, hand-stretched and fired to order.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          12-inch personal pies. Add as many as you like to your order — we'll have it ready in 20 minutes.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {pizzas.map((p) => (
          <PizzaCard key={p.id} pizza={p} />
        ))}
      </div>
    </section>
  );
}
