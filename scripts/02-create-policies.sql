-- Enable Row Level Security
ALTER TABLE movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Movies policies (public read)
CREATE POLICY "Movies are viewable by everyone" ON movies FOR SELECT USING (true);
CREATE POLICY "Movies can be inserted by authenticated users" ON movies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Subscriptions policies
CREATE POLICY "Users can view own subscription" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- Wishlists policies
CREATE POLICY "Users can view own wishlist" ON wishlists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own wishlist" ON wishlists FOR ALL USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can manage own comments" ON comments FOR ALL USING (auth.uid() = user_id);

-- User profiles policies
CREATE POLICY "Profiles are viewable by everyone" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR ALL USING (auth.uid() = user_id);
