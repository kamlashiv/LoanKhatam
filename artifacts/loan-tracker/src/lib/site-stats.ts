import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSiteStats,
  trackVisit,
  getActivityFeed,
  getLikeStatus,
  addLike,
  type SiteStats,
  type ActivityItem,
} from "@workspace/api-client-react";

const VISITOR_KEY = "ledger-visitor-id";

/** Read or lazily create a persistent per-device visitor id. */
function getVisitorId(): string {
  if (typeof window === "undefined") return "server";
  try {
    const existing = window.localStorage.getItem(VISITOR_KEY);
    if (existing && existing.length >= 8) return existing;
    const id =
      (window.crypto?.randomUUID?.() ??
        `v-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`).replace(
        /-/g,
        "",
      );
    window.localStorage.setItem(VISITOR_KEY, id);
    return id;
  } catch {
    return `v-${Math.random().toString(36).slice(2, 14)}`;
  }
}

function wsUrl(visitorId: string): string | null {
  if (typeof window === "undefined") return null;
  const proto = window.location.protocol === "https:" ? "wss" : "ws";
  return `${proto}://${window.location.host}/api/ws?visitorId=${encodeURIComponent(visitorId)}`;
}

export type LiveSiteState = {
  stats: SiteStats | null;
  activity: ActivityItem[];
  connected: boolean;
  liked: boolean;
  like: () => void;
};

/**
 * Subscribes to real-time site stats + activity over WebSocket, with a polling
 * fallback when the socket is unavailable. Records this device's visit once on
 * mount and exposes a one-per-device like action.
 */
export function useLiveSiteStats(): LiveSiteState {
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [connected, setConnected] = useState(false);
  const [liked, setLiked] = useState(false);

  const visitorIdRef = useRef<string>("");
  const socketRef = useRef<WebSocket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const closedRef = useRef(false);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(() => {
    if (pollRef.current) return;
    const poll = async () => {
      try {
        const [s, a] = await Promise.all([getSiteStats(), getActivityFeed()]);
        setStats(s);
        setActivity(a.items);
      } catch {
        /* transient network error — keep last known values */
      }
    };
    void poll();
    pollRef.current = setInterval(poll, 5000);
  }, []);

  useEffect(() => {
    closedRef.current = false;
    const visitorId = getVisitorId();
    visitorIdRef.current = visitorId;

    // Record the visit (de-duplicated server-side) and seed initial stats.
    trackVisit({ visitorId })
      .then((s) => setStats(s))
      .catch(() => {
        /* fall back to whatever the socket/poll provides */
      });

    // Hydrate this device's like state.
    getLikeStatus({ visitorId })
      .then((res) => setLiked(res.liked))
      .catch(() => {});

    const url = wsUrl(visitorId);
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (closedRef.current || !url) {
        startPolling();
        return;
      }
      let socket: WebSocket;
      try {
        socket = new WebSocket(url);
      } catch {
        startPolling();
        return;
      }
      socketRef.current = socket;

      socket.onopen = () => {
        if (closedRef.current) {
          socket.close();
          return;
        }
        setConnected(true);
        stopPolling();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string);
          if (data?.stats) setStats(data.stats as SiteStats);
          if (Array.isArray(data?.activity)) {
            setActivity(data.activity as ActivityItem[]);
          }
        } catch {
          /* ignore malformed frames */
        }
      };

      const handleDrop = () => {
        setConnected(false);
        socketRef.current = null;
        if (closedRef.current) return;
        startPolling();
        // Try to re-establish the socket after a short delay.
        reconnectTimer = setTimeout(connect, 8000);
      };

      socket.onclose = handleDrop;
      socket.onerror = () => socket.close();
    };

    connect();

    return () => {
      closedRef.current = true;
      stopPolling();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [startPolling, stopPolling]);

  const like = useCallback(() => {
    if (liked) return;
    const visitorId = visitorIdRef.current || getVisitorId();
    setLiked(true); // optimistic
    addLike({ visitorId })
      .then((res) => {
        setLiked(res.liked);
        setStats((prev) =>
          prev ? { ...prev, totalLikes: res.totalLikes } : prev,
        );
      })
      .catch(() => setLiked(false));
  }, [liked]);

  return { stats, activity, connected, liked, like };
}
