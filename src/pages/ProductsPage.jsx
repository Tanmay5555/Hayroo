import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  LayoutGrid,
  List,
  X,
  Filter,
  RotateCcw,
  PackageX,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import QuickViewModal from '../components/QuickViewModal';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';

const CATEGORIES = [
  'All',
  'Computers',
  'Phone/Tablets',
  'Audio',
  'Wearables',
  'Smart Home',
  'Accessories',
];

const BRANDS = [
  'All',
  'Apple',
  'Samsung',
  'Sony',
  'Dell',
  'Bose',
  'Logitech',
  'Anker',
  'ASUS',
  'Google',
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL Query Sync
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [maxPrice, setMaxPrice] = useState(300000);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortOption, setSortOption] = useState(initialSort);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  useSeo({
    title: selectedCategory !== 'All' ? `${selectedCategory} Products` : 'Shop Quality Electronics & Everyday Essentials',
    description: `Explore Hayroo catalog of ${selectedCategory !== 'All' ? selectedCategory : 'dependable everyday electronics and home essentials'} with 1-year brand warranty and express delivery.`,
    canonicalPath: '/products',
  });

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [quickViewProd, setQuickViewProd] = useState(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Sync state when URL params change (e.g. from navbar navigation)
  useEffect(() => {
    const cat = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort');

    if (cat) setSelectedCategory(cat);
    if (search !== null) setSearchQuery(search);
    if (sort) setSortOption(sort);
  }, [searchParams]);

  // Fetch filtered catalog
  const fetchProducts = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', 12);
      if (selectedCategory && selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedBrand && selectedBrand !== 'All') params.append('brand', selectedBrand);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (maxPrice < 300000) params.append('maxPrice', maxPrice);
      if (onlyInStock) params.append('inStock', 'true');
      if (sortOption) params.append('sort', sortOption);

      const res = await apiClient.get(`/products?${params.toString()}`);
      setProducts(res.data.data || []);
      if (res.data.meta) setPagination(res.data.meta);
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, selectedBrand, searchQuery, maxPrice, onlyInStock, sortOption]);

  useEffect(() => {
    fetchProducts(1);
  }, [fetchProducts]);

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSelectedBrand('All');
    setSearchQuery('');
    setMaxPrice(300000);
    setOnlyInStock(false);
    setSortOption('newest');
    setSearchParams({});
  };

  const hasActiveFilters =
    selectedCategory !== 'All' ||
    selectedBrand !== 'All' ||
    searchQuery.trim() !== '' ||
    maxPrice < 300000 ||
    onlyInStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header and Controls Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-[var(--color-text)]">
            Product Catalog
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            Showing {pagination.total || products.length} dependable items
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Mobile Filter Drawer Trigger */}
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="md:hidden btn-secondary btn-sm flex items-center gap-1.5"
            aria-label="Open filter options"
          >
            <Filter className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
            Filters {hasActiveFilters && '(Active)'}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <label htmlFor="sort-dropdown" className="text-xs text-[var(--color-text-muted)] font-medium hidden sm:inline">
              Sort:
            </label>
            <select
              id="sort-dropdown"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="form-select text-xs py-2 px-3 rounded-md border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] font-medium cursor-pointer"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Customer Rating</option>
            </select>
          </div>

          {/* Grid vs List View Mode Toggle */}
          <div className="hidden sm:inline-flex items-center rounded-md border border-[var(--color-border)] bg-[var(--color-card)] p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
              className={`p-1.5 rounded-sm transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="List view"
              className={`p-1.5 rounded-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              }`}
            >
              <List className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[var(--color-text-muted)] font-semibold">Active Filters:</span>
          {selectedCategory !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-primary)] font-semibold">
              Category: {selectedCategory}
              <button
                type="button"
                onClick={() => setSelectedCategory('All')}
                aria-label="Remove category filter"
                className="hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {selectedBrand !== 'All' && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-primary)] font-semibold">
              Brand: {selectedBrand}
              <button
                type="button"
                onClick={() => setSelectedBrand('All')}
                aria-label="Remove brand filter"
                className="hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-primary)] font-semibold">
              Search: "{searchQuery}"
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Remove search query"
                className="hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {maxPrice < 300000 && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-primary)] font-semibold">
              Under ₹{maxPrice.toLocaleString('en-IN')}
              <button
                type="button"
                onClick={() => setMaxPrice(300000)}
                aria-label="Remove price filter"
                className="hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          {onlyInStock && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-primary)] font-semibold">
              In Stock Only
              <button
                type="button"
                onClick={() => setOnlyInStock(false)}
                aria-label="Remove stock filter"
                className="hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={handleClearFilters}
            className="text-[var(--color-primary)] hover:underline font-bold text-xs ml-1"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid: Sidebar + Products List */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Desktop Sidebar Filter Panel */}
        <aside
          aria-label="Product filters"
          className="hidden md:block card p-5 space-y-6 sticky top-20 border-[var(--color-border)]"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
              Filter Catalog
            </h2>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="text-xs text-[var(--color-primary)] hover:underline font-semibold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Keyword Search */}
          <div className="space-y-2">
            <label htmlFor="sidebar-keyword" className="form-label text-xs">
              Keyword
            </label>
            <div className="relative">
              <input
                id="sidebar-keyword"
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-xs py-2 pl-8 pr-3"
              />
              <Search className="w-3.5 h-3.5 text-[var(--color-text-subtle)] absolute left-2.5 top-3" aria-hidden="true" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
            <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
              Categories
            </h3>
            <div className="space-y-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedCategory === cat
                      ? 'bg-[var(--color-primary)] text-white font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
            <h3 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
              Brands
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {BRANDS.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => setSelectedBrand(brand)}
                  className={`text-left px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    selectedBrand === brand
                      ? 'bg-[var(--color-bg-subtle)] text-[var(--color-primary)] border border-[var(--color-primary)] font-bold'
                      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2 pt-4 border-t border-[var(--color-border)]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[var(--color-text)] uppercase tracking-wider">Max Price</span>
              <span className="font-bold text-[var(--color-primary)]">
                ₹{maxPrice.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min="1000"
              max="300000"
              step="5000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[var(--color-primary)] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[var(--color-text-subtle)]">
              <span>₹1,000</span>
              <span>₹3,00,000</span>
            </div>
          </div>

          {/* Stock Filter Toggle */}
          <div className="pt-4 border-t border-[var(--color-border)]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text)]">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="rounded accent-[var(--color-primary)] w-4 h-4 cursor-pointer"
              />
              <span>In-Stock Products Only</span>
            </label>
          </div>
        </aside>

        {/* Mobile Filter Drawer Modal */}
        {isMobileFilterOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter Options"
            className="fixed inset-0 z-50 md:hidden flex flex-col bg-[var(--color-card)]"
          >
            <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
              <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--color-primary)]" />
                Filters
              </h2>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="p-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Category */}
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text)] uppercase mb-2">Category</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-2 rounded-md text-xs font-medium text-left ${
                        selectedCategory === cat
                          ? 'bg-[var(--color-primary)] text-white font-bold'
                          : 'bg-[var(--color-bg-subtle)] text-[var(--color-text)]'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Brand */}
              <div>
                <h3 className="text-xs font-bold text-[var(--color-text)] uppercase mb-2">Brand</h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {BRANDS.map((brand) => (
                    <button
                      key={brand}
                      type="button"
                      onClick={() => setSelectedBrand(brand)}
                      className={`px-3 py-2 rounded-md text-xs font-medium text-left ${
                        selectedBrand === brand
                          ? 'bg-[var(--color-primary)] text-white font-bold'
                          : 'bg-[var(--color-bg-subtle)] text-[var(--color-text)]'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-[var(--color-text)] uppercase">Max Price</span>
                  <span className="font-bold text-[var(--color-primary)]">₹{maxPrice.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="300000"
                  step="5000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[var(--color-primary)]"
                />
              </div>

              {/* Stock */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold">
                  <input
                    type="checkbox"
                    checked={onlyInStock}
                    onChange={(e) => setOnlyInStock(e.target.checked)}
                    className="accent-[var(--color-primary)] w-4 h-4"
                  />
                  <span>Show In-Stock Items Only</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--color-border)] flex gap-3">
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-secondary btn-sm flex-1 text-center"
              >
                Reset All
              </button>
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(false)}
                className="btn-primary btn-sm flex-1 text-center"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}

        {/* Products Listing Area */}
        <section aria-labelledby="catalog-products-section" className="md:col-span-3 space-y-6">
          <h2 id="catalog-products-section" className="sr-only">
            Product Listing Results
          </h2>

          {isLoading ? (
            <ProductSkeleton count={6} viewMode={viewMode} />
          ) : products.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }
            >
              {products.map((prod) => (
                <ProductCard
                  key={prod._id || prod.id}
                  product={prod}
                  viewMode={viewMode}
                  onQuickView={(p) => setQuickViewProd(p)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="card p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-text-muted)] mx-auto flex items-center justify-center">
                <PackageX className="w-6 h-6" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[var(--color-text)]">
                  No products matched your criteria
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] max-w-sm mx-auto">
                  Try adjusting your price range, clearing brand or category filters, or searching with broader terms.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className="btn-primary btn-sm inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.pages > 1 && (
            <nav
              aria-label="Pagination Navigation"
              className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between text-xs"
            >
              <button
                type="button"
                onClick={() => fetchProducts(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="btn-secondary btn-sm"
              >
                Previous Page
              </button>

              <span className="text-[var(--color-text-muted)] font-medium">
                Page {pagination.page} of {pagination.pages}
              </span>

              <button
                type="button"
                onClick={() => fetchProducts(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="btn-secondary btn-sm"
              >
                Next Page
              </button>
            </nav>
          )}
        </section>

      </div>

      {/* Quick View Modal Overlay */}
      {quickViewProd && (
        <QuickViewModal product={quickViewProd} onClose={() => setQuickViewProd(null)} />
      )}
    </div>
  );
}
