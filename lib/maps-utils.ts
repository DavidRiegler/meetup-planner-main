// Google Maps utilities
export function isValidGoogleMapsUrl(url: string): boolean {
  const googleMapsPatterns = [
    /^https:\/\/maps\.google\.com/,
    /^https:\/\/www\.google\.com\/maps/,
    /^https:\/\/goo\.gl\/maps/,
    /^https:\/\/maps\.app\.goo\.gl/,
  ]

  return googleMapsPatterns.some((pattern) => pattern.test(url))
}

export function formatLocationDisplay(location: string): { text: string; isGoogleMapsLink: boolean; url?: string } {
  if (isValidGoogleMapsUrl(location)) {
    return {
      text: "📍 View on Google Maps",
      isGoogleMapsLink: true,
      url: location,
    }
  }

  return {
    text: location,
    isGoogleMapsLink: false,
  }
}

export function extractLocationName(url: string): string {
  try {
    const urlObj = new URL(url)
    const params = new URLSearchParams(urlObj.search)

    // Try to extract location name from various Google Maps URL formats
    const query = params.get("q") || params.get("query")
    if (query) {
      return query
    }

    // Extract from path for some URL formats
    const pathParts = urlObj.pathname.split("/")
    const placeIndex = pathParts.findIndex((part) => part === "place")
    if (placeIndex !== -1 && pathParts[placeIndex + 1]) {
      return decodeURIComponent(pathParts[placeIndex + 1].replace(/\+/g, " "))
    }

    return "Location"
  } catch {
    return "Location"
  }
}
