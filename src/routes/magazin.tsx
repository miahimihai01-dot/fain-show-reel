import { createFileRoute } from "@tanstack/react-router";
import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/PageHeader";
import { formatLei, products } from "@/lib/content";

export const Route = createFileRoute("/magazin")({
  head: () => ({
    meta: [
      { title: "Magazin — FainShow" },
      { name: "description", content: "Tricouri, șepci, hanorace și popcorn FainShow." },
      { property: "og:title", content: "Magazin — FainShow" },
      { property: "og:description", content: "Tricouri, șepci, hanorace și popcorn FainShow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopPage,
});

function ShopPage() {
  const [cart, setCart] = useState<string[]>([]);
  const total = products.filter((p) => cart.includes(p.id)).reduce((sum, p) => sum + p.priceLei, 0);

  const toggle = (id: string) =>
    setCart((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  return (
    <div className="mx-auto min-h-screen max-w-md pb-nav">
      <PageHeader
        title="Magazin"
        right={
          <span className="relative" aria-label={`Coș: ${cart.length} produse`}>
            <ShoppingBag className="size-6" />
            {cart.length > 0 && (
              <span className="absolute -right-2 -top-2 flex size-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                {cart.length}
              </span>
            )}
          </span>
        }
      />
      <ul className="grid grid-cols-2 gap-3 px-4 pt-4">
        {products.map((p) => {
          const inCart = cart.includes(p.id);
          return (
            <li key={p.id} className="flex flex-col overflow-hidden rounded-2xl bg-card">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                decoding="async"
                width={400}
                height={400}
                className="aspect-square w-full object-cover"
              />
              <div className="flex flex-1 flex-col p-3">
                <h2 className="text-sm font-bold">{p.name}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                <p className="mt-2 font-display text-2xl text-primary">{formatLei(p.priceLei)}</p>
                <button
                  type="button"
                  onClick={() => toggle(p.id)}
                  aria-pressed={inCart}
                  className={`mt-2 flex h-9 items-center justify-center gap-1 rounded-lg text-sm font-bold ${
                    inCart ? "bg-secondary text-foreground" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {inCart ? (
                    <>
                      <Check className="size-4" /> În coș
                    </>
                  ) : (
                    "Adaugă în coș"
                  )}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      {cart.length > 0 && (
        <div className="mx-4 mt-4 flex items-center justify-between rounded-2xl bg-card p-4">
          <span className="text-sm text-muted-foreground">Total</span>
          <span className="font-display text-2xl">{formatLei(total)}</span>
        </div>
      )}
    </div>
  );
}
