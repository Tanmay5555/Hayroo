import { History } from 'lucide-react';

export default function RecentlyViewed({ items = [], onSelectProduct }) {
  if (!items || items.length === 0) return null;

  return (
    <section className="bg-[#0b1120] border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-bold text-white tracking-wide">Recently Viewed Products</h3>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-700">
          {items.map((product) => {
            const itemPrice = typeof product.price === 'number' 
              ? product.price 
              : (parseFloat(String(product.price).replace(/,/g, '')) || 0);

            return (
              <div
                key={product.id}
                onClick={() => onSelectProduct(product)}
                className="w-48 shrink-0 bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-xl p-4 flex flex-col justify-between cursor-pointer group transition-all hover:shadow-xl"
              >
                <div className="h-32 w-full flex items-center justify-center bg-slate-800/40 rounded-lg p-2 mb-3">
                  <img
                    src={product.imageLight || product.imageDark}
                    alt={product.title}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-orange-400 transition-colors">
                    {product.title}
                  </h4>
                  <p className="text-sm font-extrabold text-white mt-2">₹{itemPrice.toLocaleString('en-IN')}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
