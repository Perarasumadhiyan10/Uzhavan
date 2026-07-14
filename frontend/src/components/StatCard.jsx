import { useEffect, useState } from "react";

const StatCard = ({ title, value, icon, delay = 0, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      let start = 0;
      const step = Math.max(1, Math.floor(value / 30));
      const interval = setInterval(() => {
        start += step;
        if (start >= value) { setCount(value); clearInterval(interval); }
        else { setCount(start); }
      }, 30);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timeout);
  }, [value, delay]);

  return (
    <div className="stat-card group relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <span className="text-muted-foreground text-sm font-medium">{title}</span>
        <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
          {icon}
        </div>
      </div>
      <div className="text-3xl font-display font-bold text-foreground">
        {count}{suffix}
      </div>
    </div>
  );
};

export default StatCard;
