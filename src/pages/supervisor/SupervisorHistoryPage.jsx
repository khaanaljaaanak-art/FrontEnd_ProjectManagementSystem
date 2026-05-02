import { useMemo, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useAssessments } from "../../hooks/useAssessments";
import ProjectSelector from "../../components/dashboard/ProjectSelector";
import AssessmentList from "../../components/dashboard/AssessmentList";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchSubmissionHistory } from "../../services/supervisorService";

const formatChangeType = (value) => {
  if (!value || typeof value !== "string") return "—";
  const key = value.trim().toLowerCase();
  const map = {
    submit: "Submit",
    grade_update: "Grade update",
    resubmit: "Resubmit",
    feedback_update: "Feedback update",
  };
  if (map[key]) return map[key];
  return value
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const SupervisorHistoryPage = () => {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [selectedAssessmentId, setSelectedAssessmentId] = useState("");
  const [historyRows, setHistoryRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId) || null,
    [projects, selectedProjectId]
  );

  const {
    assessments,
    loading: assessmentsLoading,
    error: assessmentsError,
  } = useAssessments(selectedProjectId);

  const loadHistory = async (assessmentId) => {
    setSelectedAssessmentId(assessmentId);
    setLoading(true);
    setError("");
    try {
      const data = await fetchSubmissionHistory(assessmentId);
      setHistoryRows(Array.isArray(data) ? data : []);
    } catch (_e) {
      setHistoryRows([]);
      setError("Failed to load revision history.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid2">
      <section className="card studentOverviewCard" aria-labelledby="sup-history-scope-heading">
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Scope</p>
            <h2 id="sup-history-scope-heading" className="cardTitle">
              Submission history
            </h2>
            <p className="cardHint">Pick a project and assessment to load every student revision for that task.</p>
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
                setHistoryRows([]);
              }}
            />

            <AssessmentList
              selectId="history-assessment-select"
              assessments={assessments}
              loading={assessmentsLoading}
              error={assessmentsError}
              disabled={!selectedProject?._id}
              selectedAssessmentId={selectedAssessmentId}
              onSelect={loadHistory}
              selectedAssessment={
                assessments.find((assessment) => assessment._id === selectedAssessmentId) || null
              }
              helper={!selectedProject?._id ? "Select a project first." : ""}
            />
          </div>
        </div>
      </section>

      <section className="card studentOverviewCard supervisorHistoryTimeline" aria-labelledby="sup-history-timeline-heading">
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Timeline</p>
            <h2 id="sup-history-timeline-heading" className="cardTitle">
              Revisions by student
            </h2>
            <p className="cardHint">Each card is one submission; the table lists version history and who changed marks or feedback.</p>
          </div>
        </header>

        <div className="studentOverviewCard__body">
          <ErrorMessage message={error} />

          {loading ? (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading history…
            </p>
          ) : null}

          {!loading && selectedAssessmentId && historyRows.length === 0 ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No rows to show</p>
              <p className="studentOverviewEmpty__text">
                Either no one has submitted this assessment yet, or nothing matched your selection.
              </p>
            </div>
          ) : null}

          {!loading && !selectedAssessmentId ? (
            <div className="studentCommThreadPlaceholder studentCommThreadPlaceholder--subtle">
              <p className="studentCommThreadPlaceholder__title">Choose an assessment</p>
              <p className="studentCommThreadPlaceholder__text">Select a project and an assessment on the left to load revision data.</p>
            </div>
          ) : null}

          {!loading && historyRows.length > 0 ? (
            <ul className="studentHistoryList supervisorHistoryList">
              {historyRows.map((entry, idx) => {
                const submission = entry.submission;
                const key = submission?._id || `sup-hist-${idx}`;
                const revisions = Array.isArray(entry.revisions) ? entry.revisions : [];
                const versionNums = revisions.map((r) => Number(r.version)).filter((n) => !Number.isNaN(n));
                const maxVersion = versionNums.length ? Math.max(...versionNums) : null;

                return (
                  <li key={key} className="studentHistoryEntry">
                    <header className="studentHistoryEntry__head">
                      <h3 className="studentHistoryEntry__title">{submission?.student?.name || "Student"}</h3>
                      <p className="studentHistoryEntry__project">{submission?.student?.email || "—"}</p>
                    </header>

                    <div className="studentHistorySummary">
                      <div className="studentHistorySummary__item studentHistorySummary__item--wide">
                        <span className="studentHistorySummary__label">Submitted</span>
                        <span className="studentHistorySummary__value">
                          {submission?.submittedAt || submission?.createdAt
                            ? new Date(submission.submittedAt || submission.createdAt).toLocaleString()
                            : "—"}
                        </span>
                      </div>
                    </div>

                    {revisions.length > 0 ? (
                      <div className="studentHistoryTableWrap">
                        <table className="table studentHistoryTable supervisorHistoryTable">
                          <thead>
                            <tr>
                              <th scope="col">Version</th>
                              <th scope="col">Change</th>
                              <th scope="col">Changed by</th>
                              <th scope="col">Marks</th>
                              <th scope="col">Feedback</th>
                              <th scope="col">Updated</th>
                            </tr>
                          </thead>
                          <tbody>
                            {revisions.map((rev) => {
                              const v = Number(rev.version);
                              const isLatest = maxVersion != null && !Number.isNaN(v) && v === maxVersion;
                              const who = rev.changedBy?.name
                                ? `${rev.changedBy.name}${rev.changedRole ? ` (${rev.changedRole})` : ""}`
                                : rev.changedRole || "—";

                              return (
                                <tr
                                  key={rev._id}
                                  className={
                                    isLatest ? "studentHistoryRow studentHistoryRow--latest" : "studentHistoryRow"
                                  }
                                >
                                  <td>
                                    <span className="studentHistoryVersion">{rev.version}</span>
                                    {isLatest ? (
                                      <span className="studentHistoryLatestBadge" title="Most recent revision">
                                        Latest
                                      </span>
                                    ) : null}
                                  </td>
                                  <td>{formatChangeType(rev.changeType)}</td>
                                  <td className="supervisorHistoryTable__who">{who}</td>
                                  <td>
                                    {rev.marks != null ? (
                                      <span className="studentHistoryTableMarks">{rev.marks}</span>
                                    ) : (
                                      <span className="studentHistoryTableDash">—</span>
                                    )}
                                  </td>
                                  <td className="studentHistoryTableFeedback">{rev.feedback?.trim() ? rev.feedback : "—"}</td>
                                  <td className="studentHistoryTableTime">
                                    {rev.createdAt ? new Date(rev.createdAt).toLocaleString() : "—"}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="studentHistoryNoRevisions">No revision rows for this submission.</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default SupervisorHistoryPage;
