export interface User {
  id: number
  email: string
  nickname: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
}
