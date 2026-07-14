import { ShoppingCart, Clock, CheckCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import StatCard from "@/components/StatCard";
import PageTransition from "@/components/PageTransition";
import { reservationApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const BuyerDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || "User";
  const [stats, setStats] = useState({ total: 0, active: 0, completed: 0 });

  useEffect(() => {
    let mounted = true;
    reservationApi
      .getMine()
      .then((orders) => {
        if (!mounted) return;
        setStats({
          total: orders.length,
          active: orders.filter((r) => r.status === "Booked").length,
          completed: orders.filter((r) => r.status === "Collected").length,
        });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <Navbar userType="buyer" />
      <BubbleBackground />
      <PageTransition>
        <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome back, <span className="text-primary">{userName}</span> 👋
            </h1>
            <div className="mt-1 h-0.5 w-40 rounded-full" style={{ background: "var(--gradient-primary)" }} />
            <p className="text-muted-foreground mt-2">Here's your marketplace overview</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard title="Total Orders" value={stats.total} icon={<ShoppingCart className="w-5 h-5" />} delay={0} />
            <StatCard title="Active Reservations" value={stats.active} icon={<Clock className="w-5 h-5" />} delay={150} />
            <StatCard title="Completed Orders" value={stats.completed} icon={<CheckCircle className="w-5 h-5" />} delay={300} />
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default BuyerDashboard;
