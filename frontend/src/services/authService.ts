import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "@/features/auth/types"
import { publicApi } from "@/services/api"

export const authService = {
  async login(body: LoginRequest): Promise<AuthResponse> {
    const res = await publicApi.post<AuthResponse>("/auth/login", body)
    return res.data
  },
  async register(body: RegisterRequest): Promise<AuthResponse> {
    const res = await publicApi.post<AuthResponse>("/auth/register", body)
    return res.data
  },
  async refresh(): Promise<{ accessToken: string }> {
    const res = await publicApi.post<{ accessToken: string }>(
      "/auth/refresh",
      null,
    )
    return res.data
  },
  async me(accessToken: string): Promise<User> {
    const res = await publicApi.get<User>("/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return res.data
  },
  async logout(): Promise<void> {
    await publicApi.post("/auth/logout", null)
  },
}
