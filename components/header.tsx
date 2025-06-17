"use client"

import { useAuth } from "./auth-provider"
import { useTheme } from "./theme-provider"
import { useIntl } from "./intl-provider"

export function Header() {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useIntl()

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="header-title">Meetup Planner</h1>

          <div className="header-controls">
            {user && (
              <div className="header-user">
                <span className="header-username">@{user.username}</span>
                
                <div className="header-actions">
                  <button 
                    className="header-btn"
                    onClick={() => setLanguage(language === "en" ? "de" : "en")}
                    title={t("change_language")}
                  >
                    {language.toUpperCase()}
                  </button>
                  
                  <button 
                    className="header-btn"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    title={t("toggle_theme")}
                  >
                    {theme === "light" ? "🌙" : "☀️"}
                  </button>
                  
                  <button 
                    className="header-btn header-btn-logout"
                    onClick={logout}
                    title={t("logout")}
                  >
                    {t("logout")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
