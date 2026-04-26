import { api } from "./client";

export interface LoginResult {
  token: string;
  user: BackendUser;
}

export interface BackendUser {
  id: number;
  username: string;
  nickname: string;
  avatarUrl?: string;
  role: string;
  email?: string;
  phone?: string;
  nsfwStatus: string;
  createdAt: string;
}

export const authApi = {
  login: (identifier: string, password: string) =>
    api.post<LoginResult>("/auth/login", { identifier, password }),

  register: (params: {
    username: string;
    nickname: string;
    password: string;
    email?: string;
    phone?: string;
    code: string;
  }) => api.post<BackendUser>("/auth/register", params),

  sendEmailCode: (target: string, purpose: string) =>
    api.post<null>("/auth/code/email", { target, purpose }),

  sendSmsCode: (target: string, purpose: string) =>
    api.post<null>("/auth/code/sms", { target, purpose }),

  loginWithCode: (identifier: string, code: string) =>
    api.post<LoginResult>("/auth/login/code", { identifier, code }),

  resetPassword: (identifier: string, code: string, newPassword: string) =>
    api.post<null>("/auth/password/reset", { identifier, code, newPassword }),
};
