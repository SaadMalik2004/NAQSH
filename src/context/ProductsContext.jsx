/* eslint-disable react-refresh/only-export-components -- context + hook live together on purpose */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchProducts } from "../services/productService";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [tick, setTick] = useState(0);
  const [state, setState] = useState({ tick: -1, products: [], error: null });

  useEffect(() => {
    let cancelled = false;
    fetchProducts({ force: tick > 0 })
      .then((products) => !cancelled && setState({ tick, products, error: null }))
      .catch((error) => !cancelled && setState({ tick, products: [], error }));
    return () => {
      cancelled = true;
    };
  }, [tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const loading = state.tick !== tick;

  const value = useMemo(() => {
    const byId = new Map(state.products.map((p) => [p.id, p]));
    return {
      products: state.products,
      getProduct: (id) => byId.get(Number(id)),
      loading,
      error: loading ? null : state.error,
      reload,
    };
  }, [state, loading, reload]);

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error("useProducts must be used within a ProductsProvider");
  return ctx;
}
