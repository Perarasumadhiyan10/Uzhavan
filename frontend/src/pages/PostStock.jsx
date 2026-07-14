import { useState, useEffect, useRef } from "react";
import { Upload, MapPin, Loader2, Eye, RefreshCw, CheckCircle2, AlertCircle, Phone, Navigation } from "lucide-react";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import PageTransition from "@/components/PageTransition";
import LocationMap from "@/components/LocationMap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { grainApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const PostStock = () => {
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const [sellerData, setSellerData] = useState(() => user || {});
  const [form, setForm] = useState(() => ({ name: "", quantity: "", price: "", phone: user?.phone || "" }));
  const [imagePreview, setImagePreview] = useState("");
  const [lat, setLat]           = useState(null);
  const [lng, setLng]           = useState(null);
  const [locLabel, setLocLabel] = useState("");
  const [locStatus, setLocStatus] = useState("idle"); // idle | locating | success | error | denied
  const [locMsg, setLocMsg]     = useState("");
  const [loading, setLoading]   = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const fileRef = useRef(null);

  useEffect(() => { detectLocation(); }, []);
  useEffect(() => { if (user) setSellerData(user); }, [user]);

  const reverseGeocode = async (latitude, longitude) => {
    try {
      const res  = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
      );
      const data = await res.json();
      const a    = data.address || {};
      const label =
        [a.village, a.town, a.suburb, a.city_district, a.city, a.county]
          .filter(Boolean)[0] ||
        `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      return label;
    } catch {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus("error");
      setLocMsg("Geolocation not supported by your browser.");
      setLat(11.6643); setLng(78.146);
      return;
    }
    setLocStatus("locating");
    setLocMsg("Detecting your location…");

    const timeoutId = setTimeout(() => {
      setLocStatus("error");
      setLocMsg("Timed out. Using Salem, Tamil Nadu as default.");
      setLat(11.6643); setLng(78.146);
    }, 14000);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        clearTimeout(timeoutId);
        const { latitude, longitude } = pos.coords;
        setLat(latitude);
        setLng(longitude);
        setLocStatus("success");
        setLocMsg("Fetching address…");
        const label = await reverseGeocode(latitude, longitude);
        setLocLabel(label);
        setLocMsg(`✓ ${label}`);
        // Sync farm location in seller profile
        setSellerData((prev) => ({ ...prev, farmLocation: label }));
        updateProfile({ farmLocation: label }).catch(() => {});
      },
      (err) => {
        clearTimeout(timeoutId);
        if (err.code === 1) {
          setLocStatus("denied");
          setLocMsg("Location access denied. Allow location in browser settings, then retry.");
        } else if (err.code === 2) {
          setLocStatus("error");
          setLocMsg("Location unavailable. Using Salem, Tamil Nadu as default.");
        } else {
          setLocStatus("error");
          setLocMsg("Request timed out. Using Salem, Tamil Nadu as default.");
        }
        setLat(11.6643); setLng(78.146);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setPhoneError("Enter a valid 10-digit phone number");
      return;
    }
    setPhoneError("");
    setLoading(true);
    const locationLabel = locLabel || sellerData.farmLocation || "Tamil Nadu";
    try {
      await grainApi.create({
        name: form.name,
        type: form.name,
        pricePerKg: parseInt(form.price),
        availableKg: parseInt(form.quantity),
        image: imagePreview || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
        farmerPhone: phoneDigits,
        location: locationLabel,
        lat: lat || 11.6643,
        lng: lng || 78.146,
      });
      if (phoneDigits && phoneDigits !== sellerData.phone) {
        const updated = await updateProfile({ phone: phoneDigits });
        setSellerData(updated);
      }
      toast({ title: "Stock posted!", description: `${form.quantity} kg of ${form.name} is now listed` });
      setForm((p) => ({ ...p, name: "", quantity: "", price: "" }));
      setImagePreview("");
    } catch (err) {
      toast({ title: "Failed to post stock", description: err.message || "Please try again", variant: "destructive" });
    }
    setLoading(false);
  };

  const previewValid = form.name && form.quantity && form.price;

  const locIcon = {
    locating: <Loader2 className="w-4 h-4 animate-spin text-primary" />,
    success:  <CheckCircle2 className="w-4 h-4 text-green-500" />,
    error:    <AlertCircle className="w-4 h-4 text-yellow-500" />,
    denied:   <AlertCircle className="w-4 h-4 text-red-500" />,
    idle:     <MapPin className="w-4 h-4 text-muted-foreground" />,
  }[locStatus];

  const locColor = {
    locating: "text-primary",
    success:  "text-green-600 dark:text-green-400",
    error:    "text-yellow-600 dark:text-yellow-400",
    denied:   "text-red-500",
    idle:     "text-muted-foreground",
  }[locStatus];

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="seller" />
      <BubbleBackground />
      <PageTransition>
        <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground">Post New Stock</h1>
            <p className="text-muted-foreground mt-1">List your grain for buyers to reserve</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* ── Form ── */}
            <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Grain Name</label>
                  <Input className="h-11" placeholder="e.g. Premium Wheat"
                    value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Quantity (kg)</label>
                  <Input className="h-11" type="number" min="1" placeholder="e.g. 500"
                    value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Price per kg (₹)</label>
                  <Input className="h-11" type="number" min="1" placeholder="e.g. 24"
                    value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))} required />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" /> Farmer Phone Number
                  </label>
                  <Input
                    className={`h-11 ${phoneError ? "border-destructive" : ""}`}
                    type="tel" inputMode="numeric" maxLength={10}
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={(e) => { setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })); setPhoneError(""); }}
                    required
                  />
                  {phoneError
                    ? <p className="text-xs text-destructive">{phoneError}</p>
                    : <p className="text-xs text-muted-foreground">Buyers will use this number to contact you</p>
                  }
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Grain Image</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors"
                  >
                    {imagePreview
                      ? <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      : <><Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" /><p className="text-sm text-muted-foreground">Click to upload image</p></>
                    }
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </div>

                {/* ── Location Section ── */}
                <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" /> Farm Location
                    </label>
                    <button type="button" onClick={detectLocation} disabled={locStatus === "locating"}
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline disabled:opacity-50 transition-opacity font-medium">
                      <Navigation className={`w-3 h-3 ${locStatus === "locating" ? "animate-spin" : ""}`} />
                      {locStatus === "locating" ? "Detecting…" : "Detect My Location"}
                    </button>
                  </div>

                  {/* Status pill */}
                  <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${
                    locStatus === "success" ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20" :
                    locStatus === "denied"  ? "bg-red-500/10 text-red-600 border border-red-500/20" :
                    locStatus === "error"   ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20" :
                    locStatus === "locating"? "bg-primary/10 text-primary border border-primary/20" :
                    "bg-muted text-muted-foreground border border-border"
                  }`}>
                    {locIcon}
                    <span>{locMsg || 'Tap "Detect My Location" to auto-fill'}</span>
                  </div>

                  {/* Live OpenStreetMap — read-only: tap "Open in Maps" to view on Google Maps */}
                  {lat && lng && (
                    <>
                      <LocationMap
                        lat={lat} lng={lng}
                        className="h-52 shadow-md"
                        interactive={false}
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Tap "Open in Maps →" to view your exact farm location on Google Maps
                      </p>
                    </>
                  )}

                  {locStatus === "denied" && (
                    <p className="text-xs text-muted-foreground bg-secondary rounded-lg px-3 py-2">
                      To enable: click the 🔒 icon in your browser address bar → Site settings → Location → Allow, then retry.
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 ripple-btn" disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Post Stock"}
                </Button>
              </form>
            </div>

            {/* ── Preview ── */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Eye className="w-4 h-4 text-primary" />
                <h3 className="font-display font-semibold text-foreground">Live Preview</h3>
              </div>
              {previewValid ? (
                <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                  <div className="h-48 overflow-hidden">
                    <img
                      src={imagePreview || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop"}
                      alt="Preview" className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-foreground text-lg">{form.name}</h3>
                    <p className="text-xl font-bold text-primary mt-1">₹{form.price}/kg</p>
                    <p className="text-sm text-muted-foreground mt-2">by {sellerData.name || "You"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{form.quantity} kg available</p>
                    {form.phone && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {form.phone}
                      </p>
                    )}
                    {locLabel && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-primary" /> {locLabel}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-card rounded-xl border border-border border-dashed p-12 text-center text-muted-foreground">
                  <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Fill in the form to see a live preview</p>
                </div>
              )}


            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default PostStock;
