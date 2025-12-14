import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useCapstoneProjects, useCapstoneSubmissions } from "@/hooks/useCapstoneProjects";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  const { data: projects = [] } = useCapstoneProjects();
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [projectFilter, setProjectFilter] = useState<string>("all");
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionWithDetails | null>(null);
  const [gradeForm, setGradeForm] = useState({
    grade: "",
    feedback: "",
    revisionRequested: false,
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <GraduationCap className="w-8 h-8 text-primary" />
            Capstone Grading
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and grade student capstone project submissions
          </p>
        </div>

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
      </div>
    </AdminLayout>
  );
}
