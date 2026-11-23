import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>
        <p style={styles.subtitle}>Access your real estate account</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mb-4 h-12 w-80 appearance-none rounded-[120px] border-0 bg-white px-6 text-base font-normal text-neutral-500 shadow-none outline outline-2 outline-offset-[-1px] outline-zinc-400 placeholder:text-neutral-500 font-['Inter']"
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 h-12 w-80 appearance-none rounded-[120px] border-0 bg-white px-6 text-base font-normal text-neutral-500 shadow-none outline outline-2 outline-offset-[-1px] outline-zinc-400 placeholder:text-neutral-500 font-['Inter']"
        />

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? "Signing in..." : "Sign In"}
        </button>

        <p style={styles.footer}>
          Don&apos;t have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create one
          </Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: "80vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
  },
  card: {
    width: "100%",
    maxWidth: "400px",
    background: "#fff",
    padding: "2rem",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },
  title: { margin: "0 0 0.25rem", fontSize: "1.5rem", color: "#0f172a" },
  subtitle: { margin: "0 0 1.5rem", fontSize: "0.9rem", color: "#64748b" },
  error: {
    background: "#fef2f2",
    color: "#b91c1c",
    padding: "0.75rem",
    borderRadius: "6px",
    marginBottom: "1rem",
    fontSize: "0.875rem",
  },
  label: {
    display: "block",
    marginBottom: "0.35rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#334155",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.95rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  footer: {
    marginTop: "1.25rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#64748b",
  },
  link: { color: "#0f172a", fontWeight: "600" },
};
