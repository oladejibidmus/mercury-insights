import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ThemeToggle } from "@/components/dashboard/ThemeToggle";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

const recentActivity = [
  { action: "New enrollment", details: "John Doe enrolled in Python for Data Science", time: "2 min ago", type: "enrollment" },
  { action: "Course completed", details: "Sarah Chen completed SQL Bootcamp", time: "15 min ago", type: "completion" },
  { action: "Forum post", details: "New question in Python course forum", time: "32 min ago", type: "forum" },
  { action: "User registered", details: "alex@example.com joined the platform", time: "1 hour ago", type: "registration" },
  { action: "Course updated", details: "Tableau Expert curriculum updated", time: "2 hours ago", type: "update" },
  { action: "Certificate issued", details: "Mike Johnson earned Python certificate", time: "3 hours ago", type: "certificate" },
  { action: "New enrollment", details: "Lisa Wong enrolled in Power BI Complete", time: "3 hours ago", type: "enrollment" },
  { action: "Quiz completed", details: "David Park scored 95% on Python Quiz", time: "4 hours ago", type: "completion" },
  { action: "User registered", details: "maria@example.com joined the platform", time: "5 hours ago", type: "registration" },
  { action: "Course completed", details: "Tom Harris completed Tableau Expert", time: "6 hours ago", type: "completion" },
];

const getTypeBadgeVariant = (type: string) => {
  switch (type) {
    case "enrollment":
      return "default";
    case "completion":
      return "secondary";
    case "forum":
      return "outline";
    case "registration":
      return "default";
    case "update":
      return "outline";
    case "certificate":
      return "secondary";
    default:
      return "outline";
  }
};

const AdminDashboard = () => {
  const totalUsers = 12847;
  const previousUsers = 11500;
  const percentChange = ((totalUsers - previousUsers) / previousUsers * 100).toFixed(1);
  const isPositive = totalUsers >= previousUsers;

  return (
    <AdminLayout>
      {/* Header */}
      <header className="h-16 -mt-8 -mx-8 px-8 mb-6 border-b border-border flex items-center justify-between bg-background animate-fade-in">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link to="/admin/courses">
              <BookOpen className="w-4 h-4 mr-2" />
              Create Course
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/admin/users">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Link>
          </Button>
          <ThemeToggle />
        </div>
      </header>

      {/* Dashboard Grid - Same layout as student dashboard */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats Card */}
          <div className="lg:col-span-1">
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-4xl font-bold text-foreground tracking-tight">
                    {totalUsers.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isPositive ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span>{percentChange}%</span>
                    </div>
                    <span className="text-sm text-muted-foreground">vs last month</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Courses</p>
                    <p className="text-xl font-semibold text-foreground">156</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Enrollments</p>
                    <p className="text-xl font-semibold text-foreground">1,892</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Growth Chart */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-medium">
                  <TrendingUp className="w-4 h-4" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="userGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
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
                      <Area 
                        type="monotone" 
                        dataKey="users" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        fill="url(#userGradient)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity Table */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-medium">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Activity</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentActivity.map((activity, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{activity.action}</TableCell>
                        <TableCell className="text-muted-foreground">{activity.details}</TableCell>
                        <TableCell>
                          <Badge variant={getTypeBadgeVariant(activity.type)}>
                            {activity.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-muted-foreground">{activity.time}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;