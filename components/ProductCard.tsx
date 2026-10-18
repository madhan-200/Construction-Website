'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/lib/types';
import { useApp } from '@/lib/context/AppContext';
import { formatCurrency } from '@/lib/utils/format';
import { ShoppingCart, FileText, CheckCircle2, Building2, Shield, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { locale, dict, addToCart } = useApp();
  const [added, setAdded] = useState(false);

  const title = locale === 'ta' && product.titleTa ? product.titleTa : product.titleEn;
  const isPlatform = product.ownerType === 'platform';

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, product.minimumOrderQuantity || 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group bg-industrial-900 border border-industrial-800 rounded-lg overflow-hidden flex flex-col justify-between hover:border-industrial-600 transition shadow-sm hover:shadow-md">
      <div>
        {/* Media Container */}
        <Link href={`/products/${product.slug}`} className="block relative aspect-4/3 bg-industrial-950 overflow-hidden">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />

          {/* Origin Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            {isPlatform ? (
              <span className="bg-industrial-950/90 border border-industrial-700 text-safety-orange text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur">
                <Shield className="w-3 h-3 text-safety-orange" />
                {dict.product.ownerPlatform}
              </span>
            ) : (
              <span className="bg-industrial-950/90 border border-industrial-700 text-blue-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 backdrop-blur">
                <Building2 className="w-3 h-3 text-blue-400" />
                {dict.product.ownerVendor}
              </span>
            )}
          </div>

          {/* MOQ / Tier pill */}
          {product.bulkPricingTiers && product.bulkPricingTiers.length > 0 && (
            <div className="absolute bottom-2.5 right-2.5 bg-safety-orange text-white text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow">
              {locale === 'ta' ? 'அளவு தள்ளுபடி உண்டு' : 'Volume Tiers'}
            </div>
          )}
        </Link>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-industrial-400 mb-1.5">
            <span>{product.sku}</span>
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              {product.availableStock} {product.unitCode}
            </span>
          </div>

          <Link href={`/products/${product.slug}`} className="block group-hover:text-safety-orange transition">
            <h3 className="text-sm font-bold text-white line-clamp-2 leading-snug mb-2">
              {title}
            </h3>
          </Link>

          {/* Pricing Row */}
          <div className="mt-3 pt-3 border-t border-industrial-800 flex items-baseline justify-between">
            <div>
              <div className="text-xs text-industrial-400">
                {locale === 'ta' ? 'அலகு விலை' : 'Unit Price'}
              </div>
              <div className="text-lg font-black text-white font-mono tracking-tight">
                {formatCurrency(product.unitPriceMinor, product.currency, locale)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-industrial-500 uppercase font-mono">
                {dict.product.moq}
              </div>
              <div className="text-xs font-semibold text-industrial-300">
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
          className="flex items-center justify-center gap-1 bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 text-industrial-200 hover:text-white py-2 px-2.5 rounded text-xs font-semibold transition"
        >
          <FileText className="w-3.5 h-3.5 text-safety-orange" />
          <span>{locale === 'ta' ? 'விலைப்பட்டியல்' : 'Quote'}</span>
        </Link>

        <button
          onClick={handleAdd}
          className={`flex items-center justify-center gap-1 py-2 px-2.5 rounded text-xs font-bold transition ${
            added 
              ? 'bg-emerald-600 text-white' 
              : 'bg-safety-orange hover:bg-safety-orange-hover text-white'
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
