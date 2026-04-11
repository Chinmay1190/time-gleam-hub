import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Watch, Heart, User, Sun, Moon, BarChart3 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Shop", path: "/shop" },
  { label: "Brands", path: "/brands" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { totalItems } = useCart();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="absolute inset-0 bg-background/70 backdrop-blur-2xl border-b border-border/50" />
      <div className="container-main flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 relative">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
            <Watch className="w-5 h-5 text-primary transition-transform duration-300 group-hover:rotate-12" />
          </div>
          <span className="font-heading text-xl font-bold tracking-tight">
            Chrono<span className="text-primary">Hub</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                location.pathname === link.path
                  ? "text-primary bg-primary/8"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              }`}
            >
              {link.label}
              {location.pathname === link.path && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-primary rounded-full"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl transition-all duration-200 hover:bg-secondary/50"
            aria-label="Toggle theme"
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </motion.div>
          </button>

          <Link
            to="/wishlist"
            className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-secondary/50"
          >
            <Heart className="w-5 h-5" />
          </Link>

          <Link
            to="/cart"
            className="relative p-2.5 rounded-xl transition-all duration-200 hover:bg-secondary/50"
          >
            <ShoppingCart className="w-5 h-5" />
            {totalItems > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-primary/30"
              >
                {totalItems}
              </motion.span>
            )}
          </Link>

          <Link
            to={user ? "/profile" : "/auth"}
            className={`p-2.5 rounded-xl transition-all duration-200 ${
              user ? "hover:bg-primary/10 text-primary" : "hover:bg-secondary/50"
            }`}
          >
            <User className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2.5 rounded-xl hover:bg-secondary/50 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background/95 backdrop-blur-2xl border-b border-border overflow-hidden relative"
          >
            <nav className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary flex items-center gap-3">
                <Heart className="w-4 h-4" /> Wishlist
              </Link>
              <Link to="/orders" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary flex items-center gap-3">
                <ShoppingCart className="w-4 h-4" /> My Orders
              </Link>
              <Link to="/reports" onClick={() => setMobileOpen(false)} className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary flex items-center gap-3">
                <BarChart3 className="w-4 h-4" /> Reports
              </Link>
              <Link
                to={user ? "/profile" : "/auth"}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-secondary flex items-center gap-3"
              >
                <User className="w-4 h-4" /> {user ? "Profile" : "Sign In"}
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
