import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchActivity } from "../../services/adminService";

const AdminActivityPage = () => {
  const [activity, setActivity] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const INITIAL_VISIBLE_COUNT = 3;

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

  const visibleActivity = showAll
    ? activity
    : activity.slice(0, INITIAL_VISIBLE_COUNT);

  const canShowMore = activity.length > INITIAL_VISIBLE_COUNT;

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

      {canShowMore && (
        <div className="actions" style={{ marginBottom: 10 }}>
          <button
            type="button"
            className="button"
            onClick={() => setShowAll((prev) => !prev)}
          >
            {showAll ? "Show less" : `Show more (${activity.length - INITIAL_VISIBLE_COUNT} more)`}
          </button>
        </div>
      )}

      <div
        style={
          showAll
            ? {
                maxHeight: 420,
                overflowY: "auto",
                paddingRight: 4,
              }
            : undefined
        }
      >
        <ul className="list">
          {visibleActivity.map((entry) => (
          <li key={entry._id} className="item">
            <p className="itemTitle">{entry.action}</p>
            <p className="itemMeta">Actor: {entry.actor?.name || "System"} ({entry.actorRole})</p>
            <p className="helper">{new Date(entry.createdAt).toLocaleString()}</p>
          </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AdminActivityPage;
