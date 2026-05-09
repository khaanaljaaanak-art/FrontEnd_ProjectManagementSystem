import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import { fetchAdminUnreadSummary } from "../services/adminService";
import { fetchStudentUnreadSummary } from "../services/studentService";
import { fetchSupervisorUnreadSummary } from "../services/supervisorService";

const POLL_MS = 15_000;
const MAX_ACTIVE_TOASTS = 5;
const TOAST_DURATION = 4500;

const NotificationPollerContext = createContext({
  unreadCount: 0,
  refreshUnreadSummary: async () => {},
});

export function NotificationPollerProvider({ children }) {
  const { token, role } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const baselineDoneRef = useRef(false);
  const prevIdsRef = useRef(new Set());
  const toastEmittedRef = useRef(new Set());
  const activeToastsRef = useRef(0);
  const toastQueueRef = useRef([]);
  const intervalRef = useRef(null);

  const fetchSummary = useCallback(async () => {
    if (!token || !role) return null;
    try {
      if (role === "student") return await fetchStudentUnreadSummary();
      if (role === "supervisor") return await fetchSupervisorUnreadSummary();
      if (role === "admin") return await fetchAdminUnreadSummary();
    } catch {
      return null;
    }
    return null;
  }, [token, role]);

  const flushToastQueue = useCallback(() => {
    while (activeToastsRef.current < MAX_ACTIVE_TOASTS && toastQueueRef.current.length) {
      const next = toastQueueRef.current.shift();
      if (!next) break;
      activeToastsRef.current += 1;
      toast(next.title, { id: next.id, duration: TOAST_DURATION });
      window.setTimeout(() => {
        activeToastsRef.current -= 1;
        flushToastQueue();
      }, TOAST_DURATION);
    }
  }, []);

  const processPoll = useCallback(async () => {
    const data = await fetchSummary();
    if (!data || typeof data !== "object") return;

    const items = Array.isArray(data.items) ? data.items : [];

    const rawCount = data.count;
    let countNum =
      typeof rawCount === "number" && Number.isFinite(rawCount)
        ? rawCount
        : Number.parseInt(String(rawCount ?? ""), 10);
    if (!Number.isFinite(countNum) || countNum < 0) {
      countNum = items.length;
    }
    if (!Number.isFinite(countNum) || countNum < 0) return;
    const currentIds = new Set(items.map((i) => String(i._id)));

    setUnreadCount(Math.min(Math.floor(countNum), 99999));

    if (!baselineDoneRef.current) {
      baselineDoneRef.current = true;
      prevIdsRef.current = currentIds;
      return;
    }

    const prev = prevIdsRef.current;
    for (const item of items) {
      const sid = String(item._id);
      if (!prev.has(sid) && !toastEmittedRef.current.has(sid)) {
        toastEmittedRef.current.add(sid);
        toastQueueRef.current.push({
          id: sid,
          title: typeof item.title === "string" && item.title.trim() ? item.title.trim() : "New notification",
        });
      }
    }

    flushToastQueue();
    prevIdsRef.current = currentIds;
  }, [fetchSummary, flushToastQueue]);

  const refreshUnreadSummary = useCallback(async () => {
    await processPoll();
  }, [processPoll]);

  useEffect(() => {
    baselineDoneRef.current = false;
    prevIdsRef.current = new Set();
    toastEmittedRef.current = new Set();
    toastQueueRef.current = [];
    activeToastsRef.current = 0;
    setUnreadCount(0);
  }, [token, role]);

  useEffect(() => {
    if (!token || !["student", "supervisor", "admin"].includes(role)) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return undefined;
    }

    const tick = () => {
      void processPoll();
    };

    const startInterval = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        if (document.visibilityState === "visible") tick();
      }, POLL_MS);
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        tick();
        startInterval();
      } else if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    if (document.visibilityState === "visible") {
      tick();
      startInterval();
    }

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [token, role, processPoll]);

  const value = useMemo(
    () => ({
      unreadCount,
      refreshUnreadSummary,
    }),
    [unreadCount, refreshUnreadSummary]
  );

  return (
    <NotificationPollerContext.Provider value={value}>{children}</NotificationPollerContext.Provider>
  );
}

export function useNotificationPoller() {
  return useContext(NotificationPollerContext);
}
