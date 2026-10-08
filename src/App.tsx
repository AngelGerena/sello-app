import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import type { ReactNode } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import PublicCard from './pages/PublicCard';
import Admin from './pages/Admin';
import DemoCard from './pages/DemoCard';
import Legal from './pages/Legal';
import { useIsAdmin } from './lib/useAdmin';

function Private({ children }: { children: ReactNode }) {
  const { session, loading, demo } = useAuth();
  if (demo) return <>{children}</>;
  if (loading) return <div className="center-msg">Loading</div>;
  return session ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Only platform admins get in. Everyone else is sent back to their own cards. */
function AdminOnly({ children }: { children: ReactNode }) {
  const { isAdmin, ready } = useIsAdmin();
  if (!ready) return <div className="center-msg">Loading</div>;
  return isAdmin ? <>{children}</> : <Navigate to="/app" replace />;
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
          <Route path="/demo/:template" element={<DemoCard />} />
          <Route path="/terms" element={<Legal kind="terms" />} />
          <Route path="/privacy" element={<Legal kind="privacy" />} />
          <Route path="/app" element={<Private><Dashboard /></Private>} />
          <Route path="/app/admin" element={<Private><AdminOnly><Admin /></AdminOnly></Private>} />
          <Route path="/app/cards/:id" element={<Private><Editor /></Private>} />
          {/* Specific routes first; the card slug catches everything else. */}
          <Route path="/:slug" element={<PublicCard />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
