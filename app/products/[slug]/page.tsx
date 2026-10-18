'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { formatCurrency } from '@/lib/utils/format';
import { 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  Truck, 
  ShoppingCart, 
  FileSpreadsheet, 
  ArrowLeft, 
  Layers, 
  Check, 
  AlertCircle 
} from 'lucide-react';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { locale, dict, addToCart } = useApp();
  const product = store.getProductBySlug(resolvedParams.slug);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-safety-orange mx-auto" />
        <h1 className="text-xl font-bold text-white">Product Not Found</h1>
        <p className="text-sm text-industrial-400">The requested material listing could not be found or has been unpublished.</p>
        <Link href="/products" className="inline-flex items-center gap-2 text-safety-orange hover:underline text-sm font-semibold">
          <ArrowLeft className="w-4 h-4" /> Return to Catalog
        </Link>
      </div>
    );
  }

  const [quantity, setQuantity] = useState<number>(product.minimumOrderQuantity || 1);
  const [selectedImage, setSelectedImage] = useState<string>(product.images[0]);
  const [addedNotice, setAddedNotice] = useState(false);

  const title = locale === 'ta' && product.titleTa ? product.titleTa : product.titleEn;
  const description = locale === 'ta' && product.descriptionTa ? product.descriptionTa : product.descriptionEn;
  const isPlatform = product.ownerType === 'platform';

  // Compute unit price based on quantity tiers if applicable
  let activeUnitPrice = product.unitPriceMinor;
  if (product.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
    const sortedTiers = [...product.bulkPricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
    const applicableTier = sortedTiers.find(t => quantity >= t.minQuantity);
    if (applicableTier) {
      activeUnitPrice = applicableTier.unitPriceMinor;
    }
  }

  const totalPriceMinor = activeUnitPrice * quantity;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-mono text-industrial-400">
        <Link href="/products" className="hover:text-white flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{dict.nav.allProducts}</span>
        </Link>
        <span>/</span>
        <span className="text-industrial-500 uppercase">{product.sku}</span>
      </div>

      {/* Main Specimen Presentation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-4/3 bg-industrial-900 border border-industrial-800 rounded-lg overflow-hidden relative">
            <img
              src={selectedImage}
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* Origin Badge */}
            <div className="absolute top-3 left-3">
              {isPlatform ? (
                <span className="bg-industrial-950/90 border border-industrial-700 text-safety-orange text-xs font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 backdrop-blur">
                  <ShieldCheck className="w-4 h-4 text-safety-orange" />
                  {dict.product.ownerPlatform}
                </span>
              ) : (
                <span className="bg-industrial-950/90 border border-industrial-700 text-blue-400 text-xs font-mono font-bold px-2.5 py-1 rounded flex items-center gap-1.5 backdrop-blur">
                  <Building2 className="w-4 h-4 text-blue-400" />
                  {product.vendorName || dict.product.ownerVendor}
                </span>
              )}
            </div>
          </div>

          {/* Thumbnail list */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`w-20 h-16 rounded border overflow-hidden transition ${
                    selectedImage === img ? 'border-safety-orange ring-1 ring-safety-orange' : 'border-industrial-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Logistics Note */}
          <div className="bg-industrial-900/60 border border-industrial-800 rounded-lg p-4 flex items-start gap-3 text-xs text-industrial-300">
            <Truck className="w-5 h-5 text-safety-orange shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">{locale === 'ta' ? 'தளவாட போக்குவரத்து வழிகாட்டுதல்' : 'Platform-Managed Freight Coordination'}</div>
              <p className="mt-1 leading-relaxed text-industrial-400">
                {dict.product.shippingInfo}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Technical Details & Purchase Action */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-mono text-industrial-400 mb-2">
              <span>{dict.product.sku}: <strong className="text-white">{product.sku}</strong></span>
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {product.availableStock} {product.unitCode} {dict.product.inStock}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
              {title}
            </h1>

            <p className="mt-3 text-sm text-industrial-300 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Pricing Block */}
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4">
            <div className="flex items-baseline justify-between border-b border-industrial-800 pb-3">
              <div>
                <div className="text-xs text-industrial-400 font-mono uppercase">
                  {locale === 'ta' ? 'அலகு விலை' : 'Unit Price (Ex-Factory / Yard)'}
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-0.5">
                  {formatCurrency(activeUnitPrice, product.currency, locale)}
                  <span className="text-sm font-normal text-industrial-400 font-sans ml-1.5">
                    / {product.unitCode}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[11px] text-industrial-500 font-mono uppercase">{dict.product.moq}</div>
                <div className="text-xs font-bold text-safety-orange font-mono">
                  {product.minimumOrderQuantity} {product.unitCode}
                </div>
              </div>
            </div>

            {/* Volume Tiers if available */}
            {product.bulkPricingTiers && product.bulkPricingTiers.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-mono font-bold text-industrial-400 uppercase">
                  {dict.product.pricingTiers}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {product.bulkPricingTiers.map((tier) => (
                    <div 
                      key={tier.id} 
                      className={`p-2 rounded border text-center ${
                        quantity >= tier.minQuantity 
                          ? 'border-safety-orange bg-safety-orange/10 text-white' 
                          : 'border-industrial-800 bg-industrial-950 text-industrial-400'
                      }`}
                    >
                      <div className="text-[10px] text-industrial-400">&ge; {tier.minQuantity} {product.unitCode}</div>
                      <div className="font-bold text-white mt-0.5">{formatCurrency(tier.unitPriceMinor, tier.currency, locale)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Stepper & Add to Cart */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-industrial-950 border border-industrial-700 rounded">
                  <button
                    onClick={() => setQuantity(Math.max(product.minimumOrderQuantity, quantity - 1))}
                    className="px-3 py-2 text-industrial-300 hover:text-white font-mono font-bold text-sm"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={product.minimumOrderQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(product.minimumOrderQuantity, parseInt(e.target.value) || product.minimumOrderQuantity))}
                    className="w-16 bg-transparent text-center font-mono font-bold text-sm text-white focus:outline-none"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2 text-industrial-300 hover:text-white font-mono font-bold text-sm"
                  >
                    +
                  </button>
                </div>

                <div className="text-xs text-industrial-400 font-mono">
                  {locale === 'ta' ? 'மொத்த மதிப்பீடு' : 'Subtotal'}: <strong className="text-white font-mono text-sm">{formatCurrency(totalPriceMinor, product.currency, locale)}</strong>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleAddToCart}
                  className="bg-safety-orange hover:bg-safety-orange-hover text-white font-bold py-3 px-4 rounded text-xs transition flex items-center justify-center gap-2 shadow"
                >
                  {addedNotice ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{locale === 'ta' ? 'கூடையில் சேர்க்கப்பட்டது!' : 'Added to Cart!'}</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>{dict.product.addToCart}</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/quote?product=${encodeURIComponent(product.id)}&qty=${quantity}`}
                  className="bg-industrial-800 hover:bg-industrial-700 border border-industrial-700 text-white font-bold py-3 px-4 rounded text-xs transition flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-safety-orange" />
                  <span>{dict.product.requestQuote}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Technical Specifications Table */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider">
              {dict.product.specifications}
            </h3>
            <div className="bg-industrial-900 border border-industrial-800 rounded-lg overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody>
                  {Object.entries(product.specifications).map(([key, val], idx) => (
                    <tr key={key} className={idx % 2 === 0 ? 'bg-industrial-900/50' : 'bg-industrial-950/50'}>
                      <td className="py-2.5 px-4 font-mono text-industrial-400 border-r border-industrial-800 w-2/5">
                        {key}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-white">
                        {val}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
