import { api } from "./client";

export interface BangumiSource {
  id: number;
  bangumiId: number;
  mediaType: string;
  name: string;
  nameCn?: string;
  year?: number;
  episodeCount?: number;
  score?: number;
  nsfw: boolean;
  importedMediaId?: number;
}

export interface BangumiTask {
  id: number;
  taskType: string;
  status: string;
  currentStep?: string;
  requestPayload?: string;
  totalCount?: number;
  successCount?: number;
  skipCount?: number;
  updateCount?: number;
  failureCount?: number;
  errorMessage?: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  updatedAt: string;
}

export interface SourcesPageResult {
  list: BangumiSource[];
  total: number;
  page: number;
  size: number;
}

export const bangumiApi = {
  // 创建存档同步任务
  createArchiveSyncTask: () =>
    api.post<BangumiTask>("/admin/bangumi/tasks/archive-sync"),

  // 创建业务导入任务
  createImportTask: (bangumiIds: number[]) =>
    api.post<BangumiTask>("/admin/bangumi/tasks/import", { bangumiIds }),

  // 获取任务列表
  tasks: (limit = 50) =>
    api.get<BangumiTask[]>("/admin/bangumi/tasks", { limit }),

  // 查询 Bangumi 源条目
  sources: (params: {
    keyword?: string;
    mediaType?: string;
    year?: number;
    nsfw?: boolean;
    page?: number;
    size?: number;
  }) => api.get<SourcesPageResult>("/admin/bangumi/sources", params as any),
};
