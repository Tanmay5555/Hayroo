import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  Laptop,
  Smartphone,
  Headphones,
  Watch,
  Home as HomeIcon,
  Package,
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Shirt,
  Apple,
  BookOpen,
  Sparkles,
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import QuickViewModal from '../components/QuickViewModal';
import apiClient from '../api/axios';
import { useSeo } from '../hooks/useSeo';
import { generateWebSiteSchema } from '../utils/schemaGenerator';

const CATEGORIES_LIST = [
  { name: 'Computers', label: 'Computers & Desktops', icon: Laptop, count: 'Laptops, Workstations & M3 Macs' },
  { name: 'Phone & Tablets', label: 'Smartphones & Tablets', icon: Smartphone, count: 'iPhones, Flagship Android & iPads' },
  { name: 'Electronics', label: 'Headphones & Audio', icon: Headphones, count: 'ANC Headphones, Earbuds & DACs' },
  { name: 'Fashion & Apparel', label: 'Fashion & Apparel', icon: Shirt, count: 'Artisanal Silk, Denim & Footwear' },
  { name: 'Grocery & Gourmet Foods', label: 'Grocery & Gourmet', icon: Apple, count: 'Organic Coffee, Tea & Superfoods' },
  { name: 'Books', label: 'Books & Literature', icon: BookOpen, count: 'Bestsellers, Fiction & Productivity' },
];

