import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Check, CreditCard, Smartphone, Wallet, Banknote, ArrowLeft, Shield, Truck, Tag, Percent, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
  "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Chandigarh", "Puducherry",
];

interface FieldError {
  [key: string]: string;
}

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("upi");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [errors, setErrors] = useState<FieldError>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    address: "", city: "", state: "", pincode: "",
    upiId: "", cardNumber: "", cardExpiry: "", cardCvv: "", cardName: "",
  });

  const sanitizeName = (val: string) => val.replace(/[^a-zA-Z\s.]/g, "").replace(/\s{2,}/g, " ");
  const sanitizeAddress = (val: string) => val.replace(/[^a-zA-Z0-9\s,.\-/#()]/g, "");
  const sanitizeCity = (val: string) => val.replace(/[^a-zA-Z\s]/g, "").replace(/\s{2,}/g, " ");

  const updateForm = (key: string, value: string) => {
    let sanitized = value;
    if (key === "name" || key === "cardName") sanitized = sanitizeName(value);
    else if (key === "city") sanitized = sanitizeCity(value);
    else if (key === "address") sanitized = sanitizeAddress(value);
    else if (key === "pincode") sanitized = value.replace(/\D/g, "").slice(0, 6);

    setForm((prev) => ({ ...prev, [key]: sanitized }));
    if (errors[key]) {
      setErrors((prev) => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const markTouched = (key: string) => setTouched((prev) => ({ ...prev, [key]: true }));

  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 10);
    return digits;
  };

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

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
      toast.error("Invalid coupon code");
      return;
    }
    if (subtotal < coupon.minOrder) {
      toast.error(`Minimum order Rs.${coupon.minOrder.toLocaleString()} required`);
      return;
    }
    const discount = coupon.type === "percent" ? Math.round(subtotal * coupon.value / 100) : coupon.value;
    setDiscountAmount(discount);
    setAppliedCoupon(code);
    toast.success(`Coupon applied! You save ${formatPrice(discount)}`);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setCouponCode("");
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone: string) => /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));
  const validatePincode = (pin: string) => /^\d{6}$/.test(pin.trim());
  const validateUpi = (upi: string) => /^[\w.-]+@[\w]+$/.test(upi.trim());
  const validateCardNumber = (card: string) => card.replace(/\s/g, "").length === 16;
  const validateExpiry = (exp: string) => {
    if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
    const [m, y] = exp.split("/").map(Number);
    if (m < 1 || m > 12) return false;
    const now = new Date();
    const expDate = new Date(2000 + y, m);
    return expDate > now;
  };
  const validateCvv = (cvv: string) => /^\d{3,4}$/.test(cvv);

  const validateStep = useCallback((): boolean => {
    const newErrors: FieldError = {};

    if (step === 0) {
      if (!form.name.trim()) newErrors.name = "Full name is required";
      else if (form.name.trim().length < 2) newErrors.name = "Name must be at least 2 characters";
      else if (!/^[a-zA-Z][a-zA-Z.\s]{1,}$/.test(form.name.trim())) newErrors.name = "Enter a valid name (letters and spaces only)";
      else if (form.name.trim().split(/\s+/).length < 2) newErrors.name = "Please enter your full name (first & last)";

      if (!form.email.trim()) newErrors.email = "Email is required";
      else if (!validateEmail(form.email)) newErrors.email = "Enter a valid email address";

      if (!form.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!validatePhone(form.phone)) newErrors.phone = "Enter a valid 10-digit Indian mobile number (starting with 6-9)";
    }

    if (step === 1) {
      if (!form.address.trim()) newErrors.address = "Address is required";
      else if (form.address.trim().length < 10) newErrors.address = "Please enter a complete address (at least 10 characters)";
      else if (!/[a-zA-Z]/.test(form.address)) newErrors.address = "Address must contain letters";

      if (!form.city.trim()) newErrors.city = "City is required";
      else if (form.city.trim().length < 2) newErrors.city = "Enter a valid city name";
      else if (!/^[a-zA-Z\s]+$/.test(form.city.trim())) newErrors.city = "City must contain only letters";

      if (!form.state.trim()) newErrors.state = "State is required";

      if (!form.pincode.trim()) newErrors.pincode = "PIN code is required";
      else if (!validatePincode(form.pincode)) newErrors.pincode = "Enter a valid 6-digit PIN code";
    }

    if (step === 2) {
      if (selectedPayment === "upi") {
        if (!form.upiId.trim()) newErrors.upiId = "UPI ID is required";
        else if (!validateUpi(form.upiId)) newErrors.upiId = "Enter a valid UPI ID (e.g. name@upi)";
      }
      if (selectedPayment === "card") {
        if (!form.cardName.trim()) newErrors.cardName = "Cardholder name is required";
        if (!form.cardNumber.trim()) newErrors.cardNumber = "Card number is required";
        else if (!validateCardNumber(form.cardNumber)) newErrors.cardNumber = "Enter a valid 16-digit card number";
        if (!form.cardExpiry.trim()) newErrors.cardExpiry = "Expiry date is required";
        else if (!validateExpiry(form.cardExpiry)) newErrors.cardExpiry = "Enter a valid future date (MM/YY)";
        if (!form.cardCvv.trim()) newErrors.cardCvv = "CVV is required";
        else if (!validateCvv(form.cardCvv)) newErrors.cardCvv = "Enter a valid 3 or 4 digit CVV";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [step, form, selectedPayment]);

  const nextStep = () => {
    // Mark all fields as touched for current step
    if (step === 0) setTouched(p => ({ ...p, name: true, email: true, phone: true }));
    if (step === 1) setTouched(p => ({ ...p, address: true, city: true, state: true, pincode: true }));
    if (step === 2) {
      if (selectedPayment === "upi") setTouched(p => ({ ...p, upiId: true }));
      if (selectedPayment === "card") setTouched(p => ({ ...p, cardName: true, cardNumber: true, cardExpiry: true, cardCvv: true }));
    }

    if (!validateStep()) {
      toast.error("Please fix the errors before continuing");
      return;
    }
    if (step < 2) setStep(step + 1);
    else placeOrder();
  };

  const placeOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
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
      toast.error("Failed to place order", { description: err.message });
    } finally {
      setPlacing(false);
    }
  };

  const FieldError = ({ field }: { field: string }) => {
    if (!errors[field] || !touched[field]) return null;
    return (
      <motion.p
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-1 mt-1.5 text-xs text-destructive font-medium"
      >
        <AlertCircle className="w-3 h-3" />
        {errors[field]}
      </motion.p>
    );
  };

  const inputClass = (field: string) =>
    `w-full px-4 py-3 rounded-xl border bg-background text-sm outline-none transition-all duration-200 focus:ring-2 focus:ring-primary/30 focus:border-primary ${
      errors[field] && touched[field]
        ? "border-destructive ring-1 ring-destructive/20"
        : "border-input hover:border-primary/40"
    }`;

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
                  <div className="grid gap-5">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Full Name *</label>
                      <input
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => updateForm("name", e.target.value)}
                        onBlur={() => markTouched("name")}
                        className={inputClass("name")}
                        maxLength={100}
                      />
                      <FieldError field="name" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Email *</label>
                      <input
                        placeholder="you@example.com"
                        type="email"
                        value={form.email}
                        onChange={(e) => updateForm("email", e.target.value)}
                        onBlur={() => markTouched("email")}
                        className={inputClass("email")}
                        maxLength={255}
                      />
                      <FieldError field="email" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Phone *</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">+91</span>
                        <input
                          placeholder="98765 43210"
                          type="tel"
                          value={form.phone}
                          onChange={(e) => updateForm("phone", formatPhone(e.target.value))}
                          onBlur={() => markTouched("phone")}
                          className={`${inputClass("phone")} pl-12`}
                          maxLength={10}
                        />
                      </div>
                      <FieldError field="phone" />
                    </div>
                  </div>
                </>
              )}

              {step === 1 && (
                <>
                  <h2 className="font-heading font-semibold text-lg">Shipping Address</h2>
                  <div className="grid gap-5">
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Full Address *</label>
                      <textarea
                        placeholder="House/Flat No., Street, Landmark..."
                        value={form.address}
                        onChange={(e) => updateForm("address", e.target.value)}
                        onBlur={() => markTouched("address")}
                        className={`${inputClass("address")} min-h-[80px] resize-none`}
                        maxLength={500}
                        rows={3}
                      />
                      <FieldError field="address" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">City *</label>
                        <input
                          placeholder="Mumbai"
                          value={form.city}
                          onChange={(e) => updateForm("city", e.target.value)}
                          onBlur={() => markTouched("city")}
                          className={inputClass("city")}
                          maxLength={100}
                        />
                        <FieldError field="city" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">PIN Code *</label>
                        <input
                          placeholder="400001"
                          value={form.pincode}
                          onChange={(e) => updateForm("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
                          onBlur={() => markTouched("pincode")}
                          className={inputClass("pincode")}
                          maxLength={6}
                          inputMode="numeric"
                        />
                        <FieldError field="pincode" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">State *</label>
                      <select
                        value={form.state}
                        onChange={(e) => updateForm("state", e.target.value)}
                        onBlur={() => markTouched("state")}
                        className={inputClass("state")}
                      >
                        <option value="">Select State</option>
                        {indianStates.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <FieldError field="state" />
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
                          onChange={() => { setSelectedPayment(m.id); setErrors({}); }}
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
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                      <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">UPI ID *</label>
                      <input
                        placeholder="yourname@upi"
                        value={form.upiId}
                        onChange={(e) => updateForm("upiId", e.target.value)}
                        onBlur={() => markTouched("upiId")}
                        className={inputClass("upiId")}
                      />
                      <FieldError field="upiId" />
                    </motion.div>
                  )}

                  {/* Card fields */}
                  {selectedPayment === "card" && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid gap-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Cardholder Name *</label>
                        <input
                          placeholder="Name on card"
                          value={form.cardName}
                          onChange={(e) => updateForm("cardName", e.target.value)}
                          onBlur={() => markTouched("cardName")}
                          className={inputClass("cardName")}
                          maxLength={100}
                        />
                        <FieldError field="cardName" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Card Number *</label>
                        <input
                          placeholder="1234 5678 9012 3456"
                          value={form.cardNumber}
                          onChange={(e) => updateForm("cardNumber", formatCardNumber(e.target.value))}
                          onBlur={() => markTouched("cardNumber")}
                          className={inputClass("cardNumber")}
                          maxLength={19}
                          inputMode="numeric"
                        />
                        <FieldError field="cardNumber" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Expiry *</label>
                          <input
                            placeholder="MM/YY"
                            value={form.cardExpiry}
                            onChange={(e) => updateForm("cardExpiry", formatExpiry(e.target.value))}
                            onBlur={() => markTouched("cardExpiry")}
                            className={inputClass("cardExpiry")}
                            maxLength={5}
                            inputMode="numeric"
                          />
                          <FieldError field="cardExpiry" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">CVV *</label>
                          <input
                            placeholder="•••"
                            type="password"
                            value={form.cardCvv}
                            onChange={(e) => updateForm("cardCvv", e.target.value.replace(/\D/g, "").slice(0, 4))}
                            onBlur={() => markTouched("cardCvv")}
                            className={inputClass("cardCvv")}
                            maxLength={4}
                            inputMode="numeric"
                          />
                          <FieldError field="cardCvv" />
                        </div>
                      </div>
                    </motion.div>
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
                  <p className="text-xs text-muted-foreground">Free shipping on orders above Rs.999</p>
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
