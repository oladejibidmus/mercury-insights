-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  time_limit INTEGER NOT NULL DEFAULT 30,
  passing_score INTEGER NOT NULL DEFAULT 70,
  total_questions INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'multiple-choice',
  options JSONB,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  code_snippet TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz attempts table for tracking user quiz results
CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  answers JSONB,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, quiz_id, completed_at)
);

-- Create capstone projects table
CREATE TABLE public.capstone_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create capstone submissions table
CREATE TABLE public.capstone_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.capstone_projects(id) ON DELETE CASCADE NOT NULL,
  submission_link TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  grade INTEGER,
  feedback TEXT,
  revision_requested BOOLEAN DEFAULT false,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  graded_at TIMESTAMP WITH TIME ZONE
);

-- Create certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  credential_id TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capstone_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capstone_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Quizzes policies (admins manage, anyone can view for published courses)
CREATE POLICY "Admins can manage quizzes" ON public.quizzes FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view quizzes for published courses" ON public.quizzes FOR SELECT 
USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = quizzes.course_id AND (courses.status = 'published' OR is_admin())));

-- Quiz questions policies
CREATE POLICY "Admins can manage quiz questions" ON public.quiz_questions FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view quiz questions" ON public.quiz_questions FOR SELECT USING (true);

-- Quiz attempts policies (users can only see/create their own)
CREATE POLICY "Users can view their own quiz attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own quiz attempts" ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Capstone projects policies
CREATE POLICY "Admins can manage capstone projects" ON public.capstone_projects FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view capstone projects for published courses" ON public.capstone_projects FOR SELECT
USING (EXISTS (SELECT 1 FROM courses WHERE courses.id = capstone_projects.course_id AND (courses.status = 'published' OR is_admin())));

-- Capstone submissions policies
CREATE POLICY "Users can view their own submissions" ON public.capstone_submissions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own submissions" ON public.capstone_submissions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own submissions" ON public.capstone_submissions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all submissions" ON public.capstone_submissions FOR SELECT USING (is_admin());
CREATE POLICY "Admins can update submissions for grading" ON public.capstone_submissions FOR UPDATE USING (is_admin());

-- Certificates policies
CREATE POLICY "Users can view their own certificates" ON public.certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage certificates" ON public.certificates FOR ALL USING (is_admin());