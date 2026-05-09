import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownWideNarrow,
  ListTodo,
  MessageCircle,
  MessagesSquare,
  PenLine,
  Plus,
  RefreshCw,
  Search,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ErrorMessage from "../../components/common/ErrorMessage";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { createDiscussion, fetchDiscussions } from "../../services/forumService";

const roleBase = (pathname) => {
  if (pathname.startsWith("/admin/")) return "/admin";
  if (pathname.startsWith("/supervisor/")) return "/supervisor";
  return "/student";
};

const formatWhen = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const excerpt = (text, max = 180) => {
  if (!text) return "";
  const normalized = String(text).replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trim()}…`;
};

const ForumListPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const base = useMemo(() => `${roleBase(pathname)}/forum`, [pathname]);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ items: [], totalPages: 1, total: 0, limit: 12 });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [composerOpen, setComposerOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  const load = async ({ nextPage = page } = {}) => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDiscussions({ q, sort, page: nextPage, limit: 12 });
      setResult({
        items: Array.isArray(data?.items) ? data.items : [],
        totalPages: Number.isFinite(data?.totalPages) ? data.totalPages : 1,
        total: Number.isFinite(data?.total) ? data.total : 0,
        limit: Number.isFinite(data?.limit) ? data.limit : 12,
      });
      setPage(Number.isFinite(data?.page) ? data.page : nextPage);
    } catch (_e) {
      setError("Failed to load forum discussions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load({ nextPage: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  const onSearch = async (event) => {
    event.preventDefault();
    await load({ nextPage: 1 });
  };

  const openThread = (discussionId) => navigate(`${base}/${discussionId}`);

  const onCreate = async (event) => {
    event.preventDefault();
    const title = newTitle.trim();
    const body = newBody.trim();
    if (!title || !body) return;
    setBusy(true);
    setError("");
    try {
      const created = await createDiscussion({ title, body });
      setNewTitle("");
      setNewBody("");
      setComposerOpen(false);
      await load({ nextPage: 1 });
      if (created?._id) {
        openThread(created._id);
      }
    } catch (_e) {
      setError("Failed to create discussion.");
    } finally {
      setBusy(false);
    }
  };

  const onCloseComposer = () => {
    if (newTitle.trim() || newBody.trim()) {
      setConfirmDiscard(true);
      return;
    }
    setComposerOpen(false);
  };

  const hasPrev = page > 1;
  const hasNext = page < result.totalPages;

  return (
    <div className="workflow forumShell">
      <ErrorMessage message={error} />

      <section className="card forumHero" aria-label="Forum overview">
        <div className="forumHero__head">
          <div className="supervisorSetupCard__intro forumHero__intro">
            <span className="supervisorSetupCard__introIcon" aria-hidden>
              <MessagesSquare size={22} strokeWidth={2} />
            </span>
            <div>
              <p className="forumHero__eyebrow">Forum</p>
              <h2 className="forumHero__title">Team discussions</h2>
              <p className="forumHero__hint">
                Create a discussion, ask for help, or share updates. Replies keep the full context in one place.
              </p>
            </div>
          </div>
          <div className="forumHero__actions">
            <button
              type="button"
              className="button buttonPrimary buttonInlineIcon"
              onClick={() => setComposerOpen(true)}
            >
              <Plus size={18} strokeWidth={2} aria-hidden /> New discussion
            </button>
          </div>
        </div>

        <form className="forumToolbar" onSubmit={onSearch}>
          <div className="forumToolbar__field">
            <label className="label forumToolbar__labelIcon" htmlFor="forum-q">
              <Search size={15} strokeWidth={2} aria-hidden /> Search
            </label>
            <input
              id="forum-q"
              className="input"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search titles and content…"
            />
          </div>

          <div className="forumToolbar__field forumToolbar__field--sort">
            <label className="label forumToolbar__labelIcon" htmlFor="forum-sort">
              <ArrowDownWideNarrow size={15} strokeWidth={2} aria-hidden /> Sort
            </label>
            <select id="forum-sort" className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="latest">Latest activity</option>
              <option value="new">Newest</option>
              <option value="top">Most replied</option>
            </select>
          </div>

          <div className="forumToolbar__actions">
            <button type="submit" className="button buttonInlineIcon" disabled={loading}>
              <Search size={16} strokeWidth={2} aria-hidden /> {loading ? "Searching…" : "Search"}
            </button>
            <button
              type="button"
              className="button buttonRefresh buttonInlineIcon"
              onClick={() => load({ nextPage: 1 })}
              disabled={loading}
            >
              <RefreshCw size={16} strokeWidth={2} className={loading ? "forumIconSpin" : ""} aria-hidden /> Refresh
            </button>
          </div>
        </form>
      </section>

      {composerOpen ? (
        <section className="card forumComposer" aria-label="Create discussion">
          <header className="forumComposer__head">
            <div className="supervisorSetupCard__intro forumComposer__intro">
              <span className="supervisorSetupCard__introIcon forumComposer__leadIcon" aria-hidden>
                <PenLine size={22} strokeWidth={2} />
              </span>
              <div>
                <p className="forumComposer__eyebrow">New discussion</p>
                <p className="forumComposer__hint">
                  Keep the title specific. Use the first post to provide context and what you need.
                </p>
              </div>
            </div>
            <button type="button" className="button" onClick={onCloseComposer} disabled={busy}>
              Close
            </button>
          </header>

          <form className="forumComposer__form" onSubmit={onCreate}>
            <div className="row">
              <div>
                <label className="label" htmlFor="forum-new-title">
                  Title
                </label>
                <input
                  id="forum-new-title"
                  className="input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Need help with submission requirements"
                  maxLength={140}
                  required
                  disabled={busy}
                />
              </div>
              <div>
                <label className="label" htmlFor="forum-new-body">
                  Discussion
                </label>
                <textarea
                  id="forum-new-body"
                  className="textarea"
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Describe the problem, what you tried, and what outcome you expect…"
                  rows={7}
                  required
                  disabled={busy}
                />
              </div>
            </div>

            <div className="actions forumComposer__actions">
              <button type="submit" className="button buttonPrimary" disabled={busy}>
                {busy ? "Posting…" : "Post discussion"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section className="card forumFeed" aria-label="Discussion feed">
        <header className="cardHeader forumFeed__head">
          <div className="supervisorSetupCard__intro forumFeed__intro">
            <span className="supervisorSetupCard__introIcon forumFeed__leadIcon" aria-hidden>
              <ListTodo size={22} strokeWidth={2} />
            </span>
            <div>
              <p className="cardTitle">Discussions</p>
              <p className="cardHint">
                {loading ? "Loading…" : `${result.total} total discussions`}
              </p>
            </div>
          </div>
          <div className="forumPager">
            <button type="button" className="button" onClick={() => load({ nextPage: page - 1 })} disabled={!hasPrev || loading}>
              Previous
            </button>
            <span className="forumPager__meta">
              Page <strong>{page}</strong> of <strong>{result.totalPages}</strong>
            </span>
            <button type="button" className="button" onClick={() => load({ nextPage: page + 1 })} disabled={!hasNext || loading}>
              Next
            </button>
          </div>
        </header>

        <div className="forumFeed__body">
          {loading ? (
            <p className="studentOverviewStatus" role="status">
              <span className="studentOverviewSpinner" aria-hidden />
              Loading discussions…
            </p>
          ) : null}

          {!loading && result.items.length === 0 ? (
            <div className="studentOverviewEmpty">
              <p className="studentOverviewEmpty__title">No discussions yet</p>
              <p className="studentOverviewEmpty__text">Be the first to start one—ask a question, propose an idea, or share an update.</p>
            </div>
          ) : null}

          {!loading && result.items.length > 0 ? (
            <ul className="forumList">
              {result.items.map((item) => (
                <li key={item._id}>
                  <button type="button" className="forumCard" onClick={() => openThread(item._id)}>
                    <span className="forumCard__glyph" aria-hidden>
                      <MessageCircle size={22} strokeWidth={2} />
                    </span>
                    <div className="forumCard__main">
                      <div className="forumCard__top">
                        <div className="forumCard__titleRow">
                          <p className="forumCard__title">{item.title}</p>
                          <div className="forumCard__chips" aria-label="Discussion status">
                            {item.isPinned ? <span className="forumChip forumChip--pinned">Pinned</span> : null}
                            {item.isLocked ? <span className="forumChip forumChip--locked">Locked</span> : null}
                          </div>
                        </div>
                        <p className="forumCard__excerpt">{excerpt(item.body)}</p>
                      </div>
                      <div className="forumCard__meta">
                        <span className="forumMeta">
                          <span className="forumMeta__label">Author</span>
                          <span className="forumMeta__value">{item.author?.name || "User"}</span>
                        </span>
                        <span className="forumMeta">
                          <span className="forumMeta__label">Role</span>
                          <span className="forumMeta__value">{item.author?.role || "—"}</span>
                        </span>
                        <span className="forumMeta">
                          <span className="forumMeta__label">Replies</span>
                          <span className="forumMeta__value">{Number.isFinite(item.replyCount) ? item.replyCount : 0}</span>
                        </span>
                        <span className="forumMeta forumMeta--right">
                          <span className="forumMeta__label">Last activity</span>
                          <span className="forumMeta__value">{formatWhen(item.lastReplyAt || item.createdAt)}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard draft?"
        message="You have a draft discussion. Closing will discard it."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          setNewTitle("");
          setNewBody("");
          setComposerOpen(false);
        }}
      />
    </div>
  );
};

export default ForumListPage;

