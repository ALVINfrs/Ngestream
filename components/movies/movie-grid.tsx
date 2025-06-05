"use client"

import { useState } from "react"
import MovieCard from "./movie-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

interface MovieGridProps {
  title?: string
  movies: any[]
  loading?: boolean
  hasMore?: boolean
  onLoadMore?: () => void
  emptyMessage?: string
}

export default function MovieGrid({
  title,
  movies,
  loading = false,
  hasMore = false,
  onLoadMore,
  emptyMessage = "No movies found",
}: MovieGridProps) {
  const [loadingMore, setLoadingMore] = useState(false)

  const handleLoadMore = async () => {
    if (onLoadMore) {
      setLoadingMore(true)
      await onLoadMore()
      setLoadingMore(false)
    }
  }

  if (loading) {
    return (
      <div className="mb-8">
        {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] bg-gray-800 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!movies.length) {
    return (
      <div className="mb-8">
        {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
        <div className="bg-gray-900/50 rounded-lg p-8 text-center">
          <p className="text-gray-400">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mb-8">
      {title && <h2 className="text-2xl font-bold text-white mb-6">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {movies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      {hasMore && onLoadMore && (
        <div className="mt-8 flex justify-center">
          <Button onClick={handleLoadMore} disabled={loadingMore} className="bg-gray-800 hover:bg-gray-700 text-white">
            {loadingMore ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
