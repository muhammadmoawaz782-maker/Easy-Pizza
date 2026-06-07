import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { findPizza } from "@/lib/menu";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Order — Forno Vero" },
      { name: "description", content: "Review your pizza order before checkout." },
    ],
  }),
  component: CartPage,
});

const DELIVERY_FEE = 200;

const fmt = (n: number) => `Rs ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

function CartPage() {
  const { items, setQty, remove } = useCart();

  const lines = items
    .map((i) => {
      const pizza = findPizza(i.id);
      if (!pizza) return null;
      return { ...i, pizza, lineTotal: pizza.price * i.qty };
    })
    .filter((l): l is NonNullable<typeof l> => l !== null);

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const total = subtotal > 0 ? subtotal + DELIVERY_FEE : 0;

  if (lines.length === 0) {
    return (
      <section className="mx-auto flex max-w-2xl flex-col items-center px-6 py-32 text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full border border-border bg-card">
          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="mt-8 font-display text-4xl text-foreground">Your oven is empty</h1>
        <p className="mt-3 text-muted-foreground">Browse the menu and add a few pies to get started.</p>
        <Link
          to="/menu"
          className="mt-8 inline-flex rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground"
        >
          See the menu
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h1 className="font-display text-5xl text-foreground">Your order</h1>
      <p className="mt-2 text-muted-foreground">Review, adjust, then send it to the kitchen.</p>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
          {lines.map(({ pizza, qty, lineTotal }) => (
            <li key={pizza.id} className="flex gap-5 p-5">
              <img
                src={pizza.image}
                alt={pizza.name}
                width={120}
                height={120}
                loading="lazy"
                className="h-24 w-24 flex-none rounded-xl object-cover"
              />
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-display text-xs italic text-primary">{pizza.italian}</p>
                    <h3 className="font-display text-xl text-foreground">{pizza.name}</h3>
                  </div>
                  <p className="font-display text-lg text-foreground">{fmt(lineTotal)}</p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center gap-1 rounded-full border border-border bg-background/60 p-1">
                    <button
                      onClick={() => setQty(pizza.id, qty - 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-card"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                    <button
                      onClick={() => setQty(pizza.id, qty + 1)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground hover:bg-card"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(pizza.id)}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>

        <aside className="h-fit rounded-2xl border border-border/60 bg-card/60 p-7">
          <h2 className="font-display text-2xl text-foreground">Summary</h2>
          <dl className="mt-6 space-y-3 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <dt>Subtotal</dt><dd>${subtotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Delivery</dt><dd>${DELIVERY_FEE.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <dt>Tax</dt><dd>${tax.toFixed(2)}</dd>
            </div>
            <div className="mt-4 flex justify-between border-t border-border/60 pt-4 text-foreground">
              <dt className="font-display text-lg">Total</dt>
              <dd className="font-display text-lg">${total.toFixed(2)}</dd>
            </div>
          </dl>
          <Link
            to="/checkout"
            className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-ember)] transition-all hover:brightness-110 active:scale-95"
          >
            Checkout
          </Link>
          <Link
            to="/menu"
            className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Add more pizzas
          </Link>
        </aside>
      </div>
    </section>
  );
}
