import { useState, useEffect } from "react";
import { Pencil, Trash2, Save, X, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { grainApi } from "@/lib/api";

const ManageStock = () => {
  const { toast } = useToast();
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ quantity: "", price: "" });

  const reload = () => {
    setLoading(true);
    grainApi
      .getMyListings()
      .then((data) => setGrains(data))
      .catch(() => setGrains([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, []);

  const startEdit = (grain) => {
    setEditingId(grain.id);
    setEditForm({ quantity: String(grain.availableKg), price: String(grain.pricePerKg) });
  };

  const handleSave = async (grain) => {
    try {
      const updated = await grainApi.update(grain.id, {
        name: grain.name,
        type: grain.type,
        pricePerKg: parseInt(editForm.price) || grain.pricePerKg,
        availableKg: parseInt(editForm.quantity) || grain.availableKg,
        image: grain.image,
        farmerPhone: grain.farmerPhone,
        location: grain.location,
        lat: grain.lat,
        lng: grain.lng,
      });
      setGrains((prev) => prev.map((g) => (g.id === grain.id ? updated : g)));
      setEditingId(null);
      toast({ title: "Stock updated! ✅" });
    } catch (err) {
      toast({ title: "Update failed", description: err.message || "Please try again", variant: "destructive" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await grainApi.delete(id);
      setGrains((prev) => prev.filter((g) => g.id !== id));
      toast({ title: "Stock deleted", variant: "destructive" });
    } catch (err) {
      toast({ title: "Delete failed", description: err.message || "Please try again", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="seller" />
      <BubbleBackground />
      <PageTransition>
        <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground">Manage Stock 📊</h1>
            <p className="text-muted-foreground mt-1">View and manage your posted grain stocks</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading stock…
            </div>
          ) : grains.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-5xl mb-4">📭</p>
              <p>No stocks posted yet</p>
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-secondary text-sm font-medium text-muted-foreground border-b border-border">
                <span>Grain</span><span>Quantity</span><span>Price/kg</span><span>Reserved</span><span>Status</span><span className="text-right">Actions</span>
              </div>

              {grains.map((grain) => (
                <div
                  key={grain.id}
                  className="grid grid-cols-1 md:grid-cols-6 gap-4 px-6 py-4 border-b border-border last:border-b-0 items-center"
                >
                  <div className="flex items-center gap-3">
                    <img src={grain.image} alt={grain.name} className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium text-foreground text-sm">{grain.name}</span>
                  </div>

                  {editingId === grain.id ? (
                    <>
                      <Input className="h-9" type="number" value={editForm.quantity} onChange={(e) => setEditForm((p) => ({ ...p, quantity: e.target.value }))} />
                      <Input className="h-9" type="number" value={editForm.price} onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))} />
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-foreground">{grain.availableKg} kg</span>
                      <span className="text-sm text-foreground">₹{grain.pricePerKg}</span>
                    </>
                  )}

                  <span className="text-sm text-muted-foreground">{grain.reservedKg} kg</span>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${grain.availableKg > 0 ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"}`}>
                    {grain.availableKg > 0 ? "Active" : "Out of Stock"}
                  </span>

                  <div className="flex gap-2 justify-end">
                    {editingId === grain.id ? (
                      <>
                        <Button size="sm" variant="outline" onClick={() => handleSave(grain)}><Save className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingId(null)}><X className="w-3.5 h-3.5" /></Button>
                      </>
                    ) : (
                      <>
                        <Button size="sm" variant="outline" onClick={() => startEdit(grain)}><Pencil className="w-3.5 h-3.5" /></Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(grain.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
};

export default ManageStock;
