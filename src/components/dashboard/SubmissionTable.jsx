const SubmissionTable = ({ submissions, grading, onChangeDraft, onSave }) => {
  if (!submissions || submissions.length === 0) return null;

  return (
    <div className="tableWrap" style={{ marginTop: 12 }}>
      <table className="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>File URL</th>
            <th>Marks</th>
            <th>Feedback</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => {
            const draft = grading[s._id] || {
              marks: s.marks ?? "",
              feedback: s.feedback ?? "",
            };

            return (
              <tr key={s._id}>
                <td>
                  <div style={{ fontWeight: 700 }}>{s.student?.name || "Student"}</div>
                  <div className="helper" style={{ margin: 0 }}>
                    {s.student?.email || ""}
                  </div>
                </td>
                <td>
                  {(() => {
                    const urls =
                      Array.isArray(s.fileUrls) && s.fileUrls.length > 0
                        ? s.fileUrls
                        : s.fileUrl
                          ? [s.fileUrl]
                          : [];

                    return urls.length === 0 ? (
                      <span className="helper" style={{ margin: 0 }}>
                        No file
                      </span>
                    ) : (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {urls.map((url, idx) => (
                          <a key={url} href={url} target="_blank" rel="noreferrer">
                            Open {idx + 1}
                          </a>
                        ))}
                      </div>
                    );
                  })()}
                  <div className="helper" style={{ margin: 0 }}>
                    Submitted: {new Date(s.submittedAt).toLocaleString()}
                  </div>
                </td>
                <td style={{ minWidth: 140 }}>
                  <input
                    className="input"
                    type="number"
                    value={draft.marks}
                    onChange={(e) => onChangeDraft(s._id, { ...draft, marks: e.target.value })}
                    placeholder="e.g. 85"
                  />
                </td>
                <td style={{ minWidth: 240 }}>
                  <input
                    className="input"
                    value={draft.feedback}
                    onChange={(e) =>
                      onChangeDraft(s._id, { ...draft, feedback: e.target.value })
                    }
                    placeholder="Short feedback"
                  />
                </td>
                <td style={{ whiteSpace: "nowrap" }}>
                  <button
                    type="button"
                    className="button buttonPrimary"
                    onClick={() => onSave(s._id)}
                  >
                    Save
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
