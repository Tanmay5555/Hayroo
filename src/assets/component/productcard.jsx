

import { Eye, Heart, Star, ShoppingCart, Truck} from 'lucide-react';
import Button from './Button';


export default function ProductCard({
  imageLight,
  imageDark,
  discountTag,
  title,
  rating = 5.0,
  reviewsCount = 0,
  price,
  features = [],
  onAddToCart,
  onQuickLook,
  onFavorite,
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800 flex flex-col justify-between mt-2 ml-2">
      <div>
        {/* Product Image */}
        <div className="h-56 w-full flex items-center justify-center">
          <a href="#" className="h-full">
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
              <Button
                variant="iconOnly"
                icon={Eye}
                onClick={onQuickLook}
                title="Quick look"
              />
              <Button
                variant="iconOnly"
                icon={Heart}
                onClick={onFavorite}
                title="Add to Favorites"
              />
            </div>
          </div>

          {/* Title */}
          <a href="#" className="text-lg font-semibold leading-tight text-gray-900 hover:underline dark:text-white line-clamp-2">
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
          onClick={onAddToCart}
        >
          Add to cart
        </Button>
      </div>
    </div>
  );
}