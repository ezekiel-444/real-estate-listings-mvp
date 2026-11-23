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
    <div
      style={styles.wrapper}
      className="relative left-1/2 isolate w-screen -translate-x-1/2"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black" />
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 1080"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          {Array.from({ length: 300 }, (_, index) => (
            <circle
              key={index}
              cx={(index % 20) * 72 + 36}
              cy={Math.floor(index / 20) * 72 + 36}
              r={36}
              stroke="#1A0000"
              strokeWidth={6}
            />
          ))}
        </svg>
      </div>
      <form
        onSubmit={handleSubmit}
        style={styles.card}
        className="relative z-10 h-auto w-96 max-w-full rounded-3xl bg-[#3D1B1B]"
      >
        <h2 style={styles.title}>Sign In</h2>
        <p style={styles.subtitle}>Access your real estate account</p>

        {error && <div style={styles.error}>{error}</div>}

        <div className="flex w-full flex-col items-center gap-6">
          {/* <label style={styles.label}>Email</label> */}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-12 w-80 max-w-full appearance-none rounded-[120px] border-0 bg-white px-6 text-base font-normal text-neutral-500 shadow-none outline -outline-offset-1 outline-zinc-400 placeholder:text-neutral-500 font-['Inter']"
          />

          {/* <label style={styles.label}>Password</label> */}
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="h-12 w-80 max-w-full appearance-none rounded-[120px] border-0 bg-white px-6 text-base font-normal text-neutral-500 shadow-none outline -outline-offset-1 outline-zinc-400 placeholder:text-neutral-500 font-['Inter']"
          />

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-80 max-w-full items-center justify-center gap-2.5 rounded-[120px] border-0 bg-red-600 px-7 text-base font-normal text-white font-['Inter']"
          >
            {submitting ? "Signing in..." : "Log in"}
          </button>
        </div>

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
    minHeight: "100svh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "1.5rem",
  },
  card: {
    padding: "2rem",
    border: "1px solid #5A2D2D",
  },
  title: { margin: "0 0 0.25rem", fontSize: "1.5rem", color: "#fff" },
  subtitle: { margin: "0 0 1.5rem", fontSize: "0.9rem", color: "#fed7aa" },
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
    color: "#ffedd5",
  },
  footer: {
    marginTop: "1.25rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#fed7aa",
  },
  link: { color: "#fff", fontWeight: "600" },
};
