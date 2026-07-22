import { Eye, Heart, Star, ShoppingCart, Truck } from 'lucide-react';
import Button from './button';

export default function ProductCard({
  imageLight,
  imageDark,
  discountTag,
  title,
  rating = 5.0,
  reviewsCount = 0,
  price,
  features = [],
  isFavorite = false,
  onAddToCart,
  onQuickLook,
  onFavorite,
  onSelect,
}) {
  const handleSelect = (e) => {
    if (e) e.preventDefault();
    if (onSelect) onSelect();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col justify-between mt-2 ml-2 transition-all hover:shadow-md">
      <div>
        {/* Product Image */}
        <div className="h-56 w-full flex items-center justify-center cursor-pointer" onClick={handleSelect}>
          <a href="#" onClick={handleSelect} className="h-full">
            <img className="mx-auto h-full dark:hidden object-contain" src={imageLight} alt={title} />
            <img className="mx-auto hidden h-full dark:block object-contain" src={imageDark || imageLight} alt={title} />
          </a>
        </div>

        <div className="pt-6">
          {/* Discount Badge & Top Action Buttons */}
          <div className="mb-4 flex items-center justify-between gap-4">
            {discountTag ? (
              <span className="me-2 rounded bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                {discountTag}
              </span>
            ) : <div />}

            <div className="flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={onQuickLook || handleSelect}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-colors cursor-pointer"
                title="Quick look"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={onFavorite}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isFavorite
                    ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'
                }`}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 animate-bounce' : ''}`} />
              </button>
            </div>
          </div>

          {/* Title */}
          <a
            href="#"
            onClick={handleSelect}
            className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white line-clamp-2 cursor-pointer"
          >
            {title}
          </a>

          {/* Rating */}
          <div className="mt-2 flex items-center gap-2">
            <div className="flex items-center text-yellow-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{rating}</p>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">({reviewsCount.toLocaleString()})</p>
          </div>

          {/* Feature Badges */}
          {features.length > 0 && (
            <ul className="mt-2 flex items-center gap-4">
              {features.map((item, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{item}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Card Footer Price & Add to Cart */}
      <div className="mt-4 flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
        <p className="text-2xl font-extrabold leading-tight text-gray-900 dark:text-white">
           ₹{price}
        </p>

        {/* Reusable Button Component integrated */}
        <Button
          variant="primary"
          icon={ShoppingCart}
          onClick={(e) => {
            if (e) e.stopPropagation();
            if (onAddToCart) onAddToCart();
          }}
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}