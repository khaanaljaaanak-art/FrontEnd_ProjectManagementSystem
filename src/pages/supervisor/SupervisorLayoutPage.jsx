import { Outlet } from "react-router-dom";
import {
  ClipboardPenLine,
  History,
  Mail,
  MessagesSquare,
  Users,
} from "lucide-react";
import Layout from "../../components/Layout";
import DashboardSidebar from "../../components/common/DashboardSidebar";

const navItems = [
  { to: "/supervisor/grading", label: "Grading", icon: ClipboardPenLine },
  { to: "/supervisor/students", label: "Students", icon: Users },
  { to: "/supervisor/history", label: "History", icon: History },
  { to: "/supervisor/forum", label: "Forum", icon: MessagesSquare },
  { to: "/supervisor/communication", label: "Communication", icon: Mail },
];

const SupervisorLayoutPage = () => {
  return (
    <Layout
      title="Supervisor Workspace"
      subtitle="Grading, student progress, and communication—pick a section to begin"
      sidebar={<DashboardSidebar items={navItems} />}
      sidebarNavItems={navItems}
    >
      <Outlet />
    </Layout>
  );
};

export default SupervisorLayoutPage;
