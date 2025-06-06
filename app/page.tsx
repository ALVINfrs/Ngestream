"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import MovieCarousel from "@/components/movies/movie-carousel";
import HeroCarousel from "@/components/movies/hero-carousel";
import AuthForm from "@/components/auth/auth-form";
import Footer from "@/components/layout/footer";

// --- KONFIGURASI TERPUSAT UNTUK SEMUA CAROUSEL DI HALAMAN UTAMA ---
// Menambah, mengurangi, atau mengubah urutan carousel sekarang SANGAT MUDAH.
// Cukup ubah urutan atau isi dari array ini.
const sectionsConfig = [
  {
    id: "latest_movies",
    title: "🆕 Latest Movies",
    apiCall: () => tmdbApi.getLatest("movie"),
  },
  {
    id: "latest_tv",
    title: "🆕 Latest TV Shows",
    apiCall: () => tmdbApi.getLatest("tv"),
  },
  {
    id: "now_playing",
    title: "🎬 Now Playing in Theaters",
    apiCall: () => tmdbApi.getNowPlaying(),
  },
  {
    id: "on_the_air",
    title: "📺 On The Air",
    apiCall: () => tmdbApi.getOnTheAir(),
  },
  {
    id: "trending_movies",
    title: "🔥 Trending Movies",
    apiCall: () => tmdbApi.getTrending("movie"),
  },
  {
    id: "trending_tv",
    title: "🔥 Trending TV Shows",
    apiCall: () => tmdbApi.getTrending("tv"),
  },
  {
    id: "popular_anime",
    title: "🎌 Popular Anime",
    apiCall: () => tmdbApi.getPopularAnime(),
  },
  {
    id: "latest_anime",
    title: "🎌 Latest Anime",
    apiCall: () => tmdbApi.getLatestAnime(),
  },
  {
    id: "airing_anime",
    title: "🎌 Currently Airing Anime",
    apiCall: () => tmdbApi.getCurrentlyAiringAnime(),
  },
  {
    id: "anime_movies",
    title: "🎌 Anime Movies",
    apiCall: () => tmdbApi.getAnimeMovies(),
  },
  {
    id: "popular_kdrama",
    title: "🇰🇷 Popular K-Drama",
    apiCall: () => tmdbApi.getPopularKDrama(),
  },
  {
    id: "latest_kdrama",
    title: "🇰🇷 Latest K-Drama",
    apiCall: () => tmdbApi.getLatestKDrama(),
  },
  {
    id: "airing_kdrama",
    title: "🇰🇷 Currently Airing K-Drama",
    apiCall: () => tmdbApi.getCurrentlyAiringKDrama(),
  },
  {
    id: "korean_movies",
    title: "🇰🇷 Korean Movies",
    apiCall: () => tmdbApi.getKoreanMovies(),
  },
  {
    id: "latest_indonesian_movies",
    title: "🇮🇩 Latest Indonesian Movies",
    apiCall: () => tmdbApi.getRecentIndonesian("movie"),
  },
  {
    id: "latest_indonesian_tv",
    title: "🇮🇩 Latest Indonesian TV Shows",
    apiCall: () => tmdbApi.getRecentIndonesian("tv"),
  },
  {
    id: "top_rated_movies",
    title: "⭐ Top Rated Movies",
    apiCall: () => tmdbApi.getTopRated("movie"),
  },
  {
    id: "upcoming_movies",
    title: "🔮 Upcoming Movies",
    apiCall: () => tmdbApi.getUpcoming(),
  },
];

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();

  // --- STATE YANG JAUH LEBIH SEDERHANA ---
  const [heroMovies, setHeroMovies] = useState<TMDBMovie[]>([]);
  // Satu state untuk menampung SEMUA data carousel
  const [sectionsData, setSectionsData] = useState<Record<string, TMDBMovie[]>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      // Membuat array of promises dari konfigurasi
      const promises = sectionsConfig.map((section) => section.apiCall());

      // Menggunakan Promise.allSettled agar jika SATU API gagal, yang lain tetap jalan
      const results = await Promise.allSettled(promises);

      const newSectionsData: Record<string, TMDBMovie[]> = {};
      results.forEach((result, index) => {
        const sectionId = sectionsConfig[index].id;
        if (result.status === "fulfilled") {
          newSectionsData[sectionId] = result.value.results || [];
        } else {
          // Jika ada error, set data ke array kosong agar tidak crash
          newSectionsData[sectionId] = [];
          console.error(
            `Failed to fetch data for ${sectionId}:`,
            result.reason
          );
        }
      });

      setSectionsData(newSectionsData);

      // Tetap set hero movies dari data trending yang sudah di-fetch
      const trendingMovies = newSectionsData["trending_movies"] || [];
      if (trendingMovies.length > 0) {
        setHeroMovies(trendingMovies.slice(0, 5));
      }
    } catch (error) {
      console.error(
        "An unexpected error occurred during data fetching:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

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
      <HeroCarousel movies={heroMovies} loading={loading} />

      {/* --- KONTEN DINAMIS BERDASARKAN KONFIGURASI --- */}
      <div className="px-4 md:px-8 py-8 space-y-8">
        {sectionsConfig.map((section, index) => (
          <div
            key={section.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <MovieCarousel
              title={section.title}
              movies={sectionsData[section.id] || []}
              loading={loading}
            />
          </div>
        ))}
      </div>
      <Footer />
    </div>
  );
}
