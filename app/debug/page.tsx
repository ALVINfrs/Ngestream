"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/navbar";

export default function DebugPage() {
  const { user, profile, subscription, loading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    if (user) {
      fetchDebugInfo();
    }
  }, [user]);

  const fetchDebugInfo = async () => {
    if (!user) return;

    try {
      // Test database connections
      const [
        profileTest,
        subscriptionTest,
        likesTest,
        wishlistsTest,
        commentsTest,
      ] = await Promise.all([
        supabase.from("user_profiles").select("*").eq("user_id", user.id),
        supabase.from("subscriptions").select("*").eq("user_id", user.id),
        supabase.from("likes").select("*").eq("user_id", user.id),
        supabase.from("wishlists").select("*").eq("user_id", user.id),
        supabase.from("comments").select("*").eq("user_id", user.id),
      ]);

      setDebugInfo({
        profileTest,
        subscriptionTest,
        likesTest,
        wishlistsTest,
        commentsTest,
      });
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  const testLike = async () => {
    if (!user) return;

    try {
      // Use upsert to handle duplicates
      const { data, error } = await supabase
        .from("likes")
        .upsert(
          {
            user_id: user.id,
            movie_id: "12345",
          },
          {
            onConflict: "user_id,movie_id",
          }
        )
        .select();

      console.log("Test like result:", { data, error });
      alert(`Like test: ${error ? "Error - " + error.message : "Success!"}`);
    } catch (error) {
      console.error("Test like error:", error);
    }
  };

  const testWishlist = async () => {
    if (!user) return;

    try {
      // Use upsert to handle duplicates
      const { data, error } = await supabase
        .from("wishlists")
        .upsert(
          {
            user_id: user.id,
            movie_id: "12345",
          },
          {
            onConflict: "user_id,movie_id",
          }
        )
        .select();

      console.log("Test wishlist result:", { data, error });
      alert(
        `Wishlist test: ${error ? "Error - " + error.message : "Success!"}`
      );
    } catch (error) {
      console.error("Test wishlist error:", error);
    }
  };

  const testComment = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          user_id: user.id,
          movie_id: "12345",
          comment: "Test comment from debug page",
        })
        .select();

      console.log("Test comment result:", { data, error });
      alert(`Comment test: ${error ? "Error - " + error.message : "Success!"}`);
    } catch (error) {
      console.error("Test comment error:", error);
    }
  };

  const clearTestData = async () => {
    if (!user) return;

    try {
      await Promise.all([
        supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", "12345"),
        supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", "12345"),
        supabase
          .from("comments")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", "12345"),
      ]);

      alert("Test data cleared!");
      fetchDebugInfo();
    } catch (error) {
      console.error("Clear test data error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>

        <div className="space-y-6">
          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Auth Status</h2>
            <p>Loading: {loading.toString()}</p>
            <p>User: {user?.email || "Not logged in"}</p>
            <p>Profile: {profile?.full_name || "No profile"}</p>
            <p>Subscription: {subscription?.tier || "No subscription"}</p>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Database Tests</h2>
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Test Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <button
                onClick={testLike}
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
              >
                Test Like
              </button>
              <button
                onClick={testWishlist}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                Test Wishlist
              </button>
              <button
                onClick={testComment}
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
              >
                Test Comment
              </button>
              <button
                onClick={clearTestData}
                className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-700"
              >
                Clear Test Data
              </button>
              <button
                onClick={fetchDebugInfo}
                className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-700"
              >
                Refresh Data
              </button>
            </div>
          </div>

          <div className="bg-gray-900 p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Quick Links</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a
                href="/profile"
                className="bg-yellow-600 px-4 py-2 rounded hover:bg-yellow-700 text-center"
              >
                Profile
              </a>
              <a
                href="/wishlist"
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 text-center"
              >
                Wishlist
              </a>
              <a
                href="/liked"
                className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 text-center"
              >
                Liked
              </a>
              <a
                href="/subscription"
                className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 text-center"
              >
                Subscription
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
