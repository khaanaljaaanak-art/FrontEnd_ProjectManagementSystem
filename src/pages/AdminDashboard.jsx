import ProjectList from "../components/ProjectList";
import Layout from "../components/Layout";

const AdminDashboard = () => {
  return (
    <Layout title="Admin Dashboard" subtitle="Overview of projects">
      <div className="grid">
        <ProjectList />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
