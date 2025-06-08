"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { useIntl } from "./intl-provider"
import { useToast } from "./toast"
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
      newErrors.username = "Username is required"
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters"
    }

    if (!isLogin && !fullName.trim()) {
      newErrors.fullName = "Full name is required"
    } else if (!isLogin && fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (!isLogin && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      showToast({
        type: "error",
        title: "Form validation failed",
        message: "Please fix the errors and try again",
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
          title: isLogin ? "Welcome back!" : "Account created!",
          message: isLogin ? `Welcome back, @${username}` : `Welcome to Meetup Planner, ${fullName}!`,
        })
      } else {
        throw new Error(isLogin ? "Invalid username or password" : "Failed to create account")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Authentication failed"
      showToast({
        type: "error",
        title: isLogin ? "Login failed" : "Registration failed",
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
          <p className="auth-subtitle">
            {isLogin ? "Welcome back! Please sign in to your account." : "Create your account to get started."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label className="auth-label">{t("username")}</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`auth-input ${errors.username ? "auth-input-error" : ""}`}
              placeholder="Enter your username"
              autoComplete="username"
            />
            {errors.username && <div className="auth-error">{errors.username}</div>}
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label className="auth-label">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`auth-input ${errors.fullName ? "auth-input-error" : ""}`}
                placeholder="Enter your full name"
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
                placeholder="Enter your password"
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
            {!isLogin && <div className="auth-hint">Password must be at least 6 characters long</div>}
          </div>

          <button type="submit" disabled={loading} className="auth-submit">
            {loading && <div className="auth-spinner" />}
            {loading ? t("loading") : isLogin ? t("loginButton") : t("registerButton")}
          </button>
        </form>

        <div className="auth-switch">
          <button onClick={() => setIsLogin(!isLogin)} className="auth-switch-btn">
            {isLogin ? "Need an account? Register" : "Have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  )
}
