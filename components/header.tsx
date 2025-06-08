"use client"

import { useAuth } from "./auth-provider"
import { useTheme } from "./theme-provider"
import { useIntl } from "./intl-provider"
import { Sun, Moon, Globe } from "lucide-react"

export function Header() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useIntl()

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="text-xl font-bold">Meetup Planner</h1>

          <div className="header-controls">
            <button
              onClick={() => setLanguage(language === "en" ? "de" : "en")}
              className="button button-outline"
              title="Change Language"
            >
              <Globe size={16} />
              {language.toUpperCase()}
            </button>

            <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="button button-outline"
              title="Toggle Theme"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {user && (
              <>
                <span className="text-sm">@{user.username}</span>
                <button onClick={logout} className="button button-secondary">
                  {t("logout")}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
