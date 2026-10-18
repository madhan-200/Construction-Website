'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { QuoteRequestItem } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Building, 
  ShieldCheck, 
  ArrowRight,
  Send
} from 'lucide-react';

function QuoteContent() {
  const { locale, dict } = useApp();
  const searchParams = useSearchParams();
  const preselectedProductId = searchParams.get('product');
  const preselectedQty = parseInt(searchParams.get('qty') || '0', 10);

  const products = store.getProducts({ onlyApproved: true });
  const [quoteHistory, setQuoteHistory] = useState(() => store.getQuoteRequests());
  const [isSuccess, setIsSuccess] = useState(false);
  const [newRefCode, setNewRefCode] = useState('');

  // Form State
  const [requesterName, setRequesterName] = useState('Karthik Subramanian');
  const [requesterEmail, setRequesterEmail] = useState('procurement@chennaimetrobldrs.com');
  const [requesterPhone, setRequesterPhone] = useState('+91 94440 12890');
  const [companyName, setCompanyName] = useState('Chennai Metro Builders & Civil Infra Ltd');
  const [addressLine1, setAddressLine1] = useState('Tower 4 Construction Site, OMR IT Expressway');
  const [city, setCity] = useState('Navalur, Chennai');
  const [state, setState] = useState('Tamil Nadu');
  const [postalCode, setPostalCode] = useState('603103');
  const [requiredByDate, setRequiredByDate] = useState('2026-11-15');
  const [projectNotes, setProjectNotes] = useState('Requires boom placer access and 40-tonne articulated truck unloading zone.');

  // Multi-line items
  const [items, setItems] = useState<QuoteRequestItem[]>(() => {
    if (preselectedProductId) {
      const p = products.find(x => x.id === preselectedProductId);
      if (p) {
        return [{
          id: `item-${Date.now()}`,
          productId: p.id,
          productTitle: p.titleEn,
          productSku: p.sku,
          unitCode: p.unitCode,
          requestedQuantity: preselectedQty > 0 ? preselectedQty : p.minimumOrderQuantity * 2,
          targetPriceMinor: p.unitPriceMinor,
        }];
      }
    }
    const defaultProd = products[0];
    return [{
      id: `item-${Date.now()}`,
      productId: defaultProd.id,
      productTitle: defaultProd.titleEn,
      productSku: defaultProd.sku,
      unitCode: defaultProd.unitCode,
      requestedQuantity: defaultProd.minimumOrderQuantity * 5,
      targetPriceMinor: defaultProd.unitPriceMinor,
    }];
  });

  const handleAddItem = () => {
    const prod = products[0];
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${items.length}`,
        productId: prod.id,
        productTitle: prod.titleEn,
        productSku: prod.sku,
        unitCode: prod.unitCode,
        requestedQuantity: prod.minimumOrderQuantity * 2,
        targetPriceMinor: prod.unitPriceMinor,
      },
    ]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== idx));
    }
  };

  const handleProductChange = (idx: number, prodId: string) => {
    const p = products.find(x => x.id === prodId);
    if (!p) return;
    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      productId: p.id,
      productTitle: p.titleEn,
      productSku: p.sku,
      unitCode: p.unitCode,
      requestedQuantity: p.minimumOrderQuantity,
      targetPriceMinor: p.unitPriceMinor,
    };
    setItems(updated);
  };

  const handleQtyChange = (idx: number, qty: number) => {
    const updated = [...items];
    updated[idx].requestedQuantity = Math.max(1, qty);
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = store.submitQuoteRequest({
      requesterUserId: 'user-buyer-active',
      requesterName,
      requesterEmail,
      requesterPhone,
      companyName,
      currency: 'INR',
      destinationAddress: {
        addressLine1,
        city,
        state,
        postalCode,
        country: 'India',
        siteContactPhone: requesterPhone,
      },
      requiredByDate,
      projectNotes,
      items,
    });

    setNewRefCode(created.referenceCode);
    setIsSuccess(true);
    setQuoteHistory(store.getQuoteRequests());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Title */}
      <div className="border-b border-industrial-800 pb-6">
        <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
          {locale === 'ta' ? 'திட்ட கொள்முதல் கோரிக்கை' : 'Institutional & Project Supply'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {dict.quote.title}
        </h1>
        <p className="text-xs sm:text-sm text-industrial-300 mt-1.5 max-w-2xl leading-relaxed">
          {dict.quote.subtitle}
        </p>
      </div>

      {/* Success Notification */}
      {isSuccess && (
        <div className="bg-emerald-950/80 border border-emerald-600 rounded-lg p-6 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="font-bold text-white text-base">
                {dict.quote.quoteSubmitted}!
              </div>
              <div className="text-xs text-emerald-200 mt-0.5">
                Reference Code: <strong className="font-mono text-white text-sm">{newRefCode}</strong>.
                Our industrial logistics desk will coordinate mill pricing and update your estimate in under 24 hours.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left: Quote Creation Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-8">
          {/* Section 1: Material Line Items */}
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-industrial-800 pb-3">
              <div className="font-bold text-white text-sm flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-safety-orange" />
                <span>1. {locale === 'ta' ? 'கோரப்படும் பொருட்கள் மற்றும் அளவு' : 'Requested Material Specifications & Quantities'}</span>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs font-bold text-safety-orange hover:text-safety-orange-hover flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{dict.quote.addLineItem}</span>
              </button>
            </div>

            <div className="space-y-4">
              {items.map((line, idx) => (
                <div key={line.id} className="bg-industrial-950 border border-industrial-800 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-industrial-400 font-bold">
                      Item #{idx + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-industrial-500 hover:text-red-400 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <label className="block text-[11px] font-mono text-industrial-400 mb-1">
                        Select Material
                      </label>
                      <select
                        value={line.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className="w-full bg-industrial-900 border border-industrial-700 text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-safety-orange"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.sku} &bull; {p.titleEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-[11px] font-mono text-industrial-400 mb-1">
                        Quantity ({line.unitCode})
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={line.requestedQuantity}
                        onChange={(e) => handleQtyChange(idx, parseInt(e.target.value) || 1)}
                        className="w-full bg-industrial-900 border border-industrial-700 text-white rounded px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-safety-orange"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-mono text-industrial-400 mb-1">
                        Unit
                      </label>
                      <input
                        type="text"
                        disabled
                        value={line.unitCode}
                        className="w-full bg-industrial-950 border border-industrial-800 text-industrial-500 rounded px-2.5 py-2 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Job Site & Contact Details */}
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-6 space-y-4">
            <div className="font-bold text-white text-sm border-b border-industrial-800 pb-3 flex items-center gap-2">
              <Building className="w-4 h-4 text-safety-orange" />
              <span>2. {locale === 'ta' ? 'விநியோக தளம் மற்றும் தொடர்பு' : 'Job Site Coordinates & Site Engineer Contact'}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-mono text-industrial-400 mb-1">Requester Full Name</label>
                <input
                  type="text"
                  required
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="block font-mono text-industrial-400 mb-1">Company / Developer Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="block font-mono text-industrial-400 mb-1">Corporate Procurement Email</label>
                <input
                  type="email"
                  required
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="block font-mono text-industrial-400 mb-1">Site Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={requesterPhone}
                  onChange={(e) => setRequesterPhone(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-industrial-400 mb-1">{dict.quote.projectLocation}</label>
                <input
                  type="text"
                  required
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="Plot / Survey No., Street, Landmark"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="block font-mono text-industrial-400 mb-1">City / Hub</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="block font-mono text-industrial-400 mb-1">Required Dispatch Date</label>
                <input
                  type="date"
                  required
                  value={requiredByDate}
                  onChange={(e) => setRequiredByDate(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white font-mono focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-mono text-industrial-400 mb-1">{dict.quote.additionalNotes}</label>
                <textarea
                  rows={3}
                  value={projectNotes}
                  onChange={(e) => setProjectNotes(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange text-xs"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-safety-orange hover:bg-safety-orange-hover text-white font-bold py-3.5 px-6 rounded text-sm transition flex items-center justify-center gap-2 shadow-lg"
              >
                <Send className="w-4 h-4" />
                <span>{dict.quote.submitQuote}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Right: Existing Quotations & Workflow Guide */}
        <div className="lg:col-span-4 space-y-6">
          {/* Process Guide */}
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-3">
            <div className="text-xs font-mono font-bold text-safety-orange uppercase">
              {locale === 'ta' ? 'செயல்முறை' : 'Bulk Quote SLA'}
            </div>
            <div className="space-y-3 text-xs text-industrial-300">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-safety-orange/20 text-safety-orange flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                  1
                </div>
                <div>Request logged & reference code created.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-safety-orange/20 text-safety-orange flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                  2
                </div>
                <div>Platform procurement negotiates volume tier discount with mills & vendors.</div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-safety-orange/20 text-safety-orange flex items-center justify-center shrink-0 font-mono font-bold text-[10px]">
                  3
                </div>
                <div>Official estimate issued with price guarantee for 14 calendar days.</div>
              </div>
            </div>
          </div>

          {/* Active Quotes History */}
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4">
            <div className="font-bold text-white text-sm border-b border-industrial-800 pb-2">
              {locale === 'ta' ? 'முந்தைய மேற்கோள்கள்' : 'My Active Quotations'}
            </div>

            <div className="space-y-3">
              {quoteHistory.map((q) => (
                <div key={q.id} className="bg-industrial-950 border border-industrial-800 rounded p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-safety-orange">{q.referenceCode}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-industrial-800 text-industrial-300 uppercase">
                      {q.status}
                    </span>
                  </div>
                  <div className="text-industrial-400">
                    {q.items.length} items &bull; {formatDate(q.submittedAt, locale)}
                  </div>
                  {q.quotedSubtotalMinor ? (
                    <div className="pt-1 border-t border-industrial-800 flex items-center justify-between">
                      <span className="text-industrial-400 font-mono">Quoted Amount:</span>
                      <strong className="text-white font-mono">{formatCurrency(q.quotedSubtotalMinor, q.currency, locale)}</strong>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{dict.quote.statusSubmitted}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-industrial-400">Loading quote workspace...</div>}>
      <QuoteContent />
    </Suspense>
  );
}
