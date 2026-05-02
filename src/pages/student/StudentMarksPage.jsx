import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchAssessmentStatus, fetchMarksWithRubrics } from "../../services/studentService";

const formatRole = (role) => {
  if (!role || typeof role !== "string") return "Supervisor";
  const r = role.trim();
  if (!r) return "Supervisor";
  return r.charAt(0).toUpperCase() + r.slice(1).toLowerCase();
};

const StudentMarksPage = () => {
  const [statusRows, setStatusRows] = useState([]);
  const [markRows, setMarkRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [statusData, marksData] = await Promise.all([
        fetchAssessmentStatus(),
        fetchMarksWithRubrics(),
      ]);
      setStatusRows(Array.isArray(statusData) ? statusData : []);
      setMarkRows(Array.isArray(marksData) ? marksData : []);
    } catch (_e) {
      setError("Failed to load marks and status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="grid grid2">
      <section className="card studentOverviewCard" aria-labelledby="student-status-heading">
        <header className="studentOverviewCard__header studentOverviewCard__header--split">
          <div>
            <p className="studentOverviewCard__eyebrow">Workflow</p>
            <h2 id="student-status-heading" className="cardTitle">
              Submission status
            </h2>
            <p className="cardHint">Pending, submitted, and graded assessments for your project.</p>
          </div>
          <button type="button" className="button buttonRefresh" onClick={load} disabled={loading}>
            Refresh list
          </button>
        </header>

        <div className="studentOverviewCard__body">
          <ErrorMessage message={error} />
          {loading && (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading status…
            </p>
          )}

          {!loading && (
            <ul className="studentStatusList">
              {statusRows.map((row, idx) => (
                <li key={row.assessment?._id ?? `status-${idx}`} className="studentStatusRow">
                  <p className="studentStatusRow__title">{row.assessment?.title || "Assessment"}</p>
                  <p className="studentStatusRow__meta">
                    <span className="studentStatusRow__label">Status</span>
                    <span className="studentStatusPill">{row.status || "—"}</span>
                  </p>
                  <p className="studentStatusRow__deadline">
                    <span className="studentStatusRow__label">Deadline</span>
                    {row.effectiveDeadline ? new Date(row.effectiveDeadline).toLocaleString() : "Not set"}
                  </p>
                  {row.submission?.feedback ? (
                    <p className="studentStatusRow__feedback">
                      <span className="studentStatusRow__label">Feedback</span>
                      {row.submission.feedback}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          {!loading && statusRows.length === 0 && (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No assessments</p>
              <p className="studentOverviewEmpty__text">Nothing to show yet. Check back after assessments are assigned.</p>
            </div>
          )}
        </div>
      </section>

      <section className="card studentOverviewCard" aria-labelledby="student-marks-heading">
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Results</p>
            <h2 id="student-marks-heading" className="cardTitle">
              Marks and rubrics
            </h2>
            <p className="cardHint">Official scores from evaluators and the marking scheme for each assessment.</p>
          </div>
        </header>

        <div className="studentOverviewCard__body">
          {loading && (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading marks…
            </p>
          )}

          {!loading && markRows.length === 0 && (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No marks yet</p>
              <p className="studentOverviewEmpty__text">
                Grades will appear here once submissions exist and supervisors have recorded marks.
              </p>
            </div>
          )}

          {!loading && markRows.length > 0 && (
            <ul className="studentMarkEntryList">
              {markRows.map((row, rowIndex) => {
                const submission = row.submission;
                const assessmentTitle = submission?.assessment?.title || "Assessment";
                const projectTitle = submission?.assessment?.project?.title || "Project";
                const grades = Array.isArray(submission?.grades) ? submission.grades : [];
                const entryKey = submission?._id || submission?.assessment?._id || `mark-${rowIndex}`;

                return (
                  <li key={entryKey} className="studentMarkEntry">
                    <header className="studentMarkEntry__head">
                      <h3 className="studentMarkEntry__title">{assessmentTitle}</h3>
                      <p className="studentMarkEntry__project">{projectTitle}</p>
                    </header>

                    {grades.length > 0 ? (
                      <div className="studentMarkEntry__section">
                        <p className="studentAssignedBlock__label">Evaluator marks</p>
                        <ul className="studentEvalGradeList">
                          {grades.map((grade, index) => (
                            <li
                              key={`${grade.evaluator?._id || grade.evaluator || "grade"}-${index}`}
                              className="studentEvalGrade"
                            >
                              <div className="studentEvalGrade__person">
                                <span className="studentSupervisorChip__avatar" aria-hidden>
                                  {(grade.evaluator?.name || "?").trim().charAt(0).toUpperCase()}
                                </span>
                                <div className="studentEvalGrade__personText">
                                  <span className="studentEvalGrade__name">{grade.evaluator?.name || "Evaluator"}</span>
                                  <span className="studentEvalGrade__role">{formatRole(grade.evaluatorRole)}</span>
                                </div>
                                <span
                                  className={`studentMarkScoreBadge ${
                                    grade.marks == null ? "studentMarkScoreBadge--muted" : ""
                                  }`}
                                >
                                  {grade.marks != null ? grade.marks : "—"}
                                </span>
                              </div>
                              {grade.feedback ? (
                                <div className="studentEvalGrade__feedback">
                                  <span className="studentEvalGrade__feedbackLabel">Feedback</span>
                                  <p className="studentEvalGrade__feedbackText">{grade.feedback}</p>
                                </div>
                              ) : null}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="studentMarkEntry__section">
                        <dl className="studentMarkDl">
                          <div className="studentMarkDl__row">
                            <dt>Marks</dt>
                            <dd>
                              {submission?.marks != null ? (
                                <span className="studentMarkScoreBadge">{submission.marks}</span>
                              ) : (
                                <span className="studentMarkScoreBadge studentMarkScoreBadge--muted">Not graded</span>
                              )}
                            </dd>
                          </div>
                          {submission?.feedback ? (
                            <div className="studentMarkDl__row studentMarkDl__row--block">
                              <dt>Feedback</dt>
                              <dd className="studentMarkDl__feedback">{submission.feedback}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </div>
                    )}

                    {row.rubric ? (
                      <div className="studentRubricBlock">
                        <div className="studentRubricBlock__head">
                          <span className="studentRubricBlock__title">Rubric criteria</span>
                          <span className="studentRubricBlock__meta">{row.rubric.totalMarks} pts maximum</span>
                        </div>
                        <ul className="studentRubricCriteria">
                          {(row.rubric.criteria || []).map((criterion, index) => (
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
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentMarksPage;
