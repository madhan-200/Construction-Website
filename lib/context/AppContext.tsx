'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Locale, UserProfile, UserRole } from '@/lib/types';
import { getDictionary } from '@/lib/i18n';
import { store, CartItem } from '@/lib/db/store';
import { auth } from '@/lib/auth';

interface AppContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  dict: ReturnType<typeof getDictionary>;
  cart: CartItem[];
  cartCount: number;
  addToCart: (product: any, quantity: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  user: UserProfile | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signUp: (data: { email: string; password: string; displayName: string; role: UserRole; companyName?: string; phone?: string }) => Promise<{ success: boolean; user?: UserProfile; error?: string }>;
  signOut: () => Promise<void>;
  switchDemoRole: (role: UserRole) => UserProfile;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [cart, setCartState] = useState<CartItem[]>([]);
  const [user, setUserState] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Load initial values from store & auth
    const currentLoc = store.getLocale();
    setLocaleState(currentLoc);
    setCartState(store.getCart());
    setUserState(auth.getCurrentUser());

    const handleLocaleUpdate = () => {
      setLocaleState(store.getLocale());
    };

    const handleCartUpdate = () => {
      setCartState(store.getCart());
    };

    const handleAuthUpdate = () => {
      setUserState(auth.getCurrentUser());
    };

    window.addEventListener('locale-updated', handleLocaleUpdate);
    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('auth-updated', handleAuthUpdate);

    return () => {
      window.removeEventListener('locale-updated', handleLocaleUpdate);
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('auth-updated', handleAuthUpdate);
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

  const signIn = async (email: string, password: string) => {
    const res = await auth.signIn(email, password);
    if (res.success && res.user) {
      setUserState(res.user);
    }
    return res;
  };

  const signUp = async (data: {
    email: string;
    password: string;
    displayName: string;
    role: UserRole;
    companyName?: string;
    phone?: string;
  }) => {
    const res = await auth.signUp(data);
    if (res.success && res.user) {
      setUserState(res.user);
    }
    return res;
  };

  const signOut = async () => {
    await auth.signOut();
    setUserState(null);
  };

  const switchDemoRole = (role: UserRole) => {
    const updated = auth.switchDemoRole(role);
    setUserState(updated);
    return updated;
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
        user,
        signIn,
        signUp,
        signOut,
        switchDemoRole,
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

export const useAuth = useApp;
