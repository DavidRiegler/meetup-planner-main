"use client"

import { useState } from "react"
import { useToast } from "./toast"
import type { ItemSuggestion } from "@/lib/types"
import { Package, Check, X, Clock } from "lucide-react"

interface ItemSuggestionsListProps {
  meetupId: string
  suggestions: ItemSuggestion[]
  isHost: boolean
  onUpdate: () => void
}

export function ItemSuggestionsList({ meetupId, suggestions, isHost, onUpdate }: ItemSuggestionsListProps) {
  const { showToast } = useToast()
  const [loading, setLoading] = useState<string | null>(null)

  const handleAcceptSuggestion = async (suggestion: ItemSuggestion) => {
    setLoading(suggestion.id)
    try {
      const response = await fetch(`/api/meetups/${meetupId}/item-suggestions/${suggestion.id}/accept`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to accept suggestion")
      }

      showToast({
        type: "success",
        title: "Suggestion accepted",
        message: `${suggestion.name} has been added to the shopping list`,
      })

      onUpdate()
    } catch (error) {
      console.error("Error accepting suggestion:", error)
      showToast({
        type: "error",
        title: "Failed to accept suggestion",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleRejectSuggestion = async (suggestion: ItemSuggestion) => {
    setLoading(suggestion.id)
    try {
      const response = await fetch(`/api/meetups/${meetupId}/item-suggestions/${suggestion.id}/reject`, {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to reject suggestion")
      }

      showToast({
        type: "info",
        title: "Suggestion rejected",
        message: `${suggestion.name} suggestion has been removed`,
      })

      onUpdate()
    } catch (error) {
      console.error("Error rejecting suggestion:", error)
      showToast({
        type: "error",
        title: "Failed to reject suggestion",
        message: error instanceof Error ? error.message : "Please try again",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="item-suggestions-list">
      <div className="item-suggestions-header">
        <h4 className="item-suggestions-title">
          <Package size={18} />
          Item Suggestions ({suggestions?.length || 0})
        </h4>
        {isHost && (
          <p className="item-suggestions-subtitle">
            {suggestions && suggestions.length > 0
              ? "Participants have suggested these items for the shopping list"
              : "No item suggestions yet. Participants can suggest items to add to your shopping list."}
          </p>
        )}
      </div>

      {suggestions && suggestions.length > 0 ? (
        <div className="item-suggestions-content">
          {suggestions.map((suggestion) => (
            <div key={suggestion.id} className="item-suggestion-card">
              <div className="item-suggestion-info">
                <div className="item-suggestion-main">
                  <div className="item-suggestion-name">
                    <strong>{suggestion.name}</strong>
                    <span className="item-suggestion-details">
                      {suggestion.baseAmount} {suggestion.unit}
                      {suggestion.perPerson && <span className="badge badge-primary ml-2">Per Person</span>}
                    </span>
                  </div>
                  <div className="item-suggestion-meta">
                    <span className="item-suggestion-category">{suggestion.category}</span>
                    <span className="item-suggestion-author">by @{suggestion.participantUsername}</span>
                  </div>
                </div>

                {suggestion.reason && (
                  <div className="item-suggestion-reason">
                    <strong>Reason:</strong> {suggestion.reason}
                  </div>
                )}
              </div>

              {isHost && (
                <div className="item-suggestion-actions">
                  <button
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    disabled={loading === suggestion.id}
                    className="button button-success button-sm"
                  >
                    {loading === suggestion.id ? <div className="loading-spinner" /> : <Check size={14} />}
                    Accept
                  </button>
                  <button
                    onClick={() => handleRejectSuggestion(suggestion)}
                    disabled={loading === suggestion.id}
                    className="button button-destructive button-sm"
                  >
                    {loading === suggestion.id ? <div className="loading-spinner" /> : <X size={14} />}
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : isHost ? (
        <div className="item-suggestions-empty">
          <Package size={32} className="item-suggestions-empty-icon" />
          <p className="item-suggestions-empty-text">No suggestions yet</p>
          <p className="item-suggestions-empty-subtext">Participants can suggest items to add to your shopping list</p>
        </div>
      ) : null}
    </div>
  )
}
