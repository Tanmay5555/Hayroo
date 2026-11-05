import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layout & Global Navigation Components
import ScrollProgressBar from './components/ScrollProgressBar';
import FlashSaleBanner from './components/FlashSaleBanner';
import Navbar from './components/Navbar';
import BackToTop from './components/BackToTop';
import FloatingContactButton from './components/FloatingContactButton';
import Footer from './components/Footer';

// Drawers, Overlays & Banners
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import CompareBar from './components/CompareBar';
import CompareModal from './components/CompareModal';
import AuthModal from './components/AuthModal';
import ChatBotWidget from './components/ChatBotWidget';
import CookieBanner from './components/CookieBanner';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import AccountPage from './pages/AccountPage';
import SellerPage from './pages/SellerPage';
import DeliveryPage from './pages/DeliveryPage';
import AdminPage from './pages/AdminPage';
import FaqPage from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import TermsPage from './pages/TermsPage';
import NotFoundPage from './pages/NotFoundPage';

// Zustand Stores
import { useAuthStore } from './store/useAuthStore';
import { useCartStore } from './store/useCartStore';
import { useWishlistStore } from './store/useWishlistStore';
import { useThemeStore } from './store/useThemeStore';

// Analytics & UTM Tracking
import { useUtmTracker } from './hooks/useUtmTracker';
import { initAnalyticsIfConsented, trackPageView } from './utils/analytics';

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
  const { fetchUser } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();
  const { initTheme } = useThemeStore();

  useEffect(() => {
    initTheme();
    initAnalyticsIfConsented();
    fetchUser();
    fetchCart();
    fetchWishlist();
  }, [initTheme, fetchUser, fetchCart, fetchWishlist]);

  return (
    <Router>
      <AppTracker />
      <div className="min-h-screen flex flex-col font-sans bg-[var(--color-bg)] text-[var(--color-text)] transition-colors duration-200">
        
        {/* Subtle, Thin Scroll Progress Indicator */}
        <ScrollProgressBar />

        {/* Skip to Main Content Link for Keyboard and Screen Reader Accessibility */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

        {/* Global Toast Notifications (Styled to 6px radius and Hayroo tokens) */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: {
              background: 'var(--color-card)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
              boxShadow: 'var(--shadow-md)',
            },
            success: {
              iconTheme: {
                primary: '#047857',
                secondary: '#FFFBEB',
              },
            },
            error: {
              iconTheme: {
                primary: '#DC2626',
                secondary: '#FFFFFF',
              },
            },
          }}
        />

        {/* Announcement Header */}
        <FlashSaleBanner />

        {/* Sticky Header with Logo, Navigation, Search, and Cart */}
        <Navbar />

        {/* Semantic Main Content Area */}
        <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
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
        </main>

        {/* Global Overlays & Modals */}
        <CartDrawer />
        <WishlistDrawer />
        <CompareBar />
        <CompareModal />
        <AuthModal />

        {/* Floating Quick Action Controls */}
        <FloatingContactButton />
        <BackToTop />
        <ChatBotWidget />

        {/* Cookie Consent Banner */}
        <CookieBanner />

        {/* Complete Directory Footer */}
        <Footer />
      </div>
    </Router>
  );
}