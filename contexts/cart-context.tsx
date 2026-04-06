  "use client";

  import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

  export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
  }

  interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isCartOpen: boolean;
    setIsCartOpen: (open: boolean) => void;
  }

  const CART_STORAGE_KEY = "tuniolive-cart";

  function loadCartFromStorage(): CartItem[] {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch { }
    return [];
  }

  function saveCartToStorage(items: CartItem[]) {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch { }
  }

  const CartContext = createContext<CartContextType | undefined>(undefined);

  export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const initialized = useRef(false);

    useEffect(() => {
      if (!initialized.current) {
        const stored = loadCartFromStorage();
        if (stored.length > 0) {
          setItems(stored);
        }
        initialized.current = true;
      }
    }, []);

    useEffect(() => {
      if (initialized.current) {
        saveCartToStorage(items);
      }
    }, [items]);

    const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity: number = 1) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.id === item.id);
        if (existing) {
          return prev.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
      setIsCartOpen(true);
    }, []);

    const removeItem = useCallback((id: string) => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, []);

    const updateQuantity = useCallback((id: string, quantity: number) => {
      if (quantity <= 0) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        return;
      }
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, quantity } : i))
      );
    }, []);

    const clearCart = useCallback(() => {
      setItems([]);
    }, []);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    return (
      <CartContext.Provider
        value={ {
          items,
          addItem,
          removeItem,
          updateQuantity,
          clearCart,
          totalItems,
          totalPrice,
          isCartOpen,
          setIsCartOpen,
        } }
      >
        { children }
      </CartContext.Provider>
    );
  }

  export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
      throw new Error("useCart must be used within a CartProvider");
    }
    return context;
  }
