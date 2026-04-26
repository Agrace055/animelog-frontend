import { api } from "./client";
import type { Media, MediaType } from "../types";
import { defaultCoverImage } from "../assets/defaultImages";

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
    coverImage: m.coverUrl || m.coverSourceUrl || defaultCoverImage,
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
  nsfw?: boolean;
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

interface BackendPageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

function mapPage<T, U>(
  raw: BackendPageResult<T>,
  mapper: (item: T) => U,
): PageResult<U> {
  return {
    list: raw.records.map(mapper),
    total: raw.total,
    page: raw.pageNum,
    size: raw.pageSize,
  };
}

export const mediaApi = {
  list: async (params: MediaListParams): Promise<PageResult<Media>> => {
    const raw = await api.get<BackendPageResult<Record<string, any>>>(
      "/media",
      params as any,
    );
    return mapPage(raw, mapMedia);
  },

  search: async (params: {
    keyword?: string;
    type?: MediaType;
    year?: number;
    nsfw?: boolean;
    page?: number;
    size?: number;
  }): Promise<PageResult<Media>> => {
    const raw = await api.get<BackendPageResult<Record<string, any>>>(
      "/media/search",
      params as any,
    );
    return mapPage(raw, mapMedia);
  },

  detail: async (id: string): Promise<Media> => {
    const raw = await api.get<Record<string, any>>(`/media/${id}`);
    return mapMedia(raw);
  },
};
