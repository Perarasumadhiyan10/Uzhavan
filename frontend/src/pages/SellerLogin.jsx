import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Sprout, Satellite } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

// Floating agri-tech icons drifting across the background
const FLOATERS = [
  { emoji:"🌾", top:"10%", left:"8%",  size:30, dur:9,   delay:0   },
  { emoji:"🚁", top:"16%", left:"82%", size:34, dur:13,  delay:1.5 },
  { emoji:"📡", top:"68%", left:"88%", size:26, dur:10,  delay:0.6 },
  { emoji:"🌱", top:"78%", left:"10%", size:24, dur:8,   delay:2   },
  { emoji:"🛰️", top:"32%", left:"5%",  size:24, dur:11,  delay:1   },
  { emoji:"🌿", top:"86%", left:"60%", size:22, dur:9.5, delay:0.3 },
  { emoji:"🌾", top:"22%", left:"50%", size:18, dur:12,  delay:2.5 },
  { emoji:"💧", top:"55%", left:"94%", size:20, dur:10.5,delay:1.2 },
];

const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Bank-grade Security" },
  { icon: Sprout,      label: "12,000+ Farmers Onboard" },
  { icon: Satellite,   label: "Smart Farm Insights" },
];

const SellerLogin = () => {
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const [shake, setShake]               = useState(false);
  const [mounted, setMounted]           = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role !== "SELLER") {
        toast({ title: "Wrong portal", description: "This account is a buyer account. Use Buyer Login.", variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
      navigate("/seller/dashboard");
    } catch (err) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background: aerial farmland at golden sunrise */}
      <img
        src="https://images.unsplash.com/photo-1720199197516-c6d2191ac915?w=1920&h=1200&fit=crop&q=85"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ animation: "slowZoom 26s ease-in-out infinite alternate" }}
      />

      {/* 70% dark overlay with green/gold tint for premium depth */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(165deg, rgba(4,16,8,0.78) 0%, rgba(10,28,14,0.72) 45%, rgba(20,16,4,0.80) 100%)"
      }} />

      {/* Glowing color blobs */}
      <div className="absolute -top-32 -left-32 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(22,163,74,0.35) 0%, transparent 70%)", filter: "blur(40px)", animation: "pulseGlow 7s ease-in-out infinite alternate" }} />
      <div className="absolute -bottom-40 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.30) 0%, transparent 70%)", filter: "blur(50px)", animation: "pulseGlow 9s ease-in-out infinite alternate-reverse" }} />

      {/* Floating agri-tech particles */}
      {FLOATERS.map((p, i) => (
        <span key={i} className="absolute pointer-events-none select-none drop-shadow-lg"
          style={{
            top: p.top, left: p.left, fontSize: p.size, opacity: 0.35,
            animation: `floatDrift ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        >{p.emoji}</span>
      ))}

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1);    }
          to   { transform: scale(1.10); }
        }
        @keyframes floatDrift {
          from { transform: translate(0px, 0px) rotate(0deg); }
          to   { transform: translate(14px, -26px) rotate(8deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(34px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulseGlow {
          from { opacity: 0.55; transform: scale(1);    }
          to   { opacity: 1;    transform: scale(1.12); }
        }
        @keyframes borderGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(22,163,74,0.35), 0 0 40px -8px rgba(22,163,74,0.45), 0 32px 80px -20px rgba(0,0,0,0.75); }
          50%      { box-shadow: 0 0 0 1px rgba(245,158,11,0.40), 0 0 50px -6px rgba(245,158,11,0.45), 0 32px 80px -20px rgba(0,0,0,0.75); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .premium-card {
          animation: borderGlow 6s ease-in-out infinite, fadeSlideUp 0.7s ease both;
        }
        .gradient-text {
          background: linear-gradient(90deg, #4ade80, #facc15, #4ade80);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 6s linear infinite;
        }
        .input-glow:focus-within {
          box-shadow: 0 0 0 1px rgba(22,163,74,0.55), 0 0 18px rgba(245,158,11,0.30);
        }
      `}</style>

      {/* ═══ Login Card ═══ */}
      <div className={`relative z-10 w-full max-w-md ${shake ? "animate-shake" : ""}`}
        style={{ animation: mounted ? undefined : "none" }}>

        <div className="premium-card rounded-[24px] p-8 sm:p-9 border border-white/10"
          style={{
            background: "rgba(10,18,12,0.55)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
          }}>

          {/* Logo / brand section */}
          <div className="flex flex-col items-center text-center mb-7"
            style={{ animation: mounted ? "fadeSlideUp 0.7s 0.05s ease both" : "none" }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-lg"
              style={{
                background: "linear-gradient(135deg, rgba(22,163,74,0.35), rgba(245,158,11,0.30))",
                border: "1px solid rgba(255,255,255,0.18)",
                boxShadow: "0 8px 24px -8px rgba(22,163,74,0.5)",
              }}>
              🌾
            </div>
            <h2 className="text-xs font-bold tracking-[0.25em] uppercase gradient-text">
              Grain Connect Pro
            </h2>
            <p className="text-white/45 text-xs mt-1 tracking-wide">Premium AgriTech Platform</p>
          </div>

          {/* Heading */}
          <div className="text-center mb-8" style={{ animation: mounted ? "fadeSlideUp 0.7s 0.12s ease both" : "none" }}>
            <h1 className="text-3xl font-display font-bold text-white mb-1">Welcome Back</h1>
            <p className="text-sm" style={{ color: "rgba(190,220,180,0.60)" }}>
              Sign in to manage your farm & grain listings
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {[
              { label:"Email address", icon: Mail, type:"email", val:email, set:setEmail, ph:"you@example.com", extra:{} },
              { label:"Password",      icon: Lock, type: showPassword?"text":"password", val:password, set:setPassword, ph:"••••••••", extra:{ isPassword:true } },
            ].map(({ label, icon: Icon, type, val, set, ph, extra }, idx) => (
              <div key={label} className="space-y-1.5"
                style={{ animation: mounted ? `fadeSlideUp 0.7s ${0.18 + idx * 0.08}s ease both` : "none" }}>
                <label className="text-xs font-semibold tracking-wide uppercase" style={{ color: "rgba(220,230,210,0.65)" }}>{label}</label>
                <div className="relative rounded-xl input-glow transition-shadow duration-300">
                  <Icon className="absolute left-3.5 top-3.5 w-4 h-4" style={{ color: "rgba(110,220,140,0.65)" }} />
                  <Input
                    className="pl-11 h-12 text-white placeholder:text-white/25 rounded-xl border-0 transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      ...(extra.isPassword ? { paddingRight: "2.75rem" } : {}),
                    }}
                    placeholder={ph} type={type} value={val}
                    onChange={(e) => set(e.target.value)} required
                  />
                  {extra.isPassword && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-white/35 hover:text-white/75 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div style={{ animation: mounted ? "fadeSlideUp 0.7s 0.40s ease both" : "none" }}>
              <Button
                type="submit"
                className="w-full h-12 ripple-btn font-bold tracking-wide text-white rounded-xl transition-transform duration-300 hover:scale-[1.02] active:scale-[0.99]"
                style={{
                  background: "linear-gradient(135deg, #16A34A 0%, #15803d 45%, #F59E0B 100%)",
                  boxShadow: "0 8px 28px -6px rgba(22,163,74,0.55), 0 0 0 1px rgba(245,158,11,0.25)",
                  fontSize: "1rem",
                }}
                disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span className="flex items-center justify-center gap-2">🌾 Sign In</span>}
              </Button>
            </div>
          </form>

          {/* Links */}
          <div className="mt-6 pt-5 text-center space-y-2 border-t border-white/10"
            style={{ animation: mounted ? "fadeSlideUp 0.7s 0.48s ease both" : "none" }}>
            <p className="text-sm text-white/45">
              New farmer?{" "}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: "#facc15" }}>Create an account</Link>
            </p>
            <p className="text-sm text-white/45">
              Buying grain?{" "}
              <Link to="/buyer/login" className="font-semibold hover:underline" style={{ color: "#4ade80" }}>Buyer Login</Link>
            </p>
          </div>

          {/* Trust badges */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-2"
            style={{ animation: mounted ? "fadeSlideUp 0.7s 0.56s ease both" : "none" }}>
            {TRUST_BADGES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)", color: "rgba(220,230,215,0.70)" }}>
                <Icon className="w-3 h-3" style={{ color: "#4ade80" }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom tagline */}
        <p className="text-center text-white/30 text-xs mt-5 tracking-wide"
          style={{ animation: mounted ? "fadeSlideUp 0.7s 0.65s ease both" : "none" }}>
          Empowering Tamil Nadu farmers with technology-driven direct trade
        </p>
      </div>
    </div>
  );
};

export default SellerLogin;
