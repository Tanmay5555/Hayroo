import { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Search, 
  ShoppingCart, 
  Heart,
  Menu, 
  X, 
  ChevronDown, 
  Sun, 
  Moon, 
  Monitor 
} from 'lucide-react';

export default function Navbar({
  onHomeClick,
  onSearch,
  searchQuery = '',
  cartCount = 0,
  wishlistCount = 0,
  onOpenModal,
  onOpenCart,
  onOpenWishlist,
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);
  
  // Theme state: 'light', 'dark', or 'system'
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'system');
  const themeRef = useRef(null);

  // Apply theme class to HTML root tag
  useEffect(() => {
    const root = document.documentElement;
    const systemQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let isDark = false;
      if (theme === 'dark') isDark = true;
      else if (theme === 'light') isDark = false;
      else isDark = systemQuery.matches; // System mode

      if (isDark) root.classList.add('dark');
      else root.classList.remove('dark');
    };

    applyTheme();

    if (theme === 'system') localStorage.removeItem('theme');
    else localStorage.setItem('theme', theme);

    const handleSystemChange = () => {
      if (theme === 'system') applyTheme();
    };

    systemQuery.addEventListener('change', handleSystemChange);
    return () => systemQuery.removeEventListener('change', handleSystemChange);
  }, [theme]);

  // Close theme dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setIsThemeOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchInput);
  };

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ];

  const ActiveThemeIcon = themeOptions.find((opt) => opt.id === theme)?.icon || Monitor;

  return (
    <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-md">
      {/* Desktop & Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 md:gap-6">
          
          {/* Logo */}
          <div 
            onClick={onHomeClick} 
            className="shrink-0 cursor-pointer flex items-center group"
            title="Go to Home"
          >
            <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-400 tracking-wide group-hover:text-orange-300 transition-colors">
              Hayroo
            </h1>
          </div>

          {/* Location */}
          <div 
            onClick={() => onOpenModal && onOpenModal('shipping')}
            className="hidden lg:flex items-center gap-1.5 p-2 rounded-md hover:ring-1 hover:ring-white cursor-pointer transition-all"
            title="Change Delivery Location"
          >
            <MapPin className="w-5 h-5 text-orange-400 shrink-0" />
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium leading-none">
                Deliver to
              </p>
              <h4 className="text-sm font-semibold leading-tight text-gray-100">
                Ghaziabad 201001
              </h4>
            </div>
          </div>

          {/* Search Box */}
          <div className="flex-1 max-w-2xl mx-2">
            <form onSubmit={handleSearchSubmit} className="flex items-center w-full">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-full px-4 py-2 text-sm text-slate-900 bg-white rounded-l-md outline-none focus:ring-2 focus:ring-orange-400"
              />
              <button
                type="submit"
                aria-label="Search"
                className="bg-orange-400 hover:bg-orange-500 text-slate-900 p-2.5 rounded-r-md transition-colors flex items-center justify-center font-bold cursor-pointer"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Right Navigation Actions */}
          <div className="hidden md:flex items-center gap-1 lg:gap-3">
            
            {/* Theme Switcher Dropdown */}
            <div className="relative" ref={themeRef}>
              <button
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="flex items-center gap-1.5 p-2 rounded-md hover:ring-1 hover:ring-white cursor-pointer transition-all"
                title="Change Theme"
              >
                <ActiveThemeIcon className="w-5 h-5 text-orange-400" />
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </button>

              {/* Theme Dropdown Menu */}
              {isThemeOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-slate-900 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                  {themeOptions.map((option) => {
                    const Icon = option.icon;
                    const isActive = theme === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => {
                          setTheme(option.id);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                          isActive
                            ? 'text-orange-400 bg-slate-800'
                            : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Language Selector */}
            <div className="flex items-center gap-1 p-2 rounded-md hover:ring-1 hover:ring-white cursor-pointer transition-all">
              <span className="text-base" role="img" aria-label="India Flag">🇮🇳</span>
              <select 
                aria-label="Select Language"
                className="bg-transparent text-sm font-semibold text-white outline-none cursor-pointer"
              >
                <option value="en" className="text-slate-900">EN</option>
                <option value="hi" className="text-slate-900">HI</option>
              </select>
            </div>

            {/* Account & Lists */}
            <div 
              onClick={() => onOpenModal && onOpenModal('signin')}
              className="p-2 rounded-md hover:ring-1 hover:ring-white cursor-pointer transition-all"
              title="Sign In / Account"
            >
              <p className="text-[11px] text-gray-300 leading-none">Hello, Sign In</p>
              <div className="flex items-center gap-0.5">
                <h4 className="text-sm font-semibold leading-tight">Account & Lists</h4>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>
            </div>

            {/* Wishlist Button with Badge */}
            <div 
              onClick={onOpenWishlist}
              className="relative p-2 rounded-md hover:ring-1 hover:ring-white cursor-pointer flex items-center gap-1 transition-all"
              title="View Wishlist"
            >
              <div className="relative">
                <Heart className="w-6 h-6 text-rose-400" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white font-bold text-[10px] rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </div>
            </div>

            {/* Cart Button with Badge */}
            <div 
              onClick={onOpenCart}
              className="relative p-2 rounded-md hover:ring-1 hover:ring-white cursor-pointer flex items-center gap-2 transition-all"
              title="View Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-7 h-7 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 bg-orange-500 text-slate-950 font-bold text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold self-end hidden lg:block">Cart</h4>
            </div>

          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-slate-800 focus:outline-none cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-6 space-y-4">
          <div className="flex items-center justify-between text-sm text-gray-300 border-b border-slate-800 pb-3">
            <div 
              onClick={() => onOpenModal && onOpenModal('shipping')}
              className="flex items-center gap-2 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-orange-400" />
              <span>Deliver to <strong>Ghaziabad 201001</strong></span>
            </div>
            
            {/* Mobile Theme Selector */}
            <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg">
              {themeOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => setTheme(option.id)}
                    className={`p-1.5 rounded-md cursor-pointer ${
                      theme === option.id ? 'bg-orange-400 text-slate-950' : 'text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs font-medium">
            <div 
              onClick={() => onOpenModal && onOpenModal('signin')}
              className="p-2 bg-slate-800 rounded-md text-center cursor-pointer hover:bg-slate-700"
            >
              <p className="text-[10px] text-gray-400">Account</p>
              <p className="font-semibold text-white">Sign In</p>
            </div>
            <div 
              onClick={onOpenWishlist}
              className="p-2 bg-slate-800 rounded-md text-center cursor-pointer hover:bg-slate-700"
            >
              <p className="text-[10px] text-gray-400">Wishlist</p>
              <p className="font-semibold text-rose-400">♥ ({wishlistCount})</p>
            </div>
            <div 
              onClick={onOpenCart}
              className="p-2 bg-slate-800 rounded-md text-center cursor-pointer hover:bg-slate-700"
            >
              <p className="text-[10px] text-gray-400">Cart</p>
              <p className="font-semibold text-orange-400">🛒 ({cartCount})</p>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}