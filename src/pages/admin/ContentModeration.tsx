import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, XCircle, Flag, MessageSquare, Eye } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: string;
  type: "post" | "comment" | "user";
  content: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  date: string;
}

const mockReports: Report[] = [
  { id: "1", type: "post", content: "This is spam content promoting external links...", reportedBy: "john@example.com", reportedUser: "spammer123", reason: "Spam", status: "pending", date: "2024-01-15" },
  { id: "2", type: "comment", content: "Inappropriate language used in this comment...", reportedBy: "jane@example.com", reportedUser: "user456", reason: "Inappropriate", status: "pending", date: "2024-01-14" },
  { id: "3", type: "post", content: "Misleading information about the course content", reportedBy: "alex@example.com", reportedUser: "user789", reason: "Misinformation", status: "pending", date: "2024-01-13" },
  { id: "4", type: "user", content: "User profile contains offensive content", reportedBy: "admin@example.com", reportedUser: "baduser", reason: "Offensive Profile", status: "approved", date: "2024-01-12" },
  { id: "5", type: "comment", content: "Harassment towards other users", reportedBy: "victim@example.com", reportedUser: "bully123", reason: "Harassment", status: "rejected", date: "2024-01-11" },
];

const ContentModeration = () => {
  const [reports, setReports] = useState(mockReports);
  const [activeTab, setActiveTab] = useState("pending");

  const filteredReports = reports.filter((r) => {
    if (activeTab === "pending") return r.status === "pending";
    if (activeTab === "approved") return r.status === "approved";
    if (activeTab === "rejected") return r.status === "rejected";
    return true;
  });

  const handleApprove = (id: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)));
    toast.success("Report approved - Content removed");
  };

  const handleReject = (id: string) => {
    setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)));
    toast.success("Report rejected - Content kept");
  };

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Content Moderation</h1>
        <p className="text-muted-foreground">Review and manage reported content</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{reports.filter((r) => r.status === "approved").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-rose-500/10">
                <XCircle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{reports.filter((r) => r.status === "rejected").length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Flag className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending" className="gap-2">
            Pending
            {pendingCount > 0 && (
              <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No reports in this category</p>
              </CardContent>
            </Card>
          ) : (
            filteredReports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={report.type === "post" ? "default" : report.type === "comment" ? "secondary" : "outline"}>
                          {report.type}
                        </Badge>
                        <Badge variant="destructive">{report.reason}</Badge>
                        <span className="text-sm text-muted-foreground">{report.date}</span>
                      </div>

                      <p className="text-foreground mb-3 p-3 bg-muted rounded-lg">{report.content}</p>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground">
                        <span>
                          Reported by: <span className="text-foreground">{report.reportedBy}</span>
                        </span>
                        <span>
                          User: <span className="text-foreground">{report.reportedUser}</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {report.status === "pending" ? (
                        <>
                          <Button size="sm" variant="outline" className="gap-2">
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          <Button size="sm" variant="destructive" className="gap-2" onClick={() => handleApprove(report.id)}>
                            <CheckCircle className="w-4 h-4" />
                            Remove
                          </Button>
                          <Button size="sm" variant="outline" className="gap-2" onClick={() => handleReject(report.id)}>
                            <XCircle className="w-4 h-4" />
                            Keep
                          </Button>
                        </>
                      ) : (
                        <Badge variant={report.status === "approved" ? "default" : "secondary"}>
                          {report.status === "approved" ? "Removed" : "Kept"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default ContentModeration;
