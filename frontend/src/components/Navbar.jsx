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
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';
import { useWishlistStore } from '../store/useWishlistStore';
import { useCompareStore } from '../store/useCompareStore';
import ThemeToggle from './ThemeToggle';
import apiClient from '../api/axios';

const NAV_LINKS = [
  { label: 'Overview', path: '/' },
  { label: 'All Products', path: '/products' },
  { label: 'Computers', path: '/products?category=Computers' },
  { label: 'Phones & Tablets', path: '/products?category=Phone%20%26%20Tablets' },
  { label: 'Audio', path: '/products?category=Electronics' },
  { label: 'Fashion', path: '/products?category=Fashion%20%26%20Apparel' },
  { label: 'Grocery', path: '/products?category=Grocery%20%26%20Gourmet%20Foods' },
  { label: 'Books', path: '/products?category=Books' },
];

const WORKSPACE_LINKS = [
  { label: 'Seller Portal', path: '/seller' },
  { label: 'Delivery Hub', path: '/delivery' },
  { label: 'Admin Console', path: '/admin' },
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
  const searchInputRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  const totalCartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setShowSearchDropdown(false);
  }, [location.pathname, location.search]);

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

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape') {
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
    <header className="sticky top-0 z-40 w-full bg-[var(--color-card)] border-b border-[var(--color-border)] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15 gap-4">
          
          {/* Brand Mark & Wordmark */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 rounded-md focus-visible:outline-2 focus-visible:outline-[var(--color-border-focus)] focus-visible:outline-offset-2"
            aria-label="Hayroo Home"
          >
            <div className="w-7 h-7 rounded-[6px] bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-primary-text)] font-bold text-sm tracking-tight">
              H
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-semibold tracking-tight text-[var(--color-text)]">
                Hayroo
              </span>
              <span className="hidden sm:inline text-[11px] font-medium text-[var(--color-text-subtle)]">
                Marketplace
              </span>
            </div>
          </Link>

          {/* Desktop Live Search Bar */}
          <div ref={searchRef} className="hidden md:flex flex-1 max-w-md relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative" role="search">
              <label htmlFor="desktop-search" className="sr-only">
                Search products
              </label>
              <input
                ref={searchInputRef}
                id="desktop-search"
                type="search"
                placeholder="Search products, brands, or SKUs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder-[var(--color-text-subtle)] text-[13px] rounded-md pl-9 pr-9 py-1.5 focus:outline-none focus:bg-[var(--color-card)] focus:border-[var(--color-border-focus)] focus:ring-2 focus:ring-[var(--color-ring)] transition-colors"
              />
              <Search className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3 top-2 pointer-events-none" aria-hidden="true" />
              {isSearching ? (
                <div
                  className="w-3.5 h-3.5 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin absolute right-3 top-2.5"
                  aria-label="Loading search results"
                />
              ) : (
                !searchQuery && (
                  <kbd
                    aria-hidden="true"
                    className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-subtle)] bg-[var(--color-card)] border border-[var(--color-border)] rounded absolute right-2.5 top-1.5 pointer-events-none"
                  >
                    /
                  </kbd>
                )
              )}
            </form>

            {/* Live Autosuggest Dropdown */}
            {showSearchDropdown && searchResults.length > 0 && (
              <div
                role="listbox"
                aria-label="Search suggestions"
                className="absolute left-0 right-0 top-full mt-1.5 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-[var(--shadow-lg)] overflow-hidden z-50 divide-y divide-[var(--color-border)]"
              >
                <div className="py-1.5 px-3 text-[11px] font-medium text-[var(--color-text-subtle)] bg-[var(--color-bg-subtle)]">
                  Results ({searchResults.length})
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
                    className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--color-bg-subtle)] cursor-pointer transition-colors"
                  >
                    <img
                      src={item.imageLight || '/favicon.svg'}
                      alt=""
                      className="w-9 h-9 object-contain rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] p-1 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--color-text)] truncate">{item.title}</p>
                      <p className="text-[11px] text-[var(--color-text-subtle)]">{item.category} · {item.brand}</p>
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums text-[var(--color-text)] shrink-0">
                      ₹{item.price ? item.price.toLocaleString('en-IN') : '0'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Navigation Actions */}
          <div className="flex items-center gap-1.5">
            
            <ThemeToggle />

            {compareItems.length > 0 && (
              <button
                type="button"
                onClick={() => setCompareModalOpen(true)}
                className="relative p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors hidden sm:inline-flex items-center gap-1"
                title="Compare Products"
                aria-label={`Compare ${compareItems.length} products`}
              >
                <Scale className="w-4 h-4" aria-hidden="true" />
                <span className="text-[11px] font-mono font-medium tabular-nums">
                  {compareItems.length}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setWishlistDrawerOpen(true)}
              className="relative p-2 rounded-md text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors inline-flex items-center gap-1"
              title="Saved Wishlist"
              aria-label={`Wishlist with ${wishlistItems.length} items`}
            >
              <Heart className="w-4 h-4" aria-hidden="true" />
              {wishlistItems.length > 0 && (
                <span className="text-[11px] font-mono font-medium tabular-nums text-[var(--color-primary)]">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {user ? (
              <div id="user-menu-container" className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--color-bg-subtle)] border border-transparent hover:border-[var(--color-border)] transition-colors"
                >
                  <div className="w-6 h-6 rounded bg-[var(--color-primary-light)] text-[var(--color-primary)] font-semibold flex items-center justify-center text-xs border border-[var(--color-border)]">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="text-[13px] font-medium text-[var(--color-text)] hidden lg:inline max-w-[96px] truncate">
                    {user.name ? user.name.split(' ')[0] : 'Account'}
                  </span>
                </button>

                {isUserMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-1.5 w-56 bg-[var(--color-card)] border border-[var(--color-border)] rounded-md shadow-[var(--shadow-lg)] py-1 z-50 divide-y divide-[var(--color-border)]"
                  >
                    <div className="px-3.5 py-2.5">
                      <p className="text-xs font-semibold text-[var(--color-text)]">{user.name}</p>
                      <p className="text-[11px] text-[var(--color-text-muted)] truncate">{user.email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--color-bg-subtle)] border border-[var(--color-border)] text-[var(--color-text-muted)] uppercase tracking-wide">
                        {user.role || 'Member'}
                      </span>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/account"
                        role="menuitem"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-[var(--color-text-muted)]" aria-hidden="true" />
                        Orders & Profile
                      </Link>

                      {user.role?.toUpperCase() === 'ADMIN' && (
                        <Link
                          to="/admin"
                          role="menuitem"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2 px-3.5 py-2 text-xs text-[var(--color-primary)] font-medium hover:bg-[var(--color-bg-subtle)] transition-colors"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                          Admin Console
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
                        className="w-full flex items-center gap-2 px-3.5 py-2 text-xs text-[var(--color-error)] hover:bg-[var(--color-bg-subtle)] transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
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
                Sign In
              </button>
            )}

            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="btn-primary btn-sm ml-1 tabular-nums"
              title="Shopping Cart"
              aria-label={`Shopping cart with ${totalCartCount} items`}
            >
              <ShoppingBag className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-black/15 dark:bg-black/25 text-[11px] font-mono leading-tight">
                  {totalCartCount}
                </span>
              )}
            </button>

            <button
              ref={hamburgerBtnRef}
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="p-2 rounded-md text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] md:hidden"
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

      {/* Desktop Subnav Category Bar */}
      <nav aria-label="Main categories" className="hidden md:block border-t border-[var(--color-border-subtle)] bg-[var(--color-card)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-6 h-10 text-[13px] font-medium text-[var(--color-text-muted)] overflow-x-auto">
          {NAV_LINKS.map((link) => {
            const isActive = location.pathname + location.search === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`relative h-full inline-flex items-center whitespace-nowrap transition-colors hover:text-[var(--color-text)] ${
                  isActive ? 'text-[var(--color-text)] font-semibold' : ''
                }`}
              >
                {link.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-primary)]"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 top-[92px] z-50 md:hidden flex flex-col bg-[var(--color-bg)]"
        >
          <div
            className="fixed inset-0 top-[92px] bg-black/45 -z-10"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          <div
            ref={mobileMenuRef}
            className="flex-1 overflow-y-auto bg-[var(--color-card)] p-4 flex flex-col justify-between border-t border-[var(--color-border)]"
          >
            <div className="space-y-5">
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
                  className="form-input pl-9"
                />
                <Search className="w-4 h-4 text-[var(--color-text-subtle)] absolute left-3 top-3 pointer-events-none" aria-hidden="true" />
              </form>

              <nav aria-label="Mobile menu" className="space-y-5">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)] mb-2 px-2">
                    Shop Categories
                  </p>
                  <ul className="space-y-0.5">
                    {NAV_LINKS.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between px-2.5 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
                        >
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)] mb-2 px-2">
                    Workspaces
                  </p>
                  <ul className="space-y-0.5">
                    {WORKSPACE_LINKS.map((link) => (
                      <li key={link.path}>
                        <Link
                          to={link.path}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center justify-between px-2.5 py-2 rounded-md text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)] transition-colors"
                        >
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)] mb-2 px-2">
                    Account
                  </p>
                  {user ? (
                    <div className="space-y-1">
                      <Link
                        to="/account"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-subtle)]"
                      >
                        <User className="w-4 h-4 text-[var(--color-primary)]" aria-hidden="true" />
                        Orders & Profile
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm font-medium text-[var(--color-error)] hover:bg-[var(--color-bg-subtle)]"
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
                      className="w-full btn-primary"
                    >
                      Sign In / Register
                    </button>
                  )}
                </div>
              </nav>
            </div>

            <div className="pt-4 border-t border-[var(--color-border)] mt-6">
              <div className="flex items-center justify-between text-xs text-[var(--color-text-muted)]">
                <span>Appearance</span>
                <ThemeToggle showLabel />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
