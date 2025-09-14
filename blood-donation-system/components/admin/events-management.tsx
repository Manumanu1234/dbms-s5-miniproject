"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { apiClient } from "@/lib/api-client"
import type { DonationEvent } from "@/lib/types"
import { Calendar, MapPin, Users, Plus, Edit, Trash2, Clock, User, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EventFormProps {
  isEdit?: boolean
  formData: {
    title: string
    description: string
    date: string
    time: string
    location: string
    address: string
    capacity: string
    organizer: string
  }
  errors: Record<string, string>
  submitting: boolean
  onFormDataChange: (data: any) => void
  onErrorsChange: (errors: Record<string, string>) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
}

function EventForm({ 
  isEdit = false, 
  formData, 
  errors, 
  submitting, 
  onFormDataChange, 
  onErrorsChange, 
  onSubmit, 
  onCancel 
}: EventFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => {
              onFormDataChange({ ...formData, title: e.target.value })
              if (errors.title) {
                onErrorsChange({ ...errors, title: "" })
              }
            }}
            placeholder="Community Blood Drive"
            className={errors.title ? "border-red-500" : ""}
            required
          />
          {errors.title && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.title}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="organizer">Organizer</Label>
          <Input
            id="organizer"
            value={formData.organizer}
            onChange={(e) => {
              onFormDataChange({ ...formData, organizer: e.target.value })
              if (errors.organizer) {
                onErrorsChange({ ...errors, organizer: "" })
              }
            }}
            placeholder="City Blood Bank"
            className={errors.organizer ? "border-red-500" : ""}
            required
          />
          {errors.organizer && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.organizer}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => {
              onFormDataChange({ ...formData, date: e.target.value })
              if (errors.date) {
                onErrorsChange({ ...errors, date: "" })
              }
            }}
            className={errors.date ? "border-red-500" : ""}
            required
          />
          {errors.date && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.date}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={formData.time}
            onChange={(e) => {
              onFormDataChange({ ...formData, time: e.target.value })
              if (errors.time) {
                onErrorsChange({ ...errors, time: "" })
              }
            }}
            className={errors.time ? "border-red-500" : ""}
            required
          />
          {errors.time && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.time}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => {
              onFormDataChange({ ...formData, location: e.target.value })
              if (errors.location) {
                onErrorsChange({ ...errors, location: "" })
              }
            }}
            placeholder="Community Center"
            className={errors.location ? "border-red-500" : ""}
            required
          />
          {errors.location && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.location}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => {
              onFormDataChange({ ...formData, capacity: e.target.value })
              if (errors.capacity) {
                onErrorsChange({ ...errors, capacity: "" })
              }
            }}
            placeholder="50"
            className={errors.capacity ? "border-red-500" : ""}
            required
          />
          {errors.capacity && (
            <p className="text-sm text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              {errors.capacity}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Full Address</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => {
            onFormDataChange({ ...formData, address: e.target.value })
            if (errors.address) {
              onErrorsChange({ ...errors, address: "" })
            }
          }}
          placeholder="456 Community Ave, City, State 12345"
          className={errors.address ? "border-red-500" : ""}
          required
        />
        {errors.address && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors.address}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            onFormDataChange({ ...formData, description: e.target.value })
            if (errors.description) {
              onErrorsChange({ ...errors, description: "" })
            }
          }}
          placeholder="Join us for our monthly community blood drive..."
          rows={3}
          className={errors.description ? "border-red-500" : ""}
          required
        />
        {errors.description && (
          <p className="text-sm text-red-500 flex items-center">
            <AlertCircle className="h-3 w-3 mr-1" />
            {errors.description}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-red-600 hover:bg-red-700"
          disabled={submitting}
        >
          {submitting ? "Saving..." : (isEdit ? "Update Event" : "Create Event")}
        </Button>
      </div>
    </form>
  )
}

