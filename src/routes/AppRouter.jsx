import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "../context/AuthContext";
import { ProductsProvider } from "../context/ProductsContext";
import { ShopProvider } from "../context/ShopContext";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

// Layout & global UI (needed on every page)
import AnnouncementBar from "../components/layout/AnnoucementBar";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CartDrawer from "../components/cart/CartDrawer";
import QuickViewModal from "../components/product/QuickViewModal";
import OfflineBanner from "../components/common/OfflineBanner";
import BackToTop from "../components/common/BackToTop";
import ErrorBoundary from "../components/common/ErrorBoundary";
import { PageLoader } from "../components/common/Spinner";

// Pages load on demand (lazy) so the first visit downloads less code.
import Home from "../pages/Home/Home";
const Shop = lazy(() => import("../pages/Shop/Shop"));
const Product = lazy(() => import("../pages/Product/Product"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Checkout = lazy(() => import("../pages/Checkout/Checkout"));
const Wishlist = lazy(() => import("../pages/Wishlist/Wishlist"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Register = lazy(() => import("../pages/Auth/Register"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword"));
const Profile = lazy(() => import("../pages/Account/Profile"));
const Orders = lazy(() => import("../pages/Account/Orders"));
const OrderDetail = lazy(() => import("../pages/Account/OrderDetail"));
const Contact = lazy(() => import("../pages/Info/Contact"));
const AdminDashboard = lazy(() => import("../pages/Admin/AdminDashboard"));
const NotFound = lazy(() => import("../pages/NotFound/NotFound"));
const About = lazy(() => import("../pages/Info/InfoPage").then((m) => ({ default: m.About })));
const Shipping = lazy(() => import("../pages/Info/InfoPage").then((m) => ({ default: m.Shipping })));
const SizeGuide = lazy(() => import("../pages/Info/InfoPage").then((m) => ({ default: m.SizeGuide })));
const Privacy = lazy(() => import("../pages/Info/InfoPage").then((m) => ({ default: m.Privacy })));
const Terms = lazy(() => import("../pages/Info/InfoPage").then((m) => ({ default: m.Terms })));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function AppRouter() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ProductsProvider>
            <ShopProvider>
              <ScrollToTop />
              <Toaster
                position="bottom-right"
                toastOptions={{
                  duration: 3000,
                  style: { background: "#0f172a", color: "#fff", borderRadius: "9999px", padding: "12px 24px", fontSize: "14px" },
                }}
              />

              <CartDrawer />
              <QuickViewModal />

              <div className="min-h-screen flex flex-col justify-between selection:bg-slate-900 selection:text-white">
                <div>
                  <OfflineBanner />
                  <AnnouncementBar />
                  <Navbar />
                  <main>
                    <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route path="/product/:id" element={<Product />} />
                        <Route path="/cart" element={<Cart />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/contact" element={<Contact />} />
                        <Route path="/about" element={<About />} />
                        <Route path="/shipping" element={<Shipping />} />
                        <Route path="/size-guide" element={<SizeGuide />} />
                        <Route path="/privacy" element={<Privacy />} />
                        <Route path="/terms" element={<Terms />} />

                        {/* Signed-in customers only */}
                        <Route element={<ProtectedRoute />}>
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/orders" element={<Orders />} />
                          <Route path="/orders/:orderNumber" element={<OrderDetail />} />
                        </Route>

                        {/* Admins only */}
                        <Route element={<AdminRoute />}>
                          <Route path="/admin" element={<AdminDashboard />} />
                        </Route>

                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
                <Footer />
              </div>
              <BackToTop />
            </ShopProvider>
          </ProductsProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
