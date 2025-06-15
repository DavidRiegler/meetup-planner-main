"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { useIntl } from "./intl-provider"
import { useToast } from "./toast"
import { interpolate } from "@/lib/translations"
import { Eye, EyeOff } from "lucide-react"

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { login, register } = useAuth()
  const { t } = useIntl()
  const { showToast } = useToast()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!username.trim()) {
      newErrors.username = t("usernameRequired")
    } else if (username.length < 3) {
      newErrors.username = t("usernameMinLength")
    }

    if (!isLogin && !fullName.trim()) {
      newErrors.fullName = t("fullNameRequired")
    } else if (!isLogin && fullName.length < 2) {
      newErrors.fullName = t("fullNameMinLength")
    }

    if (!password) {
      newErrors.password = t("passwordRequired")
    } else if (!isLogin && password.length < 6) {
      newErrors.password = t("passwordMinLength")
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast({
        type: "error",
        title: t("formValidationFailed"),
        message: t("fixErrorsAndTryAgain"),
      })
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const success = isLogin ? await login(username, password) : await register(username, password, fullName)

      if (success) {
        showToast({
          type: "success",
          title: isLogin ? t("welcomeBack") : t("accountCreated"),
          message: isLogin
            ? interpolate(t("welcomeMessage"), { username })
            : interpolate(t("welcomeNewUser"), { fullName }),
        })
      } else {
        throw new Error(isLogin ? t("invalidCredentials") : t("accountCreationFailed"))
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t("unexpectedError")
      showToast({
        type: "error",
        title: isLogin ? t("loginFailed") : t("registrationFailed"),
        message: errorMessage,
      })
    }

    setLoading(false)
  }

  return (
    <div className="container">
      <div className="auth-card">
        <div className="auth-header">
          <h2 className="auth-title">{isLogin ? t("login") : t("register")}</h2>
          <p className="auth-subtitle">{isLogin ? t("welcomeBackSubtitle") : t("createAccountSubtitle")}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">{t("username")}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`auth-input ${errors.username ? "auth-input-error" : ""}`}
              placeholder={t("username")}
              autoComplete="username"
            />
            {errors.username && <div className="auth-error">{errors.username}</div>}
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label className="auth-label">{t("fullName")}</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`auth-input ${errors.fullName ? "auth-input-error" : ""}`}
                placeholder={t("fullName")}
                autoComplete="name"
              />
              {errors.fullName && <div className="auth-error">{errors.fullName}</div>}
            </div>
          )}

          <div className="auth-field">
            <label className="auth-label">{t("password")}</label>
            <div className="auth-password-container">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`auth-input auth-password-input ${errors.password ? "auth-input-error" : ""}`}
                placeholder={t("password")}
                autoComplete={isLogin ? "current-password" : "new-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="auth-password-toggle"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <div className="auth-error">{errors.password}</div>}
            {!isLogin && <div className="auth-hint">{t("passwordMinLength")}</div>}
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading && <div className="auth-spinner" />}
            {loading ? t("loading") : isLogin ? t("loginButton") : t("registerButton")}
          </button>
        </form>

        <div className="auth-switch">
          <button onClick={() => setIsLogin(!isLogin)} className="auth-switch-btn">
            {isLogin ? t("needAccount") : t("haveAccount")}
          </button>
        </div>
      </div>
    </div>
  )
}
