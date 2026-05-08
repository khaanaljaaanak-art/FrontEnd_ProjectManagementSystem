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

      if (res.data.role === "admin") navigate("/admin/projects");
      if (res.data.role === "supervisor") navigate("/supervisor/grading");
      if (res.data.role === "student") navigate("/student/overview");

    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <Layout
      title="Login"
      subtitle="Sign in to access your dashboard"
    >
      <div className="authShell">
        <div className="authGrid">
          <section className="authIntro" aria-label="Platform overview">
            <div className="authIntro__badge">Project Management System</div>
            <h2 className="authIntro__title">Plan. Submit. Review. Track.</h2>
            <p className="authIntro__text">
              A single workspace for managing projects, assessment timelines, submissions, grading, and communication.
            </p>

            <div className="authFeatureList" role="list">
              <div className="authFeature" role="listitem">
                <div className="authFeature__icon" aria-hidden>
                  ✓
                </div>
                <div className="authFeature__body">
                  <p className="authFeature__title">Structured workflow</p>
                  <p className="authFeature__text">Clear steps for project selection and assessment management.</p>
                </div>
              </div>
              <div className="authFeature" role="listitem">
                <div className="authFeature__icon" aria-hidden>
                  ✓
                </div>
                <div className="authFeature__body">
                  <p className="authFeature__title">Submission tracking</p>
                  <p className="authFeature__text">Monitor progress signals and timeline health at a glance.</p>
                </div>
              </div>
              <div className="authFeature" role="listitem">
                <div className="authFeature__icon" aria-hidden>
                  ✓
                </div>
                <div className="authFeature__body">
                  <p className="authFeature__title">Role-based portals</p>
                  <p className="authFeature__text">Admin, supervisor, and student dashboards with focused tools.</p>
                </div>
              </div>
            </div>

            <div className="authIllustration" aria-hidden>
              <div className="authBlob authBlob--blue" />
              <div className="authBlob authBlob--teal" />
              <div className="authBlob authBlob--orange" />
            </div>
          </section>

          <section className="card authCard" aria-label="Login form">
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
                    autoComplete="email"
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
                    autoComplete="current-password"
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
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
