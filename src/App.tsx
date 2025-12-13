import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ExploreCourses from "./pages/ExploreCourses";
import LearningPath from "./pages/LearningPath";
import QuizAssessment from "./pages/QuizAssessment";
import CapstoneProject from "./pages/CapstoneProject";
import Certificates from "./pages/Certificates";
import CourseForum from "./pages/CourseForum";
import QA from "./pages/QA";
import Auth from "./pages/Auth";
import AdminSignup from "./pages/AdminSignup";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import CourseManagement from "./pages/admin/CourseManagement";
import ContentModeration from "./pages/admin/ContentModeration";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/explore-courses" element={<ExploreCourses />} />
              <Route path="/learning-path" element={<LearningPath />} />
              <Route path="/quiz-assessment" element={<QuizAssessment />} />
              <Route path="/capstone-project" element={<CapstoneProject />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/course-forum" element={<CourseForum />} />
              <Route path="/qa" element={<QA />} />
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/courses" element={<CourseManagement />} />
              <Route path="/admin/moderation" element={<ContentModeration />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
