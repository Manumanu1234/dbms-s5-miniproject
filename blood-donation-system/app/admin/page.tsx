"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth/auth-guard"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { DashboardStats } from "@/components/admin/dashboard-stats"
import { DonorsManagement } from "@/components/admin/donors-management"
import { BloodInventoryManagement } from "@/components/admin/blood-inventory"
import { EventsManagement } from "@/components/admin/events-management"
import { BloodRequestsManagement } from "@/components/admin/blood-requests"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Overview of blood donation system</p>
            </div>
            <DashboardStats />
          </div>
        )
      case "donors":
        return <DonorsManagement />
      case "inventory":
        return <BloodInventoryManagement />
      case "receivers":
        return <BloodRequestsManagement />
      case "events":
        return <EventsManagement />
      case "records":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation Records</h2>
            <p className="text-gray-600">This feature will be implemented in the next phase.</p>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <AuthGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="lg:pl-64">
          <main className="p-6 lg:p-8">{renderContent()}</main>
        </div>
      </div>
    </AuthGuard>
  )
}
