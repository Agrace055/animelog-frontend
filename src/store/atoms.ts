import { create } from "zustand";
import { Media, MediaType } from "../types";
import { authApi } from "../api/auth";
import { mediaApi } from "../api/media";
import { userApi } from "../api/user";
import { ApiError } from "../api/client";

// ── 本地用户从 localStorage 恢复 ──────────────────────────────────────────────
function loadStoredUser(): User | null {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }
}

// ── 后端 User → 前端 User 映射 ───────────────────────────────────────────────
function mapBackendUser(u: Record<string, any>): User {
  return {
    id: String(u.id),
    username: u.username ?? "",
    name: u.nickname ?? u.username ?? "",
    avatar: u.avatarUrl || `https://picsum.photos/seed/${u.username}/100/100`,
    role: u.role === "admin" ? "admin" : "user",
    email: u.email,
    phone: u.phone,
    joinDate: u.createdAt ? u.createdAt.slice(0, 10) : "",
    nsfwStatus: (u.nsfwStatus as User["nsfwStatus"]) ?? "none",
  };
}

export interface User {
  id: string;
  username: string; // unique
  name: string; // nickname
  avatar: string;
  role: "admin" | "user";
  email?: string;
  phone?: string;
  password?: string;
  joinDate: string;
  nsfwStatus: "none" | "pending" | "approved";
  nsfwReason?: string;
}

export interface MediaRecord {
  id: string;
  mediaId: string;
  type: MediaType;
  status: "want" | "watching" | "watched" | "paused" | "dropped";
  progress: number;
  rating: number;
  updatedAt: string;
}

export interface Review {
  id: string;
  mediaId: string;
  userId: string;
  content: string;
  status: "pending" | "approved" | "rejected";
  likes: number;
  dislikes: number;
  isReported: boolean;
  reportReason?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface CalendarItem {
  id: string;
  dayOfWeek: number; // 0=Mon, 6=Sun
  time: string;
  mediaId: string;
  episode: number;
}

interface AppState {
  user: User | null;
  allUsers: User[];
  records: MediaRecord[];
  favoriteIds: string[];
  world: "normal" | "hidden";
  darkMode: boolean;
  animes: Media[];
  novels: Media[];
  games: Media[];
  reviews: Review[];
  notifications: AppNotification[];
  calendarItems: CalendarItem[];
  /** 各模块加载状态 */
  loading: Record<string, boolean>;
  /** 全局错误信息 */
  error: string | null;

  // ── 同步操作 ──────────────────────────────────────────────────────────────
  setUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUserBaseInfo: (id: string, data: Partial<User>) => void;
  setRecords: (records: MediaRecord[]) => void;
  addRecord: (record: Omit<MediaRecord, "id" | "updatedAt">) => void;
  updateRecord: (id: string, data: Partial<MediaRecord>) => void;
  removeRecord: (id: string) => void;
  toggleFavorite: (mediaId: string) => void;
  setWorld: (world: "normal" | "hidden") => void;
  toggleDarkMode: () => void;
  updateMedia: (type: MediaType, id: string, data: Partial<Media>) => void;
  updateReviewStatus: (id: string, status: "approved" | "rejected") => void;
  updateCalendarItem: (id: string, data: Partial<CalendarItem>) => void;
  addCalendarItem: (item: Omit<CalendarItem, "id">) => void;
  deleteCalendarItem: (id: string) => void;
  updateCalendarItems: (items: CalendarItem[]) => void;
  addReview: (
    review: Omit<
      Review,
      "id" | "likes" | "dislikes" | "isReported" | "createdAt"
    >,
  ) => void;
  likeReview: (id: string) => void;
  dislikeReview: (id: string) => void;
  reportReview: (id: string, reason: string) => void;
  deleteReview: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  markNotificationAsRead: (id: string) => void;
  setNotifications: (notifications: AppNotification[]) => void;
  setCalendarItems: (items: CalendarItem[]) => void;
  setError: (msg: string | null) => void;

