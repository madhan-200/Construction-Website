// Domain models for Construction E-commerce Marketplace

export type Locale = 'en' | 'ta';

export type UserRole = 'customer' | 'vendor' | 'admin' | 'support';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  preferredLocale: Locale;
  phone?: string;
  companyName?: string;
  vendorId?: string;
}

export interface Category {
  id: string;
  slug: string;
  nameEn: string;
  nameTa: string;
  descriptionEn: string;
  descriptionTa: string;
  iconName: string;
  sortOrder: number;
  itemCount: number;
}

export type ProductOwnerType = 'platform' | 'vendor';
export type SourceStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'unpublished';
export type AvailabilityStatus = 'available' | 'out_of_stock' | 'discontinued';

export interface BulkPricingTier {
  id: string;
  minQuantity: number;
  unitPriceMinor: number;
  currency: string;
}

export interface Product {
  id: string;
  sku: string;
  slug: string;
  ownerType: ProductOwnerType;
  vendorId?: string;
  vendorName?: string;
  categoryId: string;
  titleEn: string;
  titleTa: string;
  descriptionEn: string;
  descriptionTa: string;
  unitCode: string; // e.g. 'bag (50kg)', 'tonne', 'piece', 'sq ft', 'metre', 'cum'
  currency: string;
  unitPriceMinor: number;
  minimumOrderQuantity: number;
  availableStock: number;
  sourceStatus: SourceStatus;
  availabilityStatus: AvailabilityStatus;
  specifications: Record<string, string>;
  images: string[];
  bulkPricingTiers?: BulkPricingTier[];
  isFeatured?: boolean;
}

export type QuoteStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'quoted'
  | 'accepted'
  | 'declined'
  | 'expired'
  | 'cancelled'
  | 'converted_to_order';

export interface QuoteRequestItem {
  id: string;
  productId: string;
  productTitle: string;
  productSku: string;
  unitCode: string;
  requestedQuantity: number;
  targetPriceMinor?: number;
  quotedUnitPriceMinor?: number;
  assignedVendorId?: string;
  assignedVendorName?: string;
  notes?: string;
}

export interface QuoteRequest {
  id: string;
  referenceCode: string;
  requesterUserId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone: string;
  companyName?: string;
  status: QuoteStatus;
  currency: string;
  destinationAddress: {
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    siteContactPhone: string;
  };
  requiredByDate?: string;
  projectNotes?: string;
  items: QuoteRequestItem[];
  quotedSubtotalMinor?: number;
  quotedDeliveryFeeMinor?: number;
  validUntil?: string;
  submittedAt: string;
  quotedAt?: string;
  acceptedAt?: string;
}

export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'processing'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'cancelled'
  | 'refunded';

export type FulfillmentStatus =
  | 'pending'
  | 'ready_to_ship'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'delivery_exception'
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  vendorId?: string;
  productTitle: string;
  sku: string;
  unitCode: string;
  quantity: number;
  unitPriceMinor: number;
  lineSubtotalMinor: number;
  currency: string;
  carrierName?: string;
  trackingNumber?: string;
  fulfillmentStatus: FulfillmentStatus;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  sourceQuoteId?: string;
  status: OrderStatus;
  currency: string;
  subtotalMinor: number;
  shippingTotalMinor: number;
  taxTotalMinor: number;
  grandTotalMinor: number;
  shippingAddress: {
    recipientName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export type VendorApplicationStatus = 
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'needs_information'
  | 'approved'
  | 'rejected'
  | 'suspended';

export interface VendorApplication {
  id: string;
  applicantUserId: string;
  applicantName: string;
  legalBusinessName: string;
  tradeName: string;
  businessEmail: string;
  businessPhone: string;
  registrationNumber: string; // GSTIN / Business Reg
  taxId: string;
  countryCode: string;
  operatingCategories: string[];
  businessAddress: string;
  status: VendorApplicationStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewReason?: string;
}

export interface CommissionRule {
  id: string;
  name: string;
  ratePercent: number;
  calculationBasis: 'subtotal' | 'subtotal_plus_tax' | 'grand_total';
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
}

export interface AuditEvent {
  id: string;
  actorUserId: string;
  actorName: string;
  actorType: 'customer' | 'vendor' | 'admin' | 'system';
  action: string;
  entityType: string;
  entityId: string;
  reason?: string;
  timestamp: string;
}
