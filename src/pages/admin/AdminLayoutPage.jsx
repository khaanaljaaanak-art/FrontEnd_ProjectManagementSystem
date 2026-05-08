import { Outlet } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardSidebar from "../../components/common/DashboardSidebar";

const navItems = [
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/assessments/select", label: "Assessments" },
  { to: "/admin/users", label: "Users and Roles" },
  { to: "/admin/settings", label: "System Settings" },
  { to: "/admin/reports", label: "Reports and Analytics" },
  { to: "/admin/activity", label: "Activity" },
];

const AdminLayoutPage = () => {
  return (
    <Layout
      title="Admin Workspace"
      subtitle="Manage projects, people, and system settings from the sidebar"
      sidebar={<DashboardSidebar items={navItems} />}
      sidebarNavItems={navItems}
    >
      <Outlet />
    </Layout>
  );
};

export default AdminLayoutPage;
