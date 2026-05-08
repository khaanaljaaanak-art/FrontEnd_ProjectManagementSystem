import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../../../components/common/ErrorMessage";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { useProjects } from "../../../context/ProjectContext";
import { useAssessments } from "../../../hooks/useAssessments";
import {
  createAssessment,
  deleteAssessment,
  updateAssessment,
} from "../../../services/assessmentService";

const AdminAssessmentTimelinePage = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { projects } = useProjects();

  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [draft, setDraft] = useState({ title: "", deadline: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === projectId) || null,
    [projects, projectId]
  );

  const {
    assessments,
    loading,
    error: assessmentsError,
    refresh,
  } = useAssessments(projectId);

  const withAction = async (fn, successMessage) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      if (successMessage) setMessage(successMessage);
      await refresh();
    } catch (e) {
      setError(e?.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async (event) => {
    event.preventDefault();
    if (!projectId) {
      setError("Select a project first.");
      return;
    }

    await withAction(async () => {
      await createAssessment({
        projectId,
        title: draft.title.trim(),
        deadline: draft.deadline,
      });
      setDraft({ title: "", deadline: "" });
      setSelectedAssessmentId("");
    }, "Assessment created.");
  };

  const onUpdate = async () => {
    if (!selectedAssessmentId) return;
    await withAction(async () => {
      await updateAssessment(selectedAssessmentId, {
        title: draft.title.trim() || undefined,
        deadline: draft.deadline || undefined,
      });
    }, "Assessment updated.");
  };

  const onDelete = async () => {
    if (!selectedAssessmentId) return;
    await withAction(async () => {
      await deleteAssessment(selectedAssessmentId);
      setSelectedAssessmentId("");
      setDraft({ title: "", deadline: "" });
    }, "Assessment deleted.");
  };

  const selectedAssessment = useMemo(
    () => assessments.find((a) => a._id === selectedAssessmentId) || null,
    [assessments, selectedAssessmentId]
  );

  const selectAssessment = (assessment) => {
    setSelectedAssessmentId(assessment._id);
    setDraft({
      title: assessment.title,
      deadline: assessment.deadline
        ? new Date(assessment.deadline).toISOString().slice(0, 16)
        : "",
    });
  };

  const clearSelection = () => {
    setSelectedAssessmentId("");
    setDraft({ title: "", deadline: "" });
  };

  return (
    <div className="workflow">
      <header className="workflowHeader">
        <div>
          <div className="workflowHeaderLeft">
            <span className="stepBadge">Step 2</span>
            <h3 className="workflowTitle">Manage Assessment Timeline</h3>
          </div>
          <p className="workflowHint">
            {selectedProject
              ? `Project: ${selectedProject.title}`
              : "Manage assessments and deadlines for the selected project."}
          </p>
        </div>
        <button type="button" className="button" onClick={() => navigate("/admin/assessments/select")}>
          Change project
        </button>
      </header>

      <div className="assessmentTimelineGrid">
        <section className="card assessmentTimelineList" aria-label="Assessment list">
          <div className="cardHeader">
            <div>
              <p className="cardTitle">Assessments</p>
              <p className="cardHint">
                {assessments.length} item{assessments.length === 1 ? "" : "s"} · Click a row to edit
              </p>
            </div>
            {selectedAssessmentId ? (
              <button type="button" className="button" onClick={clearSelection} disabled={busy}>
                Clear selection
              </button>
            ) : null}
          </div>

          {loading && <p className="helper">Loading assessments…</p>}

          {!loading && assessments.length === 0 ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No assessments yet</p>
              <p className="studentOverviewEmpty__text">
                Create the first assessment on the right to start tracking deadlines for this project.
              </p>
            </div>
          ) : null}

          {!loading && assessments.length > 0 ? (
            <ul className="assessmentPickList" aria-label="Assessment list">
              {assessments.map((assessment) => {
                const isSelected = assessment._id === selectedAssessmentId;
                const created = assessment.deadline ? new Date(assessment.deadline) : null;
                const iso =
                  created && !Number.isNaN(created.getTime()) ? created.toISOString() : undefined;
                const label =
                  created && !Number.isNaN(created.getTime())
                    ? created.toLocaleString()
                    : "—";

                return (
                  <li key={assessment._id}>
                    <button
                      type="button"
                      className={`assessmentPick${isSelected ? " assessmentPick--selected" : ""}`}
                      onClick={() => selectAssessment(assessment)}
                      disabled={busy}
                      aria-pressed={isSelected}
                    >
                      <span className="assessmentPick__main">
                        <span className="assessmentPick__title">{assessment.title}</span>
                        <span className="assessmentPick__meta">
                          Deadline{" "}
                          <time dateTime={iso} className="assessmentPick__when">
                            {label}
                          </time>
                        </span>
                      </span>
                      <span className="assessmentPick__cta">
                        {isSelected ? "Editing" : "Edit"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </section>

        <section className="card assessmentTimelineEditor" aria-label="Assessment editor">
          <div className="cardHeader">
            <div>
              <p className="cardTitle">{selectedAssessmentId ? "Edit assessment" : "Create assessment"}</p>
              <p className="cardHint">
                {selectedAssessmentId
                  ? "Update the title or deadline, then save changes."
                  : "Create a new assessment milestone and deadline."}
              </p>
            </div>
          </div>

          <ErrorMessage message={error || assessmentsError} />
          {message && <p className="helper">{message}</p>}

          <form className="row" onSubmit={onCreate}>
            <input
              className="input"
              placeholder="Assessment title"
              value={draft.title}
              onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
              required
              disabled={busy || !projectId}
            />
            <input
              className="input"
              type="datetime-local"
              value={draft.deadline}
              onChange={(e) => setDraft((prev) => ({ ...prev, deadline: e.target.value }))}
              required
              disabled={busy || !projectId}
            />

            <div className="actions">
              {!selectedAssessmentId ? (
                <button type="submit" className="button buttonPrimary" disabled={busy || !projectId}>
                  Create assessment
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="button buttonPrimary"
                    onClick={onUpdate}
                    disabled={busy || !selectedAssessmentId}
                  >
                    Save changes
                  </button>
                  <button
                    type="button"
                    className="button"
                    onClick={clearSelection}
                    disabled={busy}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="button buttonDanger"
                    onClick={() => setConfirmDelete(true)}
                    disabled={busy || !selectedAssessmentId}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </form>
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete assessment?"
        message={
          selectedAssessment
            ? `Are you sure you want to delete “${selectedAssessment.title}”? This action cannot be undone.`
            : "Are you sure you want to delete this assessment? This action cannot be undone."
        }
        confirmLabel="Yes, delete"
        cancelLabel="Cancel"
        busy={busy}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          setConfirmDelete(false);
          await onDelete();
        }}
      />
    </div>
  );
};

export default AdminAssessmentTimelinePage;

