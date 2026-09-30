import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useProducts } from "../../context/ProductsContext";
import { useShop } from "../../context/ShopContext";
import ProductCard from "../../components/product/ProductCard";
import FindYourFitModal from "../../components/common/FindYourFitModal";
import ProductReviews from "../../components/product/ProductReviews";
import { Skeleton } from "../../components/common/Skeleton";
import ErrorState from "../../components/common/ErrorState";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { defaultSize, isApparelSize } from "../../utils/format";
import { SHOP_RULES } from "../../config/site";
import {
  Star,
  ShoppingBag,
  Heart,
  Ruler,
  Truck,
  RotateCcw,
  ShieldCheck,
  Check,
  ChevronRight,
  Sparkles,
} from "lucide-react";

function ProductSkeleton() {
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 bg-white rounded-3xl p-10" role="status" aria-label="Loading product">
        <Skeleton className="h-[520px] rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-14 w-full rounded-full" />
        </div>
      </div>
    </div>
  );
}

export default function Product() {
  const { id } = useParams();
  const { products, getProduct, loading, error, reload } = useProducts();
  const product = getProduct(id);

  useDocumentTitle(product?.name);

  if (loading) return <ProductSkeleton />;
  if (error)
    return (
      <div className="py-16 px-6">
        <ErrorState onRetry={reload} />
      </div>
    );
  if (!product)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <h1 className="text-6xl font-black text-slate-900">404</h1>
        <h2 className="text-2xl font-semibold">Product not found</h2>
        <p className="text-gray-500 text-sm">This piece may have been removed or the link is incorrect.</p>
        <Link to="/shop" className="bg-slate-900 text-white px-6 py-3 rounded-full hover:bg-black transition text-sm font-semibold">
          Browse the collection
        </Link>
      </div>
    );

  // key={id} resets size / quantity when moving between products
  return <ProductDetail key={product.id} product={product} products={products} />;
}