  // ── 异步 API actions ──────────────────────────────────────────────────────
  /** 登录并写入 token + user */
  loginAsync: (identifier: string, password: string) => Promise<void>;
  /** 验证码登录 */
  loginWithCodeAsync: (identifier: string, code: string) => Promise<void>;
  /** 注册新账号 */
  registerAsync: (params: {
    username: string;
    nickname: string;
    password: string;
    email?: string;
    phone?: string;
    code: string;
  }) => Promise<void>;
  /** 按类型加载媒体列表到 store */
  loadMedia: (
    type: MediaType,
    params?: { page?: number; size?: number; includeNsfw?: boolean },
  ) => Promise<void>;
  /** 搜索媒体 */
  searchMedia: (keyword: string, type?: MediaType) => Promise<Media[]>;
  /** 从 API 加载当前用户记录 */
  loadRecords: () => Promise<void>;
  /** 从 API 加载当前用户收藏 ID */
  loadFavorites: () => Promise<void>;
  /** 通过 API 切换收藏 */
  toggleFavoriteAsync: (mediaId: string) => Promise<void>;
  /** 从 API 加载媒体评价 */
  loadReviews: (mediaId: string) => Promise<void>;
  /** 通过 API 发表评价 */
  createReviewAsync: (
    mediaId: string,
    content: string,
    rating: number,
  ) => Promise<void>;
  /** 通过 API 点赞/踩 */
  likeReviewAsync: (reviewId: string) => Promise<void>;
  dislikeReviewAsync: (reviewId: string) => Promise<void>;
  /** 通过 API 举报评价 */
  reportReviewAsync: (reviewId: string, reason: string) => Promise<void>;
  /** 从 API 加载通知 */
  loadNotifications: () => Promise<void>;
  /** 通过 API 标记单条已读 */
  markNotificationReadAsync: (notificationId: string) => Promise<void>;
  /** 通过 API 全部已读 */
  markAllNotificationsReadAsync: () => Promise<void>;
  /** 从 API 加载日历 */
  loadCalendar: () => Promise<void>;
  /** 通过 API 更新用户信息 */
  updateProfileAsync: (data: {
    nickname?: string;
    email?: string;
    phone?: string;
    avatarUrl?: string;
  }) => Promise<void>;
  /** 修改密码（已登录状态） */
  changePasswordAsync: (oldPassword: string, newPassword: string) => Promise<void>;
  /** 通过 API 提交反馈 */
  submitFeedbackAsync: (type: string, content: string) => Promise<void>;
  /** 通过 API 申请 NSFW */
  applyNsfwAsync: (reason: string) => Promise<void>;
  /** 保存/更新媒体记录到 API */
  saveRecordAsync: (
    record: Omit<MediaRecord, "id" | "updatedAt"> & { id?: string },
  ) => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: loadStoredUser(),
  allUsers: [],
  records: [],
  favoriteIds: [],
  world: "normal",
  darkMode: localStorage.getItem("darkMode") === "true",
  animes: [],
  novels: [],
  games: [],
  reviews: [],
  notifications: [],
  calendarItems: [],
  loading: {},
  error: null,

