import { Link } from "@tanstack/react-router";

const tabs = [
  { to: "/", label: "Scurte" },
  { to: "/filme", label: "Filme" },
  { to: "/animeuri", label: "Animeuri" },
  { to: "/desene", label: "Desene" },
  { to: "/manga", label: "Manga" },
] as const;

/** Top section menu: Scurte | Filme | Animeuri | Desene | Manga. */
export function TopTabs({ overlay = false }: { overlay?: boolean }) {
  return (
    <nav aria-label="Secțiuni">
      <ul className="flex items-center justify-between gap-1 px-2">
        {tabs.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              activeOptions={{ exact: to === "/" }}
              className={`relative block px-2 py-2 text-[15px] font-bold transition-colors ${
                overlay ? "text-foreground/70 text-shadow-soft" : "text-muted-foreground"
              }`}
              activeProps={{
                className:
                  "!text-foreground after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:rounded-full after:bg-primary",
                "aria-current": "page",
              }}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
