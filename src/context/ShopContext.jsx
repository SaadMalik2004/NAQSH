/* eslint-disable react-refresh/only-export-components -- context + hook live together on purpose */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useAuth, SIGNED_OUT_EVENT } from "./AuthContext";
import { useProducts } from "./ProductsContext";
import { SHOP_RULES } from "../config/site";
import { isSupabaseConfigured } from "../supabase/client";
import { validatePromo } from "../services/promoService";
import { addToWishlist, fetchWishlistIds, removeFromWishlist } from "../services/wishlistService";
import { limiters, formatWait } from "../utils/rateLimit";
import { getErrorMessage } from "../utils/errors";
import { defaultSize } from "../utils/format";

const ShopContext = createContext(null);

const CART_KEY = "naqsh_cart_v2";
const WISHLIST_KEY = "naqsh_wishlist_v2";
const PROMO_KEY = "naqsh_promo_v1";

const toastStyle = { background: "#0f172a", color: "#fff", borderRadius: "9999px", fontSize: "14px" };

function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function useStoredState(key, fallback) {
  const [value, setValue] = useState(() => readStorage(key, fallback));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full or blocked — app still works for this session */
    }
  }, [key, value]);
  return [value, setValue];
}

const maxFor = (product) => Math.max(0, Math.min(SHOP_RULES.maxQtyPerItem, product.stock ?? 0));

