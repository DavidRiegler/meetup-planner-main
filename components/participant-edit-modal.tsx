"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "./toast"
import { Modal } from "./modal"
import type { Participant, Meetup } from "@/lib/types"
import { Plus, Trash2 } from "lucide-react"

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

  const [formData, setFormData] = useState({
    isVegetarian: participant.isVegetarian || false,
    isVegan: participant.isVegan || false,
    drinksAlcohol: participant.drinksAlcohol || false,
    stayDuration: participant.stayDuration || 4,
    joinTime: participant.joinTime || "",
    suggestions: participant.suggestions || "",
    bringingItems: participant.bringingItems || [],
  })

  const [newItem, setNewItem] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/meetups/${meetup.id}/participants/${participant.participantId}/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  const addBringingItem = () => {
    if (!newItem.trim()) return

    setFormData({
      ...formData,
      bringingItems: [...formData.bringingItems, newItem.trim()],
    })
    setNewItem("")
  }

  const removeBringingItem = (index: number) => {
    setFormData({
      ...formData,
      bringingItems: formData.bringingItems.filter((_, i) => i !== index),
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Your Participation" size="lg">
      <form onSubmit={handleSubmit} className="grid gap-6">
        {/* Dietary Preferences */}
        <div className="form-group">
          <label className="form-label">Dietary Preferences</label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVegetarian}
                onChange={(e) => setFormData({ ...formData, isVegetarian: e.target.checked })}
              />
              🥬 Vegetarian
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isVegan}
                onChange={(e) => setFormData({ ...formData, isVegan: e.target.checked })}
              />
              🌱 Vegan
            </label>

            {meetup.hasAlcohol && (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.drinksAlcohol}
                  onChange={(e) => setFormData({ ...formData, drinksAlcohol: e.target.checked })}
                />
                🍺 Drinks alcohol
              </label>
            )}
          </div>
        </div>

        {/* Timing */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Stay Duration (hours)</label>
            <input
              type="number"
              value={formData.stayDuration}
              onChange={(e) => setFormData({ ...formData, stayDuration: Number(e.target.value) })}
              className="input"
              min="1"
              max="24"
            />
            <div className="text-sm text-muted mt-1">How long do you plan to stay?</div>
          </div>

          <div className="form-group">
            <label className="form-label">Join Time</label>
            <input
              type="time"
              value={formData.joinTime}
              onChange={(e) => setFormData({ ...formData, joinTime: e.target.value })}
              className="input"
            />
            <div className="text-sm text-muted mt-1">When will you arrive?</div>
          </div>
        </div>

        {/* Bringing Items */}
        <div className="form-group">
          <label className="form-label">Items You&apos;re Bringing</label>
          <div className="grid gap-2">
            {formData.bringingItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="flex-1 p-2 bg-gray-50 rounded">{item}</span>
                <button
                  type="button"
                  onClick={() => removeBringingItem(index)}
                  className="button button-destructive button-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}

            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                placeholder="Add an item you&apos;re bringing..."
                className="input flex-1"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addBringingItem()
                  }
                }}
              />
              <button type="button" onClick={addBringingItem} className="button button-outline">
                <Plus size={16} />
                Add
              </button>
            </div>
          </div>
          <div className="text-sm text-muted mt-1">
            Let others know what you&apos;re planning to bring (food, drinks, games, etc.)
          </div>
        </div>

        {/* Suggestions */}
        <div className="form-group">
          <label className="form-label">Suggestions for the Host</label>
          <textarea
            value={formData.suggestions}
            onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
            className="input textarea"
            placeholder="Any suggestions, requests, or notes for the host..."
            rows={3}
          />
          <div className="text-sm text-muted mt-1">
            Share any ideas, special requests, or information that might be helpful for the host
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-200">
          <button type="submit" disabled={loading} className="button button-primary">
            {loading && <div className="loading-spinner" />}
            Save Changes
          </button>
          <button type="button" onClick={onClose} className="button button-outline">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  )
}
