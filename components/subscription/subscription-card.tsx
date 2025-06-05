"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase";
import { Check, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface SubscriptionPlan {
  tier: "free" | "basic" | "premium";
  name: string;
  price: string;
  description: string;
  features: string[];
  color: string;
  recommended?: boolean;
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan;
}

export default function SubscriptionCard({ plan }: SubscriptionCardProps) {
  const { user } = useAuth();
  const { currentTier } = useSubscription();
  const [loading, setLoading] = useState(false);

  const isCurrentPlan = currentTier === plan.tier;
  const isUpgrade =
    (plan.tier !== "free" && currentTier === "free") ||
    (plan.tier === "premium" && currentTier === "basic");
  const isDowngrade =
    (plan.tier === "free" && currentTier !== "free") ||
    (plan.tier === "basic" && currentTier === "premium");

  const handleSubscribe = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to change subscription",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Update subscription in database
      const { error } = await supabase
        .from("subscriptions")
        .update({
          tier: plan.tier,
          is_active: true,
          expires_at:
            plan.tier === "free"
              ? null
              : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .eq("user_id", user.id);

      if (error) throw error;

      toast({
        title: "Subscription updated",
        description: `You are now subscribed to the ${plan.name} plan`,
      });

      // Reload the page to refresh auth context
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error("Subscription update error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update subscription",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getButtonColor = () => {
    if (isCurrentPlan) return "bg-gray-700 cursor-not-allowed";

    switch (plan.color) {
      case "blue":
        return "bg-blue-600 hover:bg-blue-700";
      case "yellow":
        return "bg-yellow-600 hover:bg-yellow-700";
      default:
        return "bg-gray-600 hover:bg-gray-700";
    }
  };

  const getBorderColor = () => {
    if (plan.recommended) {
      switch (plan.color) {
        case "blue":
          return "border-blue-500";
        case "yellow":
          return "border-yellow-500";
        default:
          return "border-gray-500";
      }
    }
    return "border-gray-700";
  };

  return (
    <Card
      className={`border-2 ${getBorderColor()} bg-gray-900 relative h-full flex flex-col`}
    >
      {plan.recommended && (
        <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs font-medium rounded-bl-lg">
          Recommended
        </div>
      )}

      <CardHeader>
        <CardTitle className="text-white">{plan.name}</CardTitle>
        <CardDescription className="text-gray-400">
          {plan.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6">
          <span className="text-3xl font-bold text-white">{plan.price}</span>
          <span className="text-gray-400 ml-1">/bulan</span>
        </div>

        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-400 mr-2 shrink-0 mt-0.5" />
              <span className="text-gray-300 text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          onClick={handleSubscribe}
          disabled={loading || isCurrentPlan}
          className={`w-full ${getButtonColor()}`}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isCurrentPlan ? (
            "Current Plan"
          ) : isUpgrade ? (
            "Upgrade"
          ) : isDowngrade ? (
            "Downgrade"
          ) : (
            "Subscribe"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
