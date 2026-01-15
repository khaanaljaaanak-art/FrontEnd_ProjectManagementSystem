import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Layout from "../components/Layout";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });
    setSubmitting(true);

    try {
      await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
      });

      setStatus({ type: "success", message: "Account created. Please login." });
      setTimeout(() => navigate("/"), 600);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        "Signup failed. Please check your details.";
      setStatus({ type: "error", message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Sign Up" subtitle="Create an account to continue">
      <div className="grid" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="card">
          <div className="cardHeader">
            <div>
              <p className="cardTitle">Create your account</p>
              <p className="cardHint">Choose your role and register</p>
            </div>
          </div>

          {status.type === "error" && (
            <p className="error">{status.message}</p>
          )}
          {status.type === "success" && (
            <p className="helper">{status.message}</p>
          )}

          <form onSubmit={onSubmit}>
            <div className="row">
              <div>
                <label className="label">Name</label>
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                />
              </div>

              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div>
                <label className="label">Role</label>
                <select
                  className="select"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="student">Student</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Admin</option>
                </select>
                <p className="helper">
                  For production, role assignment should be restricted.
                </p>
              </div>
            </div>

            <div className="actions" style={{ marginTop: 14 }}>
              <button
                type="submit"
                className="button buttonPrimary"
                disabled={submitting}
              >
                {submitting ? "Creating…" : "Create Account"}
              </button>
              <button
                type="button"
                className="button"
                onClick={() => navigate("/")}
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