export default function HomePage() {
  const navigate = useNavigate();

  useSeo({
    title: 'Quality Everyday Electronics & Home Essentials',
    description: 'Dependable, curated electronics and home essentials for every age. Fast delivery, 1-year authentic warranty, and fair prices.',
    canonicalPath: '/',
    jsonLd: generateWebSiteSchema(),
  });

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [quickViewProd, setQuickViewProd] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch catalog data from backend API
  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      setIsLoading(true);
      try {
        const [featuredRes, productsRes] = await Promise.all([
          apiClient.get('/products/featured').catch(() => ({ data: { data: [] } })),
          apiClient.get('/products?limit=8').catch(() => ({ data: { data: [] } })),
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

  return (
    <div className="space-y-14 pb-16">
      
      {/* 1. Hero Section: Specific, Honest Copy with Clear CTA */}
      <section aria-labelledby="hero-heading" className="pt-6 sm:pt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card p-6 sm:p-10 lg:p-12 border border-[var(--color-border)] bg-[var(--color-card)] relative overflow-hidden">
            
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Clear Value Proposition */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                  ApexBazaar Multi-Vendor Marketplace
                </div>

                <h1 id="hero-heading" className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-[var(--color-text)] tracking-tight leading-tight">
                  100k+ Products Across Electronics, Fashion, Grocery & Books.
                </h1>

                <p className="text-sm sm:text-base text-[var(--color-text-muted)] max-w-xl leading-relaxed">
                  Discover verified independent vendors, artisanal brands, and direct distributors in a single unified checkout. Every transaction is backed by our strict T+7 days escrow buyer protection guarantee.
                </p>

                {/* Feature Bullet Points */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[var(--color-text)] font-medium">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                    <span>T+7 Days Escrow Buyer Protection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                    <span>Atomic Multi-Seller Split Checkout</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                    <span>Free Shipping on Orders Over ₹999</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-primary)] shrink-0" aria-hidden="true" />
                    <span>Doorstep OTP Delivery Sign-off</span>
                  </div>
                </div>

                {/* Action Buttons (Strictly 6px rounded corners, NO pills) */}
                <div className="flex flex-wrap items-center gap-3 pt-3">
                  <Link
                    to="/products"
                    className="btn-primary"
                  >
                    Browse Catalog <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </Link>

                  <a
                    href="#categories"
                    className="btn-secondary"
                  >
                    Explore Categories
                  </a>
                </div>
              </div>

              {/* Right Column: Featured Product Highlight */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="w-full max-w-md p-6 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[var(--color-primary)] uppercase tracking-wider">
                      Featured Spotlight
                    </span>
                    <span className="text-[11px] text-[var(--color-text-subtle)] font-medium">
                      In Stock • Ready to Ship
                    </span>
                  </div>

                  <div className="aspect-video bg-[var(--color-card)] rounded-md border border-[var(--color-border)] p-4 flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80"
                      alt="Curated Laptop and Workstation Essentials"
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-[var(--color-text)]">
                      MacBook Pro 16" with M3 Silicon
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 line-clamp-2">
                      High-performance workstation for coding, business multitasking, and creative workflows with all-day battery life.
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[var(--color-text-subtle)] block">Starting price</span>
                      <span className="text-lg font-bold text-[var(--color-text)]">₹2,49,900</span>
                    </div>

                    <Link
                      to="/product/macbook-pro-16-m3-max-36gb-1tb"
                      className="btn-secondary btn-sm"
                    >
                      View Specs
                    </Link>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 2. Featured Categories Section */}
      <section id="categories" aria-labelledby="categories-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="categories-heading" className="text-2xl font-bold font-heading text-[var(--color-text)]">
              Shop by Category
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Browse products organized by your daily requirements
            </p>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            All Categories <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {CATEGORIES_LIST.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigate(`/products?category=${encodeURIComponent(cat.name)}`)}
                className="card p-4 text-center flex flex-col items-center justify-center space-y-2.5 hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-subtle)] transition-all cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-md bg-[var(--color-bg-subtle)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)] group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-[var(--color-text)] group-hover:text-[var(--color-primary)] transition-colors">
                    {cat.label}
                  </h3>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Featured Products Grid */}
      <section aria-labelledby="featured-products-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-[var(--color-primary)] text-white">
              <TrendingUp className="w-4 h-4" aria-hidden="true" />
            </div>
            <div>
              <h2 id="featured-products-heading" className="text-2xl font-bold font-heading text-[var(--color-text)]">
                Featured Products
              </h2>
              <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                Popular selections rigorously checked for quality and reliability
              </p>
            </div>
          </div>

          <Link
            to="/products"
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            Explore All <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <ProductSkeleton count={4} />
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
            <p>No featured products available at this moment.</p>
            <Link to="/products" className="btn-secondary btn-sm mt-3 inline-block">
              View All Catalog Items
            </Link>
          </div>
        )}
      </section>

      {/* 4. Value Commitment Banner (Zero purple gradients, strictly 8px corners) */}
      <section aria-label="Store Guarantees" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="card p-6 sm:p-8 bg-[#047857] text-[#FFFFFF] border border-[#065F46] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A7F3D0] bg-[#065F46] px-2.5 py-0.5 rounded-md inline-block">
              Hayroo Promise
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-[#FFFFFF]">
              Direct Brand Warranty and Fair Pricing
            </h2>
            <p className="text-xs sm:text-sm text-[#A7F3D0] leading-relaxed">
              Every order comes with genuine brand verification and straightforward support. Use code <span className="font-bold underline text-white">HAYROO10</span> at checkout for an instant 10% discount on your order.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <Link
              to="/products"
              className="px-5 py-2.5 bg-[#FFFFFF] text-[#047857] hover:bg-[#FFFBEB] font-bold text-xs rounded-md shadow-sm transition-colors"
            >
              Shop Discounted Essentials
            </Link>
          </div>
        </div>
      </section>

      {/* 5. New Arrivals Grid */}
      <section aria-labelledby="new-arrivals-heading" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 id="new-arrivals-heading" className="text-2xl font-bold font-heading text-[var(--color-text)]">
              New Arrivals
            </h2>
            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
              Recently cataloged products ready for dispatch
            </p>
          </div>

          <Link
            to="/products?sort=newest"
            className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            View Newest <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {isLoading ? (
          <ProductSkeleton count={4} />
        ) : newArrivals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newArrivals.slice(0, 8).map((prod) => (
              <ProductCard
                key={prod._id || prod.id}
                product={prod}
                onQuickView={(p) => setQuickViewProd(p)}
              />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center text-xs text-[var(--color-text-muted)]">
            <p>New catalog arrivals will appear here shortly.</p>
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
