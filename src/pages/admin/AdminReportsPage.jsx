import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchOverview } from "../../services/adminService";

const AdminReportsPage = () => {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchOverview();
      setOverview(data || null);
    } catch (_e) {
      setError("Failed to load reports and analytics.");
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
          <p className="cardTitle">Reports and Analytics</p>
          <p className="cardHint">Submission rates, grading rates, and system totals</p>
        </div>
        <button type="button" className="button" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <ErrorMessage message={error} />
      {loading && <p className="helper">Loading analytics…</p>}

      {overview && (
        <div className="grid grid2" style={{ marginTop: 8 }}>
          <div className="item">Users: {overview.totals?.users || 0}</div>
          <div className="item">Projects: {overview.totals?.projects || 0}</div>
          <div className="item">Approved Projects: {overview.totals?.approvedProjects || 0}</div>
          <div className="item">Assessments: {overview.totals?.assessments || 0}</div>
          <div className="item">Submissions: {overview.totals?.submissions || 0}</div>
          <div className="item">Open Disputes: {overview.totals?.openDisputes || 0}</div>
          <div className="item">Submission Rate: {overview.rates?.submissionRate || 0}</div>
          <div className="item">Grading Rate: {overview.rates?.gradingRate || 0}</div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsPage;
