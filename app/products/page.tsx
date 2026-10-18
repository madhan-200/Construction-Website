'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/lib/context/AppContext';
import { store } from '@/lib/db/store';
import { Category, Product } from '@/lib/types';
import ProductCard from '@/components/ProductCard';
import { Search, Filter, Shield, Building2, SlidersHorizontal, X } from 'lucide-react';

function ProductsContent() {
  const { locale, dict } = useApp();
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialQuery = searchParams.get('q') || '';

  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [ownerFilter, setOwnerFilter] = useState<'all' | 'platform' | 'vendor'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc'>('featured');

  const [categories, setCategories] = useState<Category[]>(() => store.getCategories());
  const [allProducts, setAllProducts] = useState<Product[]>(() => store.getProducts({ onlyApproved: true }));

  useEffect(() => {
    const handleCategoriesUpdate = () => {
      setCategories(store.getCategories());
    };
    const handleProductsUpdate = () => {
      setAllProducts(store.getProducts({ onlyApproved: true }));
    };

    window.addEventListener('categories-updated', handleCategoriesUpdate);
    window.addEventListener('products-updated', handleProductsUpdate);

    return () => {
      window.removeEventListener('categories-updated', handleCategoriesUpdate);
      window.removeEventListener('products-updated', handleProductsUpdate);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    let result = allProducts;

    if (selectedCategory) {
      const cat = categories.find(c => c.slug === selectedCategory);
      if (cat) {
        result = result.filter(p => p.categoryId === cat.id);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.titleEn.toLowerCase().includes(q) ||
        p.titleTa.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.descriptionEn.toLowerCase().includes(q)
      );
    }

    if (ownerFilter !== 'all') {
      result = result.filter(p => p.ownerType === ownerFilter);
    }

    if (sortBy === 'price-asc') {
      result = [...result].sort((a, b) => a.unitPriceMinor - b.unitPriceMinor);
    } else if (sortBy === 'price-desc') {
      result = [...result].sort((a, b) => b.unitPriceMinor - a.unitPriceMinor);
    }

    return result;
  }, [allProducts, selectedCategory, searchQuery, ownerFilter, sortBy, categories]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="border-b border-industrial-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs font-mono font-bold text-safety-orange uppercase tracking-wider mb-1">
            {locale === 'ta' ? 'அனைத்து கட்டுமான பொருட்கள்' : 'Procurement Catalog'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {dict.nav.allProducts}
          </h1>
          <p className="text-xs text-industrial-400 mt-1">
            {filteredProducts.length} {locale === 'ta' ? 'பொருட்கள் கிடைக்கின்றன' : 'verified materials available for dispatch'}
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict.common.searchPlaceholder}
            className="w-full bg-industrial-900 border border-industrial-700 rounded py-2 pl-9 pr-8 text-xs text-white placeholder-industrial-500 focus:outline-none focus:border-safety-orange"
          />
          <Search className="w-4 h-4 text-industrial-500 absolute left-3 top-1/2 -translate-y-1/2" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-industrial-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-industrial-900/60 border border-industrial-800 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-3 py-1.5 rounded font-mono font-semibold transition ${
              selectedCategory === ''
                ? 'bg-safety-orange text-white'
                : 'bg-industrial-800 text-industrial-300 hover:text-white'
            }`}
          >
            {locale === 'ta' ? 'அனைத்தும்' : 'All Divisions'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-3 py-1.5 rounded font-mono font-semibold transition ${
                selectedCategory === cat.slug
                  ? 'bg-safety-orange text-white'
                  : 'bg-industrial-800 text-industrial-300 hover:text-white'
              }`}
            >
              {locale === 'ta' && cat.nameTa ? cat.nameTa : cat.nameEn}
            </button>
          ))}
        </div>

        {/* Origin & Sorting Dropdowns */}
        <div className="flex items-center gap-3">
          {/* Owner Filter */}
          <div className="flex items-center gap-1 bg-industrial-950 border border-industrial-800 rounded p-1">
            <button
              onClick={() => setOwnerFilter('all')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold ${ownerFilter === 'all' ? 'bg-industrial-800 text-white' : 'text-industrial-400'}`}
            >
              All
            </button>
            <button
              onClick={() => setOwnerFilter('platform')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${ownerFilter === 'platform' ? 'bg-safety-orange text-white' : 'text-industrial-400'}`}
            >
              <Shield className="w-3 h-3" />
              Platform
            </button>
            <button
              onClick={() => setOwnerFilter('vendor')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 ${ownerFilter === 'vendor' ? 'bg-blue-600 text-white' : 'text-industrial-400'}`}
            >
              <Building2 className="w-3 h-3" />
              Vendor
            </button>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-industrial-950 border border-industrial-800 text-industrial-300 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-safety-orange"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-industrial-900 border border-industrial-800 rounded-lg p-12 text-center space-y-3">
          <SlidersHorizontal className="w-8 h-8 text-industrial-500 mx-auto" />
          <h3 className="text-base font-bold text-white">
            {locale === 'ta' ? 'பொருட்கள் எதுவும் கிடைக்கவில்லை' : 'No materials found matching criteria'}
          </h3>
          <p className="text-xs text-industrial-400 max-w-sm mx-auto">
            Try adjusting your search terms or resetting the category filter.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearchQuery('');
              setOwnerFilter('all');
            }}
            className="bg-industrial-800 hover:bg-industrial-700 text-white text-xs font-semibold px-4 py-2 rounded transition"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-industrial-400">Loading catalog...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
