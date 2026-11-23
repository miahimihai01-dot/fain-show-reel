import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Plus, Search, ShoppingBag, User } from "lucide-react";

const items = [
  { to: "/", label: "Acasă", icon: Home },
  { to: "/cautare", label: "Căutare", icon: Search },
  { to: "/creeaza", label: "Creează", icon: Plus },
  { to: "/magazin", label: "Magazin", icon: ShoppingBag },
  { to: "/profil", label: "Profil", icon: User },
] as const;

/** Acasă stays highlighted on every top-menu section (Scurte, Filme, Animeuri, Desene, Manga). */
const homeSections = ["/filme", "/animeuri", "/desene", "/manga"];

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onHomeSection = homeSections.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  return (
    <nav
      aria-label="Meniu principal"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-nav safe-bottom"
    >
      <ul className="mx-auto grid h-16 max-w-md grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: true }}
              className={`flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold ${
                to === "/" && onHomeSection ? "text-foreground" : "text-muted-foreground"
              }`}
              activeProps={{ className: "text-foreground", "aria-current": "page" }}
            >
              {to === "/creeaza" ? (
                <span className="flex h-8 w-11 items-center justify-center rounded-lg bg-gradient-brand text-primary-foreground shadow-glow">
                  <Icon className="size-5" strokeWidth={3} />
                </span>
              ) : (
                <Icon className="size-6" strokeWidth={2.2} />
              )}
              <span>{label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
