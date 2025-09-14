"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authManager } from "@/lib/auth"
import type { User } from "@/lib/types"

interface AuthGuardProps {
  children: React.ReactNode
  requiredRole?: "admin" | "donor"
  redirectTo?: string
}

export function AuthGuard({ children, requiredRole, redirectTo = "/auth" }: AuthGuardProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const currentUser = authManager.getCurrentUser()

    if (!currentUser) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && currentUser.role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      if (currentUser.role === "admin") {
        router.push("/admin")
      } else if (currentUser.role === "receiver") {
        router.push("/receiver")
      } else {
        router.push("/donor")
      }
      return
    }

    setUser(currentUser)
    setIsLoading(false)
  }, [router, requiredRole, redirectTo])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}
