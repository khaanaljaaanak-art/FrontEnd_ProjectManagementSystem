import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchStudentHistory } from "../../services/studentService";

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

const formatStatus = (status) => {
  if (!status || typeof status !== "string") return "—";
  return status
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
};

const StudentHistoryPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStudentHistory();
      setRows(Array.isArray(data) ? data : []);
    } catch (_e) {
      setError("Failed to load performance history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="card studentOverviewCard studentHistoryPage" aria-labelledby="student-history-heading">
      <header className="studentOverviewCard__header studentOverviewCard__header--split">
        <div>
          <p className="studentOverviewCard__eyebrow">Record</p>
          <h2 id="student-history-heading" className="cardTitle">
            Submission history
          </h2>
          <p className="cardHint">Every attempt, grade change, and feedback update for your assessments.</p>
        </div>
        <button type="button" className="button buttonRefresh" onClick={load} disabled={loading}>
          Refresh list
        </button>
      </header>

      <div className="studentOverviewCard__body">
        <ErrorMessage message={error} />

        {loading ? (
          <p className="studentOverviewStatus" role="status">
            <span className="studentOverviewSpinner" aria-hidden />
            Loading history…
          </p>
        ) : null}

        {!loading && rows.length === 0 ? (
          <div className="studentOverviewEmpty studentOverviewEmpty--compact">
            <p className="studentOverviewEmpty__title">No history yet</p>
            <p className="studentOverviewEmpty__text">
              Once you submit work and supervisors record grades, a timeline will appear here for each assessment.
            </p>
          </div>
        ) : null}

        {!loading && rows.length > 0 ? (
          <ul className="studentHistoryList">
            {rows.map((entry, entryIndex) => {
              const submission = entry.submission;
              const key = submission?._id || `history-${entryIndex}`;
              const assessmentTitle = submission?.assessment?.title || "Assessment";
              const projectTitle = submission?.assessment?.project?.title || "Project";
              const revisions = Array.isArray(entry.revisions) ? entry.revisions : [];
              const versionNums = revisions.map((r) => Number(r.version)).filter((n) => !Number.isNaN(n));
              const maxVersion = versionNums.length ? Math.max(...versionNums) : null;

              return (
                <li key={key} className="studentHistoryEntry">
                  <header className="studentHistoryEntry__head">
                    <h3 className="studentHistoryEntry__title">{assessmentTitle}</h3>
                    <p className="studentHistoryEntry__project">{projectTitle}</p>
                  </header>

                  <div className="studentHistorySummary">
                    <div className="studentHistorySummary__item">
                      <span className="studentHistorySummary__label">Status</span>
                      <span className="studentStatusPill">{formatStatus(submission?.status || "submitted")}</span>
                    </div>
                    <div className="studentHistorySummary__item">
                      <span className="studentHistorySummary__label">Attempts</span>
                      <span className="studentHistorySummary__value">{submission?.attemptCount ?? 1}</span>
                    </div>
                    <div className="studentHistorySummary__item">
                      <span className="studentHistorySummary__label">Marks</span>
                      {submission?.marks != null ? (
                        <span className="studentMarkScoreBadge studentHistorySummary__marks">{submission.marks}</span>
                      ) : (
                        <span className="studentMarkScoreBadge studentMarkScoreBadge--muted">Not graded</span>
                      )}
                    </div>
                    {submission?.feedback ? (
                      <div className="studentHistorySummary__item studentHistorySummary__item--wide">
                        <span className="studentHistorySummary__label">Feedback</span>
                        <p className="studentHistorySummary__feedback">{submission.feedback}</p>
                      </div>
                    ) : null}
                  </div>

                  {revisions.length > 0 ? (
                    <div className="studentHistoryTableWrap">
                      <table className="table studentHistoryTable">
                        <thead>
                          <tr>
                            <th scope="col">Version</th>
                            <th scope="col">Change</th>
                            <th scope="col">Marks</th>
                            <th scope="col">Feedback</th>
                            <th scope="col">Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {revisions.map((revision) => {
                            const v = Number(revision.version);
                            const isLatest =
                              maxVersion != null && !Number.isNaN(v) && v === maxVersion;
                            return (
                              <tr
                                key={revision._id}
                                className={isLatest ? "studentHistoryRow studentHistoryRow--latest" : "studentHistoryRow"}
                              >
                                <td>
                                  <span className="studentHistoryVersion">{revision.version}</span>
                                  {isLatest ? (
                                    <span className="studentHistoryLatestBadge" title="Most recent revision">
                                      Latest
                                    </span>
                                  ) : null}
                                </td>
                                <td>{formatChangeType(revision.changeType)}</td>
                                <td>
                                  {revision.marks != null ? (
                                    <span className="studentHistoryTableMarks">{revision.marks}</span>
                                  ) : (
                                    <span className="studentHistoryTableDash">—</span>
                                  )}
                                </td>
                                <td className="studentHistoryTableFeedback">
                                  {revision.feedback?.trim() ? revision.feedback : "—"}
                                </td>
                                <td className="studentHistoryTableTime">
                                  {revision.createdAt ? new Date(revision.createdAt).toLocaleString() : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="studentHistoryNoRevisions">No revision log for this submission.</p>
                  )}
                </li>
              );
            })}
          </ul>
        ) : null}
      </div>
    </section>
  );
};

export default StudentHistoryPage;
