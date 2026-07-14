import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem("uzhavan-theme");
    if (saved) return saved === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("uzhavan-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      onClick={() => setDark(!dark)}
      className="relative w-14 h-7 rounded-full bg-secondary border border-border flex items-center transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring"
      aria-label="Toggle theme"
    >
      <div
        className="absolute w-5 h-5 rounded-full flex items-center justify-center shadow-md transition-all duration-300"
        style={{ background: "var(--gradient-primary)", transform: dark ? "translateX(30px)" : "translateX(4px)" }}
      >
        {dark ? <Moon className="w-3 h-3 text-primary-foreground" /> : <Sun className="w-3 h-3 text-primary-foreground" />}
      </div>
    </button>
  );
};

export default ThemeToggle;
