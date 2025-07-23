"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase";
import {
  getBackdropUrl,
  getImageUrl,
  getContentRating,
  getRatingColor,
} from "@/lib/tmdb";
import {
  Heart,
  Bookmark,
  Star,
  Calendar,
  Clock,
  Lock,
  Users,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReactPlayer from "react-player";
import CommentSection from "@/components/comments/comment-section";

interface MovieDetailProps {
  movie: any;
  trailerKey?: string;
}

export default function MovieDetail({ movie, trailerKey }: MovieDetailProps) {
  const { user } = useAuth();
  const { canLike, canWishlist, canComment, isPremium } = useSubscription();
  const [isLiked, setIsLiked] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const title = movie.title || movie.name;
  const releaseDate = movie.release_date || movie.first_air_date;
  const mediaType = movie.title ? "movie" : "tv";
  const contentRating = getContentRating(movie, mediaType);
  const ratingColor = getRatingColor(contentRating);
  const formattedDate = releaseDate
    ? new Date(releaseDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown";

  useEffect(() => {
    if (user) {
      checkUserInteractions();
      fetchLikesCount();
    }
  }, [user]);

  const checkUserInteractions = async () => {
    if (!user) return;

    try {
      // Check if user liked the movie
      const { data: likeData } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user.id)
        .eq("movie_id", movie.id.toString())
        .single();

      setIsLiked(!!likeData);

      // Check if user wishlisted the movie
      const { data: wishlistData } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id)
        .eq("movie_id", movie.id.toString())
        .single();

      setIsWishlisted(!!wishlistData);
    } catch (error) {
      console.error("Error checking user interactions:", error);
    }
  };

  const fetchLikesCount = async () => {
    try {
      const { count } = await supabase
        .from("likes")
        .select("*", { count: "exact" })
        .eq("movie_id", movie.id.toString());
      setLikesCount(count || 0);
    } catch (error) {
      console.error("Error fetching likes count:", error);
    }
  };

  const handleLike = async () => {
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

    setLoading(true);

    try {
      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movie.id.toString());

        if (error) throw error;
        setIsLiked(false);
        setLikesCount((prev) => prev - 1);
        toast({ title: "Removed from liked movies" });
      } else {
        // Add like
        const { error } = await supabase.from("likes").insert({
          user_id: user.id,
          movie_id: movie.id.toString(),
        });

        if (error) throw error;
        setIsLiked(true);
        setLikesCount((prev) => prev + 1);
        toast({ title: "Added to liked movies" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleWishlist = async () => {
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

    setLoading(true);

    try {
      if (isWishlisted) {
        // Remove from wishlist
        const { error } = await supabase
          .from("wishlists")
          .delete()
          .eq("user_id", user.id)
          .eq("movie_id", movie.id.toString());

        if (error) throw error;
        setIsWishlisted(false);
        toast({ title: "Removed from wishlist" });
      } else {
        // Add to wishlist
        const { error } = await supabase.from("wishlists").insert({
          user_id: user.id,
          movie_id: movie.id.toString(),
        });

        if (error) throw error;
        setIsWishlisted(true);
        toast({ title: "Added to wishlist" });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  return (
    <div className="bg-black text-white">
      {/* Backdrop Image */}
      <div className="relative h-[50vh] md:h-[70vh] w-full">
        <Image
          src={
            getBackdropUrl(movie.backdrop_path, "original") ||
            "/placeholder.svg"
          }
          alt={title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

        {/* Movie Info Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="hidden md:block w-48 h-72 relative rounded-lg overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(movie.poster_path) || "/placeholder.svg"}
                alt={title}
                fill
                className="object-cover"
              />
            </div>

            {/* Details */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-2">{title}</h1>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                  <span>{movie.vote_average?.toFixed(1)}/10</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formattedDate}</span>
                </div>
                {movie.runtime && (
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>{movie.runtime} min</span>
                  </div>
                )}
                <Badge className={`${ratingColor} text-white font-bold`}>
                  <Users className="h-3 w-3 mr-1" />
                  {contentRating}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((genre: any) => (
                  <Badge
                    key={genre.id}
                    variant="outline"
                    className="border-gray-600"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </div>

              <p className="text-gray-300 mb-6 max-w-2xl">{movie.overview}</p>

              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={handleLike}
                  disabled={loading || !canLike}
                  className={`${
                    isLiked
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-gray-800 hover:bg-gray-700"
                  } flex items-center gap-2 transform hover:scale-105 transition-all`}
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
                  />
                  <span>
                    {isLiked ? "Liked" : "Like"}{" "}
                    {likesCount > 0 && `(${likesCount})`}
                  </span>
                </Button>

                <Button
                  onClick={handleWishlist}
                  disabled={loading || !canWishlist}
                  className={`${
                    isWishlisted
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-800 hover:bg-gray-700"
                  } flex items-center gap-2 transform hover:scale-105 transition-all`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isWishlisted ? "fill-current" : ""}`}
                  />
                  <span>{isWishlisted ? "Wishlisted" : "Add to Wishlist"}</span>
                </Button>

                {!canLike && (
                  <Button
                    variant="outline"
                    className="border-yellow-600 text-yellow-500 hover:bg-yellow-900/20 transform hover:scale-105 transition-all"
                    onClick={() => {
                      /* Navigate to subscription page */
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    Upgrade to Interact
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs defaultValue="trailer" className="w-full">
          <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start mb-6">
            <TabsTrigger
              value="trailer"
              className="data-[state=active]:bg-red-600"
            >
              Trailer
            </TabsTrigger>
            <TabsTrigger
              value="cast"
              className="data-[state=active]:bg-red-600"
            >
              Cast
            </TabsTrigger>
            <TabsTrigger
              value="comments"
              className="data-[state=active]:bg-red-600"
            >
              Comments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trailer" className="mt-0">
            <div className="aspect-video w-full max-w-4xl mx-auto bg-gray-900 rounded-lg overflow-hidden">
              {trailerKey ? (
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${trailerKey}`}
                  width="100%"
                  height="100%"
                  controls
                  playing
                  muted
                  playsinline
                  config={{
                    youtube: {
                      playerVars: {
                        modestbranding: 1,
                        rel: 0,
                        fs: 1,
                        showinfo: 0,
                        autoplay: 1,
                      },
                    },
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-gray-400">No trailer available</p>
                </div>
              )}
            </div>
            {!isPremium && (
              <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-800 rounded-lg text-center">
                <p className="text-yellow-500 flex items-center justify-center">
                  <Lock className="h-4 w-4 mr-2" />
                  Upgrade to Premium to watch full movies and trailers
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cast" className="mt-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.credits?.cast?.slice(0, 12).map((person: any) => (
                <div
                  key={person.id}
                  className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition-transform"
                >
                  <div className="aspect-[2/3] relative">
                    <Image
                      src={
                        getImageUrl(person.profile_path) || "/placeholder.svg"
                      }
                      alt={person.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm">{person.name}</h4>
                    <p className="text-gray-400 text-xs">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comments" className="mt-0">
            <CommentSection movieId={movie.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
