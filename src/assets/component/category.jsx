
import { 
  Server, 
  ShoppingBag, 
  CreditCard, 
  Headphones, 
  Tv, 
  Wand2, 
  Smile, 
  Store, 
  Heart, 
  Truck, 
  BookOpen, 
  Home, 
  Camera, 
  ClipboardList, 
  Eye, 
  Smartphone, 
  ArrowRight 
} from 'lucide-react';

export default function TopCategoriesGrid() {
  const categories = [
    { name: 'Computers', icon: Server },
    { name: 'Fashion', icon: ShoppingBag },
    { name: 'Electronics', icon: CreditCard },
    { name: 'Gaming', icon: Headphones },
    { name: 'TV/Projectors', icon: Tv },
    { name: 'Toys', icon: Wand2 },
    { name: 'Sport', icon: Smile },
    { name: 'Grocery', icon: Store },
    { name: 'Health', icon: Heart },
    { name: 'Auto', icon: Truck },
    { name: 'Books', icon: BookOpen },
    { name: 'Home', icon: Home },
    { name: 'Photo/Video', icon: Camera },
    { name: 'Collectibles', icon: ClipboardList },
    { name: 'Beauty', icon: Eye },
    { name: 'Phone/Tablets', icon: Smartphone },
  ];

  return (
    <section className="bg-[#0b1120] text-white py-12 px-4 sm:px-6 lg:px-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-6 mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
             Categories
          </h2>
          <a
            href="#"
            className="inline-flex items-center gap-2 bg-[#1e293b]/60 hover:bg-[#1e293b] text-gray-300 hover:text-white border border-slate-700/60 text-sm font-medium px-4 py-2 rounded-lg transition-all"
          >
            <span>View more categories</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </a>
        </div>

        {/* 8-Column Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-y-10 gap-x-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <a
                key={index}
                href="#"
                className="flex flex-col items-center group cursor-pointer"
              >
                {/* Circular Icon Wrapper */}
                <div className="w-20 h-20 rounded-full bg-[#1e293b]/80 border border-slate-800 flex items-center justify-center mb-3 group-hover:bg-[#334155]/70 group-hover:scale-105 transition-all duration-200 shadow-md">
                  <Icon className="w-8 h-8 text-slate-300 group-hover:text-white transition-colors" />
                </div>
                
                {/* Category Label */}
                <span className="text-sm font-bold text-gray-200 text-center leading-tight group-hover:text-white transition-colors">
                  {category.name}
                </span>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}