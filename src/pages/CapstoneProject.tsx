import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { mockCapstoneProjects, CapstoneProject as CapstoneType } from "@/data/capstoneProjects";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FolderKanban, Calendar, CheckCircle, Clock, Send, 
  MessageSquare, ExternalLink, AlertTriangle
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
  const [selectedProject, setSelectedProject] = useState<CapstoneType | null>(null);
  const [submissionLink, setSubmissionLink] = useState("");
  const [submissionNotes, setSubmissionNotes] = useState("");

  const statusConfig = {
    "not-started": { label: "Not Started", color: "bg-muted text-muted-foreground", icon: Clock },
    "in-progress": { label: "In Progress", color: "bg-primary/10 text-primary", icon: Clock },
    submitted: { label: "Submitted", color: "bg-blue-500/10 text-blue-500", icon: Send },
    graded: { label: "Graded", color: "bg-primary/10 text-primary", icon: CheckCircle },
  };

  const handleSubmit = (project: CapstoneType) => {
    console.log("Submitting project:", project.id, { submissionLink, submissionNotes });
    setSubmissionLink("");
    setSubmissionNotes("");
  };

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Capstone Projects</h1>
        <p className="text-muted-foreground">Apply your skills with hands-on projects</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {Object.entries(statusConfig).map(([status, config]) => {
          const count = mockCapstoneProjects.filter((p) => p.status === status).length;
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
      <div className="space-y-4">
        {mockCapstoneProjects.map((project) => {
          const config = statusConfig[project.status];
          const Icon = config.icon;
          const isOverdue =
            project.status !== "graded" &&
            project.status !== "submitted" &&
            new Date(project.dueDate) < new Date();

          return (
            <Card
              key={project.id}
              className={cn(
                "transition-all hover:border-primary/50",
                project.status === "graded" && "border-primary/30"
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
                        <p className="text-sm text-muted-foreground">{project.courseTitle}</p>
                      </div>
                    </div>

                    <p className="text-sm text-foreground/80 mb-4">{project.description}</p>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Due: {new Date(project.dueDate).toLocaleDateString()}
                      </span>
                      {project.submittedAt && (
                        <span className="flex items-center gap-1">
                          <Send className="w-4 h-4" />
                          Submitted: {new Date(project.submittedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Feedback Section */}
                    {project.status === "graded" && project.feedback && (
                      <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-foreground flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" /> Instructor Feedback
                          </span>
                          <span className="text-2xl font-bold text-primary">{project.grade}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{project.feedback}</p>
                        {project.revisionRequested && (
                          <Badge variant="outline" className="mt-2">
                            Revision Requested
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {project.submissionLink && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={project.submissionLink} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" /> View Submission
                        </a>
                      </Button>
                    )}

                    {(project.status === "not-started" || project.status === "in-progress") && (
                      <Dialog>
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
                            <Button className="w-full" onClick={() => handleSubmit(project)}>
                              Submit for Review
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}

                    {project.status === "submitted" && (
                      <Badge variant="secondary" className="justify-center py-2">
                        Awaiting Review
                      </Badge>
                    )}

                    {project.revisionRequested && (
                      <Button variant="outline">
                        <Send className="w-4 h-4 mr-2" /> Resubmit
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default CapstoneProject;
