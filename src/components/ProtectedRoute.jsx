import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Layout from "./Layout";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = useAuth();

  if (!token) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return (
      <Layout
        title="Access Denied"
        subtitle="You don’t have permission to view this page"
      >
        <div className="card">
          <p className="helper">
            Your current role is <strong>{role || "unknown"}</strong>.
          </p>
        </div>
      </Layout>
    );
  }

  return children;
};

export default ProtectedRoute;
