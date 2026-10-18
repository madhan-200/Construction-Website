import { Locale } from '@/lib/types';

export function formatCurrency(amountMinor: number, currency = 'INR', locale: Locale = 'en'): string {
  const major = amountMinor / 100;
  try {
    const localeString = locale === 'ta' ? 'ta-IN' : 'en-IN';
    return new Intl.NumberFormat(localeString, {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
}

export function formatDate(dateString: string, locale: Locale = 'en'): string {
  try {
    const localeString = locale === 'ta' ? 'ta-IN' : 'en-IN';
    return new Intl.DateTimeFormat(localeString, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  } catch {
    return dateString;
  }
}
