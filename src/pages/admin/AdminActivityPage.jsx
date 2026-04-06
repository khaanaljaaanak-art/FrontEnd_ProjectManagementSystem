import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchActivity } from "../../services/adminService";

const AdminActivityPage = () => {
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchActivity();
      setActivity(Array.isArray(data) ? data : []);
    } catch (_e) {
      setError("Failed to load activity logs.");
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
          <p className="cardTitle">System Activity Monitor</p>
          <p className="cardHint">Audit trail of actions across users and roles</p>
        </div>
        <button type="button" className="button" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <ErrorMessage message={error} />
      {loading && <p className="helper">Loading activity…</p>}

      <ul className="list">
        {activity.map((entry) => (
          <li key={entry._id} className="item">
            <p className="itemTitle">{entry.action}</p>
            <p className="itemMeta">Actor: {entry.actor?.name || "System"} ({entry.actorRole})</p>
            <p className="helper">{new Date(entry.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminActivityPage;
