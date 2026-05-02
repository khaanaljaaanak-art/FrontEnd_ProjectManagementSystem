import { Outlet } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardSidebar from "../../components/common/DashboardSidebar";

const navItems = [
  { to: "/supervisor/grading", label: "Grading" },
  { to: "/supervisor/students", label: "Students" },
  { to: "/supervisor/history", label: "History" },
  { to: "/supervisor/communication", label: "Communication" },
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
