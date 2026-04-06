import { useAuth } from "../context/AuthContext";

const portalLabel = (role) => {
  if (role === "admin") return "Admin Portal";
  if (role === "student") return "Student Portal";
  if (role === "supervisor") return "Supervisor Portal";
  return "Assessment Portal";
};

const Layout = ({ title, subtitle, children }) => {
  const { token, role, logout } = useAuth();
  const activePortalLabel = token ? portalLabel(role) : "Assessment Portal";

  return (
    <div className="appShell">
      <div className="header">
        <div className="headerInner">
          <div className="brand">
            <div className="brandTitle">Project Management System</div>
            <div className="brandSubtitle">{activePortalLabel}</div>
          </div>

          <div className="headerRight">
            {token && (
              <button
                type="button"
                className="button buttonDanger"
                aria-label="Log out"
                onClick={logout}
              >
                Log out
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
            Project Management System · {activePortalLabel}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
