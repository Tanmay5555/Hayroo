import { useState } from "react";
import Navbar from "./assets/component/navbar";
import Hero from "./assets/component/hero";
import Category from "./assets/component/category";
import FeaturedProduct from "./assets/component/featuredproduct";
import ProductDetailSection from "./assets/component/productdetail";
import Footer from "./assets/component/footer";
import Modal from "./assets/component/modal";
import CartDrawer from "./assets/component/cartdrawer";
import WishlistDrawer from "./assets/component/wishlistdrawer";
import QuickViewModal from "./assets/component/quickviewmodal";
import RecentlyViewed from "./assets/component/recentlyviewed";
import ToastContainer from "./assets/component/toast";
import FlashBanner from "./assets/component/flashbanner";
import CheckoutModal from "./assets/component/checkoutmodal";

import initialProducts from "./assets/data/product";

function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Cart State (Pre-filled with 3 items)
  const [cartItems, setCartItems] = useState([
    { ...initialProducts[0], quantity: 1 },
    { ...initialProducts[1], quantity: 1 },
    { ...initialProducts[4], quantity: 1 },
  ]);

  // Wishlist State
  const [wishlistItems, setWishlistItems] = useState([
    initialProducts[2],
  ]);

  // Session History State
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Drawers & Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [activeModal, setActiveModal] = useState(null);

  // Toast Notifications State
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Reset to Home Catalog
  const handleHomeClick = () => {
    setSelectedProduct(null);
    setActiveCategory("All");
    setSearchQuery("");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Category Selector
  const handleSelectCategory = (categoryName) => {
    setActiveCategory(categoryName);
    setSelectedProduct(null);
    const el = document.getElementById('featured-products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Live Search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setSelectedProduct(null);
    const el = document.getElementById('featured-products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Product Selection & Session Tracking
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track recently viewed
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      return [product, ...filtered].slice(0, 8);
    });
  };

  // Add to Cart Logic
  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: (item.quantity || 1) + (product.quantity || 1) } : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
    addToast(`🛒 Added ${product.title || 'item'} to your Cart!`, 'success');
    setIsCartOpen(true);
  };

  // Cart Drawer Quantity Adjusters
  const handleUpdateCartQuantity = (id, newQty) => {
    if (newQty <= 0) {
      handleRemoveCartItem(id);
    } else {
      setCartItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
      );
    }
  };

  const handleRemoveCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    addToast('Item removed from Cart', 'info');
  };

  const handleClearCart = () => {
    setCartItems([]);
    addToast('Cart cleared', 'info');
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderComplete = (orderId) => {
    addToast(`🎉 Order #${orderId} placed successfully!`, 'success');
    setCartItems([]);
  };

  // Wishlist Logic
  const handleToggleWishlist = (product) => {
    setWishlistItems((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) {
        addToast(`Removed ${product.title} from Wishlist`, 'info');
        return prev.filter((item) => item.id !== product.id);
      } else {
        addToast(`❤️ Saved ${product.title} to Wishlist!`, 'success');
        return [...prev, product];
      }
    });
  };

  const handleMoveWishlistToCart = (product) => {
    handleAddToCart(product);
    setWishlistItems((prev) => prev.filter((item) => item.id !== product.id));
  };

  const handleShareProduct = (product) => {
    navigator.clipboard.writeText(window.location.href);
    addToast(`🔗 Copied share link for ${product?.title || 'product'}!`, 'info');
  };

  // Total Quantity Calculation for Badge
  const totalCartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const wishlistIds = wishlistItems.map((item) => item.id);

  return (
    <div className="bg-[#0b1120] min-h-screen flex flex-col font-sans">
      {/* Top Flash Sale Live Countdown Banner */}
      <FlashBanner />

      {/* Sticky Top Navigation Bar */}
      <Navbar 
        onHomeClick={handleHomeClick}
        onSearch={handleSearch}
        searchQuery={searchQuery}
        cartCount={totalCartCount}
        wishlistCount={wishlistItems.length}
        onOpenModal={(type) => setActiveModal(type)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Main Content Area */}
      {selectedProduct ? (
        <main className="flex-1">
          <ProductDetailSection 
            product={selectedProduct} 
            onBack={() => {
              setSelectedProduct(null);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAddToCart={(details) => handleAddToCart({ ...selectedProduct, ...details })}
            onAddToFavorites={() => handleToggleWishlist(selectedProduct)}
            onShareProduct={handleShareProduct}
          />
        </main>
      ) : (
        <main className="flex-1">
          <Hero 
            onSelectCategory={handleSelectCategory}
          />
          <Category 
            activeCategory={activeCategory}
            onSelectCategory={handleSelectCategory}
          />
          <FeaturedProduct 
            activeCategory={activeCategory}
            searchQuery={searchQuery}
            onSelectProduct={handleSelectProduct}
            onAddToCart={handleAddToCart}
            onToggleWishlist={handleToggleWishlist}
            wishlistIds={wishlistIds}
            onQuickView={(prod) => setQuickViewProduct(prod)}
          />
          <RecentlyViewed 
            items={recentlyViewed}
            onSelectProduct={handleSelectProduct}
          />
        </main>
      )}

      {/* Footer */}
      <Footer 
        onSelectCategory={handleSelectCategory}
        onOpenModal={(type) => setActiveModal(type)}
      />

      {/* Slide-Over Shopping Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onCheckout={handleOpenCheckout}
      />

      {/* Slide-Over Wishlist Drawer */}
      <WishlistDrawer 
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveWishlist={(id) => setWishlistItems((prev) => prev.filter((i) => i.id !== id))}
        onMoveToCart={handleMoveWishlistToCart}
      />

      {/* Quick View Spec Overlay Modal */}
      <QuickViewModal 
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        onViewDetails={handleSelectProduct}
      />

      {/* Multi-Step Checkout Wizard Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />

      {/* Informational & Auth Modal Dialogs */}
      <Modal 
        isOpen={!!activeModal}
        onClose={() => setActiveModal(null)}
        modalType={activeModal}
        cartCount={totalCartCount}
        onResetCart={handleClearCart}
      />

      {/* Floating Animated Toast Notifications */}
      <ToastContainer 
        toasts={toasts}
        onRemoveToast={removeToast}
      />
    </div>
  );
}

export default App;