import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

/**
 * Wraps a page and redirects to the appropriate login page if the user
 * is not authenticated or does not have the required role.
 *
 * @param {("BUYER"|"SELLER")} role - required role for this route
 */
const ProtectedRoute = ({ role, children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) {
    const loginPath = role === "SELLER" ? "/seller/login" : "/buyer/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    const loginPath = role === "SELLER" ? "/seller/login" : "/buyer/login";
    return <Navigate to={loginPath} replace />;
  }

  return children;
};

export default ProtectedRoute;
