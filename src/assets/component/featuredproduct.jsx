
import products from '../data/product';
import ProductCard from './productcard';

export default function FeaturedProduct() {
  return (
    <section className="bg-gray-50 py-8 dark:bg-gray-900 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        
        {/* Grid layout container */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((item) => (
            <ProductCard
              key={item.id}
              title={item.title}
              price={item.price}
              imageLight={item.imageLight}
              imageDark={item.imageDark}
              discountTag={item.discountTag}
              rating={item.rating}
              reviewsCount={item.reviewsCount}
              features={item.features}
              onAddToCart={() => alert(`Added ₹{item.title} to cart`)}
              onQuickLook={() => console.log('Quick look for:', item.id)}
              onFavorite={() => console.log('Favorited product:', item.id)}
            />
          ))}
        </div>

      </div>
    </section>
  );
}


