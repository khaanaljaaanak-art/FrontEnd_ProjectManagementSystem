const isPastDeadline = (assessment) => {
  if (!assessment?.deadline) return false;
  return Date.now() > new Date(assessment.deadline).getTime();
};

const SubmissionForm = ({
  selectedProject,
  selectedAssessment,
  selectedAssessmentId,
  fileUrl,
  onChangeFileUrl,
  files,
  onChangeFiles,
  onSubmit,
  submitting,
  alreadySubmitted,
}) => {
  const deadlinePassed = isPastDeadline(selectedAssessment);

  const filesCount = files?.length || 0;
  const tooManyFiles = filesCount > 3;
  const hasUrl = Boolean(fileUrl && fileUrl.trim());
  const hasFiles = filesCount > 0;

  const submitDisabled =
    submitting ||
    !selectedProject?._id ||
    !selectedAssessmentId ||
    alreadySubmitted ||
    deadlinePassed ||
    tooManyFiles ||
    (!hasUrl && !hasFiles);

  let disabledReason = "";
  if (!selectedProject?._id) disabledReason = "Select a project to continue.";
  else if (!selectedAssessmentId) disabledReason = "Select an assessment to submit.";
  else if (deadlinePassed) disabledReason = "Deadline has passed. Submissions are closed.";
  else if (alreadySubmitted) disabledReason = "You have already submitted for this assessment.";

  return (
    <form onSubmit={onSubmit}>
      <div className="row">
        <div>
          <label className="label">File URL</label>
          <input
            className="input"
            type="url"
            placeholder="https://..."
            value={fileUrl}
            onChange={(e) => onChangeFileUrl(e.target.value)}
            disabled={submitting || alreadySubmitted || deadlinePassed}
          />
          <p className="helper" style={{ marginTop: 8 }}>
            Or upload up to 3 files below.
          </p>

          <label className="label" style={{ marginTop: 10 }}>Upload Files (max 3)</label>
          <input
            className="input"
            type="file"
            multiple
            onChange={(e) => onChangeFiles(e.target.files)}
            disabled={submitting || alreadySubmitted || deadlinePassed}
          />

          {filesCount > 0 && (
            <p className="helper">Selected: {filesCount} file(s)</p>
          )}
          {tooManyFiles && (
            <p className="error">You can upload at most 3 files.</p>
          )}

          {disabledReason && <p className="helper">{disabledReason}</p>}
        </div>
      </div>

      <div className="actions" style={{ marginTop: 14 }}>
        <button
          type="submit"
          className="button buttonPrimary"
          disabled={submitDisabled}
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default SubmissionForm;
