import { useEffect, useMemo, useState } from "react";
import {
  AlignLeft,
  Briefcase,
  CheckCircle,
  Eye,
  FileText,
  FolderKanban,
  Layers,
  MinusCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  Users,
} from "lucide-react";
import { useProjects } from "../../context/ProjectContext";
import {
  createProject,
  approveProject,
  deleteProject,
  updateProject,
} from "../../services/projectService";
import { fetchUsers } from "../../services/adminService";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";

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
  const [deleteTarget, setDeleteTarget] = useState(null);
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

  const clearSelection = () => {
    setSelectedProjectId("");
    setDraft({ title: "", description: "", status: "available", supervisors: [] });
  };

  const editingProjectTitle = useMemo(() => {
    if (!selectedProjectId) return "";
    const p = projects.find((proj) => proj._id === selectedProjectId);
    return p?.title || "";
  }, [projects, selectedProjectId]);

  const catalogScrollable = projects.length > PROJECT_SCROLL_THRESHOLD;

  return (
    <div className="workflow adminProjectsPage">
      <section className="card studentOverviewCard adminProjectsFormCard" aria-labelledby="admin-projects-form-heading">
        <header className="studentOverviewCard__header">
          <div className="supervisorSetupCard__intro adminProjectsFormCard__intro">
            <span className="supervisorSetupCard__introIcon adminProjectsFormCard__icon" aria-hidden>
              <Briefcase size={22} strokeWidth={2} />
            </span>
            <div>
              <p className="studentOverviewCard__eyebrow">Governance</p>
              <h2 id="admin-projects-form-heading" className="cardTitle">
                Project governance
              </h2>
              <p className="cardHint adminProjectsFormCard__hint">
                Create new projects, assign supervisors, and load a project into the form to update details or
                availability.
              </p>
            </div>
          </div>
        </header>

        <div className="studentOverviewCard__body">
          <ErrorMessage message={error} />
          {message ? (
            <p className="studentOverviewBanner studentOverviewBanner--success adminProjectsBanner" role="status">
              {message}
            </p>
          ) : null}

          {selectedProjectId ? (
            <div className="adminProjectsEditingBar">
              <p className="adminProjectsEditingBar__text">
                <Pencil size={15} strokeWidth={2} className="adminProjectsEditingBar__ico" aria-hidden />
                Editing <strong>{editingProjectTitle}</strong>
              </p>
              <button type="button" className="button buttonInlineIcon adminProjectsEditingBar__clear" onClick={clearSelection} disabled={busy}>
                <MinusCircle size={16} strokeWidth={2} aria-hidden /> Clear selection
              </button>
            </div>
          ) : null}

          <form className="adminProjectsForm" onSubmit={onCreate}>
            <div className="adminProjectsForm__grid">
              <div className="adminProjectsField">
                <label className="label forumToolbar__labelIcon" htmlFor="admin-project-title">
                  <FileText size={15} strokeWidth={2} aria-hidden /> Project title{" "}
                  <span className="adminProjectsReq">*</span>
                </label>
                <input
                  id="admin-project-title"
                  className="input"
                  placeholder="e.g. Autumn capstone"
                  value={draft.title}
                  onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  disabled={busy}
                  autoComplete="off"
                />
              </div>
              <div className="adminProjectsField adminProjectsDescField">
                <label className="label forumToolbar__labelIcon" htmlFor="admin-project-description">
                  <AlignLeft size={15} strokeWidth={2} aria-hidden /> Description <span className="adminProjectsReq">*</span>
                </label>
                <textarea
                  id="admin-project-description"
                  className="textarea"
                  placeholder="Learning goals, scope, deadlines, deliverables…"
                  value={draft.description}
                  onChange={(e) => setDraft((prev) => ({ ...prev, description: e.target.value }))}
                  required
                  disabled={busy}
                  rows={4}
                />
              </div>
            </div>

            {selectedProjectId ? (
              <div className="adminProjectsField adminProjectsField--narrow">
                <label className="label forumToolbar__labelIcon" htmlFor="admin-project-status">
                  <Eye size={15} strokeWidth={2} aria-hidden /> Student availability
                </label>
                <select
                  id="admin-project-status"
                  className="select"
                  value={draft.status === "unavailable" ? "unavailable" : "available"}
                  onChange={(e) =>
                    setDraft((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  disabled={busy}
                >
                  <option value="available">Available — students may be assigned</option>
                  <option value="unavailable">Unavailable — paused or hidden</option>
                </select>
                <p className="helper adminProjectsFieldHint">Controls whether supervisors can attach this cohort to learners.</p>
              </div>
            ) : null}

            <div className="adminProjectsFieldPanel">
              <label className="label forumToolbar__labelIcon" htmlFor="admin-project-supervisors">
                <Users size={15} strokeWidth={2} aria-hidden /> Assigned supervisors
              </label>
              <select
                id="admin-project-supervisors"
                className="select adminProjectsMultiSelect"
                multiple
                value={draft.supervisors}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
                  setDraft((prev) => ({ ...prev, supervisors: selected }));
                }}
                disabled={busy || supervisors.length === 0}
                aria-describedby="admin-project-supervisors-hint"
              >
                {supervisors.map((supervisor) => (
                  <option key={supervisor._id} value={supervisor._id}>
                    {supervisor.name} ({supervisor.email})
                  </option>
                ))}
              </select>
              <p id="admin-project-supervisors-hint" className="helper adminProjectsFieldHint">
                {supervisors.length === 0
                  ? "No supervisor accounts yet. Create users first, then attach them here."
                  : "Multi-select: hold Ctrl (Windows) or ⌘ (Mac) while clicking names."}
              </p>
            </div>

            <div className="actions adminProjectsFormActions">
              <button type="submit" className="button buttonPrimary buttonInlineIcon" disabled={busy}>
                <Plus size={18} strokeWidth={2} aria-hidden /> Create project
              </button>
              <button
                type="button"
                className="button buttonInlineIcon"
                onClick={onUpdate}
                disabled={busy || !selectedProjectId}
              >
                <Save size={17} strokeWidth={2} aria-hidden /> Save changes
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="card studentOverviewCard adminProjectsCatalogCard" aria-labelledby="admin-projects-catalog-heading">
        <header className="studentOverviewCard__header adminProjectsCatalogHead">
          <div className="supervisorSetupCard__intro adminProjectsCatalogHead__intro">
            <span className="supervisorSetupCard__introIcon adminProjectsCatalogHead__icon" aria-hidden>
              <Layers size={22} strokeWidth={2} />
            </span>
            <div>
              <p className="studentOverviewCard__eyebrow">Directory</p>
              <h2 id="admin-projects-catalog-heading" className="cardTitle">
                All projects
              </h2>
              <p className="cardHint">{projects.length === 1 ? "1 project in the system." : `${projects.length} projects in the system.`}</p>
            </div>
          </div>
        </header>

        <div className="studentOverviewCard__body adminProjectsCatalogBody">
          {projects.length === 0 ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact adminProjectsEmpty">
              <p className="studentOverviewEmpty__title">No projects yet</p>
              <p className="studentOverviewEmpty__text">Use the governance form to create the first project and assign supervisors.</p>
            </div>
          ) : (
            <div className={catalogScrollable ? "adminProjectsCatalogScroll" : undefined}>
              <ul className="adminListCardList">
                {projects.map((project) => {
                  const supervisorLine = (project.supervisors || []).map((s) => s.name || s.email).join(", ");
                  const isSelected = selectedProjectId === project._id;
                  const statusLabel = formatStatusLabel(project.status);

                  return (
                    <li
                      key={project._id}
                      className={`adminListCard${isSelected ? " adminListCard--selected" : ""}`}
                    >
                      <div className="adminListCard__body adminListCard__body--withGlyph">
                        <span className="adminListCard__glyph" aria-hidden>
                          <FolderKanban size={22} strokeWidth={2} />
                        </span>
                        <div className="adminListCard__inner">
                          <div className="adminListCard__top">
                            <h3 className="adminListCard__title">{project.title}</h3>
                            <div className="adminListCard__pills" aria-label="Project status">
                              <span
                                className={`adminListCard__pill ${
                                  project.approved ? "adminListCard__pill--approved" : "adminListCard__pill--pending"
                                }`}
                              >
                                {project.approved ? "Approved" : "Pending approval"}
                              </span>
                              <span className="adminListCard__pill adminListCard__pill--status">{statusLabel}</span>
                            </div>
                          </div>
                          <p className="adminListCard__desc">{project.description}</p>
                          <div className="adminListCard__meta">
                            <div className="adminListCard__metaRow">
                              <p className="adminListCard__metaLabel adminListCard__metaLabel--icon">
                                <Users size={13} strokeWidth={2} className="adminListCard__metaIco" aria-hidden /> Supervisors
                              </p>
                              <p className="adminListCard__metaValue">{supervisorLine || "None assigned"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="adminListCard__footer">
                        <button
                          type="button"
                          className="button buttonInlineIcon"
                          aria-pressed={isSelected}
                          onClick={() => {
                            const supervisorIds = (project.supervisors || []).map((s) => (typeof s === "string" ? s : s._id));
                            setSelectedProjectId(project._id);
                            setDraft({
                              title: project.title,
                              description: project.description,
                              status: project.status || "available",
                              supervisors: supervisorIds,
                            });
                          }}
                        >
                          <Pencil size={16} strokeWidth={2} aria-hidden />
                          {isSelected ? "Selected" : "Edit in form"}
                        </button>
                        {!project.approved ? (
                          <button
                            type="button"
                            className="button buttonPrimary buttonInlineIcon"
                            onClick={() => withAction(() => approveProject(project._id), "Project approved.")}
                            disabled={busy}
                          >
                            <CheckCircle size={17} strokeWidth={2} aria-hidden /> Approve
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className="button buttonDanger buttonInlineIcon"
                          onClick={() =>
                            setDeleteTarget({
                              id: project._id,
                              title: project.title,
                            })
                          }
                          disabled={busy}
                        >
                          <Trash2 size={16} strokeWidth={2} aria-hidden /> Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete project?"
        message={
          deleteTarget
            ? `Are you sure you want to delete “${deleteTarget.title}”? This action cannot be undone.`
            : ""
        }
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        busy={busy}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget?.id) return;
          const id = deleteTarget.id;
          await withAction(() => deleteProject(id), "Project deleted.");
          setDeleteTarget(null);
          if (selectedProjectId === id) {
            setSelectedProjectId("");
            setDraft({ title: "", description: "", status: "available", supervisors: [] });
          }
        }}
      />
    </div>
  );
};

export default AdminProjectsPage;
