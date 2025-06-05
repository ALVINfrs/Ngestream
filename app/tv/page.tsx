"use client";

import { useEffect, useState } from "react";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieGrid from "@/components/movies/movie-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function TVShowsPage() {
  const [popularShows, setPopularShows] = useState<TMDBMovie[]>([]);
  const [topRatedShows, setTopRatedShows] = useState<TMDBMovie[]>([]);
  const [latestShows, setLatestShows] = useState<TMDBMovie[]>([]);
  const [onTheAirShows, setOnTheAirShows] = useState<TMDBMovie[]>([]);
  const [indonesianShows, setIndonesianShows] = useState<TMDBMovie[]>([]);
  const [latestIndonesianShows, setLatestIndonesianShows] = useState<
    TMDBMovie[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("popular");

  useEffect(() => {
    fetchShows();
  }, []);

  const fetchShows = async () => {
    setLoading(true);
    try {
      const [
        popular,
        topRated,
        latest,
        onTheAir,
        indonesian,
        latestIndonesian,
      ] = await Promise.all([
        tmdbApi.getPopular("tv"),
        tmdbApi.getTopRated("tv"),
        tmdbApi.getLatest("tv"),
        tmdbApi.getOnTheAir(),
        tmdbApi.getPopularIndonesian("tv"),
        tmdbApi.getRecentIndonesian("tv"),
      ]);

      setPopularShows(popular.results || []);
      setTopRatedShows(topRated.results || []);
      setLatestShows(latest.results || []);
      setOnTheAirShows(onTheAir.results || []);
      setIndonesianShows(indonesian.results || []);
      setLatestIndonesianShows(latestIndonesian.results || []);
    } catch (error) {
      console.error("Error fetching TV shows:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShows = async () => {
    const nextPage = page + 1;
    try {
      let newShows: TMDBMovie[] = [];

      switch (activeTab) {
        case "popular":
          const popular = await tmdbApi.getPopular("tv", nextPage);
          newShows = popular.results || [];
          setPopularShows((prev) => [...prev, ...newShows]);
          break;
        case "top_rated":
          const topRated = await tmdbApi.getTopRated("tv", nextPage);
          newShows = topRated.results || [];
          setTopRatedShows((prev) => [...prev, ...newShows]);
          break;
        case "latest":
          const latest = await tmdbApi.getLatest("tv", nextPage);
          newShows = latest.results || [];
          setLatestShows((prev) => [...prev, ...newShows]);
          break;
        case "on_the_air":
          const onTheAir = await tmdbApi.getOnTheAir(nextPage);
          newShows = onTheAir.results || [];
          setOnTheAirShows((prev) => [...prev, ...newShows]);
          break;
        case "indonesian":
          const indonesian = await tmdbApi.getPopularIndonesian("tv", nextPage);
          newShows = indonesian.results || [];
          setIndonesianShows((prev) => [...prev, ...newShows]);
          break;
        case "latest_indonesian":
          const latestIndonesian = await tmdbApi.getRecentIndonesian(
            "tv",
            nextPage
          );
          newShows = latestIndonesian.results || [];
          setLatestIndonesianShows((prev) => [...prev, ...newShows]);
          break;
      }

      setPage(nextPage);
    } catch (error) {
      console.error("Error loading more TV shows:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          TV Shows
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
              value="on_the_air"
              className="data-[state=active]:bg-red-600"
            >
              📺 On The Air
            </TabsTrigger>
            <TabsTrigger
              value="top_rated"
              className="data-[state=active]:bg-red-600"
            >
              Top Rated
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
              movies={popularShows}
              loading={loading && page === 1}
              hasMore={popularShows.length >= 20}
              onLoadMore={loadMoreShows}
            />
          </TabsContent>

          <TabsContent value="latest" className="mt-0">
            <MovieGrid
              movies={latestShows}
              loading={loading && page === 1}
              hasMore={latestShows.length >= 20}
              onLoadMore={loadMoreShows}
              emptyMessage="No latest TV shows found. Try refreshing the page."
            />
          </TabsContent>

          <TabsContent value="on_the_air" className="mt-0">
            <MovieGrid
              movies={onTheAirShows}
              loading={loading && page === 1}
              hasMore={onTheAirShows.length >= 20}
              onLoadMore={loadMoreShows}
              emptyMessage="No TV shows currently on the air."
            />
          </TabsContent>

          <TabsContent value="top_rated" className="mt-0">
            <MovieGrid
              movies={topRatedShows}
              loading={loading && page === 1}
              hasMore={topRatedShows.length >= 20}
              onLoadMore={loadMoreShows}
            />
          </TabsContent>

          <TabsContent value="indonesian" className="mt-0">
            <MovieGrid
              movies={indonesianShows}
              loading={loading && page === 1}
              hasMore={indonesianShows.length >= 20}
              onLoadMore={loadMoreShows}
              emptyMessage="No Indonesian TV shows found. Try refreshing the page."
            />
          </TabsContent>

          <TabsContent value="latest_indonesian" className="mt-0">
            <MovieGrid
              movies={latestIndonesianShows}
              loading={loading && page === 1}
              hasMore={latestIndonesianShows.length >= 20}
              onLoadMore={loadMoreShows}
              emptyMessage="No latest Indonesian TV shows found. Try refreshing the page."
            />
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
}
