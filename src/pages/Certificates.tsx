import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useCertificates, useUserProgress } from "@/hooks/useCertificates";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Download,
  Share2,
  Clock,
  BookOpen,
  Target,
  Loader2,
} from "lucide-react";

const Certificates = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: certificates = [], isLoading } = useCertificates();
  const { data: progressStats } = useUserProgress();

  const [dateFilter, setDateFilter] = useState("all");

  const filteredCertificates = certificates.filter((cert) => {
    if (dateFilter === "all") return true;
    const certDate = new Date(cert.issued_at);
    const now = new Date();
    if (dateFilter === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return certDate >= monthAgo;
    }
    if (dateFilter === "year") {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      return certDate >= yearAgo;
    }
    return true;
  });

  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <Award className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Sign in to view certificates</h2>
          <p className="text-muted-foreground mb-6">Track your achievements and download certificates</p>
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Progress & Certificates</h1>
        <p className="text-muted-foreground">Track your achievements and download certificates</p>
      </div>

      <Tabs defaultValue="certificates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="progress">Overall Progress</TabsTrigger>
        </TabsList>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-6">
          {/* Filter */}
          <div className="flex gap-2">
            {[
              { value: "all", label: "All Time" },
              { value: "year", label: "This Year" },
              { value: "month", label: "This Month" },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={dateFilter === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setDateFilter(filter.value)}
              >
                {filter.label}
              </Button>
            ))}
          </div>

          {/* Certificate Grid */}
          {filteredCertificates.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCertificates.map((cert) => (
                <Card key={cert.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                  <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                    {cert.course?.thumbnail ? (
                      <img
                        src={cert.course.thumbnail}
                        alt={cert.course?.title}
                        className="w-full h-full object-cover opacity-50"
                      />
                    ) : null}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Award className="w-16 h-16 text-primary" />
                    </div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <Badge className="bg-primary text-primary-foreground">
                        <Award className="w-3 h-3 mr-1" /> Certificate
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-foreground mb-1">{cert.course?.title || "Course"}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Completed {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Instructor: {cert.course?.instructor || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Credential ID: {cert.credential_id}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" className="flex-1">
                        <Download className="w-4 h-4 mr-1" /> Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No certificates found.</p>
              <p className="text-sm text-muted-foreground mt-2">Complete courses to earn certificates!</p>
            </div>
          )}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {progressStats?.estimatedHours || 0}h
                    </p>
                    <p className="text-xs text-muted-foreground">Total Hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {progressStats?.completedCourses || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {progressStats?.avgQuizScore || 0}%
                    </p>
                    <p className="text-xs text-muted-foreground">Avg. Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {progressStats?.totalCertificates || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Certificates</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Enrolled Courses Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" /> Learning Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-foreground">{progressStats?.totalEnrolled || 0}</p>
                  <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <p className="text-3xl font-bold text-foreground">{progressStats?.completedCourses || 0}</p>
                  <p className="text-sm text-muted-foreground">Courses Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Certificates;
