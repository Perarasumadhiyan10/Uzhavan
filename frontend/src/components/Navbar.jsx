import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, Pencil, Check, User } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/lib/auth";

const Navbar = ({ userType }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [userData, setUserData] = useState({});
  const { user, logout, updateProfile } = useAuth();
  useEffect(() => {
    setUserData(user || {});
  }, [user]);
  const dropdownRef = useRef(null);
  const nameInputRef = useRef(null);

  const userName = userData.name || "User";
  const initial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setAvatarOpen(false);
        setEditingName(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [editingName]);

  const handleLogout = () => {
    logout();
    navigate(userType === "buyer" ? "/buyer/login" : "/seller/login");
  };

  const startEditName = () => {
    setNameInput(userName);
    setEditingName(true);
  };

  const saveName = async () => {
    const trimmed = nameInput.trim();
    if (!trimmed) return;
    try {
      await updateProfile({ name: trimmed });
    } catch {
      // ignore failure, keep previous name
    }
    setEditingName(false);
  };

  const handleNameKeyDown = (e) => {
    if (e.key === "Enter") saveName();
    if (e.key === "Escape") setEditingName(false);
  };

  const prefix = `/${userType}`;

  // Nav links — NO Profile, NO Logout (those are in avatar dropdown)
  const links =
    userType === "buyer"
      ? [
          { to: `${prefix}/dashboard`, label: "Dashboard" },
          { to: `${prefix}/browse`, label: "Browse Grain" },
          { to: `${prefix}/orders`, label: "My Orders" },
        ]
      : [
          { to: `${prefix}/dashboard`, label: "Dashboard" },
          { to: `${prefix}/post-stock`, label: "Post Stock" },
          { to: `${prefix}/manage-stock`, label: "Manage Stock" },
          { to: `${prefix}/orders`, label: "Orders Received" },
        ];

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 28, delay: 0.1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-card/85 backdrop-blur-xl border-b border-border transition-all duration-300"
      style={{
        boxShadow: scrolled ? "var(--shadow-elevated)" : "var(--shadow-navbar)",
        height: scrolled ? "60px" : "68px",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-300"
        style={{ height: scrolled ? "60px" : "68px" }}
      >
        {/* Logo */}
        <Link to={`${prefix}/dashboard`} className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm"
            style={{ background: "var(--gradient-primary)" }}
          >
            U
          </motion.div>
          <motion.span
            className="font-display text-lg font-bold text-foreground tracking-tight"
            whileHover={{ color: "hsl(var(--primary))" }}
            transition={{ duration: 0.2 }}
          >
            Uzhavan
          </motion.span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {links.map((link) => {
            const isActive = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative px-3.5 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: "var(--gradient-primary)" }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Avatar with dropdown — Profile + Logout live here */}
          <div className="relative" ref={dropdownRef}>
            <div className="relative group">
              <motion.div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: "var(--gradient-primary)", filter: "blur(6px)" }}
                animate={{ scale: [1.15, 1.25, 1.15] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => { setAvatarOpen((v) => !v); setEditingName(false); }}
                title={userName}
                className="relative w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm cursor-pointer shadow-md z-10"
                style={{ background: "var(--gradient-avatar)" }}
              >
                {initial}
              </motion.button>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
              {avatarOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: -8 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                  style={{ boxShadow: "var(--shadow-elevated)" }}
                >
                  {/* Header with avatar + editable name */}
                  <div className="px-4 pt-4 pb-3 border-b border-border" style={{ background: "var(--gradient-hero)" }}>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-full flex items-center justify-center text-primary-foreground text-lg font-bold shadow-md flex-shrink-0"
                        style={{ background: "var(--gradient-avatar)" }}
                      >
                        {initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        {editingName ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              ref={nameInputRef}
                              value={nameInput}
                              onChange={(e) => setNameInput(e.target.value)}
                              onKeyDown={handleNameKeyDown}
                              className="flex-1 text-sm font-semibold bg-transparent border-b-2 border-primary outline-none text-foreground w-full min-w-0"
                              maxLength={32}
                            />
                            <motion.button
                              whileTap={{ scale: 0.9 }}
                              onClick={saveName}
                              className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0"
                            >
                              <Check className="w-3.5 h-3.5 text-white" />
                            </motion.button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group/name">
                            <span className="text-sm font-semibold text-foreground truncate">{userName}</span>
                            <motion.button
                              whileHover={{ scale: 1.15 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={startEditName}
                              className="opacity-0 group-hover/name:opacity-100 transition-opacity"
                              title="Edit name"
                            >
                              <Pencil className="w-3 h-3 text-muted-foreground hover:text-primary" />
                            </motion.button>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground capitalize mt-0.5">{userType} account</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu */}
                  <div className="p-2">
                    <button
                      onClick={() => { navigate(`${prefix}/profile`); setAvatarOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-foreground hover:bg-secondary transition-colors text-left"
                    >
                      <User className="w-4 h-4 text-primary" />
                      View Profile
                    </button>
                    <div className="h-px bg-border mx-1 my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile hamburger */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            className="lg:hidden p-2 text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <AnimatePresence mode="wait">
              {mobileOpen ? (
                <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <X className="w-5 h-5" />
                </motion.span>
              ) : (
                <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                  <Menu className="w-5 h-5" />
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Mobile nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden bg-card/95 backdrop-blur-xl border-t border-border px-4 pb-4 overflow-hidden"
          >
            <div className="flex items-center gap-3 py-3 border-b border-border mb-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm shadow"
                style={{ background: "var(--gradient-avatar)" }}
              >
                {initial}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{userName}</p>
                <p className="text-xs text-muted-foreground capitalize">{userType} account</p>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              {links.map((link, i) => (
                <motion.div key={link.to} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.to ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary"
                    }`}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: links.length * 0.05 }}>
                <button onClick={() => { navigate(`${prefix}/profile`); setMobileOpen(false); }} className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary text-left transition-colors">
                  Profile
                </button>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: (links.length + 1) * 0.05 }}>
                <button onClick={handleLogout} className="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 text-left transition-colors">
                  Logout
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
