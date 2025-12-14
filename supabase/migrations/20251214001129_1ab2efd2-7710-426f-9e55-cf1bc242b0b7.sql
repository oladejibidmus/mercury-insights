-- Create achievements table
CREATE TABLE public.achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL DEFAULT 'trophy',
  category text NOT NULL DEFAULT 'general',
  criteria jsonb NOT NULL DEFAULT '{}',
  points integer NOT NULL DEFAULT 10,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  achievement_id uuid NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Achievements are readable by everyone
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- Admins can manage achievements
CREATE POLICY "Admins can manage achievements" ON public.achievements
  FOR ALL USING (is_admin());

-- Users can view their own achievements
CREATE POLICY "Users can view their own achievements" ON public.user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- Users can view others' achievements (for profiles)
CREATE POLICY "Anyone can view user achievements" ON public.user_achievements
  FOR SELECT USING (true);

-- System can insert achievements (via service role or triggers)
CREATE POLICY "Authenticated users can earn achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Enable realtime for forum tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_replies;

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, criteria, points) VALUES
  ('First Post', 'Created your first forum post', 'message-square', 'community', '{"type": "forum_posts", "count": 1}', 10),
  ('Helpful Answer', 'Had an answer marked as accepted', 'check-circle', 'community', '{"type": "accepted_answers", "count": 1}', 25),
  ('Course Starter', 'Enrolled in your first course', 'book-open', 'learning', '{"type": "enrollments", "count": 1}', 10),
  ('Quiz Taker', 'Completed your first quiz', 'clipboard-check', 'learning', '{"type": "quiz_attempts", "count": 1}', 15),
  ('Perfect Score', 'Scored 100% on a quiz', 'star', 'learning', '{"type": "perfect_quiz", "count": 1}', 50),
  ('Course Complete', 'Completed your first course', 'graduation-cap', 'learning', '{"type": "certificates", "count": 1}', 100),
  ('Discussion Leader', 'Created 10 forum posts', 'users', 'community', '{"type": "forum_posts", "count": 10}', 50),
  ('Knowledge Seeker', 'Enrolled in 5 courses', 'compass', 'learning', '{"type": "enrollments", "count": 5}', 75);