import { Flame } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/40 bg-card/30">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2 text-foreground">
            <Flame className="h-5 w-5 text-primary" />
            <span className="font-display text-xl">Forno Vero</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Neapolitan pizza, fired in a 900&deg; wood oven. Made by hand since 2014.
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-display text-base text-foreground">Visit</h4>
          <p className="mt-3 text-muted-foreground">
            128 Maple Street<br />
            Brooklyn, NY 11201
          </p>
        </div>
        <div className="text-sm">
          <h4 className="font-display text-base text-foreground">Hours</h4>
          <p className="mt-3 text-muted-foreground">
            Tue&ndash;Thu&nbsp;&nbsp;5pm&ndash;10pm<br />
            Fri&ndash;Sat&nbsp;&nbsp;5pm&ndash;11pm<br />
            Sun&nbsp;&nbsp;4pm&ndash;9pm
          </p>
        </div>
      </div>
      <div className="border-t border-border/40 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Forno Vero. All rights reserved.
      </div>
    </footer>
  );
}
