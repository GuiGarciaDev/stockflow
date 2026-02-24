import api from "../api/axios";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
}

export const authService = {
  login: (data: LoginData) => api.post<UserInfo>("/auth/login", data),
  register: (data: RegisterData) => api.post<UserInfo>("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  getMe: () => api.get<UserInfo>("/auth/me"),
};
