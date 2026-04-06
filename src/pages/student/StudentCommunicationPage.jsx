import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  fetchStudentContacts,
  fetchStudentConversation,
  sendStudentMessage,
} from "../../services/studentService";

const StudentCommunicationPage = () => {
  const [contacts, setContacts] = useState({ supervisors: [], admins: [], project: null });
  const [recipientId, setRecipientId] = useState("");
  const [conversation, setConversation] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadContacts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStudentContacts();
      const supervisors = Array.isArray(data?.supervisors) ? data.supervisors : [];
      const admins = Array.isArray(data?.admins) ? data.admins : [];
      setContacts({
        supervisors,
        admins,
        project: data?.project || null,
      });

      const first = supervisors[0]?._id || admins[0]?._id || "";
      setRecipientId((prev) => prev || first);
    } catch (_e) {
      setError("Failed to load contacts.");
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (targetUserId) => {
    if (!targetUserId) {
      setConversation([]);
      return;
    }
    setError("");
    try {
      const data = await fetchStudentConversation(targetUserId);
      setConversation(Array.isArray(data) ? data : []);
    } catch (_e) {
      setError("Failed to load conversation.");
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  useEffect(() => {
    loadConversation(recipientId);
  }, [recipientId]);

  const onSend = async (event) => {
    event.preventDefault();
    if (!recipientId || !text.trim()) return;

    setBusy(true);
    setError("");
    try {
      await sendStudentMessage({
        recipientId,
        text: text.trim(),
        projectId: contacts.project?._id || null,
      });
      setText("");
      await loadConversation(recipientId);
    } catch (_e) {
      setError("Failed to send message.");
    } finally {
      setBusy(false);
    }
  };

  const allContacts = [...contacts.supervisors, ...contacts.admins];

  return (
    <div className="grid grid2">
      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Contacts</p>
            <p className="cardHint">Ask questions to supervisors or admin</p>
          </div>
          <button type="button" className="button" onClick={loadContacts} disabled={loading}>
            Refresh
          </button>
        </div>

        <ErrorMessage message={error} />
        {loading && <p className="helper">Loading contacts…</p>}

        {!loading && (
          <div className="row">
            <div>
              <label className="label">Select Contact</label>
              <select
                className="select"
                value={recipientId}
                onChange={(event) => setRecipientId(event.target.value)}
              >
                <option value="">Choose contact</option>
                {allContacts.map((contact) => (
                  <option key={contact._id} value={contact._id}>
                    {contact.name} ({contact.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {contacts.project && (
          <p className="helper" style={{ marginTop: 10 }}>
            Assigned Project: {contacts.project.title}
          </p>
        )}
      </div>

      <div className="card">
        <div className="cardHeader">
          <div>
            <p className="cardTitle">Conversation</p>
            <p className="cardHint">Discuss requirements, updates, and feedback</p>
          </div>
        </div>

        <ul className="list">
          {conversation.map((message) => (
            <li key={message._id} className="item">
              <p className="itemMeta" style={{ marginTop: 0 }}>
                {message.sender?.name || "User"} · {new Date(message.createdAt).toLocaleString()}
              </p>
              <p style={{ margin: 0 }}>{message.text}</p>
            </li>
          ))}
        </ul>

        {recipientId && conversation.length === 0 && (
          <p className="helper">No conversation yet. Start with your first question.</p>
        )}

        <form onSubmit={onSend} style={{ marginTop: 12 }}>
          <label className="label">Message</label>
          <textarea
            className="textarea"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Ask your supervisor or admin"
            required
            disabled={busy || !recipientId}
          />
          <div className="actions" style={{ marginTop: 10 }}>
            <button
              type="submit"
              className="button buttonPrimary"
              disabled={busy || !recipientId}
            >
              {busy ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentCommunicationPage;
