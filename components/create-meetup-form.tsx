"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-provider"
import { useIntl } from "./intl-provider"
import { useToast } from "./toast"
import type { ShoppingItem } from "@/lib/types"
import { isValidGoogleMapsUrl, extractLocationName } from "@/lib/maps-utils"
import { interpolate } from "@/lib/translations"
import { v4 as uuidv4 } from "uuid"
import { MapPin, Plus, Trash2, ExternalLink } from "lucide-react"

interface CreateMeetupFormProps {
  onBack: () => void
}

type ItemCategory = "food" | "drink" | "alcohol" | "other"

export function CreateMeetupForm({ onBack }: CreateMeetupFormProps) {
  const { user } = useAuth()
  const { t } = useIntl()
  const { showToast } = useToast()

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

  // Add state for multiple dates
  const [possibleDates, setPossibleDates] = useState<
    Array<{
      id: string
      date: string
      time: string
      endTime: string
      description: string
    }>
  >([])

  const [showDateOptions, setShowDateOptions] = useState(false)

  const [shoppingList, setShoppingList] = useState<ShoppingItem[]>([])
  const [newItem, setNewItem] = useState({
    name: "",
    baseAmount: 1,
    unit: "",
    category: "food" as ItemCategory,
    perPerson: false,
  })

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) newErrors.title = t("titleRequired")
    if (!formData.description.trim()) newErrors.description = t("descriptionRequired")
    if (!formData.location.trim()) newErrors.location = t("locationRequired")

    // Validate Google Maps URL if provided
    if (formData.location.startsWith("http") && !isValidGoogleMapsUrl(formData.location)) {
      newErrors.location = t("validGoogleMapsLink")
    }

    // Only validate single date if not using multiple dates
    if (!showDateOptions) {
      if (!formData.date) newErrors.date = t("dateRequired")
      if (!formData.time) newErrors.time = t("timeRequired")
    } else {
      // Validate that at least one date option is properly filled
      const validDateOptions = possibleDates.filter((d) => d.date && d.time)
      if (validDateOptions.length === 0) {
        newErrors.date = t("addCompleteDateOption")
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addShoppingItem = () => {
    if (!newItem.name.trim()) {
      showToast({
        type: "warning",
        title: t("itemNameRequired"),
        message: t("enterItemName"),
      })
      return
    }

    if (!newItem.unit.trim()) {
      showToast({
        type: "warning",
        title: t("unitRequired"),
        message: t("enterUnit"),
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
      title: t("itemAdded"),
      message: interpolate(t("itemAddedToList"), { item: newItem.name }),
    })
  }

  const removeShoppingItem = (id: string) => {
    const item = shoppingList.find((item) => item.id === id)
    setShoppingList(shoppingList.filter((item) => item.id !== id))

    if (item) {
      showToast({
        type: "info",
        title: t("itemRemoved"),
        message: interpolate(t("itemRemovedFromList"), { item: item.name }),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!validateForm()) {
      showToast({
        type: "error",
        title: t("formValidationFailed"),
        message: t("fixErrorsAndTryAgain"),
      })
      return
    }

    setLoading(true)

    try {
      // Prepare the meetup data
      let meetupData: {
        title: string
        description: string
        location: string
        date: string
        time: string
        endDate: string
        endTime: string
        hasAlcohol: boolean
        hostId: string
        hostUsername: string
        shoppingList: ShoppingItem[]
        usesDatePolling: boolean
        possibleDates?: Array<{
          id: string
          date: Date
          time: string
          endTime: string
          description: string
        }>
      } = {
        ...formData,
        hostId: user.id,
        hostUsername: user.username,
        shoppingList,
        usesDatePolling: false,
      }

      // Handle date options vs single date
      if (showDateOptions && possibleDates.length > 0) {
        const validDateOptions = possibleDates.filter((d) => d.date && d.time)

        // Use the first date option as the initial meetup date
        const firstDate = validDateOptions[0]
        meetupData = {
          ...meetupData,
          date: firstDate.date,
          time: firstDate.time,
          endTime: firstDate.endTime || "",
          // Add the possible dates for polling
          possibleDates: validDateOptions.map((d) => ({
            ...d,
            date: new Date(d.date),
          })),
          // Mark that this meetup uses date polling
          usesDatePolling: true,
        }
      } else {
        // Regular single date meetup
        meetupData = {
          ...meetupData,
          usesDatePolling: false,
        }
      }

      const response = await fetch("/api/meetups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(meetupData),
      })

      if (response.ok) {
        const meetup = await response.json()

        let successMessage = interpolate(t("meetupCodeIs"), { code: meetup.code })
        if (showDateOptions) {
          successMessage += t("datePollingNote")
        }

        showToast({
          type: "success",
          title: t("meetupCreatedSuccess"),
          message: successMessage,
          duration: 10000,
        })
        onBack()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || t("failedToCreateMeetup"))
      }
    } catch (error) {
      console.error("Error creating meetup:", error)
      showToast({
        type: "error",
        title: t("failedToCreateMeetup"),
        message: error instanceof Error ? error.message : t("tryAgain"),
      })
    }

    setLoading(false)
  }

  const isGoogleMapsLink = isValidGoogleMapsUrl(formData.location)
  const locationDisplayName = isGoogleMapsLink ? extractLocationName(formData.location) : formData.location

  return (
    <div className="card">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={onBack} className="button button-outline">
          ← {t("cancel")}
        </button>
        <h2 className="text-2xl font-bold">{t("createMeetup")}</h2>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="form-group">
          <label className="form-label">{t("title")}</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className={`input ${errors.title ? "border-destructive" : ""}`}
            placeholder={t("enterMeetupTitle")}
          />
          {errors.title && <div className="form-error">{errors.title}</div>}
        </div>

        <div className="form-group">
          <label className="form-label">{t("description")}</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className={`input textarea ${errors.description ? "border-destructive" : ""}`}
            placeholder={t("describeMeetup")}
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
            placeholder={t("enterLocationOrMaps")}
          />
          {errors.location && <div className="form-error">{errors.location}</div>}
          {isGoogleMapsLink && (
            <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded flex items-center gap-2">
              <ExternalLink size={14} className="text-green-600" />
              <span className="text-sm text-green-700">
                {interpolate(t("googleMapsDetected"), { location: locationDisplayName })}
              </span>
            </div>
          )}
        </div>

        {/* Multiple Date Options */}
        <div className="form-group">
          <div className="flex items-center justify-between mb-4">
            <label className="form-label">{t("dateOptions")}</label>
            <button
              type="button"
              onClick={() => setShowDateOptions(!showDateOptions)}
              className="button button-outline button-sm"
            >
              {showDateOptions ? t("useSingleDate") : t("addMultipleDateOptions")}
            </button>
          </div>

          {showDateOptions ? (
            <div className="date-options-section">
              <p className="text-sm text-muted mb-4">{t("multipleDateNote")}</p>

              {possibleDates.map((dateOption, index) => (
                <div key={dateOption.id} className="date-option-card">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">
                      {interpolate(t("dateOption"), { number: index + 1 })}
                      {index === 0 && <span className="badge badge-primary ml-2">{t("initialDate")}</span>}
                    </h4>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = possibleDates.filter((_, i) => i !== index)
                        setPossibleDates(updated)
                      }}
                      className="button button-destructive button-sm"
                    >
                      <Trash2 size={14} />
                      {t("remove")}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label">{t("date")} *</label>
                      <input
                        type="date"
                        value={dateOption.date}
                        onChange={(e) => {
                          const updated = [...possibleDates]
                          updated[index].date = e.target.value
                          setPossibleDates(updated)
                        }}
                        className="input"
                        min={new Date().toISOString().split("T")[0]}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t("startTime")} *</label>
                      <input
                        type="time"
                        value={dateOption.time}
                        onChange={(e) => {
                          const updated = [...possibleDates]
                          updated[index].time = e.target.value
                          setPossibleDates(updated)
                        }}
                        className="input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">
                        {t("endTime")} ({t("optional")})
                      </label>
                      <input
                        type="time"
                        value={dateOption.endTime}
                        onChange={(e) => {
                          const updated = [...possibleDates]
                          updated[index].endTime = e.target.value
                          setPossibleDates(updated)
                        }}
                        className="input"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">{t("descriptionOptional")}</label>
                      <input
                        type="text"
                        value={dateOption.description}
                        onChange={(e) => {
                          const updated = [...possibleDates]
                          updated[index].description = e.target.value
                          setPossibleDates(updated)
                        }}
                        className="input"
                        placeholder={t("afternoonSession")}
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setPossibleDates([
                    ...possibleDates,
                    {
                      id: uuidv4(),
                      date: "",
                      time: "",
                      endTime: "",
                      description: "",
                    },
                  ])
                }}
                className="button button-outline"
              >
                <Plus size={16} />
                {t("addDateOption")}
              </button>

              {possibleDates.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>{t("note")}:</strong> {t("firstDateNote")}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Single Date/Time Inputs */}
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
                  <label className="form-label">
                    {t("endDate")} ({t("optional")})
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input"
                    min={formData.date || new Date().toISOString().split("T")[0]}
                  />
                  <div className="text-sm text-muted mt-1">{t("leaveEmptyForSingleDay")}</div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    {t("endTime")} ({t("optional")})
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="input"
                  />
                </div>
              </div>
            </>
          )}

          {errors.date && showDateOptions && <div className="form-error">{errors.date}</div>}
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
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value as ItemCategory })}
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
              <h4 className="font-medium">{t("shoppingItems")}</h4>
              {shoppingList.map((item) => (
                <div key={item.id} className="shopping-item">
                  <span>
                    <strong>{item.name}</strong> - {item.baseAmount} {item.unit}
                    {item.perPerson && <span className="badge badge-primary ml-2">{t("perPerson")}</span>}
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
    </div>
  )
}
