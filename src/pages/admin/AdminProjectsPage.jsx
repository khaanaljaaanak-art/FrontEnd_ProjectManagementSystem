import { useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import {
  createProject,
  approveProject,
  deleteProject,
  updateProject,
} from "../../services/projectService";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminProjectsPage = () => {
  const { projects, refreshProjects } = useProjects();
  const [selectedProjectIds, setSelectedProjectIds] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [draft, setDraft] = useState({ title: "", description: "", status: "available" });

  const withAction = async (fn, successMessage) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      if (successMessage) setMessage(successMessage);
      await refreshProjects();

      setSelectedProjectIds((prev) =>
        prev.filter((id) => projects.some((project) => project._id === id))
      );
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
      });
      setDraft({ title: "", description: "", status: "available" });
    }, "Project created.");
  };

  const onUpdate = async () => {
    if (!selectedProjectId) return;
    await withAction(async () => {
      await updateProject(selectedProjectId, {
        title: draft.title.trim() || undefined,
        description: draft.description.trim() || undefined,
        status: draft.status,
      });
    }, "Project updated.");
  };

  const toggleSelection = (projectId) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const allSelected = projects.length > 0 && selectedProjectIds.length === projects.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedProjectIds([]);
      return;
    }
    setSelectedProjectIds(projects.map((project) => project._id));
  };

  const onDeleteSelected = async () => {
    if (selectedProjectIds.length === 0) return;

    const selectedCount = selectedProjectIds.length;
    await withAction(async () => {
      const results = await Promise.allSettled(
        selectedProjectIds.map((projectId) => deleteProject(projectId))
      );

      if (selectedProjectIds.includes(selectedProjectId)) {
        setSelectedProjectId("");
      }
      setSelectedProjectIds([]);

      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        const firstError = failed[0].reason;
        const reason =
          firstError?.response?.data?.message || firstError?.message || "Unknown error.";
        throw new Error(`${failed.length}/${results.length} deletions failed. ${reason}`);
      }
    }, `${selectedCount} project(s) deleted.`);
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

      <div className="actions" style={{ marginTop: 12 }}>
        <label className="helper" style={{ margin: 0, display: "inline-flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            disabled={busy || projects.length === 0}
          />
          Select all
        </label>
        <button
          type="button"
          className="button buttonDanger"
          onClick={onDeleteSelected}
          disabled={busy || selectedProjectIds.length === 0}
        >
          Delete Selected ({selectedProjectIds.length})
        </button>
      </div>

      <ul className="list" style={{ marginTop: 12 }}>
        {projects.map((project) => (
          <li key={project._id} className="item">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="checkbox"
                checked={selectedProjectIds.includes(project._id)}
                onChange={() => toggleSelection(project._id)}
                disabled={busy}
                aria-label={`Select ${project.title}`}
              />
              <div>
                <p className="itemTitle">{project.title}</p>
                <p className="itemMeta">{project.description}</p>
                <p className="helper">Approval: {project.approved ? "Approved" : "Pending"}</p>
              </div>
            </div>
            <div className="actions">
              <button
                type="button"
                className="button"
                onClick={() => {
                  setSelectedProjectId(project._id);
                  setDraft({
                    title: project.title,
                    description: project.description,
                    status: project.status || "available",
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
  );
};

export default AdminProjectsPage;
