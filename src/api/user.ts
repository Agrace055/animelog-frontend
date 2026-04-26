import { api } from "./client";
import type { BackendUser } from "./auth";

// ── 后端数据类型 ──────────────────────────────────────────────────────────────

export interface BackendRecord {
  id: number;
  userId: number;
  mediaId: number;
  status: string;
  progress: number;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendReview {
  id: number;
  mediaId: number;
  userId: number;
  content: string;
  rating: number;
  status: string;
  likeCount: number;
  dislikeCount: number;
  reported: boolean;
  createdAt: string;
}

export interface BackendNotification {
  id: number;
  title: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface BackendCalendarItem {
  id: number;
  mediaId: number;
  dayOfWeek: number;
  airTime: string;
  episode: number;
}

// ── API 调用 ──────────────────────────────────────────────────────────────────

export const userApi = {
  // 用户信息
  profile: (userId: string | number) =>
    api.get<BackendUser>(`/users/${userId}/profile`),

  updateProfile: (
    userId: string | number,
    data: {
      nickname?: string;
      email?: string;
      phone?: string;
      avatarUrl?: string;
    },
  ) => api.put<BackendUser>(`/users/${userId}/profile`, data),

  // 观看/阅读记录
  records: (userId: string | number) =>
    api.get<BackendRecord[]>(`/users/${userId}/records`),

  saveRecord: (
    userId: string | number,
    record: Partial<BackendRecord> & { mediaId: number; status: string },
  ) => api.post<BackendRecord>(`/users/${userId}/records`, record),

  // 收藏
  favorites: (userId: string | number) =>
    api.get<number[]>(`/users/${userId}/favorites`),

  toggleFavorite: (userId: string | number, mediaId: string | number) =>
    api.post<null>(`/users/${userId}/favorites/${mediaId}/toggle`),

  // 评价
  reviews: (mediaId: string | number) =>
    api.get<BackendReview[]>(`/media/${mediaId}/reviews`),

  createReview: (
    mediaId: string | number,
    review: { userId: number; content: string; rating?: number },
  ) => api.post<BackendReview>(`/media/${mediaId}/reviews`, review),

  reportReview: (
    reviewId: string | number,
    reporterUserId: number,
    reason: string,
  ) =>
    api.post<null>(`/reviews/${reviewId}/report`, { reporterUserId, reason }),

  likeReview: (reviewId: string | number, userId: string | number) =>
    api.post<null>(`/reviews/${reviewId}/like?userId=${userId}`),

  dislikeReview: (reviewId: string | number, userId: string | number) =>
    api.post<null>(`/reviews/${reviewId}/dislike?userId=${userId}`),

  // 通知
  notifications: (userId: string | number) =>
    api.get<BackendNotification[]>(`/users/${userId}/notifications`),

  markNotificationRead: (
    userId: string | number,
    notificationId: string | number,
  ) => api.patch<null>(`/users/${userId}/notifications/${notificationId}/read`),

  markAllNotificationsRead: (userId: string | number) =>
    api.patch<null>(`/users/${userId}/notifications/read-all`),

  // 日历
  calendar: () => api.get<BackendCalendarItem[]>("/calendar"),

  // 反馈
  feedback: (data: { userId?: number; type: string; content: string }) =>
    api.post<null>("/feedback", data),

  // NSFW 申请
  applyNsfw: (userId: number, reason: string) =>
    api.post<null>("/nsfw/applications", { userId, reason }),
};
