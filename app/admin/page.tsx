'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { 
  SlidersHorizontal, 
  Users, 
  Package, 
  FileSpreadsheet, 
  Truck, 
  Percent, 
  History, 
  Check, 
  X, 
  Clock, 
  ShieldCheck, 
  AlertCircle,
  Plus
} from 'lucide-react';

export default function AdminPage() {
  const { locale, dict } = useApp();

  const [activeTab, setActiveTab] = useState<'vendors' | 'products' | 'quotes' | 'orders' | 'commission' | 'audit'>('vendors');

  // Local state mirrored from store
  const [vendors, setVendors] = useState(() => store.getVendorApplications());
  const [products, setProducts] = useState(() => store.getProducts({ onlyApproved: false }));
  const [quotes, setQuotes] = useState(() => store.getQuoteRequests());
  const [orders, setOrders] = useState(() => store.getOrders());
  const [commissionRules, setCommissionRules] = useState(() => store.getCommissionRules());
  const [auditEvents, setAuditEvents] = useState(() => store.getAuditEvents());

  // Form helper for issuing quote
  const [quoteAmounts, setQuoteAmounts] = useState<Record<string, { subtotal: number; freight: number }>>({});
  // Form helper for order shipment
  const [shipmentTracking, setShipmentTracking] = useState<Record<string, { carrier: string; trackingNo: string }>>({});
  // Commission edit state
  const [commissionPercent, setCommissionPercent] = useState<number>(commissionRules[0]?.ratePercent || 8.5);
  const [commissionBasis, setCommissionBasis] = useState<any>(commissionRules[0]?.calculationBasis || 'subtotal');
  const [commSavedNotice, setCommSavedNotice] = useState(false);

  // Vendor Action Handlers
  const handleVendorAction = (id: string, status: 'approved' | 'rejected') => {
    store.updateVendorApplicationStatus(id, status, `Audited by Admin Lead at ${new Date().toLocaleTimeString()}`);
    setVendors(store.getVendorApplications());
    setAuditEvents(store.getAuditEvents());
  };

  // Product Action Handlers
  const handleProductAction = (id: string, status: 'approved' | 'rejected') => {
    store.updateProductStatus(id, status, `Moderated by Catalog Admin at ${new Date().toLocaleTimeString()}`);
    setProducts(store.getProducts({ onlyApproved: false }));
    setAuditEvents(store.getAuditEvents());
  };

  // Quote Action Handlers
  const handleIssueQuote = (id: string) => {
    const values = quoteAmounts[id] || { subtotal: 9500000, freight: 350000 };
    store.updateQuoteStatus(id, 'quoted', {
      quotedSubtotalMinor: values.subtotal,
      deliveryFeeMinor: values.freight,
    });
    setQuotes(store.getQuoteRequests());
    setAuditEvents(store.getAuditEvents());
  };

  // Order Shipment Handler
  const handleShipOrder = (id: string) => {
    const values = shipmentTracking[id] || { carrier: 'TN Heavy Haul Logistics', trackingNo: `TNHL-${Math.floor(1000 + Math.random() * 9000)}` };
    store.updateOrderStatus(id, 'processing', values);
    setOrders(store.getOrders());
    setAuditEvents(store.getAuditEvents());
  };

  // Commission Update Handler
  const handleSaveCommission = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateCommissionRule(commissionPercent, commissionBasis);
    setCommissionRules(store.getCommissionRules());
    setAuditEvents(store.getAuditEvents());
    setCommSavedNotice(true);
    setTimeout(() => setCommSavedNotice(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Console Header */}
      <div className="border-b border-industrial-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
            {locale === 'ta' ? 'நிர்வாக மற்றும் நடுவர் தளம்' : 'Privileged Platform Console'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {dict.admin.consoleTitle}
          </h1>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-industrial-900 border border-industrial-800 px-3 py-1.5 rounded">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-industrial-300">Admin Mode Active &bull; Least-Privilege Enforced</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-industrial-800 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('vendors')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'vendors' 
              ? 'bg-industrial-800 text-white border-b-2 border-safety-orange' 
              : 'text-industrial-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4 text-safety-orange" />
          <span>Vendor Applications ({vendors.filter(v => v.status === 'under_review' || v.status === 'submitted').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'products' 
              ? 'bg-industrial-800 text-white border-b-2 border-safety-orange' 
              : 'text-industrial-400 hover:text-white'
          }`}
        >
          <Package className="w-4 h-4 text-safety-orange" />
          <span>Product Moderation ({products.filter(p => p.sourceStatus === 'pending_review').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'quotes' 
              ? 'bg-industrial-800 text-white border-b-2 border-safety-orange' 
              : 'text-industrial-400 hover:text-white'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-safety-orange" />
          <span>Quote Management ({quotes.filter(q => q.status === 'under_review').length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'orders' 
              ? 'bg-industrial-800 text-white border-b-2 border-safety-orange' 
              : 'text-industrial-400 hover:text-white'
          }`}
        >
          <Truck className="w-4 h-4 text-safety-orange" />
          <span>Fulfillment Tracking ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('commission')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'commission' 
              ? 'bg-industrial-800 text-white border-b-2 border-safety-orange' 
              : 'text-industrial-400 hover:text-white'
          }`}
        >
          <Percent className="w-4 h-4 text-safety-orange" />
          <span>Commission Settings</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'audit' 
              ? 'bg-industrial-800 text-white border-b-2 border-safety-orange' 
              : 'text-industrial-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4 text-safety-orange" />
          <span>Security Audit Trail ({auditEvents.length})</span>
        </button>
      </div>

      {/* Tab 1: Vendor Applications Queue */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-industrial-400 font-mono">
            <span>Pending statutory verification and GSTIN checks</span>
            <span>Total: {vendors.length} records</span>
          </div>

          <div className="space-y-3">
            {vendors.map((app) => (
              <div
                key={app.id}
                className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-base">{app.tradeName}</span>
                    <span className="text-xs text-industrial-400">({app.legalBusinessName})</span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                      app.status === 'approved' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                        : app.status === 'rejected'
                        ? 'bg-red-950 text-red-400 border border-red-800'
                        : 'bg-amber-950 text-amber-400 border border-amber-800'
                    }`}>
                      {app.status}
                    </span>
                  </div>

                  <div className="text-xs text-industrial-400 font-mono">
                    GSTIN: <strong className="text-white">{app.registrationNumber}</strong> &bull; Rep: {app.applicantName} ({app.businessPhone})
                  </div>
                  <div className="text-xs text-industrial-500">
                    Categories: {app.operatingCategories.join(', ')} &bull; Address: {app.businessAddress}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {app.status !== 'approved' && (
                    <button
                      onClick={() => handleVendorAction(app.id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-2 rounded flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{dict.admin.approveVendor}</span>
                    </button>
                  )}

                  {app.status !== 'rejected' && (
                    <button
                      onClick={() => handleVendorAction(app.id, 'rejected')}
                      className="bg-red-900/60 hover:bg-red-800 border border-red-700 text-red-200 text-xs font-bold px-3 py-2 rounded flex items-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{dict.admin.rejectVendor}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Product Moderation Queue */}
      {activeTab === 'products' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-industrial-400 font-mono">
            <span>Technical compliance against IS/ASTM standards before public catalog display</span>
            <span>Total Catalog: {products.length} items</span>
          </div>

          <div className="space-y-3">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={p.images[0]}
                    alt={p.titleEn}
                    className="w-16 h-14 object-cover rounded bg-industrial-950 border border-industrial-800 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{p.titleEn}</span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold ${
                        p.sourceStatus === 'approved'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : p.sourceStatus === 'rejected'
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-amber-950 text-amber-400 border border-amber-800'
                      }`}>
                        {p.sourceStatus}
                      </span>
                    </div>
                    <div className="text-xs text-industrial-400 font-mono">
                      SKU: {p.sku} &bull; Owner: {p.ownerType === 'platform' ? 'Platform Direct' : (p.vendorName || 'Vendor')} &bull; {formatCurrency(p.unitPriceMinor, p.currency, locale)} / {p.unitCode}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {p.sourceStatus !== 'approved' && (
                    <button
                      onClick={() => handleProductAction(p.id, 'approved')}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{dict.admin.approveProduct}</span>
                    </button>
                  )}
                  {p.sourceStatus !== 'rejected' && (
                    <button
                      onClick={() => handleProductAction(p.id, 'rejected')}
                      className="bg-red-900/60 hover:bg-red-800 border border-red-700 text-red-200 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{dict.admin.rejectProduct}</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Quotes Queue */}
      {activeTab === 'quotes' && (
        <div className="space-y-4">
          <div className="text-xs text-industrial-400 font-mono">
            Active bulk quotations requiring consolidated mill rates and delivery terms
          </div>

          <div className="space-y-4">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-industrial-800 pb-3">
                  <div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-base font-bold text-white">{q.referenceCode}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-industrial-800 text-safety-orange">
                        {q.status}
                      </span>
                    </div>
                    <div className="text-xs text-industrial-400 font-mono">
                      Requester: <strong className="text-white">{q.requesterName}</strong> ({q.companyName}) &bull; {q.requesterPhone}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-industrial-400 font-mono">
                      Site: {q.destinationAddress.city} &bull; Required by: {q.requiredByDate}
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-2">
                  <div className="text-xs font-mono text-industrial-400">Requested Items:</div>
                  {q.items.map((item, idx) => (
                    <div key={idx} className="bg-industrial-950 border border-industrial-800 p-2.5 rounded text-xs flex items-center justify-between">
                      <span className="font-semibold text-white">{item.productTitle}</span>
                      <span className="font-mono text-safety-orange font-bold">
                        {item.requestedQuantity} {item.unitCode}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Issue Official Estimate Action */}
                {q.status === 'under_review' ? (
                  <div className="pt-3 border-t border-industrial-800 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-xs">
                      <div>
                        <span className="text-industrial-400 font-mono">Subtotal (Paise): </span>
                        <input
                          type="number"
                          placeholder="9500000"
                          defaultValue={9500000}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setQuoteAmounts({
                              ...quoteAmounts,
                              [q.id]: { subtotal: val, freight: quoteAmounts[q.id]?.freight || 350000 }
                            });
                          }}
                          className="bg-industrial-950 border border-industrial-700 text-white rounded px-2 py-1 font-mono w-28 text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-industrial-400 font-mono">Freight: </span>
                        <input
                          type="number"
                          placeholder="350000"
                          defaultValue={350000}
                          onChange={(e) => {
                            const val = parseInt(e.target.value) || 0;
                            setQuoteAmounts({
                              ...quoteAmounts,
                              [q.id]: { subtotal: quoteAmounts[q.id]?.subtotal || 9500000, freight: val }
                            });
                          }}
                          className="bg-industrial-950 border border-industrial-700 text-white rounded px-2 py-1 font-mono w-24 text-xs"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => handleIssueQuote(q.id)}
                      className="bg-safety-orange hover:bg-safety-orange-hover text-white font-bold text-xs px-4 py-2 rounded transition"
                    >
                      {dict.admin.issueOfficialQuote}
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 border-t border-industrial-800 flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400 flex items-center gap-1 font-bold">
                      <Check className="w-3.5 h-3.5" /> Official Estimate Issued
                    </span>
                    <span className="text-white">
                      Quoted: {formatCurrency(q.quotedSubtotalMinor || 0, q.currency, locale)}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Orders & Fulfillment */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="text-xs text-industrial-400 font-mono">
            Platform-managed multi-axle carrier coordination and tracking number updates
          </div>

          <div className="space-y-4">
            {orders.map((ord) => (
              <div
                key={ord.id}
                className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-industrial-800 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-base font-bold text-white">{ord.orderNumber}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-industrial-800 text-emerald-400">
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-xs text-industrial-400 font-mono">
                      Customer: <strong className="text-white">{ord.customerName}</strong> &bull; Total: {formatCurrency(ord.grandTotalMinor, ord.currency, locale)}
                    </div>
                  </div>

                  <div className="text-xs text-industrial-400 font-mono">
                    Site: {ord.shippingAddress.addressLine1}, {ord.shippingAddress.city}
                  </div>
                </div>

                {/* Items & Tracking input */}
                <div className="space-y-2">
                  {ord.items.map((item) => (
                    <div key={item.id} className="bg-industrial-950 border border-industrial-800 p-3 rounded text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-white">{item.productTitle}</div>
                        <div className="text-industrial-400 font-mono">{item.quantity} {item.unitCode} &bull; SKU: {item.sku}</div>
                      </div>

                      {item.trackingNumber ? (
                        <div className="text-emerald-400 font-mono flex items-center gap-1.5 font-bold">
                          <Truck className="w-4 h-4" />
                          <span>{item.carrierName}: {item.trackingNumber}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Carrier Name (e.g. TN Freight)"
                            onChange={(e) => {
                              setShipmentTracking({
                                ...shipmentTracking,
                                [ord.id]: { carrier: e.target.value, trackingNo: shipmentTracking[ord.id]?.trackingNo || 'TRK-9921' }
                              });
                            }}
                            className="bg-industrial-900 border border-industrial-700 rounded px-2 py-1 text-white font-mono text-xs w-36"
                          />
                          <input
                            type="text"
                            placeholder="Tracking #"
                            onChange={(e) => {
                              setShipmentTracking({
                                ...shipmentTracking,
                                [ord.id]: { carrier: shipmentTracking[ord.id]?.carrier || 'TN Freight', trackingNo: e.target.value }
                              });
                            }}
                            className="bg-industrial-900 border border-industrial-700 rounded px-2 py-1 text-white font-mono text-xs w-28"
                          />
                          <button
                            onClick={() => handleShipOrder(ord.id)}
                            className="bg-safety-orange hover:bg-safety-orange-hover text-white font-bold px-3 py-1 rounded text-xs"
                          >
                            Dispatch
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Commission Settings */}
      {activeTab === 'commission' && (
        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-6 max-w-2xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-white">Platform Commission Model</h2>
            <p className="text-xs text-industrial-400 leading-relaxed">
              PRD §6.7 requires percentage-based commission with clear basis snapshots on transactions. Rates are not hardcoded and can be adjusted with full audit logging.
            </p>
          </div>

          {commSavedNotice && (
            <div className="bg-emerald-950 border border-emerald-600 rounded p-3 text-xs text-emerald-300 font-mono flex items-center gap-2">
              <Check className="w-4 h-4" /> Commission rule updated and logged to audit trail.
            </div>
          )}

          <form onSubmit={handleSaveCommission} className="space-y-4 text-xs font-mono">
            <div>
              <label className="block text-industrial-300 mb-1">Standard Marketplace Commission Rate (%)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionPercent}
                onChange={(e) => setCommissionPercent(parseFloat(e.target.value) || 0)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white font-bold focus:outline-none focus:border-safety-orange"
              />
            </div>

            <div>
              <label className="block text-industrial-300 mb-1">Calculation Basis</label>
              <select
                value={commissionBasis}
                onChange={(e) => setCommissionBasis(e.target.value as any)}
                className="w-full bg-industrial-950 border border-industrial-700 rounded px-3 py-2 text-white focus:outline-none focus:border-safety-orange"
              >
                <option value="subtotal">Item Subtotal (Excluding Tax & Freight)</option>
                <option value="subtotal_plus_tax">Subtotal + Statutory Tax</option>
                <option value="grand_total">Grand Total (Inclusive of Freight)</option>
              </select>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="bg-safety-orange hover:bg-safety-orange-hover text-white font-bold py-2.5 px-5 rounded transition"
              >
                Save Commission Policy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 6: Security Audit Log */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="text-xs text-industrial-400 font-mono">
            Append-only privileged activity log (TRD §12 & PRD §7)
          </div>

          <div className="bg-industrial-900 border border-industrial-800 rounded-lg overflow-hidden text-xs">
            <table className="w-full text-left font-mono">
              <thead className="bg-industrial-950 border-b border-industrial-800 text-industrial-400 text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">Actor</th>
                  <th className="py-2.5 px-4">Action</th>
                  <th className="py-2.5 px-4">Entity</th>
                  <th className="py-2.5 px-4">Audited Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800/60">
                {auditEvents.map((evt) => (
                  <tr key={evt.id} className="hover:bg-industrial-850/50">
                    <td className="py-2.5 px-4 text-industrial-400 text-[11px] whitespace-nowrap">
                      {formatDate(evt.timestamp, locale)} {new Date(evt.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-4 text-white font-semibold">
                      {evt.actorName} ({evt.actorType})
                    </td>
                    <td className="py-2.5 px-4 text-safety-orange font-bold">
                      {evt.action}
                    </td>
                    <td className="py-2.5 px-4 text-industrial-300">
                      {evt.entityType}:{evt.entityId?.slice(0, 10)}
                    </td>
                    <td className="py-2.5 px-4 text-industrial-400">
                      {evt.reason || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
