import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, TrendingUp, Users, Clock, Award, BookOpen, MessageSquare, Star } from "lucide-react";
import { toast } from "sonner";

const enrollmentData = [
  { month: "Jan", enrollments: 1200, completions: 450 },
  { month: "Feb", enrollments: 1400, completions: 520 },
  { month: "Mar", enrollments: 1100, completions: 480 },
  { month: "Apr", enrollments: 1600, completions: 610 },
  { month: "May", enrollments: 1800, completions: 720 },
  { month: "Jun", enrollments: 2100, completions: 890 },
  { month: "Jul", enrollments: 1900, completions: 810 },
  { month: "Aug", enrollments: 2300, completions: 950 },
  { month: "Sep", enrollments: 2500, completions: 1100 },
  { month: "Oct", enrollments: 2800, completions: 1250 },
  { month: "Nov", enrollments: 3100, completions: 1400 },
  { month: "Dec", enrollments: 3400, completions: 1580 },
];

const sessionData = [
  { month: "Jan", sessions: 45000, avgDuration: 32 },
  { month: "Feb", sessions: 52000, avgDuration: 35 },
  { month: "Mar", sessions: 48000, avgDuration: 33 },
  { month: "Apr", sessions: 61000, avgDuration: 38 },
  { month: "May", sessions: 72000, avgDuration: 42 },
  { month: "Jun", sessions: 85000, avgDuration: 45 },
  { month: "Jul", sessions: 78000, avgDuration: 41 },
  { month: "Aug", sessions: 92000, avgDuration: 48 },
  { month: "Sep", sessions: 105000, avgDuration: 52 },
  { month: "Oct", sessions: 118000, avgDuration: 55 },
  { month: "Nov", sessions: 132000, avgDuration: 58 },
  { month: "Dec", sessions: 145000, avgDuration: 62 },
];

const engagementByDay = [
  { day: "Monday", users: 2340 },
  { day: "Tuesday", users: 2890 },
  { day: "Wednesday", users: 3120 },
  { day: "Thursday", users: 2980 },
  { day: "Friday", users: 2450 },
  { day: "Saturday", users: 1680 },
  { day: "Sunday", users: 1420 },
];

const categoryData = [
  { name: "Python", value: 45, color: "hsl(var(--primary))" },
  { name: "SQL", value: 25, color: "#10b981" },
  { name: "Tableau", value: 18, color: "#f59e0b" },
  { name: "Power BI", value: 12, color: "#ef4444" },
];

const coursePerformance = [
  { name: "Python for Data Science", enrollments: 4523, completions: 2856, avgScore: 87, rating: 4.8, completionRate: 63 },
  { name: "SQL Bootcamp", enrollments: 3215, completions: 2184, avgScore: 82, rating: 4.7, completionRate: 68 },
  { name: "Tableau Expert", enrollments: 2890, completions: 1678, avgScore: 85, rating: 4.9, completionRate: 58 },
  { name: "Power BI Complete", enrollments: 2456, completions: 1524, avgScore: 79, rating: 4.6, completionRate: 62 },
  { name: "Advanced Python ML", enrollments: 1542, completions: 892, avgScore: 91, rating: 4.9, completionRate: 58 },
];

const topLearners = [
  { name: "Dr. Sarah Chen", courses: 8, hours: 156, avgScore: 95, streak: 45 },
  { name: "Alex Brown", courses: 6, hours: 124, avgScore: 88, streak: 32 },
  { name: "Emily Watson", courses: 5, hours: 98, avgScore: 92, streak: 28 },
  { name: "John Doe", courses: 5, hours: 86, avgScore: 85, streak: 21 },
  { name: "Jane Smith", courses: 4, hours: 72, avgScore: 89, streak: 18 },
];

