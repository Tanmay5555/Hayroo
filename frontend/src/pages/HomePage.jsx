import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  Laptop,
  Smartphone,
  Headphones,
  Shirt,
  Apple,
  BookOpen,
  ShieldCheck,
  Split,
  Truck,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import QuickViewModal from '../components/QuickViewModal';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';
import { generateWebSiteSchema } from '../utils/schemaGenerator';

const CATEGORIES_LIST = [
  { name: 'Computers', label: 'Computers', scope: 'Laptops & workstations', icon: Laptop },
  { name: 'Phone & Tablets', label: 'Phones & Tablets', scope: 'Smartphones & iPads', icon: Smartphone },
  { name: 'Electronics', label: 'Audio & Tech', scope: 'Headphones & DACs', icon: Headphones },
  { name: 'Fashion & Apparel', label: 'Apparel', scope: 'Silk, denim & footwear', icon: Shirt },
  { name: 'Grocery & Gourmet Foods', label: 'Gourmet & Pantry', scope: 'Coffee, tea & staples', icon: Apple },
  { name: 'Books', label: 'Books', scope: 'Fiction & non-fiction', icon: BookOpen },
];

const TRUST_PILLARS = [
  {
    code: '01',
    icon: ShieldCheck,
    title: 'T+7 Escrow Protection',
    detail: 'Seller payouts remain in protected escrow until seven days after doorstep delivery confirmation.',
  },
  {
    code: '02',
    icon: Split,
    title: 'Multi-Seller Split Checkout',
    detail: 'Combine products from multiple independent vendors into one unified cart with itemized tracking.',
  },
  {
    code: '03',
    icon: Truck,
    title: 'Doorstep OTP Sign-Off',
    detail: 'High-value dispatches require recipient verification codes and include official GST tax invoices.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  useSeo({
    title: 'Curated Electronics, Apparel & Everyday Essentials',
    description: 'Discover verified independent vendors and official distributors in one unified checkout with T+7 escrow protection.',
    canonicalPath: '/',
    jsonLd: generateWebSiteSchema(),
  });

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [quickViewProd, setQuickViewProd] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const [featuredRes, productsRes] = await Promise.all([
          apiClient.get('/products?sort=rating_desc&limit=8').catch(() => ({ data: { data: [] } })),
          apiClient.get('/products?sort=newest&limit=6').catch(() => ({ data: { data: [] } })),
        ]);
        if (isMounted) {
          setFeaturedProducts(featuredRes.data?.data || []);
          setNewArrivals(productsRes.data?.data || []);
        }
      } catch {
        // graceful fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchHomeData();
    return () => {
      isMounted = false;
    };
  }, []);

  const spotlightProduct = featuredProducts[0] || {
    title: 'MacBook Pro 16" with M3 Silicon',
    description: 'Workstation-grade laptop for software engineering, studio editing, and all-day battery life.',
    price: 249900,
    slug: 'macbook-pro-16-m3-max-36gb-1tb',
    brand: 'Apple',
    category: 'Computers',
    imageLight: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
  };

  return (
    <div className="pb-16">
      
      {/* 1. Editorial Split Hero */}
      <section aria-labelledby="hero-heading" className="border-b border-[var(--color-border)] bg-[var(--color-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs font-medium text-[var(--color-primary)] tracking-wide">
                Curated Multi-Vendor Marketplace
              </p>

              <h1
                id="hero-heading"
                className="text-3xl sm:text-4xl lg:text-[44px] font-semibold text-[var(--color-text)] tracking-[-0.025em] leading-[1.15]"
              >
                Dependable hardware and everyday essentials, direct from verified sellers.
              </h1>

              <p className="text-sm sm:text-[15px] text-[var(--color-text-muted)] max-w-xl leading-relaxed">
                Shop across authorized electronics distributors, independent makers, and pantry staples in a single unified checkout backed by T+7 escrow protection.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/products" className="btn-primary">
                  Browse catalog <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>

                <a href="#categories" className="btn-secondary">
                  Explore categories
                </a>
              </div>

              <div className="pt-4 border-t border-[var(--color-border-subtle)] flex flex-wrap gap-x-6 gap-y-2 text-xs text-[var(--color-text-subtle)]">
                <span>Free shipping over ₹999</span>
                <span>1-year brand warranty</span>
                <span>GST invoices on every order</span>
              </div>
            </div>

            {/* Right Column: Spotlight Item Frame */}
            <div className="lg:col-span-5">
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] p-5 space-y-4">
                <div className="flex items-center justify-between text-[11px] text-[var(--color-text-subtle)]">
                  <span className="font-medium text-[var(--color-text-muted)]">
                    Featured Spotlight · {spotlightProduct.brand || 'Official'}
                  </span>
                  <span>Ready to ship</span>
                </div>

                <Link
                  to={`/product/${spotlightProduct.slug || spotlightProduct._id || ''}`}
                  className="block aspect-[16/10] bg-[var(--color-card)] rounded-md border border-[var(--color-border-subtle)] p-4 flex items-center justify-center overflow-hidden"
                >
                  <img
                    src={spotlightProduct.imageLight || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80'}
                    alt={spotlightProduct.title}
                    className="max-h-full max-w-full object-contain"
                    loading="eager"
                  />
                </Link>

                <div className="space-y-1">
                  <h2 className="text-sm font-semibold text-[var(--color-text)] line-clamp-1">
                    {spotlightProduct.title}
                  </h2>
                  <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed">
                    {spotlightProduct.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                  <div className="tabular-nums">
                    <span className="text-[11px] text-[var(--color-text-subtle)] block">Price</span>
                    <span className="text-base font-semibold text-[var(--color-text)]">
                      ₹{(spotlightProduct.price || 0).toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link
                    to={`/product/${spotlightProduct.slug || spotlightProduct._id || ''}`}
                    className="btn-secondary btn-sm"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Categories Index Grid */}
      <section id="categories" aria-labelledby="categories-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 id="categories-heading" className="text-lg font-semibold text-[var(--color-text)]">
              Categories
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Browse verified inventory by department
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
          >
            All departments <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {CATEGORIES_LIST.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                className="text-left p-4 rounded-md bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-text-subtle)] transition-colors cursor-pointer group space-y-3"
              >
                <Icon className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" aria-hidden="true" />
                <div>
                  <h3 className="text-[13px] font-semibold text-[var(--color-text)]">
                    {cat.label}
                  </h3>
                  <p className="text-[11px] text-[var(--color-text-subtle)] mt-0.5 line-clamp-1">
                    {cat.scope}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section aria-labelledby="featured-products-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 id="featured-products-heading" className="text-lg font-semibold text-[var(--color-text)]">
              Featured Catalog
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Selected hardware and essentials verified for warranty and reliability
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
          >
            Explore all <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <ProductSkeleton count={4} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {featuredProducts.slice(0, 8).map((prod) => (
              <ProductCard
                key={prod._id || prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProd(p)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-xs text-[var(--color-text-muted)]">
            <p>Featured selections are currently loading or unavailable.</p>
            <Link to="/products" className="btn-secondary btn-sm mt-3 inline-flex">
              Browse full catalog
            </Link>
          </div>
        )}
      </section>

      {/* 4. Operational Buyer Protection Strip (Quiet Hairline Table Architecture) */}
      <section aria-label="Marketplace Standards" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[var(--color-border)]">
          {TRUST_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div key={pillar.code} className="p-6 space-y-2.5">
                <div className="flex items-center justify-between text-[11px] font-mono text-[var(--color-text-subtle)]">
                  <span>{pillar.code}</span>
                  <Icon className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-text)]">
                  {pillar.title}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
                  {pillar.detail}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. New Arrivals (2-Column Horizontal List Layout for Distinct Visual Rhythm) */}
      <section aria-labelledby="new-arrivals-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="flex items-baseline justify-between mb-5">
          <div>
            <h2 id="new-arrivals-heading" className="text-lg font-semibold text-[var(--color-text)]">
              Recent Additions
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Newly cataloged items ready for dispatch
            </p>
          </div>

          <Link
            to="/products?sort=newest"
            className="text-xs font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
          >
            View newest <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <ProductSkeleton count={2} viewMode="list" />
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {newArrivals.slice(0, 6).map((prod) => (
              <ProductCard
                key={prod._id || prod.id}
                product={prod}
                viewMode="list"
                onQuickView={(p) => setQuickViewProd(p)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-xs text-[var(--color-text-muted)]">
            <p>New catalog items will appear here shortly.</p>
          </div>
        )}
      </section>

      {/* Quick View Modal Overlay */}
      {quickViewProd && (
        <QuickViewModal product={quickViewProd} onClose={() => setQuickViewProd(null)} />
      )}
    </div>
  );
}
