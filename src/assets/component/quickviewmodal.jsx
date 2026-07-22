import { X, Star, ShoppingCart, ArrowRight } from 'lucide-react';

export default function QuickViewModal({ product, isOpen, onClose, onAddToCart, onViewDetails }) {
  if (!isOpen || !product) return null;

  const {
    title,
    price,
    rating = 5.0,
    reviewsCount = 120,
    imageLight,
    imageDark,
    discountTag,
    features = [],
  } = product;

  const itemPrice = typeof price === 'number' 
    ? price 
    : (parseFloat(String(price).replace(/,/g, '')) || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Image */}
          <div className="h-64 bg-slate-800/60 border border-slate-800 rounded-xl p-4 flex items-center justify-center">
            <img
              src={imageLight || imageDark}
              alt={title}
              className="max-h-full max-w-full object-contain drop-shadow-xl"
            />
          </div>

          {/* Details */}
          <div className="space-y-4">
            {discountTag && (
              <span className="inline-block bg-blue-900/80 text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded">
                {discountTag}
              </span>
            )}
            <h3 className="text-xl font-bold text-white leading-tight">{title}</h3>
            
            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-200">({rating})</span>
              <span className="text-xs text-gray-400">• {reviewsCount} Reviews</span>
            </div>

            <p className="text-2xl font-extrabold text-orange-400">₹{itemPrice.toLocaleString('en-IN')}</p>

            {features.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {features.map((f, idx) => (
                  <span key={idx} className="bg-slate-800 border border-slate-700 text-gray-300 text-[11px] px-2.5 py-1 rounded-md font-medium">
                    ✓ {f}
                  </span>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-2 pt-3">
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={() => {
                  onViewDetails(product);
                  onClose();
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
              >
                <span>View Full Product Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
