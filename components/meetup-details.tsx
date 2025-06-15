"use client"

import { useState, useEffect } from "react"
import { useAuth } from "./auth-provider"
import { useIntl } from "./intl-provider"
import { useToast } from "./toast"
import type { Meetup, CostItem, Participant } from "@/lib/types"
import { ConfirmationModal } from "./confirmation-modal"
import { ErrorBoundary } from "./error-boundary"
import { formatLocationDisplay } from "@/lib/maps-utils"
import {
  ArrowLeft,
  Plus,
  Users,
  MapPin,
  Calendar,
  Clock,
  AlertCircle,
  Edit,
  Trash2,
  UserMinus,
  Settings,
  ExternalLink,
  Vote,
} from "lucide-react"
import { Modal } from "./modal"
import { ParticipantEditModal } from "./participant-edit-modal"
import { UserX, Edit3 } from "lucide-react"
import { DatePoll } from "./date-poll"
import { ItemSuggestionForm } from "./item-suggestion-form"
import { ItemSuggestionsList } from "./item-suggestions-list"
import { DateAvailabilityForm } from "./date-availability-form"

interface MeetupDetailsProps {
  meetupId: string
  onBack: () => void
}

export function MeetupDetails({ meetupId, onBack }: MeetupDetailsProps) {
  const { user } = useAuth()
  const { t } = useIntl()
  const { showToast } = useToast()

  const [meetup, setMeetup] = useState<Meetup | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddCost, setShowAddCost] = useState(false)
  const [showEditMeetup, setShowEditMeetup] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [showEditParticipation, setShowEditParticipation] = useState(false)
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

  const [newCost, setNewCost] = useState({
    items: [{ name: "", amount: 0, sharedWith: [] as string[] }],
  })

  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    location: "",
    date: "",
    time: "",
    endDate: "",
    endTime: "",
    hasAlcohol: false,
  })

  const isHost = meetup?.hostId === user?.id
  const currentParticipant = meetup?.participants?.find((p) => p.participantId === user?.id)

  useEffect(() => {
    fetchMeetupDetails()
  }, [meetupId])

  useEffect(() => {
    if (meetup) {
      setEditForm({
        title: meetup.title,
        description: meetup.description,
        location: meetup.location,
        date: meetup.date.toISOString().split("T")[0],
        time: meetup.time,
        endDate: meetup.endDate ? meetup.endDate.toISOString().split("T")[0] : "",
        endTime: meetup.endTime || "",
        hasAlcohol: meetup.hasAlcohol,
      })
    }
  }, [meetup])

  const fetchMeetupDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Fetching meetup details for ID:", meetupId)
      const response = await fetch(`/api/meetups/${meetupId}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}: Failed to fetch meetup`)
      }

      const data = await response.json()
      console.log("Meetup data received:", data)

      // Validate and sanitize the data
      const meetupData: Meetup = {
        id: data.id,
        title: data.title || "",
        description: data.description || "",
        location: data.location || "",
        date: new Date(data.date),
        time: data.time || "",
        hostId: data.hostId || "",
        hostUsername: data.hostUsername || "",
        code: data.code || "",
        hasAlcohol: data.hasAlcohol || false,
        shoppingList: Array.isArray(data.shoppingList) ? data.shoppingList : [],
        participants: Array.isArray(data.participants) ? data.participants : [],
        costs: Array.isArray(data.costs) ? data.costs : [],
        createdAt: new Date(data.createdAt),
        possibleDates: Array.isArray(data.possibleDates) ? data.possibleDates : [],
        dateAvailabilities: Array.isArray(data.dateAvailabilities) ? data.dateAvailabilities : [],
        itemSuggestions: Array.isArray(data.itemSuggestions) ? data.itemSuggestions : [],
        dateFinalized: data.dateFinalized || false,
        winningDateVotes: data.winningDateVotes || 0,
        winningDateVoters: data.winningDateVoters || [],
        usesDatePolling: data.usesDatePolling || false,
      }

      setMeetup(meetupData)
    } catch (error) {
      console.error("Error fetching meetup details:", error)
      setError(error instanceof Error ? error.message : "Failed to load meetup details")
      showToast({
        type: "error",
        title: "Failed to load meetup",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditMeetup = async () => {
    if (!meetup || !isHost) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/meetups/${meetupId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update meetup")
      }

      showToast({
        type: "success",
        title: "Meetup updated",
        message: "Your meetup has been successfully updated",
      })

      setShowEditMeetup(false)
      fetchMeetupDetails()
    } catch (error) {
      console.error("Error updating meetup:", error)
      showToast({
        type: "error",
        title: "Failed to update meetup",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDeleteMeetup = async () => {
    if (!meetup || !isHost) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/meetups/${meetupId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete meetup")
      }

      showToast({
        type: "success",
        title: "Meetup deleted",
        message: "Your meetup has been successfully deleted",
      })

      onBack()
    } catch (error) {
      console.error("Error deleting meetup:", error)
      showToast({
        type: "error",
        title: "Failed to delete meetup",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setActionLoading(false)
      setShowDeleteConfirm(false)
    }
  }

  const handleRemoveParticipant = async (participant: Participant) => {
    if (!meetup || !isHost) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/meetups/${meetupId}/participants/${participant.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to remove participant")
      }

      showToast({
        type: "success",
        title: "Participant removed",
        message: `${participant.username} has been removed from the meetup`,
      })

      fetchMeetupDetails()
    } catch (error) {
      console.error("Error removing participant:", error)
      showToast({
        type: "error",
        title: "Failed to remove participant",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setActionLoading(false)
      setParticipantToRemove(null)
    }
  }

  const addCostItem = () => {
    setNewCost({
      ...newCost,
      items: [...newCost.items, { name: "", amount: 0, sharedWith: [] }],
    })
  }

  const updateCostItem = (index: number, field: keyof CostItem, value: any) => {
    const updatedItems = [...newCost.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setNewCost({ ...newCost, items: updatedItems })
  }

  const submitCost = async () => {
    if (!user || !meetup) return

    const validItems = newCost.items.filter((item) => item.name.trim() && item.amount > 0)
    if (validItems.length === 0) {
      showToast({
        type: "warning",
        title: "No valid items",
        message: "Please add at least one item with a name and amount",
      })
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/meetups/${meetupId}/costs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: user.id,
          participantUsername: user.username,
          items: validItems,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to add cost")
      }

      showToast({
        type: "success",
        title: "Cost added",
        message: "Your cost has been successfully added",
      })

      setShowAddCost(false)
      setNewCost({ items: [{ name: "", amount: 0, sharedWith: [] }] })
      fetchMeetupDetails()
    } catch (error) {
      console.error("Error adding cost:", error)
      showToast({
        type: "error",
        title: "Failed to add cost",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setActionLoading(false)
    }
  }

  const calculateShoppingAmounts = () => {
    if (!meetup || !meetup.shoppingList) return []

    const participantCount = (meetup.participants?.length || 0) + 1 // +1 for host

    return meetup.shoppingList.map((item) => ({
      ...item,
      calculatedAmount: item.perPerson ? item.baseAmount * participantCount : item.baseAmount,
    }))
  }

  const calculateCostSplit = () => {
    if (!meetup) return { totalCost: 0, userShare: 0, breakdown: [] }

    const totalCost = meetup.costs?.reduce((sum, cost) => sum + cost.total, 0) || 0
    const participantCount = (meetup.participants?.length || 0) + 1 // +1 for host

    // Simple equal split for now - can be enhanced for more complex splitting
    const userShare = totalCost / participantCount

    return {
      totalCost,
      userShare,
      breakdown: meetup.costs || [],
    }
  }

  const formatDateRange = (meetup: Meetup) => {
    if (!meetup) return ""

    const startDate = meetup.date.toLocaleDateString()
    const endDate = meetup.endDate?.toLocaleDateString()

    return endDate ? `${startDate} - ${endDate}` : startDate
  }

  const formatTimeRange = (meetup: Meetup) => {
    if (!meetup) return ""

    const startTime = meetup.time
    const endTime = meetup.endTime

    return endTime ? `${startTime} - ${endTime}` : startTime
  }

  const handleLeaveMeetup = async () => {
    if (!user || !meetup) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/meetups/${meetupId}/leave`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participantId: user.id,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to leave meetup")
      }

      showToast({
        type: "success",
        title: "Left meetup",
        message: "You have successfully left the meetup",
      })

      onBack()
    } catch (error) {
      console.error("Error leaving meetup:", error)
      showToast({
        type: "error",
        title: "Failed to leave meetup",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setActionLoading(false)
      setShowLeaveConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="container">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="button button-outline">
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="skeleton" style={{ width: "200px", height: "2rem" }} />
        </div>
        <div className="grid gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="skeleton mb-4" style={{ width: "150px", height: "1.5rem" }} />
              <div className="skeleton mb-2" style={{ width: "100%", height: "1rem" }} />
              <div className="skeleton" style={{ width: "80%", height: "1rem" }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="button button-outline">
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-bold">Error</h1>
        </div>
        <div className="card text-center p-8">
          <AlertCircle size={48} className="mx-auto mb-4 text-destructive" />
          <div className="text-xl text-destructive mb-4">Failed to load meetup</div>
          <div className="text-muted mb-4">{error}</div>
          <button onClick={fetchMeetupDetails} className="button button-primary">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!meetup) {
    return (
      <div className="container">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={onBack} className="button button-outline">
            <ArrowLeft size={16} />
            Back
          </button>
          <h1 className="text-2xl font-bold">Meetup Not Found</h1>
        </div>
        <div className="card text-center p-8">
          <AlertCircle size={48} className="mx-auto mb-4 text-muted" />
          <div className="text-xl mb-4">Meetup not found</div>
          <div className="text-muted">The meetup you're looking for doesn't exist or has been deleted.</div>
        </div>
      </div>
    )
  }

  const shoppingAmounts = calculateShoppingAmounts()
  const costSplit = calculateCostSplit()

  return (
    <ErrorBoundary>
      <div className="container">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="button button-outline">
              <ArrowLeft size={16} />
              Back
            </button>
            <h1 className="text-2xl font-bold">{meetup.title}</h1>
            <span className="badge badge-primary">{meetup.code}</span>
            {meetup.usesDatePolling && !meetup.dateFinalized && (
              <span className="badge badge-warning">
                <Vote size={12} />
                Date Polling
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isHost && (
              <>
                <button onClick={() => setShowEditMeetup(true)} className="button button-outline">
                  <Edit size={16} />
                  Edit
                </button>
                <button onClick={() => setShowDeleteConfirm(true)} className="button button-destructive">
                  <Trash2 size={16} />
                  Delete
                </button>
              </>
            )}

            {currentParticipant && !isHost && (
              <>
                <button onClick={() => setShowEditParticipation(true)} className="button button-outline">
                  <Edit3 size={16} />
                  Edit Participation
                </button>
                <button onClick={() => setShowLeaveConfirm(true)} className="button button-destructive">
                  <UserX size={16} />
                  Leave Meetup
                </button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {/* Basic Info */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} />
              {t("meetupDetails")}
            </h2>

            {/* Show date polling status */}
            {meetup.usesDatePolling && !meetup.dateFinalized && (
              <div className="alert alert-warning mb-4">
                <Vote size={16} />
                <span>
                  This meetup uses date polling. The current date is temporary - participants can vote on the final date
                  below.
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-muted" />
                {(() => {
                  const locationInfo = formatLocationDisplay(meetup.location)
                  return locationInfo.isGoogleMapsLink ? (
                    <a
                      href={locationInfo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1"
                    >
                      {locationInfo.text}
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <span>{locationInfo.text}</span>
                  )
                })()}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-muted" />
                <span>
                  {formatDateRange(meetup)}
                  {meetup.usesDatePolling && !meetup.dateFinalized && (
                    <span className="text-warning ml-2">(Temporary)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-muted" />
                <span>{formatTimeRange(meetup)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={16} className="text-muted" />
                <span>{(meetup.participants?.length || 0) + 1} participants</span>
              </div>
            </div>
            <p className="mt-4 text-muted">{meetup.description}</p>
            {meetup.hasAlcohol && (
              <div className="mt-4">
                <span className="badge badge-warning">🍺 Alcohol Available</span>
              </div>
            )}
          </div>

          {/* Date Poll Section */}
          {meetup.possibleDates && meetup.possibleDates.length > 0 && (
            <div className="card">
              <DatePoll
                possibleDates={meetup.possibleDates}
                dateAvailabilities={meetup.dateAvailabilities || []}
                isHost={isHost}
                showResults={true}
                meetupId={meetup.id}
                dateFinalized={meetup.dateFinalized}
                winningDateVotes={meetup.winningDateVotes}
                onUpdate={fetchMeetupDetails}
              />

              {/* Allow participants to update their availability - only if not finalized */}
              {currentParticipant && !isHost && !meetup.dateFinalized && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <DateAvailabilityForm
                    meetupId={meetup.id}
                    possibleDates={meetup.possibleDates}
                    existingAvailabilities={meetup.dateAvailabilities || []}
                    onUpdate={fetchMeetupDetails}
                  />
                </div>
              )}

              {meetup.dateFinalized && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm text-green-700">
                    <strong>Date finalized:</strong> The meetup date has been automatically updated based on the poll
                    results.
                    {meetup.winningDateVoters && meetup.winningDateVoters.length > 0 && (
                      <span> Voted by: {meetup.winningDateVoters.join(", ")}</span>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Item Suggestions Section */}
          <div className="card">
            <ItemSuggestionsList
              meetupId={meetup.id}
              suggestions={meetup.itemSuggestions || []}
              isHost={isHost}
              onUpdate={fetchMeetupDetails}
            />

            {/* Allow participants to suggest items */}
            {!isHost && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <ItemSuggestionForm meetupId={meetup.id} onSuggestionAdded={fetchMeetupDetails} />
              </div>
            )}
          </div>

          {/* Shopping List */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">🛒 {t("shoppingList")}</h3>
            {meetup.shoppingList && meetup.shoppingList.length > 0 ? (
              <div className="grid gap-2">
                {shoppingAmounts.map((item) => (
                  <div key={item.id} className="shopping-item">
                    <span>
                      <strong>{item.name}</strong> - {item.calculatedAmount} {item.unit}
                      <span className="text-muted ml-2">({t(item.category)})</span>
                      {item.perPerson && <span className="badge badge-primary ml-2">Per Person</span>}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted">No shopping items added yet.</p>
            )}
          </div>

          {/* Participants */}
          <div className="card">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users size={20} />
              {t("participants")} ({(meetup.participants?.length || 0) + 1})
            </h3>

            {/* Host */}
            <div className="participant-card">
              <div className="flex justify-between items-center">
                <div>
                  <strong>@{meetup.hostUsername}</strong>
                  <span className="badge badge-primary ml-2">Host</span>
                </div>
              </div>
            </div>

            {/* Participants */}
            {meetup.participants && meetup.participants.length > 0 ? (
              meetup.participants.map((participant) => (
                <div key={participant.id} className="participant-card">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <strong>@{participant.username}</strong>
                        {isHost && (
                          <button
                            onClick={() => setParticipantToRemove(participant)}
                            className="button button-destructive button-sm"
                            title="Remove participant"
                          >
                            <UserMinus size={14} />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {participant.isVegetarian && <span className="badge">🥬 Vegetarian</span>}
                        {participant.isVegan && <span className="badge">🌱 Vegan</span>}
                        {participant.drinksAlcohol && meetup.hasAlcohol && (
                          <span className="badge">🍺 Drinks alcohol</span>
                        )}
                      </div>
                      <div className="text-sm text-muted">
                        Staying: {participant.stayDuration}h
                        {participant.joinTime && ` | Joining at: ${participant.joinTime}`}
                      </div>
                      {participant.bringingItems && participant.bringingItems.length > 0 && (
                        <div className="text-sm mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                          <strong>Bringing:</strong> {participant.bringingItems.join(", ")}
                        </div>
                      )}
                      {participant.suggestions && (
                        <div className="text-sm mt-2 p-2 bg-gray-50 rounded">
                          <strong>Suggestions:</strong> {participant.suggestions}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted">No participants have joined yet.</p>
            )}
          </div>

          {/* Costs Section */}
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">💰 {t("costs")}</h3>
              <button onClick={() => setShowAddCost(true)} className="button button-primary">
                <Plus size={16} />
                {t("addCost")}
              </button>
            </div>

            {/* Cost Summary */}
            <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded">
              <div>
                <strong>{t("totalCost")}:</strong> €{costSplit.totalCost.toFixed(2)}
              </div>
              <div>
                <strong>{t("yourShare")}:</strong> €{costSplit.userShare.toFixed(2)}
              </div>
            </div>

            {/* Cost Items */}
            {meetup.costs && meetup.costs.length > 0 ? (
              meetup.costs.map((cost) => (
                <div key={cost.id} className="cost-item">
                  <div>
                    <strong>@{cost.participantUsername}</strong>
                    <div className="text-sm text-muted">
                      {cost.items.map((item) => `${item.name} (€${item.amount})`).join(", ")}
                    </div>
                  </div>
                  <span className="font-semibold">€{cost.total.toFixed(2)}</span>
                </div>
              ))
            ) : (
              <p className="text-muted">No costs have been added yet.</p>
            )}

            {/* Add Cost Form */}
            {showAddCost && (
              <div className="mt-4 p-4 border rounded">
                <h4 className="font-semibold mb-4">Add New Cost</h4>
                {newCost.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateCostItem(index, "name", e.target.value)}
                      className="input"
                    />
                    <input
                      type="number"
                      placeholder="Amount (€)"
                      value={item.amount}
                      onChange={(e) => updateCostItem(index, "amount", Number(e.target.value))}
                      className="input"
                      step="0.01"
                      min="0"
                    />
                  </div>
                ))}
                <div className="flex gap-2 mt-4">
                  <button onClick={addCostItem} className="button button-outline">
                    Add Item
                  </button>
                  <button onClick={submitCost} disabled={actionLoading} className="button button-primary">
                    {actionLoading && <div className="loading-spinner" />}
                    Save Cost
                  </button>
                  <button onClick={() => setShowAddCost(false)} className="button button-secondary">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Meetup Modal */}
        <Modal isOpen={showEditMeetup} onClose={() => setShowEditMeetup(false)} title="Edit Meetup" size="lg">
          <div className="grid gap-4">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                type="text"
                value={editForm.title}
                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                className="input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="input textarea"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Location</label>
                <input
                  type="text"
                  value={editForm.location}
                  onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                  className="input"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Time</label>
                <input
                  type="time"
                  value={editForm.time}
                  onChange={(e) => setEditForm({ ...editForm, time: e.target.value })}
                  className="input"
                />
              </div>
              <div className="form-group">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={editForm.hasAlcohol}
                    onChange={(e) => setEditForm({ ...editForm, hasAlcohol: e.target.checked })}
                  />
                  Alcohol Available
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">End Date (Optional)</label>
                <input
                  type="date"
                  value={editForm.endDate || ""}
                  onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value || "" })}
                  className="input"
                  min={editForm.date}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Time (Optional)</label>
                <input
                  type="time"
                  value={editForm.endTime || ""}
                  onChange={(e) => setEditForm({ ...editForm, endTime: e.target.value || "" })}
                  className="input"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={handleEditMeetup} disabled={actionLoading} className="button button-primary">
                {actionLoading && <div className="loading-spinner" />}
                Save Changes
              </button>
              <button onClick={() => setShowEditMeetup(false)} className="button button-outline">
                Cancel
              </button>
            </div>
          </div>
        </Modal>

        {/* Confirmation Modals */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteMeetup}
          title="Delete Meetup"
          message="Are you sure you want to delete this meetup? This action cannot be undone."
          confirmText="Delete"
          type="danger"
          loading={actionLoading}
        />

        <ConfirmationModal
          isOpen={!!participantToRemove}
          onClose={() => setParticipantToRemove(null)}
          onConfirm={() => participantToRemove && handleRemoveParticipant(participantToRemove)}
          title="Remove Participant"
          message={`Are you sure you want to remove ${participantToRemove?.username} from this meetup?`}
          confirmText="Remove"
          type="warning"
          loading={actionLoading}
        />

        {/* Participant Edit Modal */}
        {currentParticipant && (
          <ParticipantEditModal
            isOpen={showEditParticipation}
            onClose={() => setShowEditParticipation(false)}
            participant={currentParticipant}
            meetup={meetup}
            onUpdate={fetchMeetupDetails}
          />
        )}

        {/* Leave Meetup Confirmation */}
        <ConfirmationModal
          isOpen={showLeaveConfirm}
          onClose={() => setShowLeaveConfirm(false)}
          onConfirm={handleLeaveMeetup}
          title="Leave Meetup"
          message="Are you sure you want to leave this meetup? You can rejoin later with the meetup code."
          confirmText="Leave"
          type="warning"
          loading={actionLoading}
        />
      </div>
    </ErrorBoundary>
  )
}
