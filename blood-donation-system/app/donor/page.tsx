"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { Button } from "@/components/ui/button"
import { authManager } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { DonorProfileForm } from "@/components/donor/donor-profile-form"
import { DonationHistory } from "@/components/donor/donation-history"
import { UpcomingEvents } from "@/components/donor/upcoming-events"
import { Droplets, User, History, Calendar, LogOut, Heart } from "lucide-react"

export default function DonorPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const router = useRouter()

  const handleLogout = () => {
    authManager.logout()
    router.push("/")
  }

  const tabs = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "history", label: "Donation History", icon: History },
    { id: "events", label: "Events", icon: Calendar },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <DonorProfileForm />
      case "history":
        return <DonationHistory />
      case "events":
        return <UpcomingEvents />
      default:
        return null
    }
  }

  return (
    <AuthGuard requiredRole="donor">
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-red-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-red-600 p-2 rounded-full">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">BloodConnect</h1>
                  <p className="text-sm text-gray-600">Donor Dashboard</p>
                </div>
              </div>
              <Button variant="ghost" onClick={handleLogout} className="text-gray-700 hover:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* Navigation */}
        <nav className="bg-white border-b border-red-100">
          <div className="container mx-auto px-4">
            <div className="flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 py-4 px-2 border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-red-600 text-red-600"
                        : "border-transparent text-gray-600 hover:text-red-600 hover:border-red-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Message */}
            {activeTab === "profile" && (
              <div className="mb-8 text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <Heart className="h-8 w-8 text-red-500" />
                  <h2 className="text-3xl font-bold text-gray-900">Welcome, Hero!</h2>
                </div>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Thank you for being part of our life-saving community. Every donation you make has the potential to
                  save up to three lives.
                </p>
              </div>
            )}

            {renderContent()}
          </div>
        </main>
      </div>
    </AuthGuard>
  )
}
