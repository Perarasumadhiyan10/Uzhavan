import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2, ShoppingBag, Tractor, Navigation } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const PARTICLES = [
  { emoji:"🌾", top:"5%",  left:"8%",  size:28, rot:12,  dur:7,  delay:0   },
  { emoji:"🌿", top:"18%", left:"88%", size:22, rot:-18, dur:8,  delay:1   },
  { emoji:"🌱", top:"42%", left:"3%",  size:20, rot:8,   dur:6,  delay:0.4 },
  { emoji:"🌾", top:"62%", left:"93%", size:26, rot:-12, dur:9,  delay:1.6 },
  { emoji:"🌿", top:"78%", left:"5%",  size:24, rot:20,  dur:7,  delay:0.8 },
  { emoji:"🌾", top:"90%", left:"83%", size:28, rot:-8,  dur:8,  delay:2   },
  { emoji:"🌱", top:"30%", left:"50%", size:16, rot:15,  dur:11, delay:3   },
  { emoji:"🌾", top:"55%", left:"46%", size:14, rot:-20, dur:9,  delay:2.5 },
];

const Register = () => {
  const [tab, setTab]               = useState("buyer");
  const [buyerForm, setBuyerForm]   = useState({ name:"", email:"", phone:"", address:"", password:"", confirmPassword:"" });
  const [sellerForm, setSellerForm] = useState({ name:"", email:"", phone:"", farmLocation:"", password:"", confirmPassword:"" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]       = useState(false);
  const [errors, setErrors]         = useState({});
  const [mounted, setMounted]       = useState(false);
  const [locStatus, setLocStatus]   = useState("idle");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  const form    = tab === "buyer" ? buyerForm    : sellerForm;
  const setForm = tab === "buyer" ? setBuyerForm : setSellerForm;

  const update = (key, value) => {
    if (key === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setForm((p) => ({ ...p, [key]: digits }));
    } else {
      setForm((p) => ({ ...p, [key]: value }));
    }
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Not supported", description: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }
    setLocStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          const data = await res.json();
          const a    = data.address || {};
          const label =
            [a.village, a.town, a.suburb, a.city_district, a.city, a.county]
              .filter(Boolean)[0] ||
            `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setSellerForm((p) => ({ ...p, farmLocation: label }));
          setErrors((p) => ({ ...p, farmLocation: "" }));
          setLocStatus("success");
          toast({ title: "Location detected!", description: label });
        } catch {
          const label = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          setSellerForm((p) => ({ ...p, farmLocation: label }));
          setLocStatus("success");
          toast({ title: "Location set", description: label });
        }
      },
      (err) => {
        setLocStatus("error");
        const msg =
          err.code === 1 ? "Location access denied. Please allow location in your browser." :
          err.code === 2 ? "Location unavailable. Please enter manually." :
          "Location request timed out.";
        toast({ title: "Location error", description: msg, variant: "destructive" });
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const validate = () => {
    const errs = {};
    if (form.name.length < 2)                   errs.name            = "Name too short";
    if (!form.email.includes("@"))              errs.email           = "Invalid email";
    if (!/^\d{10}$/.test(form.phone))           errs.phone           = "Phone must be exactly 10 digits";
    if (form.password.length < 6)               errs.password        = "Min 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        role: tab === "buyer" ? "BUYER" : "SELLER",
        ...(tab === "buyer" ? { address: form.address } : { farmLocation: form.farmLocation }),
      };
      const user = await register(payload);
      toast({ title: "Registration successful!", description: "Welcome to Uzhavan" });
      navigate(user.role === "BUYER" ? "/buyer/dashboard" : "/seller/dashboard");
    } catch (err) {
      toast({ title: "Registration failed", description: err.message || "Please try again", variant: "destructive" });
    }
    setLoading(false);
  };

  const isBuyer = tab === "buyer";

  const buyerFields = [
    { key:"name",            icon:User,   placeholder:"Full Name",        type:"text"  },
    { key:"email",           icon:Mail,   placeholder:"Email Address",    type:"email" },
    { key:"phone",           icon:Phone,  placeholder:"Phone Number (10 digits)", type:"tel", maxLength:10, inputMode:"numeric" },
    { key:"address",         icon:MapPin, placeholder:"Your Address",     type:"text"  },
    { key:"password",        icon:Lock,   placeholder:"Password",         type:showPassword?"text":"password" },
    { key:"confirmPassword", icon:Lock,   placeholder:"Confirm Password", type:showPassword?"text":"password" },
  ];
  const sellerFields = [
    { key:"name",            icon:User,   placeholder:"Farmer Name",      type:"text"  },
    { key:"email",           icon:Mail,   placeholder:"Email Address",    type:"email" },
    { key:"phone",           icon:Phone,  placeholder:"Phone Number (10 digits)", type:"tel", maxLength:10, inputMode:"numeric" },
    { key:"farmLocation",    icon:MapPin, placeholder:"Farm Location",    type:"text",  hasGPS:true },
    { key:"password",        icon:Lock,   placeholder:"Password",         type:showPassword?"text":"password" },
    { key:"confirmPassword", icon:Lock,   placeholder:"Confirm Password", type:showPassword?"text":"password" },
  ];
  const fields = isBuyer ? buyerFields : sellerFields;

  // Per-tab accent colours
  const accent      = isBuyer ? "rgba(60,210,170,0.85)"  : "rgba(220,175,50,0.85)";
  const accentBorder= isBuyer ? "rgba(60,190,160,0.22)"  : "rgba(200,155,40,0.22)";
  const btnBg       = isBuyer
    ? "linear-gradient(135deg, #0a5c3e 0%, #0a7a5a 50%, #085040 100%)"
    : "linear-gradient(135deg, #1a5c1a 0%, #7a5500 55%, #1a4a1a 100%)";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* ── Background: lush green terraced rice paddies with morning mist ── */}
      <img
        src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1800&h=1000&fit=crop&q=90"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        style={{ animation: "slowZoom 28s ease-in-out infinite alternate" }}
      />
      {/* Deep emerald-green overlay with warm bottom glow */}
      <div className="absolute inset-0" style={{
        background: "linear-gradient(155deg, rgba(4,30,18,0.85) 0%, rgba(8,50,28,0.68) 45%, rgba(20,15,4,0.84) 100%)",
      }} />
      {/* Radial light-from-above */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% -10%, rgba(60,200,120,0.16) 0%, transparent 60%)",
      }} />

      {/* Floating particles */}
      {PARTICLES.map((p, i) => (
        <span key={i} className="absolute pointer-events-none select-none"
          style={{ top:p.top, left:p.left, fontSize:p.size, opacity:0.25,
            transform:`rotate(${p.rot}deg)`,
            animation:`floatUp ${p.dur}s ease-in-out ${p.delay}s infinite alternate` }}>
          {p.emoji}
        </span>
      ))}

      <style>{`
        @keyframes slowZoom {
          from { transform: scale(1); }
          to   { transform: scale(1.09); }
        }
        @keyframes floatUp {
          from { transform: translateY(0px)   rotate(0deg); }
          to   { transform: translateY(-20px) rotate(0deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md"
        style={{ animation: mounted ? "fadeSlideUp 0.65s ease both" : "none" }}>

        {/* Brand header */}
        <div className="text-center mb-4"
          style={{ animation: mounted ? "fadeSlideUp 0.65s 0.04s ease both" : "none" }}>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border"
            style={{ background:"rgba(5,25,14,0.70)", borderColor:"rgba(80,200,140,0.25)", backdropFilter:"blur(10px)" }}>
            <span className="text-xl">🌾</span>
            <span className="text-xs font-bold tracking-[0.18em] uppercase" style={{ color:"rgba(80,210,150,0.80)" }}>
              Grain Connect Pro
            </span>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl border p-1 mb-4"
          style={{
            background: "rgba(4,18,10,0.75)",
            backdropFilter: "blur(14px)",
            borderColor: "rgba(255,255,255,0.10)",
            animation: mounted ? "fadeSlideUp 0.65s 0.07s ease both" : "none",
          }}>
          {["buyer","seller"].map((t) => (
            <button key={t} type="button"
              onClick={() => { setTab(t); setErrors({}); setShowPassword(false); setLocStatus("idle"); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                tab === t ? "text-white shadow" : "text-white/40 hover:text-white/70"
              }`}
              style={tab === t ? {
                background: t === "buyer"
                  ? "linear-gradient(135deg, rgba(8,75,50,0.92), rgba(10,100,65,0.85))"
                  : "linear-gradient(135deg, rgba(40,75,15,0.92), rgba(90,60,5,0.85))",
                boxShadow: "0 2px 10px rgba(0,0,0,0.30)",
              } : {}}
            >
              {t === "buyer" ? <ShoppingBag className="w-4 h-4" /> : <Tractor className="w-4 h-4" />}
              {t === "buyer" ? "Buyer" : "Seller / Farmer"}
            </button>
          ))}
        </div>

        {/* Gold/emerald accent line */}
        <div className="h-0.5 w-full mb-0 rounded-t-sm" style={{
          background: isBuyer
            ? "linear-gradient(90deg, transparent, rgba(60,200,150,0.70), transparent)"
            : "linear-gradient(90deg, transparent, rgba(220,170,40,0.70), transparent)",
        }} />

        {/* Card */}
        <div
          className="rounded-b-3xl rounded-tr-3xl p-8 border border-white/10"
          style={{
            background: "rgba(4,16,8,0.84)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            boxShadow: "0 40px 90px -15px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ animation: mounted ? "fadeSlideUp 0.7s 0.12s ease both" : "none" }}>
            <h1 className="text-3xl font-display font-bold text-white text-center mb-1">Create Account</h1>
            <p className="text-sm text-center mb-6" style={{ color: `${accent}`, opacity:0.82 }}>
              {isBuyer ? "Register to browse and reserve grain directly from farmers." : "Register to list and sell your grain — no middlemen."}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {fields.map(({ key, icon: Icon, placeholder, type, maxLength, inputMode, hasGPS }, idx) => (
              <div key={`${tab}-${key}`} className="space-y-1"
                style={{ animation: mounted ? `fadeSlideUp 0.65s ${0.16 + idx * 0.06}s ease both` : "none" }}>
                <div className="relative">
                  <Icon className="absolute left-3.5 top-3 w-4 h-4" style={{ color: "rgba(120,200,160,0.45)" }} />
                  <Input
                    className={`pl-11 h-11 text-white placeholder:text-white/28 transition-all duration-200 ${
                      key.includes("password") ? "pr-11" : hasGPS ? "pr-12" : ""
                    } ${errors[key] ? "!border-red-400/60" : ""}`}
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: `1px solid ${errors[key] ? "rgba(240,80,80,0.50)" : accentBorder}`,
                    }}
                    placeholder={placeholder} type={type}
                    value={form[key]} onChange={(e) => update(key, e.target.value)} required
                    maxLength={maxLength} inputMode={inputMode}
                  />
                  {key === "password" && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-white/38 hover:text-white/70 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                  {hasGPS && (
                    <button type="button" onClick={detectLocation} title="Auto-detect location"
                      className="absolute right-2.5 top-2 w-7 h-7 flex items-center justify-center rounded-lg transition-all"
                      style={{
                        background: locStatus === "locating" ? "rgba(220,170,40,0.18)" : "rgba(60,190,140,0.14)",
                        border: `1px solid ${locStatus === "success" ? "rgba(60,210,150,0.45)" : "rgba(60,190,140,0.28)"}`,
                      }}>
                      {locStatus === "locating"
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color:"rgba(220,170,40,0.90)" }} />
                        : <Navigation className="w-3.5 h-3.5" style={{ color: locStatus==="success" ? "rgba(60,220,160,0.95)" : "rgba(120,200,160,0.70)" }} />
                      }
                    </button>
                  )}
                </div>
                {hasGPS && (
                  <p className="text-xs pl-1" style={{
                    color: locStatus==="success" ? "rgba(60,220,160,0.80)"
                         : locStatus==="error"   ? "rgba(240,110,110,0.80)"
                         : locStatus==="locating"? "rgba(220,175,50,0.75)"
                         : "rgba(130,170,140,0.55)",
                  }}>
                    {locStatus==="idle"     && "Tap 📍 to auto-detect your farm location"}
                    {locStatus==="locating" && "Detecting your location…"}
                    {locStatus==="success"  && "✓ Location detected — you can still edit it"}
                    {locStatus==="error"    && "⚠ Could not detect — enter manually"}
                  </p>
                )}
                {errors[key] && <p className="text-xs text-red-300/90 pl-1">{errors[key]}</p>}
              </div>
            ))}

            <div style={{ animation: mounted ? "fadeSlideUp 0.65s 0.58s ease both" : "none" }}>
              <Button type="submit" className="w-full h-12 ripple-btn font-bold tracking-wide mt-2 text-white"
                style={{
                  background: btnBg,
                  boxShadow: "0 6px 28px rgba(0,0,0,0.42), 0 0 0 1px rgba(80,200,140,0.16)",
                  fontSize: "1rem",
                  letterSpacing: "0.04em",
                }}
                disabled={loading}>
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : `${isBuyer ? "🌱" : "🌾"} Create ${isBuyer ? "Buyer" : "Seller"} Account`
                }
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center pt-4"
            style={{
              borderTop: "1px solid rgba(80,200,140,0.10)",
              animation: mounted ? "fadeSlideUp 0.65s 0.65s ease both" : "none"
            }}>
            <p className="text-sm text-white/45">
              Already have an account?{" "}
              <Link to={isBuyer ? "/buyer/login" : "/seller/login"}
                className="font-semibold hover:underline" style={{ color: accent }}>
                {isBuyer ? "Buyer Login" : "Seller Login"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
