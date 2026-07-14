import { useState, useEffect } from "react";
import { Pencil, Save, User, Phone, MapPin, Mail, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

const BuyerProfile = () => {
  const { user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user || {});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => { setForm(user || {}); }, [user]);

  const userData = user || {};
  const initial = (userData.name || "U").charAt(0).toUpperCase();

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: form.name, phone: form.phone, address: form.address });
      setEditing(false);
      toast({ title: "Profile updated! ✅", description: "Your changes have been saved." });
    } catch (err) {
      toast({ title: "Update failed", description: err.message || "Please try again", variant: "destructive" });
    }
    setSaving(false);
  };

  const editFields = [
    { key: "name", icon: User, label: "Name" },
    { key: "phone", icon: Phone, label: "Phone" },
    { key: "address", icon: MapPin, label: "Address" },
  ];

  const viewFields = [
    { icon: User, label: "Name", value: userData.name },
    { icon: Phone, label: "Phone", value: userData.phone },
    { icon: MapPin, label: "Address", value: userData.address },
    { icon: Mail, label: "Email", value: userData.email },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="buyer" />
      <BubbleBackground />
      <PageTransition>
        <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
          <div className="bg-card rounded-2xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex flex-col items-center pt-10 pb-6 px-8" style={{ background: "var(--gradient-hero)" }}>
              <div className="relative mb-4">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-primary-foreground text-3xl font-bold shadow-lg"
                  style={{ background: "var(--gradient-avatar)" }}
                >
                  {initial}
                </div>
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground">{userData.name || "User"}</h1>
              <p className="text-muted-foreground text-sm mt-1">Buyer Account</p>
            </div>

            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-lg font-semibold text-foreground">Profile Information</h2>
                {!editing && (
                  <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                    <Pencil className="w-4 h-4 mr-1" /> Edit Profile
                  </Button>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  {editFields.map(({ key, icon: Icon, label }) => (
                    <div key={key}>
                      <label className="text-sm text-muted-foreground mb-1 block">{label}</label>
                      <div className="relative">
                        <Icon className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                        <Input className="pl-11 h-11" value={form[key] || ""} onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    </div>
                  ))}
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Email (read-only)</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                      <Input className="pl-11 h-11 bg-muted" value={userData.email || ""} readOnly />
                    </div>
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button onClick={handleSave} disabled={saving} className="flex-1 h-11 ripple-btn">
                      {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => { setEditing(false); setForm(user || {}); }} className="h-11 px-5">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {viewFields.map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-center gap-3 p-3.5 rounded-xl bg-secondary/50">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                        <Icon className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className="text-sm font-medium text-foreground">{value || "—"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default BuyerProfile;
