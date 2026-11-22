import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await register(fullName, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Join as a buyer/renter or real estate agent</p>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Full Name</label>
        <input
          type="text"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Ani Loladze"
          style={styles.input}
        />

        <label style={styles.label}>Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ani@example.com"
          style={styles.input}
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Minimum 6 characters"
          style={styles.input}
        />

        <label style={styles.label}>Account Type</label>
        <select value={role} onChange={(e) => setRole(e.target.value)} style={styles.input}>
          <option value="user">Buyer / Renter</option>
          <option value="agent">Real Estate Agent</option>
        </select>

        <button type="submit" disabled={submitting} style={styles.button}>
          {submitting ? 'Creating account...' : 'Register'}
        </button>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </form>
    </div>
  );
}

const styles = {
  wrapper: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' },
  card: { width: '100%', maxWidth: '400px', background: '#fff', padding: '2rem', borderRadius: '8px', border: '1px solid #e2e8f0' },
  title: { margin: '0 0 0.25rem', fontSize: '1.5rem', color: '#0f172a' },
  subtitle: { margin: '0 0 1.5rem', fontSize: '0.9rem', color: '#64748b' },
  error: { background: '#fef2f2', color: '#b91c1c', padding: '0.75rem', borderRadius: '6px', marginBottom: '1rem', fontSize: '0.875rem' },
  label: { display: 'block', marginBottom: '0.35rem', fontSize: '0.875rem', fontWeight: '600', color: '#334155' },
  input: { width: '100%', padding: '0.65rem 0.75rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', boxSizing: 'border-box' },
  button: { width: '100%', padding: '0.75rem', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' },
  footer: { marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#64748b' },
  link: { color: '#0f172a', fontWeight: '600' },
};