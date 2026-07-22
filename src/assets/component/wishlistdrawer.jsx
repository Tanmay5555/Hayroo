import { X, Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlistItems = [],
  onRemoveWishlist,
  onMoveToCart,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 text-white flex flex-col shadow-2xl">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400">
                <Heart className="w-5 h-5 fill-rose-500/20" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white leading-none">Your Wishlist</h2>
                <p className="text-xs text-gray-400 mt-1">{wishlistItems.length} saved items</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {wishlistItems.length > 0 ? (
              wishlistItems.map((item) => {
                const itemPrice = typeof item.price === 'number' 
                  ? item.price 
                  : (parseFloat(String(item.price).replace(/,/g, '')) || 0);

                return (
                  <div key={item.id} className="flex gap-4 p-3 bg-slate-800/50 border border-slate-800 rounded-xl items-center">
                    <img
                      src={item.imageLight || item.images?.[0] || item.imageDark}
                      alt={item.title}
                      className="w-16 h-16 object-contain bg-slate-900 p-2 rounded-lg shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                      <p className="text-xs text-orange-400 font-extrabold mt-1">₹{itemPrice.toLocaleString('en-IN')}</p>
                      
                      {/* Move to Cart Button */}
                      <button
                        onClick={() => onMoveToCart(item)}
                        className="mt-2 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Move to Cart</span>
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveWishlist(item.id)}
                      className="text-gray-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
                <Heart className="w-16 h-16 text-slate-700" />
                <h3 className="text-base font-bold text-gray-300">Your wishlist is empty</h3>
                <p className="text-xs text-gray-500 max-w-xs">Click the heart icon on any product to save items for later.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
