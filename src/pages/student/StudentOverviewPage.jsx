import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { assignProjectAsStudent, fetchStudentOverview } from "../../services/studentService";
import ConfirmDialog from "../../components/common/ConfirmDialog";

const StudentOverviewPage = () => {
  const [overview, setOverview] = useState({ assignedProject: null, availableProjects: [], admins: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [assignTarget, setAssignTarget] = useState(null);
  const [activeTab, setActiveTab] = useState("assigned");

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

  const supervisorNames = (supervisors) =>
    (supervisors || []).map((s) => s.name).filter(Boolean).join(", ") || "—";

  return (
    <div className="grid">
      <section className="card studentOverviewCard" aria-labelledby="student-projects-heading">
        <header className="studentOverviewCard__header studentOverviewCard__header--split">
          <div>
            <p className="studentOverviewCard__eyebrow">Projects</p>
            <h2 id="student-projects-heading" className="cardTitle">
              Project overview
            </h2>
            <p className="cardHint">Assigned projects, available projects, and admin contacts.</p>
          </div>
          <button
            type="button"
            className="button buttonRefresh"
            onClick={load}
            disabled={loading}
            aria-busy={loading}
          >
            Refresh
          </button>
        </header>

        <div className="studentOverviewCard__body">
          <ErrorMessage message={error} />
          {message && <p className="studentOverviewBanner studentOverviewBanner--success">{message}</p>}
          {loading && (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading overview…
            </p>
          )}

          {!loading && (
            <div className="studentTabs">
              <div className="studentTabs__list" role="tablist" aria-label="Project overview sections">
                <button
                  type="button"
                  role="tab"
                  className={`studentTabs__tab${activeTab === "assigned" ? " isActive" : ""}`}
                  aria-selected={activeTab === "assigned"}
                  onClick={() => setActiveTab("assigned")}
                >
                  Assigned
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`studentTabs__tab${activeTab === "available" ? " isActive" : ""}`}
                  aria-selected={activeTab === "available"}
                  onClick={() => setActiveTab("available")}
                >
                  Available
                </button>
                <button
                  type="button"
                  role="tab"
                  className={`studentTabs__tab${activeTab === "contacts" ? " isActive" : ""}`}
                  aria-selected={activeTab === "contacts"}
                  onClick={() => setActiveTab("contacts")}
                >
                  Contacts
                </button>
              </div>

              {activeTab === "assigned" && (
                <div role="tabpanel" className="studentTabs__panel">
                  {!overview.assignedProject && (
                    <div className="studentOverviewEmpty">
                      <p className="studentOverviewEmpty__title">No project assigned</p>
                      <p className="studentOverviewEmpty__text">
                        When you are ready, select an approved project from the available list. Your choice will be
                        recorded and supervisors will be able to see your enrollment.
                      </p>
                    </div>
                  )}

                  {overview.assignedProject && (
                    <article className="studentAssignedBlock">
                      <h3 className="studentAssignedBlock__title">{overview.assignedProject.title}</h3>
                      {overview.assignedProject.description ? (
                        <p className="studentAssignedBlock__desc">{overview.assignedProject.description}</p>
                      ) : null}
                      <div className="studentAssignedBlock__section">
                        <p className="studentAssignedBlock__label">Supervising staff</p>
                        {(overview.assignedProject.supervisors || []).length > 0 ? (
                          <ul className="studentSupervisorList">
                            {(overview.assignedProject.supervisors || []).map((supervisor) => (
                              <li key={supervisor._id} className="studentSupervisorChip">
                                <span className="studentSupervisorChip__avatar" aria-hidden>
                                  {(supervisor.name || "?").trim().charAt(0).toUpperCase()}
                                </span>
                                <span className="studentSupervisorChip__text">
                                  <span className="studentSupervisorChip__name">{supervisor.name}</span>
                                  <span className="studentSupervisorChip__email">{supervisor.email}</span>
                                </span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="studentAssignedBlock__empty">No supervisors are linked to this project yet.</p>
                        )}
                      </div>
                    </article>
                  )}
                </div>
              )}

              {activeTab === "available" && (
                <div role="tabpanel" className="studentTabs__panel">
                  {(overview.availableProjects || []).length > 0 && (
                    <ul className="studentProjectPickList">
                      {(overview.availableProjects || []).map((project) => (
                        <li key={project._id} className="studentProjectPick">
                          <div className="studentProjectPick__main">
                            <h3 className="studentProjectPick__title">{project.title}</h3>
                            {project.description ? (
                              <p className="studentProjectPick__desc">{project.description}</p>
                            ) : (
                              <p className="studentProjectPick__desc studentProjectPick__desc--muted">
                                No description provided.
                              </p>
                            )}
                            <p className="studentProjectPick__meta">
                              <span className="studentProjectPick__metaLabel">Supervisors</span>
                              <span className="studentProjectPick__metaValue">
                                {supervisorNames(project.supervisors)}
                              </span>
                            </p>
                          </div>
                          <div className="studentProjectPick__actions">
                            <button
                              type="button"
                              className="button buttonPrimary studentProjectPick__cta"
                              onClick={() =>
                                setAssignTarget({
                                  id: project._id,
                                  title: project.title,
                                })
                              }
                              disabled={busy || loading}
                            >
                              Choose this project
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {!loading && (overview.availableProjects || []).length === 0 && (
                    <div className="studentOverviewEmpty studentOverviewEmpty--compact">
                      <p className="studentOverviewEmpty__title">No open projects</p>
                      <p className="studentOverviewEmpty__text">
                        There are no approved projects available right now. Use refresh after your administrator
                        publishes new listings.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "contacts" && (
                <div role="tabpanel" className="studentTabs__panel">
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
              )}
            </div>
          )}
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(assignTarget)}
        title="Confirm project selection"
        message={
          assignTarget
            ? `Are you sure you want to select “${assignTarget.title}”?`
            : ""
        }
        confirmLabel="Yes, select"
        cancelLabel="Cancel"
        busy={busy}
        onCancel={() => setAssignTarget(null)}
        onConfirm={async () => {
          if (!assignTarget?.id) return;
          const id = assignTarget.id;
          setAssignTarget(null);
          await onAssign(id);
        }}
      />
    </div>
  );
};

export default StudentOverviewPage;
