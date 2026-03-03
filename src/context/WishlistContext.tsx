import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

interface WishlistNotification {
  product: { name: string; image: string; price: number };
  action: "added" | "removed";
}

interface WishlistContextType {
  wishlistIds: string[];
  toggleWishlist: (productId: string, productInfo?: { name: string; image: string; price: number }) => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  loading: boolean;
  notification: WishlistNotification | null;
  clearNotification: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<WishlistNotification | null>(null);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistIds([]);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("wishlists")
      .select("product_id")
      .eq("user_id", user.id);
    setWishlistIds(data?.map((w: any) => w.product_id) || []);
    setLoading(false);
  };

  const clearNotification = useCallback(() => setNotification(null), []);

  const toggleWishlist = async (productId: string, productInfo?: { name: string; image: string; price: number }) => {
    if (!user) return;
    
    if (wishlistIds.includes(productId)) {
      setWishlistIds((prev) => prev.filter((id) => id !== productId));
      if (productInfo) setNotification({ product: productInfo, action: "removed" });
      await supabase
        .from("wishlists")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);
    } else {
      setWishlistIds((prev) => [...prev, productId]);
      if (productInfo) setNotification({ product: productInfo, action: "added" });
      await supabase
        .from("wishlists")
        .insert({ user_id: user.id, product_id: productId });
    }
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, toggleWishlist, isWishlisted, loading, notification, clearNotification }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within WishlistProvider");
  return context;
};
