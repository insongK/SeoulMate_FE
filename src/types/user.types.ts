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

export interface UserProfile {
  id: number
  email: string
  nickname: string
  vibes: string[]
  budget: number
  role: string
  createdAt: string
  savedCoursesCount: number
}

export interface UpdatePreferencesParams {
  vibes?: string[]
  regions?: string[]
  budget?: number
}

export interface UpdatePreferencesResult {
  vibes: string[]
  budget: number
  updatedAt: string
}
