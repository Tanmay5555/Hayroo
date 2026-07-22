import { useState } from 'react';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  MapPin, 
  Info,
  ArrowLeft,
  Share2
} from 'lucide-react';

export default function ProductDetailSection({ product, onBack, onAddToCart, onAddToFavorites, onShareProduct }) {
  // Safe Fallbacks / Destructuring Props
  const {
    title = 'Apple iMac 24" All-In-One Computer, Apple M1, 8GB RAM, 256GB SSD, Mac OS, Pink',
    price = 124990,
    rating = 5.0,
    reviewsCount = 345,
    inStock = true,
    deliveryLocation = 'Ghaziabad, Uttar Pradesh - 201001',
    images = [
      'https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-front.svg',
      'https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-back.svg',
      'https://flowbite.s3.amazonaws.com/blocks/e-commerce/imac-sides.svg',
    ],
    colors = ['Green', 'Pink', 'Silver', 'Blue'],
    storageOptions = ['256GB', '512GB', '1TB'],
    pickupOptions = [
      { id: 'shipping', title: 'Shipping', price: 1499, subtitle: 'Arrives in 2-3 Days' },
      { id: 'pickup-flowbox', title: 'Pickup from Hayroo Hub', price: 499, subtitle: 'Pick a hub near you', linkText: 'Pick a hub near you' },
      { id: 'pickup-store', title: 'Pickup from store', price: 0, subtitle: 'Not available', disabled: true },
    ],
    warrantyOptions = [
      { id: '1-year', label: '1 year', price: 2999 },
      { id: '2-years', label: '2 years', price: 4999 },
      { id: '3-years', label: '3 years', price: 8999 },
    ],
  } = product || {};

  const displayImages = (product?.images && product.images.length > 0)
    ? product.images
    : [product?.imageLight, product?.imageDark].filter(Boolean).length > 0
      ? [product?.imageLight, product?.imageDark].filter(Boolean)
      : images;

  const displayPrice = typeof price === 'number' 
    ? price.toLocaleString('en-IN') 
    : String(price);

  // Interactive States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(colors[1] || colors[0]); // Default Pink
  const [selectedStorage, setSelectedStorage] = useState(storageOptions[0]); // Default 256GB
  const [selectedPickup, setSelectedPickup] = useState('shipping');
  const [selectedWarranty, setSelectedWarranty] = useState('');
  const [quantity, setQuantity] = useState(1);

  return (
    <section className="bg-[#0b1120] text-white py-12 px-4 sm:px-6 lg:px-12 font-sans min-h-screen">
      <div className="max-w-7xl mx-auto">
        
        {/* Back Button */}
        {onBack && (
          <div className="mb-8">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700 text-gray-200 hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all border border-slate-700 shadow-md cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>Back to Products</span>
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* ================= LEFT COLUMN: IMAGE GALLERY ================= */}
        <div className="lg:col-span-6 flex flex-col items-center">
          
          {/* Main Selected Image Showcase */}
          <div className="w-full h-95 sm:h-112.5 bg-[#1e293b]/60 border border-slate-800 rounded-2xl flex items-center justify-center p-8 shadow-2xl">
            <img
              src={displayImages[activeImageIndex] || displayImages[0]}
              alt={title}
              className="max-h-full max-w-full object-contain drop-shadow-2xl transition-all duration-300"
            />
          </div>

          {/* Thumbnails Row */}
          {displayImages.length > 1 && (
            <div className="grid grid-cols-4 gap-4 w-full mt-6">
              {displayImages.map((imgUrl, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-24 bg-[#1e293b]/60 border-2 rounded-xl flex items-center justify-center p-3 transition-all ${
                    activeImageIndex === index
                      ? 'border-blue-500 ring-2 ring-blue-500/30'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} className="max-h-full max-w-full object-contain" />
                </button>
              ))}
            </div>
          )}

        </div>

        {/* ================= RIGHT COLUMN: PRODUCT DETAILS ================= */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Stock Badge */}
          {inStock && (
            <span className="inline-block bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 text-xs font-semibold px-3 py-1 rounded-md">
              In stock
            </span>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight tracking-tight">
            {title}
          </h1>

          {/* Rating, Reviews & Location */}
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white ml-1">({rating.toFixed(1)})</span>
            </div>

            <a href="#reviews" className="text-blue-400 hover:underline font-medium">
              {reviewsCount} Reviews
            </a>

            <div className="flex items-center gap-1 text-gray-400">
              <MapPin className="w-4 h-4 text-blue-400 shrink-0" />
              <span className="text-xs truncate max-w-xs">
                Deliver to <strong className="text-gray-200">{deliveryLocation}</strong>
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="pt-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              ₹{displayPrice}
            </span>
          </div>

          {/* Cart & Actions Row */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {/* Share Product Button */}
            <button
              onClick={() => {
                if (onShareProduct) {
                  onShareProduct(product);
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Product link copied to clipboard!');
                }
              }}
              className="flex items-center gap-2 bg-[#1e293b]/80 hover:bg-[#334155] border border-slate-700 text-gray-300 hover:text-white px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
              title="Share Product Link"
            >
              <Share2 className="w-4 h-4 text-blue-400" />
              <span>Share</span>
            </button>

            {/* Add to Favorites Button */}
            <button
              onClick={onAddToFavorites}
              className="flex items-center gap-2 bg-[#1e293b]/80 hover:bg-[#334155] border border-slate-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
            >
              <Heart className="w-4 h-4 text-rose-400" />
              <span>Add to favorites</span>
            </button>

            {/* Add to Cart Button */}
            <button
              onClick={() =>
                onAddToCart &&
                onAddToCart({
                  selectedColor,
                  selectedStorage,
                  selectedPickup,
                  selectedWarranty,
                  quantity,
                })
              }
              className="flex-1 min-w-40 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Add to cart</span>
            </button>

            {/* Quantity Selector */}
            <div className="flex items-center gap-2 bg-[#1e293b]/80 border border-slate-700 rounded-lg px-3 py-2">
              <span className="text-xs text-gray-400 font-medium">Quantity</span>
              <Info className="w-3.5 h-3.5 text-gray-400" />
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="bg-transparent text-sm font-bold text-white outline-none cursor-pointer pr-1"
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num} className="bg-slate-900 text-white">
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-slate-800 my-6" />

          {/* Colour and SSD Capacity Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Colour Selector */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">Colour</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      selectedColor === color
                        ? 'bg-[#334155] border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-[#1e293b]/60 border-slate-700 text-gray-300 hover:border-slate-600'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* SSD Capacity Selector */}
            <div>
              <label className="block text-sm font-bold text-white mb-2">SSD capacity</label>
              <div className="flex flex-wrap gap-2">
                {storageOptions.map((storage) => (
                  <button
                    key={storage}
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      selectedStorage === storage
                        ? 'bg-[#334155] border-blue-500 text-white ring-1 ring-blue-500'
                        : 'bg-[#1e293b]/60 border-slate-700 text-gray-300 hover:border-slate-600'
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Pickup Options (Radio Group) */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-white mb-3">Pickup</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pickupOptions.map((opt) => (
                <label
                  key={opt.id}
                  className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-all ${
                    opt.disabled ? 'opacity-40 cursor-not-allowed border-slate-800' : ''
                  } ${
                    selectedPickup === opt.id
                      ? 'bg-[#1e293b] border-blue-500 ring-1 ring-blue-500'
                      : 'bg-[#1e293b]/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="pickup"
                      disabled={opt.disabled}
                      checked={selectedPickup === opt.id}
                      onChange={() => setSelectedPickup(opt.id)}
                      className="accent-blue-500"
                    />
                    <span className="text-xs font-bold text-white">
                      {opt.title} {opt.price > 0 && `- ₹${opt.price}`}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-400 mt-1 pl-5">
                    {opt.subtitle}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Add Extra Warranty Option */}
          <div className="pt-2">
            <label className="block text-sm font-bold text-white mb-3">Add extra warranty</label>
            <div className="flex flex-wrap items-center gap-4">
              {warrantyOptions.map((w) => (
                <label key={w.id} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="warranty"
                    checked={selectedWarranty === w.id}
                    onChange={() => setSelectedWarranty(w.id)}
                    className="accent-blue-500"
                  />
                  <span className="text-xs font-medium text-gray-300">
                    {w.label} - <strong className="text-white">₹{w.price.toLocaleString('en-IN')}</strong>
                  </span>
                </label>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>
);
}