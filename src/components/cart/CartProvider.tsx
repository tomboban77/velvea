"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartItem = {
  id: string; // unique line id
  productId?: string;
  slug?: string;
  name: string;
  variantId?: string;
  variantLabel?: string;
  image?: string;
  unitPriceCents: number;
  quantity: number;
  isCustom?: boolean;
  customConfig?: unknown;
  maxQty?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "velvea_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // hydrate once
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  // persist
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, hydrated]);

  const addItem = useCallback<CartContextValue["addItem"]>((item) => {
    setItems((prev) => {
      const qty = item.quantity ?? 1;
      // custom baskets are always their own line
      if (!item.isCustom) {
        const idx = prev.findIndex((p) => p.id === item.id);
        if (idx > -1) {
          const next = [...prev];
          const max = next[idx].maxQty ?? 99;
          next[idx] = {
            ...next[idx],
            quantity: Math.min(next[idx].quantity + qty, max),
          };
          return next;
        }
      }
      return [...prev, { ...item, quantity: qty }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const updateQty = useCallback((id: string, quantity: number) => {
    setItems((prev) =>
      prev
        .map((p) =>
          p.id === id
            ? { ...p, quantity: Math.max(0, Math.min(quantity, p.maxQty ?? 99)) }
            : p
        )
        .filter((p) => p.quantity > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const { count, subtotalCents } = useMemo(() => {
    return items.reduce(
      (acc, it) => {
        acc.count += it.quantity;
        acc.subtotalCents += it.quantity * it.unitPriceCents;
        return acc;
      },
      { count: 0, subtotalCents: 0 }
    );
  }, [items]);

  const value: CartContextValue = {
    items,
    count,
    subtotalCents,
    isOpen,
    hydrated,
    addItem,
    removeItem,
    updateQty,
    clear,
    openCart,
    closeCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
