'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { 
  HardHat, 
  Search, 
  ShoppingCart, 
  Languages, 
  ShieldCheck, 
  FileText, 
  Store, 
  SlidersHorizontal,
  PackageCheck,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

export default function Navbar() {
  const { locale, setLocale, dict, cartCount, user, signOut } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut();
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-industrial-950/95 backdrop-blur border-b border-industrial-800">
      {/* Top Utility Belt */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-xs text-industrial-400 border-b border-industrial-900">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-safety-orange font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            {locale === 'ta' ? 'IS சான்றளிக்கப்பட்ட தளவாடங்கள்' : 'IS-Certified Industrial Standard'}
          </span>
          <span className="hidden md:inline text-industrial-600">|</span>
          <span className="hidden md:inline">
            {locale === 'ta' ? 'தளத்தால் ஒருங்கிணைக்கப்பட்ட போக்குவரத்து' : 'Platform-Coordinated Freight & Bulk Dispatch'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="flex items-center gap-1.5 bg-industrial-900 border border-industrial-800 rounded px-2 py-0.5">
            <Languages className="w-3.5 h-3.5 text-safety-orange" />
            <button
              onClick={() => setLocale('en')}
              className={`px-1.5 py-0.5 rounded transition ${locale === 'en' ? 'bg-safety-orange text-white font-bold' : 'text-industrial-400 hover:text-white'}`}
            >
              EN
            </button>
            <span className="text-industrial-700">/</span>
            <button
              onClick={() => setLocale('ta')}
              className={`px-1.5 py-0.5 rounded transition ${locale === 'ta' ? 'bg-safety-orange text-white font-bold' : 'text-industrial-400 hover:text-white'}`}
            >
              தமிழ்
            </button>
          </div>

          {user?.role === 'vendor' ? (
            <Link
              href="/vendor/dashboard"
              className="text-safety-orange hover:underline transition flex items-center gap-1 font-mono font-bold"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{dict.vendor.portalTitle}</span>
            </Link>
          ) : (
            <Link
              href="/vendor/apply"
              className="hover:text-safety-orange transition flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5" />
              <span>{dict.nav.applyToSell}</span>
            </Link>
          )}
          
          <Link
            href="/admin"
            className="hover:text-safety-orange transition flex items-center gap-1 text-industrial-300 font-medium"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>{dict.nav.adminConsole}</span>
          </Link>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Wordmark */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-10 h-10 rounded bg-safety-orange flex items-center justify-center text-white shadow-md group-hover:bg-safety-orange-hover transition">
            <HardHat className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              <span>{dict.brand.name}</span>
              <span className="text-[10px] bg-industrial-800 text-safety-orange border border-industrial-700 px-1.5 py-0.2 rounded font-mono font-bold tracking-widest uppercase">
                HEAVY
              </span>
            </div>
            <div className="text-[11px] text-industrial-400 font-medium tracking-tight">
              {locale === 'ta' ? 'தொழில்துறை கொள்முதல் சந்தை' : 'Industrial Procurement'}
            </div>
          </div>
        </Link>

        {/* Global Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-lg hidden md:block">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.common.searchPlaceholder}
              className="w-full bg-industrial-900 border border-industrial-700 rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-industrial-500 focus:outline-none focus:border-safety-orange transition"
            />
            <Search className="w-4 h-4 text-industrial-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </form>

        {/* Primary Nav Links */}
        <nav className="flex items-center gap-1.5 sm:gap-3 text-sm">
          <Link
            href="/products"
            className="px-2.5 py-1.5 rounded hover:bg-industrial-900 text-industrial-200 hover:text-white transition font-medium"
          >
            {dict.nav.allProducts}
          </Link>

          <Link
            href="/quote"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-industrial-900 border border-industrial-700 hover:border-safety-orange text-safety-orange hover:bg-industrial-850 transition font-medium"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">{dict.nav.bulkQuote}</span>
          </Link>

          <Link
            href="/orders"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded hover:bg-industrial-900 text-industrial-200 hover:text-white transition font-medium"
          >
            <PackageCheck className="w-4 h-4 text-industrial-400" />
            <span className="hidden lg:inline">{dict.nav.myOrders}</span>
          </Link>

          {/* User Account Menu / Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 bg-industrial-900 hover:bg-industrial-850 border border-industrial-700 hover:border-safety-orange text-industrial-200 hover:text-white px-2.5 py-1.5 rounded text-xs font-mono transition"
              >
                <User className="w-3.5 h-3.5 text-safety-orange" />
                <span className="hidden md:inline max-w-[100px] truncate">{user.displayName}</span>
                <span className="text-[10px] bg-industrial-800 text-safety-orange px-1 py-0.2 rounded uppercase">
                  {user.role}
                </span>
                <ChevronDown className="w-3 h-3 text-industrial-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-industrial-900 border border-industrial-800 rounded-lg shadow-2xl py-1.5 z-50 text-xs font-mono">
                  <div className="px-3 py-1.5 border-b border-industrial-800 text-industrial-400">
                    <div className="font-bold text-white truncate">{user.displayName}</div>
                    <div className="text-[10px] text-industrial-500 truncate">{user.email}</div>
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3 py-2 text-industrial-300 hover:text-white hover:bg-industrial-800 transition"
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{dict.nav.account} & Quotes</span>
                  </Link>

                  {user.role === 'vendor' && (
                    <Link
                      href="/vendor/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-industrial-300 hover:text-white hover:bg-industrial-800 transition"
                    >
                      <Store className="w-3.5 h-3.5 text-safety-orange" />
                      <span>Vendor Workspace</span>
                    </Link>
                  )}

                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3 py-2 text-industrial-300 hover:text-white hover:bg-industrial-800 transition"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-safety-orange" />
                      <span>{dict.nav.adminConsole}</span>
                    </Link>
                  )}

                  <div className="border-t border-industrial-800 mt-1 pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-industrial-800 transition text-left"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{dict.nav.signOut}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-industrial-900 text-industrial-200 hover:text-white transition font-medium text-xs font-mono"
            >
              <User className="w-3.5 h-3.5 text-industrial-400" />
              <span>{dict.nav.signIn}</span>
            </Link>
          )}

          {/* Cart Icon & Counter */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 bg-safety-orange hover:bg-safety-orange-hover text-white px-3.5 py-1.5 rounded font-semibold transition shadow-sm"
          >
            <ShoppingCart className="w-4 h-4 stroke-[2.2]" />
            <span className="hidden sm:inline text-xs">{dict.nav.cart}</span>
            {cartCount > 0 && (
              <span className="bg-industrial-950 text-white text-xs font-mono font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center">
                {cartCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
}
