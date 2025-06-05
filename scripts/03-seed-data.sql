-- Insert default subscription for new users (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  
  INSERT INTO public.subscriptions (user_id, tier)
  VALUES (new.id, 'free');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Sample movies data (you can add more)
INSERT INTO movies (tmdb_id, title, type, genres, rating, poster_url, backdrop_url, overview, release_date) VALUES
(550, 'Fight Club', 'movie', ARRAY['Drama', 'Thriller'], 8.8, '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg', '/fCayJrkfRaCRCTh8GqN30f8oyQF.jpg', 'A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.', '1999-10-15'),
(238, 'The Godfather', 'movie', ARRAY['Drama', 'Crime'], 9.2, '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', '/tmU7GeKVybMWFButWEGl2M4GeiP.jpg', 'Spanning the years 1945 to 1955, a chronicle of the fictional Italian-American Corleone crime family.', '1972-03-14'),
(1399, 'Game of Thrones', 'tv', ARRAY['Drama', 'Fantasy', 'Action'], 9.3, '/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg', '/suopoADq0k8YZr4dQXcU6pToj6s.jpg', 'Seven noble families fight for control of the mythical land of Westeros.', '2011-04-17');
