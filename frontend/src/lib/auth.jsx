// ===================================================================
// Grain Connect Pro - Auth Context
// Stores the logged-in user (from /api/users/me) and JWT token,
// replacing the old localStorage "buyerUser" / "sellerUser" approach.
// ===================================================================
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi, userApi, getToken, setToken, clearToken } from "./api";

const USER_KEY = "uzhavan-user";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  const persistUser = (u) => {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else localStorage.removeItem(USER_KEY);
    setUser(u);
  };

  // On mount, if we have a token, refresh the profile from the backend.
  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    userApi
      .getProfile()
      .then((profile) => persistUser(profile))
      .catch(() => {
        clearToken();
        persistUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await authApi.login(email, password);
    setToken(data.token);
    persistUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const data = await authApi.register(payload);
    setToken(data.token);
    persistUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    persistUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    const profile = await userApi.getProfile();
    persistUser(profile);
    return profile;
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const profile = await userApi.updateProfile(payload);
    persistUser(profile);
    return profile;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshProfile, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
