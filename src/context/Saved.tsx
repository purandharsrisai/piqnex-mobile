import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Dialog";
import { getSavedIds, getUnreadCount } from "@/lib/data";
import { toggleSaved } from "@/lib/actions";
import { useAuth } from "./Auth";

interface Value {
  savedIds: Set<string>;
  isSaved: (id: string) => boolean;
  toggle: (id: string) => void;
  unread: number;
  refreshUnread: () => Promise<void>;
}
const Ctx = createContext<Value | null>(null);
export const useSaved = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useSaved outside SavedProvider");
  return v;
};

/** Saved-listing ids + the unread-message count for the tab badge. */
export function SavedProvider({ children }: { children: React.ReactNode }) {
  const { user, requireAuth } = useAuth();
  const [savedIds, setSaved] = useState<Set<string>>(new Set());
  const [unread, setUnread] = useState(0);

  const refreshUnread = useCallback(async () => { setUnread(user ? await getUnreadCount() : 0); }, [user]);

  useEffect(() => {
    if (!user) { setSaved(new Set()); setUnread(0); return; }
    getSavedIds().then((ids) => setSaved(new Set(ids)));
    refreshUnread();
    const t = setInterval(refreshUnread, 20000);
    return () => clearInterval(t);
  }, [user, refreshUnread]);

  const toggle = useCallback((id: string) => {
    requireAuth(() => {
      const wasSaved = savedIds.has(id);
      setSaved((prev) => { const n = new Set(prev); if (wasSaved) n.delete(id); else n.add(id); return n; });
      toggleSaved(id, !wasSaved).catch(() => {
        setSaved((prev) => { const n = new Set(prev); if (wasSaved) n.add(id); else n.delete(id); return n; });
        Alert.alert("Couldn't update saved items", "Please try again.");
      });
    });
  }, [requireAuth, savedIds]);

  const value = useMemo(() => ({ savedIds, isSaved: (id: string) => savedIds.has(id), toggle, unread, refreshUnread }), [savedIds, toggle, unread, refreshUnread]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
