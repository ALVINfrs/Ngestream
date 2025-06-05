"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { tmdbApi } from "@/lib/tmdb"
import { supabase } from "@/lib/supabase"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import MovieDetail from "@/components/movies/movie-detail"
import MovieCarousel from "@/components/movies/movie-carousel"

export default function TVDetailPage() {
  const { id } = useParams()
  const [show, setShow] = useState<any>(null)
  const [trailerKey, setTrailerKey] = useState<string | undefined>()
  const [similarShows, setSimilarShows] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchShowDetails()
    }
  }, [id])

  const fetchShowDetails = async () => {
    setLoading(true)
    try {
      // First check if we have the show in our database
      const { data: showData } = await supabase.from("movies").select("*").eq("tmdb_id", id).eq("type", "tv").single()

      if (showData) {
        setShow(showData)
        if (showData.trailer_url) {
          // Extract YouTube key from URL if stored
          const match = showData.trailer_url.match(
            /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/,
          )
          if (match && match[1]) {
            setTrailerKey(match[1])
          }
        }
      } else {
        // Fetch from TMDB API
        const showDetails = await tmdbApi.getDetails("tv", Number(id))
        setShow(showDetails)

        // Find trailer
        if (showDetails.videos && showDetails.videos.results) {
          const trailer = showDetails.videos.results.find(
            (video: any) => video.type === "Trailer" && video.site === "YouTube",
          )
          if (trailer) {
            setTrailerKey(trailer.key)
          }
        }

        // Store in our database for caching
        await supabase.from("movies").insert({
          tmdb_id: showDetails.id,
          title: showDetails.name,
          type: "tv",
          genres: showDetails.genres.map((g: any) => g.name),
          rating: showDetails.vote_average,
          poster_url: showDetails.poster_path,
          backdrop_url: showDetails.backdrop_path,
          trailer_url: trailerKey ? `https://www.youtube.com/watch?v=${trailerKey}` : null,
          overview: showDetails.overview,
          release_date: showDetails.first_air_date,
          cast: showDetails.credits?.cast?.slice(0, 10) || [],
        })
      }

      // Fetch similar shows
      const similar = await tmdbApi.getByGenre("tv", Number(id))
      setSimilarShows(similar.results || [])
    } catch (error) {
      console.error("Error fetching TV show details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    )
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="flex items-center justify-center h-[70vh]">
          <div className="text-white text-xl">TV Show not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <MovieDetail movie={show} trailerKey={trailerKey} />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <MovieCarousel title="Similar TV Shows" movies={similarShows} />
      </div>

      <Footer />
    </div>
  )
}
