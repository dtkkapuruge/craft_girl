'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variant?: string; // Optional variant (e.g., color, size)
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (id: string, variant?: string) => void;
  updateQuantity: (id: string, variant: string | undefined, newQuantity: number) => void;
  clearCart: () => void;
  toggleCart: (isOpen?: boolean) => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('craft_girly_cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error('Failed to load cart from local storage:', error);
    }
    setIsLoaded(true);
  }, []);

  // Save to local storage when cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('craft_girly_cart', JSON.stringify(cartItems));
      } catch (error) {
        console.error('Failed to save cart to local storage:', error);
      }
    }
  }, [cartItems, isLoaded]);

  const addToCart = (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    setCartItems((prev) => {
      const existingItemIndex = prev.findIndex(
        (i) => i.id === item.id && i.variant === item.variant
      );

      if (existingItemIndex >= 0) {
        // Increment quantity if it already exists
        const newCart = [...prev];
        newCart[existingItemIndex].quantity += item.quantity || 1;
        return newCart;
      } else {
        // Add new item
        return [...prev, { ...item, quantity: item.quantity || 1 }];
      }
    });
    // Open cart automatically when adding
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string, variant?: string) => {
    setCartItems((prev) => prev.filter((i) => !(i.id === id && i.variant === variant)));
  };

  const updateQuantity = (id: string, variant: string | undefined, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(id, variant);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) =>
        i.id === id && i.variant === variant ? { ...i, quantity: newQuantity } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = (isOpen?: boolean) => {
    setIsCartOpen((prev) => (isOpen !== undefined ? isOpen : !prev));
  };

  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        toggleCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
