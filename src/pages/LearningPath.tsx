import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const LearningPath = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-semibold text-foreground">Learning Path</h1>
      <p className="text-muted-foreground mt-2">Your personalized learning journey.</p>
    </DashboardLayout>
  );
};

export default LearningPath;
