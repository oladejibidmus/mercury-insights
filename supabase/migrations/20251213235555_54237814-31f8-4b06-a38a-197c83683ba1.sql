-- Create forum_replies table
CREATE TABLE public.forum_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_answer BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.forum_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone authenticated can view replies"
ON public.forum_replies FOR SELECT
USING (true);

CREATE POLICY "Users can create their own replies"
ON public.forum_replies FOR INSERT
WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update their own replies"
ON public.forum_replies FOR UPDATE
USING (auth.uid() = author_id OR is_admin());

CREATE POLICY "Users can delete their own replies or admins"
ON public.forum_replies FOR DELETE
USING (auth.uid() = author_id OR is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_forum_replies_updated_at
BEFORE UPDATE ON public.forum_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to increment reply count on forum_posts
CREATE OR REPLACE FUNCTION public.update_forum_post_reply_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.forum_posts SET replies_count = COALESCE(replies_count, 0) + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.forum_posts SET replies_count = GREATEST(COALESCE(replies_count, 0) - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$;

-- Trigger to auto-update reply count
CREATE TRIGGER forum_replies_count_trigger
AFTER INSERT OR DELETE ON public.forum_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_forum_post_reply_count();