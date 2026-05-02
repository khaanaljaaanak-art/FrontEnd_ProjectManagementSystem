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
  allowResubmit = false,
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
    (alreadySubmitted && !allowResubmit) ||
    deadlinePassed ||
    tooManyFiles ||
    (!hasUrl && !hasFiles);

  let disabledReason = "";
  if (!selectedProject?._id) disabledReason = "Select a project to continue.";
  else if (!selectedAssessmentId) disabledReason = "Select an assessment to submit.";
  else if (deadlinePassed) disabledReason = "Deadline has passed. Submissions are closed.";
  else if (alreadySubmitted && !allowResubmit) disabledReason = "You have already submitted for this assessment.";

  const inputsLocked = submitting || (alreadySubmitted && !allowResubmit) || deadlinePassed;

  return (
    <form className="studentSubmissionForm" onSubmit={onSubmit}>
      <div className="studentSubmissionForm__fields">
        <div className="studentSubmissionForm__group">
          <label className="label" htmlFor="submission-file-url">
            File URL
          </label>
          <input
            id="submission-file-url"
            className="input"
            type="url"
            placeholder="https://..."
            value={fileUrl}
            onChange={(e) => onChangeFileUrl(e.target.value)}
            disabled={inputsLocked}
          />
          <p className="studentSubmissionFieldHint">Link to a hosted file (Drive, Dropbox, GitHub, etc.).</p>
        </div>

        <div className="studentSubmissionForm__divider">
          <span className="studentSubmissionForm__dividerText">or upload files</span>
        </div>

        <div className="studentSubmissionForm__group">
          <label className="label" htmlFor="submission-files">
            Upload files (max 3)
          </label>
          <input
            id="submission-files"
            className="input studentSubmissionFileInput"
            type="file"
            multiple
            onChange={(e) => onChangeFiles(e.target.files)}
            disabled={inputsLocked}
          />
          {filesCount > 0 ? (
            <p className="studentSubmissionFileCount">
              {filesCount} file{filesCount === 1 ? "" : "s"} selected
            </p>
          ) : (
            <p className="studentSubmissionFieldHint">Up to three files. If you use a URL above, files are optional.</p>
          )}
          {tooManyFiles ? <p className="error">You can upload at most 3 files.</p> : null}
        </div>
      </div>

      {disabledReason ? <p className="studentSubmissionDisabledNote">{disabledReason}</p> : null}

      <div className="studentSubmissionForm__submit">
        <button type="submit" className="button buttonPrimary studentSubmissionSubmitBtn" disabled={submitDisabled}>
          {submitting ? "Submitting…" : alreadySubmitted && allowResubmit ? "Resubmit" : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default SubmissionForm;
