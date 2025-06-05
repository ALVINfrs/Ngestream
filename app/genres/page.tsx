"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { tmdbApi, type TMDBGenre } from "@/lib/tmdb"
import Navbar from "@/components/layout/navbar"
import Footer from "@/components/layout/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Film, Tv } from "lucide-react"

export default function GenresPage() {
  const [movieGenres, setMovieGenres] = useState<TMDBGenre[]>([])
  const [tvGenres, setTvGenres] = useState<TMDBGenre[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGenres()
  }, [])

  const fetchGenres = async () => {
    setLoading(true)
    try {
      const [movieGenresData, tvGenresData] = await Promise.all([tmdbApi.getGenres("movie"), tmdbApi.getGenres("tv")])

      setMovieGenres(movieGenresData.genres || [])
      setTvGenres(tvGenresData.genres || [])
    } catch (error) {
      console.error("Error fetching genres:", error)
    } finally {
      setLoading(false)
    }
  }

  const getGenreColor = (index: number) => {
    const colors = [
      "from-red-600 to-red-800",
      "from-blue-600 to-blue-800",
      "from-green-600 to-green-800",
      "from-yellow-600 to-yellow-800",
      "from-purple-600 to-purple-800",
      "from-pink-600 to-pink-800",
      "from-indigo-600 to-indigo-800",
      "from-orange-600 to-orange-800",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8">Browse by Genre</h1>

        <Tabs defaultValue="movies" className="mb-8">
          <TabsList className="bg-gray-900 border-b border-gray-800 w-full justify-start mb-6">
            <TabsTrigger value="movies" className="data-[state=active]:bg-red-600">
              <Film className="h-4 w-4 mr-2" />
              Movies
            </TabsTrigger>
            <TabsTrigger value="tv" className="data-[state=active]:bg-red-600">
              <Tv className="h-4 w-4 mr-2" />
              TV Shows
            </TabsTrigger>
          </TabsList>

          <TabsContent value="movies" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-800 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {movieGenres.map((genre, index) => (
                  <Link key={genre.id} href={`/genres/movie/${genre.id}`}>
                    <Card
                      className={`bg-gradient-to-br ${getGenreColor(
                        index,
                      )} hover:scale-105 transition-transform duration-300 h-32 flex items-center justify-center cursor-pointer`}
                    >
                      <CardContent className="p-6 text-center">
                        <h3 className="text-xl font-bold text-white">{genre.name}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tv" className="mt-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-32 bg-gray-800 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {tvGenres.map((genre, index) => (
                  <Link key={genre.id} href={`/genres/tv/${genre.id}`}>
                    <Card
                      className={`bg-gradient-to-br ${getGenreColor(
                        index,
                      )} hover:scale-105 transition-transform duration-300 h-32 flex items-center justify-center cursor-pointer`}
                    >
                      <CardContent className="p-6 text-center">
                        <h3 className="text-xl font-bold text-white">{genre.name}</h3>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  )
}
