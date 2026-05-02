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

const formatStatusLabel = (status) => {
  const raw = (status || "available").replace(/_/g, " ");
  return raw.replace(/\b\w/g, (ch) => ch.toUpperCase());
};

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
            ? { maxHeight: 460, overflowY: "auto", marginTop: 20, paddingRight: 4 }
            : { marginTop: 20 }
        }
      >
        <h2 className="adminListCardSectionTitle">Projects ({projects.length})</h2>
        {projects.length === 0 && <p className="helper" style={{ marginTop: 0 }}>No projects yet. Create one above.</p>}
        <ul className="adminListCardList">
          {projects.map((project) => {
            const supervisorLine = (project.supervisors || [])
              .map((s) => s.name || s.email)
              .join(", ");
            const isSelected = selectedProjectId === project._id;
            const statusLabel = formatStatusLabel(project.status);

            return (
              <li
                key={project._id}
                className={`adminListCard${isSelected ? " adminListCard--selected" : ""}`}
              >
                <div className="adminListCard__body">
                  <div className="adminListCard__top">
                    <h3 className="adminListCard__title">{project.title}</h3>
                    <div className="adminListCard__pills" aria-label="Project status">
                      <span
                        className={`adminListCard__pill ${
                          project.approved
                            ? "adminListCard__pill--approved"
                            : "adminListCard__pill--pending"
                        }`}
                      >
                        {project.approved ? "Approved" : "Pending approval"}
                      </span>
                      <span className="adminListCard__pill adminListCard__pill--status">
                        {statusLabel}
                      </span>
                    </div>
                  </div>
                  <p className="adminListCard__desc">{project.description}</p>
                  <div className="adminListCard__meta">
                    <div className="adminListCard__metaRow">
                      <p className="adminListCard__metaLabel">Supervisors</p>
                      <p className="adminListCard__metaValue">{supervisorLine || "None assigned"}</p>
                    </div>
                  </div>
                </div>
                <div className="adminListCard__footer">
                  <button
                    type="button"
                    className="button"
                    aria-pressed={isSelected}
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
                    {isSelected ? "Selected for edit" : "Select for edit"}
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
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AdminProjectsPage;
