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
  /**
   * The handwritten card that goes with *this* basket. Two of the same basket
   * with different messages are two lines, not one — see `giftLineId`.
   */
  giftMessage?: string;
};

/**
 * Line id for a product, made distinct by its card message so the same basket
 * bought for two people stays two separate lines with two separate cards.
 */
export function giftLineId(base: string, giftMessage?: string): string {
  const message = giftMessage?.trim();
  if (!message) return base;
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    hash = (hash * 31 + message.charCodeAt(i)) | 0;
  }
  return `${base}:g${(hash >>> 0).toString(36)}`;
}

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotalCents: number;
  isOpen: boolean;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, quantity: number) => void;
  updateGiftMessage: (id: string, giftMessage: string) => void;
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

  /** Editing a card message re-keys the line so it stays unique. */
  const updateGiftMessage = useCallback((id: string, giftMessage: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const line = prev[idx];
      const base = line.id.split(":g")[0];
      const nextId = line.isCustom ? line.id : giftLineId(base, giftMessage);
      const next = [...prev];
      next[idx] = { ...line, id: nextId, giftMessage: giftMessage.trim() || undefined };
      // If an identical line already exists, fold them together.
      const twin = next.findIndex((p, i) => i !== idx && p.id === nextId);
      if (twin > -1) {
        next[twin] = {
          ...next[twin],
          quantity: Math.min(next[twin].quantity + next[idx].quantity, next[twin].maxQty ?? 99),
        };
        next.splice(idx, 1);
      }
      return next;
    });
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
    updateGiftMessage,
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
