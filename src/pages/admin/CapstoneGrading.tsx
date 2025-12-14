import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { 
  useCapstoneProjects, 
  useCreateCapstoneProject, 
  useUpdateCapstoneProject, 
  useDeleteCapstoneProject 
} from "@/hooks/useCapstoneProjects";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAdminCourses } from "@/hooks/useAdminCourses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  FileText,
  ExternalLink,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  GraduationCap,
  Plus,
  Edit,
  Trash2,
  FolderKanban,
} from "lucide-react";
import { format } from "date-fns";

interface SubmissionWithDetails {
  id: string;
  project_id: string;
  user_id: string;
  submission_link: string | null;
  notes: string | null;
  status: string;
  grade: number | null;
  feedback: string | null;
  revision_requested: boolean | null;
  submitted_at: string;
  graded_at: string | null;
  project?: {
    title: string;
    course_id: string | null;
  };
  profile?: {
    name: string | null;
    email: string | null;
    avatar_url: string | null;
  };
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  submitted: { label: "Pending Review", variant: "secondary", icon: <Clock className="w-3 h-3" /> },
  graded: { label: "Graded", variant: "default", icon: <CheckCircle className="w-3 h-3" /> },
  revision_requested: { label: "Revision Requested", variant: "destructive", icon: <AlertCircle className="w-3 h-3" /> },
};

