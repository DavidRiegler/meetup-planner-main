export interface User {
  id: string
  username: string
  fullName: string
  createdAt: Date
}

export interface Meetup {
  id: string
  title: string
  description: string
  location: string
  date: Date
  time: string
  endDate?: Date // Added for multi-day support
  endTime?: string // Added for multi-day support
  hostId: string
  hostUsername: string
  code: string
  hasAlcohol: boolean
  shoppingList: ShoppingItem[]
  participants: Participant[]
  costs: Cost[]
  createdAt: Date
}

export interface ShoppingItem {
  id: string
  name: string
  baseAmount: number
  unit: string
  category: "food" | "drink" | "alcohol" | "other"
  perPerson?: boolean
}

export interface Participant {
  id: string
  participantId: string
  username: string
  fullName?: string // <--- Hinzugefügt
  isVegetarian: boolean
  isVegan: boolean
  drinksAlcohol: boolean
  stayDuration: number
  joinTime: string
  suggestions: string
  bringingItems: string[]
  joinedAt: Date
}

export interface Cost {
  id: string
  participantId: string
  participantUsername: string
  items: CostItem[]
  total: number
  addedAt: Date
}

export interface CostItem {
  name: string
  amount: number
  sharedWith: string[] // participant IDs who consumed this
}

export type Language = "en" | "de"
export type Theme = "light" | "dark"

// Add a more flexible type for Firebase documents
export interface FirebaseMeetup {
  id: string
  title: string
  description: string
  location: string
  date: any // Firebase Timestamp or Date
  time: string
  endDate?: any // Firebase Timestamp or Date
  endTime?: string
  hostId: string
  hostUsername: string
  code: string
  hasAlcohol: boolean
  shoppingList?: ShoppingItem[]
  participants?: Participant[]
  costs?: Cost[]
  createdAt: any // Firebase Timestamp or Date
  [key: string]: any // Allow additional properties
}

// Add a helper type for meetup status
export type MeetupStatus = "upcoming" | "inProgress" | "past"
