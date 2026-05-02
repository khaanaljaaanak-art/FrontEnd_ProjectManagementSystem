import { Outlet } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardSidebar from "../../components/common/DashboardSidebar";

const navItems = [
  { to: "/student/overview", label: "Overview" },
  { to: "/student/submission", label: "Submission" },
  { to: "/student/marks", label: "Marks" },
  { to: "/student/notifications", label: "Notifications" },
  { to: "/student/communication", label: "Communication" },
  { to: "/student/history", label: "History" },
];

const StudentLayoutPage = () => {
  return (
    <Layout
      title="Student Portal"
      subtitle="Your coursework hub—each area opens as its own workspace"
      sidebar={<DashboardSidebar items={navItems} />}
      sidebarNavItems={navItems}
    >
      <Outlet />
    </Layout>
  );
};

export default StudentLayoutPage;
