"use client"

import { useAuth } from "./use-auth"

type SubscriptionTier = "free" | "basic" | "premium"

export function useSubscription() {
  const { subscription } = useAuth()

  const currentTier: SubscriptionTier = subscription?.tier || "free"

  const canLike = currentTier !== "free"
  const canWishlist = currentTier !== "free"
  const canComment = currentTier === "premium"
  const canAccessExclusiveContent = currentTier === "premium"

  const isBasic = currentTier === "basic"
  const isPremium = currentTier === "premium"
  const isFree = currentTier === "free"

  return {
    currentTier,
    canLike,
    canWishlist,
    canComment,
    canAccessExclusiveContent,
    isBasic,
    isPremium,
    isFree,
    subscription,
  }
}
