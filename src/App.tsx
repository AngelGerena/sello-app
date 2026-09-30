import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import PublicCard from './pages/PublicCard';

function Private({ children }: { children: ReactNode }) {
  const { session, loading, demo } = useAuth();
  if (demo) return <>{children}</>;
  if (loading) return <div className="center-msg">Loading</div>;
  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

export default function App() {
  // The single-file demo has no server rewrites, so it routes by hash.
  const Router = import.meta.env.VITE_DEMO === '1' ? HashRouter : BrowserRouter;
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Login mode="signup" />} />
          <Route path="/login" element={<Login mode="signin" />} />
          <Route path="/reset" element={<ResetPassword />} />
          <Route path="/app" element={<Private><Dashboard /></Private>} />
          <Route path="/app/cards/:id" element={<Private><Editor /></Private>} />
          {/* Specific routes first; the card slug catches everything else. */}
          <Route path="/:slug" element={<PublicCard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
