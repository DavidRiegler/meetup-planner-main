import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function formatDate(dateString: string | Date): string {
  try {
    let date: Date;
    
    if (typeof dateString === 'string') {
      // Handle different date string formats
      if (dateString.includes('T')) {
        // ISO format: 2024-01-15T10:00:00.000Z
        date = new Date(dateString);
      } else if (dateString.includes('/')) {
        // Format: YYYY/MM/DD or MM/DD/YYYY
        date = new Date(dateString);
      } else if (dateString.includes('-')) {
        // Format: YYYY-MM-DD
        date = new Date(dateString + 'T00:00:00');
      } else {
        // Try direct parsing
        date = new Date(dateString);
      }
    } else {
      date = dateString;
    }

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return String(dateString); // Return the original string if parsing fails
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return String(dateString); // Return the original string if there's an error
  }
}

export function formatTime(timeString: string): string {
  // If it's already in HH:MM format, return as is
  if (typeof timeString === 'string' && /^\d{1,2}:\d{2}$/.test(timeString)) {
    return timeString;
  }
  
  // Otherwise try to parse as date
  try {
    const dateObj = new Date(timeString);
    
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid time:', timeString);
      return 'Invalid Time';
    }

    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj);
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
}

export function formatDateTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' 
      ? new Date(dateString)
      : dateString;

    if (!(date instanceof Date) || isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid Date';
    }

    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  } catch (error) {
    console.error('Error formatting date time:', error);
    return 'Invalid Date';
  }
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function debounce<T extends unknown[]>(func: (...args: T) => void, wait: number): (...args: T) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: T) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends unknown[]>(func: (...args: T) => void, limit: number): (...args: T) => void {
  let inThrottle: boolean
  return (...args: T) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + "..." : str
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    },
    {} as Record<string, T[]>,
  )
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function formatCurrency(amount: number, currency = "EUR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num)
}

export function parseJSON<T>(str: string, fallback: T): T {
  try {
    return JSON.parse(str)
  } catch {
    return fallback
  }
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => delete result[key])
  return result
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}