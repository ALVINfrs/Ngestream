"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tmdbApi } from "@/lib/tmdb";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MovieDetail from "@/components/movies/movie-detail";
import MovieCarousel from "@/components/movies/movie-carousel";

export default function MovieDetailPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState<any>(null);
  const [trailerKey, setTrailerKey] = useState<string | undefined>();
  const [similarMovies, setSimilarMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMovieDetails();
    }
  }, [id]);

  const fetchMovieDetails = async () => {
    setLoading(true);
    try {
      const { data: movieData } = await supabase
        .from("movies")
        .select("*")
        .eq("tmdb_id", id)
        .single();

      if (movieData) {
        setMovie(movieData);

        if (movieData.trailer_url) {
          const match = movieData.trailer_url.match(
            /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/
          );
          if (match && match[1]) {
            setTrailerKey(match[1]);
          }
        }
      } else {
        const movieDetails = await tmdbApi.getDetails("movie", Number(id));
        setMovie(movieDetails);

        // Cari trailer dari TMDB
        let trailer;
        if (movieDetails.videos && movieDetails.videos.results) {
          trailer = movieDetails.videos.results.find(
            (video: any) => video.type === "Trailer" && video.site === "YouTube"
          );
          if (trailer) {
            setTrailerKey(trailer.key);
          }
        }

        // Insert ke Supabase
        await supabase.from("movies").insert({
          tmdb_id: movieDetails.id,
          title: movieDetails.title,
          type: "movie",
          genres: movieDetails.genres.map((g: any) => g.name),
          rating: movieDetails.vote_average,
          poster_url: movieDetails.poster_path,
          backdrop_url: movieDetails.backdrop_path,
          trailer_url: trailer
            ? `https://www.youtube.com/watch?v=${trailer.key}`
            : null,
          overview: movieDetails.overview,
          release_date: movieDetails.release_date,
          cast: movieDetails.credits?.cast?.slice(0, 10) || [],
        });
      }

      const similar = await tmdbApi.getByGenre("movie", Number(id));
      setSimilarMovies(similar.results || []);
    } catch (error) {
      console.error("Error fetching movie details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-white text-xl">Movie not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <MovieDetail movie={movie} trailerKey={trailerKey} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <MovieCarousel title="Similar Movies" movies={similarMovies} />
      </div>
      <Footer />
    </div>
  );
}