  // ── 同步操作 ────────────────────────────────────────────────────────────────
  setUser: (user) => {
    saveUser(user);
    set({ user });
  },
  addUser: (user) => set((state) => ({ allUsers: [...state.allUsers, user] })),
  updateUserBaseInfo: (id, data) =>
    set((state) => {
      const next =
        state.user?.id === id ? { ...state.user, ...data } : state.user;
      if (next) saveUser(next);
      return {
        allUsers: state.allUsers.map((u) =>
          u.id === id ? { ...u, ...data } : u,
        ),
        user: next,
      };
    }),
  setRecords: (records) => set({ records }),
  addRecord: (record) =>
    set((state) => ({
      records: [
        ...state.records,
        {
          ...record,
          id: `r${Date.now()}`,
          updatedAt: new Date().toISOString(),
        },
      ],
    })),
  updateRecord: (id, data) =>
    set((state) => ({
      records: state.records.map((r) =>
        r.id === id
          ? { ...r, ...data, updatedAt: new Date().toISOString() }
          : r,
      ),
    })),
  removeRecord: (id) =>
    set((state) => ({ records: state.records.filter((r) => r.id !== id) })),
  toggleFavorite: (mediaId) =>
    set((state) => ({
      favoriteIds: state.favoriteIds.includes(mediaId)
        ? state.favoriteIds.filter((id) => id !== mediaId)
        : [...state.favoriteIds, mediaId],
    })),
  setWorld: (world) => set({ world }),
  toggleDarkMode: () =>
    set((state) => {
      const next = !state.darkMode;
      localStorage.setItem("darkMode", String(next));
      return { darkMode: next };
    }),
  updateMedia: (type, id, data) =>
    set((state) => {
      if (type === "anime")
        return {
          animes: state.animes.map((a) =>
            a.id === id ? { ...a, ...data } : a,
          ),
        };
      if (type === "novel")
        return {
          novels: state.novels.map((n) =>
            n.id === id ? { ...n, ...data } : n,
          ),
        };
      return {
        games: state.games.map((g) => (g.id === id ? { ...g, ...data } : g)),
      };
    }),
  updateReviewStatus: (id, status) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, status, isReported: false } : r,
      ),
    })),
  updateCalendarItem: (id, data) =>
    set((state) => ({
      calendarItems: state.calendarItems.map((c) =>
        c.id === id ? { ...c, ...data } : c,
      ),
    })),
  addCalendarItem: (item) =>
    set((state) => ({
      calendarItems: [
        ...state.calendarItems,
        { ...item, id: `c${Date.now()}` },
      ],
    })),
  deleteCalendarItem: (id) =>
    set((state) => ({
      calendarItems: state.calendarItems.filter((c) => c.id !== id),
    })),
  updateCalendarItems: (items) => set({ calendarItems: items }),
  addReview: (review) =>
    set((state) => ({
      reviews: [
        {
          ...review,
          id: `rev${Date.now()}`,
          likes: 0,
          dislikes: 0,
          isReported: false,
          createdAt: new Date().toISOString(),
        },
        ...state.reviews,
      ],
    })),
  likeReview: (id) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, likes: r.likes + 1 } : r,
      ),
    })),
  dislikeReview: (id) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, dislikes: r.dislikes + 1 } : r,
      ),
    })),
  reportReview: (id, reason) =>
    set((state) => ({
      reviews: state.reviews.map((r) =>
        r.id === id ? { ...r, isReported: true, reportReason: reason } : r,
      ),
    })),
  deleteReview: (id) =>
    set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) })),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
    })),
  markNotificationAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    })),
  setNotifications: (notifications) => set({ notifications }),
  setCalendarItems: (items) => set({ calendarItems: items }),
  setError: (error) => set({ error }),

  // ── 异步 API actions ────────────────────────────────────────────────────────
  loginAsync: async (identifier, password) => {
    set((s) => ({ loading: { ...s.loading, login: true }, error: null }));
    try {
      const result = await authApi.login(identifier, password);
      localStorage.setItem("token", result.token);
      const user = mapBackendUser(result.user as any);
      saveUser(user);
      set({ user });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "登录失败，请重试";
      set((s) => ({ error: msg, loading: { ...s.loading, login: false } }));
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, login: false } }));
    }
  },

  loginWithCodeAsync: async (identifier, code) => {
    set((s) => ({ loading: { ...s.loading, login: true }, error: null }));
    try {
      const result = await authApi.loginWithCode(identifier, code);
      localStorage.setItem("token", result.token);
      const user = mapBackendUser(result.user as any);
      saveUser(user);
      set({ user });
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "登录失败，请重试";
      set((s) => ({ error: msg, loading: { ...s.loading, login: false } }));
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, login: false } }));
    }
  },

  registerAsync: async (params) => {
    set((s) => ({ loading: { ...s.loading, register: true }, error: null }));
    try {
      await authApi.register(params);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "注册失败，请重试";
      set((s) => ({ error: msg, loading: { ...s.loading, register: false } }));
      throw e;
    } finally {
      set((s) => ({ loading: { ...s.loading, register: false } }));
    }
  },

  loadMedia: async (type, params = {}) => {
    const key = `media_${type}`;
    set((s) => ({ loading: { ...s.loading, [key]: true } }));
    try {
      const { world } = get();
      const result = await mediaApi.list({
        type,
        includeNsfw: world === "hidden",
        size: 100,
        ...params,
      });
      if (type === "anime") set({ animes: result.list });
      else if (type === "novel") set({ novels: result.list });
      else set({ games: result.list });
    } catch {
      // 保留现有数据
    } finally {
      set((s) => ({ loading: { ...s.loading, [key]: false } }));
    }
  },

  searchMedia: async (keyword, type) => {
    try {
      const result = await mediaApi.search({ keyword, type, size: 50 });
      return result.list;
    } catch {
      return [];
    }
  },

  loadRecords: async () => {
    const { user } = get();
    if (!user) return;
    set((s) => ({ loading: { ...s.loading, records: true } }));
    try {
      const raw = await userApi.records(user.id);
      const records: MediaRecord[] = raw.map((r) => ({
        id: String(r.id),
        mediaId: String(r.mediaId),
        type: "anime" as MediaType, // will be resolved via media lookup
        status: r.status as MediaRecord["status"],
        progress: r.progress,
        rating: r.rating,
        updatedAt: r.updatedAt,
      }));
      set({ records });
    } catch {
      // keep existing
    } finally {
      set((s) => ({ loading: { ...s.loading, records: false } }));
    }
  },

  loadFavorites: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const ids = await userApi.favorites(user.id);
      set({ favoriteIds: ids.map(String) });
    } catch {
      // keep existing
    }
  },

  toggleFavoriteAsync: async (mediaId) => {
    const { user, toggleFavorite } = get();
    // 乐观更新
    toggleFavorite(mediaId);
    if (!user) return;
    try {
      await userApi.toggleFavorite(user.id, Number(mediaId));
    } catch {
      // 失败则回滚
      toggleFavorite(mediaId);
    }
  },

  loadReviews: async (mediaId) => {
    set((s) => ({ loading: { ...s.loading, [`reviews_${mediaId}`]: true } }));
    try {
      const raw = await userApi.reviews(mediaId);
      const reviews: Review[] = raw.map((r) => ({
        id: String(r.id),
        mediaId: String(r.mediaId),
        userId: String(r.userId),
        content: r.content,
        status: r.status as Review["status"],
        likes: r.likeCount,
        dislikes: r.dislikeCount,
        isReported: r.reported,
        createdAt: r.createdAt,
      }));
      set((s) => ({
        reviews: [
          ...s.reviews.filter((r) => r.mediaId !== mediaId),
          ...reviews,
        ],
      }));
    } catch {
      // keep existing
    } finally {
      set((s) => ({
        loading: { ...s.loading, [`reviews_${mediaId}`]: false },
      }));
    }
  },

  createReviewAsync: async (mediaId, content, rating) => {
    const { user } = get();
    if (!user) return;
    const raw = await userApi.createReview(mediaId, {
      userId: Number(user.id),
      content,
      rating,
    });
    const review: Review = {
      id: String(raw.id),
      mediaId: String(raw.mediaId),
      userId: String(raw.userId),
      content: raw.content,
      status: raw.status as Review["status"],
      likes: raw.likeCount,
      dislikes: raw.dislikeCount,
      isReported: raw.reported,
      createdAt: raw.createdAt,
    };
    set((s) => ({ reviews: [review, ...s.reviews] }));
  },

  likeReviewAsync: async (reviewId) => {
    const { user, likeReview } = get();
    likeReview(reviewId);
    if (!user) return;
    try {
      await userApi.likeReview(reviewId, user.id);
    } catch {
      // 失败回滚
      set((s) => ({
        reviews: s.reviews.map((r) =>
          r.id === reviewId ? { ...r, likes: Math.max(0, r.likes - 1) } : r,
        ),
      }));
    }
  },

  dislikeReviewAsync: async (reviewId) => {
    const { user, dislikeReview } = get();
    dislikeReview(reviewId);
    if (!user) return;
    try {
      await userApi.dislikeReview(reviewId, user.id);
    } catch {
      set((s) => ({
        reviews: s.reviews.map((r) =>
          r.id === reviewId
            ? { ...r, dislikes: Math.max(0, r.dislikes - 1) }
            : r,
        ),
      }));
    }
  },

  reportReviewAsync: async (reviewId, reason) => {
    const { user, reportReview } = get();
    if (!user) return;
    await userApi.reportReview(reviewId, Number(user.id), reason);
    reportReview(reviewId, reason);
  },

  loadNotifications: async () => {
    const { user } = get();
    if (!user) return;
    set((s) => ({ loading: { ...s.loading, notifications: true } }));
    try {
      const raw = await userApi.notifications(user.id);
      const notifications: AppNotification[] = raw.map((n) => ({
        id: String(n.id),
        title: n.title,
        content: n.content,
        isRead: n.isRead ?? false,
        createdAt: n.createdAt,
      }));
      set({ notifications });
    } catch {
      // keep existing
    } finally {
      set((s) => ({ loading: { ...s.loading, notifications: false } }));
    }
  },

  markNotificationReadAsync: async (notificationId) => {
    const { user, markNotificationAsRead } = get();
    markNotificationAsRead(notificationId);
    if (!user) return;
    try {
      await userApi.markNotificationRead(user.id, notificationId);
    } catch {
      // keep local update
    }
  },

  markAllNotificationsReadAsync: async () => {
    const { user, markAllNotificationsAsRead } = get();
    markAllNotificationsAsRead();
    if (!user) return;
    try {
      await userApi.markAllNotificationsRead(user.id);
    } catch {
      // keep local update
    }
  },

  loadCalendar: async () => {
    set((s) => ({ loading: { ...s.loading, calendar: true } }));
    try {
      const raw = await userApi.calendar();
      const items: CalendarItem[] = raw.map((c) => ({
        id: String(c.id),
        dayOfWeek: c.dayOfWeek,
        time: c.airTime,
        mediaId: String(c.mediaId),
        episode: c.episode,
      }));
      set({ calendarItems: items });
    } catch {
      // keep existing
    } finally {
      set((s) => ({ loading: { ...s.loading, calendar: false } }));
    }
  },

  updateProfileAsync: async (data) => {
    const { user } = get();
    if (!user) return;
    const updated = await userApi.updateProfile(user.id, data);
    const next = mapBackendUser(updated as any);
    saveUser(next);
    set({ user: next });
  },

  changePasswordAsync: async (oldPassword, newPassword) => {
    const { user } = get();
    if (!user) return;
    await userApi.changePassword(user.id, oldPassword, newPassword);
  },

  submitFeedbackAsync: async (type, content) => {
    const { user } = get();
    await userApi.feedback({
      userId: user ? Number(user.id) : undefined,
      type,
      content,
    });
  },

  applyNsfwAsync: async (reason) => {
    const { user } = get();
    if (!user) return;
    await userApi.applyNsfw(Number(user.id), reason);
    const next = { ...user, nsfwStatus: "pending" as const };
    saveUser(next);
    set({ user: next });
  },

  saveRecordAsync: async (record) => {
    const { user, addRecord, updateRecord } = get();
    if (!user) return;
    const payload = {
      id: record.id ? Number(record.id) : undefined,
      mediaId: Number(record.mediaId),
      status: record.status,
      progress: record.progress,
      rating: record.rating,
    };
    const saved = await userApi.saveRecord(user.id, payload as any);
    if (record.id) {
      updateRecord(record.id, {
        status: saved.status as MediaRecord["status"],
        progress: saved.progress,
        rating: saved.rating,
        updatedAt: saved.updatedAt,
      });
    } else {
      addRecord({
        ...record,
        mediaId: String(saved.mediaId),
      });
    }
  },
}));
