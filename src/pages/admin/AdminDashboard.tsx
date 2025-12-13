import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, MessageSquare, TrendingUp, DollarSign, Award } from "lucide-react";

const stats = [
  { label: "Total Users", value: "12,847", change: "+12%", icon: Users, color: "text-blue-500" },
  { label: "Active Courses", value: "156", change: "+8%", icon: BookOpen, color: "text-emerald-500" },
  { label: "Forum Posts", value: "3,421", change: "+23%", icon: MessageSquare, color: "text-purple-500" },
  { label: "Completion Rate", value: "68%", change: "+5%", icon: Award, color: "text-amber-500" },
  { label: "Revenue", value: "$124,500", change: "+18%", icon: DollarSign, color: "text-green-500" },
  { label: "Enrollments", value: "8,932", change: "+15%", icon: TrendingUp, color: "text-rose-500" },
];

const recentActivity = [
  { action: "New user registered", user: "john@example.com", time: "2 min ago" },
  { action: "Course published", user: "Dr. Sarah Chen", time: "15 min ago" },
  { action: "Forum post flagged", user: "Anonymous", time: "32 min ago" },
  { action: "Certificate issued", user: "alex@example.com", time: "1 hour ago" },
  { action: "Course updated", user: "James Rodriguez", time: "2 hours ago" },
];

const AdminDashboard = () => {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of your learning platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-emerald-500 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-3 border-b border-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.user}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
