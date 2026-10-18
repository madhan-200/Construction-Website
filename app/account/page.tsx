'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { QuoteRequest, Order } from '@/lib/types';
import { 
  Building2, 
  MapPin, 
  FileText, 
  PackageCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  Phone, 
  Mail, 
  Plus, 
  ArrowRight,
  Truck
} from 'lucide-react';

interface JobSite {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactPhone: string;
}

export default function AccountPage() {
  const { locale, dict, user, signOut } = useApp();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'quotes' | 'orders' | 'sites' | 'profile'>('quotes');
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Default saved job sites
  const [jobSites, setJobSites] = useState<JobSite[]>([
    {
      id: 'site-1',
      name: 'OMR IT Corridor Tower 4 Project',
      address: 'Plot 12, Navalur Industrial Corridor',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600130',
      contactPhone: '+91 98400 12345',
    },
    {
      id: 'site-2',
      name: 'Porur Commercial Complex Site',
      address: 'Near Toll Plaza, Mount-Poonamallee High Rd',
      city: 'Chennai',
      state: 'Tamil Nadu',
      pincode: '600116',
      contactPhone: '+91 94440 55667',
    },
  ]);

  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteAddress, setNewSiteAddress] = useState('');
  const [newSiteCity, setNewSiteCity] = useState('Chennai');
  const [newSitePincode, setNewSitePincode] = useState('');
  const [newSitePhone, setNewSitePhone] = useState('');
  const [showAddSite, setShowAddSite] = useState(false);

  useEffect(() => {
    const allQuotes = store.getQuoteRequests();
    const allOrders = store.getOrders();
    setQuotes(allQuotes);
    setOrders(allOrders);

    const handleQuotesUpdate = () => {
      setQuotes(store.getQuoteRequests());
    };

    window.addEventListener('quotes-updated', handleQuotesUpdate);
    return () => window.removeEventListener('quotes-updated', handleQuotesUpdate);
  }, []);

  const handleAcceptQuote = (quoteId: string) => {
    store.acceptQuote(quoteId, user?.displayName || 'Customer');
    setQuotes(store.getQuoteRequests());
    setActionNotice('Quotation terms successfully accepted. Procurement coordinator will follow up for dispatch.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDeclineQuote = (quoteId: string) => {
    store.declineQuote(quoteId, user?.displayName || 'Customer');
    setQuotes(store.getQuoteRequests());
    setActionNotice('Quotation marked as declined.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleAddSite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiteName || !newSiteAddress) return;
    const newSite: JobSite = {
      id: `site-${Date.now()}`,
      name: newSiteName,
      address: newSiteAddress,
      city: newSiteCity,
      state: 'Tamil Nadu',
      pincode: newSitePincode || '600001',
      contactPhone: newSitePhone || user?.phone || '+91 98400 00000',
    };
    setJobSites([...jobSites, newSite]);
    setNewSiteName('');
    setNewSiteAddress('');
    setNewSitePincode('');
    setNewSitePhone('');
    setShowAddSite(false);
    setActionNotice('New job site added to your profile.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Account Header */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider">
              {dict.account.title}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-industrial-800 text-industrial-300 border border-industrial-700">
              {user?.role || 'Customer'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {user?.displayName || 'Procurement Manager'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-industrial-400 font-mono">
            {user?.companyName && (
              <span className="flex items-center gap-1.5 text-industrial-300">
                <Building2 className="w-3.5 h-3.5 text-safety-orange" />
                {user.companyName}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-industrial-500" />
              {user?.email || 'contractor@chennaicivil.com'}
            </span>
            {user?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-industrial-500" />
                {user.phone}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user?.role === 'vendor' && (
            <Link
              href="/vendor/dashboard"
              className="bg-industrial-800 hover:bg-industrial-700 text-white text-xs font-mono font-bold py-2 px-3 rounded border border-industrial-700 transition"
            >
              Vendor Workspace
            </Link>
          )}
          {user?.role === 'admin' && (
            <Link
              href="/admin"
              className="bg-industrial-800 hover:bg-industrial-700 text-white text-xs font-mono font-bold py-2 px-3 rounded border border-industrial-700 transition"
            >
              Admin Console
            </Link>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 bg-industrial-950 hover:bg-red-950/40 text-industrial-400 hover:text-red-400 text-xs font-mono font-bold py-2 px-3 rounded border border-industrial-800 hover:border-red-900 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{dict.nav.signOut}</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-300 p-4 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-industrial-800 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('quotes')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'quotes'
              ? 'bg-safety-orange text-white'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{dict.account.quotesTitle} ({quotes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-safety-orange text-white'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-900'
          }`}
        >
          <PackageCheck className="w-4 h-4" />
          <span>{dict.account.ordersTitle} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'sites'
              ? 'bg-safety-orange text-white'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-900'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>{dict.account.jobSitesTitle} ({jobSites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-safety-orange text-white'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>{dict.account.profileTitle}</span>
        </button>
      </div>

      {/* TAB CONTENT: QUOTATIONS */}
      {activeTab === 'quotes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-industrial-400">
              Track multi-line project quotation requests, negotiated prices, and contractor discounts.
            </p>
            <Link
              href="/quote"
              className="inline-flex items-center gap-1.5 bg-safety-orange hover:bg-safety-orange-hover text-white text-xs font-bold py-2 px-3 rounded transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Bulk Quote Request</span>
            </Link>
          </div>

          {quotes.length === 0 ? (
            <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-12 text-center text-xs text-industrial-400">
              {dict.account.emptyQuotes}
            </div>
          ) : (
            <div className="space-y-4">
              {quotes.map((q) => {
                const isQuoted = q.status === 'quoted';
                const isAccepted = q.status === 'accepted';
                const isDeclined = q.status === 'declined';

                return (
                  <div
                    key={q.id}
                    className="bg-industrial-900 border border-industrial-800 rounded-lg p-6 space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-industrial-800 pb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <span className="text-base font-black font-mono text-white">
                            {q.referenceCode}
                          </span>
                          <span
                            className={`text-[11px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                              isAccepted
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : isQuoted
                                ? 'bg-amber-950 text-amber-400 border-amber-800'
                                : isDeclined
                                ? 'bg-red-950 text-red-400 border-red-800'
                                : 'bg-industrial-800 text-industrial-300 border-industrial-700'
                            }`}
                          >
                            {q.status}
                          </span>
                        </div>
                        <div className="text-xs text-industrial-400 font-mono">
                          Submitted on {formatDate(q.submittedAt, locale)} &bull; Destination:{' '}
                          <span className="text-white">{q.destinationAddress?.city}, {q.destinationAddress?.postalCode}</span>
                        </div>
                      </div>

                      {q.quotedSubtotalMinor !== undefined && (
                        <div className="text-left sm:text-right">
                          <div className="text-[11px] text-industrial-400 font-mono">
                            Quoted Total (incl. logistics)
                          </div>
                          <div className="text-xl font-black text-safety-orange font-mono">
                            {formatCurrency((q.quotedSubtotalMinor || 0) + (q.quotedDeliveryFeeMinor || 0), q.currency, locale)}
                          </div>
                          {q.validUntil && (
                            <div className="text-[10px] text-industrial-400 font-mono">
                              Valid until: {q.validUntil}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Line Items */}
                    <div className="space-y-2">
                      <div className="text-xs font-mono font-bold text-industrial-300 uppercase">
                        Requested Material Lines
                      </div>
                      <div className="bg-industrial-950 border border-industrial-800 rounded overflow-x-auto">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-industrial-900 border-b border-industrial-800 text-industrial-400">
                            <tr>
                              <th className="p-2.5">Material</th>
                              <th className="p-2.5">SKU</th>
                              <th className="p-2.5">Quantity</th>
                              <th className="p-2.5">Target Price</th>
                              <th className="p-2.5 text-right">Quoted Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-industrial-900">
                            {q.items.map((item) => (
                              <tr key={item.id} className="text-industrial-300">
                                <td className="p-2.5 font-bold text-white">{item.productTitle}</td>
                                <td className="p-2.5 text-industrial-500">{item.productSku}</td>
                                <td className="p-2.5">{item.requestedQuantity} {item.unitCode}</td>
                                <td className="p-2.5 text-industrial-400">
                                  {item.targetPriceMinor ? formatCurrency(item.targetPriceMinor, q.currency, locale) : 'Market rate'}
                                </td>
                                <td className="p-2.5 text-right text-emerald-400 font-bold">
                                  {q.quotedSubtotalMinor ? 'Official Rate Included' : 'Under Review'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Buyer Action Buttons if Quoted */}
                    {isQuoted && (
                      <div className="bg-amber-950/30 border border-amber-900/60 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="text-xs text-amber-200 space-y-1">
                          <div className="font-bold flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span>Official Estimate Issued by Platform Logistics</span>
                          </div>
                          <p className="text-[11px] text-amber-300/80">
                            Review the quoted rates above. Accept to lock rates and initiate dispatch scheduling.
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleAcceptQuote(q.id)}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 px-4 rounded transition flex items-center gap-1.5 shadow"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{dict.quote.acceptQuote}</span>
                          </button>
                          <button
                            onClick={() => handleDeclineQuote(q.id)}
                            className="bg-industrial-800 hover:bg-industrial-700 text-industrial-300 text-xs font-bold py-2 px-3 rounded border border-industrial-700 transition"
                          >
                            {dict.quote.declineQuote}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-industrial-400">
              Your procurement requisitions with live freight and vehicle tracking.
            </p>
            <Link
              href="/orders"
              className="text-safety-orange hover:underline text-xs font-mono font-bold flex items-center gap-1"
            >
              <span>Detailed Tracking View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {orders.length === 0 ? (
            <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-12 text-center text-xs text-industrial-400">
              {dict.account.emptyOrders}
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-industrial-800 pb-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="text-white font-black text-sm">{o.orderNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-industrial-800 text-industrial-300 border border-industrial-700">
                          {o.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-industrial-400 font-mono">
                        Placed: {formatDate(o.createdAt, locale)} &bull; {o.items.length} line items
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-black text-safety-orange font-mono">
                          {formatCurrency(o.grandTotalMinor, o.currency, locale)}
                        </div>
                      </div>
                      <Link
                        href="/orders"
                        className="bg-industrial-950 border border-industrial-700 hover:border-safety-orange text-white text-xs font-mono py-1.5 px-3 rounded flex items-center gap-1.5 transition"
                      >
                        <Truck className="w-3.5 h-3.5 text-safety-orange" />
                        <span>Track</span>
                      </Link>
                    </div>
                  </div>

                  <div className="text-xs text-industrial-300 font-mono">
                    {o.items.map((i) => `${i.quantity} ${i.unitCode} × ${i.productTitle}`).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: JOB SITES */}
      {activeTab === 'sites' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-industrial-400">
              Pre-registered construction project sites for expedited delivery and crane unloading.
            </p>
            <button
              onClick={() => setShowAddSite(!showAddSite)}
              className="flex items-center gap-1.5 bg-safety-orange hover:bg-safety-orange-hover text-white text-xs font-bold py-2 px-3 rounded transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Job Site</span>
            </button>
          </div>

          {showAddSite && (
            <form onSubmit={handleAddSite} className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-4">
              <div className="text-xs font-mono font-bold text-safety-orange uppercase">
                New Project Job Site Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Job Site / Project Name *
                  </label>
                  <input
                    type="text"
                    value={newSiteName}
                    onChange={(e) => setNewSiteName(e.target.value)}
                    placeholder="e.g. Marina Bay High-Rise Site"
                    required
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Site Engineer Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={newSitePhone}
                    onChange={(e) => setNewSitePhone(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Site Address / Landmarks *
                  </label>
                  <input
                    type="text"
                    value={newSiteAddress}
                    onChange={(e) => setNewSiteAddress(e.target.value)}
                    placeholder="Plot / Survey No, Landmark, Road"
                    required
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">City</label>
                  <input
                    type="text"
                    value={newSiteCity}
                    onChange={(e) => setNewSiteCity(e.target.value)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={newSitePincode}
                    onChange={(e) => setNewSitePincode(e.target.value)}
                    placeholder="600001"
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddSite(false)}
                  className="bg-industrial-800 text-industrial-300 text-xs font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-safety-orange text-white text-xs font-bold py-2 px-4 rounded"
                >
                  Save Job Site
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobSites.map((site) => (
              <div
                key={site.id}
                className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-safety-orange" />
                  <span className="font-bold text-white text-sm">{site.name}</span>
                </div>
                <div className="text-xs text-industrial-300 space-y-1">
                  <div>{site.address}</div>
                  <div>{site.city}, {site.state} - {site.pincode}</div>
                  <div className="text-industrial-400 font-mono text-[11px] pt-1">
                    Contact: {site.contactPhone}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-6 max-w-2xl space-y-4">
          <div className="text-xs font-mono font-bold text-safety-orange uppercase">
            Enterprise Profile Details
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Authorized Contact:</span>
              <span className="text-white font-bold">{user?.displayName}</span>
            </div>
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Enterprise Firm:</span>
              <span className="text-white font-bold">{user?.companyName || 'Registered Contractor'}</span>
            </div>
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Email:</span>
              <span className="text-white font-bold">{user?.email}</span>
            </div>
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Phone:</span>
              <span className="text-white font-bold">{user?.phone || 'Not provided'}</span>
            </div>
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Security Clearance:</span>
              <span className="text-emerald-400 font-bold uppercase">{user?.role} Tier Verified</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
