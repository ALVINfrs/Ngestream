"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { tmdbApi, type TMDBMovie, type TMDBGenre } from "@/lib/tmdb"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import MovieGrid from "@/components/movies/movie-grid"

export default function GenreDetailPage() {
  const { type, id } = useParams()
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [genre, setGenre] = useState<TMDBGenre | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const mediaType = type as "movie" | "tv"

  useEffect(() => {
    if (id && type) {
      fetchGenreData()
    }
  }, [id, type])

  const fetchGenreData = async () => {
    setLoading(true)
    try {
      // Fetch genre name
      const genresData = await tmdbApi.getGenres(mediaType)
      const foundGenre = genresData.genres.find((g: TMDBGenre) => g.id === Number(id))
      setGenre(foundGenre || null)

      // Fetch movies/shows by genre
      const moviesData = await tmdbApi.getByGenre(mediaType, Number(id))
      setMovies(moviesData.results || [])
    } catch (error) {
      console.error("Error fetching genre data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMoreMovies = async () => {
    const nextPage = page + 1
    try {
      const moviesData = await tmdbApi.getByGenre(mediaType, Number(id), nextPage)
      setMovies((prev) => [...prev, ...(moviesData.results || [])])
      setPage(nextPage)
    } catch (error) {
      console.error("Error loading more movies:", error)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">
          {genre?.name} {mediaType === "movie" ? "Movies" : "TV Shows"}
        </h1>

        <MovieGrid
          movies={movies}
          loading={loading}
          hasMore={movies.length >= 20}
          onLoadMore={loadMoreMovies}
          emptyMessage={`No ${mediaType === "movie" ? "movies" : "TV shows"} found for this genre`}
        />
      </div>

      <Footer />
    </div>
  )
}
