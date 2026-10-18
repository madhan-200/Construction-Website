import { createBrowserClient } from '@supabase/ssr';
import { Product, Category, QuoteRequest, Order, VendorApplication, CommissionRule, AuditEvent } from '@/lib/types';
import { INITIAL_CATEGORIES } from './mock-data';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project')) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}

export const supabase = createClient();

// Live Supabase API Services

export async function fetchLiveCategories(): Promise<Category[] | null> {
  const client = createClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error || !data) {
      console.warn('Could not fetch categories from Supabase, falling back to local store:', error?.message);
      return null;
    }

    return data.map((c: any) => {
      const canonical = INITIAL_CATEGORIES.find(ic => ic.slug === c.slug || ic.id === c.id);
      return {
        id: c.id,
        slug: c.slug,
        nameEn: c.name_en,
        nameTa: c.name_ta || c.name_en,
        descriptionEn: c.description_en || canonical?.descriptionEn || '',
        descriptionTa: c.description_ta || canonical?.descriptionTa || '',
        iconName: canonical?.iconName || 'Boxes',
        sortOrder: c.sort_order ?? canonical?.sortOrder ?? 0,
        itemCount: canonical?.itemCount ?? 2,
      };
    });
  } catch (err) {
    console.error('fetchLiveCategories error:', err);
    return null;
  }
}

export async function fetchLiveProducts(options?: { categorySlug?: string; query?: string; onlyApproved?: boolean }): Promise<Product[] | null> {
  const client = createClient();
  if (!client) return null;

  try {
    let queryBuilder = client.from('products').select('*');

    if (options?.onlyApproved ?? true) {
      queryBuilder = queryBuilder.eq('source_status', 'approved').eq('is_active', true);
    }

    const { data, error } = await queryBuilder;

    if (error || !data) {
      console.warn('Could not fetch products from Supabase, falling back to local store:', error?.message);
      return null;
    }

    return data.map((p: any) => ({
      id: p.id,
      sku: p.sku,
      slug: p.slug,
      ownerType: p.owner_type,
      vendorId: p.vendor_id || undefined,
      categoryId: p.category_id,
      titleEn: p.title_en,
      titleTa: p.title_ta || p.title_en,
      descriptionEn: p.description_en || '',
      descriptionTa: p.description_ta || '',
      unitCode: p.unit_code,
      currency: p.currency_code,
      unitPriceMinor: Number(p.unit_price_minor),
      minimumOrderQuantity: Number(p.minimum_order_quantity),
      availableStock: 500, // Live inventory join or default
      sourceStatus: p.source_status,
      availabilityStatus: p.availability_status,
      specifications: p.attributes || {},
      images: getLiveProductImages(p.slug, p.category_id),
      isFeatured: true,
    }));
  } catch (err) {
    console.error('fetchLiveProducts error:', err);
    return null;
  }
}

function getLiveProductImages(slug: string, categoryId?: string): string[] {
  const s = (slug || '').toLowerCase();
  const c = (categoryId || '').toLowerCase();
  if (s.includes('cement') || c.includes('cement')) return ['/images/products/cement-opc53.jpg'];
  if (s.includes('steel') || s.includes('tmt') || s.includes('rebar') || c.includes('steel')) return ['/images/products/steel-tmt-12mm.jpg'];
  if (s.includes('brick') || s.includes('clay') || s.includes('aac') || c.includes('brick')) return ['/images/products/bricks-wirecut.jpg'];
  if (s.includes('mixer') || s.includes('machinery') || c.includes('machinery')) return ['/images/products/mixer-diesel.jpg'];
  if (s.includes('pipe') || s.includes('drainage') || s.includes('plumb') || c.includes('plumb')) return ['/images/products/pipes-upvc.jpg'];
  if (s.includes('cable') || s.includes('power') || s.includes('elect') || c.includes('elect')) return ['/images/products/cable-armoured.jpg'];
  return ['/images/products/cement-opc53.jpg'];
}

function isValidUuid(id?: string): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

export async function insertLiveQuoteRequest(quote: Partial<QuoteRequest>): Promise<boolean> {
  const client = createClient();
  if (!client) return false;

  try {
    const { data: authData } = await client.auth.getUser();
    const userId = authData?.user?.id || (isValidUuid(quote.requesterUserId) ? quote.requesterUserId : null);
    if (!userId) {
      console.info('Live quote saved locally (requires authenticated Supabase user for cloud sync)');
      return false;
    }

    const { error } = await client.from('quote_requests').insert({
      reference_code: quote.referenceCode,
      requester_user_id: userId,
      status: quote.status || 'submitted',
      currency_code: quote.currency || 'INR',
      destination_address: quote.destinationAddress,
      required_by: quote.requiredByDate || null,
      notes: quote.projectNotes || '',
    });

    return !error;
  } catch (err) {
    console.error('insertLiveQuoteRequest error:', err);
    return false;
  }
}

export async function insertLiveOrder(order: Partial<Order>): Promise<boolean> {
  const client = createClient();
  if (!client) return false;

  try {
    const { data: authData } = await client.auth.getUser();
    const userId = authData?.user?.id || (isValidUuid(order.customerId) ? order.customerId : null);
    if (!userId) {
      console.info('Live order saved locally (requires authenticated Supabase user for cloud sync)');
      return false;
    }

    const { error } = await client.from('orders').insert({
      order_number: order.orderNumber,
      customer_user_id: userId,
      status: order.status || 'draft',
      currency_code: order.currency || 'INR',
      subtotal_minor: order.subtotalMinor || 0,
      shipping_total_minor: order.shippingTotalMinor || 0,
      tax_total_minor: order.taxTotalMinor || 0,
      grand_total_minor: order.grandTotalMinor || 0,
      shipping_address_snapshot: order.shippingAddress || {},
      commercial_terms_snapshot: { source: 'staged_web_checkout' },
    });

    return !error;
  } catch (err) {
    console.error('insertLiveOrder error:', err);
    return false;
  }
}

export async function insertLiveVendorApplication(app: Partial<VendorApplication>): Promise<boolean> {
  const client = createClient();
  if (!client) return false;

  try {
    const { data: authData } = await client.auth.getUser();
    const userId = authData?.user?.id || (isValidUuid(app.applicantUserId) ? app.applicantUserId : null);
    if (!userId) {
      console.info('Vendor application saved locally (requires authenticated Supabase user for cloud sync)');
      return false;
    }

    const { error } = await client.from('vendor_applications').insert({
      applicant_user_id: userId,
      status: app.status || 'submitted',
      submitted_payload: {
        legalBusinessName: app.legalBusinessName,
        tradeName: app.tradeName,
        businessEmail: app.businessEmail,
        businessPhone: app.businessPhone,
        registrationNumber: app.registrationNumber,
        taxId: app.taxId,
        countryCode: app.countryCode || 'IN',
        operatingCategories: app.operatingCategories || [],
        businessAddress: app.businessAddress,
      },
    });

    return !error;
  } catch (err) {
    console.error('insertLiveVendorApplication error:', err);
    return false;
  }
}
