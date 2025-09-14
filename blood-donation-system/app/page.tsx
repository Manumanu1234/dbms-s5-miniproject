"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { authManager } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Droplets, Users, Calendar, Shield, Award } from "lucide-react"

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Check if user is already logged in
    const currentUser = authManager.getCurrentUser()
    if (currentUser) {
      if (currentUser.role === "admin") {
        router.push("/admin")
      } else if (currentUser.role === "receiver") {
        router.push("/receiver")
      } else {
        router.push("/donor")
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-red-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-red-600 p-2 rounded-full">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BloodConnect</h1>
              <p className="text-sm text-gray-600">Saving Lives Together</p>
            </div>
          </div>
          <Button onClick={() => router.push("/auth")} className="bg-red-600 hover:bg-red-700">
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold text-gray-900 text-balance">Every Drop Counts, Every Life Matters</h2>
            <p className="text-xl text-gray-600 text-balance max-w-2xl mx-auto">
              Join our community of heroes who save lives through blood donation. Connect with hospitals, track your
              donations, and make a difference.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => router.push("/auth?role=donor")}
              className="bg-red-600 hover:bg-red-700 text-lg px-8 py-3"
            >
              <Heart className="mr-2 h-5 w-5" />
              Start Donating
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/auth?role=receiver")}
              className="border-red-600 text-red-600 hover:bg-red-50 text-lg px-8 py-3"
            >
              Need Blood
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/auth?role=admin")}
              className="border-gray-600 text-gray-600 hover:bg-gray-50 text-lg px-8 py-3"
            >
              Hospital Login
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">Why Choose BloodConnect?</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Our platform makes blood donation simple, safe, and impactful for both donors and healthcare providers.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-red-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-red-100 p-3 rounded-full w-fit">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Easy Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Quick and simple donor registration with comprehensive health screening and eligibility checks.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-red-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-red-100 p-3 rounded-full w-fit">
                <Calendar className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Event Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Organize and participate in blood donation drives with real-time event tracking and notifications.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-red-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-red-100 p-3 rounded-full w-fit">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Secure & Safe</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Advanced security measures and comprehensive medical screening ensure safe donations for everyone.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-red-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-red-100 p-3 rounded-full w-fit">
                <Droplets className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Real-time Inventory</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Live blood inventory tracking helps hospitals manage supply and donors understand current needs.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-red-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-red-100 p-3 rounded-full w-fit">
                <Award className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Track Impact</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your donation history and see the real impact you're making in saving lives.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-red-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="bg-red-100 p-3 rounded-full w-fit">
                <Heart className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-red-900">Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Join a community of life-savers and connect with others who share your commitment to helping others.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Ready to Save Lives?</h3>
          <p className="text-xl mb-8 text-red-100">Join thousands of donors who are making a difference every day.</p>
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push("/auth")}
            className="bg-white text-red-600 hover:bg-red-50 text-lg px-8 py-3"
          >
            Get Started Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Droplets className="h-6 w-6 text-red-500" />
            <span className="text-xl font-bold">BloodConnect</span>
          </div>
          <p className="text-gray-400">© 2024 BloodConnect. Connecting donors, saving lives.</p>
        </div>
      </footer>
    </div>
  )
}
