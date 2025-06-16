"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { useToast } from "./toast"
import { Plus, Package } from "lucide-react"

interface ItemSuggestionFormProps {
  meetupId: string
  onSuggestionAdded: () => void
}

type ItemCategory = "food" | "drink" | "alcohol" | "other"

export function ItemSuggestionForm({ meetupId, onSuggestionAdded }: ItemSuggestionFormProps) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    baseAmount: 1,
    unit: "",
    category: "food" as ItemCategory,
    perPerson: false,
    reason: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.name.trim() || !formData.unit.trim()) {
      showToast({
        type: "warning",
        title: "Missing information",
        message: "Please fill in item name and unit",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/meetups/${meetupId}/item-suggestions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: user.id,
          participantUsername: user.username,
          ...formData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to suggest item")
      }

      showToast({
        type: "success",
        title: "Item suggested",
        message: "Your suggestion has been sent to the host",
      })

      // Reset form
      setFormData({
        name: "",
        baseAmount: 1,
        unit: "",
        category: "food",
        perPerson: false,
        reason: "",
      })
      setShowForm(false)
      onSuggestionAdded()
    } catch (error) {
      console.error("Error suggesting item:", error)
      showToast({
        type: "error",
        title: "Failed to suggest item",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  if (!showForm) {
    return (
      <div className="item-suggestion-trigger">
        <button onClick={() => setShowForm(true)} className="button button-outline">
          <Plus size={16} />
          Suggest Item for Shopping List
        </button>
      </div>
    )
  }

  return (
    <div className="item-suggestion-form">
      <div className="item-suggestion-header">
        <h4 className="item-suggestion-title">
          <Package size={18} />
          Suggest Shopping Item
        </h4>
        <p className="item-suggestion-subtitle">Suggest an item for the host to add to the shopping list</p>
      </div>

      <form onSubmit={handleSubmit} className="item-suggestion-form-content">
        <div className="item-suggestion-grid">
          <div className="form-group">
            <label className="form-label">Item Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="e.g., Potato chips, Soda, Beer"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ItemCategory })}
              className="input select"
            >
              <option value="food">Food</option>
              <option value="drink">Drink</option>
              <option value="alcohol">Alcohol</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Amount *</label>
            <input
              type="number"
              value={formData.baseAmount}
              onChange={(e) => setFormData({ ...formData, baseAmount: Number(e.target.value) })}
              className="input"
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Unit *</label>
            <input
              type="text"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="input"
              placeholder="e.g., bags, bottles, kg"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.perPerson}
              onChange={(e) => setFormData({ ...formData, perPerson: e.target.checked })}
            />
            <span className="form-label mb-0">Calculate per person</span>
          </label>
        </div>

        <div className="form-group">
          <label className="form-label">Reason (Optional)</label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            className="input textarea"
            placeholder="Why do you think this item would be good for the meetup?"
            rows={2}
          />
        </div>

        <div className="item-suggestion-actions">
          <button type="button" onClick={() => setShowForm(false)} className="button button-outline">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="button button-primary">
            {loading && <div className="loading-spinner" />}
            Send Suggestion
          </button>
        </div>
      </form>
    </div>
  )
}
