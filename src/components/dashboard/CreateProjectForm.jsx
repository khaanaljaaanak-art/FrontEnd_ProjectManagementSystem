import ErrorMessage from "../common/ErrorMessage";

const CreateProjectForm = ({
  draft,
  onChange,
  onSubmit,
  submitting,
  message,
  error,
}) => {
  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">Create Project</p>
          <p className="cardHint">Add a new project for students</p>
        </div>
      </div>

      <form onSubmit={onSubmit}>
        <div className="row">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              value={draft.title}
              onChange={(e) => onChange({ ...draft, title: e.target.value })}
              placeholder="Project title"
              required
              disabled={submitting}
            />
          </div>
          <div>
            <label className="label">Description</label>
            <textarea
              className="textarea"
              value={draft.description}
              onChange={(e) => onChange({ ...draft, description: e.target.value })}
              placeholder="What is this project about?"
              required
              disabled={submitting}
            />
          </div>
        </div>

        <div className="actions" style={{ marginTop: 14 }}>
          <button
            className="button buttonPrimary"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Creating…" : "Create Project"}
          </button>
          {message && <span className="helper">{message}</span>}
        </div>

        <ErrorMessage message={error} />
      </form>
    </div>
  );
};

export default CreateProjectForm;
