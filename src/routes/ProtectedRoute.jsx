import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../components/common/Spinner";
import ConfigNotice from "../components/common/ConfigNotice";
import { isSupabaseConfigured } from "../supabase/client";

// Pages that need a signed-in user (profile, checkout, orders).
// Signed-out visitors are redirected to /login and sent back afterwards.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (!isSupabaseConfigured)
    return (
      <div className="max-w-xl mx-auto px-6 py-16">
        <ConfigNotice />
      </div>
    );
  if (loading) return <PageLoader label="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}
