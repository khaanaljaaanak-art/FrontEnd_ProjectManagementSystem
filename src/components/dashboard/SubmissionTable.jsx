const SubmissionTable = ({ submissions, grading, onChangeDraft, onSave, currentUserId, disabled = false }) => {
  if (!submissions || submissions.length === 0) return null;

  return (
    <div className="supervisorSubmissionTableWrap">
      <table className="table studentHistoryTable supervisorSubmissionTable">
        <thead>
          <tr>
            <th scope="col">Student</th>
            <th scope="col">Submission</th>
            <th scope="col">Marks</th>
            <th scope="col">Feedback</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            const draft = grading[s._id] || {
              marks: s.marks ?? "",
              feedback: s.feedback ?? "",
            };

            const grades = Array.isArray(s.grades) ? s.grades : [];
            const myGrade = grades.find(
              (grade) => String(grade.evaluator?._id || grade.evaluator) === String(currentUserId)
            );
            const alreadyGradedByMe = Boolean(myGrade);

            const urls =
              Array.isArray(s.fileUrls) && s.fileUrls.length > 0
                ? s.fileUrls
                : s.fileUrl
                  ? [s.fileUrl]
                  : [];

            return (
              <tr key={s._id} className="supervisorSubmissionTable__row">
                <td>
                  <div className="supervisorSubmissionTable__studentName">{s.student?.name || "Student"}</div>
                  <div className="supervisorSubmissionTable__studentEmail">{s.student?.email || ""}</div>
                </td>
                <td className="supervisorSubmissionTable__filesCell">
                  {grades.length > 0 ? (
                    <ul className="supervisorSubmissionTable__grades">
                      {grades.map((grade, idx) => (
                        <li key={`${grade.evaluator?._id || grade.evaluator}-${idx}`}>
                          <span className="supervisorSubmissionTable__gradeWho">
                            {grade.evaluator?.name || "Evaluator"}
                          </span>
                          <span className="supervisorSubmissionTable__gradeMeta">
                            ({grade.evaluatorRole || "supervisor"}) ·{" "}
                            <span className="studentHistoryTableMarks">{grade.marks}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {urls.length === 0 ? (
                    <p className="supervisorSubmissionTable__muted">No file linked</p>
                  ) : (
                    <div className="supervisorSubmissionTable__links">
                      {urls.map((url, idx) => (
                        <a
                          key={url}
                          className="supervisorSubmissionLink"
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open file {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                  <p className="supervisorSubmissionTable__submitted">
                    Submitted {s.submittedAt ? new Date(s.submittedAt).toLocaleString() : "—"}
                  </p>
                </td>
                <td className="supervisorSubmissionTable__marksCell">
                  <input
                    className="input supervisorSubmissionTable__marksInput"
                    type="number"
                    value={draft.marks}
                    onChange={(e) => onChangeDraft(s._id, { ...draft, marks: e.target.value })}
                    placeholder="e.g. 85"
                    disabled={alreadyGradedByMe || disabled}
                    aria-label={`Marks for ${s.student?.name || "student"}`}
                  />
                </td>
                <td className="supervisorSubmissionTable__feedbackCell">
                  <textarea
                    className="textarea supervisorSubmissionTable__feedbackInput"
                    value={draft.feedback}
                    onChange={(e) => onChangeDraft(s._id, { ...draft, feedback: e.target.value })}
                    placeholder="Feedback for the student"
                    rows={3}
                    disabled={alreadyGradedByMe || disabled}
                    aria-label={`Feedback for ${s.student?.name || "student"}`}
                  />
                </td>
                <td className="supervisorSubmissionTable__actionCell">
                  <button
                    type="button"
                    className="button buttonPrimary supervisorSubmissionTable__saveBtn"
                    onClick={() => onSave(s._id)}
                    disabled={alreadyGradedByMe || disabled}
                  >
                    {alreadyGradedByMe ? "Saved" : "Save"}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionTable;
