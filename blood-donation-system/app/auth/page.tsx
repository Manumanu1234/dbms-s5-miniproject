"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { Heart, Droplets } from "lucide-react"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [defaultRole, setDefaultRole] = useState<'donor' | 'receiver' | 'admin'>('donor')
  const searchParams = useSearchParams()

  useEffect(() => {
    const roleParam = searchParams.get('role') as 'donor' | 'receiver' | 'admin'
    if (roleParam && ['donor', 'receiver', 'admin'].includes(roleParam)) {
      setDefaultRole(roleParam)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="bg-red-600 p-3 rounded-full">
              <Droplets className="h-8 w-8 text-white" />
            </div>
            <Heart className="h-6 w-6 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">BloodConnect swathi tochs toch</h1>
            <p className="text-gray-600 mt-2">Connecting donors, saving lives</p>
          </div>
        </div>

        {/* Auth Forms */}
        {isLogin ? <LoginForm /> : <RegisterForm defaultRole={defaultRole} />}

        {/* Toggle */}
        <div className="text-center">
          <Button variant="ghost" onClick={() => setIsLogin(!isLogin)} className="text-red-600 hover:text-red-700">
            {isLogin ? "Need an account? Sign up" : "Already have an account? Sign in"}
          </Button>
        </div>
      </div>
    </div>
  )
}
