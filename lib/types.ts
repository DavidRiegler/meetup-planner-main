export interface User {
  id: string
  username: string
  fullName?: string
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

export interface CostItem {
  name: string
  amount: number
  sharedWith: string[]
}

export interface Cost {
  id: string
  participantId: string
  participantUsername: string
  items: CostItem[]
  total: number
  addedAt: Date
}

export interface Participant {
  id: string
  participantId: string
  username: string
  isVegetarian?: boolean
  isVegan?: boolean
  drinksAlcohol?: boolean
  stayDuration?: number
  joinTime?: string
  suggestions?: string
  bringingItems?: string[]
  joinedAt: Date
  updatedAt?: Date
}

export interface MeetupDate {
  id: string
  date: string 
  time: string
  endTime?: string
  description?: string
}

export interface DateAvailability {
  participantId: string
  username: string
  dateId: string
  available: boolean
}

export interface ItemSuggestion {
  id: string
  participantId: string
  participantUsername: string
  name: string
  baseAmount: number
  unit: string
  category: "food" | "drink" | "alcohol" | "other"
  perPerson: boolean
  reason?: string
  suggestedAt: Date
  status: "pending" | "accepted" | "rejected"
}

export interface Meetup {
  id: string
  title: string
  description: string
  location: string
  date: Date
  time: string
  endDate?: Date
  endTime?: string
  hostId: string
  hostUsername: string
  code: string
  hasAlcohol: boolean
  shoppingList: ShoppingItem[]
  participants: Participant[]
  costs: Cost[]
  createdAt: Date
  updatedAt?: Date
  possibleDates?: MeetupDate[]
  dateAvailabilities?: DateAvailability[]
  itemSuggestions?: ItemSuggestion[]
  usesDatePolling?: boolean
  dateFinalized?: boolean
  finalizedAt?: Date
  winningDateVotes?: number
  winningDateVoters?: string[]
}

export interface FirebaseMeetup {
  title: string
  description: string
  location: string
  date: string 
  time: string
  endDate?: string | null 
  endTime?: string
  hostId: string
  hostUsername: string
  code: string
  hasAlcohol: boolean
  shoppingList: ShoppingItem[]
  participants: Participant[]
  costs: Cost[]
  createdAt: string
  updatedAt?: string 
  possibleDates?: MeetupDate[]
  dateAvailabilities?: DateAvailability[]
  itemSuggestions?: ItemSuggestion[]
  usesDatePolling?: boolean
  dateFinalized?: boolean
  finalizedAt?: string 
  winningDateVotes?: number
  winningDateVoters?: string[]
}

// Exportiere FirebaseTimestamp, da es möglicherweise in anderen Dateien benötigt wird
export interface FirebaseTimestamp {
  toDate(): Date
}

export type Language = "en" | "de" 

export type Theme = "light" | "dark" 

export type MeetupStatus = "upcoming" | "inProgress" | "past"
