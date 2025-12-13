import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useCapstoneProjects, useCapstoneSubmissions, useSubmitCapstone } from "@/hooks/useCapstoneProjects";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FolderKanban, Calendar, CheckCircle, Clock, Send, 
  MessageSquare, ExternalLink, AlertTriangle, Loader2, BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const CapstoneProject = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: projects = [], isLoading } = useCapstoneProjects();
  const { data: submissions = [] } = useCapstoneSubmissions();
  const submitCapstone = useSubmitCapstone();

  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");
  const [submitDialogOpen, setSubmitDialogOpen] = useState<string | null>(null);

  const getSubmission = (projectId: string) => {
    return submissions.find(s => s.project_id === projectId);
  };

  const getProjectStatus = (projectId: string): "not-started" | "submitted" | "graded" => {
    const submission = getSubmission(projectId);
    if (!submission) return "not-started";
    if (submission.grade !== null) return "graded";
    return "submitted";
  };

  const statusConfig = {
    "not-started": { label: "Not Started", color: "bg-muted text-muted-foreground", icon: Clock },
    submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-500", icon: Send },
    graded: { label: "Graded", color: "bg-primary/10 text-primary", icon: CheckCircle },
  };

  const handleSubmit = async (projectId: string) => {
    await submitCapstone.mutateAsync({
      projectId,
      submissionLink,
      notes: submissionNotes,
    });
    setSubmissionLink("");
    setSubmissionNotes("");
    setSubmitDialogOpen(null);
  };

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <FolderKanban className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to view projects</h2>
          <p className="text-muted-foreground mb-6">Complete capstone projects to demonstrate your skills</p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </DashboardLayout>
    );
  }

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
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Capstone Projects</h1>
        <p className="text-muted-foreground">Apply your skills with hands-on projects</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = projects.filter((p) => getProjectStatus(p.id) === status).length;
          const Icon = config.icon;
          return (
            <Card key={status}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", config.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">{count}</p>
                    <p className="text-xs text-muted-foreground">{config.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Project Cards */}
      {projects.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">No capstone projects available yet.</p>
          <p className="text-sm text-muted-foreground">Check back later for new projects.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => {
            const status = getProjectStatus(project.id);
            const submission = getSubmission(project.id);
            const config = statusConfig[status as keyof typeof statusConfig];
            const Icon = config.icon;
            const isOverdue =
              status !== "graded" &&
              status !== "submitted" &&
              project.due_date &&
              new Date(project.due_date) < new Date();

            return (
              <Card
                key={project.id}
                className={cn(
                  "transition-all hover:border-primary/50",
                  status === "graded" && "border-primary/30"
                )}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-3 mb-3">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0",
                            config.color
                          )}
                        >
                          <FolderKanban className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-foreground">{project.title}</h3>
                            <Badge className={config.color}>{config.label}</Badge>
                            {isOverdue && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertTriangle className="w-3 h-3" /> Overdue
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{project.course?.title || "General"}</p>
                        </div>
                      </div>

                      <p className="text-sm text-foreground/80 mb-4">{project.description}</p>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {project.due_date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Due: {new Date(project.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {submission?.submitted_at && (
                          <span className="flex items-center gap-1">
                            <Send className="w-4 h-4" />
                            Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>

                      {/* Feedback Section */}
                      {status === "graded" && submission?.feedback && (
                        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground flex items-center gap-2">
                              <MessageSquare className="w-4 h-4" /> Instructor Feedback
                            </span>
                            <span className="text-2xl font-bold text-primary">{submission.grade}%</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                          {submission.revision_requested && (
                            <Badge variant="outline" className="mt-2">
                              Revision Requested
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      {submission?.submission_link && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={submission.submission_link} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-2" /> View Submission
                          </a>
                        </Button>
                      )}

                      {(status === "not-started" || status === "in-progress") && (
                        <Dialog open={submitDialogOpen === project.id} onOpenChange={(open) => setSubmitDialogOpen(open ? project.id : null)}>
                          <DialogTrigger asChild>
                            <Button>
                              <Send className="w-4 h-4 mr-2" /> Submit Project
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Submit Project</DialogTitle>
                              <DialogDescription>
                                Submit your work for "{project.title}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label htmlFor="link">Project Link (GitHub, Drive, etc.)</Label>
                                <Input
                                  id="link"
                                  placeholder="https://github.com/username/project"
                                  value={submissionLink}
                                  onChange={(e) => setSubmissionLink(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Additional Notes (optional)</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="Any notes for your instructor..."
                                  value={submissionNotes}
                                  onChange={(e) => setSubmissionNotes(e.target.value)}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={() => handleSubmit(project.id)}
                                disabled={!submissionLink || submitCapstone.isPending}
                              >
                                {submitCapstone.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Submit for Review
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}

                      {status === "submitted" && (
                        <Badge variant="secondary" className="justify-center py-2">
                          Awaiting Review
                        </Badge>
                      )}

                      {submission?.revision_requested && (
                        <Dialog open={submitDialogOpen === project.id} onOpenChange={(open) => setSubmitDialogOpen(open ? project.id : null)}>
                          <DialogTrigger asChild>
                            <Button variant="outline">
                              <Send className="w-4 h-4 mr-2" /> Resubmit
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Resubmit Project</DialogTitle>
                              <DialogDescription>
                                Submit your revised work for "{project.title}"
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 pt-4">
                              <div className="space-y-2">
                                <Label htmlFor="link">Project Link</Label>
                                <Input
                                  id="link"
                                  placeholder="https://github.com/username/project"
                                  value={submissionLink}
                                  onChange={(e) => setSubmissionLink(e.target.value)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="notes">Revision Notes</Label>
                                <Textarea
                                  id="notes"
                                  placeholder="What changes did you make..."
                                  value={submissionNotes}
                                  onChange={(e) => setSubmissionNotes(e.target.value)}
                                />
                              </div>
                              <Button 
                                className="w-full" 
                                onClick={() => handleSubmit(project.id)}
                                disabled={!submissionLink || submitCapstone.isPending}
                              >
                                {submitCapstone.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Resubmit
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CapstoneProject;
