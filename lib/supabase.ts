import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Types
export interface Movie {
  id: string;
  tmdb_id: number;
  title: string;
  type: "movie" | "tv";
  genres: string[];
  rating: number;
  poster_url: string;
  backdrop_url: string;
  trailer_url?: string;
  overview: string;
  release_date: string;
  cast?: any[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  tier: "free" | "basic" | "premium";
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

export interface Like {
  id: string;
  user_id: string;
  movie_id: string;
  created_at: string;
}

export interface Wishlist {
  id: string;
  user_id: string;
  movie_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  user_id: string;
  movie_id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  user_profiles?: UserProfile;
}
