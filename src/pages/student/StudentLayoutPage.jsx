import { Outlet } from "react-router-dom";
import {
  Award,
  Bell,
  CloudUpload,
  History,
  LayoutDashboard,
  Mail,
  MessagesSquare,
} from "lucide-react";
import Layout from "../../components/Layout";
import DashboardSidebar from "../../components/common/DashboardSidebar";

const navItems = [
  { to: "/student/overview", label: "Overview", icon: LayoutDashboard },
  { to: "/student/submission", label: "Submission", icon: CloudUpload },
  { to: "/student/marks", label: "Marks", icon: Award },
  { to: "/student/notifications", label: "Notifications", icon: Bell },
  { to: "/student/forum", label: "Forum", icon: MessagesSquare },
  { to: "/student/communication", label: "Communication", icon: Mail },
  { to: "/student/history", label: "History", icon: History },
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
