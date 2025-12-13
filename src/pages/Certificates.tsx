import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Certificates = () => {
  return (
    <DashboardLayout>
      <h1 className="text-3xl font-semibold text-foreground">Certificates</h1>
      <p className="text-muted-foreground mt-2">View and download your earned certificates.</p>
    </DashboardLayout>
  );
};

export default Certificates;
