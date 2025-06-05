"use client";

import { useEffect, useState } from "react";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieGrid from "@/components/movies/movie-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv } from "lucide-react";

export default function IndonesianContentPage() {
  const [indonesianMovies, setIndonesianMovies] = useState<TMDBMovie[]>([]);
  const [indonesianTV, setIndonesianTV] = useState<TMDBMovie[]>([]);
  const [topRatedIndonesianMovies, setTopRatedIndonesianMovies] = useState<
    TMDBMovie[]
  >([]);
  const [latestIndonesianMovies, setLatestIndonesianMovies] = useState<
    TMDBMovie[]
  >([]);
  const [latestIndonesianTV, setLatestIndonesianTV] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("movies");
  const [activeMovieTab, setActiveMovieTab] = useState("popular");
  const [activeTVTab, setActiveTVTab] = useState("popular");

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [movies, tvShows, topRatedMovies, latestMovies, latestTV] =
        await Promise.all([
          tmdbApi.getPopularIndonesian("movie"),
          tmdbApi.getPopularIndonesian("tv"),
          tmdbApi.getTopRatedIndonesian("movie"),
          tmdbApi.getRecentIndonesian("movie"),
          tmdbApi.getRecentIndonesian("tv"),
        ]);

      setIndonesianMovies(movies.results || []);
      setIndonesianTV(tvShows.results || []);
      setTopRatedIndonesianMovies(topRatedMovies.results || []);
      setLatestIndonesianMovies(latestMovies.results || []);
      setLatestIndonesianTV(latestTV.results || []);
    } catch (error) {
      console.error("Error fetching Indonesian content:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreContent = async () => {
    const nextPage = page + 1;
    try {
      if (activeTab === "movies") {
        if (activeMovieTab === "popular") {
          const { results } = await tmdbApi.getPopularIndonesian(
            "movie",
            nextPage
          );
          setIndonesianMovies((prev) => [...prev, ...(results || [])]);
        } else if (activeMovieTab === "top_rated") {
          const { results } = await tmdbApi.getTopRatedIndonesian(
            "movie",
            nextPage
          );
          setTopRatedIndonesianMovies((prev) => [...prev, ...(results || [])]);
        } else {
          const { results } = await tmdbApi.getRecentIndonesian(
            "movie",
            nextPage
          );
          setLatestIndonesianMovies((prev) => [...prev, ...(results || [])]);
        }
      } else {
        if (activeTVTab === "popular") {
          const { results } = await tmdbApi.getPopularIndonesian(
            "tv",
            nextPage
          );
          setIndonesianTV((prev) => [...prev, ...(results || [])]);
        } else {
          const { results } = await tmdbApi.getRecentIndonesian("tv", nextPage);
          setLatestIndonesianTV((prev) => [...prev, ...(results || [])]);
        }
      }
      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more content:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white">
            Indonesian Content
          </h1>
          <span className="text-3xl ml-2">🇮🇩</span>
        </div>

        <Tabs
          defaultValue="movies"
          onValueChange={(value) => {
            setActiveTab(value);
            setPage(1);
          }}
          className="mb-8"
        >
          <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start mb-6">
            <TabsTrigger
              value="movies"
              className="data-[state=active]:bg-red-600"
            >
              <Film className="h-4 w-4 mr-2" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="data-[state=active]:bg-red-600">
              <Tv className="h-4 w-4 mr-2" />
              TV Shows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-0">
            <Tabs
              defaultValue="popular"
              onValueChange={(value) => {
                setActiveMovieTab(value);
                setPage(1);
              }}
              className="mb-8"
            >
              <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start mb-6">
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-red-600"
                >
                  Popular
                </TabsTrigger>
                <TabsTrigger
                  value="latest"
                  className="data-[state=active]:bg-red-600"
                >
                  🆕 Latest
                </TabsTrigger>
                <TabsTrigger
                  value="top_rated"
                  className="data-[state=active]:bg-red-600"
                >
                  Top Rated
                </TabsTrigger>
              </TabsList>

              <TabsContent value="popular" className="mt-0">
                <MovieGrid
                  movies={indonesianMovies}
                  loading={loading && page === 1}
                  hasMore={indonesianMovies.length >= 20}
                  onLoadMore={loadMoreContent}
                  emptyMessage="No Indonesian movies found. Try refreshing the page."
                />
              </TabsContent>

              <TabsContent value="latest" className="mt-0">
                <MovieGrid
                  movies={latestIndonesianMovies}
                  loading={loading && page === 1}
                  hasMore={latestIndonesianMovies.length >= 20}
                  onLoadMore={loadMoreContent}
                  emptyMessage="No latest Indonesian movies found. Try refreshing the page."
                />
              </TabsContent>

              <TabsContent value="top_rated" className="mt-0">
                <MovieGrid
                  movies={topRatedIndonesianMovies}
                  loading={loading && page === 1}
                  hasMore={topRatedIndonesianMovies.length >= 20}
                  onLoadMore={loadMoreContent}
                  emptyMessage="No top rated Indonesian movies found. Try refreshing the page."
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="tv" className="mt-0">
            <Tabs
              defaultValue="popular"
              onValueChange={(value) => {
                setActiveTVTab(value);
                setPage(1);
              }}
              className="mb-8"
            >
              <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start mb-6">
                <TabsTrigger
                  value="popular"
                  className="data-[state=active]:bg-red-600"
                >
                  Popular
                </TabsTrigger>
                <TabsTrigger
                  value="latest"
                  className="data-[state=active]:bg-red-600"
                >
                  🆕 Latest
                </TabsTrigger>
              </TabsList>

              <TabsContent value="popular" className="mt-0">
                <MovieGrid
                  movies={indonesianTV}
                  loading={loading && page === 1}
                  hasMore={indonesianTV.length >= 20}
                  onLoadMore={loadMoreContent}
                  emptyMessage="No Indonesian TV shows found. Try refreshing the page."
                />
              </TabsContent>

              <TabsContent value="latest" className="mt-0">
                <MovieGrid
                  movies={latestIndonesianTV}
                  loading={loading && page === 1}
                  hasMore={latestIndonesianTV.length >= 20}
                  onLoadMore={loadMoreContent}
                  emptyMessage="No latest Indonesian TV shows found. Try refreshing the page."
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
