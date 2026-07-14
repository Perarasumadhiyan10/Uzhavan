import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const PARTICLES = [
  { emoji:"🌾", top:"8%",  left:"6%",  size:28, rot:15,  dur:6,  delay:0   },
  { emoji:"🌾", top:"18%", left:"88%", size:22, rot:-20, dur:7,  delay:1   },
  { emoji:"🌿", top:"35%", left:"4%",  size:20, rot:10,  dur:8,  delay:0.5 },
  { emoji:"🌱", top:"55%", left:"93%", size:18, rot:-15, dur:6,  delay:1.5 },
  { emoji:"🌾", top:"72%", left:"8%",  size:26, rot:25,  dur:9,  delay:0.3 },
  { emoji:"🌿", top:"85%", left:"85%", size:24, rot:-10, dur:7,  delay:2   },
  { emoji:"🌾", top:"45%", left:"91%", size:20, rot:18,  dur:8,  delay:0.8 },
  { emoji:"🌱", top:"90%", left:"20%", size:22, rot:-8,  dur:6,  delay:1.2 },
  { emoji:"🌾", top:"25%", left:"50%", size:16, rot:12,  dur:10, delay:3   },
  { emoji:"🌿", top:"65%", left:"45%", size:14, rot:-22, dur:9,  delay:2.5 },
];

const BuyerLogin = () => {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [shake, setShake]           = useState(false);
  const [mounted, setMounted]       = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  const handleLogin = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const user = await login(email.trim().toLowerCase(), password);
      if (user.role !== "BUYER") {
        toast({ title: "Wrong portal", description: "This account is a seller account. Use Seller Login.", variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ title: "Welcome back!", description: `Logged in as ${user.name}` });
      navigate("/buyer/dashboard");
    } catch (err) {
      setShake(true); setTimeout(() => setShake(false), 500);
      toast({ title: "Login failed", description: err.message || "Invalid credentials", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">

      {/* Background: lush green rice paddy terraces with morning light */}
      <img
        src="https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=1600&h=900&fit=crop&q=85"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ animation: "slowZoom 20s ease-in-out infinite alternate" }}
      />
      {/* Rich teal-green atmospheric overlay */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(160deg, rgba(5,40,30,0.78) 0%, rgba(10,60,40,0.60) 45%, rgba(5,35,50,0.80) 100%)"
      }} />

      {/* Floating grain particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute pointer-events-none select-none"
          style={{
            top: p.top, left: p.left,
            fontSize: p.size,
            opacity: 0.28,
            transform: `rotate(${p.rot}deg)`,
            animation: `floatUp ${p.dur}s ease-in-out ${p.delay}s infinite alternate`,
          }}
        >{p.emoji}</span>
      ))}

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1);    }
          to   { transform: scale(1.08); }
        }
        @keyframes floatUp {
          from { transform: translateY(0px)   rotate(var(--r, 0deg)); }
          to   { transform: translateY(-18px) rotate(var(--r, 0deg)); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      {/* Login card */}
      <div
        className={`relative z-10 w-full max-w-md ${shake ? "animate-shake" : ""}`}
        style={{ animation: mounted ? "fadeSlideUp 0.6s ease both" : "none" }}
      >
        {/* Top banner */}
        <div className="rounded-t-3xl px-8 pt-5 pb-3" style={{
          background: "linear-gradient(135deg, rgba(5,60,45,0.96), rgba(8,50,70,0.92))",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(80,220,180,0.20)",
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: "rgba(80,220,160,0.15)", border: "1px solid rgba(80,220,160,0.30)" }}>
              🛒
            </div>
            <div>
              <p className="text-xs font-semibold tracking-widest uppercase" style={{ color: "rgba(80,220,180,0.85)" }}>
                Grain Connect Pro
              </p>
              <p className="text-white/60 text-xs">Buyer Portal</p>
            </div>
          </div>
        </div>

        <div
          className="rounded-b-3xl p-8 border border-white/15 border-t-0"
          style={{
            background: "rgba(5,25,20,0.75)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            boxShadow: "0 32px 80px -12px rgba(0,0,0,0.70), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ animation: mounted ? "fadeSlideUp 0.7s 0.15s ease both" : "none" }}>
            <h1 className="text-3xl font-display font-bold text-white text-center mb-1">Welcome Back</h1>
            <p className="text-center text-sm mb-8" style={{ color: "rgba(80,220,180,0.65)" }}>
              Sign in to browse & reserve fresh grain
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {[
              { label:"Email",    icon: Mail, type:"email",    val:email,    set:setEmail,    ph:"you@example.com", extra:{} },
              { label:"Password", icon: Lock, type: showPassword?"text":"password", val:password, set:setPassword, ph:"••••••••", extra:{ isPassword:true } },
            ].map(({ label, icon: Icon, type, val, set, ph, extra }, idx) => (
              <div key={label} className="space-y-1.5"
                style={{ animation: mounted ? `fadeSlideUp 0.7s ${0.2 + idx * 0.08}s ease both` : "none" }}>
                <label className="text-sm font-medium" style={{ color: "rgba(160,240,210,0.80)" }}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-3 w-4 h-4" style={{ color: "rgba(80,200,160,0.50)" }} />
                  <Input
                    className="pl-11 h-11 text-white placeholder:text-white/30 focus:border-emerald-400/60 transition-all duration-200"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      border: "1px solid rgba(80,200,160,0.22)",
                      ...(extra.isPassword ? { paddingRight: "2.75rem" } : {}),
                    }}
                    placeholder={ph} type={type} value={val}
                    onChange={(e) => set(e.target.value)} required
                  />
                  {extra.isPassword && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-white/40 hover:text-white/70 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}

            <div style={{ animation: mounted ? "fadeSlideUp 0.7s 0.38s ease both" : "none" }}>
              <Button type="submit" className="w-full h-12 ripple-btn font-semibold tracking-wide text-white"
                style={{
                  background: "linear-gradient(135deg, #0a5c3e 0%, #0a7a5a 50%, #085040 100%)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(80,200,160,0.20)",
                  fontSize: "1rem",
                }}
                disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "🌱 Sign In"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center space-y-2 border-t pt-5"
            style={{ borderColor: "rgba(80,200,160,0.15)", animation: mounted ? "fadeSlideUp 0.7s 0.46s ease both" : "none" }}>
            <p className="text-sm text-white/50">Don't have an account?{" "}
              <Link to="/register" className="font-semibold hover:underline" style={{ color: "rgba(80,220,180,0.90)" }}>Register</Link>
            </p>
            <p className="text-sm text-white/50">Are you a seller?{" "}
              <Link to="/seller/login" className="font-semibold hover:underline" style={{ color: "rgba(255,220,80,0.85)" }}>Seller Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerLogin;
