import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { errorMessage } from "./api";

/** Loads data on screen focus (so lists refresh after you come back), with pull-to-refresh support. */
export function useQuery<T>(fn: () => Promise<T>, deps: unknown[] = [], opts: { pollMs?: number } = {}) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const alive = useRef(true);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);

  const load = useCallback(async (silent = false) => {
    try {
      const r = await fnRef.current();
      if (!alive.current) return;
      setData(r);
      setError(null);
    } catch (e) {
      if (!alive.current) return;
      if (!silent) setError(errorMessage(e, "We couldn't load this. Check your connection and try again."));
    } finally {
      if (alive.current) { setLoading(false); setRefreshing(false); }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(data !== null);
      if (!opts.pollMs) return;
      const t = setInterval(() => load(true), opts.pollMs);
      return () => clearInterval(t);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps),
  );

  const refresh = useCallback(() => { setRefreshing(true); return load(true); }, [load]);
  const reload = useCallback(() => { setLoading(true); return load(); }, [load]);
  return { data, error, loading, refreshing, refresh, reload, setData };
}
