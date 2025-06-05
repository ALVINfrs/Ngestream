const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

// Helper function to get date ranges for recent content
const getDateRange = (daysBack = 60) => {
  const today = new Date();
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - daysBack);

  return {
    from: pastDate.toISOString().split("T")[0],
    to: today.toISOString().split("T")[0],
  };
};

export const tmdbApi = {
  // Get trending movies
  getTrending: async (
    mediaType: "movie" | "tv" | "all" = "all",
    timeWindow: "day" | "week" = "week"
  ) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/trending/${mediaType}/${timeWindow}?api_key=${TMDB_API_KEY}`
    );
    return response.json();
  },

  // Get popular movies/tv
  getPopular: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/popular?api_key=${TMDB_API_KEY}&page=${page}`
    );
    return response.json();
  },

  // Get top rated
  getTopRated: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/top_rated?api_key=${TMDB_API_KEY}&page=${page}`
    );
    return response.json();
  },

  // Get upcoming movies
  getUpcoming: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/upcoming?api_key=${TMDB_API_KEY}&page=${page}`
    );
    return response.json();
  },

  // Get latest/recently released content
  getLatest: async (mediaType: "movie" | "tv", page = 1) => {
    const { from, to } = getDateRange(60); // Last 60 days

    const dateParam =
      mediaType === "movie"
        ? `primary_release_date.gte=${from}&primary_release_date.lte=${to}`
        : `first_air_date.gte=${from}&first_air_date.lte=${to}`;

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&${dateParam}&sort_by=popularity.desc&page=${page}`
    );
    return response.json();
  },

  // Get now playing movies (currently in theaters)
  getNowPlaying: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/now_playing?api_key=${TMDB_API_KEY}&page=${page}`
    );
    return response.json();
  },

  // Get on the air TV shows (currently airing)
  getOnTheAir: async (page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/tv/on_the_air?api_key=${TMDB_API_KEY}&page=${page}`
    );
    return response.json();
  },

  // Get by genre
  getByGenre: async (mediaType: "movie" | "tv", genreId: number, page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`
    );
    return response.json();
  },

  // Search
  search: async (query: string) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(
        query
      )}`
    );
    return response.json();
  },

  // Get movie/tv details
  getDetails: async (mediaType: "movie" | "tv", id: number) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    return response.json();
  },

  // Get genres
  getGenres: async (mediaType: "movie" | "tv") => {
    const response = await fetch(
      `${TMDB_BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}`
    );
    return response.json();
  },

  // Get Indonesian movies
  getIndonesianContent: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&page=${page}`
    );
    return response.json();
  },

  // Get popular Indonesian movies
  getPopularIndonesian: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=popularity.desc&page=${page}`
    );
    return response.json();
  },

  // Get top rated Indonesian content
  getTopRatedIndonesian: async (mediaType: "movie" | "tv", page = 1) => {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&sort_by=vote_average.desc&vote_count.gte=50&page=${page}`
    );
    return response.json();
  },

  // Get latest Indonesian content
  getLatestIndonesian: async (mediaType: "movie" | "tv", page = 1) => {
    const { from, to } = getDateRange(90); // Last 90 days for Indonesian content

    const dateParam =
      mediaType === "movie"
        ? `primary_release_date.gte=${from}&primary_release_date.lte=${to}`
        : `first_air_date.gte=${from}&first_air_date.lte=${to}`;

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&${dateParam}&sort_by=popularity.desc&page=${page}`
    );
    return response.json();
  },

  // Get recently released Indonesian content (broader date range)
  getRecentIndonesian: async (mediaType: "movie" | "tv", page = 1) => {
    const { from, to } = getDateRange(180); // Last 6 months for more results

    const dateParam =
      mediaType === "movie"
        ? `primary_release_date.gte=${from}&primary_release_date.lte=${to}`
        : `first_air_date.gte=${from}&first_air_date.lte=${to}`;

    const response = await fetch(
      `${TMDB_BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&with_original_language=id&region=ID&${dateParam}&sort_by=release_date.desc&page=${page}`
    );
    return response.json();
  },
};

// Helper functions
export const getImageUrl = (path: string, size = "w500") => {
  if (!path) return "/placeholder.svg?height=750&width=500";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path: string, size = "w1280") => {
  if (!path) return "/placeholder.svg?height=720&width=1280";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};
