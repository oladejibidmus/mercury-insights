export interface LearningModule {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  lessons: {
    id: string;
    title: string;
    type: "video" | "quiz" | "reading";
    duration: string;
    completed: boolean;
  }[];
}

export interface LearningCourse {
  id: string;
  title: string;
  progress: number;
  status: "not-started" | "in-progress" | "completed";
  modules: LearningModule[];
  isCurrentPosition?: boolean;
}

export const mockLearningPath: LearningCourse[] = [
  {
    id: "1",
    title: "Python Fundamentals",
    progress: 100,
    status: "completed",
    modules: [
      {
        id: "1-1",
        title: "Introduction to Python",
        duration: "2h 30m",
        completed: true,
        lessons: [
          { id: "1-1-1", title: "What is Python?", type: "video", duration: "15m", completed: true },
          { id: "1-1-2", title: "Setting Up Environment", type: "video", duration: "20m", completed: true },
          { id: "1-1-3", title: "Your First Script", type: "video", duration: "25m", completed: true },
          { id: "1-1-4", title: "Module Quiz", type: "quiz", duration: "15m", completed: true },
        ],
      },
      {
        id: "1-2",
        title: "Variables and Data Types",
        duration: "3h",
        completed: true,
        lessons: [
          { id: "1-2-1", title: "Understanding Variables", type: "video", duration: "30m", completed: true },
          { id: "1-2-2", title: "Strings and Numbers", type: "video", duration: "35m", completed: true },
          { id: "1-2-3", title: "Lists and Dictionaries", type: "video", duration: "40m", completed: true },
          { id: "1-2-4", title: "Practice Exercises", type: "reading", duration: "30m", completed: true },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "Data Analysis with Pandas",
    progress: 65,
    status: "in-progress",
    isCurrentPosition: true,
    modules: [
      {
        id: "2-1",
        title: "Introduction to Pandas",
        duration: "2h",
        completed: true,
        lessons: [
          { id: "2-1-1", title: "What is Pandas?", type: "video", duration: "20m", completed: true },
          { id: "2-1-2", title: "DataFrames Basics", type: "video", duration: "30m", completed: true },
          { id: "2-1-3", title: "Reading Data Files", type: "video", duration: "25m", completed: true },
        ],
      },
      {
        id: "2-2",
        title: "Data Manipulation",
        duration: "3h 30m",
        completed: false,
        lessons: [
          { id: "2-2-1", title: "Filtering Data", type: "video", duration: "35m", completed: true },
          { id: "2-2-2", title: "Grouping and Aggregation", type: "video", duration: "40m", completed: false },
          { id: "2-2-3", title: "Merging DataFrames", type: "video", duration: "45m", completed: false },
          { id: "2-2-4", title: "Module Assessment", type: "quiz", duration: "20m", completed: false },
        ],
      },
      {
        id: "2-3",
        title: "Data Visualization",
        duration: "2h 45m",
        completed: false,
        lessons: [
          { id: "2-3-1", title: "Matplotlib Basics", type: "video", duration: "35m", completed: false },
          { id: "2-3-2", title: "Creating Charts", type: "video", duration: "40m", completed: false },
          { id: "2-3-3", title: "Customizing Plots", type: "video", duration: "30m", completed: false },
        ],
      },
    ],
  },
  {
    id: "3",
    title: "SQL for Data Analysis",
    progress: 0,
    status: "not-started",
    modules: [
      {
        id: "3-1",
        title: "SQL Fundamentals",
        duration: "4h",
        completed: false,
        lessons: [
          { id: "3-1-1", title: "Introduction to SQL", type: "video", duration: "25m", completed: false },
          { id: "3-1-2", title: "SELECT Statements", type: "video", duration: "35m", completed: false },
          { id: "3-1-3", title: "Filtering with WHERE", type: "video", duration: "30m", completed: false },
          { id: "3-1-4", title: "Practice Problems", type: "reading", duration: "45m", completed: false },
        ],
      },
      {
        id: "3-2",
        title: "Advanced Queries",
        duration: "5h",
        completed: false,
        lessons: [
          { id: "3-2-1", title: "JOINs Explained", type: "video", duration: "45m", completed: false },
          { id: "3-2-2", title: "Subqueries", type: "video", duration: "40m", completed: false },
          { id: "3-2-3", title: "Window Functions", type: "video", duration: "50m", completed: false },
        ],
      },
    ],
  },
  {
    id: "4",
    title: "Machine Learning Basics",
    progress: 0,
    status: "not-started",
    modules: [
      {
        id: "4-1",
        title: "ML Foundations",
        duration: "3h",
        completed: false,
        lessons: [
          { id: "4-1-1", title: "What is Machine Learning?", type: "video", duration: "30m", completed: false },
          { id: "4-1-2", title: "Types of ML", type: "video", duration: "35m", completed: false },
          { id: "4-1-3", title: "Scikit-learn Intro", type: "video", duration: "40m", completed: false },
        ],
      },
    ],
  },
];
