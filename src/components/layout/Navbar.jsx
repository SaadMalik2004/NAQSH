import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Heart, Search, User, Menu, X, LogOut, Package, LayoutDashboard, UserCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useShop } from "../../context/ShopContext";
import { useAuth } from "../../context/AuthContext";
import { getErrorMessage } from "../../utils/errors";

export default function Navbar() {
  const { cartCount, wishlist, setIsCartOpen } = useShop();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);
  const { user, profile, isAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // close the account menu when clicking elsewhere
  useEffect(() => {
    if (!accountOpen) return undefined;
    const onClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

  const handleSignOut = async () => {
    setAccountOpen(false);
    setMobileMenuOpen(false);
    try {
      await signOut();
      toast.success("You've been signed out");
      navigate("/");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const displayName = profile?.full_name?.split(" ")[0] || user?.email?.split("@")[0] || "Account";

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop All", path: "/shop" },
    { name: "Men", path: "/shop?category=Men" },
    { name: "Women", path: "/shop?category=Women" },
    { name: "Footwear", path: "/shop?category=Footwear" },
    { name: "Accessories", path: "/shop?category=Accessories" },
    { name: "Sale", path: "/shop?sort=sale" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-20 px-6">
        {/* Mobile Hamburger Button */}
        <div className="flex items-center gap-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-800 hover:text-black"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Brand Logo */}
        <Link to="/" className="flex flex-col group">
          <span className="text-2xl md:text-3xl font-black tracking-[4px] text-slate-900 group-hover:text-blue-600 transition">
            NAQSH
          </span>
          <span className="text-[8px] md:text-[9px] uppercase tracking-[3px] text-gray-400 font-semibold -mt-1 group-hover:text-slate-600 transition">
            Wear Your Identity
          </span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 font-semibold text-sm text-slate-700">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`hover:text-blue-600 transition ${
                location.pathname + location.search === link.path
                  ? "text-blue-600 font-bold"
                  : ""
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action Icons */}
        <div className="flex items-center gap-4 md:gap-5">
          {/* Search Trigger */}
          <button
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            className="p-2 text-slate-700 hover:text-blue-600 transition"
            aria-label="Search"
          >
            <Search size={20} />
          </button>

          {/* Wishlist Link with Badge */}
          <Link
            to="/wishlist"
            className="p-2 text-slate-700 hover:text-red-500 transition relative"
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span className="absolute top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Account */}
          <div className="relative hidden sm:block" ref={accountRef}>
            {user ? (
              <>
                <button
                  onClick={() => setAccountOpen((o) => !o)}
                  className="flex items-center gap-2 p-2 text-slate-700 hover:text-blue-600 transition"
                  aria-label="Account menu"
                  aria-expanded={accountOpen}
                >
                  <User size={20} />
                  <span className="text-xs font-bold max-w-[80px] truncate hidden lg:inline">{displayName}</span>
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 text-sm z-50">
                    <Link to="/profile" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <UserCircle size={16} /> My Profile
                    </Link>
                    <Link to="/orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50">
                      <Package size={16} /> My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-blue-600 font-semibold">
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-red-500 border-t border-gray-100 mt-1">
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="p-2 text-slate-700 hover:text-blue-600 transition flex items-center gap-2" aria-label="Sign in">
                <User size={20} />
                <span className="text-xs font-bold hidden lg:inline">Sign in</span>
              </Link>
            )}
          </div>

          {/* Cart Drawer Trigger with Live Badge */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="p-2 text-slate-900 hover:text-blue-600 transition relative"
            aria-label="Shopping Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute top-1 -right-1 bg-slate-900 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expandable Search Bar */}
      {isSearchOpen && (
        <div className="bg-slate-50 border-t border-gray-100 px-6 py-4 animate-in fade-in duration-200">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="absolute left-4 text-gray-400 w-5 h-5 pointer-events-none" />
              <input
                type="text"
                autoFocus
                placeholder="Search kurta, lawn, chappal, khussa, shawl..."
                aria-label="Search products"
                maxLength={80}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-full pl-12 pr-24 py-3 text-sm focus:outline-hidden focus:border-slate-900 shadow-xs"
              />
              <button
                type="submit"
                className="absolute right-2 bg-slate-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-black"
              >
                Search
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-6 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-3 font-semibold text-base text-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 hover:text-blue-600 transition"
              >
                {link.name}
              </Link>
            ))}
            <Link
              to="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="py-1 text-slate-700 flex justify-between items-center"
            >
              <span>Wishlist</span>
              {wishlist.length > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {wishlist.length}
                </span>
              )}
            </Link>
            {user ? (
              <>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="py-1 text-slate-700">My Profile</Link>
                <Link to="/orders" onClick={() => setMobileMenuOpen(false)} className="py-1 text-slate-700">My Orders</Link>
                {isAdmin && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="py-1 text-blue-600">Admin Dashboard</Link>
                )}
                <button onClick={handleSignOut} className="py-1 text-left text-red-500">Sign Out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="py-1 text-slate-700">
                Sign In / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}