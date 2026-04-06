import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchAssessmentStatus, fetchMarksWithRubrics } from "../../services/studentService";

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
      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Submission Status</p>
            <p className="cardHint">Track pending, submitted, and graded progress</p>
          </div>
          <button type="button" className="button" onClick={load} disabled={loading}>
            Refresh
          </button>
        </div>

        <ErrorMessage message={error} />
        {loading && <p className="helper">Loading status…</p>}

        {!loading && (
          <ul className="list">
            {statusRows.map((row) => (
              <li key={row.assessment?._id} className="item">
                <p className="itemTitle">{row.assessment?.title}</p>
                <p className="helper">Status: {row.status}</p>
                <p className="helper">
                  Deadline: {row.effectiveDeadline ? new Date(row.effectiveDeadline).toLocaleString() : "N/A"}
                </p>
                {row.submission?.feedback && <p className="itemMeta">Feedback: {row.submission.feedback}</p>}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Marks and Rubrics</p>
            <p className="cardHint">View evaluated marks with rubric criteria</p>
          </div>
        </div>

        {loading && <p className="helper">Loading marks…</p>}

        {!loading && (
          <ul className="list">
            {markRows.map((row) => (
              <li key={row.submission?._id} className="item">
                <p className="itemTitle">
                  {row.submission?.assessment?.title || "Assessment"} · {row.submission?.assessment?.project?.title || "Project"}
                </p>
                {Array.isArray(row.submission?.grades) && row.submission.grades.length > 0 ? (
                  <div style={{ marginTop: 8 }}>
                    <p className="helper">Evaluator Marks</p>
                    <ul className="list">
                      {row.submission.grades.map((grade, index) => (
                        <li
                          key={`${grade.evaluator?._id || grade.evaluator || "grade"}-${index}`}
                          className="item"
                        >
                          <p className="itemTitle">
                            {grade.evaluator?.name || "Supervisor"} ({grade.evaluatorRole || "supervisor"})
                          </p>
                          <p className="helper">Marks: {grade.marks ?? "-"}</p>
                          {grade.feedback && <p className="itemMeta">Feedback: {grade.feedback}</p>}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>
                    <p className="helper">Marks: {row.submission?.marks ?? "Not graded"}</p>
                    {row.submission?.feedback && <p className="itemMeta">Feedback: {row.submission.feedback}</p>}
                  </div>
                )}
                {row.rubric && (
                  <div style={{ marginTop: 8 }}>
                    <p className="helper">Rubric (Total: {row.rubric.totalMarks})</p>
                    <ul className="list">
                      {(row.rubric.criteria || []).map((criterion, index) => (
                        <li key={`${criterion.title}-${index}`} className="item">
                          <p className="itemTitle">{criterion.title}</p>
                          <p className="itemMeta">{criterion.description}</p>
                          <p className="helper">Max: {criterion.maxMarks}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default StudentMarksPage;
