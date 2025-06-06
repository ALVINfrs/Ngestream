"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { tmdbApi, type TMDBMovie } from "@/lib/tmdb";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieGrid from "@/components/movies/movie-grid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Film, Tv } from "lucide-react";

// --- CUSTOM HOOK UNTUK LOGIKA DRAG-TO-SCROLL ---
// Hook ini bisa dipindahkan ke file sendiri agar bisa dipakai di halaman lain
const useDragToScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    setIsDragging(true);
    setStartX(e.pageX - ref.current.offsetLeft);
    setScrollLeft(ref.current.scrollLeft);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDragging || !ref.current) return;
      e.preventDefault();
      const x = e.pageX - ref.current.offsetLeft;
      const walk = (x - startX) * 2;
      ref.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

  const props = {
    ref,
    onMouseDown: handleMouseDown,
    onMouseLeave: handleMouseLeave,
    onMouseUp: handleMouseUp,
    onMouseMove: handleMouseMove,
    className: `w-full justify-start relative overflow-x-auto bg-transparent p-0 space-x-3 h-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden transition-cursor duration-300 ${
      isDragging ? "cursor-grabbing" : "cursor-grab"
    }`,
  };

  return props;
};

// --- KONFIGURASI UNTUK SUB-TAB ---
const movieTabsConfig = [
  {
    value: "popular",
    label: "Popular",
    apiCall: (page: number) => tmdbApi.getPopularIndonesian("movie", page),
  },
  {
    value: "latest",
    label: "🆕 Latest",
    apiCall: (page: number) => tmdbApi.getRecentIndonesian("movie", page),
  },
  {
    value: "top_rated",
    label: "Top Rated",
    apiCall: (page: number) => tmdbApi.getTopRatedIndonesian("movie", page),
  },
];

const tvTabsConfig = [
  {
    value: "popular",
    label: "Popular",
    apiCall: (page: number) => tmdbApi.getPopularIndonesian("tv", page),
  },
  {
    value: "latest",
    label: "🆕 Latest",
    apiCall: (page: number) => tmdbApi.getRecentIndonesian("tv", page),
  },
];

export default function IndonesianContentPage() {
  // --- STATE YANG SUDAH SANGAT EFISIEN ---
  const [mainTab, setMainTab] = useState<"movies" | "tv">("movies");
  const [subTab, setSubTab] = useState("popular");
  const [content, setContent] = useState<TMDBMovie[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Menggunakan custom hook untuk setiap TabsList
  const movieTabsProps = useDragToScroll();
  const tvTabsProps = useDragToScroll();

  const fetchContentForTabs = useCallback(
    async (currentMainTab: string, currentSubTab: string, pageNum: number) => {
      const config =
        currentMainTab === "movies" ? movieTabsConfig : tvTabsConfig;
      const subTabConfig = config.find((t) => t.value === currentSubTab);
      if (!subTabConfig) return;

      setLoading(true);
      try {
        const response = await subTabConfig.apiCall(pageNum);
        const newContent = response.results || [];
        setContent((prev) =>
          pageNum === 1 ? newContent : [...prev, ...newContent]
        );
        setHasMore(newContent.length > 0);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching content:", error);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    setContent([]);
    setPage(1);
    fetchContentForTabs(mainTab, subTab, 1);
  }, [mainTab, subTab, fetchContentForTabs]);

  const loadMoreContent = () => {
    if (!loading) {
      fetchContentForTabs(mainTab, subTab, page + 1);
    }
  };

  const handleMainTabChange = (value: "movies" | "tv") => {
    setMainTab(value);
    setSubTab("popular"); // Reset sub-tab ke 'popular' saat ganti tab utama
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
          value={mainTab}
          onValueChange={(value) =>
            handleMainTabChange(value as "movies" | "tv")
          }
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
            <Tabs value={subTab} onValueChange={setSubTab}>
              <TabsList {...movieTabsProps}>
                {movieTabsConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300 hover:bg-gray-800 rounded-full px-4 py-2 transition-colors duration-200"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </TabsContent>

          <TabsContent value="tv" className="mt-0">
            <Tabs value={subTab} onValueChange={setSubTab}>
              <TabsList {...tvTabsProps}>
                {tvTabsConfig.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="data-[state=active]:bg-red-600 data-[state=active]:text-white text-gray-300 hover:bg-gray-800 rounded-full px-4 py-2 transition-colors duration-200"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* CUKUP SATU MOVIE GRID UNTUK SEMUA KONTEN */}
        <div className="mt-6">
          <MovieGrid
            movies={content}
            loading={loading && page === 1}
            hasMore={hasMore}
            onLoadMore={loadMoreContent}
            emptyMessage={`No content found for this category.`}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
