import Navbar from "@/components/Navbar";
import { BulkUploadSection } from "@/components/admin/BulkUploadSection";
import { PendingApprovalsSection } from "@/components/admin/PendingApprovalsSection";
import { UserManagementSection } from "@/components/admin/UserManagementSection";
import { AuditLogSection } from "@/components/admin/AuditLogSection";

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-sage-50">
      <Navbar />
      <main className="container mx-auto px-4 pt-20">
        <div className="max-w-6xl mx-auto space-y-8">
          <BulkUploadSection />
          <PendingApprovalsSection />
          <UserManagementSection />
          <AuditLogSection />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;