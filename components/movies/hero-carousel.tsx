"use client";

import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { getBackdropUrl } from "@/lib/tmdb";

interface HeroCarouselProps {
  movies: any[];
  loading?: boolean;
}

export default function HeroCarousel({ movies, loading }: HeroCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const router = useRouter();

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [movies]);

  // Auto-scroll functionality
  useEffect(() => {
    if (movies.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % movies.length);
      }, 5000); // Change slide every 5 seconds

      return () => clearInterval(interval);
    }
  }, [movies.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      if (direction === "left") {
        setCurrentIndex((prev) => (prev > 0 ? prev - 1 : movies.length - 1));
      } else {
        setCurrentIndex((prev) => (prev < movies.length - 1 ? prev + 1 : 0));
      }

      setTimeout(checkScrollButtons, 400);
    }
  };

  const goToSlide = (index: number) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * index;
      scrollRef.current.scrollTo({
        left: scrollAmount,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  const handleMoreInfo = (movie: any) => {
    const mediaType = movie.media_type || "movie";
    router.push(`/${mediaType}/${movie.id}`);
  };

  if (loading) {
    return (
      <div className="relative h-[70vh] bg-gray-800 animate-pulse">
        <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
          <div className="h-12 bg-gray-700 rounded mb-4"></div>
          <div className="h-4 bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-700 rounded mb-6 w-3/4"></div>
          <div className="flex gap-4">
            <div className="h-12 w-24 bg-gray-700 rounded"></div>
            <div className="h-12 w-32 bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!movies.length) {
    return null;
  }

  return (
    <div className="relative h-[70vh] overflow-hidden group">
      {/* Hero slides container */}
      <div
        ref={scrollRef}
        className="flex h-full overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onScroll={checkScrollButtons}
      >
        {movies.map((movie, index) => (
          <div
            key={movie.id}
            className="min-w-full h-full relative flex-shrink-0"
          >
            <Image
              src={
                getBackdropUrl(movie.backdrop_path, "original") ||
                "/placeholder.svg"
              }
              alt={movie.title || movie.name || ""}
              fill
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

            <div className="absolute bottom-0 left-0 p-8 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {movie.title || movie.name}
              </h1>
              <p className="text-lg text-gray-300 mb-6 line-clamp-3">
                {movie.overview}
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-gray-200"
                >
                  <Play className="mr-2 h-5 w-5 fill-current" />
                  Play
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-400 text-white hover:bg-gray-800"
                  onClick={() => handleMoreInfo(movie)}
                >
                  <Info className="mr-2 h-5 w-5" />
                  More Info
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      {movies.length > 1 && (
        <>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 border-gray-700 text-white hover:bg-gray-700 rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={!canScrollLeft}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/50 border-gray-700 text-white hover:bg-gray-700 rounded-full h-12 w-12 opacity-0 group-hover:opacity-100 transition-opacity"
            disabled={!canScrollRight}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots indicator */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 right-8 flex gap-2 z-10">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-white"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}

      {/* Movie info overlay */}
      <div className="absolute top-4 right-4 bg-black/70 px-3 py-2 rounded-lg text-white text-sm z-10">
        {currentIndex + 1} / {movies.length}
      </div>
    </div>
  );
}
