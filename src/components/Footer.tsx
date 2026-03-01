import { Link } from "react-router-dom";
import { Watch, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";

const Footer = () => (
  <footer className="relative bg-card/80 border-t border-border">
    {/* Top accent line */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    
    <div className="container-main section-padding">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-5">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Watch className="w-5 h-5 text-primary" />
            </div>
            <span className="font-heading text-lg font-bold">
              Chrono<span className="text-primary">Hub</span>
            </span>
          </Link>
          <p className="text-sm text-muted-foreground leading-relaxed">
            India's premium destination for smart watches. Curating the finest wearable technology since 2020.
          </p>
          <div className="flex gap-3">
            {["Twitter", "Instagram", "YouTube"].map((social) => (
              <span key={social} className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                {social[0]}
              </span>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-primary/80">Quick Links</h4>
          <div className="flex flex-col gap-2.5">
            {[
              { label: "Shop", path: "/shop" },
              { label: "Brands", path: "/brands" },
              { label: "About Us", path: "/about" },
              { label: "Contact", path: "/contact" },
              { label: "My Orders", path: "/orders" },
              { label: "Wishlist", path: "/wishlist" },
              { label: "FAQ", path: "/faq" },
            ].map((l) => (
              <Link key={l.path} to={l.path} className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 group">
                {l.label}
                <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-primary/80">Categories</h4>
          <div className="flex flex-col gap-2.5">
            {["Fitness", "Luxury", "Budget", "Kids", "Outdoor"].map((c) => (
              <Link key={c} to="/shop" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {c} Watches
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-heading font-semibold text-sm uppercase tracking-wider text-primary/80">Contact</h4>
          <div className="flex flex-col gap-3.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              hello@chronohub.in
            </span>
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              +91 98765 43210
            </span>
            <span className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              Mumbai, India
            </span>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
        <p className="text-xs text-muted-foreground">© 2025 ChronoHub. All rights reserved.</p>
        <div className="flex gap-6 text-xs text-muted-foreground">
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
          <Link to="/shipping-returns" className="hover:text-primary transition-colors">Shipping & Returns</Link>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
