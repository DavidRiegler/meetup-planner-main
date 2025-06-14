"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { Language } from "@/lib/types"
import { translations } from "@/lib/translations"

interface IntlContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const IntlContext = createContext<IntlContextType | undefined>(undefined)

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key
  }

  return <IntlContext.Provider value={{ language, setLanguage, t }}>{children}</IntlContext.Provider>
}

export function useIntl() {
  const context = useContext(IntlContext)
  if (!context) {
    throw new Error("useIntl must be used within IntlProvider")
  }
  return context
}
