"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./movie-card";

interface MovieCarouselProps {
  title: string;
  movies: any[];
  loading?: boolean;
}

export default function MovieCarousel({
  title,
  movies,
  loading,
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of card + gap
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="min-w-[200px] aspect-[2/3] bg-gray-800 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!movies.length) {
    return null;
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll("left")}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll("right")}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="min-w-[200px]">
            <MovieCard movie={movie} />
          </div>
        ))}
      </div>
    </div>
  );
}
