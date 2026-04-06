import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchDisputes, resolveDispute } from "../../services/adminService";

const AdminDisputesPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDisputes();
      setDisputes(Array.isArray(data) ? data : []);
    } catch (_e) {
      setError("Failed to load disputes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onResolve = async (disputeId) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await resolveDispute(disputeId, note.trim() || "Resolved by admin");
      setMessage("Dispute resolved.");
      setNote("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to resolve dispute.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">Dispute Resolution</p>
          <p className="cardHint">Resolve issues between students and supervisors</p>
        </div>
        <button type="button" className="button" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <ErrorMessage message={error} />
      {message && <p className="helper">{message}</p>}
      {loading && <p className="helper">Loading disputes…</p>}

      <label className="label">Resolution Note</label>
      <textarea
        className="textarea"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="This note is applied when resolving a dispute"
        disabled={busy}
      />

      <ul className="list" style={{ marginTop: 12 }}>
        {disputes.map((dispute) => (
          <li key={dispute._id} className="item">
            <p className="itemTitle">{dispute.title}</p>
            <p className="itemMeta">{dispute.description}</p>
            <p className="helper">
              Raised by: {dispute.raisedBy?.name || "Unknown"} · Status: {dispute.status}
            </p>
            {dispute.status === "open" && (
              <button
                type="button"
                className="button buttonPrimary"
                onClick={() => onResolve(dispute._id)}
                disabled={busy}
              >
                Resolve
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDisputesPage;
