import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const portalLabel = (role) => {
  if (role === "admin") return "Admin Portal";
  if (role === "student") return "Student Portal";
  if (role === "supervisor") return "Supervisor Portal";
  return "Assessment Portal";
};

const DashboardSidebar = ({ items }) => {
  const { role } = useAuth();

  return (
    <aside className="dashboardSidebar" aria-label="Workspace navigation">
      <div className="dashboardSidebarBrand">
        <div className="dashboardSidebarBrandSubtitle">{portalLabel(role)}</div>
      </div>
      <div className="dashboardSidebarBody">
        <nav className="dashboardSidebarNav">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? "dashboardSidebarLink active" : "dashboardSidebarLink"
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
