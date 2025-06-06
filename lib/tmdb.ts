const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p"

export interface TMDBMovie {
  id: number
  title?: string
  name?: string
  overview: string
  poster_path: string
  backdrop_path: string
  release_date?: string
  first_air_date?: string
  vote_average: number
  genre_ids: number[]
  media_type?: string
  adult?: boolean
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface ContentRating {
  certification: string
  meaning: string
  order: number
}

// Helper function to get date ranges for recent content
const getDateRange = (daysBack = 60) => {
  const today = new Date()
  const pastDate = new Date()
  pastDate.setDate(today.getDate() - daysBack)

  return {
    from: pastDate.toISOString().split("T")[0],
    to: today.toISOString().split("T")[0],
  }
}

export const tmdbApi = {
  // Get trending movies
  getTrending: async (mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week") => {
    const response = await fetch(`${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  // Get popular movies/tv
  getPopular: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(`${TMDB_BASE_URL}/${mediaType}/popular?api_key=${TMDB_API_KEY}&page=${page}`)
    return response.json()
  },

  // Get top rated
  getTopRated: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(`${TMDB_BASE_URL}/${mediaType}/top_rated?api_key=${TMDB_API_KEY}&page=${page}`)
    return response.json()
  },

  // Get upcoming movies
  getUpcoming: async (page = 1) => {
    const response = await fetch(`${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`)
    return response.json()
  },

  // Get latest/recently released content
  getLatest: async (mediaType: "movie" | "tv", page = 1) => {
    const { from, to } = getDateRange(60) // Last 60 days

    const dateParam =
      mediaType === "movie"
        ? `primary_release_date.gte=${from}&primary_release_date.lte=${to}`
        : `first_air_date.gte=${from}&first_air_date.lte=${to}`

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&${dateParam}&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get now playing movies (currently in theaters)
  getNowPlaying: async (page = 1) => {
    const response = await fetch(`${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`)
    return response.json()
  },

  // Get on the air TV shows (currently airing)
  getOnTheAir: async (page = 1) => {
    const response = await fetch(`${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`)
    return response.json()
  },

  // Get by genre
  getByGenre: async (mediaType: "movie" | "tv", genreId: number, page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`,
    )
    return response.json()
  },

  // Search
  search: async (query: string) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
    )
    return response.json()
  },

  // Get movie/tv details with content rating
  getDetails: async (mediaType: "movie" | "tv", id: number) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos,content_ratings,release_dates`,
    )
    return response.json()
  },

  // Get content rating for movie/tv
  getContentRating: async (mediaType: "movie" | "tv", id: number) => {
    const endpoint = mediaType === "movie" ? "release_dates" : "content_ratings"
    const response = await fetch(`${TMDB_BASE_URL}/${mediaType}/${id}/${endpoint}?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  // Get genres
  getGenres: async (mediaType: "movie" | "tv") => {
    const response = await fetch(`${TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}`)
    return response.json()
  },

  // Get Indonesian movies
  getIndonesianContent: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&page=${page}`,
    )
    return response.json()
  },

  // Get popular Indonesian movies
  getPopularIndonesian: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get top rated Indonesian content
  getTopRatedIndonesian: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=vote_average.desc&vote_count.gte=50&page=${page}`,
    )
    return response.json()
  },

  // Get latest Indonesian content
  getLatestIndonesian: async (mediaType: "movie" | "tv", page = 1) => {
    const { from, to } = getDateRange(90) // Last 90 days

    const dateParam =
      mediaType === "movie"
        ? `primary_release_date.gte=${from}&primary_release_date.lte=${to}`
        : `first_air_date.gte=${from}&first_air_date.lte=${to}`

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&${dateParam}&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get recently released Indonesian content (broader date range)
  getRecentIndonesian: async (mediaType: "movie" | "tv", page = 1) => {
    const { from, to } = getDateRange(180) // Last 6 months for more results

    const dateParam =
      mediaType === "movie"
        ? `primary_release_date.gte=${from}&primary_release_date.lte=${to}`
        : `first_air_date.gte=${from}&first_air_date.lte=${to}`

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&${dateParam}&sort_by=release_date.desc&page=${page}`,
    )
    return response.json()
  },

  // ===== ANIME FUNCTIONS =====

  // Get popular anime (Japanese animation)
  getPopularAnime: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=JP&with_genres=16&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get top rated anime
  getTopRatedAnime: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=JP&with_genres=16&sort_by=vote_average.desc&vote_count.gte=100&page=${page}`,
    )
    return response.json()
  },

