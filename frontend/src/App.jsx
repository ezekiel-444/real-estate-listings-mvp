import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import EditingPage from './pages/EditingPage';

// Minimal status bar for testing auth — Member C will replace with Figma Navbar
function DevAuthBar() {
  const { user, logout } = useAuth();
  return (
    <header style={{ display: 'flex', gap: '1rem', padding: '0.75rem 1.5rem', borderBottom: '1px solid #e2e8f0' }}>
      <Link to="/">Home</Link>
      {user ? (
        <>
          <span>Logged in as <strong>{user.email}</strong> ({user.role})</span>
          <Link to="/agent-test">Test Agent Route</Link>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
          <Link to="/editing">Editing Page</Link>
        </>
      )}
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DevAuthBar />
        <Routes>
          <Route path="/" element={<main style={{ padding: '1.5rem' }}><h1>Real Estate Listings</h1></main>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editing" element={<EditingPage />} /> 
          <Route
            path="/agent-test"
            element={
              <ProtectedRoute allowedRoles={['agent']}>
                <main style={{ padding: '1.5rem' }}><h2>Agent-Only Access Verified</h2></main>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}