import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

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

const categoryData = [
  { name: "Python", value: 45, color: "#3b82f6" },
  { name: "SQL", value: 25, color: "#10b981" },
  { name: "Tableau", value: 18, color: "#f59e0b" },
  { name: "Power BI", value: 12, color: "#ef4444" },
];

const revenueData = [
  { month: "Jan", revenue: 24500 },
  { month: "Feb", revenue: 28000 },
  { month: "Mar", revenue: 22000 },
  { month: "Apr", revenue: 32000 },
  { month: "May", revenue: 38000 },
  { month: "Jun", revenue: 42000 },
  { month: "Jul", revenue: 39000 },
  { month: "Aug", revenue: 48000 },
  { month: "Sep", revenue: 52000 },
  { month: "Oct", revenue: 58000 },
  { month: "Nov", revenue: 64000 },
  { month: "Dec", revenue: 72000 },
];

const topCourses = [
  { name: "Python for Data Science", enrollments: 4523, rating: 4.8, revenue: "$45,230" },
  { name: "SQL Bootcamp", enrollments: 3215, rating: 4.7, revenue: "$32,150" },
  { name: "Tableau Expert", enrollments: 2890, rating: 4.9, revenue: "$28,900" },
  { name: "Power BI Complete", enrollments: 2456, rating: 4.6, revenue: "$24,560" },
  { name: "Advanced Python ML", enrollments: 1542, rating: 4.9, revenue: "$23,130" },
];

const Analytics = () => {
  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Analytics</h1>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>
        <Select defaultValue="12m">
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
      </div>

      {/* Enrollment & Completion Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Enrollments & Completions</CardTitle>
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
                <Area type="monotone" dataKey="enrollments" stroke="hsl(var(--primary))" fill="url(#enrollmentGradient)" />
                <Area type="monotone" dataKey="completions" stroke="#10b981" fill="url(#completionGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs fill-muted-foreground" />
                  <YAxis className="text-xs fill-muted-foreground" tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
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
                  <span className="text-sm text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Courses */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topCourses.map((course, index) => (
              <div key={course.name} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div className="flex items-center gap-4">
                  <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-foreground">{course.name}</p>
                    <p className="text-sm text-muted-foreground">⭐ {course.rating}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-foreground">{course.revenue}</p>
                  <p className="text-sm text-muted-foreground">{course.enrollments.toLocaleString()} enrollments</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Analytics;
