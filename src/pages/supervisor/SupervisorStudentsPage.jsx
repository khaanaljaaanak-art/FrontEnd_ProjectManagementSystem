import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchAssignedStudentsProgress } from "../../services/supervisorService";

const SupervisorStudentsPage = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAssignedStudentsProgress();
      setRows(Array.isArray(data) ? data : []);
    } catch (_e) {
      setRows([]);
      setError("Failed to load assigned students.");
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
          <p className="cardTitle">Assigned Students and Progress</p>
          <p className="cardHint">Track progress and completion by student</p>
        </div>
        <button type="button" className="button" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      <ErrorMessage message={error} />
      {loading && <p className="helper">Loading student progress…</p>}

      {!loading && rows.length === 0 && (
        <p className="helper">No assigned student activity found yet.</p>
      )}

      {!loading && rows.length > 0 && (
        <div className="tableWrap">
          <table className="table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Projects</th>
                <th>Submissions</th>
                <th>Graded</th>
                <th>Average Marks</th>
                <th>Latest Activity</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.student?._id}>
                  <td>
                    <div style={{ fontWeight: 700 }}>{row.student?.name || "Student"}</div>
                    <div className="helper" style={{ margin: 0 }}>
                      {row.student?.email || ""}
                    </div>
                  </td>
                  <td>{Array.isArray(row.projects) ? row.projects.join(", ") : "-"}</td>
                  <td>{row.submissionsCount ?? 0}</td>
                  <td>{row.gradedCount ?? 0}</td>
                  <td>{row.averageMarks ?? "-"}</td>
                  <td>
                    {row.latestSubmissionAt
                      ? new Date(row.latestSubmissionAt).toLocaleString()
                      : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SupervisorStudentsPage;
