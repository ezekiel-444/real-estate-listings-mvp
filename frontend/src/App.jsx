import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import EditingPage from "./pages/EditingPage";
import ListingPage from "./pages/ListingPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";

function DevAuthBar() {
  const { user, logout, loading } = useAuth();
  return (
    <header className="app-header">
      <Link className="app-header__brand" to="/listings">
        Real Estate Listings
      </Link>
      <nav className="app-header__nav" aria-label="Main navigation">
        {user && (
          <span className="app-header__user">
            Logged in as <strong>{user.email}</strong> ({user.role})
          </span>
        )}
        {!loading && !user && (
          <>
            <Link className="app-header__button" to="/">
              Log in
            </Link>
            <Link className="app-header__button" to="/register">
              Register
            </Link>
          </>
        )}
        <Link className="app-header__button" to="/listings">
          Listings
        </Link>
        <Link className="app-header__button" to="/editing">
          Editing Page
        </Link>
        {user && (
          <>
            <Link className="app-header__button" to="/agent-test">
              Test Agent Route
            </Link>
            <button
              className="app-header__button"
              type="button"
              onClick={logout}
            >
              Logout
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <DevAuthBar />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/listings" element={<ListingPage />} />
          <Route path="/listings/:id" element={<PropertyDetailPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editing" element={<EditingPage />} />
          <Route
            path="/agent-test"
            element={
              <ProtectedRoute allowedRoles={["agent"]}>
                <main style={{ padding: "1.5rem" }}>
                  <h2>Agent-Only Access Verified</h2>
                </main>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
