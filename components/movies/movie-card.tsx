"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { getImageUrl } from "@/lib/tmdb";
import { Heart, Bookmark, Play, Star, Info } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSubscription } from "@/hooks/use-subscription";

interface MovieCardProps {
  movie: {
    id: number;
    title?: string;
    name?: string;
    overview?: string;
    poster_path?: string;
    backdrop_path?: string;
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
    genre_ids?: number[];
    media_type?: string;
  };
  showActions?: boolean;
}

export default function MovieCard({
  movie,
  showActions = true,
}: MovieCardProps) {
  const { user } = useAuth();
  const { canLike, canWishlist } = useSubscription();
  const [isLiked, setIsLiked] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = movie.title || movie.name || "Unknown Title";
  const releaseDate = movie.release_date || movie.first_air_date;
  const mediaType = movie.media_type || (movie.title ? "movie" : "tv");
  const voteAverage = movie.vote_average || 0;
  const overview = movie.overview || "No description available";

  useEffect(() => {
    if (user && showActions && movie.id) {
      checkUserInteractions();
    }
  }, [user, movie.id, showActions]);

  const checkUserInteractions = async () => {
    if (!user || !movie.id) return;

    try {
      console.log(
        "Checking interactions for movie:",
        movie.id,
        "user:",
        user.id
      );

      // Check if user liked the movie
      const { data: likeData, error: likeError } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("movie_id", movie.id.toString())
        .maybeSingle();

      if (likeError && likeError.code !== "PGRST116") {
        console.error("Like check error:", likeError);
      } else {
        console.log("Like data:", likeData);
        setIsLiked(!!likeData);
      }

      // Check if user wishlisted the movie
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
        .eq("movie_id", movie.id.toString())
        .maybeSingle();

      if (wishlistError && wishlistError.code !== "PGRST116") {
        console.error("Wishlist check error:", wishlistError);
      } else {
        console.log("Wishlist data:", wishlistData);
        setIsWishlisted(!!wishlistData);
      }
    } catch (error) {
      console.error("Error checking interactions:", error);
    }
  };

  const handleLike = async () => {
    console.log("Handle like clicked");
    console.log("User:", user?.email);

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to like movies",
        variant: "destructive",
      });
      return;
    }

    if (!canLike) {
      toast({
        title: "Upgrade required",
        description: "Upgrade to Basic or Premium to like movies",
        variant: "destructive",
      });
      return;
    }

    if (!movie.id) return;

    setLoading(true);

    try {
      if (isLiked) {
        console.log("Removing like...");
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movie.id.toString());

        if (error) throw error;
        setIsLiked(false);
        toast({ title: "Removed from liked movies" });
      } else {
        console.log("Adding like...");
        const { error } = await supabase.from("likes").upsert(
          {
            user_id: user.id,
            movie_id: movie.id.toString(),
          },
          {
            onConflict: "user_id,movie_id",
          }
        );

        if (error) throw error;
        setIsLiked(true);
        toast({ title: "Added to liked movies" });
      }
    } catch (error: any) {
      console.error("Like error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update like status",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleWishlist = async () => {
    console.log("Handle wishlist clicked");
    console.log("User:", user?.email);

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add to wishlist",
        variant: "destructive",
      });
      return;
    }

    if (!canWishlist) {
      toast({
        title: "Upgrade required",
        description: "Upgrade to Basic or Premium to use wishlist",
        variant: "destructive",
      });
      return;
    }

    if (!movie.id) return;

    setLoading(true);

    try {
      if (isWishlisted) {
        console.log("Removing from wishlist...");
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movie.id.toString());

        if (error) throw error;
        setIsWishlisted(false);
        toast({ title: "Removed from wishlist" });
      } else {
        console.log("Adding to wishlist...");
        const { error } = await supabase.from("wishlists").upsert(
          {
            user_id: user.id,
            movie_id: movie.id.toString(),
          },
          {
            onConflict: "user_id,movie_id",
          }
        );

        if (error) throw error;
        setIsWishlisted(true);
        toast({ title: "Added to wishlist" });
      }
    } catch (error: any) {
      console.error("Wishlist error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update wishlist",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <Card className="bg-gray-900 border-gray-700 overflow-hidden group hover:scale-105 transition-transform duration-300">
      <div className="relative aspect-[2/3]">
        <Image
          src={
            getImageUrl(movie.poster_path || "") ||
            "/placeholder.svg?height=750&width=500"
          }
          alt={title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-2">
          <Link href={`/${mediaType}/${movie.id}`}>
            <Button size="sm" className="bg-red-600 hover:bg-red-700">
              <Play className="h-4 w-4 mr-2" />
              Watch
            </Button>
          </Link>
          <Link href={`/${mediaType}/${movie.id}`}>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-400 bg-transparent text-white hover:bg-gray-800"
            >
              <Info className="h-4 w-4 mr-2" />
              More Info
            </Button>
          </Link>
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-1 rounded">
          <Star className="h-3 w-3 text-yellow-400 fill-current" />
          <span className="text-xs text-white">{voteAverage.toFixed(1)}</span>
        </div>
      </div>

      <CardContent className="p-4">
        <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
          {title}
        </h3>
        <p className="text-gray-400 text-xs mb-3 line-clamp-2">{overview}</p>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {releaseDate && new Date(releaseDate).getFullYear()}
          </div>

          {showActions && (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleLike}
                disabled={loading}
                className={`h-8 w-8 p-0 ${
                  isLiked ? "text-red-500" : "text-gray-400"
                } hover:text-red-500`}
              >
                <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleWishlist}
                disabled={loading}
                className={`h-8 w-8 p-0 ${
                  isWishlisted ? "text-blue-500" : "text-gray-400"
                } hover:text-blue-500`}
              >
                <Bookmark
                  className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
                />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
