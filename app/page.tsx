"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import MovieCarousel from "@/components/movies/movie-carousel";
import HeroCarousel from "@/components/movies/hero-carousel";
import AuthForm from "@/components/auth/auth-form";
import Footer from "@/components/layout/footer";

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const [heroMovies, setHeroMovies] = useState<TMDBMovie[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<TMDBMovie[]>([]);
  const [trendingTV, setTrendingTV] = useState<TMDBMovie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<TMDBMovie[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<TMDBMovie[]>([]);
  const [latestMovies, setLatestMovies] = useState<TMDBMovie[]>([]);
  const [latestTV, setLatestTV] = useState<TMDBMovie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<TMDBMovie[]>([]);
  const [onTheAirTV, setOnTheAirTV] = useState<TMDBMovie[]>([]);
  const [indonesianMovies, setIndonesianMovies] = useState<TMDBMovie[]>([]);
  const [indonesianTV, setIndonesianTV] = useState<TMDBMovie[]>([]);
  const [latestIndonesianMovies, setLatestIndonesianMovies] = useState<
    TMDBMovie[]
  >([]);
  const [latestIndonesianTV, setLatestIndonesianTV] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading]);

  const fetchData = async () => {
    try {
      const [
        trending,
        trendingTVData,
        topRated,
        upcoming,
        latest,
        latestTVData,
        nowPlaying,
        onTheAir,
        indonesianMoviesData,
        indonesianTVData,
        latestIndonesianMoviesData,
        latestIndonesianTVData,
      ] = await Promise.all([
        tmdbApi.getTrending("movie"),
        tmdbApi.getTrending("tv"),
        tmdbApi.getTopRated("movie"),
        tmdbApi.getUpcoming(),
        tmdbApi.getLatest("movie"),
        tmdbApi.getLatest("tv"),
        tmdbApi.getNowPlaying(),
        tmdbApi.getOnTheAir(),
        tmdbApi.getPopularIndonesian("movie"),
        tmdbApi.getPopularIndonesian("tv"),
        tmdbApi.getRecentIndonesian("movie"),
        tmdbApi.getRecentIndonesian("tv"),
      ]);

      setTrendingMovies(trending.results || []);
      setTrendingTV(trendingTVData.results || []);
      setTopRatedMovies(topRated.results || []);
      setUpcomingMovies(upcoming.results || []);
      setLatestMovies(latest.results || []);
      setLatestTV(latestTVData.results || []);
      setNowPlayingMovies(nowPlaying.results || []);
      setOnTheAirTV(onTheAir.results || []);
      setIndonesianMovies(indonesianMoviesData.results || []);
      setIndonesianTV(indonesianTVData.results || []);
      setLatestIndonesianMovies(latestIndonesianMoviesData.results || []);
      setLatestIndonesianTV(latestIndonesianTVData.results || []);

      // Set hero movies (top 5 trending movies)
      if (trending.results && trending.results.length > 0) {
        setHeroMovies(trending.results.slice(0, 5));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      {/* Hero Carousel Section */}
      <HeroCarousel movies={heroMovies} loading={loading} />

      {/* Content Sections */}
      <div className="px-4 md:px-8 py-8 space-y-8">
        {/* Latest Releases */}
        <MovieCarousel
          title="🆕 Latest Movies"
          movies={latestMovies}
          loading={loading}
        />

        <MovieCarousel
          title="🆕 Latest TV Shows"
          movies={latestTV}
          loading={loading}
        />

        {/* Now Playing & On Air */}
        <MovieCarousel
          title="🎬 Now Playing in Theaters"
          movies={nowPlayingMovies}
          loading={loading}
        />

        <MovieCarousel
          title="📺 On The Air"
          movies={onTheAirTV}
          loading={loading}
        />

        {/* Trending */}
        <MovieCarousel
          title="🔥 Trending Movies"
          movies={trendingMovies}
          loading={loading}
        />

        <MovieCarousel
          title="🔥 Trending TV Shows"
          movies={trendingTV}
          loading={loading}
        />

        {/* Indonesian Content */}
        <MovieCarousel
          title="🇮🇩 Latest Indonesian Movies"
          movies={latestIndonesianMovies}
          loading={loading}
        />

        <MovieCarousel
          title="🇮🇩 Latest Indonesian TV Shows"
          movies={latestIndonesianTV}
          loading={loading}
        />

        <MovieCarousel
          title="🇮🇩 Top Indonesian Movies"
          movies={indonesianMovies}
          loading={loading}
        />

        <MovieCarousel
          title="🇮🇩 Indonesian TV Shows"
          movies={indonesianTV}
          loading={loading}
        />

        {/* Other Categories */}
        <MovieCarousel
          title="⭐ Top Rated Movies"
          movies={topRatedMovies}
          loading={loading}
        />

        <MovieCarousel
          title="🔮 Upcoming Movies"
          movies={upcomingMovies}
          loading={loading}
        />
      </div>
      <Footer />
    </div>
  );
}
