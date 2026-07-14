import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, User, Scale, Phone, MessageCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import PageTransition from "@/components/PageTransition";
import LocationMap from "@/components/LocationMap";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { grainApi, reservationApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

const GrainDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [grain, setGrain] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    let mounted = true;
    grainApi
      .getById(id)
      .then((data) => mounted && setGrain(data))
      .catch(() => mounted && setGrain(null))
      .finally(() => mounted && setFetching(false));
    return () => { mounted = false; };
  }, [id]);

  if (fetching) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading…
      </div>
    );
  }

  if (!grain) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Grain not found</p>
      </div>
    );
  }

  const qtyNum = parseInt(quantity) || 0;
  const exceedsStock = qtyNum > grain.availableKg;
  const validQty = qtyNum > 0 && !exceedsStock;

  const handleReserve = async () => {
    if (!validQty) return;
    if (!user) {
      toast({ title: "Please log in", description: "You need a buyer account to reserve stock", variant: "destructive" });
      navigate("/buyer/login");
      return;
    }
    setLoading(true);
    try {
      await reservationApi.create(grain.id, qtyNum);
      toast({ title: "Stock Reserved! 🎉", description: `${qtyNum} kg of ${grain.name} reserved for 24 hours` });
      navigate("/buyer/orders");
    } catch (err) {
      toast({ title: "Reservation failed", description: err.message || "Please try again", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="buyer" />
      <BubbleBackground />
      <PageTransition>
        <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> Back to Browse
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="rounded-xl overflow-hidden border border-border" style={{ boxShadow: "var(--shadow-card)" }}>
                <img src={grain.image} alt={grain.name} className="w-full h-72 object-cover" />
              </div>
              <div className="mt-4">
                <LocationMap lat={grain.lat} lng={grain.lng} className="h-48" />
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">{grain.name}</h1>
                <p className="text-2xl font-bold text-primary mt-2">₹{grain.pricePerKg}/kg</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm">{grain.farmer}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{grain.location}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Scale className="w-4 h-4 text-primary" />
                  <span className="text-sm">{grain.availableKg} kg available</span>
                </div>
                {grain.farmerPhone && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-sm">{grain.farmerPhone}</span>
                  </div>
                )}
              </div>

              {grain.farmerPhone && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href={`tel:${grain.farmerPhone}`}
                    className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                  >
                    <Phone className="w-4 h-4 text-primary" /> Call Farmer
                  </a>
                  <a
                    href={`https://wa.me/91${grain.farmerPhone}?text=${encodeURIComponent(`Hi ${grain.farmer}, I found your listing on Uzhavan. I'm interested in your ${grain.name} at ₹${grain.pricePerKg}/kg (${grain.availableKg} kg available in ${grain.location}). Please let me know the details.`)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl border border-border bg-card text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" /> WhatsApp
                  </a>
                </div>
              )}

              <div className="bg-card rounded-xl border border-border p-6" style={{ boxShadow: "var(--shadow-card)" }}>
                <h3 className="font-display font-semibold text-foreground mb-4">Reserve Stock</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Quantity (kg)</label>
                    <Input
                      type="number" min="1" max={grain.availableKg}
                      placeholder={`Max ${grain.availableKg} kg`}
                      value={quantity} onChange={(e) => setQuantity(e.target.value)}
                      className={`h-11 ${exceedsStock ? "border-destructive" : ""}`}
                    />
                    {exceedsStock && <p className="text-xs text-destructive mt-1">Cannot exceed available stock of {grain.availableKg} kg</p>}
                  </div>
                  {validQty && (
                    <div className="p-3 rounded-lg bg-secondary text-sm">
                      <p className="text-foreground font-medium">Total: ₹{(qtyNum * grain.pricePerKg).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Must collect within 24 hours</p>
                    </div>
                  )}
                  <Button onClick={handleReserve} disabled={!validQty || loading} className="w-full h-11 ripple-btn">
                    {loading ? "Reserving..." : "Reserve Stock"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default GrainDetails;
