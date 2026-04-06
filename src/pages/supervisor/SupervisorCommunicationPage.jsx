import { useCallback, useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  fetchAssignedStudentsProgress,
  fetchConversation,
  fetchSupervisorNotifications,
  markSupervisorNotificationAsRead,
  sendMessageToStudent,
} from "../../services/supervisorService";

const SupervisorCommunicationPage = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [conversation, setConversation] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadBase = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [studentsProgress, notices] = await Promise.all([
        fetchAssignedStudentsProgress(),
        fetchSupervisorNotifications(),
      ]);
      const onlyStudents = (Array.isArray(studentsProgress) ? studentsProgress : []).map(
        (row) => row.student
      );
      setStudents(onlyStudents);
      setNotifications(Array.isArray(notices) ? notices : []);
      if (onlyStudents.length > 0) {
        setSelectedStudentId((prev) => prev || onlyStudents[0]._id);
      }
    } catch (_e) {
      setError("Failed to load communication workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadConversation = useCallback(async (studentId) => {
    if (!studentId) {
      setConversation([]);
      return;
    }
    setError("");
    try {
      const data = await fetchConversation(studentId);
      setConversation(Array.isArray(data) ? data : []);
    } catch (_e) {
      setConversation([]);
      setError("Failed to load conversation.");
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
    } catch (_e) {
      setError("Failed to mark notification as read.");
    }
  };

  return (
    <div className="grid grid2">
      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Supervisor Notifications</p>
            <p className="cardHint">Get alerted when students submit new work</p>
          </div>
          <button type="button" className="button" onClick={loadBase} disabled={loading}>
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
              <p className="helper">{new Date(notification.createdAt).toLocaleString()}</p>
              {!notification.isRead && (
                <button
                  type="button"
                  className="button"
                  onClick={() => markRead(notification._id)}
                >
                  Mark as Read
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Student Communication</p>
            <p className="cardHint">Share guidance and feedback directly with students</p>
          </div>
        </div>

        <div className="row">
          <div>
            <label className="label">Select Student</label>
            <select
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
        </div>

        <div className="card" style={{ marginTop: 12, padding: 12 }}>
          <p className="cardTitle" style={{ margin: 0 }}>Conversation</p>
          <ul className="list" style={{ marginTop: 10 }}>
            {conversation.map((message) => (
              <li key={message._id} className="item">
                <p className="itemMeta" style={{ marginTop: 0 }}>
                  {message.sender?.name || "User"} · {new Date(message.createdAt).toLocaleString()}
                </p>
                <p style={{ margin: 0 }}>{message.text}</p>
              </li>
            ))}
          </ul>
          {selectedStudentId && conversation.length === 0 && (
            <p className="helper">No messages yet for this student.</p>
          )}
        </div>

        <form onSubmit={onSend} style={{ marginTop: 12 }}>
          <label className="label">Message</label>
          <textarea
            className="textarea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Write guidance or feedback"
            required
            disabled={busy || !selectedStudentId}
          />
          <div className="actions" style={{ marginTop: 10 }}>
            <button
              type="submit"
              className="button buttonPrimary"
              disabled={busy || !selectedStudentId}
            >
              {busy ? "Sending…" : "Send Message"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupervisorCommunicationPage;
