export interface Certificate {
  id: string;
  courseTitle: string;
  completionDate: string;
  certificateUrl: string;
  thumbnailUrl: string;
  credentialId: string;
  instructor: string;
}

export const mockCertificates: Certificate[] = [
  {
    id: "1",
    courseTitle: "Python Fundamentals",
    completionDate: "2024-01-10",
    certificateUrl: "/certificates/python-fundamentals.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=300&fit=crop",
    credentialId: "CERT-PY-2024-001",
    instructor: "Dr. Sarah Chen",
  },
  {
    id: "2",
    courseTitle: "Excel for Business Analytics",
    completionDate: "2023-12-15",
    certificateUrl: "/certificates/excel-analytics.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=300&fit=crop",
    credentialId: "CERT-EX-2023-042",
    instructor: "Michael Roberts",
  },
  {
    id: "3",
    courseTitle: "Introduction to Data Science",
    completionDate: "2023-11-20",
    certificateUrl: "/certificates/intro-data-science.pdf",
    thumbnailUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=300&fit=crop",
    credentialId: "CERT-DS-2023-089",
    instructor: "Dr. Emily Watson",
  },
];

export interface ProgressStats {
  totalHoursLearned: number;
  coursesCompleted: number;
  coursesInProgress: number;
  averageQuizScore: number;
  currentStreak: number;
  longestStreak: number;
  totalCertificates: number;
}

export const mockProgressStats: ProgressStats = {
  totalHoursLearned: 47,
  coursesCompleted: 3,
  coursesInProgress: 2,
  averageQuizScore: 85,
  currentStreak: 7,
  longestStreak: 21,
  totalCertificates: 3,
};

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
}

export const mockAchievements: Achievement[] = [
  { id: "1", title: "First Steps", description: "Complete your first lesson", icon: "🎯", earnedAt: "2023-10-01" },
  { id: "2", title: "Quick Learner", description: "Complete 5 lessons in one day", icon: "⚡", earnedAt: "2023-10-15" },
  { id: "3", title: "Quiz Master", description: "Score 100% on any quiz", icon: "🏆", earnedAt: "2023-11-02" },
  { id: "4", title: "Dedicated", description: "Maintain a 7-day streak", icon: "🔥", earnedAt: "2024-01-08" },
  { id: "5", title: "Certificate Collector", description: "Earn 3 certificates", icon: "📜", earnedAt: "2024-01-10" },
];

export interface WeeklyProgress {
  week: string;
  hours: number;
}

export const mockWeeklyProgress: WeeklyProgress[] = [
  { week: "Week 1", hours: 5 },
  { week: "Week 2", hours: 8 },
  { week: "Week 3", hours: 6 },
  { week: "Week 4", hours: 10 },
  { week: "Week 5", hours: 7 },
  { week: "Week 6", hours: 9 },
  { week: "Week 7", hours: 4 },
  { week: "Week 8", hours: 8 },
];

export interface CategoryProgress {
  category: string;
  completed: number;
  total: number;
}

export const mockCategoryProgress: CategoryProgress[] = [
  { category: "Python", completed: 2, total: 2 },
  { category: "Data Analysis", completed: 1, total: 3 },
  { category: "SQL", completed: 0, total: 2 },
  { category: "Machine Learning", completed: 0, total: 1 },
];
