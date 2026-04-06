import { useEffect, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import {
  createProject,
  approveProject,
  deleteProject,
  updateProject,
} from "../../services/projectService";
import { fetchUsers } from "../../services/adminService";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminProjectsPage = () => {
  const { projects, refreshProjects } = useProjects();
  const [supervisors, setSupervisors] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    description: "",
    status: "available",
    supervisors: [],
  });
  const PROJECT_SCROLL_THRESHOLD = 6;

  useEffect(() => {
    const loadSupervisors = async () => {
      try {
        const users = await fetchUsers();
        const supervisorUsers = Array.isArray(users)
          ? users.filter((user) => user.role === "supervisor")
          : [];
        setSupervisors(supervisorUsers);
      } catch (_e) {
        setError("Failed to load supervisors.");
      }
    };

    loadSupervisors();
  }, []);

  const withAction = async (fn, successMessage) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      if (successMessage) setMessage(successMessage);
      await refreshProjects();
    } catch (e) {
      setError(e?.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async (event) => {
    event.preventDefault();
    await withAction(async () => {
      await createProject({
        title: draft.title.trim(),
        description: draft.description.trim(),
        supervisors: draft.supervisors,
      });
      setDraft({ title: "", description: "", status: "available", supervisors: [] });
    }, "Project created.");
  };

  const onUpdate = async () => {
    if (!selectedProjectId) return;
    await withAction(async () => {
      await updateProject(selectedProjectId, {
        title: draft.title.trim() || undefined,
        description: draft.description.trim() || undefined,
        status: draft.status,
        supervisors: draft.supervisors,
      });
    }, "Project updated.");
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">Project Governance</p>
          <p className="cardHint">Create, approve, edit, and delete projects</p>
        </div>
      </div>

      <ErrorMessage message={error} />
      {message && <p className="helper">{message}</p>}

      <form className="row" onSubmit={onCreate}>
        <input
          className="input"
          placeholder="Project title"
          value={draft.title}
          onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
          required
          disabled={busy}
        />
        <textarea
          className="textarea"
          placeholder="Project description"
          value={draft.description}
          onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
          required
          disabled={busy}
        />
        <div>
          <label className="label">Assign Supervisors</label>
          <select
            className="select"
            multiple
            value={draft.supervisors}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
              setDraft((prev) => ({ ...prev, supervisors: selected }));
            }}
            disabled={busy}
            style={{ minHeight: 116 }}
          >
            {supervisors.map((supervisor) => (
              <option key={supervisor._id} value={supervisor._id}>
                {supervisor.name} ({supervisor.email})
              </option>
            ))}
          </select>
          <p className="helper">Hold Ctrl (Windows) to select multiple supervisors.</p>
        </div>
        <div className="actions">
          <button type="submit" className="button buttonPrimary" disabled={busy}>
            Create Project
          </button>
          <button
            type="button"
            className="button"
            onClick={onUpdate}
            disabled={busy || !selectedProjectId}
          >
            Update Selected Project
          </button>
        </div>
      </form>

      <div
        style={
          projects.length > PROJECT_SCROLL_THRESHOLD
            ? { maxHeight: 460, overflowY: "auto", marginTop: 12, paddingRight: 4 }
            : { marginTop: 12 }
        }
      >
        <ul className="list" style={{ marginTop: 0 }}>
          {projects.map((project) => (
            <li key={project._id} className="item">
              <p className="itemTitle">{project.title}</p>
              <p className="itemMeta">{project.description}</p>
              <p className="helper">
                Supervisors: {(project.supervisors || []).map((s) => s.name || s.email).join(", ") || "N/A"}
              </p>
              <p className="helper">Approval: {project.approved ? "Approved" : "Pending"}</p>
              <div className="actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    const supervisorIds = (project.supervisors || []).map((s) =>
                      typeof s === "string" ? s : s._id
                    );
                    setSelectedProjectId(project._id);
                    setDraft({
                      title: project.title,
                      description: project.description,
                      status: project.status || "available",
                      supervisors: supervisorIds,
                    });
                  }}
                >
                  Select
                </button>
                {!project.approved && (
                  <button
                    type="button"
                    className="button buttonPrimary"
                    onClick={() => withAction(() => approveProject(project._id), "Project approved.")}
                    disabled={busy}
                  >
                    Approve
                  </button>
                )}
                <button
                  type="button"
                  className="button buttonDanger"
                  onClick={() => withAction(() => deleteProject(project._id), "Project deleted.")}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminProjectsPage;
