import { useState } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Smartphone, Wallet, Banknote, ArrowLeft, Shield, Truck, Tag, Percent } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const steps = ["Details", "Shipping", "Payment"];

const paymentMethods = [
  { id: "upi", icon: Smartphone, label: "UPI Payment", desc: "GPay / PhonePe / Paytm" },
  { id: "card", icon: CreditCard, label: "Credit / Debit Card", desc: "Visa, Mastercard, RuPay" },
  { id: "netbanking", icon: Wallet, label: "Net Banking", desc: "All major banks" },
  { id: "cod", icon: Banknote, label: "Cash on Delivery", desc: "Pay when delivered" },
];

const GST_RATE = 18;

const discountCodes: Record<string, { type: "percent" | "flat"; value: number; minOrder: number }> = {
  WELCOME10: { type: "percent", value: 10, minOrder: 999 },
  FLAT500: { type: "flat", value: 500, minOrder: 4999 },
  CHRONO20: { type: "percent", value: 20, minOrder: 9999 },
  SAVE1000: { type: "flat", value: 1000, minOrder: 14999 },
};

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
  });

  const updateForm = (key: string, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const formatPrice = (p: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const subtotal = totalPrice;
  const gstAmount = Math.round((subtotal - discountAmount) * GST_RATE / 100);
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal - discountAmount + gstAmount + shipping;

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    const coupon = discountCodes[code];
    if (!coupon) {
      toast({ title: "Invalid coupon code", variant: "destructive" });
      return;
    }
    if (subtotal < coupon.minOrder) {
      toast({ title: `Minimum order ₹${coupon.minOrder.toLocaleString()} required`, variant: "destructive" });
      return;
    }
    const discount = coupon.type === "percent" ? Math.round(subtotal * coupon.value / 100) : coupon.value;
    setDiscountAmount(discount);
    setAppliedCoupon(code);
    toast({ title: `Coupon applied! You save ${formatPrice(discount)}` });
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
        toast({ title: "Please fill all fields", variant: "destructive" });
        return false;
      }
    }
    if (step === 1) {
      if (!form.address.trim() || !form.city.trim() || !form.state.trim() || !form.pincode.trim()) {
        toast({ title: "Please fill complete address", variant: "destructive" });
        return false;
      }
      if (form.pincode.trim().length !== 6) {
        toast({ title: "Please enter a valid 6-digit PIN code", variant: "destructive" });
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    if (step < 2) setStep(step + 1);
    else placeOrder();
  };

  const placeOrder = async () => {
    if (!user) {
      toast({ title: "Please sign in to place an order", variant: "destructive" });
      navigate("/auth");
      return;
    }

    setPlacing(true);
    try {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          subtotal: subtotal - discountAmount,
          gst_amount: gstAmount,
          gst_rate: GST_RATE,
          shipping_amount: shipping,
          total_amount: total,
          payment_method: selectedPayment,
          payment_status: selectedPayment === "cod" ? "pending" : "paid",
          shipping_name: form.name,
          shipping_phone: form.phone,
          shipping_address: form.address,
          shipping_city: form.city,
          shipping_state: form.state,
          shipping_pincode: form.pincode,
          status: "confirmed",
          estimated_delivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_image: item.product.image,
        quantity: item.quantity,
        price: item.product.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      clearCart();
      navigate(`/order-success?id=${order.id}`);
    } catch (err: any) {
      toast({ title: "Failed to place order", description: err.message, variant: "destructive" });
    } finally {
      setPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-6 px-4">
        <h1 className="font-heading text-2xl font-bold">Sign in to checkout</h1>
        <p className="text-muted-foreground text-center">Create an account to save your orders and track deliveries.</p>
        <Link to="/auth" className="btn-primary">Sign In / Sign Up</Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Link to="/shop" className="text-primary hover:underline text-sm">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container-main px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Left - Form */}
          <div className="lg:col-span-2">
            <span className="text-xs font-semibold text-primary uppercase tracking-widest mb-2 block">Checkout</span>
            <h1 className="font-heading text-3xl font-bold mb-8">Complete Your Order</h1>

            {/* Progress */}
            <div className="flex items-center mb-10">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i <= step ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-muted text-muted-foreground"
                  }`}>
                    {i < step ? <Check className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className={`ml-2 text-sm font-medium hidden sm:inline ${i <= step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
                  {i < 2 && <div className={`flex-1 h-px mx-4 transition-colors duration-300 ${i < step ? "bg-primary" : "bg-border"}`} />}
                </div>
              ))}
            </div>

            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 space-y-6">
              {step === 0 && (
                <>
                  <h2 className="font-heading font-semibold text-lg">Your Details</h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Full Name</label>
                      <input placeholder="John Doe" value={form.name} onChange={(e) => updateForm("name", e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Email</label>
                      <input placeholder="you@example.com" type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Phone</label>
                      <input placeholder="+91 98765 43210" type="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} className="input-field" />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="font-heading font-semibold text-lg">Shipping Address</h2>
                  <div className="grid gap-4">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Full Address</label>
                      <input placeholder="Street address, apartment, floor..." value={form.address} onChange={(e) => updateForm("address", e.target.value)} className="input-field" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">City</label>
                        <input placeholder="Mumbai" value={form.city} onChange={(e) => updateForm("city", e.target.value)} className="input-field" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">PIN Code</label>
                        <input placeholder="400001" value={form.pincode} onChange={(e) => updateForm("pincode", e.target.value)} className="input-field" maxLength={6} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">State</label>
                      <input placeholder="Maharashtra" value={form.state} onChange={(e) => updateForm("state", e.target.value)} className="input-field" />
                    </div>
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 className="font-heading font-semibold text-lg">Payment Method</h2>
                  <div className="grid gap-3">
                    {paymentMethods.map((m) => (
                      <label
                        key={m.id}
                        className={`glass-card p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 ${
                          selectedPayment === m.id ? "border-primary/50 bg-primary/5 shadow-sm shadow-primary/10" : "hover:border-primary/20"
                        }`}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value={m.id}
                          checked={selectedPayment === m.id}
                          onChange={() => setSelectedPayment(m.id)}
                          className="accent-primary"
                        />
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <m.icon className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="text-sm font-medium block">{m.label}</span>
                          <span className="text-xs text-muted-foreground">{m.desc}</span>
                        </div>
                      </label>
                    ))}
                  </div>

                  {/* UPI ID field */}
                  {selectedPayment === "upi" && (
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">UPI ID</label>
                      <input placeholder="yourname@upi" className="input-field" />
                    </div>
                  )}

                  {/* Card fields */}
                  {selectedPayment === "card" && (
                    <div className="grid gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Card Number</label>
                        <input placeholder="1234 5678 9012 3456" className="input-field" maxLength={19} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Expiry</label>
                          <input placeholder="MM/YY" className="input-field" maxLength={5} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">CVV</label>
                          <input placeholder="***" type="password" className="input-field" maxLength={4} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="flex gap-4">
                {step > 0 && (
                  <button onClick={() => setStep(step - 1)} className="btn-secondary py-3 px-6">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                )}
                <button
                  onClick={nextStep}
                  disabled={placing}
                  className="flex-1 px-6 py-3.5 bg-primary text-primary-foreground rounded-2xl font-heading font-semibold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                >
                  {placing ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin mx-auto" />
                  ) : step === 2 ? (
                    `Place Order • ${formatPrice(total)}`
                  ) : (
                    "Continue"
                  )}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right - Summary */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 space-y-4 sticky top-24">
              <h3 className="font-heading font-semibold text-lg">Order Summary</h3>

              <div className="space-y-3 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted/30 flex-shrink-0 border border-border">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold">{formatPrice(item.product.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Coupon Code */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">Discount Code</span>
                </div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-primary" />
                      <span className="text-sm font-bold text-primary">{appliedCoupon}</span>
                      <span className="text-xs text-muted-foreground">(-{formatPrice(discountAmount)})</span>
                    </div>
                    <button onClick={removeCoupon} className="text-xs text-destructive hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="flex-1 px-3 py-2 bg-muted rounded-lg text-sm outline-none focus:ring-1 ring-primary border border-transparent focus:border-primary/30"
                    />
                    <button onClick={applyCoupon} className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:scale-[1.02] transition-transform">
                      Apply
                    </button>
                  </div>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  {Object.keys(discountCodes).map((code) => (
                    <button
                      key={code}
                      onClick={() => { setCouponCode(code); }}
                      className="text-[10px] px-2 py-0.5 border border-dashed border-primary/40 text-primary rounded-md hover:bg-primary/5 transition-colors"
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">GST (18%)</span>
                  <span>{formatPrice(gstAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className={shipping === 0 ? "text-primary font-medium" : ""}>
                    {shipping === 0 ? "Free" : formatPrice(shipping)}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-muted-foreground">Free shipping on orders ≥ ₹999</p>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-lg font-heading font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-2">
                <Shield className="w-3.5 h-3.5 text-primary" />
                Secure & encrypted checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
