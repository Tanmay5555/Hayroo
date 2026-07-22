import { 
  Monitor, 
  Gamepad2, 
  Tablet, 
  ShoppingBag, 
  Laptop, 
  Watch, 
  Headphones, 
  ArrowRight 
} from 'lucide-react';

export default function HeroSection({ onSelectCategory }) {
  const handleCategoryClick = (categoryName) => {
    if (onSelectCategory) {
      onSelectCategory(categoryName);
    }
  };

  const scrollToProducts = () => {
    if (onSelectCategory) onSelectCategory('All');
    const el = document.getElementById('featured-products');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToCategories = () => {
    const el = document.getElementById('categories-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-[#0b1120] text-white py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          
          {/* Left Hero Text Content */}
          <div className="lg:col-span-5 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-none tracking-tight">
              Don’t miss out on exclusive deals.
            </h1>
            <p className="text-gray-400 text-base sm:text-lg max-w-md font-normal leading-relaxed">
              Unlock even more exclusive member deals when you become a Flowbite Plus or Diamond member.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 pt-2">
              <button 
                onClick={scrollToProducts}
                className="bg-[#2563eb] hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors shadow-sm cursor-pointer"
              >
                Shop Now
              </button>
              <button 
                onClick={scrollToCategories}
                className="bg-transparent hover:bg-slate-800/60 text-gray-300 hover:text-white font-medium px-5 py-3 rounded-lg border border-slate-700/80 text-sm transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Right Category Cards Grid */}
          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Card 1: Top Categories */}
            <div className="bg-[#1e293b]/60 border border-slate-800/80 rounded-xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-6">Top categories</h3>
                
                {/* 2x2 Grid inside Card */}
                <div className="grid grid-cols-2 gap-4 divide-x divide-y divide-slate-800/60 border-b border-slate-800/60 pb-6">
                  {/* Category 1 */}
                  <div 
                    onClick={() => handleCategoryClick('Computers')}
                    className="flex flex-col items-start p-2 cursor-pointer group hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <div className="w-full h-24 bg-[#334155]/50 group-hover:bg-[#334155] rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Monitor className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">Computers</span>
                  </div>

                  {/* Category 2 */}
                  <div 
                    onClick={() => handleCategoryClick('Gaming')}
                    className="flex flex-col items-start p-2 pl-4 cursor-pointer group hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <div className="w-full h-24 bg-[#334155]/50 group-hover:bg-[#334155] rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Gamepad2 className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">Gaming</span>
                  </div>

                  {/* Category 3 */}
                  <div 
                    onClick={() => handleCategoryClick('Phone/Tablets')}
                    className="flex flex-col items-start p-2 pt-4 cursor-pointer group hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <div className="w-full h-24 bg-[#334155]/50 group-hover:bg-[#334155] rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Tablet className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">Tablets</span>
                  </div>

                  {/* Category 4 */}
                  <div 
                    onClick={() => handleCategoryClick('Fashion')}
                    className="flex flex-col items-start p-2 pt-4 pl-4 cursor-pointer group hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <div className="w-full h-24 bg-[#334155]/50 group-hover:bg-[#334155] rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <ShoppingBag className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">Fashion</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={scrollToProducts}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3b82f6] hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
              >
                <span>Shop now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Card 2: Shop Consumer Electronics */}
            <div className="bg-[#1e293b]/60 border border-slate-800/80 rounded-xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-6">Shop consumer electronics</h3>
                
                {/* 2x2 Grid inside Card */}
                <div className="grid grid-cols-2 gap-4 border-b border-slate-800/60 pb-6">
                  {/* Category 1 */}
                  <div 
                    onClick={() => handleCategoryClick('Computers')}
                    className="flex flex-col items-start p-2 cursor-pointer group hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <div className="w-full h-24 bg-[#334155]/50 group-hover:bg-[#334155] rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Laptop className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">Laptops</span>
                  </div>

                  {/* Category 2 */}
                  <div 
                    onClick={() => handleCategoryClick('Electronics')}
                    className="flex flex-col items-start p-2 cursor-pointer group hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <div className="w-full h-24 bg-[#334155]/50 group-hover:bg-[#334155] rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Watch className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">Watches</span>
                  </div>

                  {/* Category 3 */}
                  <div 
                    onClick={() => handleCategoryClick('Phone/Tablets')}
                    className="flex flex-col items-start p-2 cursor-pointer group hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <div className="w-full h-24 bg-[#334155]/50 group-hover:bg-[#334155] rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Tablet className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">Tablets</span>
                  </div>

                  {/* Category 4 */}
                  <div 
                    onClick={() => handleCategoryClick('Electronics')}
                    className="flex flex-col items-start p-2 cursor-pointer group hover:bg-slate-800/40 rounded-lg transition-all"
                  >
                    <div className="w-full h-24 bg-[#334155]/50 group-hover:bg-[#334155] rounded-lg flex items-center justify-center mb-3 transition-colors">
                      <Headphones className="w-10 h-10 text-slate-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200 group-hover:text-white">Accessories</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={scrollToProducts}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#3b82f6] hover:text-blue-400 transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
              >
                <span>Shop now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
        
      </div>
    </section>
  );
}