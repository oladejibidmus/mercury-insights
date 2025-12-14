import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp, 
  Play, 
  ArrowRight,
  Loader2,
  GraduationCap
} from "lucide-react";
import { format } from "date-fns";

interface EnrolledCourse {
  id: string;
  course_id: string;
  enrolled_at: string;
  course?: {
    title: string;
    thumbnail: string | null;
    instructor: string;
  };
  progress?: number;
}

interface RecentActivity {
  id: string;
  type: "enrollment" | "completion" | "certificate";
  title: string;
  date: string;
}

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    enrolledCourses: 0,
    completedCourses: 0,
    hoursLearned: 0,
    certificates: 0
  });
  const [recentCourses, setRecentCourses] = useState<EnrolledCourse[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);

    // Fetch enrollments with course details
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("id, course_id, enrolled_at, status")
      .eq("user_id", user.id)
      .order("enrolled_at", { ascending: false });

    // Fetch course details for enrollments
    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id);
      const { data: courses } = await supabase
        .from("courses")
        .select("id, title, thumbnail, instructor")
        .in("id", courseIds);

      // Fetch progress for each course
      const { data: progressData } = await supabase
        .from("course_progress")
        .select("course_id, progress_percentage")
        .eq("user_id", user.id);

      const progressMap = new Map(progressData?.map(p => [p.course_id, Number(p.progress_percentage)]) || []);
      const courseMap = new Map(courses?.map(c => [c.id, c]) || []);

      const enrichedEnrollments: EnrolledCourse[] = enrollments.slice(0, 4).map(e => ({
        ...e,
        course: courseMap.get(e.course_id),
        progress: progressMap.get(e.course_id) || 0
      }));

      setRecentCourses(enrichedEnrollments);

      // Calculate stats
      const completed = enrollments.filter(e => e.status === "completed").length;
      setStats(prev => ({
        ...prev,
        enrolledCourses: enrollments.length,
        completedCourses: completed,
        hoursLearned: enrollments.length * 8 // Estimate 8 hours per course
      }));
    }

    // Fetch certificates count
    const { count: certCount } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    setStats(prev => ({ ...prev, certificates: certCount || 0 }));

    // Build recent activity from enrollments and certificates
    const activities: RecentActivity[] = [];
    
    if (enrollments) {
      enrollments.slice(0, 3).forEach(e => {
        activities.push({
          id: e.id,
          type: "enrollment",
          title: `Enrolled in course`,
          date: e.enrolled_at
        });
      });
    }

    const { data: certs } = await supabase
      .from("certificates")
      .select("id, issued_at, course_id")
      .eq("user_id", user.id)
      .order("issued_at", { ascending: false })
      .limit(3);

    if (certs) {
      certs.forEach(c => {
        activities.push({
          id: c.id,
          type: "certificate",
          title: "Earned certificate",
          date: c.issued_at
        });
      });
    }

    // Sort by date and take top 5
    activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setRecentActivity(activities.slice(0, 5));

    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <GraduationCap className="w-16 h-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">Welcome to LearnHub</h1>
        <p className="text-muted-foreground mb-6">Sign in to access your dashboard</p>
        <Button onClick={() => navigate("/auth")}>Sign In</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isExpanded={sidebarExpanded} 
        onToggle={() => setSidebarExpanded(!sidebarExpanded)} 
      />
      
      {/* Main Content */}
      <main className={cn("transition-all duration-300", sidebarExpanded ? "ml-56" : "ml-16")}>
        {/* Header */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 animate-fade-in">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back! Here's your learning overview.</p>
          </div>
          <ThemeToggle />
        </header>

        {/* Dashboard Content */}
        <div className="p-6 max-w-7xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <BookOpen className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.enrolledCourses}</p>
                        <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-green-500/10">
                        <TrendingUp className="w-6 h-6 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.completedCourses}</p>
                        <p className="text-sm text-muted-foreground">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <Clock className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.hoursLearned}</p>
                        <p className="text-sm text-muted-foreground">Hours Learned</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-lg bg-amber-500/10">
                        <Award className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{stats.certificates}</p>
                        <p className="text-sm text-muted-foreground">Certificates</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Continue Learning */}
                <div className="lg:col-span-2">
                  <Card className="border-border/50">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle className="text-lg">Continue Learning</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => navigate("/learning-path")}>
                        View All <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      {recentCourses.length === 0 ? (
                        <div className="text-center py-8">
                          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                          <p className="text-muted-foreground">No courses yet</p>
                          <Button 
                            variant="outline" 
                            className="mt-3"
                            onClick={() => navigate("/explore-courses")}
                          >
                            Explore Courses
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {recentCourses.map((enrollment) => (
                            <div 
                              key={enrollment.id}
                              className="flex items-center gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/course/${enrollment.course_id}`)}
                            >
                              <div className="w-16 h-12 rounded-md bg-muted overflow-hidden flex-shrink-0">
                                {enrollment.course?.thumbnail ? (
                                  <img 
                                    src={enrollment.course.thumbnail} 
                                    alt="" 
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-6 h-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">
                                  {enrollment.course?.title || "Course"}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {enrollment.course?.instructor}
                                </p>
                                <div className="mt-2 flex items-center gap-2">
                                  <Progress value={enrollment.progress} className="h-1.5 flex-1" />
                                  <span className="text-xs text-muted-foreground">
                                    {enrollment.progress}%
                                  </span>
                                </div>
                              </div>
                              <Button size="icon" variant="ghost" className="flex-shrink-0">
                                <Play className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="lg:col-span-1">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentActivity.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent activity
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                                activity.type === "enrollment" && "bg-primary/10",
                                activity.type === "certificate" && "bg-amber-500/10",
                                activity.type === "completion" && "bg-green-500/10"
                              )}>
                                {activity.type === "enrollment" && <BookOpen className="w-4 h-4 text-primary" />}
                                {activity.type === "certificate" && <Award className="w-4 h-4 text-amber-500" />}
                                {activity.type === "completion" && <TrendingUp className="w-4 h-4 text-green-500" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{activity.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(activity.date), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;