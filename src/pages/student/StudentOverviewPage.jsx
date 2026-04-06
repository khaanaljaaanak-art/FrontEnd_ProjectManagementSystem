import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { assignProjectAsStudent, fetchStudentOverview } from "../../services/studentService";

const StudentOverviewPage = () => {
  const [overview, setOverview] = useState({ assignedProject: null, availableProjects: [], admins: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStudentOverview();
      setOverview({
        assignedProject: data?.assignedProject || null,
        availableProjects: Array.isArray(data?.availableProjects) ? data.availableProjects : [],
        admins: Array.isArray(data?.admins) ? data.admins : [],
      });
    } catch (_e) {
      setError("Failed to load project overview.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onAssign = async (projectId) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await assignProjectAsStudent(projectId);
      setMessage("Project assigned successfully.");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to assign project.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid2">
      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Assigned Project and Requirements</p>
            <p className="cardHint">Your current project, supervisors, and requirement summary</p>
          </div>
        </div>

        <ErrorMessage message={error} />
        {message && <p className="helper">{message}</p>}
        {loading && <p className="helper">Loading overview…</p>}

        {!loading && !overview.assignedProject && (
          <p className="helper">No project assigned yet. Choose one from the list.</p>
        )}

        {!loading && overview.assignedProject && (
          <div className="item">
            <p className="itemTitle">{overview.assignedProject.title}</p>
            <p className="itemMeta">{overview.assignedProject.description}</p>
            <p className="helper">Supervisors:</p>
            <ul className="list">
              {(overview.assignedProject.supervisors || []).map((supervisor) => (
                <li key={supervisor._id} className="item">
                  <p className="itemTitle">{supervisor.name}</p>
                  <p className="itemMeta">{supervisor.email}</p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Available Projects</p>
            <p className="cardHint">Choose an approved project and get connected with supervisors</p>
          </div>
          <button type="button" className="button" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        <ul className="list">
          {(overview.availableProjects || []).map((project) => (
            <li key={project._id} className="item">
              <p className="itemTitle">{project.title}</p>
              <p className="itemMeta">{project.description}</p>
              <p className="helper">
                Supervisors: {(project.supervisors || []).map((s) => s.name).join(", ") || "N/A"}
              </p>
              <button
                type="button"
                className="button buttonPrimary"
                onClick={() => onAssign(project._id)}
                disabled={busy}
              >
                Select This Project
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Admin Contacts</p>
            <p className="cardHint">Direct connection with system admins</p>
          </div>
        </div>
        <ul className="list">
          {(overview.admins || []).map((admin) => (
            <li key={admin._id} className="item">
              <p className="itemTitle">{admin.name}</p>
              <p className="itemMeta">{admin.email}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudentOverviewPage;
