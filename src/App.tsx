import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LoadingScreen from "@/components/LoadingScreen";
import CartNotification from "@/components/CartNotification";
import WishlistNotification from "@/components/WishlistNotification";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Brands from "./pages/Brands";
import FAQ from "./pages/FAQ";
import ShippingReturns from "./pages/ShippingReturns";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import OrderSuccess from "./pages/OrderSuccess";
import Invoice from "./pages/Invoice";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const CartNotificationWrapper = () => {
  const { notification, clearNotification } = useCart();
  return <CartNotification product={notification} onClose={clearNotification} />;
};

const WishlistNotificationWrapper = () => {
  const { notification, clearNotification } = useWishlist();
  return <WishlistNotification product={notification?.product || null} action={notification?.action || "added"} onClose={clearNotification} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Toaster />
              <Sonner />
              <LoadingScreen />
              <BrowserRouter>
                <CartNotificationWrapper />
                <WishlistNotificationWrapper />
                <Header />
                <main className="min-h-screen">
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetail />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/brands" element={<Brands />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/shipping-returns" element={<ShippingReturns />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/wishlist" element={<Wishlist />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/order/:id" element={<OrderDetail />} />
                    <Route path="/order-success" element={<OrderSuccess />} />
                    <Route path="/invoice/:id" element={<Invoice />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <Footer />
              </BrowserRouter>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
