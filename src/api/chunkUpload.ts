import { api } from "./client";

export const DEFAULT_CHUNK_SIZE = 4 * 1024 * 1024;

export interface ChunkUploadResult<T> {
  completed: boolean;
  receivedChunks: number;
  totalChunks: number;
  task?: T;
}

interface UploadFileInChunksOptions<T> {
  endpoint: string;
  file: File;
  chunkSize?: number;
  onProgress?: (progress: number) => void;
}

export async function uploadFileInChunks<T>({
  endpoint,
  file,
  chunkSize = DEFAULT_CHUNK_SIZE,
  onProgress,
}: UploadFileInChunksOptions<T>): Promise<T> {
  if (file.size === 0) {
    throw new Error("上传文件不能为空");
  }
  const uploadId = createUploadId();
  const totalChunks = Math.ceil(file.size / chunkSize);
  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * chunkSize;
    const chunk = file.slice(start, Math.min(start + chunkSize, file.size));
    const formData = new FormData();
    formData.append("file", chunk, file.name);
    formData.append("uploadId", uploadId);
    formData.append("filename", file.name);
    formData.append("chunkIndex", String(chunkIndex));
    formData.append("totalChunks", String(totalChunks));
    const result = await api.postForm<ChunkUploadResult<T>>(endpoint, formData);
    onProgress?.(Math.round(((chunkIndex + 1) / totalChunks) * 100));
    if (result.completed && result.task) {
      return result.task;
    }
  }
  throw new Error("上传完成但后续任务未创建");
}

function createUploadId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
