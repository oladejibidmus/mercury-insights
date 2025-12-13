export interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "short-answer" | "code";
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  codeSnippet?: string;
}

export interface Quiz {
  id: string;
  title: string;
  courseTitle: string;
  timeLimit: number; // in minutes
  totalQuestions: number;
  passingScore: number;
  questions: QuizQuestion[];
  status: "not-started" | "in-progress" | "completed";
  score?: number;
  completedAt?: string;
}

export const mockQuizzes: Quiz[] = [
  {
    id: "1",
    title: "Python Variables Assessment",
    courseTitle: "Python Fundamentals",
    timeLimit: 15,
    totalQuestions: 10,
    passingScore: 70,
    status: "completed",
    score: 90,
    completedAt: "2024-01-10",
    questions: [
      {
        id: "1-1",
        type: "multiple-choice",
        question: "Which of the following is a valid variable name in Python?",
        options: ["2myvar", "my-var", "my_var", "my var"],
        correctAnswer: 2,
        explanation: "Variable names in Python can contain letters, numbers, and underscores, but cannot start with a number or contain spaces or hyphens.",
      },
      {
        id: "1-2",
        type: "true-false",
        question: "Python is a statically typed language.",
        options: ["True", "False"],
        correctAnswer: 1,
        explanation: "Python is dynamically typed, meaning you don't need to declare variable types explicitly.",
      },
      {
        id: "1-3",
        type: "code",
        question: "What will be the output of the following code?",
        codeSnippet: "x = 5\ny = 2\nprint(x ** y)",
        options: ["10", "7", "25", "3"],
        correctAnswer: 2,
        explanation: "The ** operator in Python is the exponentiation operator. 5 ** 2 = 25.",
      },
    ],
  },
  {
    id: "2",
    title: "Pandas DataFrames Quiz",
    courseTitle: "Data Analysis with Pandas",
    timeLimit: 20,
    totalQuestions: 15,
    passingScore: 75,
    status: "in-progress",
    questions: [
      {
        id: "2-1",
        type: "multiple-choice",
        question: "Which method is used to read a CSV file in Pandas?",
        options: ["pd.load_csv()", "pd.read_csv()", "pd.import_csv()", "pd.open_csv()"],
        correctAnswer: 1,
        explanation: "The pd.read_csv() function is the standard way to read CSV files into a DataFrame.",
      },
      {
        id: "2-2",
        type: "multiple-choice",
        question: "How do you select a single column from a DataFrame?",
        options: ["df.column_name", "df['column_name']", "df.get('column_name')", "All of the above"],
        correctAnswer: 3,
        explanation: "All three methods can be used to select a single column from a DataFrame.",
      },
    ],
  },
  {
    id: "3",
    title: "SQL Basics Assessment",
    courseTitle: "SQL for Data Analysis",
    timeLimit: 25,
    totalQuestions: 20,
    passingScore: 80,
    status: "not-started",
    questions: [
      {
        id: "3-1",
        type: "multiple-choice",
        question: "Which SQL clause is used to filter records?",
        options: ["FILTER", "WHERE", "HAVING", "CONDITION"],
        correctAnswer: 1,
        explanation: "The WHERE clause is used to filter records based on a condition.",
      },
    ],
  },
];

export const currentQuiz: Quiz = {
  id: "active",
  title: "Data Manipulation Assessment",
  courseTitle: "Data Analysis with Pandas",
  timeLimit: 20,
  totalQuestions: 10,
  passingScore: 70,
  status: "in-progress",
  questions: [
    {
      id: "q1",
      type: "multiple-choice",
      question: "Which method is used to filter rows in a DataFrame based on a condition?",
      options: ["df.filter()", "df.query()", "df.loc[]", "All of the above"],
      correctAnswer: 3,
      explanation: "All three methods can be used to filter DataFrame rows, though they work differently.",
    },
    {
      id: "q2",
      type: "true-false",
      question: "The groupby() method in Pandas always returns a DataFrame.",
      options: ["True", "False"],
      correctAnswer: 1,
      explanation: "groupby() returns a GroupBy object. You need to apply an aggregation function to get a DataFrame.",
    },
    {
      id: "q3",
      type: "code",
      question: "What does the following code return?",
      codeSnippet: "df = pd.DataFrame({'A': [1, 2, 3], 'B': [4, 5, 6]})\ndf['A'].sum()",
      options: ["[1, 2, 3]", "6", "10", "Error"],
      correctAnswer: 1,
      explanation: "The sum() method returns the sum of all values in the column. 1 + 2 + 3 = 6.",
    },
    {
      id: "q4",
      type: "multiple-choice",
      question: "Which parameter in merge() specifies how to join DataFrames?",
      options: ["join_type", "how", "method", "type"],
      correctAnswer: 1,
      explanation: "The 'how' parameter specifies the type of merge: 'left', 'right', 'outer', 'inner'.",
    },
    {
      id: "q5",
      type: "short-answer",
      question: "What method would you use to remove duplicate rows from a DataFrame?",
      correctAnswer: "drop_duplicates",
      explanation: "The drop_duplicates() method removes duplicate rows from a DataFrame.",
    },
  ],
};
