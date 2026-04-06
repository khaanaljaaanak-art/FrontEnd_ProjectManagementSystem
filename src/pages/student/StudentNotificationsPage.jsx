import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  fetchStudentNotifications,
  markStudentNotificationRead,
} from "../../services/studentService";

const StudentNotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStudentNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (_e) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markRead = async (notificationId) => {
    try {
      const updated = await markStudentNotificationRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
    } catch (_e) {
      setError("Failed to update notification.");
    }
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">Notifications</p>
          <p className="cardHint">Deadlines, feedback, and important updates</p>
        </div>
        <button type="button" className="button" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <ErrorMessage message={error} />
      {loading && <p className="helper">Loading notifications…</p>}

      {!loading && notifications.length === 0 && (
        <p className="helper">No notifications yet.</p>
      )}

      <ul className="list">
        {notifications.map((notification) => (
          <li key={notification._id} className="item">
            <p className="itemTitle">{notification.title}</p>
            <p className="itemMeta">{notification.message}</p>
            <p className="helper">Type: {notification.type}</p>
            <p className="helper">{new Date(notification.createdAt).toLocaleString()}</p>
            {!notification.isRead && (
              <button type="button" className="button" onClick={() => markRead(notification._id)}>
                Mark as Read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentNotificationsPage;
