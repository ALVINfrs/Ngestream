"use client";

import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import SubscriptionCard from "@/components/subscription/subscription-card";
import { Crown } from "lucide-react";

const subscriptionPlans = [
  {
    tier: "free" as const,
    name: "Free",
    price: "Rp 0",
    description: "Akses dasar untuk informasi film",
    features: [
      "Browse film dan TV shows",
      "Lihat trailer dan detail",
      "Fitur pencarian dasar",
      "Akses terbatas ke konten",
    ],
    color: "gray",
  },
  {
    tier: "basic" as const,
    name: "Basic",
    price: "Rp 149.000",
    description: "Fitur lengkap untuk penggemar film",
    features: [
      "Semua fitur Free",
      "Like dan simpan film",
      "Wishlist pribadi",
      "Filter pencarian lanjutan",
      "Trailer kualitas HD",
    ],
    color: "blue",
    recommended: true,
  },
  {
    tier: "premium" as const,
    name: "Premium",
    price: "Rp 299.000",
    description: "Akses penuh ke semua fitur",
    features: [
      "Semua fitur Basic",
      "Komentar di film",
      "Akses konten eksklusif",
      "Trailer kualitas 4K",
      "Customer support prioritas",
      "Akses awal fitur baru",
    ],
    color: "yellow",
  },
];

export default function SubscriptionPage() {
  const { user, loading } = useAuth();
  const { currentTier } = useSubscription();

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-400">
              You need to be logged in to view subscription plans.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-yellow-500 mr-2" />
            <h1 className="text-4xl font-bold text-white">Choose Your Plan</h1>
          </div>
          <p className="text-gray-400 text-lg">
            Upgrade your experience with premium features
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Current plan:{" "}
            <span className="text-white font-medium">
              {currentTier.toUpperCase()}
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {subscriptionPlans.map((plan) => (
            <SubscriptionCard key={plan.tier} plan={plan} />
          ))}
        </div>

        <div className="mt-16 bg-gray-900/50 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Need Help?</h2>
          <p className="text-gray-400 mb-4">
            Have questions about our subscription plans? We're here to help!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@ngestream.com"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              Contact Support
            </a>
            <span className="text-gray-600 hidden sm:block">|</span>
            <a
              href="/faq"
              className="text-blue-400 hover:text-blue-300 transition-colors"
            >
              View FAQ
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
