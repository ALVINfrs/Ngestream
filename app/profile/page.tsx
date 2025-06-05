"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SubscriptionCard from "@/components/subscription/subscription-card";
import {
  Crown,
  Heart,
  Bookmark,
  MessageSquare,
  User,
  Settings,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

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

export default function ProfilePage() {
  const { user, profile, updateProfile } = useAuth();
  const { currentTier, subscription } = useSubscription();
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    likedMovies: 0,
    wishlistItems: 0,
    comments: 0,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
    }
    if (user) {
      fetchUserStats();
    }
  }, [profile, user]);

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const [likesCount, wishlistCount, commentsCount] = await Promise.all([
        supabase
          .from("likes")
          .select("*", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("wishlists")
          .select("*", { count: "exact" })
          .eq("user_id", user.id),
        supabase
          .from("comments")
          .select("*", { count: "exact" })
          .eq("user_id", user.id),
      ]);

      setStats({
        likedMovies: likesCount.count || 0,
        wishlistItems: wishlistCount.count || 0,
        comments: commentsCount.count || 0,
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await updateProfile({ full_name: fullName });
      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = () => {
    const tierColors = {
      free: "bg-gray-600",
      basic: "bg-blue-600",
      premium: "bg-yellow-600",
    };

    return (
      <Badge className={`${tierColors[currentTier]} text-white`}>
        {currentTier === "premium" && <Crown className="h-3 w-3 mr-1" />}
        {currentTier.toUpperCase()}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDaysRemaining = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getSubscriptionStatus = () => {
    if (!subscription)
      return { status: "No subscription", color: "text-gray-500" };

    if (!subscription.is_active) {
      return { status: "Inactive", color: "text-red-500" };
    }

    if (subscription.tier === "free") {
      return { status: "Active (Free)", color: "text-gray-400" };
    }

    if (subscription.expires_at) {
      const daysRemaining = getDaysRemaining(subscription.expires_at);
      if (daysRemaining <= 0) {
        return { status: "Expired", color: "text-red-500" };
      } else if (daysRemaining <= 7) {
        return {
          status: `Expires in ${daysRemaining} days`,
          color: "text-yellow-500",
        };
      } else {
        return {
          status: `Active (${daysRemaining} days left)`,
          color: "text-green-500",
        };
      }
    }

    return { status: "Active", color: "text-green-500" };
  };

  const subscriptionStatus = getSubscriptionStatus();

  if (!user) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">
              Please Sign In
            </h1>
            <p className="text-gray-400 mb-4">
              You need to be logged in to view your profile.
            </p>
            <Link href="/auth">
              <Button className="bg-red-600 hover:bg-red-700">Sign In</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-6 mb-8">
          <Avatar className="h-20 w-20">
            <AvatarImage
              src={profile?.avatar_url || "/placeholder.svg"}
              alt={profile?.full_name}
            />
            <AvatarFallback className="bg-red-600 text-2xl">
              {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold text-white">
              {profile?.full_name || "User"}
            </h1>
            <p className="text-gray-400">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              {getTierBadge()}
              <span className={`text-sm ${subscriptionStatus.color}`}>
                {subscriptionStatus.status}
              </span>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start mb-6">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-red-600"
            >
              <User className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="data-[state=active]:bg-red-600"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="subscription"
              className="data-[state=active]:bg-red-600"
            >
              <Crown className="h-4 w-4 mr-2" />
              Subscription
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Liked Movies
                  </CardTitle>
                  <Heart className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.likedMovies}
                  </div>
                  <p className="text-xs text-gray-400">Movies you've liked</p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Wishlist Items
                  </CardTitle>
                  <Bookmark className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.wishlistItems}
                  </div>
                  <p className="text-xs text-gray-400">
                    Movies in your wishlist
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-white">
                    Comments
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.comments}
                  </div>
                  <p className="text-xs text-gray-400">
                    Comments you've posted
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    asChild
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Link href="/wishlist">View Wishlist</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-gray-700 text-white hover:bg-gray-800"
                  >
                    <Link href="/liked">View Liked Movies</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Current Plan:</span>
                      <span className="text-white font-medium">
                        {currentTier.charAt(0).toUpperCase() +
                          currentTier.slice(1)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className={subscriptionStatus.color}>
                        {subscriptionStatus.status}
                      </span>
                    </div>
                    {subscription?.created_at && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Started:</span>
                        <span className="text-white text-sm">
                          {formatDate(subscription.created_at)}
                        </span>
                      </div>
                    )}
                    {subscription?.expires_at &&
                      subscription.tier !== "free" && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expires:</span>
                          <span className="text-white text-sm">
                            {formatDate(subscription.expires_at)}
                          </span>
                        </div>
                      )}
                    {subscription?.expires_at &&
                      subscription.tier !== "free" && (
                        <div className="flex justify-between">
                          <span className="text-gray-400">Duration:</span>
                          <span className="text-white text-sm">
                            {getDaysRemaining(subscription.expires_at) > 0
                              ? `${getDaysRemaining(
                                  subscription.expires_at
                                )} days remaining`
                              : "Expired"}
                          </span>
                        </div>
                      )}
                    <div className="pt-2 border-t border-gray-700">
                      <Button
                        asChild
                        className="w-full bg-yellow-600 hover:bg-yellow-700"
                      >
                        <Link href="/subscription">Manage Subscription</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Profile Settings</CardTitle>
                <CardDescription>
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-white">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-gray-800 border-gray-700 text-gray-400"
                    />
                    <p className="text-xs text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="mt-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">
                Choose Your Plan
              </h2>
              <p className="text-gray-400">
                Upgrade or change your subscription plan
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {subscriptionPlans.map((plan) => (
                <SubscriptionCard key={plan.tier} plan={plan} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
