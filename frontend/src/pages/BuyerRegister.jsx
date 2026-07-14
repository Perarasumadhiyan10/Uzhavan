import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Loader2 } from "lucide-react";
import BubbleBackground from "@/components/BubbleBackground";
import BuyerLoginScene from "@/components/BuyerLoginScene";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ThemeToggle from "@/components/ThemeToggle";
import { useAuth } from "@/lib/auth";

const BuyerRegister = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", address: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { toast } = useToast();
  const { register } = useAuth();

  const validate = () => {
    const errs = {};
    if (form.name.length < 2) errs.name = "Name too short";
    if (!form.email.includes("@")) errs.email = "Invalid email";
    if (!/^\d{10}$/.test(form.phone)) errs.phone = "Phone must be exactly 10 digits";
    if (form.password.length < 6) errs.password = "Min 6 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords don't match";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault(); if (!validate()) return;
    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email.trim().toLowerCase(),
        phone: form.phone,
        password: form.password,
        role: "BUYER",
        address: form.address,
      });
      toast({ title: "Registration successful!", description: "Welcome to Uzhavan" });
      navigate("/buyer/dashboard");
    } catch (err) {
      toast({ title: "Registration failed", description: err.message || "Please try again", variant: "destructive" });
    }
    setLoading(false);
  };

  const update = (key, value) => { setForm((p) => ({ ...p, [key]: value })); setErrors((p) => ({ ...p, [key]: "" })); };

  const fields = [
    { key: "name", icon: User, placeholder: "Full Name", type: "text" },
    { key: "email", icon: Mail, placeholder: "Email Address", type: "email" },
    { key: "phone", icon: Phone, placeholder: "Phone Number", type: "tel" },
    { key: "address", icon: MapPin, placeholder: "Address", type: "text" },
    { key: "password", icon: Lock, placeholder: "Password", type: showPassword ? "text" : "password" },
    { key: "confirmPassword", icon: Lock, placeholder: "Confirm Password", type: showPassword ? "text" : "password" },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">
      <div className="fixed top-4 right-4 z-50"><ThemeToggle /></div>
      <div className="hidden lg:flex lg:w-1/2 relative items-end justify-center overflow-hidden" style={{ background: "var(--gradient-auth-bg)" }}>
        <div className="absolute inset-0"><BuyerLoginScene /></div>
        <div className="relative z-10 text-center px-10 pb-12">
          <h2 className="text-3xl font-display font-bold text-white mb-2">Join Uzhavan</h2>
          <p className="text-white/60 text-sm max-w-xs mx-auto leading-relaxed">
            Start reserving fresh grain directly from farmers across Tamil Nadu.
          </p>
        </div>
      </div>
      <div className="flex-1 relative flex items-center justify-center px-8 py-8 bg-background overflow-y-auto overflow-x-hidden">
        <BubbleBackground contained />
        <div className="relative z-10 w-full max-w-md">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Create Account</h1>
          <p className="text-muted-foreground mb-6">Register as a buyer on Uzhavan</p>
          <form onSubmit={handleRegister} className="space-y-4">
            {fields.map(({ key, icon: Icon, placeholder, type }) => (
              <div key={key} className="space-y-1">
                <div className="relative">
                  <Icon className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    className={`pl-11 h-11 ${key.includes("password") ? "pr-11" : ""} ${errors[key] ? "border-destructive" : ""}`}
                    placeholder={placeholder} type={type} value={form[key]} onChange={(e) => update(key, e.target.value)} required
                  />
                  {key === "password" && (
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
                {errors[key] && <p className="text-xs text-destructive pl-1">{errors[key]}</p>}
              </div>
            ))}
            <Button type="submit" className="w-full h-11 ripple-btn" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}<Link to="/buyer/login" className="text-primary font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default BuyerRegister;
