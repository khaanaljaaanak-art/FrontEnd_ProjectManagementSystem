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
}) => {
  return (  
    <div>
      <label className="label">Assessment</label>
      <select
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
        <p className="helper">Deadline: {new Date(selectedAssessment.deadline).toLocaleString()}</p>
      )}

      {helper && <p className="helper">{helper}</p>}
      {loading && <p className="helper">Loading assessments…</p>}
      <ErrorMessage message={error} />

      {!loading && !error && !disabled && assessments.length === 0 && (
        <p className="helper">No assessments available for this project.</p>
      )}
    </div>
  );
};

export default AssessmentList;
