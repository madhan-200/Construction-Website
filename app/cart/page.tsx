'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { formatCurrency } from '@/lib/utils/format';
import { 
  ShoppingCart, 
  Trash2, 
  ShieldCheck, 
  Building2, 
  AlertTriangle, 
  ArrowRight, 
  FileSpreadsheet, 
  CheckCircle2,
  PackageCheck
} from 'lucide-react';

export default function CartPage() {
  const { locale, dict, cart, updateCartQuantity, clearCart, user } = useApp();
  const router = useRouter();
  const [recipientName, setRecipientName] = useState(user?.displayName || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  // Recalculate trusted totals from catalog items
  const subtotalMinor = cart.reduce((sum, item) => {
    // Check volume tier
    let unitPrice = item.product.unitPriceMinor;
    if (item.product.bulkPricingTiers && item.product.bulkPricingTiers.length > 0) {
      const sortedTiers = [...item.product.bulkPricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
      const tier = sortedTiers.find(t => item.quantity >= t.minQuantity);
      if (tier) unitPrice = tier.unitPriceMinor;
    }
    return sum + (unitPrice * item.quantity);
  }, 0);

  // Estimated freight (platform managed)
  const estimatedFreightMinor = subtotalMinor > 0 ? 450000 : 0; // 4,500.00 INR
  const grandTotalMinor = subtotalMinor + estimatedFreightMinor;

  const handleCheckoutStaged = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsPlacing(true);

    const orderItems = cart.map((item) => {
      let unitPrice = item.product.unitPriceMinor;
      if (item.product.bulkPricingTiers && item.product.bulkPricingTiers.length > 0) {
        const sortedTiers = [...item.product.bulkPricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        const tier = sortedTiers.find(t => item.quantity >= t.minQuantity);
        if (tier) unitPrice = tier.unitPriceMinor;
      }
      return {
        id: `oi-${Date.now()}-${item.product.id}`,
        productId: item.product.id,
        vendorId: item.product.vendorId,
        productTitle: item.product.titleEn,
        sku: item.product.sku,
        unitCode: item.product.unitCode,
        quantity: item.quantity,
        unitPriceMinor: unitPrice,
        lineSubtotalMinor: unitPrice * item.quantity,
        currency: item.product.currency,
        fulfillmentStatus: 'pending' as const,
      };
    });

    const newOrder = store.createOrder({
      customerId: user?.id || 'c0000000-0000-4000-8000-000000000001',
      customerName: recipientName || user?.displayName || 'Customer Requisition',
      status: 'confirmed',
      currency: 'INR',
      subtotalMinor,
      shippingTotalMinor: estimatedFreightMinor,
      taxTotalMinor: Math.round(subtotalMinor * 0.18),
      grandTotalMinor,
      shippingAddress: {
        recipientName,
        addressLine1: deliveryAddress,
        city: 'Chennai',
        state: 'Tamil Nadu',
        postalCode: '600001',
        country: 'India',
      },
      items: orderItems,
    });

    clearCart();
    router.push('/orders');
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center space-y-4">
        <ShoppingCart className="w-12 h-12 text-industrial-600 mx-auto" />
        <h1 className="text-2xl font-bold text-white">{dict.cart.empty}</h1>
        <p className="text-xs text-industrial-400 max-w-sm mx-auto">
          Explore our heavy catalog of certified structural cement, TMT rebars, bricks, and plant tools.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 bg-safety-orange hover:bg-safety-orange-hover text-white text-xs font-bold py-2.5 px-5 rounded transition"
        >
          <span>{dict.cart.continueBrowsing}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-industrial-800 pb-4 flex items-center justify-between">
        <div>
          <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
            {locale === 'ta' ? 'கொள்முதல் கூடை' : 'Procurement Requisition'}
          </div>
          <h1 className="text-2xl font-black text-white">
            {dict.cart.title}
          </h1>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-industrial-400 hover:text-red-400 font-mono flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{dict.cart.clearCart}</span>
        </button>
      </div>

      {/* PRD Non-Goal Compliance Alert */}
      <div className="bg-amber-950/60 border border-amber-600/70 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200 space-y-1">
          <div className="font-bold text-white uppercase tracking-wider">
            {locale === 'ta' ? 'அறிவிப்பு: சோதனை முறை' : 'PRD Phase 0 Compliance: Deferred Payment Mode'}
          </div>
          <p className="leading-relaxed">
            {dict.cart.checkoutTestNotice}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Line Items */}
        <div className="lg:col-span-8 space-y-4">
          {cart.map(({ product, quantity }) => {
            const isPlatform = product.ownerType === 'platform';
            let unitPrice = product.unitPriceMinor;
            if (product.bulkPricingTiers && product.bulkPricingTiers.length > 0) {
              const sortedTiers = [...product.bulkPricingTiers].sort((a, b) => b.minQuantity - a.minQuantity);
              const tier = sortedTiers.find(t => quantity >= t.minQuantity);
              if (tier) unitPrice = tier.unitPriceMinor;
            }
            const lineTotal = unitPrice * quantity;

            return (
              <div
                key={product.id}
                className="bg-industrial-900 border border-industrial-800 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={product.images[0]}
                    alt={product.titleEn}
                    className="w-20 h-16 rounded object-cover bg-industrial-950 border border-industrial-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono text-industrial-400">{product.sku}</span>
                      {isPlatform ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-industrial-950 text-safety-orange border border-industrial-800">
                          Platform
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-industrial-950 text-blue-400 border border-industrial-800">
                          Vendor
                        </span>
                      )}
                    </div>
                    <Link href={`/products/${product.slug}`} className="text-sm font-bold text-white hover:text-safety-orange transition">
                      {locale === 'ta' && product.titleTa ? product.titleTa : product.titleEn}
                    </Link>
                    <div className="text-xs text-industrial-400 font-mono mt-0.5">
                      {formatCurrency(unitPrice, product.currency, locale)} / {product.unitCode}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {/* Quantity Stepper */}
                  <div className="flex items-center bg-industrial-950 border border-industrial-800 rounded">
                    <button
                      onClick={() => updateCartQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-industrial-400 hover:text-white font-mono text-xs"
                    >
                      -
                    </button>
                    <span className="px-3 py-1 font-mono font-bold text-xs text-white">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateCartQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-industrial-400 hover:text-white font-mono text-xs"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right min-w-24">
                    <div className="text-xs font-mono font-bold text-white">
                      {formatCurrency(lineTotal, product.currency, locale)}
                    </div>
                    <button
                      onClick={() => updateCartQuantity(product.id, 0)}
                      className="text-[11px] text-red-400 hover:underline mt-0.5"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Summary & Staged Placement */}
        <div className="lg:col-span-4 space-y-6">
          <form onSubmit={handleCheckoutStaged} className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4">
            <h2 className="text-sm font-bold text-white border-b border-industrial-800 pb-2">
              {locale === 'ta' ? 'ஆர்டர் சுருக்கம்' : 'Order Commercial Snapshot'}
            </h2>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-industrial-300">
                <span>{dict.cart.subtotal}:</span>
                <span className="font-bold text-white">{formatCurrency(subtotalMinor, 'INR', locale)}</span>
              </div>
              <div className="flex items-center justify-between text-industrial-300">
                <span>Platform Freight (Managed):</span>
                <span className="font-bold text-white">{formatCurrency(estimatedFreightMinor, 'INR', locale)}</span>
              </div>
              <div className="flex items-center justify-between text-industrial-300">
                <span>Est. Statutory GST (18%):</span>
                <span className="font-bold text-white">{formatCurrency(Math.round(subtotalMinor * 0.18), 'INR', locale)}</span>
              </div>

              <div className="pt-2 border-t border-industrial-800 flex items-center justify-between text-sm">
                <span className="text-white font-bold">Total Staged Order:</span>
                <span className="text-base font-black text-safety-orange">
                  {formatCurrency(grandTotalMinor + Math.round(subtotalMinor * 0.18), 'INR', locale)}
                </span>
              </div>
            </div>

            {/* Delivery Recipient Input */}
            <div className="space-y-3 pt-2 border-t border-industrial-800 text-xs">
              <div>
                <label className="block font-mono text-industrial-400 mb-1">Authorized Site In-Charge</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Site Engineer / Receiving Lead"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="block font-mono text-industrial-400 mb-1">Site Delivery Coordinates</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Gate No., Job Site Location, Landmark, Unloading Instructions"
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPlacing}
              className="w-full bg-safety-orange hover:bg-safety-orange-hover text-white font-bold py-3 px-4 rounded text-xs transition flex items-center justify-center gap-2 shadow"
            >
              <PackageCheck className="w-4 h-4" />
              <span>{dict.cart.proceedToStagedCheckout}</span>
            </button>
          </form>

          {/* Bulk Quote Cross-sell */}
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-4 space-y-2 text-xs">
            <div className="font-bold text-white flex items-center gap-1.5">
              <FileSpreadsheet className="w-4 h-4 text-safety-orange" />
              <span>Need special credit or negotiated terms?</span>
            </div>
            <p className="text-industrial-400 leading-relaxed">
              For volume orders exceeding ₹500,000, submit a formal project quote request for customized mill rates.
            </p>
            <Link href="/quote" className="text-safety-orange font-bold hover:underline inline-block mt-1">
              Submit Bulk Project Quote &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
