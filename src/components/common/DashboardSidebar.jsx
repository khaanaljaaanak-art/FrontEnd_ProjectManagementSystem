import { NavLink } from "react-router-dom";
import {
  ClipboardCheck,
  GraduationCap,
  LayoutGrid,
  Shield,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const portalLabel = (role) => {
  if (role === "admin") return "Admin Portal";
  if (role === "student") return "Student Portal";
  if (role === "supervisor") return "Supervisor Portal";
  return "Assessment Portal";
};

const roleBrandIcon = {
  admin: Shield,
  student: GraduationCap,
  supervisor: ClipboardCheck,
};

const DashboardSidebar = ({ items }) => {
  const { role } = useAuth();
  const BrandIcon = roleBrandIcon[role] ?? LayoutGrid;

  return (
    <aside className="dashboardSidebar" aria-label="Workspace navigation">
      <div className="dashboardSidebarBrand">
        <div className="dashboardSidebarBrandRow">
          <BrandIcon
            className="dashboardSidebarBrandIcon"
            size={22}
            strokeWidth={2}
            aria-hidden
          />
          <div className="dashboardSidebarBrandSubtitle">{portalLabel(role)}</div>
        </div>
      </div>
      <div className="dashboardSidebarBody">
        <nav className="dashboardSidebarNav">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? "dashboardSidebarLink active" : "dashboardSidebarLink"
                }
              >
                {Icon ? (
                  <Icon
                    className="dashboardSidebarLinkIcon"
                    size={18}
                    strokeWidth={2}
                    aria-hidden
                  />
                ) : null}
                <span className="dashboardSidebarLinkLabel">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