export function ShopProvider({ children }) {
  const { user } = useAuth();
  const { products, getProduct } = useProducts();
  const userId = user?.id ?? null;

  // The cart only stores ids — prices always come from the live catalogue.
  const [cartLines, setCartLines] = useStoredState(CART_KEY, []);
  const [wishlistIds, setWishlistIds] = useStoredState(WISHLIST_KEY, []);
  const [promo, setPromo] = useStoredState(PROMO_KEY, null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);

  // ---------- derived cart ----------
  const cart = useMemo(
    () =>
      cartLines
        .map((line) => ({ ...line, product: getProduct(line.productId) }))
        .filter((line) => line.product && line.product.sizes.includes(line.size)),
    [cartLines, getProduct]
  );

  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const cartSubtotal = cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const discountAmount = promo ? Math.round(cartSubtotal * promo.percent) / 100 : 0;
  const { freeShippingThreshold, flatShippingFee } = SHOP_RULES;
  const shippingFee = cartSubtotal === 0 || cartSubtotal >= freeShippingThreshold ? 0 : flatShippingFee;
  const cartTotal = cartSubtotal - discountAmount + shippingFee;
  const progressToFreeShipping = Math.min(100, (cartSubtotal / freeShippingThreshold) * 100);
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - cartSubtotal);

  // ---------- cart actions ----------
  const addToCart = useCallback(
    (product, size, quantity = 1) => {
      const chosenSize = size || defaultSize(product);
      const limit = maxFor(product);
      if (limit === 0) {
        toast.error("Sorry, this item is sold out.");
        return;
      }
      let clamped = false;
      setCartLines((prev) => {
        const idx = prev.findIndex((l) => l.productId === product.id && l.size === chosenSize);
        const current = idx > -1 ? prev[idx].quantity : 0;
        const next = Math.min(limit, current + quantity);
        clamped = current + quantity > limit;
        if (idx > -1) return prev.map((l, i) => (i === idx ? { ...l, quantity: next } : l));
        return [...prev, { id: `${product.id}-${chosenSize}`, productId: product.id, size: chosenSize, quantity: next }];
      });
      if (clamped) toast(`Only ${limit} available — quantity adjusted`, { icon: "ℹ️" });
      else
        toast.success(`Added ${product.name} (${chosenSize}) to your bag`, {
          style: toastStyle,
          iconTheme: { primary: "#3b82f6", secondary: "#fff" },
        });
      setIsCartOpen(true);
    },
    [setCartLines]
  );

  const removeFromCart = useCallback(
    (lineId) => {
      setCartLines((prev) => prev.filter((l) => l.id !== lineId));
      toast("Item removed from bag", { icon: "🗑️" });
    },
    [setCartLines]
  );

  const updateQuantity = useCallback(
    (lineId, newQty) => {
      if (newQty <= 0) return removeFromCart(lineId);
      setCartLines((prev) =>
        prev.map((l) => {
          if (l.id !== lineId) return l;
          const product = getProduct(l.productId);
          const limit = product ? maxFor(product) : SHOP_RULES.maxQtyPerItem;
          if (newQty > limit) toast(`Only ${limit} available`, { icon: "ℹ️" });
          return { ...l, quantity: Math.min(newQty, Math.max(1, limit)) };
        })
      );
      return undefined;
    },
    [setCartLines, removeFromCart, getProduct]
  );

  const clearCart = useCallback(() => {
    setCartLines([]);
    setPromo(null);
  }, [setCartLines, setPromo]);

  // ---------- promo code (validated by the database) ----------
  const applyPromo = useCallback(
    async (rawCode) => {
      const code = String(rawCode || "").trim().toUpperCase().slice(0, 30);
      if (!code) return { ok: false, message: "Enter a promo code" };
      const gate = limiters.promo.check();
      if (!gate.allowed)
        return { ok: false, message: `Too many attempts. Try again in ${formatWait(gate.retryAfterMs)}.` };
      if (!isSupabaseConfigured) return { ok: false, message: getErrorMessage(new Error("BACKEND_NOT_CONFIGURED")) };
      try {
        const result = await validatePromo(code, cartSubtotal);
        if (!result) {
          limiters.promo.hit();
          return { ok: false, message: "That promo code isn't valid for your bag." };
        }
        setPromo(result);
        return { ok: true, message: `Code ${result.code} applied — ${result.percent}% off` };
      } catch (error) {
        return { ok: false, message: getErrorMessage(error) };
      }
    },
    [cartSubtotal, setPromo]
  );

  const removePromo = useCallback(() => setPromo(null), [setPromo]);

  // ---------- wishlist (saved in the database when signed in) ----------
  const wishlist = useMemo(() => wishlistIds.map((id) => getProduct(id)).filter(Boolean), [wishlistIds, getProduct]);
  const isInWishlist = useCallback((id) => wishlistIds.includes(id), [wishlistIds]);

  const toggleWishlist = useCallback(
    async (product) => {
      const exists = wishlistIds.includes(product.id);
      setWishlistIds((prev) => (exists ? prev.filter((id) => id !== product.id) : [...prev, product.id]));
      toast(exists ? "Removed from wishlist" : "Saved to wishlist", { icon: exists ? "🤍" : "❤️", style: toastStyle });
      if (!userId) return;
      try {
        if (exists) await removeFromWishlist(userId, product.id);
        else await addToWishlist(userId, product.id);
      } catch (error) {
        // roll back the optimistic update
        setWishlistIds((prev) => (exists ? [...prev, product.id] : prev.filter((id) => id !== product.id)));
        toast.error(getErrorMessage(error, "Couldn't update your wishlist. Please try again."));
      }
    },
    [wishlistIds, setWishlistIds, userId]
  );

  // On sign-in: merge the guest wishlist with the saved one.
  useEffect(() => {
    if (!userId || !isSupabaseConfigured) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const remote = await fetchWishlistIds();
        if (cancelled) return;
        const local = readStorage(WISHLIST_KEY, []);
        const missing = local.filter((id) => !remote.includes(id));
        if (missing.length) await addToWishlist(userId, missing).catch(() => {});
        setWishlistIds([...new Set([...remote, ...local])]);
      } catch {
        /* keep the local wishlist if the network fails */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, setWishlistIds]);

  // On sign-out: clear personal data from this browser (shared-computer safety).
  useEffect(() => {
    const onSignedOut = () => {
      setWishlistIds([]);
      setPromo(null);
    };
    window.addEventListener(SIGNED_OUT_EVENT, onSignedOut);
    return () => window.removeEventListener(SIGNED_OUT_EVENT, onSignedOut);
  }, [setWishlistIds, setPromo]);

  const value = {
    products,
    cart,
    cartCount,
    cartSubtotal,
    discountAmount,
    shippingFee,
    cartTotal,
    promo,
    applyPromo,
    removePromo,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    wishlist,
    toggleWishlist,
    isInWishlist,
    quickViewProduct,
    setQuickViewProduct,
    freeShippingThreshold,
    progressToFreeShipping,
    amountToFreeShipping,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) throw new Error("useShop must be used within a ShopProvider");
  return context;
}