  // Get latest anime
  getLatestAnime: async (page = 1) => {
    const { from, to } = getDateRange(90) // Last 90 days

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=JP&with_genres=16&first_air_date.gte=${from}&first_air_date.lte=${to}&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get currently airing anime
  getCurrentlyAiringAnime: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=JP&with_genres=16&air_date.gte=${new Date().toISOString().split("T")[0]}&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get anime movies
  getAnimeMovies: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=JP&with_genres=16&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // ===== KOREAN DRAMA FUNCTIONS =====

  // Get popular Korean dramas
  getPopularKDrama: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=KR&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get top rated Korean dramas
  getTopRatedKDrama: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=KR&sort_by=vote_average.desc&vote_count.gte=50&page=${page}`,
    )
    return response.json()
  },

  // Get latest Korean dramas
  getLatestKDrama: async (page = 1) => {
    const { from, to } = getDateRange(90) // Last 90 days

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=KR&first_air_date.gte=${from}&first_air_date.lte=${to}&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get currently airing Korean dramas
  getCurrentlyAiringKDrama: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${TMDB_API_KEY}&with_origin_country=KR&air_date.gte=${new Date().toISOString().split("T")[0]}&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get Korean movies
  getKoreanMovies: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=KR&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get latest Korean movies
  getLatestKoreanMovies: async (page = 1) => {
    const { from, to } = getDateRange(90) // Last 90 days

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_origin_country=KR&primary_release_date.gte=${from}&primary_release_date.lte=${to}&sort_by=popularity.desc&page=${page}`,
    )
    return response.json()
  },

  // Get popular movies for background posters
  getPopularForBackground: async () => {
    const response = await fetch(`${TMDB_BASE_URL}/movie/popular?api_key=${TMDB_API_KEY}&page=1`)
    return response.json()
  },
}

// Helper functions
export const getImageUrl = (path: string, size = "w500") => {
  if (!path) return "/placeholder.svg?height=750&width=500"
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

export const getBackdropUrl = (path: string, size = "w1280") => {
  if (!path) return "/placeholder.svg?height=720&width=1280"
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`
}

// Get content rating/age rating
export const getContentRating = (movie: any, mediaType: "movie" | "tv" = "movie") => {
  if (!movie) return "NR"

  // Handle adult content
  if (movie.adult) return "18+"

  // For movies, check release_dates
  if (mediaType === "movie" && movie.release_dates?.results) {
    // Look for US rating first
    const usRating = movie.release_dates.results.find((country: any) => country.iso_3166_1 === "US")
    if (usRating?.release_dates?.[0]?.certification) {
      return usRating.release_dates[0].certification || "NR"
    }

    // Fallback to any available rating
    for (const country of movie.release_dates.results) {
      if (country.release_dates?.[0]?.certification) {
        return country.release_dates[0].certification
      }
    }
  }

  // For TV shows, check content_ratings
  if (mediaType === "tv" && movie.content_ratings?.results) {
    // Look for US rating first
    const usRating = movie.content_ratings.results.find((country: any) => country.iso_3166_1 === "US")
    if (usRating?.rating) {
      return usRating.rating
    }

    // Fallback to any available rating
    for (const country of movie.content_ratings.results) {
      if (country.rating) {
        return country.rating
      }
    }
  }

  // Fallback based on vote_average for estimation
  if (movie.vote_average) {
    if (movie.vote_average >= 8.5) return "PG"
    if (movie.vote_average >= 7.0) return "PG-13"
    if (movie.vote_average >= 6.0) return "R"
  }

  return "NR" // Not Rated
}

// Get rating color based on certification
export const getRatingColor = (rating: string) => {
  switch (rating) {
    case "G":
      return "bg-green-600"
    case "PG":
      return "bg-blue-600"
    case "PG-13":
      return "bg-yellow-600"
    case "R":
    case "NC-17":
    case "18+":
      return "bg-red-600"
    case "TV-Y":
    case "TV-Y7":
      return "bg-green-600"
    case "TV-G":
      return "bg-blue-600"
    case "TV-PG":
      return "bg-yellow-600"
    case "TV-14":
      return "bg-orange-600"
    case "TV-MA":
      return "bg-red-600"
    default:
      return "bg-gray-600"
  }
}
