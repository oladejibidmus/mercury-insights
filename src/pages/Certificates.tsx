import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import {
  mockCertificates,
  mockProgressStats,
  mockAchievements,
  mockWeeklyProgress,
  mockCategoryProgress,
} from "@/data/certificates";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Award,
  Download,
  Share2,
  Clock,
  BookOpen,
  Target,
  Flame,
  TrendingUp,
  Trophy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const Certificates = () => {
  const [dateFilter, setDateFilter] = useState("all");

  const filteredCertificates = mockCertificates.filter((cert) => {
    if (dateFilter === "all") return true;
    const certDate = new Date(cert.completionDate);
    const now = new Date();
    if (dateFilter === "month") {
      return certDate >= new Date(now.setMonth(now.getMonth() - 1));
    }
    if (dateFilter === "year") {
      return certDate >= new Date(now.setFullYear(now.getFullYear() - 1));
    }
    return true;
  });

  const pieData = mockCategoryProgress.map((cat) => ({
    name: cat.category,
    value: cat.completed,
    total: cat.total,
  }));

  const COLORS = ["hsl(var(--primary))", "hsl(var(--muted))", "hsl(var(--accent))", "hsl(var(--secondary))"];

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredCertificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={cert.thumbnailUrl}
                    alt={cert.courseTitle}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <Badge className="bg-primary text-primary-foreground">
                      <Award className="w-3 h-3 mr-1" /> Certificate
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-foreground mb-1">{cert.courseTitle}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Completed {new Date(cert.completionDate).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground mb-3">
                    Instructor: {cert.instructor}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    Credential ID: {cert.credentialId}
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

          {filteredCertificates.length === 0 && (
            <div className="text-center py-12">
              <Award className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No certificates found for this period.</p>
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
                      {mockProgressStats.totalHoursLearned}h
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
                      {mockProgressStats.coursesCompleted}
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
                      {mockProgressStats.averageQuizScore}%
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
                    <Flame className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-foreground">
                      {mockProgressStats.currentStreak}
                    </p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Weekly Learning Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={mockWeeklyProgress}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="hours"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Category Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> Completion by Category
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-3">
                    {mockCategoryProgress.map((cat, idx) => (
                      <div key={cat.category}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-foreground">{cat.category}</span>
                          <span className="text-muted-foreground">
                            {cat.completed}/{cat.total}
                          </span>
                        </div>
                        <Progress
                          value={(cat.completed / cat.total) * 100}
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Achievements Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {mockAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="text-center p-4 rounded-xl bg-muted/50 border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="font-medium text-foreground text-sm">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{achievement.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default Certificates;
