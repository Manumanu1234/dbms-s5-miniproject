"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient } from "@/lib/api-client"
import { Users, Heart, Calendar, Droplets, TrendingUp, AlertTriangle } from "lucide-react"

export function DashboardStats() {
  const [stats, setStats] = useState({
    totalDonors: 0,
    totalReceivers: 0,
    upcomingEvents: 0,
    totalBloodUnits: 0,
    criticalRequests: 0,
    recentDonations: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [donorsRes, eventsRes, inventoryRes, requestsRes, recordsRes] = await Promise.all([
          apiClient.getDonors(),
          apiClient.getEvents(),
          apiClient.getBloodInventory(),
          apiClient.getBloodRequests(),
          apiClient.getDonationRecords()
        ])

        const donors = (donorsRes.data as any[]) || []
        const events = (eventsRes.data as any[]) || []
        const inventory = (inventoryRes.data as any[]) || []
        const requests = (requestsRes.data as any[]) || []
        const records = (recordsRes.data as any[]) || []

        const upcomingEvents = events.filter((event: any) => event.status === "upcoming").length
        const totalBloodUnits = inventory.reduce((sum: number, item: any) => sum + (item.units_available || item.unitsAvailable || 0), 0)
        const criticalRequests = requests.filter((request: any) => request.urgency_level === "critical").length
        const recentDonations = records.filter((record: any) => {
          const donationDate = new Date(record.donation_date || record.donationDate)
          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
          return donationDate >= thirtyDaysAgo
        }).length

        setStats({
          totalDonors: donors.length,
          totalReceivers: requests.length,
          upcomingEvents,
          totalBloodUnits,
          criticalRequests,
          recentDonations,
        })
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Donors",
      value: stats.totalDonors,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Blood Requests",
      value: stats.totalReceivers,
      icon: Heart,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Upcoming Events",
      value: stats.upcomingEvents,
      icon: Calendar,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Blood Units Available",
      value: stats.totalBloodUnits,
      icon: Droplets,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Critical Requests",
      value: stats.criticalRequests,
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Recent Donations",
      value: stats.recentDonations,
      icon: TrendingUp,
      color: "text-teal-600",
      bgColor: "bg-teal-100",
    },
  ]

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
