export interface User {
  id: string
  email: string
  password: string
  role: "admin" | "donor" | "receiver" | "recv"
  createdAt: string
}

export interface Donor {
  id: string
  userId: string
  name: string
  email: string
  phone: string
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  age: number
  weight: number
  address: string
  medicalHistory: string
  lastDonationDate?: string
  isEligible: boolean
  createdAt: string
}

export interface BloodReceiver {
  id: string
  name: string
  email: string
  phone: string
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  urgencyLevel: "low" | "medium" | "high" | "critical"
  unitsNeeded: number
  hospitalName: string
  doctorName: string
  medicalCondition: string
  requestDate: string
  status: "pending" | "fulfilled" | "cancelled"
}

export interface DonationEvent {
  id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  address: string
  capacity: number
  registeredDonors: string[]
  organizer: string
  status: "upcoming" | "ongoing" | "completed" | "cancelled"
  createdAt: string
}

export interface DonationRecord {
  id: string
  donorId: string
  eventId?: string
  donationDate: string
  bloodType: string
  unitsCollected: number
  testResults: {
    hiv: boolean
    hepatitisB: boolean
    hepatitisC: boolean
    syphilis: boolean
  }
  status: "collected" | "tested" | "approved" | "rejected"
  notes: string
}

export interface BloodInventory {
  bloodType: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
  unitsAvailable: number
  expiryDate: string
  lastUpdated: string
}