function ProductDetail({ product, products }) {
  const { addToCart, toggleWishlist, isInWishlist } = useShop();
  const sizes = product.sizes;
  const [selectedSize, setSelectedSize] = useState(defaultSize(product));
  const [quantity, setQuantity] = useState(1);
  const [isFitModalOpen, setIsFitModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const isWishlisted = isInWishlist(product.id);
  const apparel = isApparelSize(sizes);
  const maxQty = Math.max(0, Math.min(SHOP_RULES.maxQtyPerItem, product.stock));
  const soldOut = maxQty === 0;
  const lowStock = !soldOut && product.stock <= 5;

  // Same category first, then fill up with other products
  const relatedProducts = [
    ...products.filter((p) => p.id !== product.id && p.category === product.category),
    ...products.filter((p) => p.id !== product.id && p.category !== product.category),
  ].slice(0, 4);

  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-8">
      {/* Fit Advisor Modal */}
      <FindYourFitModal
        isOpen={isFitModalOpen}
        onClose={() => setIsFitModalOpen(false)}
        onSelectSize={(size) => setSelectedSize(size)}
      />

      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-8">
          <Link to="/" className="hover:text-slate-900 transition">
            Home
          </Link>
          <ChevronRight size={12} />
          <Link to="/shop" className="hover:text-slate-900 transition">
            Shop
          </Link>
          <ChevronRight size={12} />
          <Link
            to={`/shop?category=${product.category}`}
            className="hover:text-slate-900 transition"
          >
            {product.category}
          </Link>
          <ChevronRight size={12} />
          <span className="text-slate-900 font-semibold truncate max-w-xs">
            {product.name}
          </span>
        </div>

        {/* Main Product Showcase Grid */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs mb-16">
          {/* Left: Product Images */}
          <div className="space-y-4">
            <div className="relative bg-[#F8F5F1] rounded-3xl overflow-hidden flex items-center justify-center p-8 group">
              <img
                src={product.image}
                alt={product.name}
                className="w-full max-h-[520px] object-contain drop-shadow-xl transition duration-500 group-hover:scale-105"
              />

              {product.badge && (
                <span className="absolute top-6 left-6 bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-full">
                  {product.badge}
                </span>
              )}

              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-6 right-6 w-12 h-12 rounded-full shadow-md flex items-center justify-center transition ${
                  isWishlisted
                    ? "bg-red-50 text-red-500"
                    : "bg-white text-slate-800 hover:bg-slate-900 hover:text-white"
                }`}
                aria-label="Wishlist"
              >
                <Heart size={20} className={isWishlisted ? "fill-red-500" : ""} />
              </button>
            </div>

            {/* Model stats banner */}
            {apparel && (
            <div className="bg-stone-50 border border-stone-200/70 rounded-2xl p-4 flex items-center justify-between text-xs text-stone-700">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                <span>
                  Model is <strong>6'1" (185 cm)</strong> wearing <strong>Size Large</strong>
                </span>
              </div>
              <span className="font-semibold text-slate-900">Intentional Drape</span>
            </div>
            )}
          </div>

          {/* Right: Product Details & Purchase Form */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="uppercase tracking-[4px] text-xs font-bold text-blue-600 mb-2">
                {product.category} COLLECTION
              </p>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-1 text-yellow-400">
                  <Star size={18} className="fill-yellow-400" />
                  <span className="font-bold text-slate-900 text-base">
                    {product.reviews > 0 ? product.rating.toFixed(1) : "New"}
                  </span>
                </div>
                <span className="text-gray-400 text-sm">
                  {product.reviews > 0
                    ? `• ${product.reviews} verified ${product.reviews === 1 ? "review" : "reviews"}`
                    : "• No reviews yet"}
                </span>
              </div>

              {/* Pricing */}
              <div className="flex items-baseline gap-4 mb-8">
                <span className="text-4xl font-extrabold text-slate-900">
                  ${product.price.toFixed(2)}
                </span>
                {product.oldPrice && (
                  <span className="text-xl line-through text-gray-400">
                    ${product.oldPrice.toFixed(2)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    Save {discount}% Today
                  </span>
                )}
              </div>

              {/* Sizing Section */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    Select Size
                  </span>
                  {apparel && (
                    <button
                      onClick={() => setIsFitModalOpen(true)}
                      className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition underline underline-offset-4"
                    >
                      <Ruler size={14} /> NAQSH™ Fit Advisor
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                  {sizes.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`h-12 rounded-2xl text-sm font-bold border transition ${
                        selectedSize === s
                          ? "border-slate-900 bg-slate-900 text-white shadow-md"
                          : "border-gray-200 text-slate-800 hover:border-slate-400"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add to Bag and Quantity */}
              <div className="flex gap-4 mb-8">
                <div className="flex items-center border border-gray-200 rounded-full px-3 py-2 bg-gray-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 text-gray-600 hover:text-slate-900 font-bold"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(Math.max(1, maxQty), quantity + 1))}
                    className="w-8 h-8 text-gray-600 hover:text-slate-900 font-bold"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => addToCart(product, selectedSize, quantity)}
                  disabled={soldOut}
                  className="flex-1 bg-slate-900 text-white rounded-full py-4 font-semibold text-sm hover:bg-black transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 active:scale-98 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
                >
                  <ShoppingBag size={18} />
                  {soldOut ? "Sold Out" : `Add to Bag • $${(product.price * quantity).toFixed(2)}`}
                </button>
              </div>

              {/* Highlights & Guarantees */}
              <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-6 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Truck size={16} className="text-slate-900" />
                  <span>Free delivery over ${SHOP_RULES.freeShippingThreshold}</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw size={16} className="text-slate-900" />
                  <span>30-Day Fit Guarantee</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-slate-900" />
                  <span>Premium Quality Fabrics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Check size={16} className={soldOut ? "text-red-500" : "text-emerald-600"} />
                  <span>{soldOut ? "Currently sold out" : lowStock ? `Only ${product.stock} left in stock` : "In Stock & Ready to Ship"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs (Details / Fabric / Size Specs / Care) */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xs mb-16">
          <div className="flex border-b border-gray-100 gap-8 mb-6">
            {["details", "fabric", "care"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-bold capitalize transition border-b-2 -mb-[2px] ${
                  activeTab === tab
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-gray-400 hover:text-slate-600"
                }`}
              >
                {tab === "details" && "Garment Construction"}
                {tab === "fabric" && "Fabric & Sizing"}
                {tab === "care" && "Care Instructions"}
              </button>
            ))}
          </div>

          <div className="text-sm text-gray-600 leading-relaxed max-w-3xl">
            {activeTab === "details" && (
              <div className="space-y-3">
                <p>{product.description}</p>
                <ul className="list-disc list-inside space-y-1 text-xs text-gray-500">
                  <li>Reinforced stitching at all stress points</li>
                  <li>Finished by hand for a refined, seamless look</li>
                  <li>Quality-checked before every dispatch</li>
                </ul>
              </div>
            )}
            {activeTab === "fabric" && (
              <div className="space-y-3">
                <p>
                  Every NAQSH piece is made from carefully selected fabrics and finished with attention to detail.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 mt-2">
                  <div className="bg-stone-50 p-4 rounded-2xl">
                    <span className="font-bold text-slate-900 block text-xs">CATEGORY</span>
                    <span className="text-xs text-gray-500">{product.category} · {product.subCategory}</span>
                  </div>
                  <div className="bg-stone-50 p-4 rounded-2xl">
                    <span className="font-bold text-slate-900 block text-xs">AVAILABLE SIZES</span>
                    <span className="text-xs text-gray-500">{product.sizes.join(" · ")}</span>
                  </div>
                </div>
              </div>
            )}
            {activeTab === "care" && (
              <div className="space-y-2 text-xs text-gray-500">
                <p>• Follow the care label sewn into the garment</p>
                <p>• Embroidered, silk and leather pieces: dry clean or wipe gently — avoid soaking</p>
                <p>• Store in a cool, dry place away from direct sunlight</p>
              </div>
            )}
          </div>
        </div>

        <ProductReviews product={product} />

        {/* Complete The Look / Related Products */}
        <div>
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="uppercase tracking-[4px] text-xs font-bold text-blue-600 mb-1">
                PAIR WITH
              </p>
              <h2 className="text-3xl font-black text-slate-900">
                Complete The Look
              </h2>
            </div>
            <Link
              to="/shop"
              className="text-xs font-bold text-slate-900 hover:underline"
            >
              View All Styles →
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}