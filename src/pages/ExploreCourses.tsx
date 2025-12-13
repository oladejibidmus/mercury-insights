import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CourseFilters } from "@/components/courses/CourseFilters";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseSearch } from "@/components/courses/CourseSearch";
import { CourseSort } from "@/components/courses/CourseSort";
import { CoursePreviewModal } from "@/components/courses/CoursePreviewModal";
import { mockCourses, Course } from "@/data/courses";

const ExploreCourses = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedDuration, setSelectedDuration] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const filteredCourses = useMemo(() => {
    let courses = [...mockCourses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.instructor.toLowerCase().includes(query) ||
          c.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "All") {
      courses = courses.filter((c) => c.category === selectedCategory);
    }

    // Level filter
    if (selectedLevel !== "All") {
      courses = courses.filter((c) => c.level === selectedLevel);
    }

    // Duration filter
    if (selectedDuration !== "All") {
      const hours = courses.map((c) => parseInt(c.duration));
      if (selectedDuration === "0-20 hours") {
        courses = courses.filter((c) => parseInt(c.duration) <= 20);
      } else if (selectedDuration === "20-40 hours") {
        courses = courses.filter((c) => {
          const h = parseInt(c.duration);
          return h > 20 && h <= 40;
        });
      } else if (selectedDuration === "40+ hours") {
        courses = courses.filter((c) => parseInt(c.duration) > 40);
      }
    }

    // Rating filter
    if (selectedRating !== "All") {
      const minRating = parseFloat(selectedRating.replace("+", ""));
      courses = courses.filter((c) => c.rating >= minRating);
    }

    // Sort
    switch (sortBy) {
      case "popular":
        courses.sort((a, b) => b.enrollmentCount - a.enrollmentCount);
        break;
      case "newest":
        courses.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case "rating":
        courses.sort((a, b) => b.rating - a.rating);
        break;
      case "duration-asc":
        courses.sort((a, b) => parseInt(a.duration) - parseInt(b.duration));
        break;
      case "duration-desc":
        courses.sort((a, b) => parseInt(b.duration) - parseInt(a.duration));
        break;
    }

    return courses;
  }, [searchQuery, sortBy, selectedCategory, selectedLevel, selectedDuration, selectedRating]);

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSelectedLevel("All");
    setSelectedDuration("All");
    setSelectedRating("All");
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Explore Courses</h1>
        <p className="text-muted-foreground">Discover {mockCourses.length} courses to expand your skills</p>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <CourseSearch value={searchQuery} onChange={setSearchQuery} />
        <CourseSort value={sortBy} onChange={setSortBy} />
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Filters Sidebar */}
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

        {/* Course Grid */}
        <div className="flex-1">
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {filteredCourses.length} courses
          </div>
          
          {filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onClick={() => setSelectedCourse(course)}
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
        </div>
      </div>

      {/* Course Preview Modal */}
      <CoursePreviewModal
        course={selectedCourse}
        isOpen={!!selectedCourse}
        onClose={() => setSelectedCourse(null)}
      />
    </DashboardLayout>
  );
};

export default ExploreCourses;
