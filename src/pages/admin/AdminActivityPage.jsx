import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  FolderKanban,
  MessageSquare,
  RefreshCw,
  Shield,
  User,
} from "lucide-react";
import ErrorMessage from "../../components/common/ErrorMessage";
import { fetchActivity } from "../../services/adminService";

const formatWhen = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const roleLabel = (value) => {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "system";
  return raw;
};

const actionLabel = (value) => String(value || "unknown.action");

const actionIcon = (action) => {
  const key = String(action || "").toLowerCase();
  if (key.startsWith("forum.")) return MessageSquare;
  if (key.startsWith("project.")) return FolderKanban;
  if (key.startsWith("submission.")) return ClipboardCheck;
  if (key.startsWith("assessment.")) return BadgeCheck;
  if (key.startsWith("auth.") || key.startsWith("user.") || key.includes("role")) return Shield;
  return Activity;
};

const AdminActivityPage = () => {
  const [activity, setActivity] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const INITIAL_VISIBLE_COUNT = 10;

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

  const visibleActivity = showAll ? activity : activity.slice(0, INITIAL_VISIBLE_COUNT);

  const canShowMore = activity.length > INITIAL_VISIBLE_COUNT;
  const remainingCount = Math.max(0, activity.length - INITIAL_VISIBLE_COUNT);

  const rows = useMemo(
    () =>
      visibleActivity.map((entry) => {
        const action = actionLabel(entry?.action);
        const ActorIcon = entry?.actor ? User : Shield;
        const ActionIcon = actionIcon(action);
        return {
          id: entry?._id || `${action}-${entry?.createdAt || Math.random()}`,
          action,
          actorName: entry?.actor?.name || "System",
          actorRole: roleLabel(entry?.actorRole),
          createdAt: formatWhen(entry?.createdAt),
          ActorIcon,
          ActionIcon,
        };
      }),
    [visibleActivity]
  );

  return (
    <section className="card studentOverviewCard adminActivityCard" aria-labelledby="admin-activity-heading">
      <header className="studentOverviewCard__header studentOverviewCard__header--split">
        <div className="supervisorSetupCard__intro">
          <span className="supervisorSetupCard__introIcon adminActivityCard__icon" aria-hidden>
            <Activity size={22} strokeWidth={2} />
          </span>
          <div>
            <p className="studentOverviewCard__eyebrow">Audit</p>
            <h2 id="admin-activity-heading" className="cardTitle">
              System activity
            </h2>
            <p className="cardHint">A structured log of actions across users and roles.</p>
          </div>
        </div>

        <div className="adminActivityCard__actions">
          {canShowMore ? (
            <button type="button" className="button buttonInlineIcon" onClick={() => setShowAll((prev) => !prev)}>
              {showAll ? <ChevronUp size={16} strokeWidth={2} aria-hidden /> : <ChevronDown size={16} strokeWidth={2} aria-hidden />}
              {showAll ? "Show less" : `Show more (${remainingCount} more)`}
            </button>
          ) : null}
          <button type="button" className="button buttonRefresh buttonInlineIcon" onClick={load} disabled={loading}>
            <RefreshCw size={16} strokeWidth={2} className={loading ? "forumIconSpin" : ""} aria-hidden />
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </header>

      <div className="studentOverviewCard__body adminActivityCard__body">
        <ErrorMessage message={error} />

        {loading ? (
          <p className="studentOverviewStatus" role="status">
            <span className="studentOverviewSpinner" aria-hidden />
            Loading activity…
          </p>
        ) : null}

        {!loading && rows.length === 0 ? (
          <div className="studentOverviewEmpty studentOverviewEmpty--compact">
            <p className="studentOverviewEmpty__title">No activity yet</p>
            <p className="studentOverviewEmpty__text">Events will appear here as users create discussions, submit work, and manage projects.</p>
          </div>
        ) : null}

        {!loading && rows.length > 0 ? (
          <div className={showAll ? "tableWrap adminActivityTableWrap" : "tableWrap"}>
            <table className="table adminActivityTable">
              <thead>
                <tr>
                  <th scope="col">Action</th>
                  <th scope="col">Actor</th>
                  <th scope="col">Role</th>
                  <th scope="col">Time</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <span className="adminActivityAction">
                        <row.ActionIcon size={16} strokeWidth={2} className="adminActivityAction__ico" aria-hidden />
                        <span className="adminActivityAction__text">{row.action}</span>
                      </span>
                    </td>
                    <td>
                      <span className="adminActivityActor">
                        <row.ActorIcon size={16} strokeWidth={2} className="adminActivityActor__ico" aria-hidden />
                        {row.actorName}
                      </span>
                    </td>
                    <td>
                      <span className={`adminActivityChip adminActivityChip--${row.actorRole}`}>{row.actorRole}</span>
                    </td>
                    <td className="adminActivityTime">{row.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default AdminActivityPage;
