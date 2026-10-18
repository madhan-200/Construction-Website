'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { Category, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import SimulationCommandCenter from '@/components/SimulationCommandCenter';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  FileSpreadsheet, 
  Boxes, 
  Layers, 
  Component, 
  Wrench, 
  Pipette, 
  Zap, 
  Building,
  CheckCircle,
  Gauge,
  Compass,
  RotateCw,
  Sparkles,
  ArrowUpRight,
  Filter
} from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'cement-concrete': <Boxes className="w-5 h-5 text-safety-orange" />,
  'structural-steel': <Layers className="w-5 h-5 text-safety-orange" />,
  'bricks-masonry': <Component className="w-5 h-5 text-safety-orange" />,
  'heavy-machinery': <Wrench className="w-5 h-5 text-safety-orange" />,
  'plumbing-drainage': <Pipette className="w-5 h-5 text-safety-orange" />,
  'electrical-infrastructure': <Zap className="w-5 h-5 text-safety-orange" />,
};

export default function HomePage() {
  const { locale, dict } = useApp();
  const [categories, setCategories] = useState<Category[]>(() => store.getCategories());
  const [products, setProducts] = useState<Product[]>(() => store.getProducts({ onlyApproved: true }));
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  useEffect(() => {
    const handleCategoriesUpdate = () => {
      setCategories(store.getCategories());
    };
    const handleProductsUpdate = () => {
      setProducts(store.getProducts({ onlyApproved: true }));
    };

    window.addEventListener('categories-updated', handleCategoriesUpdate);
    window.addEventListener('products-updated', handleProductsUpdate);

    return () => {
      window.removeEventListener('categories-updated', handleCategoriesUpdate);
      window.removeEventListener('products-updated', handleProductsUpdate);
    };
  }, []);

  const filteredProducts = selectedCategoryFilter === 'all' 
    ? products 
    : products.filter(p => p.categoryId === selectedCategoryFilter);

  const featured = filteredProducts.filter(p => p.isFeatured).slice(0, 8);

  const scrollToSimulations = () => {
    const el = document.getElementById('simulation-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* SECTION 1: Industrial Hero with Dynamic CAD Grid & Interactive Floating Specimen Mosaic */}
      <section className="relative border-b border-industrial-800 bg-industrial-950 bg-blueprint-grid overflow-hidden">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-safety-orange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-0 w-[550px] h-[550px] bg-industrial-800/30 rounded-full blur-3xl pointer-events-none" />

        {/* Blueprint CAD Measurement Caliper Watermark */}
        <div className="absolute top-8 right-12 text-industrial-800/40 font-mono text-[10px] select-none pointer-events-none hidden md:block">
          CAD REF // IS 1786 // IS 12269 // LAT 13.0827°N LON 80.2707°E
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          {/* Left Column: Macro-Statement & Dynamic Actions (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2.5 bg-industrial-900/90 border border-industrial-800 hover:border-safety-orange/60 rounded-full px-4 py-1.5 text-xs text-safety-orange font-mono font-semibold backdrop-blur shadow-sm transition">
              <span className="w-2 h-2 rounded-full bg-safety-orange animate-ping" />
              <ShieldCheck className="w-4 h-4 text-safety-orange" />
              <span>
                {locale === 'ta' 
                  ? 'நேரடி உற்பத்தியாளர் விநியோகம் • IS சான்றளிக்கப்பட்ட தரம்' 
                  : 'Vetted Mill Network • IS-Certified Structural Materials'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white font-display tracking-tight leading-[1.05]">
              {locale === 'ta' ? (
                <>
                  கனரக கட்டுமான <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-orange via-amber-400 to-white">
                    தளவாடங்கள் மற்றும் இயந்திரங்கள்
                  </span>
                </>
              ) : (
                <>
                  HEAVY INFRASTRUCTURE <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-safety-orange via-amber-400 to-white">
                    MATERIALS & PLANT MACHINERY
                  </span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-industrial-300 max-w-2xl leading-relaxed font-sans">
              {locale === 'ta'
                ? 'முதல் தர Fe 550D எஃகு கம்பிகள், OPC 53 சிமெண்ட், டீசல் கான்கிரீட் கலவை இயந்திரங்கள் மற்றும் மொத்த கட்டுமான தளவாடங்களை தொழிற்சாலை விலையில் நேரடியாகப் பெறுங்கள்.'
                : 'Procure primary Fe 550D TMT reinforcement steel, OPC 53 bulk cement, diesel hydraulic site mixers, and heavy drainage piping directly from vetted manufacturers with managed site freight.'}
            </p>

            {/* Kinetic Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="group inline-flex items-center gap-3 bg-safety-orange hover:bg-safety-orange-hover text-white font-black px-6 py-4 rounded-xl text-sm transition shadow-xl shadow-safety-orange/25 hover:shadow-safety-orange/40 hover:-translate-y-0.5 active:translate-y-0 font-display"
              >
                <span>{dict.home.heroActionBrowse}</span>
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition duration-300">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Link>

              <button
                onClick={scrollToSimulations}
                className="group inline-flex items-center gap-2.5 bg-industrial-900/90 hover:bg-industrial-850 border border-industrial-700 hover:border-safety-orange text-safety-orange hover:text-white font-bold px-5 py-4 rounded-xl text-sm transition hover:-translate-y-0.5 shadow-md font-mono"
              >
                <Gauge className="w-4 h-4 text-safety-orange group-hover:animate-spin" />
                <span>{locale === 'ta' ? 'தள உருவகப்படுத்துதல்' : 'Launch 3D Site Simulator'}</span>
              </button>

              <Link
                href="/quote"
                className="group inline-flex items-center gap-2 bg-industrial-950 hover:bg-industrial-900 border border-industrial-800 text-industrial-300 hover:text-white font-semibold px-5 py-4 rounded-xl text-sm transition hover:-translate-y-0.5 font-mono"
              >
                <FileSpreadsheet className="w-4 h-4 text-safety-orange" />
                <span>{dict.home.heroActionQuote}</span>
              </Link>
            </div>

            {/* Quick Spec Metrics with Live Glowing Pulse */}
            <div className="pt-6 border-t border-industrial-800/80 grid grid-cols-3 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-industrial-900/70 border border-industrial-800/80 rounded-xl backdrop-blur">
                <div className="text-white font-black text-xl num-tabular flex items-center gap-1.5 font-display">
                  <span>18,450+</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="text-industrial-400 text-[11px] mt-1">
                  {locale === 'ta' ? 'டன்கள் விநியோகம்' : 'Tonnes Dispatched'}
                </div>
              </div>

              <div className="p-3.5 bg-industrial-900/70 border border-industrial-800/80 rounded-xl backdrop-blur">
                <div className="text-white font-black text-xl num-tabular flex items-center gap-1.5 font-display">
                  <span>100%</span>
                  <span className="w-2 h-2 rounded-full bg-safety-orange animate-pulse" />
                </div>
                <div className="text-industrial-400 text-[11px] mt-1">
                  {locale === 'ta' ? 'தள சரக்கு மேலாண்மை' : 'Managed Site Freight'}
                </div>
              </div>

              <div className="p-3.5 bg-industrial-900/70 border border-industrial-800/80 rounded-xl backdrop-blur">
                <div className="text-white font-black text-xl num-tabular flex items-center gap-1.5 font-display">
                  <span>250+</span>
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                </div>
                <div className="text-industrial-400 text-[11px] mt-1">
                  {locale === 'ta' ? 'உற்பத்தியாளர்கள்' : 'Vetted Supply Mills'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Specimen Mosaic with Floating 3D Depth (5 Cols) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3.5 relative">
            {/* Column 1 */}
            <div className="space-y-3.5">
              {/* Card 1: Cement */}
              <div className="bg-industrial-900/90 border border-industrial-800 rounded-2xl p-3.5 group hover:border-safety-orange transition-all duration-300 shadow-xl hover:-translate-y-1 relative backdrop-blur overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-industrial-950/90 border border-industrial-700/80 text-[10px] text-safety-orange font-mono font-bold px-2 py-0.5 rounded backdrop-blur animate-float shadow">
                  IS 12269 TARE
                </div>
                <img
                  src="/images/products/cement-opc53.jpg"
                  alt="OPC 53 Cement Pallet"
                  className="rounded-xl aspect-4/3 object-cover w-full mb-2.5 border border-industrial-800 group-hover:scale-104 transition duration-500"
                />
                <div className="text-xs font-bold text-white flex items-center justify-between font-display">
                  <span>OPC 53 Grade Cement</span>
                  <span className="text-[11px] text-safety-orange font-mono font-bold">₹385/bag</span>
                </div>
                <div className="text-[11px] text-industrial-400 font-mono mt-0.5">IS 12269 Certified Pallet</div>
              </div>

              {/* Card 2: Bricks */}
              <div className="bg-industrial-900/90 border border-industrial-800 rounded-2xl p-3.5 group hover:border-safety-orange transition-all duration-300 shadow-xl hover:-translate-y-1 relative backdrop-blur overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-industrial-950/90 border border-industrial-700/80 text-[10px] text-emerald-400 font-mono font-bold px-2 py-0.5 rounded backdrop-blur animate-float-delayed shadow">
                  10.5 N/mm² YIELD
                </div>
                <img
                  src="/images/products/bricks-wirecut.jpg"
                  alt="Wirecut Clay Bricks Pallet"
                  className="rounded-xl aspect-4/3 object-cover w-full mb-2.5 border border-industrial-800 group-hover:scale-104 transition duration-500"
                />
                <div className="text-xs font-bold text-white flex items-center justify-between font-display">
                  <span>Wirecut Red Bricks</span>
                  <span className="text-[11px] text-safety-orange font-mono font-bold">₹11.5k/1k</span>
                </div>
                <div className="text-[11px] text-industrial-400 font-mono mt-0.5">Kiln-Fired Clay Pallet</div>
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-3.5 pt-6">
              {/* Card 3: Steel Rebar */}
              <div className="bg-industrial-900/90 border border-industrial-800 rounded-2xl p-3.5 group hover:border-safety-orange transition-all duration-300 shadow-xl hover:-translate-y-1 relative backdrop-blur overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-industrial-950/90 border border-industrial-700/80 text-[10px] text-safety-orange font-mono font-bold px-2 py-0.5 rounded backdrop-blur animate-float shadow">
                  Fe 550D SEISMIC
                </div>
                <img
                  src="/images/products/steel-tmt-12mm.jpg"
                  alt="Tata Tiscon Fe 550D TMT Rebar"
                  className="rounded-xl aspect-4/3 object-cover w-full mb-2.5 border border-industrial-800 group-hover:scale-104 transition duration-500"
                />
                <div className="text-xs font-bold text-white flex items-center justify-between font-display">
                  <span>Fe 550D TMT Rebar</span>
                  <span className="text-[11px] text-safety-orange font-mono font-bold">₹64.5k/t</span>
                </div>
                <div className="text-[11px] text-industrial-400 font-mono mt-0.5">High-Ductility Rebar Bundle</div>
              </div>

              {/* Card 4: Heavy Machinery */}
              <div className="bg-industrial-900/90 border border-industrial-800 rounded-2xl p-3.5 group hover:border-safety-orange transition-all duration-300 shadow-xl hover:-translate-y-1 relative backdrop-blur overflow-hidden">
                <div className="absolute top-4 left-4 z-10 bg-industrial-950/90 border border-industrial-700/80 text-[10px] text-amber-400 font-mono font-bold px-2 py-0.5 rounded backdrop-blur animate-float-delayed shadow">
                  10HP HYDRAULIC
                </div>
                <img
                  src="/images/products/mixer-diesel.jpg"
                  alt="500L Hydraulic Diesel Concrete Mixer"
                  className="rounded-xl aspect-4/3 object-cover w-full mb-2.5 border border-industrial-800 group-hover:scale-104 transition duration-500"
                />
                <div className="text-xs font-bold text-white flex items-center justify-between font-display">
                  <span>500L Diesel Mixer</span>
                  <span className="text-[11px] text-safety-orange font-mono font-bold">₹1.85L/unit</span>
                </div>
                <div className="text-[11px] text-industrial-400 font-mono mt-0.5">Heavy Site Batching Plant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: Interactive Construction Physics & Dispatch Center (Kinetics & Simulations) */}
      <section id="simulation-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SimulationCommandCenter />
      </section>

      {/* SECTION 3: Division Category Bento Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 border-b border-industrial-800/80 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-safety-orange" />
              {locale === 'ta' ? 'அடிப்படை பிரிவுகள்' : 'Procurement Divisions'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              {dict.nav.categories}
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-mono font-bold text-safety-orange hover:underline flex items-center gap-1 group"
          >
            <span>{locale === 'ta' ? 'அனைத்தையும் காண்க' : 'View Full Catalog'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-industrial-900/90 border border-industrial-800 hover:border-safety-orange rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-xl hover:shadow-safety-orange/10 relative overflow-hidden"
            >
              {/* Subtle CAD corner marker */}
              <div className="absolute top-1 right-1 text-industrial-700 text-[9px] font-mono select-none group-hover:text-safety-orange transition">
                +
              </div>

              <div>
                <div className="p-3 bg-industrial-950 rounded-lg w-fit mb-3 group-hover:bg-safety-orange/15 transition border border-industrial-800 group-hover:border-safety-orange/30">
                  {CATEGORY_ICONS[cat.slug] || <Boxes className="w-5 h-5 text-safety-orange" />}
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-safety-orange transition font-display">
                  {locale === 'ta' && cat.nameTa ? cat.nameTa : cat.nameEn}
                </h3>
              </div>
              <div className="mt-4 text-[11px] font-mono text-industrial-400 flex items-center justify-between">
                <span>{cat.itemCount} {locale === 'ta' ? 'பொருட்கள்' : 'SKUs'}</span>
                <ArrowUpRight className="w-3 h-3 text-industrial-600 group-hover:text-safety-orange transition" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION 4: Featured Core Materials & Machinery with Interactive Filter Pills */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4 border-b border-industrial-800/80 pb-4">
          <div>
            <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-safety-orange" />
              {dict.home.featuredTitle}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white font-display">
              {locale === 'ta' ? 'உடனடி விநியோக தளவாடங்கள்' : 'Verified Industrial Fleet & Materials'}
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {[
              { id: 'all', labelEn: 'All Stock', labelTa: 'அனைத்தும்' },
              { id: 'cat-steel', labelEn: 'Fe 550D Steel', labelTa: 'எஃகு கம்பிகள்' },
              { id: 'cat-cement', labelEn: 'Cement', labelTa: 'சிமெண்ட்' },
              { id: 'cat-machinery', labelEn: 'Machinery', labelTa: 'இயந்திரங்கள்' },
              { id: 'cat-bricks', labelEn: 'Masonry', labelTa: 'செங்கற்கள்' },
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setSelectedCategoryFilter(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold whitespace-nowrap transition ${
                  selectedCategoryFilter === pill.id
                    ? 'bg-safety-orange text-white shadow-md shadow-safety-orange/20'
                    : 'bg-industrial-900 border border-industrial-800 text-industrial-400 hover:text-white'
                }`}
              >
                {locale === 'ta' ? pill.labelTa : pill.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* SECTION 5: Enterprise Bulk Procurement Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-industrial-900 via-industrial-900/90 to-industrial-950 border border-industrial-800 rounded-2xl p-8 lg:p-12 relative overflow-hidden shadow-2xl">
          {/* Decorative CAD grid & Caution Hazard Line */}
          <div className="absolute inset-0 bg-hazard-stripes opacity-30 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-safety-orange/5 blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="bg-safety-orange text-white text-[11px] font-mono font-black px-3 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1.5 shadow">
              <Building className="w-3.5 h-3.5" />
              {locale === 'ta' ? 'திட்ட கொள்முதல் மற்றும் பெரிய அளவிலான விநியோகம்' : 'Enterprise & Infrastructure Bulk Procurement'}
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight font-display">
              {dict.home.bulkBannerTitle}
            </h2>
            <p className="text-sm sm:text-base text-industrial-300 leading-relaxed font-sans">
              {dict.home.bulkBannerSubtitle}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/quote"
                className="bg-safety-orange hover:bg-safety-orange-hover text-white font-black px-6 py-3.5 rounded-xl text-sm transition inline-flex items-center gap-2 shadow-xl shadow-safety-orange/25 font-display hover:-translate-y-0.5"
              >
                <span>{dict.home.heroActionQuote}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-xs text-industrial-300 font-mono flex items-center gap-2 bg-industrial-950/80 px-3.5 py-2 rounded-lg border border-industrial-800">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{locale === 'ta' ? '24 மணி நேர உத்தரவாத விலை மதிப்பீடு' : 'Guaranteed 24-hr turnaround with mill certificates'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: Vendor Marketplace Ecosystem */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-industrial-950 border border-industrial-800 rounded-2xl p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 relative z-10">
            <div className="text-xs font-mono font-bold text-safety-orange uppercase flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-safety-orange" />
              {locale === 'ta' ? 'விற்பனையாளர் மற்றும் உற்பத்தியாளர் கூட்டு' : 'Marketplace Supply Ecosystem'}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display">
              {dict.home.vendorBannerTitle}
            </h3>
            <p className="text-xs sm:text-sm text-industrial-400 max-w-xl font-sans">
              {dict.home.vendorBannerSubtitle}
            </p>
          </div>
          <Link
            href="/vendor/apply"
            className="shrink-0 bg-industrial-900 hover:bg-industrial-850 border border-industrial-700 hover:border-safety-orange text-white font-bold px-6 py-3.5 rounded-xl text-xs font-mono transition flex items-center gap-2.5 shadow-md hover:-translate-y-0.5"
          >
            <Building className="w-4 h-4 text-safety-orange" />
            <span>{dict.home.vendorBannerAction}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
