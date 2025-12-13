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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MoreVertical, Plus, Edit, Trash2, Eye, Users, Copy, Archive, GripVertical, Video, FileText, HelpCircle, Star } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: string;
  title: string;
  type: "video" | "reading" | "quiz";
  duration: string;
  videoUrl?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  level: string;
  status: "draft" | "published" | "archived";
  enrollmentCount: number;
  rating: number;
  lastUpdated: string;
  thumbnail: string;
  modules: Module[];
}

const mockCourses: Course[] = [
  {
    id: "1",
    title: "Python for Data Science",
    instructor: "Dr. Sarah Chen",
    category: "Python",
    level: "Intermediate",
    status: "published",
    enrollmentCount: 4523,
    rating: 4.8,
    lastUpdated: "2024-01-10",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
    modules: [
      { id: "m1", title: "Introduction to Python", description: "Getting started", lessons: [
        { id: "l1", title: "Welcome to Python", type: "video", duration: "10 min", videoUrl: "https://youtube.com/watch?v=..." },
        { id: "l2", title: "Setting up Environment", type: "reading", duration: "5 min" },
      ]},
    ],
  },
  {
    id: "2",
    title: "SQL Bootcamp",
    instructor: "James Rodriguez",
    category: "SQL",
    level: "Beginner",
    status: "published",
    enrollmentCount: 3215,
    rating: 4.7,
    lastUpdated: "2024-01-08",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
    modules: [],
  },
  {
    id: "3",
    title: "Advanced Tableau",
    instructor: "Emily Watson",
    category: "Tableau",
    level: "Advanced",
    status: "draft",
    enrollmentCount: 0,
    rating: 0,
    lastUpdated: "2024-01-12",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400",
    modules: [],
  },
];

const CourseManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState(mockCourses);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    instructor: "",
    category: "",
    level: "",
    description: "",
    thumbnail: "",
    estimatedDuration: "",
  });

  const [modules, setModules] = useState<Module[]>([]);

  const filteredCourses = courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    toast.success("Course deleted");
  };

  const handleDuplicateCourse = (courseId: string) => {
    const course = courses.find((c) => c.id === courseId);
    if (course) {
      const newCourse = {
        ...course,
        id: `${courseId}-copy-${Date.now()}`,
        title: `${course.title} (Copy)`,
        status: "draft" as const,
        enrollmentCount: 0,
      };
      setCourses((prev) => [...prev, newCourse]);
      toast.success("Course duplicated");
    }
  };

  const handleArchiveCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "archived" as const } : c))
    );
    toast.success("Course archived");
  };

  const handlePublishCourse = (courseId: string) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, status: "published" as const } : c))
    );
    toast.success("Course published");
  };

  const handleAddModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Module ${modules.length + 1}`,
      description: "",
      lessons: [],
    };
    setModules([...modules, newModule]);
  };

  const handleAddLesson = (moduleId: string) => {
    setModules((prev) =>
      prev.map((m) =>
        m.id === moduleId
          ? {
              ...m,
              lessons: [
                ...m.lessons,
                { id: `lesson-${Date.now()}`, title: "New Lesson", type: "video" as const, duration: "10 min" },
              ],
            }
          : m
      )
    );
  };

  const handleSaveCourse = () => {
    toast.success(editingCourse ? "Course updated" : "Course created");
    setIsAddDialogOpen(false);
    setEditingCourse(null);
    setFormData({ title: "", instructor: "", category: "", level: "", description: "", thumbnail: "", estimatedDuration: "" });
    setModules([]);
    setActiveTab("basic");
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      instructor: course.instructor,
      category: course.category,
      level: course.level,
      description: "",
      thumbnail: course.thumbnail,
      estimatedDuration: "",
    });
    setModules(course.modules);
    setIsAddDialogOpen(true);
  };

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
            <p className="text-2xl font-bold">{courses.reduce((acc, c) => acc + c.enrollmentCount, 0).toLocaleString()}</p>
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
            setFormData({ title: "", instructor: "", category: "", level: "", description: "", thumbnail: "", estimatedDuration: "" });
            setModules([]);
            setActiveTab("basic");
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? "Edit Course" : "Create New Course"}</DialogTitle>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
                <TabsTrigger value="capstone">Capstone</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4">
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
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="sql">SQL</SelectItem>
                        <SelectItem value="tableau">Tableau</SelectItem>
                        <SelectItem value="powerbi">Power BI</SelectItem>
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
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input 
                      placeholder="e.g. 40 hours" 
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Thumbnail URL (YouTube link for video)</Label>
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
              </TabsContent>

              <TabsContent value="curriculum" className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">Curriculum Builder</h3>
                  <Button variant="outline" size="sm" onClick={handleAddModule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Module
                  </Button>
                </div>

                {modules.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="p-8 text-center">
                      <p className="text-muted-foreground mb-4">No modules yet. Start building your curriculum.</p>
                      <Button variant="outline" onClick={handleAddModule}>
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Module
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <Accordion type="multiple" className="space-y-2">
                    {modules.map((module, index) => (
                      <AccordionItem key={module.id} value={module.id} className="border rounded-lg px-4">
                        <AccordionTrigger className="hover:no-underline">
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                            <span>Module {index + 1}: {module.title}</span>
                            <Badge variant="outline" className="ml-2">{module.lessons.length} lessons</Badge>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 pt-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Module Title</Label>
                              <Input 
                                value={module.title}
                                onChange={(e) => setModules(prev => prev.map(m => m.id === module.id ? { ...m, title: e.target.value } : m))}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input 
                                value={module.description}
                                onChange={(e) => setModules(prev => prev.map(m => m.id === module.id ? { ...m, description: e.target.value } : m))}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Label>Lessons</Label>
                              <Button variant="ghost" size="sm" onClick={() => handleAddLesson(module.id)}>
                                <Plus className="w-4 h-4 mr-1" />
                                Add Lesson
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {module.lessons.map((lesson, lIndex) => (
                                <div key={lesson.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                                  {lesson.type === "video" && <Video className="w-4 h-4 text-blue-500" />}
                                  {lesson.type === "reading" && <FileText className="w-4 h-4 text-emerald-500" />}
                                  {lesson.type === "quiz" && <HelpCircle className="w-4 h-4 text-purple-500" />}
                                  <Input 
                                    className="flex-1 h-8" 
                                    value={lesson.title}
                                    onChange={(e) => {
                                      setModules(prev => prev.map(m => m.id === module.id ? {
                                        ...m,
                                        lessons: m.lessons.map(l => l.id === lesson.id ? { ...l, title: e.target.value } : l)
                                      } : m));
                                    }}
                                  />
                                  <span className="text-sm text-muted-foreground">{lesson.duration}</span>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </TabsContent>

              <TabsContent value="quizzes" className="space-y-4">
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <HelpCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-semibold mb-2">Quiz Builder</h3>
                    <p className="text-muted-foreground mb-4">Create quizzes with multiple choice, true/false, and short answer questions.</p>
                    <Button variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Quiz
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="capstone" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Capstone Project</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Project Title</Label>
                      <Input placeholder="Enter capstone project title" />
                    </div>
                    <div className="space-y-2">
                      <Label>Instructions</Label>
                      <Textarea placeholder="Describe the capstone project requirements..." rows={4} />
                    </div>
                    <div className="space-y-2">
                      <Label>Submission Type</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select submission type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="link">Link Submission</SelectItem>
                          <SelectItem value="file">File Upload</SelectItem>
                          <SelectItem value="text">Text Submission</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSaveCourse}>
                {editingCourse ? "Update Course" : "Publish Course"}
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
              {filteredCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img src={course.thumbnail} alt={course.title} className="w-16 h-10 rounded object-cover" />
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
                      {course.enrollmentCount.toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    {course.rating > 0 ? (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                        {course.rating}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{course.lastUpdated}</TableCell>
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
                        <DropdownMenuItem onClick={() => handleDuplicateCourse(course.id)}>
                          <Copy className="w-4 h-4 mr-2" />
                          Duplicate
                        </DropdownMenuItem>
                        {course.status === "draft" && (
                          <DropdownMenuItem onClick={() => handlePublishCourse(course.id)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {course.status === "published" && (
                          <DropdownMenuItem onClick={() => handleArchiveCourse(course.id)}>
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default CourseManagement;