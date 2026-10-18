'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { HardHat, ShieldCheck, Truck, Scale, FileText } from 'lucide-react';

export default function Footer() {
  const { locale, dict } = useApp();

  return (
    <footer className="bg-industrial-950 border-t border-industrial-800 text-industrial-400 text-sm mt-20">
      {/* Heavy Trust Metrics Bar */}
      <div className="border-b border-industrial-800 bg-industrial-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-industrial-800 rounded text-safety-orange">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base">
                {locale === 'ta' ? 'IS-சான்றளிக்கப்பட்ட பொருட்கள்' : 'Certified Structural Grade'}
              </div>
              <div className="text-xs text-industrial-400 mt-1">
                {locale === 'ta' 
                  ? 'அனைத்து பொருட்களும் ஆய்வக பரிசோதனை சான்றிதழ்களுடன் வழங்கப்படுகின்றன.' 
                  : 'Every lot verified with mill test certificates conforming to IS 12269 & IS 1786.'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-industrial-800 rounded text-safety-orange">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base">
                {locale === 'ta' ? 'தளவாட போக்குவரத்து ஒருங்கிணைப்பு' : 'Platform-Managed Freight'}
              </div>
              <div className="text-xs text-industrial-400 mt-1">
                {locale === 'ta'
                  ? 'கட்டுமான தளத்திற்கே நேரடியாக கனரக லாரிகள் மற்றும் கிரேன்கள் மூலம் இறக்குதல்.'
                  : 'End-to-end multi-axle freight dispatch direct to site access coordinates.'}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-industrial-800 rounded text-safety-orange">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-base">
                {locale === 'ta' ? 'மொத்த கொள்முதல் உத்தரவாதம்' : 'Volume Project Quotations'}
              </div>
              <div className="text-xs text-industrial-400 mt-1">
                {locale === 'ta'
                  ? 'உள்கட்டமைப்பு மற்றும் பல அடுக்கு திட்டங்களுக்கான நிலையான ஒப்பந்த விலைகள்.'
                  : 'Transparent tier-based pricing for civil contractors, builders, and developers.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-5 gap-8">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-safety-orange rounded flex items-center justify-center text-white">
              <HardHat className="w-4 h-4" />
            </div>
            <span className="text-lg font-black text-white">{dict.brand.name}</span>
          </div>
          <p className="text-xs text-industrial-400 max-w-sm leading-relaxed mb-4">
            {dict.brand.subtagline}
          </p>
          <div className="text-xs text-industrial-500 font-mono">
            {locale === 'ta' 
              ? 'பதிவுசெய்யப்பட்ட தளம் | சர்வதேச கட்டுமானம்' 
              : 'Enterprise Platform | Antigravity Engine Build'}
          </div>
        </div>

        <div>
          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
            {locale === 'ta' ? 'பொருட்கள்' : 'Catalog'}
          </div>
          <ul className="space-y-2 text-xs">
            <li><Link href="/products?category=cement-concrete" className="hover:text-safety-orange transition">Cement & Concrete</Link></li>
            <li><Link href="/products?category=structural-steel" className="hover:text-safety-orange transition">Structural Steel & TMT</Link></li>
            <li><Link href="/products?category=bricks-masonry" className="hover:text-safety-orange transition">Bricks & Aggregates</Link></li>
            <li><Link href="/products?category=heavy-machinery" className="hover:text-safety-orange transition">Plant Machinery</Link></li>
            <li><Link href="/products?category=plumbing-drainage" className="hover:text-safety-orange transition">Plumbing & Drainage</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
            {locale === 'ta' ? 'செயல்பாடுகள்' : 'Operations'}
          </div>
          <ul className="space-y-2 text-xs">
            <li><Link href="/quote" className="hover:text-safety-orange transition">{dict.nav.bulkQuote}</Link></li>
            <li><Link href="/orders" className="hover:text-safety-orange transition">{dict.nav.myOrders}</Link></li>
            <li><Link href="/vendor/apply" className="hover:text-safety-orange transition">{dict.nav.applyToSell}</Link></li>
            <li><Link href="/admin" className="hover:text-safety-orange transition">{dict.nav.adminConsole}</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs font-mono font-bold text-white uppercase tracking-wider mb-3">
            {locale === 'ta' ? 'கொள்கைகள்' : 'Governance'}
          </div>
          <ul className="space-y-2 text-xs">
            <li className="text-industrial-400">Payment Deferred Mode (PRD §3)</li>
            <li className="text-industrial-400">Platform-Managed Shipping</li>
            <li className="text-industrial-400">Bilingual Locale (EN / TA)</li>
            <li className="text-industrial-400">Supabase RLS Enabled</li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-industrial-800/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-industrial-500">
          <div>
            &copy; 2026 {dict.brand.name}. {locale === 'ta' ? 'அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.' : 'All rights reserved. Global construction marketplace specification.'}
          </div>
          <div className="flex items-center gap-4">
            <span>Brand Identity: TBD</span>
            <span>&bull;</span>
            <span>Testing Mode: Staged Orders</span>
            <span>&bull;</span>
            <span>Locale: {locale.toUpperCase()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
