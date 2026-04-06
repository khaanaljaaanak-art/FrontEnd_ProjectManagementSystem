import { NavLink } from "react-router-dom";

const DashboardNavbar = ({ items }) => {
  return (
    <nav className="dashboardNav" aria-label="Dashboard navigation">
      <div className="dashboardNavLinks">
        {items.map((item, index) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive ? "dashboardNavLink active" : "dashboardNavLink"
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default DashboardNavbar;
