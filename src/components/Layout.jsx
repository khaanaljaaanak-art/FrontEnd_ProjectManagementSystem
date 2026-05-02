import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const portalLabel = (role) => {
  if (role === "admin") return "Admin Portal";
  if (role === "student") return "Student Portal";
  if (role === "supervisor") return "Supervisor Portal";
  return "Assessment Portal";
};

/** Picks the nav label for the longest `to` that matches the pathname. */
const activeNavLabel = (pathname, items) => {
  if (!items?.length) return "";
  let best = "";
  let bestLen = -1;
  for (const item of items) {
    const { to, label } = item;
    if (pathname === to || pathname.startsWith(`${to}/`)) {
      if (to.length > bestLen) {
        bestLen = to.length;
        best = label;
      }
    }
  }
  return best;
};

const Layout = ({ title, subtitle, children, sidebar, sidebarNavItems }) => {
  const { pathname } = useLocation();
  const { token, role, logout } = useAuth();
  const activePortalLabel = token ? portalLabel(role) : "Assessment Portal";
  const topBarPageTitle =
    activeNavLabel(pathname, sidebarNavItems) || title || "";

  if (sidebar) {
    return (
      <div className="appShell appShell--dashboard">
        <div className="dashboardFrame">
          <div className="dashboardSidebarColumn">{sidebar}</div>
          <div className="dashboardContentColumn">
            <header className="dashboardTopBar">
              <div className="dashboardTopBarInner">
                <h2 className="dashboardTopBarTitle">{topBarPageTitle}</h2>
                <button
                  type="button"
                  className="button buttonDanger"
                  aria-label="Log out"
                  onClick={logout}
                >
                  Log out
                </button>
              </div>
            </header>
            <main className="dashboardScrollMain">
              <div className="dashboardMainInner">
                <div className="dashboardOutlet">{children}</div>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="appShell">
      <header className="header">
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
      </header>

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
