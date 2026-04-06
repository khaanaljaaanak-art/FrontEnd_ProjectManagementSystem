import { Outlet } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardNavbar from "../../components/common/DashboardNavbar";

const navItems = [
  { to: "/admin/projects", label: "Projects" },
  { to: "/admin/assessments", label: "Assessments" },
  { to: "/admin/users", label: "Users and Roles" },
  { to: "/admin/settings", label: "System Settings" },
  { to: "/admin/reports", label: "Reports and Analytics" },
  { to: "/admin/disputes", label: "Disputes" },
  { to: "/admin/activity", label: "Activity" },
];

const AdminLayoutPage = () => {
  return (
    <Layout
      title="Admin Workspace"
      subtitle="Navigate admin operations step-by-step"
    >
      <DashboardNavbar items={navItems} />
      <Outlet />
    </Layout>
  );
};

export default AdminLayoutPage;
