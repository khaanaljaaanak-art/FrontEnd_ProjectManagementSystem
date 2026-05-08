import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchOverview } from "../../services/adminService";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const normalizePercent = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  if (num <= 1) return Math.round(num * 100);
  return Math.round(num);
};

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

  const totals = overview?.totals || {};
  const rates = overview?.rates || {};
  const submissionPct = normalizePercent(rates.submissionRate);
  const gradingPct = normalizePercent(rates.gradingRate);

  const totalsChartData = [
    { name: "Users", value: totals.users || 0 },
    { name: "Projects", value: totals.projects || 0 },
    { name: "Approved", value: totals.approvedProjects || 0 },
    { name: "Assessments", value: totals.assessments || 0 },
    { name: "Submissions", value: totals.submissions || 0 },
  ];

  return (
    <div className="workflow">
      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Reports and Analytics</p>
            <p className="cardHint">Dashboard overview of system totals, submission statistics, and progress signals.</p>
          </div>
          <button type="button" className="button" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        <ErrorMessage message={error} />
        {loading && <p className="helper">Loading analytics…</p>}

        {overview && (
          <div className="reportDashboard">
            <div className="reportKpis">
              <div className="reportKpiCard">
                <p className="reportKpiLabel">Users</p>
                <p className="reportKpiValue">{totals.users || 0}</p>
              </div>
              <div className="reportKpiCard">
                <p className="reportKpiLabel">Projects</p>
                <p className="reportKpiValue">{totals.projects || 0}</p>
              </div>
              <div className="reportKpiCard">
                <p className="reportKpiLabel">Approved projects</p>
                <p className="reportKpiValue">{totals.approvedProjects || 0}</p>
              </div>
              <div className="reportKpiCard">
                <p className="reportKpiLabel">Assessments</p>
                <p className="reportKpiValue">{totals.assessments || 0}</p>
              </div>
              <div className="reportKpiCard">
                <p className="reportKpiLabel">Submissions</p>
                <p className="reportKpiValue">{totals.submissions || 0}</p>
              </div>
            </div>

            <div className="reportCharts">
              <div className="reportChartCard">
                <div className="reportChartHead">
                  <div>
                    <p className="reportChartTitle">System totals</p>
                    <p className="reportChartHint">Snapshot counts from the current dataset.</p>
                  </div>
                </div>
                <div className="reportChartBody">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={totalsChartData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Count" fill="#1542a3" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="reportChartCard">
                <div className="reportChartHead">
                  <div>
                    <p className="reportChartTitle">Progress tracking</p>
                    <p className="reportChartHint">Rates derived from submissions and grading activity.</p>
                  </div>
                </div>
                <div className="reportChartBody">
                  <div className="reportProgressList">
                    <div className="reportProgressRow">
                      <div className="reportProgressTop">
                        <p className="reportProgressLabel">Submission rate</p>
                        <p className="reportProgressValue">{submissionPct}%</p>
                      </div>
                      <div className="reportProgressBar" aria-hidden>
                        <div
                          className="reportProgressBarFill"
                          style={{ width: `${Math.max(0, Math.min(100, submissionPct))}%` }}
                        />
                      </div>
                    </div>

                    <div className="reportProgressRow">
                      <div className="reportProgressTop">
                        <p className="reportProgressLabel">Grading rate</p>
                        <p className="reportProgressValue">{gradingPct}%</p>
                      </div>
                      <div className="reportProgressBar" aria-hidden>
                        <div
                          className="reportProgressBarFill reportProgressBarFill--teal"
                          style={{ width: `${Math.max(0, Math.min(100, gradingPct))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <p className="helper" style={{ marginTop: 10 }}>
                    Note: If rates are returned as fractions (0–1), they’re converted to percentages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReportsPage;
