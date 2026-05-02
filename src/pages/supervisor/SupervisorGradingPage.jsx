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
  const [rubricLoading, setRubricLoading] = useState(false);

  const currentUserId = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id || "";
    } catch (_e) {
      return "";
    }
  }, []);

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
    if (!assessmentId) {
      setRubricLoading(false);
      return;
    }
    setRubricLoading(true);
    try {
      const rubricData = await fetchRubricByAssessment(assessmentId);
      setRubric(rubricData);
    } catch (_e) {
      setError("Unable to load rubric for this assessment.");
    } finally {
      setRubricLoading(false);
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
      setMessage("Evaluation saved.");
      await refreshSubmissions();
    } catch (_e) {
      const apiMessage = _e?.response?.data?.message;
      setError(apiMessage || "Failed to save evaluation.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid grid2 supervisorGradingGrid">
      <section className="card studentOverviewCard" aria-labelledby="sup-grade-scope-heading">
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Setup</p>
            <h2 id="sup-grade-scope-heading" className="cardTitle">
              Evaluation scope
            </h2>
            <p className="cardHint">Select the project and assessment you are marking. Submissions and the rubric load for that task.</p>
          </div>
        </header>

        <div className="studentOverviewCard__body">
          <div className="supervisorPickColumn">
            <ProjectSelector
              embedded
              selectedProjectId={selectedProjectId}
              onSelect={(project) => {
                setSelectedProjectId(project?._id || "");
                setSelectedAssessmentId("");
                setRubric(null);
              }}
            />

            <AssessmentList
              selectId="grading-assessment-select"
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
      </section>

      <section className="card studentOverviewCard supervisorGradingRubricCard" aria-labelledby="sup-grade-rubric-heading">
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Scheme</p>
            <h2 id="sup-grade-rubric-heading" className="cardTitle">
              Marking rubric
            </h2>
            <p className="cardHint">Criteria and maximum marks for the selected assessment.</p>
          </div>
        </header>

        <div className="studentOverviewCard__body">
          {rubricLoading ? (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading rubric…
            </p>
          ) : null}

          {!selectedAssessmentId && !rubricLoading ? (
            <div className="studentCommThreadPlaceholder studentCommThreadPlaceholder--subtle">
              <p className="studentCommThreadPlaceholder__title">No assessment selected</p>
              <p className="studentCommThreadPlaceholder__text">Choose an assessment on the left to load its rubric.</p>
            </div>
          ) : null}

          {selectedAssessmentId && !rubricLoading && !rubric ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No rubric loaded</p>
              <p className="studentOverviewEmpty__text">
                This assessment may not have a rubric yet, or loading failed—see any error above.
              </p>
            </div>
          ) : null}

          {rubric ? (
            <div className="studentRubricBlock supervisorGradingRubricBody">
              <div className="studentRubricBlock__head">
                <span className="studentRubricBlock__title">Rubric criteria</span>
                <span className="studentRubricBlock__meta">{rubric.totalMarks} pts maximum</span>
              </div>
              <ul className="studentRubricCriteria">
                {(rubric.criteria || []).map((criterion, index) => (
                  <li key={`${criterion.title}-${index}`} className="studentRubricCriterion">
                    <div className="studentRubricCriterion__top">
                      <span className="studentRubricCriterion__title">{criterion.title}</span>
                      <span className="studentRubricCriterion__max">Max {criterion.maxMarks}</span>
                    </div>
                    {criterion.description ? (
                      <p className="studentRubricCriterion__desc">{criterion.description}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section
        className="card studentOverviewCard supervisorGradingSubmissionsCard"
        style={{ gridColumn: "1 / -1" }}
        aria-labelledby="sup-grade-submissions-heading"
      >
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Queue</p>
            <h2 id="sup-grade-submissions-heading" className="cardTitle">
              Submissions and feedback
            </h2>
            <p className="cardHint">Open student files, enter marks and feedback, then save. Your row locks after you submit a grade.</p>
          </div>
        </header>

        <div className="studentOverviewCard__body">
          <ErrorMessage message={error || submissionError} />

          {message ? (
            <p className="studentOverviewBanner studentOverviewBanner--success supervisorGradingBanner">{message}</p>
          ) : null}

          {busy ? (
            <p className="studentOverviewStatus supervisorGradingStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Saving evaluation…
            </p>
          ) : null}

          {loadingSubmissions ? (
            <p className="studentOverviewStatus supervisorGradingStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading submissions…
            </p>
          ) : null}

          {!loadingSubmissions && selectedAssessmentId && submissions.length === 0 ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No submissions yet</p>
              <p className="studentOverviewEmpty__text">Nothing to grade for this assessment. Check back after students submit.</p>
            </div>
          ) : null}

          {!loadingSubmissions && !selectedAssessmentId ? (
            <div className="studentCommThreadPlaceholder studentCommThreadPlaceholder--subtle">
              <p className="studentCommThreadPlaceholder__title">Select an assessment</p>
              <p className="studentCommThreadPlaceholder__text">Pick an assessment above to load its submission queue.</p>
            </div>
          ) : null}

          <SubmissionTable
            submissions={submissions}
            grading={grading}
            currentUserId={currentUserId}
            onChangeDraft={(submissionId, value) =>
              setGrading((prev) => ({ ...prev, [submissionId]: value }))
            }
            onSave={onSave}
            disabled={busy}
          />
        </div>
      </section>
    </div>
  );
};

export default SupervisorGradingPage;
