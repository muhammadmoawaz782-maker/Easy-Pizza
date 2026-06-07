import { createFileRoute, Link } from "@tanstack/react-router";
import heroImg from "@/assets/hero-pizza.jpg";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Our Story — Easy Pizza" },
      { name: "description", content: "How a Brooklyn pizzaiolo built a 900° wood oven by hand and started making the city's best Neapolitan pizza." },
      { property: "og:title", content: "Our Story — Easy Pizza" },
      { property: "og:description", content: "How we make Neapolitan pizza, by hand, since 2014." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <p className="text-xs font-medium uppercase tracking-[0.3em] text-primary">Our Story</p>
      <h1 className="mt-3 font-display text-5xl text-foreground md:text-6xl text-balance">
        A wood oven, two hands, and a stubborn idea.
      </h1>

      <div className="mt-12 grid gap-10 md:grid-cols-[1.1fr_1fr]">
        <div className="space-y-5 text-lg leading-relaxed text-muted-foreground">
          <p>
            In 2014, Marco Rinaldi lugged 1,200 firebricks into a small Brooklyn storefront and built
            his oven by hand. He'd grown up watching his grandmother stretch dough in Naples, and he
            wasn't interested in shortcuts.
          </p>
          <p>
            Today, that same oven runs at 900°F from open to close. Our dough ferments for 48 hours.
            Our tomatoes come from the slopes of Mount Vesuvius. Our mozzarella is pulled the morning
            it lands on your pie.
          </p>
          <p>
            We make about 220 pizzas a night. When we sell out, we close. That's the whole thing.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border/60">
          <img
            src={heroImg}
            alt="Wood-fired pizza"
            width={1200}
            height={1200}
            loading="lazy"
            className="aspect-square w-full object-cover"
          />
        </div>
      </div>

      <div className="mt-16 rounded-3xl border border-border/60 bg-card/40 p-10 text-center">
        <h2 className="font-display text-3xl text-foreground">Come hungry.</h2>
        <p className="mt-3 text-muted-foreground">Order ahead, or just walk in. We saved a slice for you.</p>
        <Link
          to="/menu"
          className="mt-7 inline-flex rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-ember)]"
        >
          See the menu
        </Link>
      </div>
    </section>
  );
}
