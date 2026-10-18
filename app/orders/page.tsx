'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { 
  PackageCheck, 
  Truck, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  FileText, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';

export default function OrdersPage() {
  const { locale, dict } = useApp();
  const [orders] = useState(() => store.getOrders());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="border-b border-industrial-800 pb-4">
        <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
          {locale === 'ta' ? 'கொள்முதல் வரலாறு' : 'Requisitions & Fulfillment'}
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {dict.nav.myOrders}
        </h1>
        <p className="text-xs text-industrial-400 mt-1">
          {locale === 'ta'
            ? 'அனைத்து ஆர்டர்களும் தளத்தால் நேரடியாக திட்ட தளவாடங்களுடன் கண்காணிக்கப்படுகின்றன.'
            : 'Track status snapshots and platform-managed freight dispatches.'}
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-12 text-center space-y-3">
          <PackageCheck className="w-10 h-10 text-industrial-600 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Orders Placed Yet</h2>
          <p className="text-xs text-industrial-400 max-w-sm mx-auto">
            Place your first material order or submit a bulk project quotation.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-safety-orange text-white text-xs font-bold py-2.5 px-4 rounded transition"
          >
            <span>Browse Materials</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-industrial-900 border border-industrial-800 rounded-lg overflow-hidden space-y-4 p-6"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-industrial-800 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-base font-black text-white">{order.orderNumber}</span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded uppercase bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {order.status}
                    </span>
                  </div>
                  <div className="text-xs text-industrial-400 font-mono">
                    Created on {formatDate(order.createdAt, locale)} &bull; Recipient: <strong className="text-white">{order.customerName}</strong>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-[11px] text-industrial-400 font-mono">Grand Total (Snapshot)</div>
                  <div className="text-xl font-black text-safety-orange font-mono">
                    {formatCurrency(order.grandTotalMinor, order.currency, locale)}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-3">
                <div className="text-xs font-mono font-bold text-industrial-300 uppercase">
                  Line Items & Freight Tracking
                </div>

                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="bg-industrial-950 border border-industrial-800/80 rounded p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-white text-sm">
                          {item.productTitle}
                        </div>
                        <div className="font-mono text-industrial-400 text-[11px]">
                          SKU: {item.sku} &bull; Qty: {item.quantity} {item.unitCode} &times; {formatCurrency(item.unitPriceMinor, item.currency, locale)}
                        </div>
                      </div>

                      {/* Fulfillment Status Pill */}
                      <div className="flex items-center gap-3">
                        {item.trackingNumber ? (
                          <div className="bg-industrial-900 border border-industrial-700 px-3 py-1.5 rounded flex items-center gap-2">
                            <Truck className="w-4 h-4 text-safety-orange" />
                            <div className="font-mono text-[11px]">
                              <span className="text-industrial-400">{item.carrierName}:</span>{' '}
                              <strong className="text-white">{item.trackingNumber}</strong>
                            </div>
                          </div>
                        ) : (
                          <div className="text-industrial-400 flex items-center gap-1.5 font-mono text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            <span>Awaiting Platform Freight Assignment</span>
                          </div>
                        )}

                        <span className="font-mono font-bold text-white">
                          {formatCurrency(item.lineSubtotalMinor, item.currency, locale)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Terms */}
              <div className="pt-2 border-t border-industrial-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-industrial-400">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-safety-orange shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Site Destination:</span>{' '}
                    {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                  </div>
                </div>

                <div className="flex items-start gap-2 font-mono text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white">Platform Coordination:</strong> Dispatch schedule and site gate access confirmed by central operations desk.
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
