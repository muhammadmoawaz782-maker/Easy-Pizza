import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-pizza.jpg";
import { PizzaCard } from "@/components/pizza-card";
import { pizzas } from "@/lib/menu";
import { Flame, Clock, Leaf } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Forno Vero — Wood-Fired Neapolitan Pizza in Brooklyn" },
      { name: "description", content: "Hand-stretched Neapolitan pizza, fired in a 900° wood oven. Order online for pickup or delivery in Brooklyn." },
      { property: "og:title", content: "Forno Vero — Wood-Fired Neapolitan Pizza" },
      { property: "og:description", content: "Hand-stretched Neapolitan pizza, fired in a 900° wood oven." },
    ],
  }),
  component: Index,
});

function Index() {
  const featured = pizzas.slice(0, 3);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImg}
            alt="Wood-fired margherita pizza"
            width={1600}
            height={1200}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[88vh] max-w-7xl items-center gap-8 px-6 py-24">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.3em] text-primary">
              <Flame className="h-3.5 w-3.5" /> Forno Vero · Brooklyn
            </p>
            <h1 className="mt-6 font-display text-6xl leading-[0.95] text-foreground text-balance sm:text-7xl md:text-8xl">
              Fired at <span className="italic text-primary">900°</span>,<br />
              served in <span className="italic">90 seconds</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Neapolitan dough, fermented 48 hours. San Marzano tomatoes. Buffalo mozzarella from the
              source. Pulled hot from a hand-built wood oven — to your door, or your table.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/menu"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-ember)] transition-all hover:brightness-110 active:scale-95"
              >
                Order online
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-7 py-3.5 text-sm font-semibold text-foreground backdrop-blur transition-colors hover:bg-card"
              >
                Our story
              </Link>
            </div>

            <dl className="mt-14 grid max-w-lg grid-cols-3 gap-6 border-t border-border/60 pt-8">
              {[
                { icon: Flame, label: "Wood-fired", value: "900°F" },
                { icon: Clock, label: "Bake time", value: "90 sec" },
                { icon: Leaf, label: "Dough proof", value: "48 hr" },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}>
                  <Icon className="h-4 w-4 text-primary" />
                  <dt className="mt-2 text-xs uppercase tracking-widest text-muted-foreground">{label}</dt>
                  <dd className="font-display text-2xl text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Le Pizze</p>
            <h2 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              From the oven
            </h2>
          </div>
          <Link
            to="/menu"
            className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          >
            View full menu →
          </Link>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <PizzaCard key={p.id} pizza={p} />
          ))}
        </div>
      </section>

      {/* CTA strip */}
      <section className="mx-auto max-w-7xl px-6">
        <div className="rounded-3xl border border-border/60 bg-gradient-to-br from-secondary/40 to-card p-10 md:p-16">
          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="font-display text-3xl text-foreground md:text-4xl text-balance">
                Hungry now? We bake until the last guest leaves.
              </h3>
              <p className="mt-3 max-w-xl text-muted-foreground">
                Pickup in 20 minutes. Delivery within 3 miles. No app required — order right from this page.
              </p>
            </div>
            <Link
              to="/menu"
              className="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-ember)] transition-all hover:brightness-110 active:scale-95"
            >
              Start your order
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
