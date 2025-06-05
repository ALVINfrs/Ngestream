"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { tmdbApi } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieGrid from "@/components/movies/movie-grid";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function LikedMoviesPage() {
  const { user, loading: authLoading } = useAuth();
  const [likedMovies, setLikedMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchLikedMovies();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading]);

  const fetchLikedMovies = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log("Fetching liked movies for user:", user.id);

      // Get liked movie IDs from Supabase
      const { data: likedData, error } = await supabase
        .from("likes")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Liked movies fetch error:", error);
        throw error;
      }

      console.log("Liked movies data:", likedData);

      if (!likedData || likedData.length === 0) {
        setLikedMovies([]);
        setLoading(false);
        return;
      }

      // Fetch actual movie data from TMDB
      const moviePromises = likedData.map(async (item) => {
        try {
          const movieId = Number.parseInt(item.movie_id);
          if (isNaN(movieId)) return null;

          // Try to get movie details
          const movieDetails = await tmdbApi.getDetails("movie", movieId);
          return {
            ...movieDetails,
            id: movieDetails.id,
            title: movieDetails.title || movieDetails.name,
            poster_path: movieDetails.poster_path,
            backdrop_path: movieDetails.backdrop_path,
            vote_average: movieDetails.vote_average || 0,
            liked_at: item.created_at,
          };
        } catch (err) {
          console.error(`Error fetching movie ${item.movie_id}:`, err);
          // Return a placeholder if movie fetch fails
          return {
            id: Number.parseInt(item.movie_id),
            title: `Movie ${item.movie_id}`,
            overview: "Movie information unavailable",
            poster_path: null,
            backdrop_path: null,
            vote_average: 0,
            liked_at: item.created_at,
          };
        }
      });

      const moviesData = await Promise.all(moviePromises);
      const validMovies = moviesData.filter((movie) => movie !== null);

      setLikedMovies(validMovies);
    } catch (error) {
      console.error("Error fetching liked movies:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-white text-xl flex items-center">
            <Loader2 className="animate-spin mr-2" />
            Loading...
          </div>
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
            <p className="text-gray-400 mb-4">
              You need to be logged in to view your liked movies.
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
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Liked Movies
        </h1>

        <MovieGrid
          movies={likedMovies}
          loading={loading}
          emptyMessage="You haven't liked any movies yet. Start exploring and like movies you enjoy!"
        />
      </div>

      <Footer />
    </div>
  );
}
