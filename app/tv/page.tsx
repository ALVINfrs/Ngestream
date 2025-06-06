"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieGrid from "@/components/movies/movie-grid";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const tabsConfig = [
  {
    value: "popular",
    label: "Popular",
    apiCall: (page: number) => tmdbApi.getPopular("tv", page),
  },
  {
    value: "latest",
    label: "🆕 Latest",
    apiCall: (page: number) => tmdbApi.getLatest("tv", page),
  },
  {
    value: "on_the_air",
    label: "📺 On The Air",
    apiCall: (page: number) => tmdbApi.getOnTheAir(page),
  },
  {
    value: "top_rated",
    label: "Top Rated",
    apiCall: (page: number) => tmdbApi.getTopRated("tv", page),
  },
  {
    value: "anime",
    label: "🎌 Popular Anime",
    apiCall: (page: number) => tmdbApi.getPopularAnime(page),
  },
  {
    value: "top_anime",
    label: "🎌 Top Anime",
    apiCall: (page: number) => tmdbApi.getTopRatedAnime(page),
  },
  {
    value: "latest_anime",
    label: "🎌 Latest Anime",
    apiCall: (page: number) => tmdbApi.getLatestAnime(page),
  },
  {
    value: "airing_anime",
    label: "🎌 Airing Anime",
    apiCall: (page: number) => tmdbApi.getCurrentlyAiringAnime(page),
  },
  {
    value: "kdrama",
    label: "🇰🇷 Popular K-Drama",
    apiCall: (page: number) => tmdbApi.getPopularKDrama(page),
  },
  {
    value: "top_kdrama",
    label: "🇰🇷 Top K-Drama",
    apiCall: (page: number) => tmdbApi.getTopRatedKDrama(page),
  },
  {
    value: "latest_kdrama",
    label: "🇰🇷 Latest K-Drama",
    apiCall: (page: number) => tmdbApi.getLatestKDrama(page),
  },
  {
    value: "airing_kdrama",
    label: "🇰🇷 Airing K-Drama",
    apiCall: (page: number) => tmdbApi.getCurrentlyAiringKDrama(page),
  },
  {
    value: "indonesian",
    label: "🇮🇩 Indonesian",
    apiCall: (page: number) => tmdbApi.getPopularIndonesian("tv", page),
  },
  {
    value: "latest_indonesian",
    label: "🇮🇩 Latest Indonesian",
    apiCall: (page: number) => tmdbApi.getRecentIndonesian("tv", page),
  },
];

export default function TVShowsPage() {
  const [activeTab, setActiveTab] = useState("popular");
  const [shows, setShows] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // --- LOGIKA BARU UNTUK DRAG-TO-SCROLL ---
  const tabsListRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!tabsListRef.current) return;
    setIsDragging(true);
    // pageX adalah posisi mouse horizontal. offsetLeft adalah jarak elemen dari kiri.
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
    e.preventDefault(); // Mencegah aksi lain saat dragging (seperti seleksi teks)
    const x = e.pageX - tabsListRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Angka 2 untuk membuat scroll lebih cepat/responsif
    tabsListRef.current.scrollLeft = scrollLeft - walk;
  };
  // --- BATAS AKHIR LOGIKA BARU ---

  const fetchShowsForTab = useCallback(async (tab: string, pageNum: number) => {
    const config = tabsConfig.find((t) => t.value === tab);
    if (!config) return;
    setLoading(true);
    try {
      const response = await config.apiCall(pageNum);
      const newShows = response.results || [];
      setShows((prevShows) =>
        pageNum === 1 ? newShows : [...prevShows, ...newShows]
      );
      setHasMore(newShows.length > 0);
      setPage(pageNum);
    } catch (error) {
      console.error(`Error fetching shows for tab ${tab}:`, error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setShows([]);
    setPage(1);
    fetchShowsForTab(activeTab, 1);
  }, [activeTab, fetchShowsForTab]);

  const loadMoreShows = () => {
    if (!loading) {
      fetchShowsForTab(activeTab, page + 1);
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
          TV Shows
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
                // Mencegah tab ter-klik saat user selesai menggeser
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
              movies={shows}
              loading={loading && page === 1}
              hasMore={hasMore}
              onLoadMore={loadMoreShows}
              emptyMessage={`No shows found for this category. Try refreshing the page.`}
            />
          </div>
        </Tabs>
      </div>
      <Footer />
    </div>
  );
}
