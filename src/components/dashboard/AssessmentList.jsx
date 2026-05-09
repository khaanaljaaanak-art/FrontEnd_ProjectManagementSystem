import ErrorMessage from "../common/ErrorMessage";

const AssessmentList = ({
  assessments,
  loading,
  error,
  disabled,
  selectedAssessmentId,
  onSelect,
  selectedAssessment,
  helper,
  className = "",
  selectId = "assessment-select",
  visibleLabel = true,
}) => {
  return (
    <div className={className || undefined}>
      <label className={visibleLabel ? "label" : "srOnly"} htmlFor={selectId}>
        Assessment
      </label>
      <select
        id={selectId}
        className="select"
        value={selectedAssessmentId}
        onChange={(e) => onSelect(e.target.value)}
        disabled={disabled || loading}
      >
        <option value="">Select an assessment</option>
        {assessments.map((a) => (
          <option key={a._id} value={a._id}>
            {a.title}
          </option>
        ))}
      </select>

      {selectedAssessment?.deadline && (
        <p className={className ? "studentSubmissionDeadline" : "helper"}>
          {className ? (
            <>
              <span className="studentSubmissionDeadline__label">Deadline</span>
              {new Date(selectedAssessment.deadline).toLocaleString()}
            </>
          ) : (
            <>Deadline: {new Date(selectedAssessment.deadline).toLocaleString()}</>
          )}
        </p>
      )}

      {helper ? (
        <p className={className ? "studentSubmissionFieldHint" : "helper"}>{helper}</p>
      ) : null}
      {loading ? (
        className ? (
          <p className="studentOverviewStatus studentSubmissionAssess__status" role="status">
            <span className="studentOverviewSpinner" aria-hidden />
            Loading assessments…
          </p>
        ) : (
          <p className="helper">Loading assessments…</p>
        )
      ) : null}
      <ErrorMessage message={error} />

      {!loading && !error && !disabled && assessments.length === 0 && (
        <p className={className ? "studentSubmissionFieldHint" : "helper"}>
          No assessments available for this project.
        </p>
      )}
    </div>
  );
};

export default AssessmentList;
