import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Product } from "./products";

export type CartLine = { product: Product; qty: number };

type CartCtx = {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "namnguyen_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch {}
    }
  }, [lines, hydrated]);

  const value = useMemo<CartCtx>(() => ({
    lines,
    add: (product, qty = 1) =>
      setLines((prev) => {
        const i = prev.findIndex((l) => l.product.id === product.id);
        if (i >= 0) {
          const next = [...prev];
          next[i] = { ...next[i], qty: next[i].qty + qty };
          return next;
        }
        return [...prev, { product, qty }];
      }),
    remove: (id) => setLines((prev) => prev.filter((l) => l.product.id !== id)),
    setQty: (id, qty) =>
      setLines((prev) =>
        prev.map((l) => (l.product.id === id ? { ...l, qty: Math.max(1, qty) } : l)),
      ),
    clear: () => setLines([]),
    count: lines.reduce((s, l) => s + l.qty, 0),
    subtotal: lines.reduce((s, l) => s + l.qty * l.product.price, 0),
  }), [lines]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}