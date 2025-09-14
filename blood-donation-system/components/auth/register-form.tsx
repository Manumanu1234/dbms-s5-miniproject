"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { authManager } from "@/lib/auth"
import { useRouter } from "next/navigation"

interface RegisterFormProps {
  onSuccess?: () => void
  defaultRole?: "admin" | "donor" | "receiver"
}

export function RegisterForm({ onSuccess, defaultRole = "donor" }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"admin" | "donor" | "receiver">(defaultRole)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setRole(defaultRole)
  }, [defaultRole])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)

    try {
      console.log('Registration attempt:', { email, role })
      const result = await authManager.register(email, password, role)
      console.log('Registration result:', result)

      if (result.success && result.user) {
        onSuccess?.()
        // Redirect based on user role
        if (result.user.role === "admin") {
          router.push("/admin")
        } else if (result.user.role === "receiver" || result.user.role === "recv") {
          router.push("/receiver")
        } else {
          router.push("/donor")
        }
      } else {
        console.log('Registration failed, error details:', result.error)
        console.log('Error type:', typeof result.error)
        
        let errorMessage = "Registration failed"
        
        if (typeof result.error === 'string') {
          errorMessage = result.error
        } else if (result.error && typeof result.error === 'object') {
          if ((result.error as any).message) {
            errorMessage = (result.error as any).message
          } else if ((result.error as any).detail) {
            errorMessage = (result.error as any).detail
          } else {
            errorMessage = JSON.stringify(result.error)
          }
        }
        
        console.log('Final error message:', errorMessage)
        setError(errorMessage)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 
                          typeof err === 'string' ? err : 
                          "An unexpected error occurred"
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-red-600">Create Account</CardTitle>
        <CardDescription>Join our blood donation community</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <Select value={role} onValueChange={(value: "admin" | "donor" | "receiver") => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="donor">Blood Donor</SelectItem>
                <SelectItem value="receiver">Blood Receiver</SelectItem>
                <SelectItem value="admin">Hospital Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
