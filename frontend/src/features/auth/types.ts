export type User = {
  id: number
  name: string
  email: string
  role: "USER" | "ADMIN" | string
}

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export type AuthResponse = {
  user: User
  accessToken: string
}
