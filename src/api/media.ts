import { api } from "./client";
import type { Media, MediaType } from "../types";

// ── 后端 → 前端类型映射 ─────────────────────────────────────────────────────

function mapStatus(s: string): "ongoing" | "completed" | "upcoming" {
  if (s === "completed" || s === "aired") return "completed";
  if (s === "upcoming") return "upcoming";
  return "ongoing";
}

export function mapMedia(m: Record<string, any>): Media {
  return {
    id: String(m.id),
    type: m.type as MediaType,
    title: m.title ?? "",
    originalTitle: m.originalTitle,
    coverImage: m.coverUrl || m.coverSourceUrl || "",
    year: m.year ?? 0,
    episodes: m.episodeCount,
    volumes: m.volumeCount,
    chapters: m.chapterCount,
    score: Number(m.score) || 0,
    tags: m.tags ?? [],
    characters: m.characters ?? [],
    staff: m.staff ?? [],
    status: mapStatus(m.status ?? ""),
    description: m.summary,
    isNsfw: m.nsfw === true,
  };
}

export interface MediaListParams {
  type?: MediaType;
  year?: number;
  status?: string;
  includeNsfw?: boolean;
  sort?: string;
  page?: number;
  size?: number;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

export const mediaApi = {
  list: async (params: MediaListParams): Promise<PageResult<Media>> => {
    const raw = await api.get<PageResult<Record<string, any>>>(
      "/media",
      params as any,
    );
    return { ...raw, list: raw.list.map(mapMedia) };
  },

  search: async (params: {
    keyword?: string;
    type?: MediaType;
    page?: number;
    size?: number;
  }): Promise<PageResult<Media>> => {
    const raw = await api.get<PageResult<Record<string, any>>>(
      "/media/search",
      params as any,
    );
    return { ...raw, list: raw.list.map(mapMedia) };
  },

  detail: async (id: string): Promise<Media> => {
    const raw = await api.get<Record<string, any>>(`/media/${id}`);
    return mapMedia(raw);
  },
};
