import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { PageLoader } from "../components/common/Spinner";

// Admin-only pages. The UI check is only for convenience — the database
// (Row Level Security) is what actually blocks non-admins from the data.
export default function AdminRoute() {
  const { user, isAdmin, loading, profileLoading } = useAuth();
  const location = useLocation();

  if (loading || profileLoading) return <PageLoader label="Checking access..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (!isAdmin)
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
          <ShieldAlert size={30} />
        </div>
        <h1 className="text-3xl font-black text-slate-900">Access denied</h1>
        <p className="text-gray-500 max-w-sm text-sm">You don't have permission to view this page.</p>
        <Link to="/" className="bg-slate-900 text-white px-8 py-3 rounded-full font-semibold text-sm hover:bg-black transition">
          Back to home
        </Link>
      </div>
    );
  return <Outlet />;
}
