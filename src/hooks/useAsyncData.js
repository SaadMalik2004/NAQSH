import { useCallback, useEffect, useState } from "react";

// Loads data with loading + error states and a reload() function.
//   const { data, loading, error, reload } = useAsyncData(() => fetchMyOrders(), [userId]);
// `enabled: false` skips the request (e.g. until the user is known).
export function useAsyncData(fn, deps = [], { enabled = true } = {}) {
  const [tick, setTick] = useState(0);
  const [result, setResult] = useState({ id: null, data: null, error: null });
  const requestId = `${JSON.stringify(deps)}#${tick}`;

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    Promise.resolve()
      .then(fn)
      .then((data) => !cancelled && setResult({ id: requestId, data, error: null }))
      .catch((error) => !cancelled && setResult({ id: requestId, data: null, error }));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, enabled]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  const settled = result.id === requestId;

  return {
    data: settled ? result.data : null,
    error: settled ? result.error : null,
    loading: enabled && !settled,
    reload,
  };
}
