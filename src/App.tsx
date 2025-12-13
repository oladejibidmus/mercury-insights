import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ExploreCourses from "./pages/ExploreCourses";
import LearningPath from "./pages/LearningPath";
import QuizAssessment from "./pages/QuizAssessment";
import CapstoneProject from "./pages/CapstoneProject";
import Certificates from "./pages/Certificates";
import CourseForum from "./pages/CourseForum";
import QA from "./pages/QA";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/explore-courses" element={<ExploreCourses />} />
            <Route path="/learning-path" element={<LearningPath />} />
            <Route path="/quiz-assessment" element={<QuizAssessment />} />
            <Route path="/capstone-project" element={<CapstoneProject />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="/course-forum" element={<CourseForum />} />
            <Route path="/qa" element={<QA />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
