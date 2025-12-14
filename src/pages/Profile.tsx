import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, BookOpen, Clock, Award, Bell, Lock, Trophy, Upload, Loader2 } from "lucide-react";
import { AchievementsDisplay } from "@/components/achievements/AchievementsDisplay";
import { useCheckAndAwardAchievements } from "@/hooks/useAchievements";

interface ProfileData {
  name: string;
  email: string;
  avatar_url: string;
  bio: string;
}

interface LearningStats {
  coursesCompleted: number;
  hoursLearned: number;
  certificatesEarned: number;
}

interface NotificationPreferences {
  emailDigest: boolean;
  forumReplies: boolean;
  courseUpdates: boolean;
  certificates: boolean;
}

export default function Profile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    avatar_url: "",
    bio: ""
  });

  const [stats, setStats] = useState<LearningStats>({
    coursesCompleted: 0,
    hoursLearned: 0,
    certificatesEarned: 0
  });

  const [notifications, setNotifications] = useState<NotificationPreferences>({
    emailDigest: true,
    forumReplies: true,
    courseUpdates: true,
    certificates: true
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    setIsLoading(true);
    
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching profile:", error);
    } else if (data) {
      setProfile({
        name: data.name || "",
        email: data.email || user.email || "",
        avatar_url: data.avatar_url || "",
        bio: data.bio || ""
      });
      // Parse notification preferences
      if (data.notification_preferences) {
        const prefs = data.notification_preferences as unknown as NotificationPreferences;
        setNotifications({
          emailDigest: prefs.emailDigest ?? true,
          forumReplies: prefs.forumReplies ?? true,
          courseUpdates: prefs.courseUpdates ?? true,
          certificates: prefs.certificates ?? true
        });
      }
    } else {
      setProfile(prev => ({
        ...prev,
        email: user.email || ""
      }));
    }
    setIsLoading(false);
  };

  const fetchStats = async () => {
    if (!user) return;

    // Fetch all enrollments
    const { data: enrollments } = await supabase
      .from("enrollments")
      .select("course_id, status")
      .eq("user_id", user.id);

    // Fetch progress data to calculate hours
    const { data: progressData } = await supabase
      .from("course_progress")
      .select("course_id, progress_percentage")
      .eq("user_id", user.id);

    // Fetch certificates count
    const { count: certCount } = await supabase
      .from("certificates")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id);

    // Calculate completed courses (100% progress or status = completed)
    const completedIds = new Set(
      progressData?.filter(p => Number(p.progress_percentage) >= 100).map(p => p.course_id) || []
    );
    const enrollmentCompleted = enrollments?.filter(e => e.status === "completed").length || 0;
    const progressCompleted = completedIds.size;
    const completedCourses = Math.max(enrollmentCompleted, progressCompleted);

    // Calculate total hours based on progress
    const totalProgress = progressData?.reduce((acc, p) => acc + Number(p.progress_percentage), 0) || 0;
    // Assume each course is ~10 hours, calculate based on progress
    const hoursLearned = Math.round((totalProgress / 100) * 10);

    setStats({
      coursesCompleted: completedCourses,
      hoursLearned: hoursLearned || (enrollments?.length || 0) * 4, // Fallback estimate
      certificatesEarned: certCount || 0
    });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    setIsUploading(true);
    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/avatar.${fileExt}`;

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Failed to upload image");
      console.error(uploadError);
      setIsUploading(false);
      return;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    setProfile({ ...profile, avatar_url: publicUrl });
    setIsUploading(false);
    toast.success("Avatar uploaded successfully");
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: profile.name,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save profile");
      console.error(error);
    } else {
      toast.success("Profile updated successfully");
    }
    setIsSaving(false);
  };

  const handleSaveNotifications = async () => {
    if (!user) return;
    setIsSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({
        notification_preferences: notifications as unknown as Record<string, boolean>,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", user.id);

    if (error) {
      toast.error("Failed to save preferences");
      console.error(error);
    } else {
      toast.success("Notification preferences saved");
    }
    setIsSaving(false);
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsSaving(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordForm.newPassword
    });

    if (error) {
      toast.error("Failed to change password");
    } else {
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
    setIsSaving(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Profile & Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Learning Stats
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Security
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your profile details and avatar</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xl">
                      {getInitials(profile.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label>Profile Picture</Label>
                    <div className="flex gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                      >
                        {isUploading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {isUploading ? "Uploading..." : "Upload Image"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Max 5MB. JPG, PNG, or GIF.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      disabled
                      className="opacity-60"
                    />
                    <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself..."
                    value={profile.bio}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <AchievementsDisplay />
          </TabsContent>

          {/* Learning Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <BookOpen className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stats.coursesCompleted}</p>
                      <p className="text-sm text-muted-foreground">Courses Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Clock className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stats.hoursLearned}</p>
                      <p className="text-sm text-muted-foreground">Hours Learned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <Award className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-semibold">{stats.certificatesEarned}</p>
                      <p className="text-sm text-muted-foreground">Certificates Earned</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose what notifications you receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Email Digest</p>
                    <p className="text-sm text-muted-foreground">Receive weekly learning summaries</p>
                  </div>
                  <Switch
                    checked={notifications.emailDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailDigest: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Course Updates</p>
                    <p className="text-sm text-muted-foreground">Get notified about course changes</p>
                  </div>
                  <Switch
                    checked={notifications.courseUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, courseUpdates: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Forum Replies</p>
                    <p className="text-sm text-muted-foreground">Notify when someone replies to your posts</p>
                  </div>
                  <Switch
                    checked={notifications.forumReplies}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, forumReplies: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Certificate Notifications</p>
                    <p className="text-sm text-muted-foreground">Notify when you earn a certificate</p>
                  </div>
                  <Switch
                    checked={notifications.certificates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, certificates: checked })}
                  />
                </div>
                <Button onClick={handleSaveNotifications} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Preferences"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
                <Button onClick={handleChangePassword} disabled={isSaving}>
                  {isSaving ? "Updating..." : "Change Password"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
