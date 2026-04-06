import { useMemo, useState } from "react";
import { useProjects } from "../../context/ProjectContext";
import { useAssessments } from "../../hooks/useAssessments";
import ProjectSelector from "../../components/dashboard/ProjectSelector";
import AssessmentList from "../../components/dashboard/AssessmentList";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchSubmissionHistory } from "../../services/supervisorService";

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
      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Submission History</p>
            <p className="cardHint">Select assessment to view all revisions and grading updates</p>
          </div>
        </div>

        <ProjectSelector
          selectedProjectId={selectedProjectId}
          onSelect={(project) => {
            setSelectedProjectId(project?._id || "");
            setSelectedAssessmentId("");
            setHistoryRows([]);
          }}
        />

        <div style={{ marginTop: 12 }}>
          <AssessmentList
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

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Revision Timeline</p>
            <p className="cardHint">Track submission versions and supervisor grading revisions</p>
          </div>
        </div>

        <ErrorMessage message={error} />
        {loading && <p className="helper">Loading history…</p>}

        {!loading && selectedAssessmentId && historyRows.length === 0 && (
          <p className="helper">No history found for the selected assessment.</p>
        )}

        {!loading && historyRows.length > 0 && (
          <ul className="list">
            {historyRows.map((entry) => (
              <li key={entry.submission?._id} className="item">
                <p className="itemTitle">
                  {entry.submission?.student?.name || "Student"} · {entry.submission?.student?.email}
                </p>
                <p className="helper">
                  Submitted: {new Date(entry.submission?.submittedAt || entry.submission?.createdAt).toLocaleString()}
                </p>

                <div className="tableWrap" style={{ marginTop: 8 }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Version</th>
                        <th>Type</th>
                        <th>Changed By</th>
                        <th>Marks</th>
                        <th>Feedback</th>
                        <th>At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(entry.revisions || []).map((rev) => (
                        <tr key={rev._id}>
                          <td>{rev.version}</td>
                          <td>{rev.changeType}</td>
                          <td>{rev.changedBy?.name || rev.changedRole}</td>
                          <td>{rev.marks ?? "-"}</td>
                          <td>{rev.feedback || "-"}</td>
                          <td>{new Date(rev.createdAt).toLocaleString()}</td>
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
    </div>
  );
};

export default SupervisorHistoryPage;
