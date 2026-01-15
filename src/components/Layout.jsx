import { useAuth } from "../context/AuthContext";

const roleLabel = (role) => {
  if (!role) return "Guest";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

const Layout = ({ title, subtitle, children }) => {
  const { token, role, logout } = useAuth();

  return (
    <div className="appShell">
      <div className="header">
        <div className="headerInner">
          <div className="brand">
            <div className="brandTitle">Project Management System</div>
            <div className="brandSubtitle">Assessment Portal</div>
          </div>

          <div className="headerRight">
            <span className="badge">Role: {token ? roleLabel(role) : ""}</span>
            {token && (
              <button
                type="button"
                className="button buttonDanger"
                onClick={logout}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>

      <main className="container appMain">
        {title && (
          <div>
            <h1 className="pageTitle">{title}</h1>
            {subtitle && <p className="subTitle">{subtitle}</p>}
          </div>
        )}

        <div style={{ marginTop: 18 }}>{children}</div>
      </main>

      <footer className="footer">
        <div className="footerInner">
          <span className="helper" style={{ margin: 0 }}>
            Project Management System · Assessment Portal
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
