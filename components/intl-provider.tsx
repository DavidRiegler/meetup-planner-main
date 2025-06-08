"use client"

import type React from "react"

import { createContext, useContext, useState } from "react"
import type { Language } from "@/lib/types"

// Define TranslationKey type based on the keys of translations["en"]
type TranslationKey = keyof typeof translations["en"];
import { translations } from "@/lib/translations"

interface IntlContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
}

const IntlContext = createContext<IntlContextType | undefined>(undefined)

export function IntlProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  const t = (key: TranslationKey): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key
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
