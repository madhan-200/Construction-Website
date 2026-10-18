'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale } from '@/lib/types';
import { getDictionary } from '@/lib/i18n';
import { store, CartItem } from '@/lib/db/store';

interface AppContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  dict: ReturnType<typeof getDictionary>;
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: any, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [cart, setCartState] = useState<CartItem[]>([]);

  useEffect(() => {
    // Load initial locale from store
    const currentLoc = store.getLocale();
    setLocaleState(currentLoc);
    setCartState(store.getCart());

    const handleLocaleUpdate = () => {
      setLocaleState(store.getLocale());
    };

    const handleCartUpdate = () => {
      setCartState(store.getCart());
    };

    window.addEventListener('locale-updated', handleLocaleUpdate);
    window.addEventListener('cart-updated', handleCartUpdate);

    return () => {
      window.removeEventListener('locale-updated', handleLocaleUpdate);
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const setLocale = (loc: Locale) => {
    store.setLocale(loc);
    setLocaleState(loc);
  };

  const addToCart = (product: any, quantity: number) => {
    const updated = store.addToCart(product, quantity);
    setCartState(updated);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const updated = store.updateCartQuantity(productId, quantity);
    setCartState(updated);
  };

  const clearCart = () => {
    store.clearCart();
    setCartState([]);
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const dict = getDictionary(locale);

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        dict,
        cart,
        cartCount,
        addToCart,
        updateCartQuantity,
        clearCart,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
