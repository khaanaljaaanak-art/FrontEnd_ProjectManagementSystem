import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../../services/adminService";

const rolePillClass = (role) => {
  if (role === "supervisor") return "adminListCard__pill--roleSupervisor";
  if (role === "admin") return "adminListCard__pill--roleAdmin";
  return "adminListCard__pill--roleStudent";
};

const formatRoleLabel = (role) =>
  (role || "student").replace(/^\w/, (c) => c.toUpperCase());

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [draft, setDraft] = useState({ name: "", email: "", password: "", role: "student" });
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchUsers();
      const nextUsers = Array.isArray(data) ? data : [];
      setUsers(nextUsers);
      setSelectedUserIds((prev) =>
        prev.filter((id) => nextUsers.some((user) => user._id === id))
      );
    } catch (_e) {
      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const withAction = async (fn, successMessage) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await fn();
      if (successMessage) setMessage(successMessage);
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const onCreate = async (event) => {
    event.preventDefault();
    await withAction(async () => {
      await createUser({
        name: draft.name.trim(),
        email: draft.email.trim(),
        password: draft.password,
        role: draft.role,
      });
      setDraft({ name: "", email: "", password: "", role: "student" });
    }, "User created.");
  };

  const toggleSelection = (userId) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const allSelected = users.length > 0 && selectedUserIds.length === users.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedUserIds([]);
      return;
    }
    setSelectedUserIds(users.map((user) => user._id));
  };

  const onDeleteSelected = async () => {
    if (selectedUserIds.length === 0) return;

    const selectedCount = selectedUserIds.length;
    await withAction(async () => {
      const results = await Promise.allSettled(
        selectedUserIds.map((userId) => deleteUser(userId))
      );

      setSelectedUserIds([]);

      const failed = results.filter((result) => result.status === "rejected");
      if (failed.length > 0) {
        const firstError = failed[0].reason;
        const reason =
          firstError?.response?.data?.message || firstError?.message || "Unknown error.";
        throw new Error(`${failed.length}/${results.length} deletions failed. ${reason}`);
      }
    }, `${selectedCount} user(s) deleted.`);
  };

  return (
    <div className="card">
      <div className="cardHeader">
        <div>
          <p className="cardTitle">User and Role Management</p>
          <p className="cardHint">Create users, update roles, and remove accounts</p>
        </div>
        <button type="button" className="button" onClick={load} disabled={loading}>
          Refresh
        </button>
      </div>

      <ErrorMessage message={error} />
      {message && <p className="helper">{message}</p>}

      <form className="row" onSubmit={onCreate}>
        <input
          className="input"
          placeholder="Name"
          value={draft.name}
          onChange={(e) => setDraft((prev) => ({ ...prev, name: e.target.value }))}
          required
          disabled={busy}
        />
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={draft.email}
          onChange={(e) => setDraft((prev) => ({ ...prev, email: e.target.value }))}
          required
          disabled={busy}
        />
        <input
          className="input"
          type="password"
          placeholder="Password"
          value={draft.password}
          onChange={(e) => setDraft((prev) => ({ ...prev, password: e.target.value }))}
          required
          disabled={busy}
        />
        <select
          className="select"
          value={draft.role}
          onChange={(e) => setDraft((prev) => ({ ...prev, role: e.target.value }))}
          disabled={busy}
        >
          <option value="student">Student</option>
          <option value="supervisor">Supervisor</option>
          <option value="admin">Admin</option>
        </select>
        <button type="submit" className="button buttonPrimary" disabled={busy}>
          Add User
        </button>
      </form>

      <div className="adminListCardToolbar">
        <label>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={toggleSelectAll}
            disabled={busy || loading || users.length === 0}
          />
          Select all
        </label>
        <button
          type="button"
          className="button buttonDanger"
          onClick={onDeleteSelected}
          disabled={busy || selectedUserIds.length === 0}
        >
          Delete Selected ({selectedUserIds.length})
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        <h2 className="adminListCardSectionTitle">Users ({users.length})</h2>
        {loading && <p className="helper" style={{ marginTop: 0 }}>Loading users…</p>}
        {!loading && users.length === 0 && (
          <p className="helper" style={{ marginTop: 0 }}>No users found. Add a user with the form above.</p>
        )}
        <ul className="adminListCardList" style={{ marginTop: 10 }}>
          {users.map((user) => {
            const isRowSelected = selectedUserIds.includes(user._id);
            return (
              <li
                key={user._id}
                className={`adminListCard${isRowSelected ? " adminListCard--selected" : ""}`}
              >
                <div className="adminListCard__body">
                  <div className="adminListCard__top adminListCard__top--withCheck">
                    <label className="adminListCard__check">
                      <input
                        type="checkbox"
                        checked={isRowSelected}
                        onChange={() => toggleSelection(user._id)}
                        disabled={busy}
                        aria-label={`Select ${user.name}`}
                      />
                    </label>
                    <div className="adminListCard__topMain">
                      <h3 className="adminListCard__title">{user.name}</h3>
                      <div className="adminListCard__pills" aria-label="Account role">
                        <span className={`adminListCard__pill ${rolePillClass(user.role)}`}>
                          {formatRoleLabel(user.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="adminListCard__meta">
                    <div className="adminListCard__metaRow">
                      <p className="adminListCard__metaLabel">Email</p>
                      <p className="adminListCard__metaValue">{user.email}</p>
                    </div>
                  </div>
                </div>
                <div className="adminListCard__footer">
                  {user.role !== "student" && (
                    <button
                      type="button"
                      className="button"
                      onClick={() => withAction(() => updateUser(user._id, { role: "student" }), "Role updated.")}
                      disabled={busy}
                    >
                      Set Student
                    </button>
                  )}
                  {user.role !== "supervisor" && (
                    <button
                      type="button"
                      className="button"
                      onClick={() => withAction(() => updateUser(user._id, { role: "supervisor" }), "Role updated.")}
                      disabled={busy}
                    >
                      Set Supervisor
                    </button>
                  )}
                  {user.role !== "admin" && (
                    <button
                      type="button"
                      className="button"
                      onClick={() => withAction(() => updateUser(user._id, { role: "admin" }), "Role updated.")}
                      disabled={busy}
                    >
                      Set Admin
                    </button>
                  )}
                  <button
                    type="button"
                    className="button buttonDanger"
                    onClick={() => withAction(() => deleteUser(user._id), "User deleted.")}
                    disabled={busy}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default AdminUsersPage;
