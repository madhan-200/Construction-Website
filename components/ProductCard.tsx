'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrency } from '@/lib/utils/format';
import { ShoppingCart, FileText, CheckCircle2, Building2, Shield, Check, ArrowUpRight, Zap, Eye } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { locale, dict, addToCart } = useApp();
  const [added, setAdded] = useState(false);
  const [showSpecs, setShowSpecs] = useState(false);

  const title = locale === 'ta' && product.titleTa ? product.titleTa : product.titleEn;
  const isPlatform = product.ownerType === 'platform';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, product.minimumOrderQuantity || 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Get primary spec highlight if available
  const specKeys = Object.keys(product.specifications || {});
  const primarySpecKey = specKeys[0] || 'Standard';
  const primarySpecVal = product.specifications?.[primarySpecKey] || 'IS Certified';

  return (
    <div 
      className="group relative bg-industrial-900/90 border border-industrial-800 rounded-xl overflow-hidden flex flex-col justify-between hover:border-safety-orange/80 transition-all duration-300 shadow-md hover:shadow-2xl hover:shadow-safety-orange/10 hover:-translate-y-1.5"
      onMouseEnter={() => setShowSpecs(true)}
      onMouseLeave={() => setShowSpecs(false)}
    >
      {/* Decorative CAD Corner Crosshairs */}
      <div className="absolute top-2 right-2 text-industrial-700 group-hover:text-safety-orange text-[10px] font-mono select-none transition pointer-events-none z-20">
        +
      </div>
      <div className="absolute bottom-2 left-2 text-industrial-700 group-hover:text-safety-orange text-[10px] font-mono select-none transition pointer-events-none z-20">
        +
      </div>

      <div>
        {/* Media Container with Dynamic Blueprint Overlay */}
        <Link href={`/products/${product.slug}`} className="block relative aspect-4/3 bg-industrial-950 overflow-hidden">
          <img
            src={product.images[0] || '/images/products/cement-opc53.jpg'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />

          {/* Blueprint subtle scanline on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-industrial-950/80 via-transparent to-transparent opacity-80" />

          {/* Origin Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
            {isPlatform ? (
              <span className="bg-industrial-950/95 border border-industrial-700/80 text-safety-orange text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur shadow">
                <Shield className="w-3 h-3 text-safety-orange" />
                {dict.product.ownerPlatform}
              </span>
            ) : (
              <span className="bg-industrial-950/95 border border-industrial-700/80 text-blue-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur shadow">
                <Building2 className="w-3 h-3 text-blue-400" />
                {dict.product.ownerVendor}
              </span>
            )}
          </div>

          {/* Floating Key Technical Standard Stamp */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="bg-industrial-900/90 border border-industrial-700/80 text-[10px] text-industrial-300 font-mono font-bold px-2 py-0.5 rounded backdrop-blur group-hover:border-safety-orange group-hover:text-safety-orange transition">
              {primarySpecVal}
            </span>
          </div>

          {/* Stock Availability Pill */}
          <div className="absolute bottom-2.5 left-2.5 z-10 flex items-center gap-1.5 bg-industrial-950/90 border border-industrial-800 text-[10px] font-mono px-2 py-0.5 rounded backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-industrial-300 font-bold">{product.availableStock} {product.unitCode}</span>
          </div>

          {/* Volume Pricing Indicator */}
          {product.bulkPricingTiers && product.bulkPricingTiers.length > 0 && (
            <div className="absolute bottom-2.5 right-2.5 z-10 bg-safety-orange text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
              {locale === 'ta' ? 'அளவு தள்ளுபடி உண்டு' : 'Volume Tiers'}
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-industrial-400">
            <span className="text-industrial-400">{product.sku}</span>
            <span className="text-safety-orange font-bold text-[10px]">
              {product.sourceStatus === 'approved' ? (locale === 'ta' ? 'சரிபார்க்கப்பட்டது' : 'VERIFIED MILL') : ''}
            </span>
          </div>

          <Link href={`/products/${product.slug}`} className="block group-hover:text-safety-orange transition">
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug font-display">
              {title}
            </h3>
          </Link>

          {/* Quick Specifications preview */}
          {specKeys.length > 1 && (
            <div className="text-[11px] font-mono text-industrial-400 line-clamp-1 border-l-2 border-safety-orange/50 pl-2 py-0.5">
              <span className="text-industrial-300">{specKeys[1]}: </span>
              <span className="text-industrial-400">{product.specifications?.[specKeys[1]]}</span>
            </div>
          )}

          {/* Pricing Row */}
          <div className="pt-2.5 border-t border-industrial-800/80 flex items-baseline justify-between">
            <div>
              <div className="text-[10px] font-mono text-industrial-400 uppercase">
                {locale === 'ta' ? 'அலகு விலை' : 'Unit Price'}
              </div>
              <div className="text-base sm:text-lg font-black text-white font-mono tracking-tight num-tabular">
                {formatCurrency(product.unitPriceMinor, product.currency, locale)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-industrial-500 uppercase font-mono">
                {dict.product.moq}
              </div>
              <div className="text-xs font-semibold text-industrial-300 font-mono">
                {product.minimumOrderQuantity} {product.unitCode}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 pt-0 grid grid-cols-2 gap-2">
        <Link
          href={`/quote?product=${encodeURIComponent(product.id)}`}
          className="flex items-center justify-center gap-1.5 bg-industrial-950 hover:bg-industrial-850 border border-industrial-800 hover:border-safety-orange text-industrial-200 hover:text-white py-2 px-2.5 rounded-lg text-xs font-mono font-bold transition"
        >
          <FileText className="w-3.5 h-3.5 text-safety-orange" />
          <span>{locale === 'ta' ? 'மதிப்பீடு' : 'Quote'}</span>
        </Link>

        <button
          onClick={handleAdd}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-mono font-bold transition shadow-md ${
            added 
              ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
              : 'bg-safety-orange hover:bg-safety-orange-hover text-white shadow-safety-orange/20 active:translate-y-0.5'
          }`}
        >
          {added ? (
            <>
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{locale === 'ta' ? 'சேர்க்கப்பட்டது' : 'Added'}</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5 stroke-[2.2]" />
              <span>{locale === 'ta' ? 'கூடை' : 'Add to Cart'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
