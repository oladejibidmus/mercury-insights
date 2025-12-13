export interface Course {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  rating: number;
  reviewCount: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  enrollmentCount: number;
  description: string;
  curriculum: { title: string; duration: string }[];
  instructorBio: string;
  reviews: { user: string; rating: number; comment: string; date: string }[];
}

export const mockCourses: Course[] = [
  {
    id: "1",
    title: "Python for Data Science Masterclass",
    instructor: "Dr. Sarah Chen",
    thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=225&fit=crop",
    rating: 4.8,
    reviewCount: 2341,
    duration: "42 hours",
    level: "Beginner",
    category: "Python",
    enrollmentCount: 45230,
    description: "Master Python programming from scratch and build real-world data science projects. Learn pandas, numpy, matplotlib, and more.",
    curriculum: [
      { title: "Introduction to Python", duration: "3h" },
      { title: "Data Types & Variables", duration: "4h" },
      { title: "Control Flow & Functions", duration: "5h" },
      { title: "Working with Libraries", duration: "8h" },
      { title: "Data Analysis with Pandas", duration: "12h" },
      { title: "Visualization with Matplotlib", duration: "10h" },
    ],
    instructorBio: "Dr. Sarah Chen is a data scientist with 15+ years of experience at top tech companies. She holds a PhD in Computer Science from MIT.",
    reviews: [
      { user: "Alex M.", rating: 5, comment: "Excellent course! Very comprehensive and well-structured.", date: "2024-01-15" },
      { user: "Maria L.", rating: 4, comment: "Great content, learned a lot about data science fundamentals.", date: "2024-01-10" },
    ],
  },
  {
    id: "2",
    title: "SQL Bootcamp: From Zero to Hero",
    instructor: "James Rodriguez",
    thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400&h=225&fit=crop",
    rating: 4.7,
    reviewCount: 1892,
    duration: "28 hours",
    level: "Beginner",
    category: "SQL",
    enrollmentCount: 32150,
    description: "Learn SQL from the ground up. Master database queries, joins, subqueries, and advanced SQL techniques.",
    curriculum: [
      { title: "Database Fundamentals", duration: "2h" },
      { title: "Basic SELECT Queries", duration: "4h" },
      { title: "Filtering & Sorting", duration: "3h" },
      { title: "Joins & Relationships", duration: "6h" },
      { title: "Subqueries & CTEs", duration: "5h" },
      { title: "Advanced SQL", duration: "8h" },
    ],
    instructorBio: "James Rodriguez is a senior database architect with experience at Fortune 500 companies.",
    reviews: [
      { user: "Tom K.", rating: 5, comment: "Best SQL course I've taken. Very practical examples.", date: "2024-01-12" },
    ],
  },
  {
    id: "3",
    title: "Tableau: Data Visualization Expert",
    instructor: "Emily Watson",
    thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=225&fit=crop",
    rating: 4.9,
    reviewCount: 1567,
    duration: "35 hours",
    level: "Intermediate",
    category: "Tableau",
    enrollmentCount: 28900,
    description: "Create stunning visualizations and interactive dashboards with Tableau. From basics to advanced analytics.",
    curriculum: [
      { title: "Tableau Interface", duration: "3h" },
      { title: "Charts & Graphs", duration: "6h" },
      { title: "Calculated Fields", duration: "5h" },
      { title: "Dashboard Design", duration: "8h" },
      { title: "Advanced Analytics", duration: "7h" },
      { title: "Tableau Server", duration: "6h" },
    ],
    instructorBio: "Emily Watson is a Tableau Certified Professional and data visualization consultant.",
    reviews: [
      { user: "Chris P.", rating: 5, comment: "Transformed my dashboard skills completely!", date: "2024-01-08" },
    ],
  },
  {
    id: "4",
    title: "Power BI Complete Guide",
    instructor: "Michael Brown",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop",
    rating: 4.6,
    reviewCount: 2105,
    duration: "40 hours",
    level: "Beginner",
    category: "Power BI",
    enrollmentCount: 38750,
    description: "Master Microsoft Power BI for business intelligence. Create reports, dashboards, and data models.",
    curriculum: [
      { title: "Power BI Desktop Basics", duration: "4h" },
      { title: "Data Import & Transform", duration: "6h" },
      { title: "DAX Fundamentals", duration: "8h" },
      { title: "Visualization Best Practices", duration: "7h" },
      { title: "Report Design", duration: "8h" },
      { title: "Power BI Service", duration: "7h" },
    ],
    instructorBio: "Michael Brown is a Microsoft MVP and Power BI trainer with 10+ years in business intelligence.",
    reviews: [
      { user: "Linda S.", rating: 5, comment: "Very thorough course. Love the real-world examples.", date: "2024-01-05" },
    ],
  },
  {
    id: "5",
    title: "Advanced Python: Machine Learning",
    instructor: "Dr. Sarah Chen",
    thumbnail: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=225&fit=crop",
    rating: 4.9,
    reviewCount: 987,
    duration: "55 hours",
    level: "Advanced",
    category: "Python",
    enrollmentCount: 15420,
    description: "Deep dive into machine learning with Python. Build models using scikit-learn, TensorFlow, and PyTorch.",
    curriculum: [
      { title: "ML Fundamentals", duration: "6h" },
      { title: "Supervised Learning", duration: "12h" },
      { title: "Unsupervised Learning", duration: "8h" },
      { title: "Neural Networks", duration: "15h" },
      { title: "Deep Learning Projects", duration: "14h" },
    ],
    instructorBio: "Dr. Sarah Chen is a data scientist with 15+ years of experience at top tech companies.",
    reviews: [
      { user: "David R.", rating: 5, comment: "Incredible depth. Really helped me understand ML.", date: "2024-01-02" },
    ],
  },
  {
    id: "6",
    title: "SQL Performance Optimization",
    instructor: "James Rodriguez",
    thumbnail: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=225&fit=crop",
    rating: 4.5,
    reviewCount: 654,
    duration: "20 hours",
    level: "Advanced",
    category: "SQL",
    enrollmentCount: 8900,
    description: "Optimize your SQL queries for maximum performance. Learn indexing, query plans, and database tuning.",
    curriculum: [
      { title: "Query Execution Plans", duration: "4h" },
      { title: "Indexing Strategies", duration: "5h" },
      { title: "Query Optimization", duration: "6h" },
      { title: "Database Tuning", duration: "5h" },
    ],
    instructorBio: "James Rodriguez is a senior database architect with experience at Fortune 500 companies.",
    reviews: [
      { user: "Sam W.", rating: 4, comment: "Great for understanding database internals.", date: "2023-12-28" },
    ],
  },
  {
    id: "7",
    title: "Data Analytics with Python",
    instructor: "Dr. Lisa Park",
    thumbnail: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=400&h=225&fit=crop",
    rating: 4.7,
    reviewCount: 1234,
    duration: "32 hours",
    level: "Intermediate",
    category: "Python",
    enrollmentCount: 22100,
    description: "Analyze real-world datasets using Python. Master statistical analysis and data storytelling.",
    curriculum: [
      { title: "Statistical Analysis", duration: "8h" },
      { title: "Data Cleaning", duration: "6h" },
      { title: "Exploratory Analysis", duration: "8h" },
      { title: "Data Storytelling", duration: "10h" },
    ],
    instructorBio: "Dr. Lisa Park is a data analyst and educator with a passion for making data accessible.",
    reviews: [
      { user: "Nancy H.", rating: 5, comment: "Perfect for intermediate learners!", date: "2024-01-01" },
    ],
  },
  {
    id: "8",
    title: "Tableau Server Administration",
    instructor: "Robert Kim",
    thumbnail: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=225&fit=crop",
    rating: 4.4,
    reviewCount: 432,
    duration: "18 hours",
    level: "Advanced",
    category: "Tableau",
    enrollmentCount: 5600,
    description: "Learn to administer and manage Tableau Server. Security, permissions, and enterprise deployment.",
    curriculum: [
      { title: "Server Architecture", duration: "3h" },
      { title: "User Management", duration: "4h" },
      { title: "Security & Permissions", duration: "5h" },
      { title: "Performance Tuning", duration: "6h" },
    ],
    instructorBio: "Robert Kim is a Tableau Server administrator with enterprise deployment experience.",
    reviews: [
      { user: "Karen T.", rating: 4, comment: "Essential for Tableau admins.", date: "2023-12-20" },
    ],
  },
];

export const categories = ["All", "Python", "SQL", "Tableau", "Power BI"];
export const levels = ["All", "Beginner", "Intermediate", "Advanced"];
export const durations = ["All", "0-20 hours", "20-40 hours", "40+ hours"];
export const ratings = ["All", "4.5+", "4.0+", "3.5+"];
