import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseSearch } from "@/components/courses/CourseSearch";
import { CourseSort } from "@/components/courses/CourseSort";
import { CoursePreviewModal } from "@/components/courses/CoursePreviewModal";
import { useCourses, DBCourse } from "@/hooks/useCourses";
import { useCourseActions } from "@/hooks/useCourseActions";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Adapter to convert DB course to display format
const adaptCourse = (course: DBCourse) => ({
  id: course.id,
  title: course.title,
  instructor: course.instructor,
  thumbnail: course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop",
  rating: course.rating || 0,
  reviewCount: 0,
  duration: course.duration || "0 hours",
  level: (course.level as "Beginner" | "Intermediate" | "Advanced") || "Beginner",
  category: course.category,
  enrollmentCount: course.enrollment_count || 0,
  description: course.description || "",
  curriculum: [],
  instructorBio: "",
  reviews: [],
});

const ExploreCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<ReturnType<typeof adaptCourse> | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: dbCourses = [], isLoading } = useCourses();
  const {
    enrolledCourses,
    favoriteCourses,
    courseProgress,
    enrollInCourse,
    unenrollFromCourse,
    toggleFavorite,
    isEnrolled,
    isFavorite,
    getProgress,
  } = useCourseActions();

  const courses = useMemo(() => dbCourses.map(adaptCourse), [dbCourses]);

  const filteredCourses = useMemo(() => {
    let filtered = [...courses];

    // Tab filter
    if (activeTab === "enrolled") {
      filtered = filtered.filter((c) => enrolledCourses.includes(c.id));
    } else if (activeTab === "favorites") {
      filtered = filtered.filter((c) => favoriteCourses.includes(c.id));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.instructor.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== "All") {
      filtered = filtered.filter((c) => c.level === selectedLevel);
    }

    // Duration filter
    if (selectedDuration !== "All") {
      const getDurationHours = (d: string) => parseInt(d) || 0;
      if (selectedDuration === "0-20 hours") {
        filtered = filtered.filter((c) => getDurationHours(c.duration) <= 20);
      } else if (selectedDuration === "20-40 hours") {
        filtered = filtered.filter((c) => {
          const h = getDurationHours(c.duration);
          return h > 20 && h <= 40;
        });
      } else if (selectedDuration === "40+ hours") {
        filtered = filtered.filter((c) => getDurationHours(c.duration) > 40);
      }
    }

    // Rating filter
    if (selectedRating !== "All") {
      const minRating = parseFloat(selectedRating.replace("+", ""));
      filtered = filtered.filter((c) => c.rating >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "popular":
        filtered.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case "newest":
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "duration-asc":
        filtered.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
      case "duration-desc":
        filtered.sort((a, b) => parseInt(b.duration) - parseInt(a.duration));
        break;
    }

    return filtered;
  }, [courses, searchQuery, sortBy, selectedCategory, selectedLevel, selectedDuration, selectedRating, activeTab, enrolledCourses, favoriteCourses]);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedDuration("All");
    setSelectedRating("All");
  };

  const handleEnroll = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (selectedCourse) {
      setActionLoading(true);
      await enrollInCourse(selectedCourse.id);
      setActionLoading(false);
    }
  };

  const handleUnenroll = async () => {
    if (selectedCourse) {
      setActionLoading(true);
      await unenrollFromCourse(selectedCourse.id);
      setActionLoading(false);
    }
  };

  const handleToggleFavorite = async (courseId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (!user) {
      navigate("/auth");
      return;
    }
    await toggleFavorite(courseId);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
        <p className="text-muted-foreground">Discover {courses.length} courses to expand your skills</p>
      </div>

      {/* Tabs for filtering */}
      {user && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="enrolled">
              My Courses ({enrolledCourses.length})
            </TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({favoriteCourses.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <CourseSearch value={searchQuery} onChange={setSearchQuery} />
        <CourseSort value={sortBy} onChange={setSortBy} />
      </div>

      {/* Filters Row */}
      <div className="mb-6 pb-6 border-b border-border">
        <CourseFilters
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedLevel={selectedLevel}
          setSelectedLevel={setSelectedLevel}
          selectedDuration={selectedDuration}
          setSelectedDuration={setSelectedDuration}
          selectedRating={selectedRating}
          setSelectedRating={setSelectedRating}
          onClearFilters={handleClearFilters}
        />
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-muted-foreground">
        Showing {filteredCourses.length} courses
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onClick={() => setSelectedCourse(course)}
              isEnrolled={isEnrolled(course.id)}
              isFavorite={isFavorite(course.id)}
              progress={getProgress(course.id)}
              onToggleFavorite={(e) => handleToggleFavorite(course.id, e)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-lg text-muted-foreground">No courses found matching your criteria.</p>
          <button
            onClick={handleClearFilters}
            className="mt-4 text-primary hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}

      {/* Course Preview Modal */}
      <CoursePreviewModal
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
        isEnrolled={selectedCourse ? isEnrolled(selectedCourse.id) : false}
        isFavorite={selectedCourse ? isFavorite(selectedCourse.id) : false}
        progress={selectedCourse ? getProgress(selectedCourse.id) : 0}
        onEnroll={handleEnroll}
        onUnenroll={handleUnenroll}
        onToggleFavorite={selectedCourse ? () => handleToggleFavorite(selectedCourse.id) : undefined}
        isLoading={actionLoading}
      />
    </DashboardLayout>
  );
};

export default ExploreCourses;
