import { api } from "./client";
import { uploadFileInChunks } from "./chunkUpload";

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
  pages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface BackendPageResult<T> {
  records: T[];
  total: number;
  pageNum: number;
  pageSize: number;
  pages: number;
  hasNext: boolean;
}

function mapPage<T>(raw: BackendPageResult<T>): SourcesPageResult {
  return {
    list: raw.records as BangumiSource[],
    total: raw.total,
    page: raw.pageNum,
    size: raw.pageSize,
    pages: raw.pages,
    hasNext: raw.hasNext,
    hasPrev: raw.pageNum > 1,
  };
}

export const bangumiApi = {
  // 创建存档同步任务
  createArchiveSyncTask: () =>
    api.post<BangumiTask>("/admin/bangumi/tasks/archive-sync"),

  // 分片上传存档压缩包并创建解析任务
  uploadArchive: async (
    file: File,
    onProgress?: (progress: number) => void,
  ) => {
    if (file.size === 0) {
      throw new Error("Bangumi 数据源压缩包不能为空");
    }
    return uploadFileInChunks<BangumiTask>({
      endpoint: "/admin/bangumi/archive/upload/chunk",
      file,
      onProgress,
    });
  },

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
  }) =>
    api
      .get<
        BackendPageResult<BangumiSource>
      >("/admin/bangumi/sources", params as any)
      .then(mapPage),
};
