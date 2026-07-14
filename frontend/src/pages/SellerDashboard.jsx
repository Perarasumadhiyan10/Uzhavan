import { Package, Clock, CheckCircle, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import StatCard from "@/components/StatCard";
import PageTransition from "@/components/PageTransition";
import { grainApi, reservationApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

const SellerDashboard = () => {
  const { user } = useAuth();
  const userName = user?.name || "Farmer";
  const [stats, setStats] = useState({ available: 0, reserved: 0, sold: 0 });

  useEffect(() => {
    let mounted = true;
    Promise.all([grainApi.getMyListings(), reservationApi.getMine()])
      .then(([grains, orders]) => {
        if (!mounted) return;
        const totalAvailable = grains.reduce((s, g) => s + g.availableKg, 0);
        const totalReserved = grains.reduce((s, g) => s + g.reservedKg, 0);
        const totalSold = orders
          .filter((r) => r.status === "Collected")
          .reduce((s, r) => s + r.quantityKg, 0);
        setStats({ available: totalAvailable, reserved: totalReserved, sold: totalSold });
      })
      .catch(() => {});
    return () => { mounted = false; };
  }, []);

  const total = stats.available + stats.reserved + stats.sold || 1;

  return (
    <div className="min-h-screen" style={{ background: "var(--gradient-hero)" }}>
      <Navbar userType="seller" />
      <BubbleBackground />
      <PageTransition>
        <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground">
              Welcome back, <span className="text-primary">{userName}</span> 👨‍🌾
            </h1>
            <div className="mt-1 h-0.5 w-40 rounded-full" style={{ background: "var(--gradient-primary)" }} />
            <p className="text-muted-foreground mt-2">Your farm dashboard overview</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard title="Available (kg)" value={stats.available} suffix=" kg" icon={<Package className="w-5 h-5" />} delay={0} />
            <StatCard title="Reserved (kg)" value={stats.reserved} suffix=" kg" icon={<Clock className="w-5 h-5" />} delay={150} />
            <StatCard title="Sold (kg)" value={stats.sold} suffix=" kg" icon={<CheckCircle className="w-5 h-5" />} delay={300} />
          </div>

          <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="font-display font-semibold text-foreground">Stock Distribution</h2>
            </div>
            {[
              { label: "Available", value: stats.available, color: "bg-primary" },
              { label: "Reserved", value: stats.reserved, color: "bg-warning" },
              { label: "Sold", value: stats.sold, color: "bg-success" },
            ].map((item) => (
              <div key={item.label} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-muted-foreground font-medium">{item.label}</span>
                  <span className="text-foreground font-semibold">{item.value} kg</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-secondary overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${(item.value / total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default SellerDashboard;
