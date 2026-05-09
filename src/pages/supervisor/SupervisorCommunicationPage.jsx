import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useNotificationPoller } from "../../context/NotificationPollerContext";
import {
  fetchAssignedStudentsProgress,
  fetchConversation,
  fetchSupervisorNotifications,
  markSupervisorNotificationAsRead,
  sendMessageToStudent,
} from "../../services/supervisorService";

const formatNotificationKind = (type) => {
  if (!type || typeof type !== "string") return "Update";
  const normalized = type.trim().toLowerCase();
  const map = {
    message: "Message",
    feedback_update: "Evaluation",
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

const SupervisorCommunicationPage = () => {
  const { hash } = useLocation();
  const { refreshUnreadSummary } = useNotificationPoller();
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [conversation, setConversation] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const myUserId = useMemo(() => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return "";
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload?.id || "";
    } catch (_e) {
      return "";
    }
  }, []);

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [studentsProgress, notices] = await Promise.all([
        fetchAssignedStudentsProgress(),
        fetchSupervisorNotifications(),
      ]);
      const onlyStudents = (Array.isArray(studentsProgress) ? studentsProgress : []).map((row) => row.student);
      setStudents(onlyStudents);
      setNotifications(Array.isArray(notices) ? notices : []);
      if (onlyStudents.length > 0) {
        setSelectedStudentId((prev) => prev || onlyStudents[0]._id);
      } else {
        setSelectedStudentId("");
      }
    } catch (_e) {
      setError("Failed to load communication workspace.");
    } finally {
      setLoading(false);
      void refreshUnreadSummary();
    }
  }, [refreshUnreadSummary]);

  const loadConversation = useCallback(async (studentId) => {
    if (!studentId) {
      setConversation([]);
      setThreadLoading(false);
      return;
    }
    setThreadLoading(true);
    setError("");
    try {
      const data = await fetchConversation(studentId);
      setConversation(Array.isArray(data) ? data : []);
    } catch (_e) {
      setConversation([]);
      setError("Failed to load conversation.");
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBase();
  }, [loadBase]);

  useEffect(() => {
    loadConversation(selectedStudentId);
  }, [selectedStudentId, loadConversation]);

  const onSend = async (event) => {
    event.preventDefault();
    if (!selectedStudentId || !text.trim()) return;

    setBusy(true);
    setError("");
    try {
      await sendMessageToStudent({ studentId: selectedStudentId, text: text.trim() });
      setText("");
      await loadConversation(selectedStudentId);
    } catch (_e) {
      setError("Failed to send message.");
    } finally {
      setBusy(false);
    }
  };

  const markRead = async (notificationId) => {
    try {
      const updated = await markSupervisorNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) => (item._id === updated._id ? updated : item))
      );
      await refreshUnreadSummary();
    } catch (_e) {
      setError("Failed to mark notification as read.");
    }
  };

  useEffect(() => {
    if (hash !== "#supervisor-notifications") return;
    const el = document.getElementById("supervisor-notifications");
    if (el) {
      window.requestAnimationFrame(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [hash]);

  return (
    <>
      <ErrorMessage message={error} />

      <div className="grid grid2 supervisorCommunicationGrid">
        <section
          id="supervisor-notifications"
          className="card studentOverviewCard studentNotifyPage"
          aria-labelledby="sup-notify-heading"
        >
        <header className="studentOverviewCard__header studentOverviewCard__header--split">
          <div>
            <p className="studentOverviewCard__eyebrow">Inbox</p>
            <h2 id="sup-notify-heading" className="cardTitle">
              Notifications
            </h2>
            <p className="cardHint">Alerts when students submit work or when the system posts an update.</p>
          </div>
          <button type="button" className="button buttonRefresh" onClick={loadBase} disabled={loading}>
            Refresh list
          </button>
        </header>

        <div className="studentOverviewCard__body">
          {loading ? (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading notifications…
            </p>
          ) : null}

          {!loading && notifications.length === 0 ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No notifications</p>
              <p className="studentOverviewEmpty__text">You are caught up. New submission alerts will land here.</p>
            </div>
          ) : null}

          {!loading && notifications.length > 0 ? (
            <ul className="studentNotifyList">
              {notifications.map((notification) => {
                const slug = typeSlug(notification.type);
                const created = notification.createdAt ? new Date(notification.createdAt) : null;
                const iso = created && !Number.isNaN(created.getTime()) ? created.toISOString() : undefined;
                const label = created && !Number.isNaN(created.getTime()) ? created.toLocaleString() : "—";

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
          ) : null}
        </div>
        </section>

        <section className="card studentOverviewCard studentCommThreadPanel" aria-labelledby="sup-comm-heading">
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Messages</p>
            <h2 id="sup-comm-heading" className="cardTitle">
              Student communication
            </h2>
            <p className="cardHint">Choose a student, review the thread, and send guidance or clarifications.</p>
          </div>
        </header>

        <div className="studentOverviewCard__body studentCommThreadBody">
          <div className="studentCommContactsFields">
            <label className="label" htmlFor="sup-comm-student-select">
              Select student
            </label>
            <select
              id="sup-comm-student-select"
              className="select"
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
            >
              <option value="">Choose student</option>
              {students.map((student) => (
                <option key={student._id} value={student._id}>
                  {student.name} ({student.email})
                </option>
              ))}
            </select>
          </div>

          {!loading && students.length === 0 ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No assigned students</p>
              <p className="studentOverviewEmpty__text">
                Students must be linked to your supervised projects before you can message them here.
              </p>
            </div>
          ) : null}

          {!loading && students.length > 0 && !selectedStudentId ? (
            <div className="studentCommThreadPlaceholder">
              <p className="studentCommThreadPlaceholder__title">Select a student</p>
              <p className="studentCommThreadPlaceholder__text">Pick someone from the list above to open their thread.</p>
            </div>
          ) : null}

          {selectedStudentId && threadLoading ? (
            <p className="studentOverviewStatus studentCommThreadStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading messages…
            </p>
          ) : null}

          {selectedStudentId && !threadLoading && conversation.length > 0 ? (
            <ul className="studentCommMessageList" aria-live="polite">
              {conversation.map((message) => {
                const senderId = message.sender?._id || message.sender;
                const isOwn = Boolean(myUserId && senderId && String(senderId) === String(myUserId));
                const created = message.createdAt ? new Date(message.createdAt) : null;
                const iso = created && !Number.isNaN(created.getTime()) ? created.toISOString() : undefined;
                const when = created && !Number.isNaN(created.getTime()) ? created.toLocaleString() : "—";

                return (
                  <li
                    key={message._id}
                    className={`studentCommMessage ${isOwn ? "studentCommMessage--own" : "studentCommMessage--other"}`}
                  >
                    <div className="studentCommMessage__inner">
                      <div className="studentCommMessage__meta">
                        <span className="studentCommMessage__sender">{message.sender?.name || "User"}</span>
                        <time className="studentCommMessage__time" dateTime={iso}>
                          {when}
                        </time>
                      </div>
                      <div className="studentCommMessage__bubble">{message.text}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : null}

          {selectedStudentId && !threadLoading && conversation.length === 0 ? (
            <div className="studentCommThreadPlaceholder studentCommThreadPlaceholder--subtle">
              <p className="studentCommThreadPlaceholder__title">No messages yet</p>
              <p className="studentCommThreadPlaceholder__text">Start the conversation with a clear question or next step.</p>
            </div>
          ) : null}

          {students.length > 0 ? (
            <form className="studentCommComposer" onSubmit={onSend}>
              <label className="label" htmlFor="sup-comm-message-input">
                Message
              </label>
              <textarea
                id="sup-comm-message-input"
                className="textarea studentCommComposer__input"
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Write guidance or feedback…"
                rows={4}
                required
                disabled={busy || !selectedStudentId}
              />
              <div className="studentCommComposer__actions">
                <button
                  type="submit"
                  className="button buttonPrimary studentCommComposer__send"
                  disabled={busy || !selectedStudentId}
                >
                  {busy ? "Sending…" : "Send"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
        </section>
      </div>
    </>
  );
};

export default SupervisorCommunicationPage;
