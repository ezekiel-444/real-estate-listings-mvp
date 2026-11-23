import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(fullName, email, password, role);
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
        className="relative z-10 h-auto min-h-125 w-96 max-w-full rounded-3xl bg-[#3D1B1B]"
      >
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>
          Join as a buyer/renter or real estate agent
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <div className="flex w-full flex-col items-center gap-6">
          <label className="sr-only" htmlFor="register-name">
            Full Name
          </label>
          <input
            id="register-name"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            className="h-12 w-80 max-w-full appearance-none rounded-[120px] border-0 bg-white px-6 text-base font-normal text-neutral-500 shadow-none outline -outline-offset-1 outline-zinc-400 placeholder:text-neutral-500 font-['Inter']"
          />

          <label className="sr-only" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="h-12 w-80 max-w-full appearance-none rounded-[120px] border-0 bg-white px-6 text-base font-normal text-neutral-500 shadow-none outline -outline-offset-1 outline-zinc-400 placeholder:text-neutral-500 font-['Inter']"
          />

          <label className="sr-only" htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (minimum 6 characters)"
            className="h-12 w-80 max-w-full appearance-none rounded-[120px] border-0 bg-white px-6 text-base font-normal text-neutral-500 shadow-none outline -outline-offset-1 outline-zinc-400 placeholder:text-neutral-500 font-['Inter']"
          />

          <label className="sr-only" htmlFor="register-role">
            Account Type
          </label>
          <select
            id="register-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-12 w-80 max-w-full rounded-[120px] border-0 bg-white px-6 text-base font-normal text-neutral-500 shadow-none outline -outline-offset-1 outline-zinc-400 font-['Inter']"
          >
            <option value="user">Buyer / Renter</option>
            <option value="agent">Real Estate Agent</option>
          </select>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-12 w-80 max-w-full items-center justify-center gap-2.5 rounded-[120px] border-0 bg-red-600 px-7 text-base font-normal text-white font-['Inter']"
          >
            {submitting ? "Creating account..." : "Register"}
          </button>
        </div>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in
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
  footer: {
    marginTop: "1.25rem",
    textAlign: "center",
    fontSize: "0.875rem",
    color: "#fed7aa",
  },
  link: { color: "#fff", fontWeight: "600" },
};
