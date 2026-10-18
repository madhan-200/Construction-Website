'use client';

import { Product, Category, VendorApplication, QuoteRequest, Order, CommissionRule, AuditEvent, Locale } from '@/lib/types';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_VENDOR_APPLICATIONS, INITIAL_QUOTE_REQUESTS, INITIAL_ORDERS, INITIAL_COMMISSION_RULES, INITIAL_AUDIT_EVENTS } from './mock-data';
import { fetchLiveCategories, fetchLiveProducts, insertLiveQuoteRequest, insertLiveOrder, insertLiveVendorApplication } from './supabase';

const STORAGE_KEYS = {
  PRODUCTS: 'buildmart_products',
  CATEGORIES: 'buildmart_categories',
  APPLICATIONS: 'buildmart_applications',
  QUOTES: 'buildmart_quotes',
  ORDERS: 'buildmart_orders',
  COMMISSIONS: 'buildmart_commissions',
  AUDIT: 'buildmart_audit',
  CART: 'buildmart_cart',
  LOCALE: 'buildmart_locale',
  ACTIVE_ROLE: 'buildmart_active_role',
};

export interface CartItem {
  product: Product;
  quantity: number;
}

export class MarketplaceStore {
  private static instance: MarketplaceStore;

  private constructor() {}

  public static getInstance(): MarketplaceStore {
    if (!MarketplaceStore.instance) {
      MarketplaceStore.instance = new MarketplaceStore();
    }
    return MarketplaceStore.instance;
  }

  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // Categories
  public getCategories(): Category[] {
    if (!this.isClient()) return INITIAL_CATEGORIES;
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    
    // Background fetch from Supabase
    fetchLiveCategories().then((live) => {
      if (live && live.length > 0) {
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(live));
        window.dispatchEvent(new Event('categories-updated'));
      }
    }).catch(() => {});

    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(INITIAL_CATEGORIES));
      return INITIAL_CATEGORIES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  // Products
  public getProducts(options?: { categorySlug?: string; query?: string; onlyApproved?: boolean }): Product[] {
    let items = INITIAL_PRODUCTS;
    if (this.isClient()) {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      
      // Background fetch from Supabase
      fetchLiveProducts(options).then((live) => {
        if (live && live.length > 0) {
          // Merge live items with custom created items
          const custom = items.filter(i => i.id.startsWith('prod-cust-'));
          const merged = [...live, ...custom];
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          window.dispatchEvent(new Event('products-updated'));
        }
      }).catch(() => {});

      if (!stored) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
      } else {
        try {
          items = JSON.parse(stored);
        } catch {
          items = INITIAL_PRODUCTS;
        }
      }
    }

    if (options?.onlyApproved ?? true) {
      items = items.filter(p => p.sourceStatus === 'approved' && p.availabilityStatus !== 'discontinued');
    }

    if (options?.categorySlug) {
      const cat = this.getCategories().find(c => c.slug === options.categorySlug);
      if (cat) {
        items = items.filter(p => p.categoryId === cat.id);
      }
    }

    if (options?.query) {
      const q = options.query.toLowerCase();
      items = items.filter(p =>
        p.titleEn.toLowerCase().includes(q) ||
        p.titleTa.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q)
      );
    }

    return items;
  }

  public getProductBySlug(slug: string): Product | undefined {
    const products = this.getProducts({ onlyApproved: false });
    return products.find(p => p.slug === slug);
  }

  public addProduct(product: Omit<Product, 'id' | 'sku' | 'slug' | 'sourceStatus'>): Product {
    const products = this.getProducts({ onlyApproved: false });
    const id = `prod-cust-${Date.now()}`;
    const sku = `SKU-${Date.now().toString().slice(-6)}`;
    const slug = product.titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const newProduct: Product = {
      ...product,
      id,
      sku,
      slug,
      sourceStatus: 'pending_review',
    };
    products.push(newProduct);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      this.recordAudit({
        actorName: 'Vendor',
        actorType: 'vendor',
        action: 'PRODUCT_SUBMITTED_FOR_REVIEW',
        entityType: 'product',
        entityId: id,
        reason: 'New vendor listing submitted',
      });
    }
    return newProduct;
  }

  public updateProductStatus(productId: string, status: Product['sourceStatus'], reason?: string): void {
    const products = this.getProducts({ onlyApproved: false });
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx].sourceStatus = status;
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        this.recordAudit({
          actorName: 'Admin Moderator',
          actorType: 'admin',
          action: `PRODUCT_STATUS_${status.toUpperCase()}`,
          entityType: 'product',
          entityId: productId,
          reason: reason || `Product marked as ${status}`,
        });
      }
    }
  }

  public updateProductStock(productId: string, stock: number): void {
    const products = this.getProducts({ onlyApproved: false });
    const idx = products.findIndex(p => p.id === productId);
    if (idx !== -1) {
      products[idx].availableStock = stock;
      products[idx].availabilityStatus = stock <= 0 ? 'out_of_stock' : 'available';
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
        window.dispatchEvent(new Event('products-updated'));
        this.recordAudit({
          actorName: 'Vendor',
          actorType: 'vendor',
          action: 'PRODUCT_STOCK_UPDATED',
          entityType: 'product',
          entityId: productId,
          reason: `Stock level updated to ${stock}`,
        });
      }
    }
  }

  // Vendor Applications
  public getVendorApplications(): VendorApplication[] {
    if (!this.isClient()) return INITIAL_VENDOR_APPLICATIONS;
    const stored = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(INITIAL_VENDOR_APPLICATIONS));
      return INITIAL_VENDOR_APPLICATIONS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_VENDOR_APPLICATIONS;
    }
  }

  public submitVendorApplication(app: Omit<VendorApplication, 'id' | 'status' | 'submittedAt'>): VendorApplication {
    const apps = this.getVendorApplications();
    const newApp: VendorApplication = {
      ...app,
      id: `app-ven-${Date.now()}`,
      status: 'under_review',
      submittedAt: new Date().toISOString(),
    };
    apps.unshift(newApp);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
      insertLiveVendorApplication(newApp).catch(console.error);
      this.recordAudit({
        actorName: app.applicantName,
        actorType: 'customer',
        action: 'VENDOR_APPLICATION_SUBMITTED',
        entityType: 'vendor_application',
        entityId: newApp.id,
        reason: 'New registration submitted for verification',
      });
    }
    return newApp;
  }

  public updateVendorApplicationStatus(id: string, status: VendorApplication['status'], reason?: string): void {
    const apps = this.getVendorApplications();
    const idx = apps.findIndex(a => a.id === id);
    if (idx !== -1) {
      apps[idx].status = status;
      apps[idx].reviewedAt = new Date().toISOString();
      apps[idx].reviewedBy = 'Admin Lead';
      apps[idx].reviewReason = reason;
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(apps));
        this.recordAudit({
          actorName: 'Admin Auditor',
          actorType: 'admin',
          action: `VENDOR_APPLICATION_${status.toUpperCase()}`,
          entityType: 'vendor_application',
          entityId: id,
          reason: reason || `Application updated to ${status}`,
        });
      }
    }
  }

  // Quote Requests
  public getQuoteRequests(): QuoteRequest[] {
    if (!this.isClient()) return INITIAL_QUOTE_REQUESTS;
    const stored = localStorage.getItem(STORAGE_KEYS.QUOTES);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(INITIAL_QUOTE_REQUESTS));
      return INITIAL_QUOTE_REQUESTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_QUOTE_REQUESTS;
    }
  }

  public submitQuoteRequest(data: Omit<QuoteRequest, 'id' | 'referenceCode' | 'status' | 'submittedAt'>): QuoteRequest {
    const quotes = this.getQuoteRequests();
    const ref = `QR-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newQuote: QuoteRequest = {
      ...data,
      id: `quote-req-${Date.now()}`,
      referenceCode: ref,
      status: 'under_review',
      submittedAt: new Date().toISOString(),
    };
    quotes.unshift(newQuote);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
      insertLiveQuoteRequest(newQuote).catch(console.error);
      this.recordAudit({
        actorName: data.requesterName,
        actorType: 'customer',
        action: 'QUOTE_REQUEST_SUBMITTED',
        entityType: 'quote_request',
        entityId: newQuote.id,
        reason: `Bulk quote requested for ${data.items.length} line items`,
      });
    }
    return newQuote;
  }

  public updateQuoteStatus(id: string, status: QuoteRequest['status'], details?: { quotedSubtotalMinor?: number; deliveryFeeMinor?: number }): void {
    const quotes = this.getQuoteRequests();
    const idx = quotes.findIndex(q => q.id === id);
    if (idx !== -1) {
      quotes[idx].status = status;
      if (details?.quotedSubtotalMinor !== undefined) {
        quotes[idx].quotedSubtotalMinor = details.quotedSubtotalMinor;
        quotes[idx].quotedDeliveryFeeMinor = details.deliveryFeeMinor || 0;
        quotes[idx].quotedAt = new Date().toISOString();
        quotes[idx].validUntil = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
      }
      if (status === 'accepted') {
        quotes[idx].acceptedAt = new Date().toISOString();
      }
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
        this.recordAudit({
          actorName: 'Procurement Specialist',
          actorType: 'admin',
          action: `QUOTE_STATUS_${status.toUpperCase()}`,
          entityType: 'quote_request',
          entityId: id,
          reason: `Status changed to ${status}`,
        });
      }
    }
  }

  public acceptQuote(id: string, actorName: string = 'Buyer'): void {
    const quotes = this.getQuoteRequests();
    const idx = quotes.findIndex(q => q.id === id);
    if (idx !== -1) {
      quotes[idx].status = 'accepted';
      quotes[idx].acceptedAt = new Date().toISOString();
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
        window.dispatchEvent(new Event('quotes-updated'));
        this.recordAudit({
          actorName,
          actorType: 'customer',
          action: 'QUOTE_ACCEPTED_BY_BUYER',
          entityType: 'quote_request',
          entityId: id,
          reason: 'Buyer accepted the formal quotation terms',
        });
      }
    }
  }

  public declineQuote(id: string, actorName: string = 'Buyer'): void {
    const quotes = this.getQuoteRequests();
    const idx = quotes.findIndex(q => q.id === id);
    if (idx !== -1) {
      quotes[idx].status = 'declined';
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
        window.dispatchEvent(new Event('quotes-updated'));
        this.recordAudit({
          actorName,
          actorType: 'customer',
          action: 'QUOTE_DECLINED_BY_BUYER',
          entityType: 'quote_request',
          entityId: id,
          reason: 'Buyer declined the formal quotation terms',
        });
      }
    }
  }

  // Orders
  public getOrders(): Order[] {
    if (!this.isClient()) return INITIAL_ORDERS;
    const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
      return INITIAL_ORDERS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  public createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const orderNumber = `BM-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const newOrder: Order = {
      ...order,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    orders.unshift(newOrder);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      insertLiveOrder(newOrder).catch(console.error);
      this.recordAudit({
        actorName: order.customerName,
        actorType: 'customer',
        action: 'ORDER_PLACED_STAGED',
        entityType: 'order',
        entityId: newOrder.id,
        reason: 'Order recorded in staging test mode',
      });
    }
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status'], tracking?: { carrier: string; trackingNo: string }): void {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updatedAt = new Date().toISOString();
      if (tracking) {
        orders[idx].items.forEach(item => {
          item.carrierName = tracking.carrier;
          item.trackingNumber = tracking.trackingNo;
          item.fulfillmentStatus = 'in_transit';
        });
      }
      if (this.isClient()) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
        this.recordAudit({
          actorName: 'Logistics Desk',
          actorType: 'admin',
          action: `ORDER_STATUS_${status.toUpperCase()}`,
          entityType: 'order',
          entityId: id,
          reason: tracking ? `Dispatched with carrier ${tracking.carrier}` : `Order status updated to ${status}`,
        });
      }
    }
  }

  // Cart
  public getCart(): CartItem[] {
    if (!this.isClient()) return [];
    const stored = localStorage.getItem(STORAGE_KEYS.CART);
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }

  public addToCart(product: Product, quantity: number): CartItem[] {
    const cart = this.getCart();
    const idx = cart.findIndex(i => i.product.id === product.id);
    if (idx !== -1) {
      cart[idx].quantity += quantity;
    } else {
      cart.push({ product, quantity });
    }
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    }
    return cart;
  }

  public updateCartQuantity(productId: string, quantity: number): CartItem[] {
    let cart = this.getCart();
    if (quantity <= 0) {
      cart = cart.filter(i => i.product.id !== productId);
    } else {
      const item = cart.find(i => i.product.id === productId);
      if (item) {
        item.quantity = quantity;
      }
    }
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    }
    return cart;
  }

  public clearCart(): void {
    if (this.isClient()) {
      localStorage.removeItem(STORAGE_KEYS.CART);
      window.dispatchEvent(new Event('cart-updated'));
    }
  }

  // Commission Rules
  public getCommissionRules(): CommissionRule[] {
    if (!this.isClient()) return INITIAL_COMMISSION_RULES;
    const stored = localStorage.getItem(STORAGE_KEYS.COMMISSIONS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(INITIAL_COMMISSION_RULES));
      return INITIAL_COMMISSION_RULES;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_COMMISSION_RULES;
    }
  }

  public updateCommissionRule(ratePercent: number, calculationBasis: CommissionRule['calculationBasis']): void {
    const rules = this.getCommissionRules();
    rules[0] = {
      ...rules[0],
      ratePercent,
      calculationBasis,
    };
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.COMMISSIONS, JSON.stringify(rules));
      this.recordAudit({
        actorName: 'Admin Financial Lead',
        actorType: 'admin',
        action: 'COMMISSION_RULE_UPDATED',
        entityType: 'commission_rule',
        entityId: rules[0].id,
        reason: `Commission adjusted to ${ratePercent}% on ${calculationBasis}`,
      });
    }
  }

  // Audit
  public getAuditEvents(): AuditEvent[] {
    if (!this.isClient()) return INITIAL_AUDIT_EVENTS;
    const stored = localStorage.getItem(STORAGE_KEYS.AUDIT);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(INITIAL_AUDIT_EVENTS));
      return INITIAL_AUDIT_EVENTS;
    }
    try {
      return JSON.parse(stored);
    } catch {
      return INITIAL_AUDIT_EVENTS;
    }
  }

  private recordAudit(event: Omit<AuditEvent, 'id' | 'actorUserId' | 'timestamp'>): void {
    const events = this.getAuditEvents();
    const newEvent: AuditEvent = {
      ...event,
      id: `aud-${Date.now()}`,
      actorUserId: 'usr-actor-active',
      timestamp: new Date().toISOString(),
    };
    events.unshift(newEvent);
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.AUDIT, JSON.stringify(events.slice(0, 50)));
    }
  }

  // Locale
  public getLocale(): Locale {
    if (!this.isClient()) return 'en';
    return (localStorage.getItem(STORAGE_KEYS.LOCALE) as Locale) || 'en';
  }

  public setLocale(locale: Locale): void {
    if (this.isClient()) {
      localStorage.setItem(STORAGE_KEYS.LOCALE, locale);
      window.dispatchEvent(new Event('locale-updated'));
    }
  }
}

export const store = MarketplaceStore.getInstance();
