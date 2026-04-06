import { Outlet } from "react-router-dom";
import Layout from "../../components/Layout";
import DashboardNavbar from "../../components/common/DashboardNavbar";

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
      subtitle="Projects, submissions, marks, feedback, notifications, and communication"
    >
      <DashboardNavbar items={navItems} />

      <Outlet />
    </Layout>
  );
};

export default StudentLayoutPage;