export default function CapstoneGrading() {
  const { data: projects = [], isLoading: projectsLoading } = useCapstoneProjects();
  const { courses } = useAdminCourses();
  const createProject = useCreateCapstoneProject();
  const updateProject = useUpdateCapstoneProject();
  const deleteProject = useDeleteCapstoneProject();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [gradeForm, setGradeForm] = useState({
    grade: "",
    feedback: "",
    revisionRequested: false,
  });

  // Project management state
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<typeof projects[0] | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    instructions: "",
    course_id: "",
    due_date: "",
  });

  // Fetch all submissions (admin view)
  const { data: submissions = [], isLoading } = useQuery({
    queryKey: ["admin-capstone-submissions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capstone_submissions")
        .select("*")
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Fetch project details
      const projectIds = [...new Set(data.map((s) => s.project_id))];
      const { data: projectsData } = await supabase
        .from("capstone_projects")
        .select("id, title, course_id")
        .in("id", projectIds);

      const projectMap = new Map(projectsData?.map((p) => [p.id, p]) || []);

      // Fetch user profiles
      const userIds = [...new Set(data.map((s) => s.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, name, email, avatar_url")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return data.map((submission) => ({
        ...submission,
        project: projectMap.get(submission.project_id) || null,
        profile: profileMap.get(submission.user_id) || null,
      })) as SubmissionWithDetails[];
    },
  });

  const gradeSubmission = useMutation({
    mutationFn: async ({
      submissionId,
      grade,
      feedback,
      revisionRequested,
    }: {
      submissionId: string;
      grade: number;
      feedback: string;
      revisionRequested: boolean;
    }) => {
      const { error } = await supabase
        .from("capstone_submissions")
        .update({
          grade,
          feedback,
          revision_requested: revisionRequested,
          status: revisionRequested ? "revision_requested" : "graded",
          graded_at: new Date().toISOString(),
        })
        .eq("id", submissionId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-capstone-submissions"] });
      toast.success("Submission graded successfully!");
      setSelectedSubmission(null);
      setGradeForm({ grade: "", feedback: "", revisionRequested: false });
    },
    onError: (error) => {
      toast.error("Failed to grade submission: " + error.message);
    },
  });

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter !== "all" && s.status !== statusFilter) return false;
    if (projectFilter !== "all" && s.project_id !== projectFilter) return false;
    return true;
  });

  const openGradingDialog = (submission: SubmissionWithDetails) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade?.toString() || "",
      feedback: submission.feedback || "",
      revisionRequested: submission.revision_requested || false,
    });
  };

  const handleGrade = () => {
    if (!selectedSubmission) return;
    const grade = parseInt(gradeForm.grade);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      toast.error("Please enter a valid grade (0-100)");
      return;
    }
    gradeSubmission.mutate({
      submissionId: selectedSubmission.id,
      grade,
      feedback: gradeForm.feedback,
      revisionRequested: gradeForm.revisionRequested,
    });
  };

  // Project management handlers
  const openCreateProjectDialog = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      description: "",
      instructions: "",
      course_id: "",
      due_date: "",
    });
    setProjectDialogOpen(true);
  };

  const openEditProjectDialog = (project: typeof projects[0]) => {
    setEditingProject(project);
    setProjectForm({
      title: project.title,
      description: project.description || "",
      instructions: project.instructions || "",
      course_id: project.course_id || "",
      due_date: project.due_date ? project.due_date.split("T")[0] : "",
    });
    setProjectDialogOpen(true);
  };

  const handleSaveProject = async () => {
    if (!projectForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    const projectData = {
      title: projectForm.title,
      description: projectForm.description || undefined,
      instructions: projectForm.instructions || undefined,
      course_id: projectForm.course_id || undefined,
      due_date: projectForm.due_date ? new Date(projectForm.due_date).toISOString() : undefined,
    };

    if (editingProject) {
      await updateProject.mutateAsync({ id: editingProject.id, ...projectData });
    } else {
      await createProject.mutateAsync(projectData);
    }
    setProjectDialogOpen(false);
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject.mutateAsync(id);
    setDeleteDialogOpen(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <GraduationCap className="w-8 h-8 text-primary" />
              Capstone Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage capstone projects and grade student submissions
            </p>
          </div>
        </div>

        <Tabs defaultValue="submissions" className="space-y-6">
          <TabsList>
            <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
            <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          </TabsList>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{submissions.length}</div>
              <div className="text-sm text-muted-foreground">Total Submissions</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {submissions.filter((s) => s.status === "submitted").length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Review</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {submissions.filter((s) => s.status === "graded").length}
              </div>
              <div className="text-sm text-muted-foreground">Graded</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {submissions.filter((s) => s.status === "revision_requested").length}
              </div>
              <div className="text-sm text-muted-foreground">Revision Requested</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Pending Review</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="revision_requested">Revision Requested</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Project</Label>
                <Select value={projectFilter} onValueChange={setProjectFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Projects</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No submissions found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={submission.profile?.avatar_url || undefined} />
                            <AvatarFallback>
                              {submission.profile?.name?.[0] || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {submission.profile?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {submission.profile?.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{submission.project?.title || "Unknown Project"}</TableCell>
                      <TableCell>
                        {format(new Date(submission.submitted_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={statusConfig[submission.status]?.variant || "secondary"}
                          className="gap-1"
                        >
                          {statusConfig[submission.status]?.icon}
                          {statusConfig[submission.status]?.label || submission.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {submission.grade !== null ? (
                          <span className="font-semibold">{submission.grade}/100</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {submission.submission_link && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => window.open(submission.submission_link!, "_blank")}
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openGradingDialog(submission)}
                          >
                            {submission.status === "submitted" ? "Grade" : "Edit Grade"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex justify-end">
              <Button onClick={openCreateProjectDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderKanban className="w-5 h-5" />
                  Capstone Projects
                </CardTitle>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : projects.length === 0 ? (
                  <div className="text-center py-12">
                    <FolderKanban className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No capstone projects yet</p>
                    <Button variant="outline" className="mt-4" onClick={openCreateProjectDialog}>
                      Create First Project
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Course</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Submissions</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.map((project) => {
                        const submissionCount = submissions.filter(
                          (s) => s.project_id === project.id
                        ).length;
                        return (
                          <TableRow key={project.id}>
                            <TableCell className="font-medium">{project.title}</TableCell>
                            <TableCell>{project.course?.title || "—"}</TableCell>
                            <TableCell>
                              {project.due_date
                                ? format(new Date(project.due_date), "MMM d, yyyy")
                                : "—"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{submissionCount}</Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditProjectDialog(project)}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setDeleteDialogOpen(project.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Grading Dialog */}
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Grade Submission</DialogTitle>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={selectedSubmission.profile?.avatar_url || undefined} />
                      <AvatarFallback>
                        {selectedSubmission.profile?.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{selectedSubmission.profile?.name}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    <strong>Project:</strong> {selectedSubmission.project?.title}
                  </p>
                  {selectedSubmission.submission_link && (
                    <Button
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => window.open(selectedSubmission.submission_link!, "_blank")}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      View Submission
                    </Button>
                  )}
                  {selectedSubmission.notes && (
                    <p className="text-sm">
                      <strong>Student Notes:</strong> {selectedSubmission.notes}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Grade (0-100)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter grade..."
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Feedback</Label>
                  <Textarea
                    placeholder="Provide feedback for the student..."
                    rows={4}
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="revision"
                    checked={gradeForm.revisionRequested}
                    onCheckedChange={(checked) =>
                      setGradeForm({ ...gradeForm, revisionRequested: !!checked })
                    }
                  />
                  <Label htmlFor="revision" className="text-sm cursor-pointer">
                    Request revision from student
                  </Label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleGrade}
                    disabled={!gradeForm.grade || gradeSubmission.isPending}
                  >
                    {gradeSubmission.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Submit Grade"
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Project Create/Edit Dialog */}
        <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Create Project"}
              </DialogTitle>
              <DialogDescription>
                {editingProject
                  ? "Update the capstone project details"
                  : "Create a new capstone project for students"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Project title..."
                  value={projectForm.title}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Linked Course</Label>
                <Select
                  value={projectForm.course_id || "none"}
                  onValueChange={(value) =>
                    setProjectForm({ ...projectForm, course_id: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No course</SelectItem>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={projectForm.due_date}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, due_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of the project..."
                  rows={2}
                  value={projectForm.description}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, description: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  placeholder="Detailed instructions for students..."
                  rows={4}
                  value={projectForm.instructions}
                  onChange={(e) =>
                    setProjectForm({ ...projectForm, instructions: e.target.value })
                  }
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveProject}
                  disabled={createProject.isPending || updateProject.isPending}
                >
                  {createProject.isPending || updateProject.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingProject ? (
                    "Save Changes"
                  ) : (
                    "Create Project"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteDialogOpen}
          onOpenChange={() => setDeleteDialogOpen(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                capstone project and may affect student submissions.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteDialogOpen && handleDeleteProject(deleteDialogOpen)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleteProject.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
