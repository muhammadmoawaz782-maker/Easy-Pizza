import { Plus } from "lucide-react";
import type { Pizza } from "@/lib/menu";
import { useCart } from "@/lib/cart-context";
import { toast } from "sonner";

export function PizzaCard({ pizza }: { pizza: Pizza }) {
  const { add } = useCart();
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/60 transition-all duration-500 hover:border-primary/40 hover:shadow-[var(--shadow-ember)]">
      <div className="relative aspect-square overflow-hidden">
        <img
          src={pizza.image}
          alt={`${pizza.name} pizza`}
          loading="lazy"
          width={800}
          height={800}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {pizza.tags.map((t) => (
            <span
              key={t}
              className="rounded-full border border-border/60 bg-background/70 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-widest text-foreground backdrop-blur"
            >
              {t}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <p className="font-display text-sm italic text-primary">{pizza.italian}</p>
          <h3 className="mt-1 font-display text-2xl text-foreground">{pizza.name}</h3>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{pizza.description}</p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="font-display text-2xl text-foreground">Rs {pizza.price.toLocaleString("en-PK")}</span>
          <button
            onClick={() => {
              add(pizza.id);
              toast.success(`${pizza.name} added to your order`);
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
