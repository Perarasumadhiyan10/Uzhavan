import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/lib/auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BuyerLogin from "./pages/BuyerLogin";
import BuyerRegister from "./pages/BuyerRegister";
import SellerLogin from "./pages/SellerLogin";
import SellerRegister from "./pages/SellerRegister";
import Register from "./pages/Register";
import BuyerDashboard from "./pages/BuyerDashboard";
import SellerDashboard from "./pages/SellerDashboard";
import BuyerProfile from "./pages/BuyerProfile";
import SellerProfile from "./pages/SellerProfile";
import BrowseGrain from "./pages/BrowseGrain";
import GrainDetails from "./pages/GrainDetails";
import MyOrders from "./pages/MyOrders";
import PostStock from "./pages/PostStock";
import ManageStock from "./pages/ManageStock";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner richColors />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/buyer/login" element={<BuyerLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/buyer/register" element={<Register />} />
            <Route
              path="/buyer/dashboard"
              element={<ProtectedRoute role="BUYER"><BuyerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/buyer/profile"
              element={<ProtectedRoute role="BUYER"><BuyerProfile /></ProtectedRoute>}
            />
            <Route path="/buyer/browse" element={<BrowseGrain />} />
            <Route path="/buyer/grain/:id" element={<GrainDetails />} />
            <Route
              path="/buyer/orders"
              element={<ProtectedRoute role="BUYER"><MyOrders /></ProtectedRoute>}
            />
            <Route path="/seller/login" element={<SellerLogin />} />
            <Route path="/seller/register" element={<Register />} />
            <Route
              path="/seller/dashboard"
              element={<ProtectedRoute role="SELLER"><SellerDashboard /></ProtectedRoute>}
            />
            <Route
              path="/seller/profile"
              element={<ProtectedRoute role="SELLER"><SellerProfile /></ProtectedRoute>}
            />
            <Route
              path="/seller/post-stock"
              element={<ProtectedRoute role="SELLER"><PostStock /></ProtectedRoute>}
            />
            <Route
              path="/seller/manage-stock"
              element={<ProtectedRoute role="SELLER"><ManageStock /></ProtectedRoute>}
            />
            <Route
              path="/seller/orders"
              element={<ProtectedRoute role="SELLER"><MyOrders /></ProtectedRoute>}
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
