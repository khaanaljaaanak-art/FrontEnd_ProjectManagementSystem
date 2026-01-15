import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Layout from "../components/Layout";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });

      login(res.data.token, res.data.role);

      if (res.data.role === "admin") navigate("/admin");
      if (res.data.role === "supervisor") navigate("/supervisor");
      if (res.data.role === "student") navigate("/student");

    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <Layout
      title="Login"
      subtitle="Sign in to access your dashboard"
    >
      <div className="grid" style={{ maxWidth: 520, margin: "0 auto" }}>
        <div className="card">
          <div className="cardHeader">
            <div>
              <p className="cardTitle">Welcome back</p>
              <p className="cardHint">Use your registered email and password</p>
            </div>
          </div>

          {error && <p className="error">{error}</p>}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div>
                <label className="label">Email</label>
                <input
                  className="input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="label">Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="actions" style={{ marginTop: 14 }}>
              <button type="submit" className="button buttonPrimary">
                Login
              </button>
              <button
                type="button"
                className="button"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </div>

            <p className="helper">
              After login you’ll be redirected based on your role.
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
