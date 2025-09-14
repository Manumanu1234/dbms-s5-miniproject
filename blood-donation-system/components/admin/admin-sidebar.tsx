"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { authManager } from "@/lib/auth"
import { Users, Droplets, Calendar, BarChart3, Heart, Settings, LogOut, Menu, X, Activity } from "lucide-react"

interface AdminSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function AdminSidebar({ activeTab, onTabChange }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const router = useRouter()

  const handleLogout = () => {
    authManager.logout()
    router.push("/")
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: BarChart3 },
    { id: "donors", label: "Donors", icon: Users },
    { id: "receivers", label: "Blood Receivers", icon: Heart },
    { id: "inventory", label: "Blood Inventory", icon: Droplets },
    { id: "events", label: "Events", icon: Calendar },
    { id: "records", label: "Donation Records", icon: Activity },
  ]

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-red-100">
        <div className="flex items-center space-x-3">
          <div className="bg-red-600 p-2 rounded-full">
            <Droplets className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">BloodConnect</h2>
            <p className="text-sm text-gray-600">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeTab === item.id
                  ? "bg-red-600 text-white hover:bg-red-700"
                  : "text-gray-700 hover:bg-red-50 hover:text-red-700"
              }`}
              onClick={() => {
                onTabChange(item.id)
                setIsMobileOpen(false)
              }}
            >
              <Icon className="mr-3 h-4 w-4" />
              {item.label}
            </Button>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-red-100 space-y-2">
        <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-700">
          <Settings className="mr-3 h-4 w-4" />
          Settings
        </Button>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start text-gray-700 hover:bg-red-50 hover:text-red-700"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden fixed top-4 left-4 z-50 bg-white shadow-md"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
      >
        {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-red-100">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setIsMobileOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-red-100">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  )
}
