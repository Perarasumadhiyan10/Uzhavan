import { useEffect, useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import PageTransition from "@/components/PageTransition";
import { Input } from "@/components/ui/input";
import { grainApi } from "@/lib/api";

const BrowseGrain = () => {
  const [search, setSearch] = useState("");
  const [grains, setGrains] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const handle = setTimeout(() => {
      grainApi
        .getAll(search || undefined)
        .then((data) => mounted && setGrains(data))
        .catch(() => mounted && setGrains([]))
        .finally(() => mounted && setLoading(false));
    }, 250);
    return () => { mounted = false; clearTimeout(handle); };
  }, [search]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType="buyer" />
      <BubbleBackground />
      <PageTransition>
        <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground">Browse Grain 🌾</h1>
            <p className="text-muted-foreground mt-1">Explore fresh grain from verified farmers</p>
          </div>

          <div className="relative max-w-md mb-8">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
            <Input className="pl-11 h-11" placeholder="Search grains, farmers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading grains…
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {grains.map((grain) => (
                <div
                  key={grain.id}
                  onClick={() => navigate(`/buyer/grain/${grain.id}`)}
                  className="bg-card rounded-xl border border-border overflow-hidden cursor-pointer group hover:-translate-y-1 transition-transform duration-200"
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img src={grain.image} alt={grain.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-primary border border-border">
                      ₹{grain.pricePerKg}/kg
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-semibold text-foreground text-lg">{grain.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">by {grain.farmer}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-xs text-muted-foreground">📍 {grain.location}</span>
                      <span className="text-xs font-medium text-primary">{grain.availableKg} kg available</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && grains.length === 0 && (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-5xl mb-4">🔍</p>
              <p>No grains found matching your search.</p>
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
};

export default BrowseGrain;
