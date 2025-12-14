import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, MoreVertical, Plus, Edit, Trash2, Eye, Users, Copy, Archive, Star, Loader2, BookOpen, HelpCircle } from "lucide-react";
import { useAdminCourses, Course } from "@/hooks/useAdminCourses";
import { CurriculumBuilder } from "@/components/admin/CurriculumBuilder";
import { QuizBuilder } from "@/components/admin/QuizBuilder";
import { format } from "date-fns";

const CourseManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [curriculumCourse, setCurriculumCourse] = useState<Course | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    category: "",
    level: "Beginner",
    description: "",
    thumbnail: "",
    duration: "",
    status: "draft",
  });

  const { courses, isLoading, createCourse, updateCourse, deleteCourse, duplicateCourse } = useAdminCourses();

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCourse = (courseId: string) => {
    deleteCourse.mutate(courseId);
  };

  const handleDuplicateCourse = (course: Course) => {
    duplicateCourse.mutate(course);
  };

  const handleArchiveCourse = (course: Course) => {
    updateCourse.mutate({ id: course.id, status: "archived" });
  };

  const handlePublishCourse = (course: Course) => {
    updateCourse.mutate({ id: course.id, status: "published" });
  };

  const handleSaveCourse = () => {
    if (editingCourse) {
      updateCourse.mutate({
        id: editingCourse.id,
        ...formData,
      });
    } else {
      createCourse.mutate(formData);
    }
    setIsAddDialogOpen(false);
    setEditingCourse(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      instructor: "",
      category: "",
      level: "Beginner",
      description: "",
      thumbnail: "",
      duration: "",
      status: "draft",
    });
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      level: course.level,
      description: course.description || "",
      thumbnail: course.thumbnail || "",
      duration: course.duration || "",
      status: course.status,
    });
    setIsAddDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy-MM-dd");
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Course Management</h1>
        <p className="text-muted-foreground">Manage courses and curriculum content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Courses</p>
            <p className="text-2xl font-bold">{courses.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="text-2xl font-bold text-emerald-500">{courses.filter((c) => c.status === "published").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Draft</p>
            <p className="text-2xl font-bold text-amber-500">{courses.filter((c) => c.status === "draft").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Enrollments</p>
            <p className="text-2xl font-bold">{courses.reduce((acc, c) => acc + (c.enrollment_count || 0), 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search courses by title or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingCourse(null);
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Course Title</Label>
                  <Input 
                    placeholder="Enter course title" 
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Instructor</Label>
                  <Input 
                    placeholder="Instructor name" 
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Python">Python</SelectItem>
                      <SelectItem value="SQL">SQL</SelectItem>
                      <SelectItem value="Tableau">Tableau</SelectItem>
                      <SelectItem value="Power BI">Power BI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Level</Label>
                  <Select value={formData.level} onValueChange={(v) => setFormData({ ...formData, level: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Input 
                    placeholder="e.g. 40 hours" 
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Thumbnail URL</Label>
                <Input 
                  placeholder="https://..." 
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Course description..." 
                  rows={4} 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSaveCourse}
                disabled={!formData.title || !formData.instructor || !formData.category}
              >
                {editingCourse ? "Update Course" : "Create Course"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No courses found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-16 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-16 h-10 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                            No image
                          </div>
                        )}
                        <div>
                          <p className="font-medium line-clamp-1">{course.title}</p>
                          <p className="text-sm text-muted-foreground">{course.instructor}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{course.category}</Badge>
                            <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={course.status === "published" ? "default" : course.status === "draft" ? "secondary" : "outline"}
                      >
                        {course.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        {(course.enrollment_count || 0).toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      {(course.rating || 0) > 0 ? (
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          {course.rating}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(course.updated_at)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(course)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setCurriculumCourse(course)}>
                            <BookOpen className="w-4 h-4 mr-2" />
                            Manage Content
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateCourse(course)}>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {course.status === "draft" && (
                            <DropdownMenuItem onClick={() => handlePublishCourse(course)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {course.status === "published" && (
                            <DropdownMenuItem onClick={() => handleArchiveCourse(course)}>
                              <Archive className="w-4 h-4 mr-2" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Course Content Builder Dialog (Curriculum + Quizzes) */}
      <Dialog open={!!curriculumCourse} onOpenChange={(open) => !open && setCurriculumCourse(null)}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {curriculumCourse?.title} - Course Content
            </DialogTitle>
          </DialogHeader>
          {curriculumCourse && (
            <Tabs defaultValue="curriculum" className="mt-2">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="curriculum" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Curriculum
                </TabsTrigger>
                <TabsTrigger value="quizzes" className="gap-2">
                  <HelpCircle className="w-4 h-4" />
                  Quizzes
                </TabsTrigger>
              </TabsList>
              <TabsContent value="curriculum" className="mt-4">
                <CurriculumBuilder
                  courseId={curriculumCourse.id}
                  courseTitle={curriculumCourse.title}
                />
              </TabsContent>
              <TabsContent value="quizzes" className="mt-4">
                <QuizBuilder courseId={curriculumCourse.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CourseManagement;