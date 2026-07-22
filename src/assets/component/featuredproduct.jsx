import { useState } from 'react';
import products from '../data/product';
import ProductCard from './productcard';
import { ArrowUpDown, Filter } from 'lucide-react';

export default function FeaturedProduct({
  activeCategory = 'All',
  searchQuery = '',
  onSelectProduct,
  onAddToCart,
  onToggleWishlist,
  wishlistIds = [],
  onQuickView,
}) {
  const [sortBy, setSortBy] = useState('default');
  const [priceRange, setPriceRange] = useState('all');

  // Filter products dynamically
  let filtered = products.filter((item) => {
    // 1. Category Filter
    let matchesCategory = true;
    if (activeCategory && activeCategory !== 'All') {
      const catLower = activeCategory.toLowerCase();
      const itemCatLower = (item.category || '').toLowerCase();
      const titleLower = item.title.toLowerCase();

      matchesCategory = itemCatLower === catLower || titleLower.includes(catLower);
    }

    // 2. Search Query Filter
    let matchesSearch = true;
    if (searchQuery.trim() !== '') {
      const queryLower = searchQuery.toLowerCase();
      matchesSearch = item.title.toLowerCase().includes(queryLower);
    }

    // 3. Price Range Filter
    let matchesPrice = true;
    const numPrice = typeof item.price === 'number' 
      ? item.price 
      : (parseFloat(String(item.price).replace(/,/g, '')) || 0);

    if (priceRange === 'under-500') matchesPrice = numPrice < 500;
    else if (priceRange === '500-1500') matchesPrice = numPrice >= 500 && numPrice <= 1500;
    else if (priceRange === 'above-1500') matchesPrice = numPrice > 1500;

    return matchesCategory && matchesSearch && matchesPrice;
  });

  // Sort products dynamically
  if (sortBy === 'low-high') {
    filtered.sort((a, b) => {
      const pa = typeof a.price === 'number' ? a.price : (parseFloat(String(a.price).replace(/,/g, '')) || 0);
      const pb = typeof b.price === 'number' ? b.price : (parseFloat(String(b.price).replace(/,/g, '')) || 0);
      return pa - pb;
    });
  } else if (sortBy === 'high-low') {
    filtered.sort((a, b) => {
      const pa = typeof a.price === 'number' ? a.price : (parseFloat(String(a.price).replace(/,/g, '')) || 0);
      const pb = typeof b.price === 'number' ? b.price : (parseFloat(String(b.price).replace(/,/g, '')) || 0);
      return pb - pa;
    });
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return (
    <section id="featured-products" className="bg-gray-50 py-8 dark:bg-gray-900 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        
        {/* Section Header & Filter Controls Bar */}
        <div className="mb-6 space-y-4 border-b border-gray-200 dark:border-gray-800 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {searchQuery ? `Search Results for "${searchQuery}"` : activeCategory !== 'All' ? `${activeCategory} Products` : 'Featured Products'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Showing {filtered.length} of {products.length} products
              </p>
            </div>

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 hidden sm:inline">Sort By:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs font-semibold border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none cursor-pointer shadow-xs"
              >
                <option value="default">Featured / Default</option>
                <option value="low-high">Price: Low to High</option>
                <option value="high-low">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Price Range Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 pb-1">
            <Filter className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">Price:</span>
            {[
              { id: 'all', label: 'All Prices' },
              { id: 'under-500', label: 'Under ₹500' },
              { id: '500-1500', label: '₹500 - ₹1,500' },
              { id: 'above-1500', label: 'Above ₹1,500' },
            ].map((chip) => (
              <button
                key={chip.id}
                onClick={() => setPriceRange(chip.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  priceRange === chip.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid layout container */}
        {filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                title={item.title}
                price={item.price}
                imageLight={item.imageLight}
                imageDark={item.imageDark}
                discountTag={item.discountTag}
                rating={item.rating}
                reviewsCount={item.reviewsCount}
                features={item.features}
                isFavorite={wishlistIds.includes(item.id)}
                onSelect={() => onSelectProduct && onSelectProduct(item)}
                onAddToCart={() => onAddToCart && onAddToCart(item)}
                onQuickLook={() => onQuickView && onQuickView(item)}
                onFavorite={() => onToggleWishlist && onToggleWishlist(item)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">No products match your filters</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Try changing your price filter or search keywords.
            </p>
            <button
              onClick={() => {
                setPriceRange('all');
                setSortBy('default');
              }}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
