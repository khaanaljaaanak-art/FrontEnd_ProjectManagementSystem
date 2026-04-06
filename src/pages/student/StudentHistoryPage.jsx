import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchStudentHistory } from "../../services/studentService";

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
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">Past Submissions and Performance History</p>
          <p className="cardHint">Review all attempts, revisions, marks, and feedback trends</p>
        </div>
        <button type="button" className="button" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <ErrorMessage message={error} />
      {loading && <p className="helper">Loading history…</p>}

      {!loading && rows.length === 0 && (
        <p className="helper">No submission history available yet.</p>
      )}

      {!loading && rows.length > 0 && (
        <ul className="list">
          {rows.map((entry) => (
            <li key={entry.submission?._id} className="item">
              <p className="itemTitle">
                {entry.submission?.assessment?.title || "Assessment"} · {entry.submission?.assessment?.project?.title || "Project"}
              </p>
              <p className="helper">Current Status: {entry.submission?.status || "submitted"}</p>
              <p className="helper">Attempts: {entry.submission?.attemptCount || 1}</p>
              <p className="helper">Marks: {entry.submission?.marks ?? "Not graded"}</p>
              {entry.submission?.feedback && <p className="itemMeta">Feedback: {entry.submission.feedback}</p>}

              <div className="tableWrap" style={{ marginTop: 10 }}>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Version</th>
                      <th>Change</th>
                      <th>Marks</th>
                      <th>Feedback</th>
                      <th>Updated At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(entry.revisions || []).map((revision) => (
                      <tr key={revision._id}>
                        <td>{revision.version}</td>
                        <td>{revision.changeType}</td>
                        <td>{revision.marks ?? "-"}</td>
                        <td>{revision.feedback || "-"}</td>
                        <td>{new Date(revision.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default StudentHistoryPage;
