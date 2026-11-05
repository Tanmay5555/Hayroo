import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Heart,
  Search,
  User,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  Scale,
  Package,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCompareStore } from '../store/useCompareStore';
import ThemeToggle from './ThemeToggle';
import apiClient from '../api/axios';

const NAV_LINKS = [
  { label: 'Home', path: '/' },
  { label: 'All Products', path: '/products' },
  { label: 'Computers', path: '/products?category=Computers' },
  { label: 'Phones', path: '/products?category=Phone%20%26%20Tablets' },
  { label: 'Audio', path: '/products?category=Electronics' },
  { label: 'Fashion', path: '/products?category=Fashion%20%26%20Apparel' },
  { label: 'Grocery', path: '/products?category=Grocery%20%26%20Gourmet%20Foods' },
  { label: '🏪 Seller Portal', path: '/seller' },
  { label: '🚚 Delivery PWA', path: '/delivery' },
  { label: '🛡️ Admin Hub', path: '/admin' },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, logout, setAuthModal } = useAuthStore();
  const { cartItems, setCartDrawerOpen } = useCartStore();
  const { wishlistItems, setWishlistDrawerOpen } = useWishlistStore();
  const { compareItems, setCompareModalOpen } = useCompareStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  const totalCartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // Close mobile menu and dropdowns when navigating to a new route
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname, location.search]);

  // Debounced search query handler
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiClient.get(`/products?search=${encodeURIComponent(searchQuery)}&limit=5`);
        setSearchResults(res.data.data || []);
        setShowSearchDropdown(true);
      } catch {
        // graceful fallback on search network issues
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
      if (isUserMenuOpen && !e.target.closest('#user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Handle Escape key to close mobile menu & search dropdown
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        if (showSearchDropdown) {
          setShowSearchDropdown(false);
        } else if (isMobileMenuOpen) {
          setIsMobileMenuOpen(false);
          hamburgerBtnRef.current?.focus();
        } else if (isUserMenuOpen) {
          setIsUserMenuOpen(false);
        }
      }
    },
    [isMobileMenuOpen, showSearchDropdown, isUserMenuOpen]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchDropdown(false);
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[var(--color-bg)]/95 border-b border-[var(--color-border)] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Name */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2 rounded-md"
            aria-label="ApexBazaar Home"
          >
            {/* Primary Indigo Emblem with A Monogram */}
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md group-hover:bg-indigo-500 transition-colors">
              <span className="text-white font-black text-lg leading-none font-sans">
                A
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight text-[var(--color-text)] font-heading leading-tight">
                ApexBazaar
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-500 uppercase leading-none">
                Multi-Vendor Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Live Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-lg relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative" role="search">
              <label htmlFor="desktop-search" className="sr-only">
                Search products
              </label>
              <input
                id="desktop-search"
                type="search"
                placeholder="Search products, brands, essentials..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                className="w-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-sm rounded-md pl-10 pr-10 py-2 focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
              />
              <Search className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3.5 top-2.5 pointer-events-none" aria-hidden="true" />
              {isSearching && (
                <div
                  className="w-4 h-4 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin absolute right-3.5 top-2.5"
                  aria-label="Loading search results"
                />
              )}
            </form>

            {/* Live Autosuggest Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div
                role="listbox"
                aria-label="Search suggestions"
                className="absolute left-0 right-0 top-full mt-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-lg overflow-hidden z-50 divide-y divide-[var(--color-border)]"
              >
                <div className="p-2 text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider px-4 bg-[var(--color-bg-subtle)]">
                  Matching Products ({searchResults.length})
                </div>
                {searchResults.map((item) => (
                  <button
                    key={item._id}
                    type="button"
                    onClick={() => {
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                      navigate(`/product/${item.slug || item._id}`);
                    }}
                    className="w-full text-left flex items-center gap-3 p-3 hover:bg-[var(--color-bg-subtle)] cursor-pointer transition-colors"
                  >
                    <img
                      src={item.imageLight || '/favicon.svg'}
                      alt=""
                      className="w-10 h-10 object-cover rounded-md bg-[var(--color-bg-subtle)] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">{item.title}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">{item.category} • {item.brand}</p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--color-primary)] shrink-0">
                      ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Dark/Light Mode Toggle */}
            <ThemeToggle />

            {/* Compare Bar Trigger */}
            {compareItems.length > 0 && (
              <button
                type="button"
                onClick={() => setCompareModalOpen(true)}
                className="relative p-2 rounded-md text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors hidden sm:inline-flex"
                title="Compare Products"
                aria-label={`Compare ${compareItems.length} products`}
              >
                <Scale className="w-5 h-5 text-[var(--color-text)]" aria-hidden="true" />
                <span className="absolute -top-1 -right-1 bg-[var(--color-primary)] text-white text-[10px] font-bold w-4 h-4 rounded-md flex items-center justify-center">
                  {compareItems.length}
                </span>
              </button>
            )}

            {/* Wishlist Drawer Trigger */}
            <button
              type="button"
              onClick={() => setWishlistDrawerOpen(true)}
              className="relative p-2 rounded-md text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
              title="Saved Wishlist"
              aria-label={`Wishlist with ${wishlistItems.length} items`}
            >
              <Heart className="w-5 h-5" aria-hidden="true" />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#DC2626] text-white text-[10px] font-bold w-4 h-4 rounded-md flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Cart Drawer Trigger with item count badge (strictly rounded-md, no pill) */}
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="relative inline-flex items-center gap-2 px-3 py-2 rounded-md bg-[var(--color-primary)] text-white font-medium text-xs hover:bg-[var(--color-primary-hover)] active:translate-y-0.5 transition-all shadow-sm focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] focus-visible:outline-offset-2"
              title="Shopping Cart"
              aria-label={`Shopping cart with ${totalCartCount} items`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline font-semibold">Cart</span>
              {totalCartCount > 0 && (
                <span className="bg-white text-[var(--color-primary)] text-[11px] font-bold px-1.5 py-0.2 rounded-md leading-tight">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* User Account / Auth Menu */}
            {user ? (
              <div id="user-menu-container" className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-1.5 p-1 rounded-md hover:bg-[var(--color-bg-subtle)] border border-[var(--color-border)] transition-colors"
                >
                  <div className="w-7 h-7 rounded-md bg-[var(--color-primary)] text-white font-bold flex items-center justify-center text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-xs font-semibold text-[var(--color-text)] hidden lg:inline max-w-[90px] truncate">
                    {user.name ? user.name.split(' ')[0] : 'Account'}
                  </span>
                </button>

                {/* User Menu Dropdown */}
                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-lg py-1.5 z-50 divide-y divide-[var(--color-border)]"
                  >
                    <div className="px-4 py-2">
                      <p className="text-xs font-bold text-[var(--color-text)]">{user.name}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[var(--color-bg-subtle)] text-[var(--color-primary)] uppercase">
                        {user.role || 'Member'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
                      >
                        <User className="w-4 h-4 text-[var(--color-text-muted)]" aria-hidden="true" />
                        My Orders & Profile
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-[var(--color-primary)] font-semibold hover:bg-[var(--color-bg-subtle)] transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                          Admin Dashboard
                        </Link>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-[#DC2626] hover:bg-[var(--color-bg-subtle)] transition-colors"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModal(true, 'login')}
                className="btn-secondary btn-sm hidden sm:inline-flex"
              >
                <User className="w-3.5 h-3.5" aria-hidden="true" />
                Sign In
              </button>
            )}

            {/* Mobile Menu Hamburger Button */}
            <button
              ref={hamburgerBtnRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="p-2 rounded-md text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] md:hidden focus-visible:outline-2 focus-visible:outline-[var(--color-primary)]"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Subnav Navigation Bar */}
      <nav aria-label="Main navigation" className="hidden md:block border-t border-[var(--color-border)] bg-[var(--color-card)]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 py-2 text-xs font-semibold text-[var(--color-text)]">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname + location.search === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`py-1 transition-colors hover:text-[var(--color-primary)] rounded-sm focus-visible:outline-2 focus-visible:outline-[var(--color-primary)] ${
                  isActive ? 'text-[var(--color-primary)] font-bold' : ''
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Accessible Mobile Navigation Drawer & Backdrop */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 top-16 z-50 md:hidden flex flex-col bg-[var(--color-bg)] transition-all"
        >
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 top-16 bg-black/40 backdrop-blur-sm -z-10"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={mobileMenuRef}
            className="flex-1 overflow-y-auto bg-[var(--color-bg)] p-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Mobile Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative" role="search">
                <label htmlFor="mobile-search-input" className="sr-only">
                  Search catalog
                </label>
                <input
                  id="mobile-search-input"
                  type="search"
                  placeholder="Search products & categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[var(--color-card)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-sm rounded-md pl-10 pr-4 py-2.5 focus:outline-none focus:border-[var(--color-primary)]"
                />
                <Search className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3.5 top-3.5 pointer-events-none" aria-hidden="true" />
              </form>

              {/* Navigation Links List */}
              <nav aria-label="Mobile category menu" className="divide-y divide-[var(--color-border)]">
                <div className="py-2">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 px-1">
                    Explore Categories
                  </p>
                  <ul className="space-y-1">
                    {NAV_LINKS.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-primary)] transition-colors"
                        >
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quick Account Actions on Mobile */}
                <div className="py-3">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-muted)] mb-2 px-1">
                    Account & Preferences
                  </p>
                  {user ? (
                    <div className="space-y-1">
                      <Link
                        to="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]"
                      >
                        <User className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                        My Profile & Orders
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-bg-subtle)]"
                        >
                          <ShieldCheck className="w-4 h-4" aria-hidden="true" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold text-[#DC2626] hover:bg-[var(--color-bg-subtle)]"
                      >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                        Sign Out ({user.name})
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setAuthModal(true, 'login');
                      }}
                      className="w-full btn-primary text-center"
                    >
                      Sign In / Register
                    </button>
                  )}
                </div>
              </nav>
            </div>

            {/* Mobile Drawer Footer */}
            <div className="pt-4 border-t border-[var(--color-border)] mt-4">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>Theme Preference</span>
                <ThemeToggle showLabel />
              </div>
              <p className="text-[11px] text-[var(--color-text-subtle)] mt-3 text-center">
                Need immediate help? Call +91 98765 43210
              </p>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
