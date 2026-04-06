import { useMemo, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useAssessments } from "../../hooks/useAssessments";
import {
  createAssessment,
  updateAssessment,
  deleteAssessment,
} from "../../services/assessmentService";
import ErrorMessage from "../../components/common/ErrorMessage";

const AdminAssessmentsPage = () => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [draft, setDraft] = useState({ title: "", deadline: "", extendedDeadline: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const {
    assessments,
    loading,
    error: assessmentsError,
    refresh,
  } = useAssessments(selectedProjectId);

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
    if (!selectedProjectId) {
      setError("Select a project first.");
      return;
    }

    await withAction(async () => {
      await createAssessment({
        projectId: selectedProjectId,
        title: draft.title.trim(),
        deadline: draft.deadline,
      });
      setDraft({ title: "", deadline: "", extendedDeadline: "" });
    }, "Assessment created.");
  };

  const onUpdate = async () => {
    if (!selectedAssessmentId) return;
    await withAction(async () => {
      await updateAssessment(selectedAssessmentId, {
        title: draft.title.trim() || undefined,
        deadline: draft.deadline || undefined,
        extendedDeadline: draft.extendedDeadline || null,
      });
    }, "Assessment updated.");
  };

  return (
    <div className="grid grid2">
      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Select Project</p>
            <p className="cardHint">Assessments are managed per project</p>
          </div>
        </div>

        <div className="row">
          <select
            className="select"
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSelectedAssessmentId("");
            }}
          >
            <option value="">Choose a project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.title}
              </option>
            ))}
          </select>
        </div>

        {selectedProject && (
          <p className="helper" style={{ marginTop: 10 }}>
            Selected: {selectedProject.title}
          </p>
        )}
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Assessment and Timelines</p>
            <p className="cardHint">Create, update deadlines, and delete assessments</p>
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
            disabled={busy || !selectedProjectId}
          />
          <input
            className="input"
            type="datetime-local"
            value={draft.deadline}
            onChange={(e) => setDraft((prev) => ({ ...prev, deadline: e.target.value }))}
            required
            disabled={busy || !selectedProjectId}
          />
          <input
            className="input"
            type="datetime-local"
            value={draft.extendedDeadline}
            onChange={(e) =>
              setDraft((prev) => ({ ...prev, extendedDeadline: e.target.value }))
            }
            disabled={busy || !selectedProjectId}
          />
          <div className="actions">
            <button type="submit" className="button buttonPrimary" disabled={busy || !selectedProjectId}>
              Create
            </button>
            <button
              type="button"
              className="button"
              onClick={onUpdate}
              disabled={busy || !selectedAssessmentId}
            >
              Update Selected
            </button>
            <button
              type="button"
              className="button buttonDanger"
              onClick={() =>
                withAction(() => deleteAssessment(selectedAssessmentId), "Assessment deleted.")
              }
              disabled={busy || !selectedAssessmentId}
            >
              Delete Selected
            </button>
          </div>
        </form>

        {loading && <p className="helper">Loading assessments…</p>}

        <ul className="list" style={{ marginTop: 12 }}>
          {assessments.map((assessment) => (
            <li key={assessment._id} className="item">
              <p className="itemTitle">{assessment.title}</p>
              <p className="itemMeta">Deadline: {new Date(assessment.deadline).toLocaleString()}</p>
              {assessment.extendedDeadline && (
                <p className="itemMeta">
                  Extended: {new Date(assessment.extendedDeadline).toLocaleString()}
                </p>
              )}
              <button
                type="button"
                className="button"
                onClick={() => {
                  setSelectedAssessmentId(assessment._id);
                  setDraft({
                    title: assessment.title,
                    deadline: assessment.deadline
                      ? new Date(assessment.deadline).toISOString().slice(0, 16)
                      : "",
                    extendedDeadline: assessment.extendedDeadline
                      ? new Date(assessment.extendedDeadline).toISOString().slice(0, 16)
                      : "",
                  });
                }}
              >
                Select
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminAssessmentsPage;
