"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { tmdbApi, getImageUrl } from "@/lib/tmdb";

interface FloatingPoster {
  id: number;
  poster_path: string;
  x: number;
  y: number;
  size: number;
  speed: number;
  rotation: number;
  opacity: number;
}

export default function FloatingPosterBackground() {
  const [posters, setPosters] = useState<FloatingPoster[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchPopularMovies();
  }, []);

  const fetchPopularMovies = async () => {
    try {
      const data = await tmdbApi.getPopularForBackground();
      const movies = data.results?.slice(0, 20) || [];

      const floatingPosters: FloatingPoster[] = movies.map(
        (movie: any, index: number) => ({
          id: movie.id,
          poster_path: movie.poster_path,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 60 + 40, // 40-100px
          speed: Math.random() * 20 + 10, // 10-30s animation duration
          rotation: Math.random() * 360,
          opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4 opacity
        })
      );

      setPosters(floatingPosters);
    } catch (error) {
      console.error("Error fetching background movies:", error);
    }
  };

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {posters.map((poster, index) => (
        <div
          key={poster.id}
          className="absolute animate-float"
          style={{
            left: `${poster.x}%`,
            top: `${poster.y}%`,
            animationDuration: `${poster.speed}s`,
            animationDelay: `${index * 0.5}s`,
            transform: `rotate(${poster.rotation}deg)`,
          }}
        >
          <div
            className="relative rounded-lg overflow-hidden shadow-2xl hover:scale-110 transition-transform duration-1000"
            style={{
              width: `${poster.size}px`,
              height: `${poster.size * 1.5}px`,
              opacity: poster.opacity,
            }}
          >
            <Image
              src={
                getImageUrl(poster.poster_path, "w300") || "/placeholder.svg"
              }
              alt="Movie poster"
              fill
              className="object-cover"
              sizes="100px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </div>
      ))}

      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-black/60 to-red-900/20 animate-pulse" />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-500/30 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
