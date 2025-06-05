"use client";

import { useEffect, useState } from "react";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieGrid from "@/components/movies/movie-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MoviesPage() {
  const [popularMovies, setPopularMovies] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<TMDBMovie[]>([]);
  const [latestMovies, setLatestMovies] = useState<TMDBMovie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<TMDBMovie[]>([]);
  const [indonesianMovies, setIndonesianMovies] = useState<TMDBMovie[]>([]);
  const [latestIndonesianMovies, setLatestIndonesianMovies] = useState<
    TMDBMovie[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("popular");

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const [
        popular,
        topRated,
        upcoming,
        latest,
        nowPlaying,
        indonesian,
        latestIndonesian,
      ] = await Promise.all([
        tmdbApi.getPopular("movie"),
        tmdbApi.getTopRated("movie"),
        tmdbApi.getUpcoming(),
        tmdbApi.getLatest("movie"),
        tmdbApi.getNowPlaying(),
        tmdbApi.getPopularIndonesian("movie"),
        tmdbApi.getRecentIndonesian("movie"),
      ]);

      setPopularMovies(popular.results || []);
      setTopRatedMovies(topRated.results || []);
      setUpcomingMovies(upcoming.results || []);
      setLatestMovies(latest.results || []);
      setNowPlayingMovies(nowPlaying.results || []);
      setIndonesianMovies(indonesian.results || []);
      setLatestIndonesianMovies(latestIndonesian.results || []);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMovies = async () => {
    const nextPage = page + 1;
    try {
      let newMovies: TMDBMovie[] = [];

      switch (activeTab) {
        case "popular":
          const popular = await tmdbApi.getPopular("movie", nextPage);
          newMovies = popular.results || [];
          setPopularMovies((prev) => [...prev, ...newMovies]);
          break;
        case "top_rated":
          const topRated = await tmdbApi.getTopRated("movie", nextPage);
          newMovies = topRated.results || [];
          setTopRatedMovies((prev) => [...prev, ...newMovies]);
          break;
        case "upcoming":
          const upcoming = await tmdbApi.getUpcoming(nextPage);
          newMovies = upcoming.results || [];
          setUpcomingMovies((prev) => [...prev, ...newMovies]);
          break;
        case "latest":
          const latest = await tmdbApi.getLatest("movie", nextPage);
          newMovies = latest.results || [];
          setLatestMovies((prev) => [...prev, ...newMovies]);
          break;
        case "now_playing":
          const nowPlaying = await tmdbApi.getNowPlaying(nextPage);
          newMovies = nowPlaying.results || [];
          setNowPlayingMovies((prev) => [...prev, ...newMovies]);
          break;
        case "indonesian":
          const indonesian = await tmdbApi.getPopularIndonesian(
            "movie",
            nextPage
          );
          newMovies = indonesian.results || [];
          setIndonesianMovies((prev) => [...prev, ...newMovies]);
          break;
        case "latest_indonesian":
          const latestIndonesian = await tmdbApi.getRecentIndonesian(
            "movie",
            nextPage
          );
          newMovies = latestIndonesian.results || [];
          setLatestIndonesianMovies((prev) => [...prev, ...newMovies]);
          break;
      }

      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more movies:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Movies
        </h1>

        <Tabs
          defaultValue="popular"
          onValueChange={(value) => {
            setActiveTab(value);
            setPage(1);
          }}
          className="mb-8"
        >
          <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start mb-6 flex-wrap">
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
              value="now_playing"
              className="data-[state=active]:bg-red-600"
            >
              🎬 Now Playing
            </TabsTrigger>
            <TabsTrigger
              value="top_rated"
              className="data-[state=active]:bg-red-600"
            >
              Top Rated
            </TabsTrigger>
            <TabsTrigger
              value="upcoming"
              className="data-[state=active]:bg-red-600"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="indonesian"
              className="data-[state=active]:bg-red-600"
            >
              Indonesian 🇮🇩
            </TabsTrigger>
            <TabsTrigger
              value="latest_indonesian"
              className="data-[state=active]:bg-red-600"
            >
              🇮🇩 Latest Indonesian
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular" className="mt-0">
            <MovieGrid
              movies={popularMovies}
              loading={loading && page === 1}
              hasMore={popularMovies.length >= 20}
              onLoadMore={loadMoreMovies}
            />
          </TabsContent>

          <TabsContent value="latest" className="mt-0">
            <MovieGrid
              movies={latestMovies}
              loading={loading && page === 1}
              hasMore={latestMovies.length >= 20}
              onLoadMore={loadMoreMovies}
              emptyMessage="No latest movies found. Try refreshing the page."
            />
          </TabsContent>

          <TabsContent value="now_playing" className="mt-0">
            <MovieGrid
              movies={nowPlayingMovies}
              loading={loading && page === 1}
              hasMore={nowPlayingMovies.length >= 20}
              onLoadMore={loadMoreMovies}
              emptyMessage="No movies currently playing in theaters."
            />
          </TabsContent>

          <TabsContent value="top_rated" className="mt-0">
            <MovieGrid
              movies={topRatedMovies}
              loading={loading && page === 1}
              hasMore={topRatedMovies.length >= 20}
              onLoadMore={loadMoreMovies}
            />
          </TabsContent>

          <TabsContent value="upcoming" className="mt-0">
            <MovieGrid
              movies={upcomingMovies}
              loading={loading && page === 1}
              hasMore={upcomingMovies.length >= 20}
              onLoadMore={loadMoreMovies}
            />
          </TabsContent>

          <TabsContent value="indonesian" className="mt-0">
            <MovieGrid
              movies={indonesianMovies}
              loading={loading && page === 1}
              hasMore={indonesianMovies.length >= 20}
              onLoadMore={loadMoreMovies}
              emptyMessage="No Indonesian movies found. Try refreshing the page."
            />
          </TabsContent>

          <TabsContent value="latest_indonesian" className="mt-0">
            <MovieGrid
              movies={latestIndonesianMovies}
              loading={loading && page === 1}
              hasMore={latestIndonesianMovies.length >= 20}
              onLoadMore={loadMoreMovies}
              emptyMessage="No latest Indonesian movies found. Try refreshing the page."
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
