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
    <section className="card studentOverviewCard supervisorStudentsPage" aria-labelledby="sup-students-heading">
      <header className="studentOverviewCard__header studentOverviewCard__header--split">
        <div>
          <p className="studentOverviewCard__eyebrow">Roster</p>
          <h2 id="sup-students-heading" className="cardTitle">
            Assigned students
          </h2>
          <p className="cardHint">Submission volume, grading progress, and recent activity for everyone you supervise.</p>
        </div>
        <button type="button" className="button buttonRefresh" onClick={load} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh list"}
        </button>
      </header>

      <div className="studentOverviewCard__body">
        <ErrorMessage message={error} />

        {loading ? (
          <p className="studentOverviewStatus" role="status">
            <span className="studentOverviewSpinner" aria-hidden />
            Loading student progress…
          </p>
        ) : null}

        {!loading && rows.length === 0 ? (
          <div className="studentOverviewEmpty studentOverviewEmpty--compact">
            <p className="studentOverviewEmpty__title">No students yet</p>
            <p className="studentOverviewEmpty__text">
              When students are assigned to your projects, their progress summary will appear in this table.
            </p>
          </div>
        ) : null}

        {!loading && rows.length > 0 ? (
          <div className="supervisorStudentsTableWrap">
            <table className="table supervisorStudentsTable">
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  <th scope="col">Projects</th>
                  <th scope="col">Submissions</th>
                  <th scope="col">Graded</th>
                  <th scope="col">Avg. marks</th>
                  <th scope="col">Latest activity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.student?._id}>
                    <td>
                      <div className="supervisorStudentsTable__name">{row.student?.name || "Student"}</div>
                      <div className="supervisorStudentsTable__email">{row.student?.email || "—"}</div>
                    </td>
                    <td className="supervisorStudentsTable__projects">
                      {Array.isArray(row.projects) && row.projects.length > 0 ? row.projects.join(", ") : "—"}
                    </td>
                    <td className="supervisorStudentsTable__num">{row.submissionsCount ?? 0}</td>
                    <td className="supervisorStudentsTable__num">{row.gradedCount ?? 0}</td>
                    <td className="supervisorStudentsTable__marks">
                      {row.averageMarks != null ? (
                        <span className="studentHistoryTableMarks">{row.averageMarks}</span>
                      ) : (
                        <span className="studentHistoryTableDash">—</span>
                      )}
                    </td>
                    <td className="supervisorStudentsTable__time">
                      {row.latestSubmissionAt ? new Date(row.latestSubmissionAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default SupervisorStudentsPage;
