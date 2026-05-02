import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  fetchStudentNotifications,
  markStudentNotificationRead,
} from "../../services/studentService";

const formatNotificationKind = (type) => {
  if (!type || typeof type !== "string") return "Update";
  const normalized = type.trim().toLowerCase();
  const map = {
    message: "Message",
    feedback_update: "Evaluation",
    deadline: "Deadline",
    submission: "Submission",
    system: "System",
  };
  if (map[normalized]) return map[normalized];
  return normalized
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

const typeSlug = (type) => {
  if (!type || typeof type !== "string") return "default";
  return type.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-") || "default";
};

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
    <section className="card studentOverviewCard studentNotifyPage" aria-labelledby="student-notify-heading">
      <header className="studentOverviewCard__header studentOverviewCard__header--split">
        <div>
          <p className="studentOverviewCard__eyebrow">Inbox</p>
          <h2 id="student-notify-heading" className="cardTitle">
            Notifications
          </h2>
          <p className="cardHint">Deadlines, messages from supervisors, and grading updates in one place.</p>
        </div>
        <button type="button" className="button buttonRefresh" onClick={load} disabled={loading}>
          Refresh list
        </button>
      </header>

      <div className="studentOverviewCard__body">
        <ErrorMessage message={error} />

        {loading && (
          <p className="studentOverviewStatus" role="status">
            <span className="studentOverviewSpinner" aria-hidden />
            Loading notifications…
          </p>
        )}

        {!loading && notifications.length === 0 && (
          <div className="studentOverviewEmpty">
            <p className="studentOverviewEmpty__title">You are all caught up</p>
            <p className="studentOverviewEmpty__text">
              New alerts will appear here when supervisors message you, when deadlines change, or when submissions are
              graded.
            </p>
          </div>
        )}

        {!loading && notifications.length > 0 && (
          <ul className="studentNotifyList">
            {notifications.map((notification) => {
              const created = notification.createdAt ? new Date(notification.createdAt) : null;
              const iso = created && !Number.isNaN(created.getTime()) ? created.toISOString() : undefined;
              const label = created && !Number.isNaN(created.getTime()) ? created.toLocaleString() : "—";
              const slug = typeSlug(notification.type);

              return (
                <li
                  key={notification._id}
                  className={`studentNotifyItem ${notification.isRead ? "" : "studentNotifyItem--unread"}`}
                >
                  <div className="studentNotifyItem__shell">
                    <div className="studentNotifyItem__main">
                      <div className="studentNotifyItem__head">
                        <h3 className="studentNotifyItem__title">{notification.title}</h3>
                        <time className="studentNotifyItem__when" dateTime={iso}>
                          {label}
                        </time>
                      </div>
                      <div className="studentNotifyItem__chips" aria-label="Notification category">
                        <span className={`studentNotifyType studentNotifyType--${slug}`}>
                          {formatNotificationKind(notification.type)}
                        </span>
                        {!notification.isRead ? <span className="studentNotifyUnreadBadge">Unread</span> : null}
                      </div>
                      {notification.message ? (
                        <p className="studentNotifyItem__body">{notification.message}</p>
                      ) : null}
                    </div>
                    {!notification.isRead ? (
                      <div className="studentNotifyItem__actions">
                        <button
                          type="button"
                          className="button buttonNotifyRead"
                          onClick={() => markRead(notification._id)}
                        >
                          Mark as read
                        </button>
                      </div>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
};

export default StudentNotificationsPage;
