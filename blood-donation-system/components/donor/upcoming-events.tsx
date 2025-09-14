"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import { authManager } from "@/lib/auth"
import type { DonationEvent, Donor } from "@/lib/types"
import { Calendar, MapPin, Users, Clock, Heart } from "lucide-react"

export function UpcomingEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [donor, setDonor] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const currentUser = authManager.getCurrentUser()
        if (currentUser) {
          // Fetch donor profile and events in parallel
          const [donorResponse, eventsResponse] = await Promise.all([
            apiClient.getMyDonorProfile(),
            apiClient.getEvents()
          ])

          if (donorResponse.data) {
            setDonor(donorResponse.data)
          }

          if (eventsResponse.data) {
            const allEvents = eventsResponse.data as any[]
            const upcomingEvents = allEvents
              .filter((event) => event.status === "upcoming")
              .sort((a, b) => {
                const dateA = new Date(a.date || a.event_date)
                const dateB = new Date(b.date || b.event_date)
                return dateA.getTime() - dateB.getTime()
              })
            setEvents(upcomingEvents)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleRegister = async (eventId: string) => {
    if (!donor) return

    try {
      await apiClient.registerForEvent(eventId, donor.id)
      
      // Update local state
      const event = events.find((e) => e.id === eventId)
      if (event) {
        const registeredDonors = event.registered_donors || event.registeredDonors || []
        const updatedEvent = {
          ...event,
          registered_donors: [...registeredDonors, donor.id],
          registeredDonors: [...registeredDonors, donor.id],
        }
        setEvents(events.map((e) => (e.id === eventId ? updatedEvent : e)))
      }
    } catch (error) {
      console.error('Error registering for event:', error)
    }
  }

  const handleUnregister = async (eventId: string) => {
    if (!donor) return

    try {
      await apiClient.unregisterFromEvent(eventId, donor.id)
      
      // Update local state
      const event = events.find((e) => e.id === eventId)
      if (event) {
        const registeredDonors = event.registered_donors || event.registeredDonors || []
        const updatedEvent = {
          ...event,
          registered_donors: registeredDonors.filter((id: string) => id !== donor.id),
          registeredDonors: registeredDonors.filter((id: string) => id !== donor.id),
        }
        setEvents(events.map((e) => (e.id === eventId ? updatedEvent : e)))
      }
    } catch (error) {
      console.error('Error unregistering from event:', error)
    }
  }

  const isRegistered = (event: any) => {
    if (!donor) return false
    const registeredDonors = event.registered_donors || event.registeredDonors || []
    return registeredDonors.includes(donor.id)
  }

  const canRegister = (event: any) => {
    if (!donor) return false
    const isEligible = donor.is_eligible ?? donor.isEligible ?? true
    if (!isEligible) return false
    const registeredCount = (event.registered_donors || event.registeredDonors || []).length
    const capacity = event.capacity || event.max_capacity || 0
    return registeredCount < capacity
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-gray-200 rounded w-64 animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-8 bg-gray-200 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!donor) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-500">Please complete your donor profile to view events.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-red-600" />
          <span>Upcoming Blood Donation Events</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No upcoming events scheduled.</p>
            <p className="text-sm text-gray-400 mt-2">Check back later for new donation opportunities.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {events.map((event) => {
              const eventDate = event.date || event.event_date
              const eventTime = event.time || event.event_time
              const capacity = event.capacity || event.max_capacity || 0
              const registeredDonors = event.registered_donors || event.registeredDonors || []
              const isEligible = donor.is_eligible ?? donor.isEligible ?? true
              
              return (
                <div key={event.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                        {isRegistered(event) && (
                          <Badge className="bg-green-600">
                            <Heart className="h-3 w-3 mr-1" />
                            Registered
                          </Badge>
                        )}
                      </div>

                      <p className="text-gray-600 mb-4">{event.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span>
                            {new Date(eventDate).toLocaleDateString()} at {eventTime}
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{event.location}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span>
                            {registeredDonors.length} / {capacity} registered
                          </span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span>Organized by {event.organizer}</span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm text-gray-600">
                          <strong>Address:</strong> {event.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 min-w-[120px]">
                      {!isEligible ? (
                        <Button disabled variant="outline">
                          Not Eligible
                        </Button>
                      ) : isRegistered(event) ? (
                        <Button
                          variant="outline"
                          onClick={() => handleUnregister(event.id)}
                          className="border-red-600 text-red-600 hover:bg-red-50"
                        >
                          Unregister
                        </Button>
                      ) : canRegister(event) ? (
                        <Button onClick={() => handleRegister(event.id)} className="bg-red-600 hover:bg-red-700">
                          Register
                        </Button>
                      ) : (
                        <Button disabled variant="outline">
                          Event Full
                        </Button>
                      )}

                      <div className="text-xs text-center text-gray-500">
                        {capacity - registeredDonors.length} spots left
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