export function EventsManagement() {
  const [events, setEvents] = useState<any[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    address: "",
    capacity: "",
    organizer: "",
  })

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getEvents()
        if (response.data) {
          const sortedEvents = (response.data as any[]).sort((a, b) => {
            const dateA = new Date(a.date || a.event_date)
            const dateB = new Date(b.date || b.event_date)
            return dateB.getTime() - dateA.getTime()
          })
          setEvents(sortedEvents)
        }
      } catch (error) {
        console.error('Error fetching events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      address: "",
      capacity: "",
      organizer: "",
    })
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.address.trim()) newErrors.address = "Address is required"
    if (!formData.organizer.trim()) newErrors.organizer = "Organizer is required"
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      newErrors.capacity = "Capacity must be at least 1"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const newEvent = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        address: formData.address.trim(),
        capacity: parseInt(formData.capacity),
        organizer: formData.organizer.trim(),
        status: "upcoming"
      }

      const response = await apiClient.createEvent(newEvent)
      if (response.data) {
        setEvents([response.data, ...events])
        setIsCreateDialogOpen(false)
        resetForm()
        toast({
          title: "Success",
          description: "Event created successfully!",
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error('Error creating event:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to create event"
      
      // Handle authentication errors specifically
      if (errorMessage.includes('Authentication required')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth'
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingEvent) return
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)
    try {
      const updatedEvent = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        address: formData.address.trim(),
        capacity: parseInt(formData.capacity),
        organizer: formData.organizer.trim(),
      }

      const response = await apiClient.updateEvent(editingEvent.id, updatedEvent)
      if (response.data) {
        setEvents(events.map((e) => (e.id === editingEvent.id ? response.data : e)))
        setEditingEvent(null)
        resetForm()
        toast({
          title: "Success",
          description: "Event updated successfully!",
        })
      } else if (response.error) {
        throw new Error(response.error)
      }
    } catch (error) {
      console.error('Error updating event:', error)
      const errorMessage = error instanceof Error ? error.message : "Failed to update event"
      
      // Handle authentication errors specifically
      if (errorMessage.includes('Authentication required')) {
        toast({
          title: "Authentication Error",
          description: "Your session has expired. Please log in again.",
          variant: "destructive",
        })
        // Redirect to login after a short delay
        setTimeout(() => {
          window.location.href = '/auth'
        }, 2000)
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      try {
        const response = await apiClient.deleteEvent(eventId)
        if (response.error) {
          throw new Error(response.error)
        }
        setEvents(events.filter((e) => e.id !== eventId))
        toast({
          title: "Success",
          description: "Event deleted successfully!",
        })
      } catch (error) {
        console.error('Error deleting event:', error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete event",
          variant: "destructive",
        })
      }
    }
  }

  const handleStatusChange = async (eventId: string, newStatus: string) => {
    try {
      const updatedEvent = events.find((e) => e.id === eventId)
      if (updatedEvent) {
        const updated = { ...updatedEvent, status: newStatus }
        await apiClient.updateEvent(eventId, updated)
        setEvents(events.map((e) => (e.id === eventId ? updated : e)))
      }
    } catch (error) {
      console.error('Error updating event status:', error)
    }
  }

  const openEditDialog = (event: any) => {
    setEditingEvent(event)
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date || event.event_date,
      time: event.time || event.event_time,
      location: event.location,
      address: event.address,
      capacity: (event.capacity || event.max_capacity || 0).toString(),
      organizer: event.organizer,
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "upcoming":
        return <Badge className="bg-blue-600">Upcoming</Badge>
      case "ongoing":
        return <Badge className="bg-green-600">Ongoing</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleFormSubmit = (e: React.FormEvent, isEdit: boolean) => {
    if (isEdit) {
      handleEditEvent(e)
    } else {
      handleCreateEvent(e)
    }
  }

  const handleFormCancel = (isEdit: boolean) => {
    if (isEdit) {
      setEditingEvent(null)
    } else {
      setIsCreateDialogOpen(false)
    }
    resetForm()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Event Management</h2>
          <p className="text-gray-600">Organize and manage blood donation events</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <EventForm 
              formData={formData}
              errors={errors}
              submitting={submitting}
              onFormDataChange={setFormData}
              onErrorsChange={setErrors}
              onSubmit={(e) => handleFormSubmit(e, false)}
              onCancel={() => handleFormCancel(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Events List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-64"></div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-32"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No events created yet.</p>
              <p className="text-sm text-gray-400 mt-2">Create your first blood donation event to get started.</p>
            </CardContent>
          </Card>
        ) : (
          events.map((event) => {
            const eventDate = event.date || event.event_date
            const eventTime = event.time || event.event_time
            const capacity = event.capacity || event.max_capacity || 0
            const registeredCount = event.registered_donors?.length || event.registeredDonors?.length || 0
            const createdAt = event.created_at || event.createdAt
            
            return (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                        <span className="flex items-center">
                          <User className="h-3 w-3 mr-1" />
                          {event.organizer}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(eventDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {eventTime}
                        </span>
                      </div>
                    </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(event.status)}
                    <Select value={event.status} onValueChange={(value) => handleStatusChange(event.id, value)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{event.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      {registeredCount} / {capacity} registered
                    </span>
                  </div>
                  <div className="text-gray-600">Created: {new Date(createdAt).toLocaleDateString()}</div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    <strong>Address:</strong> {event.address}
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    <strong>Registration Progress:</strong>
                    <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-red-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min((registeredCount / capacity) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(event)}>
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            )
          })
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingEvent} onOpenChange={() => setEditingEvent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
          </DialogHeader>
          <EventForm 
            isEdit
            formData={formData}
            errors={errors}
            submitting={submitting}
            onFormDataChange={setFormData}
            onErrorsChange={setErrors}
            onSubmit={(e) => handleFormSubmit(e, true)}
            onCancel={() => handleFormCancel(true)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
