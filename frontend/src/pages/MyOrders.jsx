import { useState, useEffect, useCallback } from "react";
import { Package, CheckCircle, XCircle, MapPin, AlertTriangle, Truck, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import BubbleBackground from "@/components/BubbleBackground";
import PageTransition from "@/components/PageTransition";
import CountdownTimer from "@/components/CountdownTimer";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { reservationApi } from "@/lib/api";

const statusConfig = {
  Booked:    { icon: <Package className="w-4 h-4" />,     className: "text-warning-foreground bg-warning/20" },
  Collected: { icon: <CheckCircle className="w-4 h-4" />, className: "text-success-foreground bg-success/20" },
  Cancelled: { icon: <XCircle className="w-4 h-4" />,     className: "text-destructive bg-destructive/10" },
};

const CANCEL_REASONS = [
  "Changed my mind",
  "Found a better price",
  "Cannot collect within time",
  "Ordered by mistake",
  "Other",
];

const MyOrders = () => {
  const location = useLocation();
  const userType = location.pathname.startsWith("/seller") ? "seller" : "buyer";
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cancel flow
  const [confirmId, setConfirmId] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  // Collect flow (seller)
  const [collectConfirmId, setCollectConfirmId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const { toast } = useToast();

  const reload = useCallback(() => {
    reservationApi
      .getMine()
      .then((data) => setOrders(data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    reload();
    const interval = setInterval(reload, 10000);
    return () => clearInterval(interval);
  }, [reload]);

  // Buyer: Cancel order
  const handleCancel = async () => {
    const reason = cancelReason === "Other" ? customReason.trim() : cancelReason;
    if (!reason) return;

    setActionLoading(true);
    try {
      const order = orders.find((o) => o.id === confirmId);
      await reservationApi.cancel(confirmId);
      toast({
        title: "Order Cancelled",
        description: order ? `${order.quantityKg} kg of ${order.grainName} has been released.` : "Order cancelled",
        variant: "destructive",
      });
    } catch (err) {
      toast({ title: "Cancel failed", description: err.message || "Please try again", variant: "destructive" });
    }

    setConfirmId(null);
    setCancelReason("");
    setCustomReason("");
    setActionLoading(false);
    reload();
  };

  const openCancelDialog = (orderId) => {
    setConfirmId(orderId);
    setCancelReason("");
    setCustomReason("");
  };

  // Seller: Mark as Collected
  const handleMarkCollected = async () => {
    setActionLoading(true);
    try {
      const order = orders.find((o) => o.id === collectConfirmId);
      await reservationApi.markCollected(collectConfirmId);
      toast({
        title: "Order Marked as Collected",
        description: order ? `${order.quantityKg} kg of ${order.grainName} collected by ${order.buyerName}.` : "Order marked as collected",
      });
    } catch (err) {
      toast({ title: "Update failed", description: err.message || "Please try again", variant: "destructive" });
    }

    setCollectConfirmId(null);
    setActionLoading(false);
    reload();
  };

  const title = userType === "buyer" ? "My Orders" : "Orders Received";
  const confirmOrder = orders.find((o) => o.id === confirmId);
  const collectOrder = orders.find((o) => o.id === collectConfirmId);
  const isReasonValid = cancelReason && (cancelReason !== "Other" || customReason.trim().length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar userType={userType} />
      <BubbleBackground />
      <PageTransition>
        <div className="relative z-10 pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className="mb-10">
            <h1 className="text-3xl font-display font-bold text-foreground">
              {userType === "buyer" ? "My Orders 📦" : "Orders Received 📋"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {userType === "buyer" ? "Track your grain reservations" : "View and manage buyer reservations"}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading orders…
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-5xl mb-4">📭</p>
              <p>No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const config = statusConfig[order.status] || statusConfig.Booked;
                const canCancel = userType === "buyer" && order.status === "Booked";
                const canMarkCollected = userType === "seller" && order.status === "Booked";

                return (
                  <div key={order.id} className="bg-card rounded-xl border border-border overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
                    <div className="flex flex-col sm:flex-row">
                      <img src={order.grainImage} alt={order.grainName} className="w-full sm:w-32 h-32 object-cover flex-shrink-0" />
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4 flex-wrap">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-mono text-xs text-muted-foreground">#{order.id}</span>
                              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
                                {config.icon} {order.status}
                              </span>
                            </div>
                            <h3 className="font-display font-semibold text-foreground">{order.grainName}</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              {order.quantityKg} kg •{" "}
                              {userType === "seller" ? `Buyer: ${order.buyerName}` : order.farmer}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                              <MapPin className="w-3 h-3" /> {order.location}
                            </p>
                          </div>

                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            {order.status === "Booked" && <CountdownTimer expiresAt={order.expiresAt} />}

                            {canCancel && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:border-destructive text-xs px-3 h-8"
                                onClick={() => openCancelDialog(order.id)}
                              >
                                <XCircle className="w-3.5 h-3.5 mr-1" />
                                Cancel Order
                              </Button>
                            )}

                            {canMarkCollected && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs px-3 h-8 border-green-500/40 text-green-600 hover:bg-green-50 hover:border-green-500 dark:text-green-400 dark:hover:bg-green-950"
                                onClick={() => setCollectConfirmId(order.id)}
                              >
                                <Truck className="w-3.5 h-3.5 mr-1" />
                                Mark Collected
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>

      {/* Cancel Confirmation Dialog */}
      {confirmId && confirmOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Cancel Order?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">This cannot be undone</p>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-3 mb-4 text-sm">
              <p className="font-medium text-foreground">{confirmOrder.grainName}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{confirmOrder.quantityKg} kg • {confirmOrder.farmer}</p>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium text-foreground mb-2">Reason for cancellation</p>
              <div className="space-y-2">
                {CANCEL_REASONS.map((reason) => (
                  <label
                    key={reason}
                    className="flex items-center gap-2.5 cursor-pointer"
                    onClick={() => setCancelReason(reason)}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        cancelReason === reason
                          ? "border-destructive bg-destructive"
                          : "border-border hover:border-destructive/60"
                      }`}
                    >
                      {cancelReason === reason && (
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      )}
                    </div>
                    <span className="text-sm text-foreground">{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReason === "Other" && (
                <textarea
                  className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-destructive resize-none"
                  rows={2}
                  placeholder="Please describe your reason..."
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                />
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              The reserved stock will be released back to the seller. Are you sure you want to cancel this order?
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={() => { setConfirmId(null); setCancelReason(""); setCustomReason(""); }}
              >
                Keep Order
              </Button>
              <Button
                className="flex-1 h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                disabled={!isReasonValid || actionLoading}
                onClick={handleCancel}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Yes, Cancel"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mark Collected Confirmation Dialog */}
      {collectConfirmId && collectOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}>
          <div className="bg-card rounded-2xl border border-border p-6 max-w-sm w-full" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-foreground">Mark as Collected?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Confirm the buyer picked up the grain</p>
              </div>
            </div>

            <div className="bg-secondary rounded-lg p-3 mb-5 text-sm">
              <p className="font-medium text-foreground">{collectOrder.grainName}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {collectOrder.quantityKg} kg • Buyer: {collectOrder.buyerName}
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-5">
              This will mark the reservation as completed and record the sale in your dashboard.
            </p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-10"
                onClick={() => setCollectConfirmId(null)}
              >
                Not Yet
              </Button>
              <Button
                className="flex-1 h-10 bg-green-600 hover:bg-green-700 text-white"
                disabled={actionLoading}
                onClick={handleMarkCollected}
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-1.5" /> : <CheckCircle className="w-4 h-4 mr-1.5" />}
                Confirm Collected
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
