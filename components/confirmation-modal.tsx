"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { AlertTriangle, X, Trash2, AlertCircle } from "lucide-react"

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: "danger" | "warning" | "info"
  loading?: boolean
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
  loading = false,
}: ConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden"
    } else {
      setIsVisible(false)
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !loading) {
      onClose()
    }
  }

  const getIcon = () => {
    switch (type) {
      case "danger":
        return <Trash2 className="confirmation-icon confirmation-icon-danger" size={24} />
      case "warning":
        return <AlertTriangle className="confirmation-icon confirmation-icon-warning" size={24} />
      default:
        return <AlertCircle className="confirmation-icon confirmation-icon-info" size={24} />
    }
  }

  return (
    <div
      className={`confirmation-overlay ${isVisible ? "confirmation-overlay-visible" : ""}`}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className={`confirmation-modal ${isVisible ? "confirmation-modal-visible" : ""}`}>
        <div className="confirmation-header">
          <div className="confirmation-icon-container">{getIcon()}</div>
          <button onClick={onClose} className="confirmation-close" disabled={loading} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="confirmation-body">
          <h3 className="confirmation-title">{title}</h3>
          <p className="confirmation-message">{message}</p>
        </div>

        <div className="confirmation-footer">
          <button onClick={onClose} className="confirmation-button confirmation-button-cancel" disabled={loading}>
            {cancelText}
          </button>
          <button onClick={onConfirm} className={`confirmation-button confirmation-button-${type}`} disabled={loading}>
            {loading && <div className="confirmation-spinner" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
