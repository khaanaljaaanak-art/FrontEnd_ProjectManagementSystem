import { useEffect, useMemo, useState } from "react";
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
    setThreadLoading(true);
    setError("");
    try {
      const data = await fetchStudentConversation(targetUserId);
      setConversation(Array.isArray(data) ? data : []);
    } catch (_e) {
      setError("Failed to load conversation.");
    } finally {
      setThreadLoading(false);
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
      <section className="card studentOverviewCard" aria-labelledby="comm-contacts-heading">
        <header className="studentOverviewCard__header studentOverviewCard__header--split">
          <div>
            <p className="studentOverviewCard__eyebrow">People</p>
            <h2 id="comm-contacts-heading" className="cardTitle">
              Contacts
            </h2>
            <p className="cardHint">Choose who you are messaging—supervisors for coursework, admins for account help.</p>
          </div>
          <button type="button" className="button buttonRefresh" onClick={loadContacts} disabled={loading}>
            Refresh list
          </button>
        </header>

        <div className="studentOverviewCard__body">
          <ErrorMessage message={error} />

          {loading ? (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading contacts…
            </p>
          ) : null}

          {!loading && allContacts.length === 0 ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No contacts yet</p>
              <p className="studentOverviewEmpty__text">
                When supervisors or administrators are linked to your account, they will appear here.
              </p>
            </div>
          ) : null}

          {!loading && allContacts.length > 0 ? (
            <div className="studentCommContactsFields">
              <label className="label" htmlFor="comm-contact-select">
                Select contact
              </label>
              <select
                id="comm-contact-select"
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
          ) : null}

          {contacts.project ? (
            <div className="studentCommProjectBanner">
              <span className="studentCommProjectBanner__label">Assigned project</span>
              <span className="studentCommProjectBanner__title">{contacts.project.title}</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="card studentOverviewCard studentCommThreadPanel" aria-labelledby="comm-thread-heading">
        <header className="studentOverviewCard__header">
          <div>
            <p className="studentOverviewCard__eyebrow">Thread</p>
            <h2 id="comm-thread-heading" className="cardTitle">
              Conversation
            </h2>
            <p className="cardHint">Requirements, clarifications, and feedback stay in this thread for easy reference.</p>
          </div>
        </header>

        <div className="studentOverviewCard__body studentCommThreadBody">
          {recipientId && threadLoading ? (
            <p className="studentOverviewStatus studentCommThreadStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading messages…
            </p>
          ) : null}

          {!threadLoading && !recipientId && allContacts.length > 0 ? (
            <div className="studentCommThreadPlaceholder">
              <p className="studentCommThreadPlaceholder__title">Select a contact</p>
              <p className="studentCommThreadPlaceholder__text">Pick someone from the list on the left to load their thread.</p>
            </div>
          ) : null}

          {recipientId && !threadLoading && conversation.length > 0 ? (
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

          {recipientId && !threadLoading && conversation.length === 0 ? (
            <div className="studentCommThreadPlaceholder studentCommThreadPlaceholder--subtle">
              <p className="studentCommThreadPlaceholder__title">No messages yet</p>
              <p className="studentCommThreadPlaceholder__text">Send a first note below—keep it specific so they can help quickly.</p>
            </div>
          ) : null}

          <form className="studentCommComposer" onSubmit={onSend}>
            <label className="label" htmlFor="comm-message-input">
              Message
            </label>
            <textarea
              id="comm-message-input"
              className="textarea studentCommComposer__input"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Ask your supervisor or admin…"
              rows={4}
              required
              disabled={busy || !recipientId}
            />
            <div className="studentCommComposer__actions">
              <button type="submit" className="button buttonPrimary studentCommComposer__send" disabled={busy || !recipientId}>
                {busy ? "Sending…" : "Send"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
};

export default StudentCommunicationPage;
