import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Settings as SettingsIcon, Mail, Bell, Shield, Database, Upload, CheckCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Settings = () => {
  const [siteSettings, setSiteSettings] = useState({
    platformName: "LearnHub",
    description: "Your gateway to professional learning",
    contactEmail: "support@learnhub.com",
    logo: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailWelcome: true,
    emailCourseCompletion: true,
    emailPasswordReset: true,
    emailDigest: false,
    inAppNewCourse: true,
    inAppForumReply: true,
    inAppCertificate: true,
  });

  const [authSettings, setAuthSettings] = useState({
    autoConfirmEmail: true,
    allowSignup: true,
    requireEmailVerification: false,
  });

  const handleSaveSiteSettings = () => {
    toast.success("Site settings saved successfully");
  };

  const handleSaveNotifications = () => {
    toast.success("Notification settings saved successfully");
  };

  const handleSaveAuth = () => {
    toast.success("Authentication settings saved successfully");
  };

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings & Configuration</h1>
        <p className="text-muted-foreground">Manage platform settings and preferences</p>
      </div>

      <Tabs defaultValue="site">
        <TabsList className="mb-6">
          <TabsTrigger value="site" className="gap-2">
            <SettingsIcon className="w-4 h-4" />
            Site Settings
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="w-4 h-4" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="auth" className="gap-2">
            <Shield className="w-4 h-4" />
            Authentication
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-2">
            <Database className="w-4 h-4" />
            System
          </TabsTrigger>
        </TabsList>

        {/* Site Settings */}
        <TabsContent value="site">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>Configure your platform's basic information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={siteSettings.platformName}
                    onChange={(e) => setSiteSettings({ ...siteSettings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input
                    type="email"
                    value={siteSettings.contactEmail}
                    onChange={(e) => setSiteSettings({ ...siteSettings, contactEmail: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Platform Description</Label>
                <Textarea
                  value={siteSettings.description}
                  onChange={(e) => setSiteSettings({ ...siteSettings, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <Button variant="outline">Upload Logo</Button>
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveSiteSettings}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Templates */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Templates</CardTitle>
              <CardDescription>Customize automated email messages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { id: "welcome", label: "Welcome Email", description: "Sent when a new user registers" },
                { id: "course-complete", label: "Course Completion", description: "Sent when a user completes a course" },
                { id: "password-reset", label: "Password Reset", description: "Sent when a user requests password reset" },
                { id: "certificate", label: "Certificate Issued", description: "Sent when a certificate is issued" },
              ].map((template) => (
                <div key={template.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{template.label}</p>
                    <p className="text-sm text-muted-foreground">{template.description}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Template
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Configure which emails are sent to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "emailWelcome", label: "Welcome Email", description: "Send welcome email to new users" },
                  { key: "emailCourseCompletion", label: "Course Completion", description: "Notify users when they complete a course" },
                  { key: "emailPasswordReset", label: "Password Reset", description: "Send password reset emails" },
                  { key: "emailDigest", label: "Weekly Digest", description: "Send weekly learning progress summary" },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, [setting.key]: checked })
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>In-App Notifications</CardTitle>
                <CardDescription>Configure real-time notification preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "inAppNewCourse", label: "New Course Available", description: "Notify when new courses are published" },
                  { key: "inAppForumReply", label: "Forum Replies", description: "Notify when someone replies to user's post" },
                  { key: "inAppCertificate", label: "Certificate Ready", description: "Notify when certificate is ready to download" },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{setting.label}</p>
                      <p className="text-sm text-muted-foreground">{setting.description}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({ ...notificationSettings, [setting.key]: checked })
                      }
                    />
                  </div>
                ))}
                <Separator />
                <div className="flex justify-end pt-4">
                  <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Authentication Settings */}
        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Settings</CardTitle>
              <CardDescription>Configure user authentication options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Auto-Confirm Email</p>
                    <p className="text-sm text-muted-foreground">Automatically confirm user email on signup</p>
                  </div>
                  <Switch
                    checked={authSettings.autoConfirmEmail}
                    onCheckedChange={(checked) =>
                      setAuthSettings({ ...authSettings, autoConfirmEmail: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Allow New Signups</p>
                    <p className="text-sm text-muted-foreground">Allow new users to register</p>
                  </div>
                  <Switch
                    checked={authSettings.allowSignup}
                    onCheckedChange={(checked) =>
                      setAuthSettings({ ...authSettings, allowSignup: checked })
                    }
                  />
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">Require Email Verification</p>
                    <p className="text-sm text-muted-foreground">Users must verify email before accessing content</p>
                  </div>
                  <Switch
                    checked={authSettings.requireEmailVerification}
                    onCheckedChange={(checked) =>
                      setAuthSettings({ ...authSettings, requireEmailVerification: checked })
                    }
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveAuth}>Save Authentication Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Health</CardTitle>
                <CardDescription>Monitor system status and connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Database Connection", status: "connected", statusText: "Connected" },
                  { label: "Authentication Service", status: "connected", statusText: "Active" },
                  { label: "File Storage", status: "connected", statusText: "Active" },
                  { label: "Email Service", status: "connected", statusText: "Configured" },
                ].map((service) => (
                  <div key={service.label} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      {service.status === "connected" ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                      )}
                      <span className="font-medium">{service.label}</span>
                    </div>
                    <Badge variant={service.status === "connected" ? "default" : "secondary"}>
                      {service.statusText}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup & Maintenance</CardTitle>
                <CardDescription>Database backup and maintenance options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Automatic Backups</p>
                    <p className="text-sm text-muted-foreground">Daily backups at 2:00 AM UTC</p>
                  </div>
                  <Badge>Enabled</Badge>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">Last Backup</p>
                    <p className="text-sm text-muted-foreground">December 13, 2025 at 2:00 AM</p>
                  </div>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline">Create Manual Backup</Button>
                  <Button variant="outline">View Backup History</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
};

export default Settings;