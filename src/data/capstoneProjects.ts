export interface CapstoneProject {
  id: string;
  title: string;
  description: string;
  courseTitle: string;
  status: "not-started" | "in-progress" | "submitted" | "graded";
  dueDate: string;
  submittedAt?: string;
  grade?: number;
  feedback?: string;
  revisionRequested?: boolean;
  submissionLink?: string;
}

export const mockCapstoneProjects: CapstoneProject[] = [
  {
    id: "1",
    title: "Sales Data Analysis Dashboard",
    description: "Create a comprehensive data analysis project using Python and Pandas to analyze sales data. Build visualizations and extract key business insights.",
    courseTitle: "Data Analysis with Pandas",
    status: "in-progress",
    dueDate: "2024-02-15",
  },
  {
    id: "2",
    title: "Customer Database Design",
    description: "Design and implement a relational database for an e-commerce platform. Write complex queries to answer business questions.",
    courseTitle: "SQL for Data Analysis",
    status: "not-started",
    dueDate: "2024-03-01",
  },
  {
    id: "3",
    title: "Python Automation Script",
    description: "Build an automation script that processes files, cleans data, and generates reports automatically.",
    courseTitle: "Python Fundamentals",
    status: "graded",
    dueDate: "2024-01-20",
    submittedAt: "2024-01-18",
    grade: 92,
    feedback: "Excellent work! Your code is well-structured and follows Python best practices. The error handling is particularly well done. Consider adding more inline comments for complex logic sections.",
    submissionLink: "https://github.com/student/python-automation",
  },
  {
    id: "4",
    title: "Data Cleaning Pipeline",
    description: "Create a reusable data cleaning pipeline that handles missing values, outliers, and data type conversions.",
    courseTitle: "Data Analysis with Pandas",
    status: "submitted",
    dueDate: "2024-01-25",
    submittedAt: "2024-01-24",
    submissionLink: "https://github.com/student/data-pipeline",
  },
  {
    id: "5",
    title: "Interactive ML Model",
    description: "Build and deploy a simple machine learning model with a basic web interface for predictions.",
    courseTitle: "Machine Learning Basics",
    status: "not-started",
    dueDate: "2024-04-01",
  },
];
