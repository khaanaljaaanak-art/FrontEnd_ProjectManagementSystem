import { useEffect, useState } from "react";
import ErrorMessage from "../../components/common/ErrorMessage";
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from "../../services/adminService";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
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
      setUsers(Array.isArray(data) ? data : []);
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

      {loading && <p className="helper">Loading users…</p>}

      <ul className="list" style={{ marginTop: 12 }}>
        {users.map((user) => (
          <li key={user._id} className="item">
            <p className="itemTitle">{user.name}</p>
            <p className="itemMeta">{user.email} · {user.role}</p>
            <div className="actions">
              <button
                type="button"
                className="button"
                onClick={() => withAction(() => updateUser(user._id, { role: "student" }), "Role updated.")}
                disabled={busy}
              >
                Set Student
              </button>
              <button
                type="button"
                className="button"
                onClick={() => withAction(() => updateUser(user._id, { role: "supervisor" }), "Role updated.")}
                disabled={busy}
              >
                Set Supervisor
              </button>
              <button
                type="button"
                className="button"
                onClick={() => withAction(() => updateUser(user._id, { role: "admin" }), "Role updated.")}
                disabled={busy}
              >
                Set Admin
              </button>
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
        ))}
      </ul>
    </div>
  );
};

export default AdminUsersPage;
