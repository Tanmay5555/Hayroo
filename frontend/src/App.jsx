import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Global Navigation Components
import FestivalBanner from './components/FestivalBanner';
import FlashSaleBanner from './components/FlashSaleBanner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Drawers, Overlays & Banners
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CompareBar from './components/CompareBar';
import CompareModal from './components/CompareModal';
import AuthModal from './components/AuthModal';
import ChatBotWidget from './components/ChatBotWidget';
import CookieBanner from './components/CookieBanner';

// Eager Home Route for fast initial LCP
import HomePage from './pages/HomePage';

// Lazy-loaded Route Pages for code splitting & smaller initial bundle
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const SellerPage = lazy(() => import('./pages/SellerPage'));
const DeliveryPage = lazy(() => import('./pages/DeliveryPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const FaqPage = lazy(() => import('./pages/FaqPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/PrivacyPolicyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Zustand Stores
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';
import { useThemeStore } from './store/useThemeStore';

// Analytics & UTM Tracking
import { useUtmTracker } from './hooks/useUtmTracker';
import { initAnalyticsIfConsented, trackPageView } from './utils/analytics';

function PageLoadingFallback() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-4" aria-busy="true" aria-label="Loading page">
      <div className="h-8 w-48 bg-[var(--color-bg-subtle)] rounded animate-pulse" />
      <div className="h-48 w-full bg-[var(--color-bg-subtle)] rounded-lg animate-pulse" />
    </div>
  );
}

/**
 * AppTracker handles UTM parameter attribution and page view tracking
 * on route transitions, strictly adhering to cookie consent preferences.
 */
function AppTracker() {
  const location = useLocation();
  useUtmTracker();

  useEffect(() => {
    trackPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  return null;
}

export default function App() {
  const { user, fetchUser } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    initAnalyticsIfConsented();
    fetchUser();
    fetchCart();
  }, [initTheme, fetchUser, fetchCart]);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user, fetchWishlist]);

  return (
    <Router>
      <AppTracker />
      <div className="min-h-screen flex flex-col font-sans bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-150">
        
        {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Global Toast Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-card)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--shadow-md)',
            },
            success: {
              iconTheme: {
                primary: '#0F6B52',
                secondary: '#FFFFFF',
              },
            },
            error: {
              iconTheme: {
                primary: '#C93B3B',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        {/* Festival & Celebratory Announcement Banner */}
        <FestivalBanner />

        {/* Announcement Header */}
        <FlashSaleBanner />

        {/* Sticky Header with Logo, Navigation, Search, and Cart */}
        <Navbar />

        {/* Semantic Main Content Area */}
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:idOrSlug" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/account" element={<AccountPage />} />
              <Route path="/seller" element={<SellerPage />} />
              <Route path="/delivery" element={<DeliveryPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/faq" element={<FaqPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPolicyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </main>

        {/* Global Overlays & Modals */}
        <CartDrawer />
        <WishlistDrawer />
        <CompareBar />
        <CompareModal />
        <AuthModal />

        {/* Support Assistant Widget */}
        <ChatBotWidget />

        {/* Cookie Consent Banner */}
        <CookieBanner />

        {/* Complete Directory Footer */}
        <Footer />
      </div>
    </Router>
  );
}
