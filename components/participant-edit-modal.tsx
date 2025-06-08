"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useToast } from "./toast"
import type { Participant, Meetup } from "@/lib/types"
import { Plus, Trash2, X, User, Clock, MessageSquare, Package } from "lucide-react"

interface ParticipantEditModalProps {
  isOpen: boolean
  onClose: () => void
  participant: Participant
  meetup: Meetup
  onUpdate: () => void
}

export function ParticipantEditModal({ isOpen, onClose, participant, meetup, onUpdate }: ParticipantEditModalProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [formData, setFormData] = useState({
    isVegetarian: false,
    isVegan: false,
    drinksAlcohol: false,
    stayDuration: 4,
    joinTime: "",
    suggestions: "",
    bringingItems: [] as string[],
  })

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      document.body.style.overflow = "hidden"
    } else {
      setIsVisible(false)
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  useEffect(() => {
    if (participant) {
      setFormData({
        isVegetarian: participant.isVegetarian || false,
        isVegan: participant.isVegan || false,
        drinksAlcohol: participant.drinksAlcohol || false,
        stayDuration: participant.stayDuration || 4,
        joinTime: participant.joinTime || "",
        suggestions: participant.suggestions || "",
        bringingItems: participant.bringingItems || [],
      })
    }
  }, [participant])

  if (!isOpen) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onClose()
    }
  }

  const addBringingItem = () => {
    setFormData({
      ...formData,
      bringingItems: [...formData.bringingItems, ""],
    })
  }

  const updateBringingItem = (index: number, value: string) => {
    const updatedItems = [...formData.bringingItems]
    updatedItems[index] = value
    setFormData({
      ...formData,
      bringingItems: updatedItems,
    })
  }

  const removeBringingItem = (index: number) => {
    const updatedItems = formData.bringingItems.filter((_, i) => i !== index)
    setFormData({
      ...formData,
      bringingItems: updatedItems,
    })
  }

  const handleSubmit = async () => {
    if (!formData.joinTime) {
      showToast({
        type: "warning",
        title: "Join time required",
        message: "Please specify when you plan to join the meetup",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/meetups/${meetup.id}/participants/${participant.participantId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          bringingItems: formData.bringingItems.filter((item) => item.trim() !== ""),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update participation")
      }

      showToast({
        type: "success",
        title: "Participation updated",
        message: "Your participation details have been successfully updated",
      })

      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error updating participation:", error)
      showToast({
        type: "error",
        title: "Failed to update participation",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`participant-edit-overlay ${isVisible ? "participant-edit-overlay-visible" : ""}`}
      onClick={handleOverlayClick}
    >
      <div className={`participant-edit-modal ${isVisible ? "participant-edit-modal-visible" : ""}`}>
        {/* Header */}
        <div className="participant-edit-header">
          <div className="participant-edit-header-content">
            <div className="participant-edit-icon">
              <User size={24} />
            </div>
            <div>
              <h3 className="participant-edit-title">Edit Your Participation</h3>
              <p className="participant-edit-subtitle">Update your preferences for "{meetup.title}"</p>
            </div>
          </div>
          <button onClick={onClose} className="participant-edit-close" disabled={loading}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="participant-edit-content">
          {/* Dietary Preferences */}
          <div className="participant-edit-section">
            <h4 className="participant-edit-section-title">🍽️ Dietary Preferences</h4>
            <div className="participant-edit-checkboxes">
              <label className="participant-edit-checkbox">
                <input
                  type="checkbox"
                  checked={formData.isVegetarian}
                  onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
                />
                <span className="participant-edit-checkbox-label">🥬 Vegetarian</span>
              </label>

              <label className="participant-edit-checkbox">
                <input
                  type="checkbox"
                  checked={formData.isVegan}
                  onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
                />
                <span className="participant-edit-checkbox-label">🌱 Vegan</span>
              </label>

              {meetup.hasAlcohol && (
                <label className="participant-edit-checkbox">
                  <input
                    type="checkbox"
                    checked={formData.drinksAlcohol}
                    onChange={(e) => setFormData({ ...formData, drinksAlcohol: e.target.checked })}
                  />
                  <span className="participant-edit-checkbox-label">🍺 Drinks Alcohol</span>
                </label>
              )}
            </div>
          </div>

          {/* Duration and Join Time */}
          <div className="participant-edit-section">
            <h4 className="participant-edit-section-title">
              <Clock size={16} />
              Timing Details
            </h4>
            <div className="participant-edit-grid">
              <div className="participant-edit-field">
                <label className="participant-edit-label">Stay Duration (hours)</label>
                <input
                  type="number"
                  value={formData.stayDuration}
                  onChange={(e) => setFormData({ ...formData, stayDuration: Number(e.target.value) })}
                  className="participant-edit-input"
                  min="1"
                  max="24"
                />
              </div>

              <div className="participant-edit-field">
                <label className="participant-edit-label">Join Time *</label>
                <input
                  type="time"
                  value={formData.joinTime}
                  onChange={(e) => setFormData({ ...formData, joinTime: e.target.value })}
                  className="participant-edit-input"
                  required
                />
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="participant-edit-section">
            <h4 className="participant-edit-section-title">
              <MessageSquare size={16} />
              Suggestions for Host
            </h4>
            <textarea
              value={formData.suggestions}
              onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
              className="participant-edit-textarea"
              placeholder="Any suggestions, requests, or special notes for the host..."
              rows={3}
            />
          </div>

          {/* Items Bringing */}
          <div className="participant-edit-section">
            <div className="participant-edit-section-header">
              <h4 className="participant-edit-section-title">
                <Package size={16} />
                Items You're Bringing
              </h4>
              <button onClick={addBringingItem} className="participant-edit-add-btn" type="button">
                <Plus size={14} />
                Add Item
              </button>
            </div>

            {formData.bringingItems.length > 0 ? (
              <div className="participant-edit-items">
                {formData.bringingItems.map((item, index) => (
                  <div key={index} className="participant-edit-item">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => updateBringingItem(index, e.target.value)}
                      className="participant-edit-input"
                      placeholder="Item name (e.g., Chips, Soda, Dessert)"
                    />
                    <button
                      onClick={() => removeBringingItem(index)}
                      className="participant-edit-remove-btn"
                      type="button"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="participant-edit-empty">
                <Package size={32} className="participant-edit-empty-icon" />
                <p className="participant-edit-empty-text">No items added yet</p>
                <p className="participant-edit-empty-subtext">Click "Add Item" to add something you're bringing</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="participant-edit-footer">
          <button onClick={onClose} className="participant-edit-btn participant-edit-btn-cancel" disabled={loading}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading} className="participant-edit-btn participant-edit-btn-save">
            {loading && <div className="participant-edit-spinner" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
