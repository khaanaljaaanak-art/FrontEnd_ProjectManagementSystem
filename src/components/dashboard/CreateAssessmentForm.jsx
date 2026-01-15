import ErrorMessage from "../common/ErrorMessage";

const CreateAssessmentForm = ({
  selectedProject,
  draft,
  onChange,
  onSubmit,
  submitting,
  message,
  error,
  loadingAssessments,
  assessmentsEmpty,
}) => {
  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">Create Assessment</p>
          <p className="cardHint">Create an assessment under the selected project</p>
        </div>
      </div>

      {!selectedProject?._id && (
        <p className="helper">Select a project from the list to create an assessment.</p>
      )}

      <form onSubmit={onSubmit}>
        <div className="row row2">
          <div>
            <label className="label">Assessment Title</label>
            <input
              className="input"
              value={draft.title}
              onChange={(e) => onChange({ ...draft, title: e.target.value })}
              placeholder="Assessment title"
              required
              disabled={submitting || !selectedProject?._id}
            />
          </div>
          <div>
            <label className="label">Deadline</label>
            <input
              className="input"
              type="datetime-local"
              value={draft.deadline}
              onChange={(e) => onChange({ ...draft, deadline: e.target.value })}
              required
              disabled={submitting || !selectedProject?._id}
            />
          </div>
        </div>

        <div className="actions" style={{ marginTop: 14 }}>
          <button
            className="button buttonPrimary"
            type="submit"
            disabled={submitting || !selectedProject?._id}
          >
            {submitting ? "Creating…" : "Create Assessment"}
          </button>
          {message && <span className="helper">{message}</span>}
        </div>

        <ErrorMessage message={error} />
        {loadingAssessments && <p className="helper">Loading assessments…</p>}
        {!loadingAssessments && selectedProject && assessmentsEmpty && (
          <p className="helper">No assessments for this project yet.</p>
        )}
      </form>
    </div>
  );
};

export default CreateAssessmentForm;
