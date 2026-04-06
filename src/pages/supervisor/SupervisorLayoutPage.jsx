import { Outlet } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardNavbar from "../../components/common/DashboardNavbar";

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
      subtitle="Evaluate submissions, track progress, communicate, and monitor updates"
    >
      <DashboardNavbar items={navItems} />

      <Outlet />
    </Layout>
  );
};

export default SupervisorLayoutPage;
