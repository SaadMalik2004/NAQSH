import { Link } from "react-router-dom";
import { SITE } from "../../config/site";

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-white pt-20 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 pb-16 border-b border-slate-800">
          {/* Brand Manifesto */}
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-black tracking-[4px] mb-1">
              NAQSH
            </h2>
            <p className="text-xs uppercase tracking-[3px] text-blue-400 font-semibold mb-4">
              Wear Your Identity
            </p>
            <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-6">
              Rooted in Pakistani heritage and contemporary craft. Eastern menswear, festive lawn and artisan footwear.
            </p>
            <div className="flex gap-4">
              <a
                href={SITE.socials.instagram}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-white hover:text-slate-900 transition"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href={SITE.socials.facebook}
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-white hover:text-slate-900 transition"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            </div>
          </div>


          {/* Shop */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[3px] text-slate-300 mb-5">
              Collections
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li>
                <Link to="/shop?category=Men" className="hover:text-white transition">
                  Men's Essentials
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Women" className="hover:text-white transition">
                  Women's Tailoring
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Footwear" className="hover:text-white transition">
                  Footwear & Sneakers
                </Link>
              </li>
              <li>
                <Link to="/shop?category=Accessories" className="hover:text-white transition">
                  Accessories
                </Link>
              </li>
              <li>
                <Link to="/shop?sort=new" className="text-blue-400 hover:text-blue-300 transition">
                  New Arrivals
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[3px] text-slate-300 mb-5">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><Link to="/about" className="hover:text-white transition">About NAQSH</Link></li>
              <li><Link to="/size-guide" className="hover:text-white transition">Size Guide</Link></li>
              <li><Link to="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link to="/wishlist" className="hover:text-white transition">Wishlist</Link></li>
            </ul>
          </div>
          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-[3px] text-slate-300 mb-5">
              Customer Care
            </h4>
            <ul className="space-y-3 text-sm text-slate-400 font-medium">
              <li><Link to="/orders" className="hover:text-white transition">Order Status & Tracking</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition">Shipping & Returns</Link></li>
              <li><a href={`mailto:${SITE.email}`} className="hover:text-white transition">{SITE.email}</a></li>
              <li><span>{SITE.phone}</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} NAQSH. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
