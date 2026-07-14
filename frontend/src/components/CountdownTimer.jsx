import { useState, useEffect } from "react";

const CountdownTimer = ({ expiresAt, size = 56 }) => {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const update = () => {
      const diff = new Date(expiresAt).getTime() - Date.now();
      setRemaining(Math.max(0, diff));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const progress = remaining / (24 * 60 * 60 * 1000);
  const circumference = 2 * Math.PI * (size / 2 - 4);
  const strokeDashoffset = circumference * (1 - progress);

  const isExpired = remaining <= 0;
  const isUrgent = hours < 2 && !isExpired;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 4} fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 4}
          fill="none"
          stroke={isExpired ? "hsl(var(--destructive))" : isUrgent ? "hsl(var(--warning))" : "hsl(var(--primary))"}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute text-center">
        {isExpired ? (
          <span className="text-[9px] font-bold text-destructive">EXP</span>
        ) : (
          <span className="text-[9px] font-bold text-foreground leading-none">
            {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}
          </span>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;
