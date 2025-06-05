"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieGrid from "@/components/movies/movie-grid";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const searchQuery = searchParams.get("q");
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const searchResults = await tmdbApi.search(searchQuery);
      // Filter and clean the results
      const cleanResults = (searchResults.results || []).map((movie: any) => ({
        ...movie,
        vote_average: movie.vote_average || 0,
        overview: movie.overview || "No description available",
        poster_path: movie.poster_path || null,
        backdrop_path: movie.backdrop_path || null,
      }));
      setResults(cleanResults);
    } catch (error) {
      console.error("Error searching:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Search
        </h1>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search movies, TV shows..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <Button type="submit" className="bg-red-600 hover:bg-red-700">
              Search
            </Button>
          </div>
        </form>

        {hasSearched && (
          <div className="mb-4">
            <p className="text-gray-400">
              {loading
                ? "Searching..."
                : `Found ${results.length} results for "${searchParams.get(
                    "q"
                  )}"`}
            </p>
          </div>
        )}

        <MovieGrid
          movies={results}
          loading={loading}
          emptyMessage={
            hasSearched
              ? "No results found. Try a different search term."
              : "Enter a search term to find movies and TV shows."
          }
        />
      </div>

      <Footer />
    </div>
  );
}
