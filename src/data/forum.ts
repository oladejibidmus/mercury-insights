export interface ForumReply {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
  upvotes: number;
  isMarkedAnswer?: boolean;
}

export interface ForumThread {
  id: string;
  title: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  courseTitle: string;
  topic: string;
  timestamp: string;
  replyCount: number;
  upvotes: number;
  isAnswered: boolean;
  lastActivity: string;
  replies: ForumReply[];
}

export const mockForumThreads: ForumThread[] = [
  {
    id: "1",
    title: "How to handle missing values in Pandas?",
    content: "I'm working on a dataset with many missing values. What's the best approach to handle them? Should I fill them with mean/median or drop them entirely?",
    authorName: "Alex Johnson",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop",
    courseTitle: "Data Analysis with Pandas",
    topic: "Data Cleaning",
    timestamp: "2024-01-12T10:30:00",
    replyCount: 5,
    upvotes: 12,
    isAnswered: true,
    lastActivity: "2024-01-12T15:45:00",
    replies: [
      {
        id: "1-1",
        authorName: "Sarah Chen",
        authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop",
        content: "It depends on your data! For numerical columns, filling with median is often safer than mean as it's less affected by outliers. For categorical data, you might use the mode or a separate 'Unknown' category.",
        timestamp: "2024-01-12T11:15:00",
        upvotes: 8,
        isMarkedAnswer: true,
      },
      {
        id: "1-2",
        authorName: "Mike Wilson",
        authorAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop",
        content: "You can also use `df.fillna(method='ffill')` for time-series data to forward-fill values.",
        timestamp: "2024-01-12T12:00:00",
        upvotes: 4,
      },
    ],
  },
  {
    id: "2",
    title: "Difference between LEFT JOIN and INNER JOIN?",
    content: "Can someone explain when to use LEFT JOIN vs INNER JOIN? I always get confused about which one returns what.",
    authorName: "Emma Davis",
    authorAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop",
    courseTitle: "SQL for Data Analysis",
    topic: "SQL Joins",
    timestamp: "2024-01-11T14:20:00",
    replyCount: 3,
    upvotes: 8,
    isAnswered: true,
    lastActivity: "2024-01-11T16:30:00",
    replies: [
      {
        id: "2-1",
        authorName: "Dr. Michael Roberts",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop",
        content: "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table (with NULL for non-matches).",
        timestamp: "2024-01-11T15:00:00",
        upvotes: 6,
        isMarkedAnswer: true,
      },
    ],
  },
  {
    id: "3",
    title: "Best practices for Python project structure?",
    content: "I'm starting a larger Python project and want to organize it properly. What's the recommended folder structure?",
    authorName: "James Lee",
    authorAvatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=40&h=40&fit=crop",
    courseTitle: "Python Fundamentals",
    topic: "Best Practices",
    timestamp: "2024-01-10T09:00:00",
    replyCount: 7,
    upvotes: 15,
    isAnswered: false,
    lastActivity: "2024-01-10T18:00:00",
    replies: [],
  },
  {
    id: "4",
    title: "How to merge multiple DataFrames efficiently?",
    content: "I have 5 DataFrames that share a common key. What's the most efficient way to merge them all?",
    authorName: "Lisa Park",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop",
    courseTitle: "Data Analysis with Pandas",
    topic: "Data Manipulation",
    timestamp: "2024-01-09T16:45:00",
    replyCount: 2,
    upvotes: 5,
    isAnswered: false,
    lastActivity: "2024-01-09T19:30:00",
    replies: [],
  },
];

export const forumTopics = [
  "All Topics",
  "Data Cleaning",
  "Data Manipulation",
  "SQL Joins",
  "SQL Queries",
  "Best Practices",
  "Debugging",
  "General Discussion",
];

export const forumCourses = [
  "All Courses",
  "Python Fundamentals",
  "Data Analysis with Pandas",
  "SQL for Data Analysis",
  "Machine Learning Basics",
];
