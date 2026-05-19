import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Sparkles, Flame, Star, TrendingUp, Tag } from "lucide-react";
import { useSearchParams, Link } from "react-router-dom";
import { products, brands } from "@/data/products";
import ProductCard from "@/components/ProductCard";

const allFeatures = ["GPS", "AMOLED", "Heart Rate", "SpO₂", "Bluetooth Calling", "NFC", "Water Resistant"];
const allCategories = ["All", "Fitness", "Luxury", "Budget", "Kids", "Outdoor"];
const sortOptions = [
  { label: "Popularity", value: "popularity" },
  { label: "Price: Low–High", value: "price-asc" },
  { label: "Price: High–Low", value: "price-desc" },
  { label: "New Arrivals", value: "new" },
  { label: "Rating", value: "rating" },
];

const Shop = () => {
  const [searchParams] = useSearchParams();
  const brandFromUrl = searchParams.get("brand");
  const [category, setCategory] = useState("All");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

  useEffect(() => {
    if (brandFromUrl) {
      setSelectedBrands([brandFromUrl]);
    }
  }, [brandFromUrl]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [sortBy, setSortBy] = useState("popularity");
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  };

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
      if (selectedFeatures.length && !selectedFeatures.every((f) => p.features.includes(f))) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });

    switch (sortBy) {
      case "price-asc": result.sort((a, b) => a.price - b.price); break;
      case "price-desc": result.sort((a, b) => b.price - a.price); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      default: result.sort((a, b) => b.reviews - a.reviews);
    }
    return result;
  }, [category, selectedBrands, selectedFeatures, priceRange, sortBy]);

  const activeFilterCount = (category !== "All" ? 1 : 0) + selectedBrands.length + selectedFeatures.length;

  return (
    <div className="min-h-screen pt-24">
      {/* Hero band */}
      <div className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/15" />
        <div className="absolute -top-32 -left-20 w-[28rem] h-[28rem] rounded-full bg-primary/25 blur-[120px]" />
        <div className="absolute -bottom-32 -right-10 w-[26rem] h-[26rem] rounded-full bg-accent/25 blur-[120px]" />
        <div className="container-main px-4 sm:px-6 lg:px-8 py-12 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="text-[11px] font-semibold text-accent uppercase tracking-[0.25em] mb-3 block">The Collection</span>
            <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-3 leading-tight">
              Shop <span className="gold-gradient-text">Smart Watches</span>
            </h1>
            <p className="text-muted-foreground max-w-xl">
              {filtered.length} curated timepieces · authentic, warrantied, free shipping above ₹2,000.
            </p>
            <div className="flex flex-wrap gap-2 mt-5">
              {["100% Authentic", "Free Shipping", "7-day Returns", "EMI Available"].map((t) => (
                <span key={t} className="text-xs px-3 py-1.5 rounded-full bg-card/60 backdrop-blur border border-border/60 text-foreground/80">
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Trending strip */}
      <div className="container-main px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-accent" />
            <h2 className="font-heading font-bold text-lg">Trending Now</h2>
          </div>
          <span className="text-xs text-muted-foreground">Top-rated picks across categories</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
          {[...products].sort((a,b) => b.rating - a.rating).slice(0, 6).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/product/${p.id}`} className="group block glass-card-hover overflow-hidden">
                <div className="relative aspect-square bg-gradient-to-br from-muted/40 to-muted/10 overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-background/70 backdrop-blur text-[10px] font-bold">
                    <Star className="w-2.5 h-2.5 text-accent fill-accent" />{p.rating}
                  </div>
                </div>
                <div className="p-2.5">
                  <p className="text-[9px] text-muted-foreground uppercase tracking-wider truncate">{p.brand}</p>
                  <p className="text-xs font-semibold truncate">{p.name}</p>
                  <p className="text-xs font-bold gold-gradient-text mt-0.5">₹{p.price.toLocaleString("en-IN")}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="container-main px-4 sm:px-6 lg:px-8 pb-16">


        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-6">
          {allCategories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                category === c
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                  : "bg-secondary text-secondary-foreground hover:bg-surface-hover border border-transparent hover:border-primary/15"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Sort + Filter toggle */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium hover:bg-surface-hover transition-colors border border-transparent hover:border-primary/15"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-secondary text-sm font-medium border-none outline-none cursor-pointer"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card p-6 mb-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold">Filters</h3>
              <button
                onClick={() => { setSelectedBrands([]); setSelectedFeatures([]); setPriceRange([0, 100000]); setCategory("All"); }}
                className="text-xs text-primary hover:underline"
              >
                Clear All
              </button>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Brand</h4>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <button
                    key={b}
                    onClick={() => toggleFilter(selectedBrands, b, setSelectedBrands)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedBrands.includes(b)
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Features</h4>
              <div className="flex flex-wrap gap-2">
                {allFeatures.map((f) => (
                  <button
                    key={f}
                    onClick={() => toggleFilter(selectedFeatures, f, setSelectedFeatures)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedFeatures.includes(f)
                        ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                        : "bg-muted text-muted-foreground hover:text-foreground hover:bg-surface-hover"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-3">Price Range</h4>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={100000}
                  step={1000}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full accent-primary"
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">Up to ₹{priceRange[1].toLocaleString("en-IN")}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No watches match your filters.</p>
            <button
              onClick={() => { setSelectedBrands([]); setSelectedFeatures([]); setPriceRange([0, 100000]); setCategory("All"); }}
              className="mt-4 text-primary hover:underline text-sm"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
