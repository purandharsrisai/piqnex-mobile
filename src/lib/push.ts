import { useEffect } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import { DEMO_MODE } from "./api";
import { registerPushToken } from "./actions";
import { getItem } from "./storage";

export const PUSH_PREF_KEY = "piqnex_push_enabled";

function openFromPush(data: unknown) {
  const d = (data ?? {}) as { conversationId?: unknown; route?: unknown; url?: unknown };
  try {
    if (typeof d.conversationId === "string" && d.conversationId) router.push(`/chat/${d.conversationId}`);
    else if (typeof d.route === "string" && d.route.startsWith("/")) router.push(d.route as never);
    else if (typeof d.url === "string" && d.url.startsWith("/")) router.push(d.url as never);
    else router.push("/notifications");
  } catch { /* ignore */ }
}

/**
 * Registers this device for push notifications while someone is signed in, and opens the
 * right chat when a notification is tapped. No-op on web and in demo mode; never throws.
 */
export function usePushNotifications(userId: string | null) {
  useEffect(() => {
    if (!userId || DEMO_MODE || Platform.OS === "web") return;
    let cancelled = false;
    let sub: { remove: () => void } | null = null;

    (async () => {
      try {
        const pref = await getItem(PUSH_PREF_KEY);
        if (pref === "0" || pref === "false" || cancelled) return;

        const Notifications = await import("expo-notifications");
        const Device = await import("expo-device");
        const Constants = (await import("expo-constants")).default;

        Notifications.setNotificationHandler({
          handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
        });

        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("messages", {
            name: "Messages",
            importance: Notifications.AndroidImportance.HIGH,
            lightColor: "#f9582a",
          }).catch(() => {});
        }

        sub = Notifications.addNotificationResponseReceivedListener((resp) => openFromPush(resp.notification.request.content?.data));
        // App opened from a killed state by tapping a notification.
        const last = await Notifications.getLastNotificationResponseAsync().catch(() => null);
        if (last && !cancelled) openFromPush(last.notification.request.content?.data);

        if (!Device.isDevice) return;
        let { status } = await Notifications.getPermissionsAsync();
        if (status !== "granted") status = (await Notifications.requestPermissionsAsync()).status;
        if (status !== "granted" || cancelled) return;

        const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId;
        const { data: token } = await Notifications.getExpoPushTokenAsync(projectId ? { projectId } : undefined);
        if (token && !cancelled) await registerPushToken(token, Platform.OS).catch(() => {});
      } catch {
        /* push is best-effort */
      }
    })();

    return () => {
      cancelled = true;
      try { sub?.remove(); } catch { /* ignore */ }
    };
  }, [userId]);
}
