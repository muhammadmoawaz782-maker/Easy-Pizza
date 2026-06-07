import { Link } from "@tanstack/react-router";
import { ShoppingBag, Flame } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2 text-foreground">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-display text-xl tracking-wide">Forno&nbsp;Vero</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          <Link to="/" activeOptions={{ exact: true }} className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground">
            Home
          </Link>
          <Link to="/menu" className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground">
            Menu
          </Link>
          <Link to="/about" className="text-muted-foreground transition-colors hover:text-foreground [&.active]:text-foreground">
            Our Story
          </Link>
        </nav>

        <Link
          to="/cart"
          className="relative inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-card"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Cart</span>
          {count > 0 && (
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
              {count}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
