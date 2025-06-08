"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { useIntl } from "./intl-provider"
import { useToast } from "./toast"
import type { ShoppingItem } from "@/lib/types"
import { isValidGoogleMapsUrl, extractLocationName } from "@/lib/maps-utils"
import { v4 as uuidv4 } from "uuid"
import { MapPin, Plus, Trash2, ExternalLink } from "lucide-react"

interface CreateMeetupFormProps {
  onBack: () => void
}

export function CreateMeetupForm({ onBack }: CreateMeetupFormProps) {
  const { user } = useAuth()
  const { t } = useIntl()
  const { showToast } = useToast()

  const [createdCode, setCreatedCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

    const handleCopyCode = async () => {
    if (createdCode) {
      await navigator.clipboard.writeText(createdCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  // Update the form state to include end date and time
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    hasAlcohol: false,
  })

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState({
    name: "",
    baseAmount: 1,
    unit: "",
    category: "food" as const,
    perPerson: false,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = "Title is required"
    if (!formData.description.trim()) newErrors.description = "Description is required"
    if (!formData.location.trim()) newErrors.location = "Location is required"
    if (!formData.date) newErrors.date = "Date is required"
    if (!formData.time) newErrors.time = "Time is required"

    // Validate Google Maps URL if provided
    if (formData.location.startsWith("http") && !isValidGoogleMapsUrl(formData.location)) {
      newErrors.location = "Please provide a valid Google Maps link or enter a location name"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addShoppingItem = () => {
    if (!newItem.name.trim()) {
      showToast({
        type: "warning",
        title: "Item name required",
        message: "Please enter an item name",
      })
      return
    }

    if (!newItem.unit.trim()) {
      showToast({
        type: "warning",
        title: "Unit required",
        message: "Please enter a unit (e.g., kg, pieces, bottles)",
      })
      return
    }

    setShoppingList([
      ...shoppingList,
      {
        id: uuidv4(),
        ...newItem,
      },
    ])
    setNewItem({
      name: "",
      baseAmount: 1,
      unit: "",
      category: "food",
      perPerson: false,
    })

    showToast({
      type: "success",
      title: "Item added",
      message: `${newItem.name} added to shopping list`,
    })
  }

  const removeShoppingItem = (id: string) => {
    const item = shoppingList.find((item) => item.id === id)
    setShoppingList(shoppingList.filter((item) => item.id !== id))

    if (item) {
      showToast({
        type: "info",
        title: "Item removed",
        message: `${item.name} removed from shopping list`,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!validateForm()) {
      showToast({
        type: "error",
        title: "Form validation failed",
        message: "Please fix the errors and try again",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          hostId: user.id,
          hostUsername: user.username,
          shoppingList,
        }),
      })

      if (response.ok) {
        const meetup = await response.json()
        setCreatedCode(meetup.code)
        showToast({
          type: "success",
          title: "Meetup created successfully!",
          message: `Your meetup code is: ${meetup.code}`,
          duration: 8000,
        })
        return
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create meetup")
      }
    } catch (error) {
      console.error("Error creating meetup:", error)
      showToast({
        type: "error",
        title: "Failed to create meetup",
        message: error instanceof Error ? error.message : "Please try again",
      })
    }

    setLoading(false)
  }

  const isGoogleMapsLink = isValidGoogleMapsUrl(formData.location)
  const locationDisplayName = isGoogleMapsLink ? extractLocationName(formData.location) : formData.location

  return (
    <div className="card">
      {createdCode && (
        <div className="mt-4 flex items-center gap-2">
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{createdCode}</span>
          <button onClick={handleCopyCode} className="button button-secondary button-sm">
            {copied ? "Kopiert!" : "Code kopieren"}
          </button>
          <button onClick={onBack} className="button button-outline button-sm">
            Weiter
          </button>
        </div>
      )}
      {!createdCode && (
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="form-group">
            <label className="form-label">{t("title")}</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`input ${errors.title ? "border-destructive" : ""}`}
              placeholder="Enter meetup title"
            />
            {errors.title && <div className="form-error">{errors.title}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">{t("description")}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`input textarea ${errors.description ? "border-destructive" : ""}`}
              placeholder="Describe your meetup"
            />
            {errors.description && <div className="form-error">{errors.description}</div>}
          </div>

          <div className="form-group">
            <label className="form-label flex items-center gap-2">
              <MapPin size={16} />
              {t("location")}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className={`input ${errors.location ? "border-destructive" : ""}`}
              placeholder="Enter location or paste Google Maps link"
            />
            {errors.location && <div className="form-error">{errors.location}</div>}
            {isGoogleMapsLink && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
                <ExternalLink size={14} className="text-green-600" />
                <span className="text-sm text-green-700">Google Maps link detected: {locationDisplayName}</span>
              </div>
            )}
          </div>

          {/* Update the grid layout for date/time inputs to include end date/time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">{t("date")}</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={`input ${errors.date ? "border-destructive" : ""}`}
                min={new Date().toISOString().split("T")[0]}
              />
              {errors.date && <div className="form-error">{errors.date}</div>}
            </div>

            <div className="form-group">
              <label className="form-label">{t("time")}</label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={`input ${errors.time ? "border-destructive" : ""}`}
              />
              {errors.time && <div className="form-error">{errors.time}</div>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="input"
                min={formData.date || new Date().toISOString().split("T")[0]}
              />
              <div className="text-sm text-muted mt-1">Leave empty for single-day events</div>
            </div>

            <div className="form-group">
              <label className="form-label">End Time (Optional)</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.hasAlcohol}
                onChange={(e) => setFormData({ ...formData, hasAlcohol: e.target.checked })}
              />
              <span className="form-label mb-0">🍺 {t("hasAlcohol")}</span>
            </label>
          </div>

          <div className="form-group">
            <h3 className="text-lg font-semibold mb-4">🛒 {t("shoppingList")}</h3>

            <div className="grid gap-4 mb-4 p-4 border rounded">
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder={t("itemName")}
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="input"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t("baseAmount")}
                    value={newItem.baseAmount}
                    onChange={(e) => setNewItem({ ...newItem, baseAmount: Number(e.target.value) })}
                    className="input"
                    min="1"
                  />
                  <input
                    type="text"
                    placeholder={t("unit")}
                    value={newItem.unit}
                    onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                    className="input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                  className="input select"
                >
                  <option value="food">{t("food")}</option>
                  <option value="drink">{t("drink")}</option>
                  <option value="alcohol">{t("alcohol")}</option>
                  <option value="other">{t("other")}</option>
                </select>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={newItem.perPerson}
                    onChange={(e) => setNewItem({ ...newItem, perPerson: e.target.checked })}
                  />
                  {t("perPerson")}
                </label>
              </div>

              <button type="button" onClick={addShoppingItem} className="button button-secondary">
                <Plus size={16} />
                {t("addItem")}
              </button>
            </div>

            {shoppingList.length > 0 && (
              <div className="grid gap-2">
                <h4 className="font-medium">Shopping Items:</h4>
                {shoppingList.map((item) => (
                  <div key={item.id} className="shopping-item">
                    <span>
                      <strong>{item.name}</strong> - {item.baseAmount} {item.unit}
                      {item.perPerson && <span className="badge badge-primary ml-2">Per Person</span>}
                      <span className="text-muted ml-2">({t(item.category)})</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => removeShoppingItem(item.id)}
                      className="button button-destructive button-sm"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} className="button button-primary">
            {loading && <div className="loading-spinner" />}
            {loading ? t("loading") : t("createMeetup")}
          </button>
        </form>
      )}
    </div>
  )
}
