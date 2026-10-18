'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { Category, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import MaterialSimulator from '@/components/MaterialSimulator';
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
  CheckCircle
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

  const featured = products.filter(p => p.isFeatured);

  return (
    <div className="space-y-16">
      {/* Industrial Hero: Specimen Mosaic */}
      <section className="border-b border-industrial-800 bg-industrial-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Two-line Statement & Action */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-industrial-900 border border-industrial-800 rounded px-3 py-1 text-xs text-safety-orange font-mono font-semibold">
              <ShieldCheck className="w-4 h-4 text-safety-orange" />
              <span>{locale === 'ta' ? 'அங்கீகரிக்கப்பட்ட கட்டுமான சந்தை' : 'Direct Manufacturer & Verified Vendor Supply'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
              {dict.home.heroTitle}
            </h1>

            <p className="text-base sm:text-lg text-industrial-300 max-w-2xl leading-relaxed">
              {dict.home.heroSubtitle}
            </p>

            {/* Actions */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-safety-orange hover:bg-safety-orange-hover text-white font-bold px-6 py-3.5 rounded text-sm transition shadow-lg"
              >
                <span>{dict.home.heroActionBrowse}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/quote"
                className="inline-flex items-center gap-2 bg-industrial-900 hover:bg-industrial-850 border border-industrial-700 hover:border-safety-orange text-industrial-200 hover:text-white font-bold px-6 py-3.5 rounded text-sm transition"
              >
                <FileSpreadsheet className="w-4 h-4 text-safety-orange" />
                <span>{dict.home.heroActionQuote}</span>
              </Link>
            </div>

            {/* Quick Spec Metrics */}
            <div className="pt-6 border-t border-industrial-900 grid grid-cols-3 gap-4 text-xs font-mono">
              <div>
                <div className="text-white font-bold text-base num-tabular">12,000+</div>
                <div className="text-industrial-500">{locale === 'ta' ? 'டன்கள் விநியோகம்' : 'Tonnes Dispatched'}</div>
              </div>
              <div>
                <div className="text-white font-bold text-base num-tabular">100%</div>
                <div className="text-industrial-500">{locale === 'ta' ? 'தள மேலாண்மை' : 'Managed Freight'}</div>
              </div>
              <div>
                <div className="text-white font-bold text-base num-tabular">250+</div>
                <div className="text-industrial-500">{locale === 'ta' ? 'உற்பத்தியாளர்கள்' : 'Vetted Suppliers'}</div>
              </div>
            </div>
          </div>

          {/* Right Column: Specimen Mosaic */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-3 relative">
            <div className="space-y-3">
              <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-3 group hover:border-safety-orange transition">
                <img
                  src="/images/products/cement-opc53.jpg"
                  alt="OPC 53 Cement Pallet"
                  className="rounded aspect-4/3 object-cover w-full mb-2 border border-industrial-800"
                />
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>OPC 53 Grade Cement</span>
                  <span className="text-[10px] text-safety-orange font-mono">₹385/bag</span>
                </div>
                <div className="text-[11px] text-industrial-400 font-mono">IS 12269 Certified Pallet</div>
              </div>

              <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-3 group hover:border-safety-orange transition">
                <img
                  src="/images/products/bricks-wirecut.jpg"
                  alt="Wirecut Clay Bricks Pallet"
                  className="rounded aspect-4/3 object-cover w-full mb-2 border border-industrial-800"
                />
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Wirecut Red Bricks</span>
                  <span className="text-[10px] text-safety-orange font-mono">₹11.5k/1k</span>
                </div>
                <div className="text-[11px] text-industrial-400 font-mono">10.5 N/mm² IS 1077 Pallet</div>
              </div>
            </div>

            <div className="space-y-3 pt-6">
              <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-3 group hover:border-safety-orange transition">
                <img
                  src="/images/products/steel-tmt-12mm.jpg"
                  alt="Tata Tiscon Fe 550D TMT Rebar"
                  className="rounded aspect-4/3 object-cover w-full mb-2 border border-industrial-800"
                />
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Fe 550D TMT Rebar</span>
                  <span className="text-[10px] text-safety-orange font-mono">₹64.5k/t</span>
                </div>
                <div className="text-[11px] text-industrial-400 font-mono">Seismic High-Ductility Rebar</div>
              </div>

              <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-3 group hover:border-safety-orange transition">
                <img
                  src="/images/products/mixer-diesel.jpg"
                  alt="500L Hydraulic Diesel Concrete Mixer"
                  className="rounded aspect-4/3 object-cover w-full mb-2 border border-industrial-800"
                />
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>500L Hydraulic Mixer</span>
                  <span className="text-[10px] text-safety-orange font-mono">₹1.85L/unit</span>
                </div>
                <div className="text-[11px] text-industrial-400 font-mono">Site-Ready Diesel Hopper</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
              {locale === 'ta' ? 'அடிப்படை பிரிவுகள்' : 'Procurement Divisions'}
            </div>
            <h2 className="text-2xl font-black text-white">
              {dict.nav.categories}
            </h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-safety-orange hover:underline flex items-center gap-1"
          >
            <span>{locale === 'ta' ? 'அனைத்தையும் காண்க' : 'View Full Catalog'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`}
              className="group bg-industrial-900 border border-industrial-800 hover:border-safety-orange rounded-lg p-4 flex flex-col justify-between transition hover:-translate-y-0.5"
            >
              <div>
                <div className="p-2.5 bg-industrial-950 rounded w-fit mb-3 group-hover:bg-safety-orange/10 transition">
                  {CATEGORY_ICONS[cat.slug] || <Boxes className="w-5 h-5 text-safety-orange" />}
                </div>
                <h3 className="font-bold text-sm text-white group-hover:text-safety-orange transition">
                  {locale === 'ta' && cat.nameTa ? cat.nameTa : cat.nameEn}
                </h3>
              </div>
              <div className="mt-4 text-[11px] font-mono text-industrial-400">
                {cat.itemCount} {locale === 'ta' ? 'பொருட்கள்' : 'SKUs'}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Industrial Materials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
              {dict.home.featuredTitle}
            </div>
            <h2 className="text-2xl font-black text-white">
              {locale === 'ta' ? 'உடனடி விநியோக பொருட்கள்' : 'Verified Core Materials'}
            </h2>
          </div>
          <span className="text-xs text-industrial-400 hidden sm:inline">
            {dict.home.featuredSubtitle}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Interactive Engineering & Freight Simulators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <MaterialSimulator />
      </section>

      {/* Bulk Procurement Callout Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-industrial-900 border border-industrial-800 rounded-xl p-8 lg:p-12 relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-4">
            <span className="bg-safety-orange text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              {locale === 'ta' ? 'திட்ட கொள்முதல்' : 'Enterprise & Infra Supply'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {dict.home.bulkBannerTitle}
            </h2>
            <p className="text-sm sm:text-base text-industrial-300 leading-relaxed">
              {dict.home.bulkBannerSubtitle}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/quote"
                className="bg-safety-orange hover:bg-safety-orange-hover text-white font-bold px-6 py-3 rounded text-sm transition inline-flex items-center gap-2 shadow"
              >
                <span>{dict.home.heroActionQuote}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <div className="text-xs text-industrial-400 font-mono flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{locale === 'ta' ? '24 மணி நேர மதிப்பீடு' : 'Guaranteed 24-hr turnaround'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vendor Marketplace Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-industrial-950 border border-industrial-800 rounded-xl p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-safety-orange uppercase">
              {locale === 'ta' ? 'விற்பனையாளர் கூட்டு' : 'Marketplace Ecosystem'}
            </div>
            <h3 className="text-xl font-bold text-white">
              {dict.home.vendorBannerTitle}
            </h3>
            <p className="text-xs sm:text-sm text-industrial-400 max-w-xl">
              {dict.home.vendorBannerSubtitle}
            </p>
          </div>
          <Link
            href="/vendor/apply"
            className="shrink-0 bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 text-white font-bold px-5 py-3 rounded text-xs transition flex items-center gap-2"
          >
            <Building className="w-4 h-4 text-safety-orange" />
            <span>{dict.home.vendorBannerAction}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
