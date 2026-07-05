import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "kodebase_cart_v1";
export const MAX_CART_ITEMS = 10;

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((productId) => {
    setItems((prev) =>
      prev.includes(productId) || prev.length >= MAX_CART_ITEMS ? prev : [...prev, productId]
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((prev) => prev.filter((id) => id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const inCart = useCallback((productId) => items.includes(productId), [items]);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  return (
    <CartContext.Provider value={{ items, count: items.length, addItem, removeItem, clearCart, inCart, isOpen, openCart, closeCart, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}