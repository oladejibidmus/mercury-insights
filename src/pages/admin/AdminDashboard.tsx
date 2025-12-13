import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, UserPlus, GraduationCap, TrendingUp, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, LineChart, Line } from "recharts";

const stats = [
  { label: "Total Courses", value: "156", icon: BookOpen, color: "text-blue-500", bgColor: "bg-blue-500/10" },
  { label: "Total Users", value: "12,847", icon: Users, color: "text-emerald-500", bgColor: "bg-emerald-500/10" },
  { label: "Active Learners Today", value: "2,341", icon: Activity, color: "text-purple-500", bgColor: "bg-purple-500/10" },
  { label: "New Enrollments (Month)", value: "1,892", icon: UserPlus, color: "text-amber-500", bgColor: "bg-amber-500/10" },
];

const userGrowthData = [
  { month: "Jan", users: 8200 },
  { month: "Feb", users: 8900 },
  { month: "Mar", users: 9400 },
  { month: "Apr", users: 10100 },
  { month: "May", users: 10800 },
  { month: "Jun", users: 11500 },
  { month: "Jul", users: 12100 },
  { month: "Aug", users: 12847 },
];

const categoryEnrollmentData = [
  { name: "Python", enrollments: 4523 },
  { name: "SQL", enrollments: 3215 },
  { name: "Tableau", enrollments: 2890 },
  { name: "Power BI", enrollments: 2456 },
];

const engagementData = [
  { day: "Mon", activeUsers: 1820, avgSession: 45 },
  { day: "Tue", activeUsers: 2100, avgSession: 52 },
  { day: "Wed", activeUsers: 2340, avgSession: 48 },
  { day: "Thu", activeUsers: 2180, avgSession: 55 },
  { day: "Fri", activeUsers: 1950, avgSession: 42 },
  { day: "Sat", activeUsers: 1420, avgSession: 38 },
  { day: "Sun", activeUsers: 1180, avgSession: 35 },
];

const popularCourses = [
  { name: "Python for Data Science", enrollments: 4523, progress: 85 },
  { name: "SQL Bootcamp", enrollments: 3215, progress: 72 },
  { name: "Tableau Expert", enrollments: 2890, progress: 68 },
  { name: "Power BI Complete", enrollments: 2456, progress: 54 },
  { name: "Advanced Python ML", enrollments: 1542, progress: 45 },
];

const recentActivity = [
  { action: "New enrollment", details: "John Doe enrolled in Python for Data Science", time: "2 min ago", type: "enrollment" },
  { action: "Course completed", details: "Sarah Chen completed SQL Bootcamp", time: "15 min ago", type: "completion" },
  { action: "Forum post", details: "New question in Python course forum", time: "32 min ago", type: "forum" },
  { action: "User registered", details: "alex@example.com joined the platform", time: "1 hour ago", type: "registration" },
  { action: "Course updated", details: "Tableau Expert curriculum updated", time: "2 hours ago", type: "update" },
  { action: "Certificate issued", details: "Mike Johnson earned Python certificate", time: "3 hours ago", type: "certificate" },
];

const COLORS = ["hsl(var(--primary))", "#10b981", "#f59e0b", "#ef4444"];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Overview of your learning platform</p>
        </div>
        <div className="flex gap-3">
          <Button asChild>
            <Link to="/admin/courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Create Course
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/admin/users">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              User Growth Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={userGrowthData}>
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
                  <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Category Enrollments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Course Enrollments by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryEnrollmentData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs fill-muted-foreground" />
                  <YAxis dataKey="name" type="category" className="text-xs fill-muted-foreground" width={80} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="enrollments" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Daily Active Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Engagement Metrics (This Week)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                  <Area type="monotone" dataKey="activeUsers" stroke="hsl(var(--primary))" fill="url(#activeGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Popular Courses */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Courses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularCourses.map((course, index) => (
                <div key={course.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-foreground">{course.name}</span>
                    <span className="text-muted-foreground">{course.enrollments.toLocaleString()} enrollments</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${course.progress}%`,
                        backgroundColor: COLORS[index % COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-start gap-4 py-3 border-b border-border last:border-0"
              >
                <div className={`w-2 h-2 mt-2 rounded-full ${
                  activity.type === "enrollment" ? "bg-emerald-500" :
                  activity.type === "completion" ? "bg-blue-500" :
                  activity.type === "forum" ? "bg-purple-500" :
                  activity.type === "registration" ? "bg-amber-500" :
                  activity.type === "certificate" ? "bg-primary" :
                  "bg-muted-foreground"
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.details}</p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;