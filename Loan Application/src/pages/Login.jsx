import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Login Success");
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      const message =
        err.response?.data?.message || err.message || "Login failed. Please try again.";
      alert(message);
    }
  };

  return (
    <main className="login-page">
      <section className="login-container">
        <div className="login-card">
          <div className="login-header">
            <span className="login-badge">Welcome back</span>
            <h2>Login to your account</h2>
            <p>Enter your credentials to continue to the dashboard.</p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>

          <p className="bottom-text">
            Don’t have an account? <a href="#">Sign up</a>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
