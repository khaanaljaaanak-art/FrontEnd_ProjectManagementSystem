import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, MessageSquare, MessageSquareReply, RefreshCw } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { useAuth } from "../../context/AuthContext";
import {
  createReply,
  fetchDiscussion,
  fetchReplies,
  moderateDiscussion,
  removeDiscussion,
  removeReply,
  updateDiscussion,
  updateReply,
} from "../../services/forumService";

const roleBase = (pathname) => {
  if (pathname.startsWith("/admin/")) return "/admin";
  if (pathname.startsWith("/supervisor/")) return "/supervisor";
  return "/student";
};

const decodeUserId = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return "";
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload?.id || "";
  } catch (_e) {
    return "";
  }
};

const formatWhen = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const ForumThreadPage = () => {
  const { discussionId } = useParams();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const base = useMemo(() => `${roleBase(pathname)}/forum`, [pathname]);
  const myUserId = useMemo(() => decodeUserId(), []);

  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [replyBody, setReplyBody] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  const [confirmDeleteDiscussion, setConfirmDeleteDiscussion] = useState(false);
  const [confirmDeleteReplyId, setConfirmDeleteReplyId] = useState("");

  const [editingReplyId, setEditingReplyId] = useState("");
  const [editingReplyBody, setEditingReplyBody] = useState("");

  const canEditDiscussion = useMemo(() => {
    if (!discussion) return false;
    const authorId = discussion.author?._id || discussion.author;
    return isAdmin || (myUserId && authorId && String(authorId) === String(myUserId));
  }, [discussion, isAdmin, myUserId]);

  const loadDiscussion = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDiscussion(discussionId);
      setDiscussion(data || null);
      setEditTitle(data?.title || "");
      setEditBody(data?.body || "");
    } catch (_e) {
      setError("Failed to load discussion.");
      setDiscussion(null);
    } finally {
      setLoading(false);
    }
  };

  const loadReplies = async () => {
    setThreadLoading(true);
    setError("");
    try {
      const data = await fetchReplies(discussionId, { page: 1, limit: 50 });
      setReplies(Array.isArray(data?.items) ? data.items : []);
    } catch (_e) {
      setError("Failed to load replies.");
      setReplies([]);
    } finally {
      setThreadLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussion();
    loadReplies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discussionId]);

  const onPostReply = async (event) => {
    event.preventDefault();
    if (!replyBody.trim()) return;
    setBusy(true);
    setError("");
    try {
      await createReply(discussionId, { body: replyBody.trim() });
      setReplyBody("");
      await Promise.all([loadDiscussion(), loadReplies()]);
    } catch (_e) {
      setError("Failed to post reply.");
    } finally {
      setBusy(false);
    }
  };

  const onSaveDiscussion = async () => {
    if (!editTitle.trim() || !editBody.trim()) return;
    setBusy(true);
    setError("");
    try {
      const updated = await updateDiscussion(discussionId, {
        title: editTitle.trim(),
        body: editBody.trim(),
      });
      setDiscussion(updated || discussion);
      setEditMode(false);
    } catch (_e) {
      setError("Failed to update discussion.");
    } finally {
      setBusy(false);
    }
  };

  const onToggleModeration = async (patch) => {
    setBusy(true);
    setError("");
    try {
      const updated = await moderateDiscussion(discussionId, patch);
      setDiscussion(updated || discussion);
    } catch (_e) {
      setError("Failed to update moderation.");
    } finally {
      setBusy(false);
    }
  };

  const onDeleteDiscussion = async () => {
    setBusy(true);
    setError("");
    try {
      await removeDiscussion(discussionId);
      navigate(base);
    } catch (_e) {
      setError("Failed to remove discussion.");
    } finally {
      setBusy(false);
      setConfirmDeleteDiscussion(false);
    }
  };

  const startEditReply = (reply) => {
    setEditingReplyId(reply._id);
    setEditingReplyBody(reply.body || "");
  };

  const cancelEditReply = () => {
    setEditingReplyId("");
    setEditingReplyBody("");
  };

  const saveEditReply = async () => {
    if (!editingReplyId || !editingReplyBody.trim()) return;
    setBusy(true);
    setError("");
    try {
      await updateReply(editingReplyId, { body: editingReplyBody.trim() });
      cancelEditReply();
      await loadReplies();
    } catch (_e) {
      setError("Failed to update reply.");
    } finally {
      setBusy(false);
    }
  };

  const confirmRemoveReply = (replyId) => setConfirmDeleteReplyId(replyId);

  const onRemoveReplyConfirmed = async () => {
    if (!confirmDeleteReplyId) return;
    setBusy(true);
    setError("");
    try {
      await removeReply(confirmDeleteReplyId);
      setConfirmDeleteReplyId("");
      await Promise.all([loadDiscussion(), loadReplies()]);
    } catch (_e) {
      setError("Failed to remove reply.");
    } finally {
      setBusy(false);
    }
  };

  const createdWhen = discussion?.createdAt ? formatWhen(discussion.createdAt) : "—";
  const lastWhen = discussion?.lastReplyAt ? formatWhen(discussion.lastReplyAt) : createdWhen;

  if (loading) {
    return (
      <div className="card forumThreadLoading" role="status">
        <p className="studentOverviewStatus">
          <span className="studentOverviewSpinner" aria-hidden />
          Loading discussion…
        </p>
      </div>
    );
  }

  if (!discussion) {
    return (
      <div className="card">
        <ErrorMessage message={error || "Discussion not found."} />
        <div className="actions">
          <button type="button" className="button buttonInlineIcon" onClick={() => navigate(base)}>
            <ArrowLeft size={16} strokeWidth={2} aria-hidden /> Back to forum
          </button>
        </div>
      </div>
    );
  }

  const authorName = discussion.author?.name || "User";
  const authorRole = discussion.author?.role || "—";
  const isLocked = Boolean(discussion.isLocked);
  const isPinned = Boolean(discussion.isPinned);

  return (
    <div className="workflow forumShell">
      <ErrorMessage message={error} />

      <section className="card forumThread" aria-label="Discussion">
        <header className="forumThread__head">
          <div className="forumThread__headLeft">
            <button type="button" className="button forumBackBtn buttonInlineIcon" onClick={() => navigate(base)}>
              <ArrowLeft size={16} strokeWidth={2} aria-hidden /> Back
            </button>
            <div className="supervisorSetupCard__intro forumThread__titleIntro">
              <span className="supervisorSetupCard__introIcon forumThread__titleIconWrap" aria-hidden>
                <MessageSquare size={20} strokeWidth={2} />
              </span>
              <div className="forumThread__titleBlock">
                <p className="forumThread__eyebrow">Discussion</p>
                {!editMode ? <h2 className="forumThread__title">{discussion.title}</h2> : null}
                <div className="forumThread__metaRow">
                  <span className="forumChip">{authorName}</span>
                  <span className={`forumChip forumChip--role forumChip--role-${authorRole}`}>{authorRole}</span>
                  {isPinned ? <span className="forumChip forumChip--pinned">Pinned</span> : null}
                  {isLocked ? <span className="forumChip forumChip--locked">Locked</span> : null}
                  <span className="forumThread__meta">
                    Created <strong>{createdWhen}</strong> · Last activity <strong>{lastWhen}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="forumThread__headRight">
            {canEditDiscussion ? (
              <>
                {!editMode ? (
                  <button type="button" className="button" onClick={() => setEditMode(true)} disabled={busy}>
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      className="button"
                      onClick={() => {
                        setEditMode(false);
                        setEditTitle(discussion.title || "");
                        setEditBody(discussion.body || "");
                      }}
                      disabled={busy}
                    >
                      Cancel
                    </button>
                    <button type="button" className="button buttonPrimary" onClick={onSaveDiscussion} disabled={busy}>
                      {busy ? "Saving…" : "Save"}
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="button buttonDanger"
                  onClick={() => setConfirmDeleteDiscussion(true)}
                  disabled={busy}
                >
                  Remove
                </button>
              </>
            ) : null}

            {isAdmin ? (
              <div className="forumAdminActions" aria-label="Admin actions">
                <button
                  type="button"
                  className="button"
                  onClick={() => onToggleModeration({ isPinned: !isPinned })}
                  disabled={busy}
                >
                  {isPinned ? "Unpin" : "Pin"}
                </button>
                <button
                  type="button"
                  className="button"
                  onClick={() => onToggleModeration({ isLocked: !isLocked })}
                  disabled={busy}
                >
                  {isLocked ? "Unlock" : "Lock"}
                </button>
              </div>
            ) : null}
          </div>
        </header>

        {!editMode ? (
          <div className="forumThread__body">
            <p className="forumThread__content">{discussion.body}</p>
          </div>
        ) : (
          <div className="forumThread__edit">
            <div className="row">
              <div>
                <label className="label" htmlFor="forum-edit-title">
                  Title
                </label>
                <input
                  id="forum-edit-title"
                  className="input"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  maxLength={140}
                  disabled={busy}
                />
              </div>
              <div>
                <label className="label" htmlFor="forum-edit-body">
                  Body
                </label>
                <textarea
                  id="forum-edit-body"
                  className="textarea"
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  rows={9}
                  disabled={busy}
                />
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="card forumReplies" aria-label="Replies">
        <header className="cardHeader forumReplies__head">
          <div className="supervisorSetupCard__intro forumReplies__intro">
            <span className="supervisorSetupCard__introIcon forumReplies__leadIcon" aria-hidden>
              <MessageSquareReply size={22} strokeWidth={2} />
            </span>
            <div>
              <p className="cardTitle">Replies</p>
              <p className="cardHint">Keep replies focused—include links, steps, and decisions.</p>
            </div>
          </div>
          <button
            type="button"
            className="button buttonRefresh buttonInlineIcon"
            onClick={() => loadReplies()}
            disabled={threadLoading}
          >
            <RefreshCw size={16} strokeWidth={2} className={threadLoading ? "forumIconSpin" : ""} aria-hidden /> Refresh
          </button>
        </header>

        <div className="forumReplies__body">
          {threadLoading ? (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading replies…
            </p>
          ) : null}

          {!threadLoading && replies.length === 0 ? (
            <div className="studentOverviewEmpty studentOverviewEmpty--compact">
              <p className="studentOverviewEmpty__title">No replies yet</p>
              <p className="studentOverviewEmpty__text">Add the first reply below to move the discussion forward.</p>
            </div>
          ) : null}

          {!threadLoading && replies.length > 0 ? (
            <ul className="forumReplyList" aria-live="polite">
              {replies.map((reply) => {
                const authorId = reply.author?._id || reply.author;
                const own = Boolean(myUserId && authorId && String(authorId) === String(myUserId));
                const canEdit = own || isAdmin;
                const created = formatWhen(reply.createdAt);

                return (
                  <li key={reply._id} className="forumReply">
                    <div className="forumReply__meta">
                      <span className="forumReply__author">{reply.author?.name || "User"}</span>
                      <span className={`forumChip forumChip--role forumChip--role-${reply.author?.role || "unknown"}`}>
                        {reply.author?.role || "—"}
                      </span>
                      <span className="forumReply__time">{created}</span>
                      {canEdit ? (
                        <span className="forumReply__actions">
                          {editingReplyId !== reply._id ? (
                            <>
                              <button type="button" className="button forumMiniBtn" onClick={() => startEditReply(reply)} disabled={busy}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="button buttonDanger forumMiniBtn"
                                onClick={() => confirmRemoveReply(reply._id)}
                                disabled={busy}
                              >
                                Remove
                              </button>
                            </>
                          ) : null}
                        </span>
                      ) : null}
                    </div>

                    {editingReplyId === reply._id ? (
                      <div className="forumReply__edit">
                        <textarea
                          className="textarea"
                          value={editingReplyBody}
                          onChange={(e) => setEditingReplyBody(e.target.value)}
                          rows={4}
                          disabled={busy}
                        />
                        <div className="actions">
                          <button type="button" className="button" onClick={cancelEditReply} disabled={busy}>
                            Cancel
                          </button>
                          <button type="button" className="button buttonPrimary" onClick={saveEditReply} disabled={busy}>
                            {busy ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="forumReply__body">{reply.body}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}

          <form className="forumReplyComposer" onSubmit={onPostReply}>
            <label className="label forumToolbar__labelIcon" htmlFor="forum-reply-body">
              <MessageSquareReply size={15} strokeWidth={2} aria-hidden /> Reply
            </label>
            <textarea
              id="forum-reply-body"
              className="textarea"
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={isLocked ? "This discussion is locked." : "Write a reply…"}
              rows={5}
              disabled={busy || isLocked}
              required
            />
            {isLocked ? (
              <p className="helper forumLockedHint">This discussion is locked by an administrator. New replies are disabled.</p>
            ) : null}
            <div className="actions">
              <button type="submit" className="button buttonPrimary" disabled={busy || isLocked}>
                {busy ? "Posting…" : "Post reply"}
              </button>
            </div>
          </form>
        </div>
      </section>

      <ConfirmDialog
        open={confirmDeleteDiscussion}
        title="Remove discussion?"
        message="This will remove the discussion from the forum feed."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        busy={busy}
        onCancel={() => setConfirmDeleteDiscussion(false)}
        onConfirm={onDeleteDiscussion}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteReplyId)}
        title="Remove reply?"
        message="This will remove the reply from the thread."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        busy={busy}
        onCancel={() => setConfirmDeleteReplyId("")}
        onConfirm={onRemoveReplyConfirmed}
      />
    </div>
  );
};

export default ForumThreadPage;

