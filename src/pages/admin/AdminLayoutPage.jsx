import { Outlet } from "react-router-dom";
import {
  Activity,
  BarChart3,
  Bell,
  ClipboardList,
  FolderKanban,
  MessagesSquare,
  Settings,
  Users,
} from "lucide-react";
import Layout from "../../components/Layout";
import DashboardSidebar from "../../components/common/DashboardSidebar";

const navItems = [
  { to: "/admin/projects", label: "Projects", icon: FolderKanban },
  { to: "/admin/assessments/select", label: "Assessments", icon: ClipboardList },
  { to: "/admin/users", label: "Users and Roles", icon: Users },
  { to: "/admin/settings", label: "System Settings", icon: Settings },
  { to: "/admin/notifications", label: "Notifications", icon: Bell },
  { to: "/admin/forum", label: "Forum", icon: MessagesSquare },
  { to: "/admin/reports", label: "Reports and Analytics", icon: BarChart3 },
  { to: "/admin/activity", label: "Activity", icon: Activity },
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
