'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Product, Order, Category } from '@/lib/types';
import { 
  Store, 
  Package, 
  Truck, 
  Plus, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Boxes, 
  DollarSign, 
  ArrowRight,
  Edit,
  Save,
  LogOut
} from 'lucide-react';

export default function VendorDashboardPage() {
  const { locale, dict, user, signOut } = useApp();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'catalog' | 'orders' | 'profile'>('catalog');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  // New product form modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [titleEn, setTitleEn] = useState('');
  const [titleTa, setTitleTa] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unitCode, setUnitCode] = useState('tonne');
  const [unitPriceRupees, setUnitPriceRupees] = useState<number>(0);
  const [moq, setMoq] = useState<number>(1);
  const [initialStock, setInitialStock] = useState<number>(100);
  const [descriptionEn, setDescriptionEn] = useState('');
  const [specGrade, setSpecGrade] = useState('');
  const [specStandard, setSpecStandard] = useState('');

  // Inline stock edit
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [editingStockVal, setEditingStockVal] = useState<number>(0);

  // Dispatch tracking modal for order
  const [dispatchOrderId, setDispatchOrderId] = useState<string | null>(null);
  const [carrierName, setCarrierName] = useState('HeavyHaul Logistics');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    const cats = store.getCategories();
    setCategories(cats);
    if (cats.length > 0) setCategoryId(cats[0].id);

    // Get all products; in real app filter by vendorId
    const allProds = store.getProducts({ onlyApproved: false });
    // Filter vendor products or show existing vendor products
    const vendorProds = allProds.filter(p => p.ownerType === 'vendor' || p.id.startsWith('prod-cust-'));
    setProducts(vendorProds.length > 0 ? vendorProds : allProds.filter(p => p.ownerType === 'vendor'));

    const allOrders = store.getOrders();
    setOrders(allOrders);

    const handleProductsUpdate = () => {
      const updated = store.getProducts({ onlyApproved: false });
      setProducts(updated.filter(p => p.ownerType === 'vendor' || p.id.startsWith('prod-cust-')));
    };

    window.addEventListener('products-updated', handleProductsUpdate);
    return () => window.removeEventListener('products-updated', handleProductsUpdate);
  }, []);

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleEn || !unitPriceRupees || !categoryId) {
      alert('Please fill out product title, category, and price.');
      return;
    }

    const cat = categories.find(c => c.id === categoryId);
    const specs: Record<string, string> = {};
    if (specGrade) specs['Grade'] = specGrade;
    if (specStandard) specs['Standard'] = specStandard;
    specs['Category'] = cat?.nameEn || 'General';

    store.addProduct({
      ownerType: 'vendor',
      vendorId: user?.vendorId || 'v0000000-0000-4000-8000-000000000001',
      vendorName: user?.companyName || 'Verified Supplier',
      categoryId,
      titleEn,
      titleTa: titleTa || titleEn,
      descriptionEn: descriptionEn || 'Direct supplier materials verified for commercial engineering standards.',
      descriptionTa: 'தொழில்துறை தரநிலைகளுக்காக சரிபார்க்கப்பட்ட விநியோக பொருட்கள்.',
      unitCode,
      currency: 'INR',
      unitPriceMinor: Math.round(unitPriceRupees * 100),
      minimumOrderQuantity: moq,
      availableStock: initialStock,
      availabilityStatus: initialStock > 0 ? 'available' : 'out_of_stock',
      specifications: specs,
      images: [
        'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80'
      ],
    });

    const updated = store.getProducts({ onlyApproved: false });
    setProducts(updated.filter(p => p.ownerType === 'vendor' || p.id.startsWith('prod-cust-')));
    setShowAddModal(false);
    setTitleEn('');
    setTitleTa('');
    setDescriptionEn('');
    setSpecGrade('');
    setSpecStandard('');
    setNotice('Material listing submitted! Status is pending technical moderation.');
    setTimeout(() => setNotice(null), 4000);
  };

  const handleSaveStock = (productId: string) => {
    store.updateProductStock(productId, editingStockVal);
    const updated = store.getProducts({ onlyApproved: false });
    setProducts(updated.filter(p => p.ownerType === 'vendor' || p.id.startsWith('prod-cust-')));
    setEditingStockId(null);
    setNotice('Inventory stock updated successfully.');
    setTimeout(() => setNotice(null), 3000);
  };

  const handleDispatchOrder = (orderId: string) => {
    if (!carrierName || !trackingNumber) {
      alert('Please enter carrier name and tracking number.');
      return;
    }
    store.updateOrderStatus(orderId, 'processing', {
      carrier: carrierName,
      trackingNo: trackingNumber,
    });
    setOrders(store.getOrders());
    setDispatchOrderId(null);
    setTrackingNumber('');
    setNotice('Fulfillment updated. Carrier details recorded.');
    setTimeout(() => setNotice(null), 3000);
  };

  const activeCount = products.filter(p => p.sourceStatus === 'approved').length;
  const pendingCount = products.filter(p => p.sourceStatus === 'pending_review').length;
  const totalStockUnits = products.reduce((sum, p) => sum + (p.availableStock || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Workspace Header */}
      <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider">
              {dict.vendor.portalTitle}
            </span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>Approved Supplier</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {user?.companyName || 'Chennai TMT & Steel Mills'}
          </h1>
          <p className="text-xs text-industrial-400 font-mono">
            Vendor ID: {user?.vendorId || 'v0000000-0000-4000-8000-000000000001'} &bull; Primary Operator: {user?.displayName || 'Authorized Supplier'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 bg-safety-orange hover:bg-safety-orange-hover text-white text-xs font-bold py-2.5 px-4 rounded transition shadow"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>{dict.vendor.addNewProduct}</span>
          </button>
          <button
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className="flex items-center gap-1.5 bg-industrial-950 hover:bg-industrial-800 text-industrial-400 hover:text-white text-xs font-mono font-bold py-2.5 px-3 rounded border border-industrial-800 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{dict.nav.signOut}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-300 p-4 rounded text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-4 space-y-1">
          <div className="text-[11px] font-mono text-industrial-400 uppercase">Active Materials</div>
          <div className="text-2xl font-black text-white font-mono">{activeCount}</div>
          <div className="text-[10px] text-emerald-400 font-mono">Live on storefront</div>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-4 space-y-1">
          <div className="text-[11px] font-mono text-industrial-400 uppercase">Under Moderation</div>
          <div className="text-2xl font-black text-amber-400 font-mono">{pendingCount}</div>
          <div className="text-[10px] text-industrial-400 font-mono">Pending admin review</div>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-4 space-y-1">
          <div className="text-[11px] font-mono text-industrial-400 uppercase">Available Stock Units</div>
          <div className="text-2xl font-black text-safety-orange font-mono">{totalStockUnits.toLocaleString()}</div>
          <div className="text-[10px] text-industrial-400 font-mono">Across catalog</div>
        </div>

        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-4 space-y-1">
          <div className="text-[11px] font-mono text-industrial-400 uppercase">Fulfillment Orders</div>
          <div className="text-2xl font-black text-white font-mono">{orders.length}</div>
          <div className="text-[10px] text-industrial-400 font-mono">Platform-managed</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-industrial-800 overflow-x-auto pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'catalog'
              ? 'bg-safety-orange text-white'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-900'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{dict.vendor.myProducts} ({products.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'orders'
              ? 'bg-safety-orange text-white'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-900'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>{dict.vendor.assignedOrders} ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t font-bold transition whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-safety-orange text-white'
              : 'text-industrial-400 hover:text-white hover:bg-industrial-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Business Profile & Tax Compliance</span>
        </button>
      </div>

      {/* TAB CONTENT: CATALOG */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-industrial-950 border-b border-industrial-800 text-industrial-400 uppercase text-[11px]">
                <tr>
                  <th className="p-3.5">Material & SKU</th>
                  <th className="p-3.5">Unit Price</th>
                  <th className="p-3.5">Stock Level</th>
                  <th className="p-3.5">MOQ</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-industrial-800/80">
                {products.map((p) => {
                  const isEditing = editingStockId === p.id;
                  const isApproved = p.sourceStatus === 'approved';
                  const isPending = p.sourceStatus === 'pending_review';

                  return (
                    <tr key={p.id} className="text-industrial-300 hover:bg-industrial-850/50">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-sm">{p.titleEn}</div>
                        <div className="text-[11px] text-industrial-400">
                          SKU: {p.sku} &bull; Unit: {p.unitCode}
                        </div>
                      </td>

                      <td className="p-3.5 font-bold text-white">
                        {formatCurrency(p.unitPriceMinor, p.currency, locale)}
                      </td>

                      <td className="p-3.5">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              value={editingStockVal}
                              onChange={(e) => setEditingStockVal(Number(e.target.value))}
                              className="w-20 bg-industrial-950 border border-safety-orange rounded px-2 py-1 text-white text-xs font-mono"
                            />
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              className="bg-safety-orange text-white p-1 rounded"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className={p.availableStock > 0 ? 'text-emerald-400 font-bold' : 'text-red-400'}>
                              {p.availableStock} {p.unitCode}
                            </span>
                            <button
                              onClick={() => {
                                setEditingStockId(p.id);
                                setEditingStockVal(p.availableStock);
                              }}
                              className="text-industrial-500 hover:text-safety-orange transition"
                              title="Update stock level"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="p-3.5">{p.minimumOrderQuantity} {p.unitCode}</td>

                      <td className="p-3.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                            isApproved
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              : isPending
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-red-950 text-red-400 border-red-800'
                          }`}
                        >
                          {p.sourceStatus}
                        </span>
                      </td>

                      <td className="p-3.5 text-right">
                        <Link
                          href={`/products/${p.slug}`}
                          className="text-safety-orange hover:underline text-[11px] font-bold"
                        >
                          View Listing
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ASSIGNED ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <p className="text-xs text-industrial-400">
            Fulfillment orders dispatched via platform-coordinated logistics. Mark items ready for site pick-up.
          </p>

          <div className="space-y-4">
            {orders.map((o) => (
              <div key={o.id} className="bg-industrial-900 border border-industrial-800 rounded-lg p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-industrial-800 pb-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-base font-black text-white">{o.orderNumber}</span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase bg-industrial-800 text-industrial-300 border border-industrial-700">
                        {o.status}
                      </span>
                    </div>
                    <div className="text-xs text-industrial-400 font-mono">
                      Recipient: <span className="text-white">{o.customerName}</span> &bull; {formatDate(o.createdAt, locale)}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDispatchOrderId(o.id)}
                      className="bg-industrial-950 hover:bg-industrial-800 text-safety-orange hover:text-white border border-industrial-700 hover:border-safety-orange text-xs font-mono font-bold py-1.5 px-3 rounded flex items-center gap-1.5 transition"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Update Dispatch</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  {o.items.map((i) => (
                    <div key={i.id} className="text-xs font-mono text-industrial-300 flex justify-between">
                      <span>{i.productTitle} &bull; Qty: {i.quantity} {i.unitCode}</span>
                      <span className="text-industrial-400">
                        {i.carrierName ? `Dispatched via ${i.carrierName} (${i.trackingNumber})` : 'Awaiting carrier assignment'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: BUSINESS PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-6 max-w-2xl space-y-4">
          <div className="text-xs font-mono font-bold text-safety-orange uppercase">
            Registered Vendor Business Entity
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Legal Business Name:</span>
              <span className="text-white font-bold">{user?.companyName || 'Chennai TMT & Steel Mills Pvt Ltd'}</span>
            </div>
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Commercial GSTIN:</span>
              <span className="text-white font-bold">33AABCT9988C1Z4</span>
            </div>
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Primary Warehouse / Dispatch:</span>
              <span className="text-white font-bold">Ambattur Industrial Estate, Chennai</span>
            </div>
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Platform Commission Scheme:</span>
              <span className="text-emerald-400 font-bold">Standard Tier (8.5% on Subtotal)</span>
            </div>
            <div className="flex justify-between border-b border-industrial-800 pb-2">
              <span className="text-industrial-400">Logistics Mode:</span>
              <span className="text-white font-bold">Platform-Managed Consolidated Freight</span>
            </div>
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="border-b border-industrial-800 pb-3 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white font-mono">
                {dict.vendor.addNewProduct}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-industrial-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                  Product Title (English) *
                </label>
                <input
                  type="text"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="e.g. Fe 550D High-Yield Quenched TMT Bars"
                  required
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                  Product Title (Tamil)
                </label>
                <input
                  type="text"
                  value={titleTa}
                  onChange={(e) => setTitleTa(e.target.value)}
                  placeholder="e.g. Fe 550D டிஎம்டி கம்பிகள்"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Category *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nameEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Unit Code *
                  </label>
                  <select
                    value={unitCode}
                    onChange={(e) => setUnitCode(e.target.value)}
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  >
                    <option value="tonne">tonne</option>
                    <option value="bag (50kg)">bag (50kg)</option>
                    <option value="piece">piece</option>
                    <option value="sq ft">sq ft</option>
                    <option value="metre">metre</option>
                    <option value="cum">cum</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Unit Price (₹ INR) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={unitPriceRupees || ''}
                    onChange={(e) => setUnitPriceRupees(Number(e.target.value))}
                    placeholder="62000"
                    required
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    MOQ *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={moq}
                    onChange={(e) => setMoq(Number(e.target.value))}
                    required
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Initial Stock *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={initialStock}
                    onChange={(e) => setInitialStock(Number(e.target.value))}
                    required
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Specification Grade
                  </label>
                  <input
                    type="text"
                    value={specGrade}
                    onChange={(e) => setSpecGrade(e.target.value)}
                    placeholder="e.g. Fe 550D / Grade 53"
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                    Standard / Bureau Code
                  </label>
                  <input
                    type="text"
                    value={specStandard}
                    onChange={(e) => setSpecStandard(e.target.value)}
                    placeholder="e.g. IS 1786 / IS 12269"
                    className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                  Product Description
                </label>
                <textarea
                  rows={2}
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  placeholder="Technical manufacturing standards and load characteristics..."
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div className="text-[11px] text-industrial-400 bg-industrial-950 p-3 rounded border border-industrial-800">
                {dict.vendor.pendingReviewNotice}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-industrial-800 text-industrial-300 text-xs font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-safety-orange hover:bg-safety-orange-hover text-white text-xs font-bold py-2 px-4 rounded shadow"
                >
                  Submit Listing for Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPATCH TRACKING MODAL */}
      {dispatchOrderId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-industrial-900 border border-industrial-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white font-mono">
              Update Order Dispatch
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                  Carrier / Fleet Name
                </label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-industrial-300 uppercase mb-1">
                  Vehicle / Consignment Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. TN-04-AB-1234 or LR-998811"
                  className="w-full bg-industrial-950 border border-industrial-700 rounded py-2 px-3 text-sm text-white focus:outline-none focus:border-safety-orange"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDispatchOrderId(null)}
                className="bg-industrial-800 text-industrial-300 text-xs font-bold py-2 px-4 rounded"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDispatchOrder(dispatchOrderId)}
                className="bg-safety-orange text-white text-xs font-bold py-2 px-4 rounded"
              >
                Confirm Dispatch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
