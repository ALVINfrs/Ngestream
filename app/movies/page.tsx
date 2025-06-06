"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieGrid from "@/components/movies/movie-grid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Konfigurasi Terpusat untuk semua kategori film
const tabsConfig = [
  {
    value: "popular",
    label: "Popular",
    apiCall: (page: number) => tmdbApi.getPopular("movie", page),
  },
  {
    value: "latest",
    label: "🆕 Latest",
    apiCall: (page: number) => tmdbApi.getLatest("movie", page),
  },
  {
    value: "now_playing",
    label: "🎬 Now Playing",
    apiCall: (page: number) => tmdbApi.getNowPlaying(page),
  },
  {
    value: "top_rated",
    label: "Top Rated",
    apiCall: (page: number) => tmdbApi.getTopRated("movie", page),
  },
  {
    value: "upcoming",
    label: "Upcoming",
    apiCall: (page: number) => tmdbApi.getUpcoming(page),
  },
  {
    value: "anime",
    label: "🎌 Anime Movies",
    apiCall: (page: number) => tmdbApi.getAnimeMovies(page),
  },
  {
    value: "korean",
    label: "🇰🇷 Korean Movies",
    apiCall: (page: number) => tmdbApi.getKoreanMovies(page),
  },
  {
    value: "latest_korean",
    label: "🇰🇷 Latest Korean",
    apiCall: (page: number) => tmdbApi.getLatestKoreanMovies(page),
  },
  {
    value: "indonesian",
    label: "🇮🇩 Indonesian",
    apiCall: (page: number) => tmdbApi.getPopularIndonesian("movie", page),
  },
  {
    value: "latest_indonesian",
    label: "🇮🇩 Latest Indonesian",
    apiCall: (page: number) => tmdbApi.getRecentIndonesian("movie", page),
  },
];

export default function MoviesPage() {
  // State yang sudah disederhanakan
  const [activeTab, setActiveTab] = useState("popular");
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Logika untuk Drag-to-Scroll
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabsListRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - tabsListRef.current.offsetLeft);
    setScrollLeft(tabsListRef.current.scrollLeft);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !tabsListRef.current) return;
    e.preventDefault();
    const x = e.pageX - tabsListRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    tabsListRef.current.scrollLeft = scrollLeft - walk;
  };

  // Fungsi fetch data yang cerdas
  const fetchMoviesForTab = useCallback(
    async (tab: string, pageNum: number) => {
      const config = tabsConfig.find((t) => t.value === tab);
      if (!config) return;
      setLoading(true);
      try {
        const response = await config.apiCall(pageNum);
        const newMovies = response.results || [];
        setMovies((prevMovies) =>
          pageNum === 1 ? newMovies : [...prevMovies, ...newMovies]
        );
        setHasMore(newMovies.length > 0);
        setPage(pageNum);
      } catch (error) {
        console.error(`Error fetching movies for tab ${tab}:`, error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Fetch data saat tab aktif berubah
  useEffect(() => {
    setMovies([]);
    setPage(1);
    fetchMoviesForTab(activeTab, 1);
  }, [activeTab, fetchMoviesForTab]);

  const loadMoreMovies = () => {
    if (!loading) {
      fetchMoviesForTab(activeTab, page + 1);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          Movies
        </h1>
        <Tabs
          value={activeTab}
          onValueChange={handleTabChange}
          className="mb-8"
        >
          <TabsList
            ref={tabsListRef}
            onMouseDown={handleMouseDown}
            onMouseLeave={handleMouseLeave}
            onMouseUp={handleMouseUp}
            onMouseMove={handleMouseMove}
            className={`w-full justify-start relative overflow-x-auto bg-transparent p-0 space-x-3 h-auto 
                        [scrollbar-width:none] [&::-webkit-scrollbar]:hidden 
                        transition-cursor duration-300 ${
                          isDragging ? "cursor-grabbing" : "cursor-grab"
                        }`}
          >
            {tabsConfig.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300 hover:bg-gray-800 rounded-full px-4 py-2 transition-colors duration-200"
                onClick={(e) => {
                  if (isDragging) {
                    e.preventDefault();
                  }
                }}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mt-6">
            <MovieGrid
              movies={movies}
              loading={loading && page === 1}
              hasMore={hasMore}
              onLoadMore={loadMoreMovies}
              emptyMessage={`No movies found for this category. Try refreshing the page.`}
            />
          </div>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
