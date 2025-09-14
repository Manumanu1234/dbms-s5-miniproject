import type { User } from "./types"
import { apiClient } from "./api-client"

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
}

class AuthManager {
  private currentUser: User | null = null

  constructor() {
    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("blood_donation_current_user")
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser)
      }
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await apiClient.login(email, password)
      
      if (response.error) {
        return { success: false, error: response.error }
      }

      // Get user info after successful login
      const userResponse = await apiClient.getCurrentUser()
      if (userResponse.error || !userResponse.data) {
        return { success: false, error: "Failed to get user information" }
      }

      this.currentUser = userResponse.data as User
      
      // Normalize role for frontend consistency
      if (this.currentUser.role === 'recv') {
        this.currentUser.role = 'receiver'
      }
      
      if (typeof window !== "undefined") {
        localStorage.setItem("blood_donation_current_user", JSON.stringify(this.currentUser))
      }

      return { success: true, user: this.currentUser }
    } catch (error) {
      return { success: false, error: "Login failed" }
    }
  }

  async register(
    email: string,
    password: string,
    role: "admin" | "donor" | "receiver" = "donor",
  ): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      console.log('AuthManager register called with:', { email, role })
      const response = await apiClient.register(email, password, role)
      console.log('API response:', response)
      
      if (response.error) {
        console.log('API returned error:', response.error)
        return { success: false, error: response.error }
      }

      if (response.data) {
        this.currentUser = response.data as User
        
        // Normalize role for frontend consistency
        if (this.currentUser.role === 'recv') {
          this.currentUser.role = 'receiver'
        }
        
        if (typeof window !== "undefined") {
          localStorage.setItem("blood_donation_current_user", JSON.stringify(this.currentUser))
        }
        return { success: true, user: this.currentUser }
      }

      return { success: false, error: "Registration failed" }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'string' ? error : 
                          "Registration failed"
      return { success: false, error: errorMessage }
    }
  }

  logout(): void {
    this.currentUser = null
    apiClient.logout()
    if (typeof window !== "undefined") {
      localStorage.removeItem("blood_donation_current_user")
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null
  }

  isAdmin(): boolean {
    return this.currentUser?.role === "admin"
  }

  isDonor(): boolean {
    return this.currentUser?.role === "donor"
  }

  isReceiver(): boolean {
    return this.currentUser?.role === "receiver"
  }
}

export const authManager = new AuthManager()
