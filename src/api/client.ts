/**
 * 统一 HTTP 请求客户端。
 * - 自动附加 Authorization: Bearer <token>（从 localStorage 读取）
 * - 统一解析 AjaxResult 结构 { code, msg, data }
 */

export class ApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function clearSessionAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  if (typeof window !== "undefined" && window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api/v1${path}`, { ...init, headers });
  const json = await res.json();

  if (res.status === 401 || json.code === 401) {
    clearSessionAndRedirect();
    throw new ApiError(401, json.msg ?? "登录已失效，请重新登录");
  }

  if (json.code !== 200) {
    throw new ApiError(json.code ?? res.status, json.msg ?? "请求失败");
  }
  return json.data as T;
}

async function requestForm<T>(path: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api/v1${path}`, {
    method: "POST",
    headers,
    body: formData,
  });
  const text = await res.text();
  const json = text
    ? tryParseJson(text, res.status, res.statusText)
    : { code: res.status, msg: res.statusText };

  if (res.status === 401 || json.code === 401) {
    clearSessionAndRedirect();
    throw new ApiError(401, json.msg ?? "登录已失效，请重新登录");
  }

  if (json.code !== 200) {
    throw new ApiError(json.code ?? res.status, json.msg ?? "请求失败");
  }
  return json.data as T;
}

function tryParseJson(text: string, status: number, statusText: string) {
  try {
    return JSON.parse(text);
  } catch {
    return { code: status, msg: statusText || "请求失败" };
  }
}

type Params = Record<string, string | number | boolean | undefined | null>;

function buildQuery(params?: Params): string {
  if (!params) return "";
  const pairs = Object.entries(params)
    .filter(([, v]) => v != null)
    .map(
      ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
    );
  return pairs.length ? `?${pairs.join("&")}` : "";
}

export const api = {
  get: <T>(path: string, params?: Params) =>
    request<T>(`${path}${buildQuery(params)}`),

  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "POST",
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  postForm: <T>(path: string, formData: FormData) =>
    requestForm<T>(path, formData),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PUT",
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: "PATCH",
      body: body != null ? JSON.stringify(body) : undefined,
    }),

  del: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
