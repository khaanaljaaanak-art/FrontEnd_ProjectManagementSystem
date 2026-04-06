import { useMemo, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useAssessments } from "../../hooks/useAssessments";
import { useSubmissions } from "../../hooks/useSubmissions";
import { gradeSubmission } from "../../services/submissionService";
import { fetchRubricByAssessment } from "../../services/supervisorService";
import ProjectSelector from "../../components/dashboard/ProjectSelector";
import AssessmentList from "../../components/dashboard/AssessmentList";
import SubmissionTable from "../../components/dashboard/SubmissionTable";
import ErrorMessage from "../../components/common/ErrorMessage";

const SupervisorGradingPage = () => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [grading, setGrading] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [rubric, setRubric] = useState(null);

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const {
    assessments,
    loading: loadingAssessments,
    error: assessmentError,
  } = useAssessments(selectedProjectId);

  const selectedAssessment = useMemo(
    () => assessments.find((assessment) => assessment._id === selectedAssessmentId) || null,
    [assessments, selectedAssessmentId]
  );

  const {
    submissions,
    loading: loadingSubmissions,
    error: submissionError,
    refresh: refreshSubmissions,
    setSubmissions,
  } = useSubmissions(selectedAssessmentId);

  const selectAssessment = async (assessmentId) => {
    setSelectedAssessmentId(assessmentId);
    setRubric(null);
    setError("");
    try {
      const rubricData = await fetchRubricByAssessment(assessmentId);
      setRubric(rubricData);
    } catch (_e) {
      setError("Unable to load rubric for this assessment.");
    }
  };

  const onSave = async (submissionId) => {
    const draft = grading[submissionId] || { marks: "", feedback: "" };
    const marks = draft.marks === "" ? null : Number(draft.marks);

    if (marks === null || Number.isNaN(marks)) {
      setError("Enter valid marks before saving.");
      return;
    }

    setBusy(true);
    setError("");
    setMessage("");
    try {
      const updated = await gradeSubmission(submissionId, {
        marks,
        feedback: draft.feedback || "",
      });
      setSubmissions((prev) => prev.map((item) => (item._id === updated._id ? updated : item)));
      setMessage("Assessment evaluation saved.");
      await refreshSubmissions();
    } catch (_e) {
      setError("Failed to save evaluation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid2">
      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Assigned Projects</p>
            <p className="cardHint">Select a project and assessment to evaluate</p>
          </div>
        </div>

        <ProjectSelector
          selectedProjectId={selectedProjectId}
          onSelect={(project) => {
            setSelectedProjectId(project?._id || "");
            setSelectedAssessmentId("");
            setRubric(null);
          }}
        />

        <div style={{ marginTop: 12 }}>
          <AssessmentList
            assessments={assessments}
            loading={loadingAssessments}
            error={assessmentError}
            disabled={!selectedProject?._id}
            selectedAssessmentId={selectedAssessmentId}
            onSelect={selectAssessment}
            selectedAssessment={selectedAssessment}
            helper={!selectedProject?._id ? "Select a project first." : ""}
          />
        </div>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Marking Rubric</p>
            <p className="cardHint">Use rubric criteria for consistent grading</p>
          </div>
        </div>

        {!selectedAssessmentId && <p className="helper">Choose an assessment to load rubric.</p>}

        {rubric && (
          <ul className="list">
            {(rubric.criteria || []).map((criterion, index) => (
              <li key={`${criterion.title}-${index}`} className="item">
                <p className="itemTitle">{criterion.title}</p>
                <p className="itemMeta">{criterion.description}</p>
                <p className="helper">Max Marks: {criterion.maxMarks}</p>
              </li>
            ))}
            <li className="item">
              <p className="helper">Total Marks: {rubric.totalMarks}</p>
            </li>
          </ul>
        )}
      </div>

      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Submissions and Feedback</p>
            <p className="cardHint">Evaluate, mark, and comment on student submissions</p>
          </div>
        </div>

        <ErrorMessage message={error || submissionError} />
        {message && <p className="helper">{message}</p>}
        {busy && <p className="helper">Saving evaluation…</p>}
        {loadingSubmissions && <p className="helper">Loading submissions…</p>}

        {!loadingSubmissions && selectedAssessmentId && submissions.length === 0 && (
          <p className="helper">No submissions for this assessment yet.</p>
        )}

        <SubmissionTable
          submissions={submissions}
          grading={grading}
          onChangeDraft={(submissionId, value) =>
            setGrading((prev) => ({ ...prev, [submissionId]: value }))
          }
          onSave={onSave}
        />
      </div>
    </div>
  );
};

export default SupervisorGradingPage;