const forumMetrics = {
  totalPosts: 3421,
  avgResponseTime: "2.4 hours",
  unansweredQuestions: 42,
  topContributors: [
    { name: "Dr. Sarah Chen", posts: 156, helpful: 89 },
    { name: "Alex Brown", posts: 98, helpful: 67 },
    { name: "Emily Watson", posts: 76, helpful: 52 },
  ],
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState("12m");

  const handleExport = (type: string) => {
    toast.success(`${type} report exported as CSV`);
  };

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="12m">Last 12 months</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => handleExport("Analytics")}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue="engagement">
        <TabsList className="mb-6">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="courses">Course Performance</TabsTrigger>
          <TabsTrigger value="users">User Activity</TabsTrigger>
          <TabsTrigger value="forum">Forum Analytics</TabsTrigger>
        </TabsList>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Active Users</p>
                    <p className="text-2xl font-bold">12,847</p>
                    <p className="text-xs text-emerald-500">+12% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Session Duration</p>
                    <p className="text-2xl font-bold">48 min</p>
                    <p className="text-xs text-emerald-500">+8% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Active Users</p>
                    <p className="text-2xl font-bold">2,341</p>
                    <p className="text-xs text-emerald-500">+15% from last week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Award className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Retention Rate</p>
                    <p className="text-2xl font-bold">78%</p>
                    <p className="text-xs text-emerald-500">+3% from last month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sessions Over Time */}
          <Card>
            <CardHeader>
              <CardTitle>Sessions Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sessionData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `${v / 1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line type="monotone" dataKey="sessions" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement by Day */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Day of Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={engagementByDay}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="day" className="text-xs fill-muted-foreground" />
                      <YAxis className="text-xs fill-muted-foreground" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="users" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Category Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Enrollments by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value}%`, "Share"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {categoryData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name} ({item.value}%)</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Course Performance Tab */}
        <TabsContent value="courses" className="space-y-6">
          {/* Enrollment Trends */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Enrollment Trends</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport("Course Performance")}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={enrollmentData}>
                    <defs>
                      <linearGradient id="enrollmentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="completionGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                    <YAxis className="text-xs fill-muted-foreground" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Area type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" fill="url(#enrollmentGradient)" name="Enrollments" />
                    <Area type="monotone" dataKey="completions" stroke="#10b981" fill="url(#completionGradient)" name="Completions" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Course Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>Course Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Enrollments</TableHead>
                    <TableHead>Completions</TableHead>
                    <TableHead>Completion Rate</TableHead>
                    <TableHead>Avg Quiz Score</TableHead>
                    <TableHead>Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {coursePerformance.map((course) => (
                    <TableRow key={course.name}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.enrollments.toLocaleString()}</TableCell>
                      <TableCell>{course.completions.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${course.completionRate}%` }} 
                            />
                          </div>
                          <span className="text-sm">{course.completionRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{course.avgScore}%</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          {course.rating}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Activity Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Top Learners */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Top Learners</CardTitle>
              <Button variant="outline" size="sm" onClick={() => handleExport("User Activity")}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Learner</TableHead>
                    <TableHead>Courses Completed</TableHead>
                    <TableHead>Hours Learned</TableHead>
                    <TableHead>Avg Quiz Score</TableHead>
                    <TableHead>Learning Streak</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topLearners.map((learner, index) => (
                    <TableRow key={learner.name}>
                      <TableCell>
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                          {index + 1}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{learner.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                          {learner.courses}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          {learner.hours}h
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={learner.avgScore >= 90 ? "default" : "secondary"}>
                          {learner.avgScore}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-amber-500">
                          🔥 {learner.streak} days
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forum Analytics Tab */}
        <TabsContent value="forum" className="space-y-6">
          {/* Forum KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <MessageSquare className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Posts</p>
                    <p className="text-2xl font-bold">{forumMetrics.totalPosts.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Clock className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Response Time</p>
                    <p className="text-2xl font-bold">{forumMetrics.avgResponseTime}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <TrendingUp className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unanswered Questions</p>
                    <p className="text-2xl font-bold">{forumMetrics.unansweredQuestions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle>Top Forum Contributors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forumMetrics.topContributors.map((contributor, index) => (
                  <div key={contributor.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="font-medium text-foreground">{contributor.name}</p>
                        <p className="text-sm text-muted-foreground">{contributor.posts} posts</p>
                      </div>
                    </div>
                    <Badge variant="secondary">{contributor.helpful} helpful answers</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Analytics;