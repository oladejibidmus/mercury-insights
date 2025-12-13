import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const CourseForum = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-semibold text-foreground">Course Forum</h1>
      <p className="text-muted-foreground mt-2">Discuss courses with fellow learners.</p>
    </DashboardLayout>
  );
};

export default CourseForum;
