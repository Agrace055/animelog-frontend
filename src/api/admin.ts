import { api } from "./client";
import type { BackendReview } from "./user";
import type { BackendCalendarItem } from "./user";

export interface BackendNsfwApplication {
  id: number;
  userId: number;
  username?: string;
  avatar?: string;
  reason: string;
  status: string;
  createdAt: string;
}

export interface BackendMedia {
  id: number;
  type: string;
  title: string;
  originalTitle?: string;
  year?: number;
  status: string;
  score?: number;
  nsfw: boolean;
  [key: string]: unknown;
}

export interface BackendFeedback {
  id: number;
  userId: number;
  type: string;
  content: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const adminApi = {
  // 媒体管理
  updateMedia: (id: string | number, data: Record<string, unknown>) =>
    api.put<BackendMedia>(`/admin/media/${id}`, data),

  // 评价审核
  reportedReviews: () => api.get<BackendReview[]>("/admin/reviews/reported"),

  approveReport: (reviewId: string | number) =>
    api.post<null>(`/admin/reviews/${reviewId}/approve-report`),

  deleteReview: (reviewId: string | number) =>
    api.del<null>(`/admin/reviews/${reviewId}`),

  // 日历管理
  createCalendarItem: (item: Omit<BackendCalendarItem, "id">) =>
    api.post<BackendCalendarItem>("/admin/calendar-items", item),

  updateCalendarItem: (
    id: string | number,
    item: Partial<BackendCalendarItem>,
  ) => api.put<BackendCalendarItem>(`/admin/calendar-items/${id}`, item),

  deleteCalendarItem: (id: string | number) =>
    api.del<null>(`/admin/calendar-items/${id}`),

  // NSFW 审核
  nsfwApplications: () =>
    api.get<BackendNsfwApplication[]>("/admin/nsfw/applications"),

  reviewNsfw: (
    id: string | number,
    action: "approve" | "reject",
    reviewerId: number,
  ) =>
    api.post<null>(
      `/admin/nsfw/applications/${id}/${action}?reviewerId=${reviewerId}`,
    ),

  // 用户反馈
  feedbacks: () => api.get<BackendFeedback[]>("/admin/feedback"),

  updateFeedbackStatus: (id: number, status: string) =>
    api.patch<null>(
      `/admin/feedback/${id}/status?status=${encodeURIComponent(status)}`,
    ),
};
