import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-gray-300 border-t border-slate-800 w-full mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="xl:grid xl:grid-cols-3 xl:gap-8">
          {/* Brand Info */}
          <div className="space-y-8 xl:col-span-1 text-left">
            <h2 className="text-3xl font-extrabold text-orange-400 tracking-wide">
              Hayroo
            </h2>
            <p className="text-sm text-gray-400 max-w-xs">
              Your one-stop destination for premium electronics, fashion, home essentials, and more. Delivered fast, priced right.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.008 3.752.052 2.73.124 4.07 1.46 4.194 4.194.044.968.052 1.322.052 3.752 0 2.43-.008 2.784-.052 3.752-.124 2.73-1.46 4.07-4.194 4.194-.968.044-1.322.052-3.752.052-2.43 0-2.784-.008-3.752-.052-2.73-.124-4.07-1.46-4.194-4.194-.044-.968-.052-1.322-.052-3.752 0-2.43.008-2.784.052-3.752.124-2.73 1.46-4.07 4.194-4.194.968-.044 1.322-.052 3.752-.052zm.185 2h-2.16c-2.22 0-2.5.008-3.38.048-2.31.106-3.34 1.137-3.447 3.447-.04.88-.048 1.16-.048 3.38 0 2.22.008 2.5.048 3.38.106 2.31 1.137 3.34 3.447 3.447.88.04 1.16.048 3.38.048 2.22 0 2.5-.008 3.38-.048 2.31-.106 3.34-1.137 3.447-3.447.04-.88.048-1.16.048-3.38 0-2.22-.008-2.5-.048-3.38-.106-2.31-1.137-3.34-3.447-3.447-.88-.04-1.16-.048-3.38-.048zm-2.5 8a2.5 2.5 0 115 0 2.5 2.5 0 01-5 0zm0 4.5a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zm9.5-9a1.25 1.25 0 11-2.5 0 1.25 1.25 0 012.5 0z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links and Subscription */}
          <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 text-left">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Shop</h3>
                <ul className="mt-4 space-y-4 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Computers & Laptops</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Smartphones & Tablets</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Fashion & Apparel</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Consumer Electronics</a></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Support</h3>
                <ul className="mt-4 space-y-4 text-sm">
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Returns & Refunds</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Shipping & Delivery</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                </ul>
              </div>
            </div>
            
            {/* Contact & Location Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-200 tracking-wider uppercase">Contact Info</h3>
              <ul className="space-y-3 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-orange-400 shrink-0" />
                  <span>Ghaziabad, Uttar Pradesh, India</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-orange-400 shrink-0" />
                  <span>+91 120 4567890</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-orange-400 shrink-0" />
                  <span>support@hayroo.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400 text-left">
            &copy; {new Date().getFullYear()} Hayroo. All rights reserved. Built with pride in India.
          </p>
          <div className="flex space-x-6 text-xs text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Settings</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
