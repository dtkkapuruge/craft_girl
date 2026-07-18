'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db, auth } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { trackEvent } from '@/components/PixelTracker';
import toast from 'react-hot-toast';
import { ShoppingBag, AlertCircle, Loader2, CreditCard, Banknote, Building } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, loading } = useAuth();

  // Ensure the user is authenticated before proceeding
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, loading, router]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'CARD' | 'BANK'>('COD');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Pre‑fill the name field when the AuthContext provides a display name
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
      }));
    }
  }, [user]);

  // Guard against empty carts – redirect back to the store
  useEffect(() => {
    if (cartItems.length === 0 && status !== 'submitting') {
      router.push('/');
    }
  }, [cartItems, router, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  /**
   * Submit the order.
   * Steps:
   * 1. Generate a reliable, unique order ID.
   * 2. Build a complete payload that mirrors the required Firestore schema.
   * 3. Write the document using `addDoc`. Only on success do we navigate to the Success page.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      // 1️⃣ Grab the *real* authenticated Firebase user
      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        setStatus('error');
        setErrorMessage('You must be signed in to place an order. Please log in again.');
        return;
      }

      // 2️⃣ Generate a robust, human‑readable order identifier
      const orderId = `CGS-${Math.floor(100000 + Math.random() * 900000)}`;

      // 3️⃣ Optional gifting information stored in localStorage
      let giftingDetails: any = null;
      try {
        const giftStr = localStorage.getItem('checkout_gifting');
        if (giftStr) giftingDetails = JSON.parse(giftStr);
      } catch (_) {
        // Silently ignore malformed gifting data – it is non‑critical
      }

      // 4️⃣ Assemble the Firestore payload exactly as required
      const orderPayload = {
        orderId,
        userId: firebaseUser.uid,
        customerDetails: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          email: firebaseUser.email || null,
        },
        items: cartItems.map(item => ({
          productId: item.id,
          title: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image,
          variant: item.variant || null,
        })),
        totalBill: cartTotal,
        paymentMethod,
        status: 'Pending',
        notes: formData.notes,
        gifting: giftingDetails,
        createdAt: serverTimestamp(),
      };

      // 5️⃣ Write the order to Firestore
      const docRef = await addDoc(collection(db, 'orders'), orderPayload);

      // 6️⃣ Track the purchase event for analytics
      trackEvent('Purchase', {
        content_ids: cartItems.map(i => i.id),
        value: cartTotal,
        currency: 'LKR',
      });

      // 7️⃣ Clean‑up local state & navigate to the success page **only** after a successful write
      localStorage.removeItem('checkout_gifting');
      toast.success('Order placed successfully!');
      clearCart();
      // Pass orderId and totalBill as query parameters so the success page can display them
      router.push(`/checkout/success?orderId=${orderId}&total=${cartTotal}`);
    } catch (err: any) {
      console.error('Order submission failed:', err);
      setStatus('error');
      if (err?.code === 'permission-denied') {
        setErrorMessage('Permission denied. Ensure you are logged in and have write access to Firestore.');
      } else {
        setErrorMessage(err.message || 'Failed to place order. Please try again.');
      }
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#0A0A0A] animate-spin mx-auto mb-4" />
          <p className="text-xs text-[#888] uppercase tracking-[0.15em]">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#0A0A0A] animate-spin mx-auto mb-4" />
          <p className="text-xs text-[#888] uppercase tracking-[0.15em]">Redirecting to store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] py-8 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#888] mb-2">Secure Checkout</p>
        <h1 className="text-2xl font-serif font-normal text-[#0A0A0A] tracking-wide">Complete Your Order</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column – Shipping Form */}
        <div className="lg:col-span-7 bg-white border border-[#E8E4DE] overflow-hidden">
          <div className="p-6 md:p-8">
            {status === 'error' && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 flex items-start gap-3 text-xs border border-red-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-[#0A0A0A] mb-6 pb-3 border-b border-[#E8E4DE]">
                  Shipping Details
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-[10px] font-medium text-[#888] uppercase tracking-[0.15em] mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#E8E4DE] focus:border-[#0A0A0A] outline-none transition-colors text-sm tracking-wide bg-transparent"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-[10px] font-medium text-[#888] uppercase tracking-[0.15em] mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#E8E4DE] focus:border-[#0A0A0A] outline-none transition-colors text-sm tracking-wide bg-transparent"
                      placeholder="07X XXX XXXX"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-[10px] font-medium text-[#888] uppercase tracking-[0.15em] mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#E8E4DE] focus:border-[#0A0A0A] outline-none transition-colors text-sm tracking-wide bg-transparent"
                      placeholder="123 Craft Street"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="city" className="block text-[10px] font-medium text-[#888] uppercase tracking-[0.15em] mb-2">
                      City / District
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#E8E4DE] focus:border-[#0A0A0A] outline-none transition-colors text-sm tracking-wide bg-transparent"
                      placeholder="Colombo"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block text-[10px] font-medium text-[#888] uppercase tracking-[0.15em] mb-2">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#E8E4DE] focus:border-[#0A0A0A] outline-none transition-colors text-sm tracking-wide bg-transparent resize-none"
                      placeholder="Special instructions for delivery or custom requests..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t border-[#E8E4DE] pt-6">
                <h2 className="text-xs font-medium uppercase tracking-[0.15em] text-[#0A0A0A] mb-6 pb-3 border-b border-[#E8E4DE]">
                  Payment Method
                </h2>
                <div className="space-y-3">
                  {/* COD */}
                  <label className={`block p-4 border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-[#0A0A0A] bg-[#FAFAF8]' : 'border-[#E8E4DE] hover:border-[#999]'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="h-4 w-4 text-[#0A0A0A] border-gray-300 focus:ring-[#0A0A0A]"
                      />
                      <Banknote className={`w-5 h-5 ml-4 ${paymentMethod === 'COD' ? 'text-[#0A0A0A]' : 'text-[#999]'}`} />
                      <span className="ml-3 block text-xs font-medium text-[#0A0A0A] uppercase tracking-[0.1em]">Cash on Delivery</span>
                    </div>
                    {paymentMethod === 'COD' && (
                      <p className="ml-11 mt-2 text-[11px] text-[#888] tracking-wide">
                        Pay with cash upon delivery. Perfect for first-time buyers.
                      </p>
                    )}
                  </label>

                  {/* CARD */}
                  <label className={`block p-4 border cursor-pointer transition-colors ${paymentMethod === 'CARD' ? 'border-[#0A0A0A] bg-[#FAFAF8]' : 'border-[#E8E4DE] hover:border-[#999]'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={() => setPaymentMethod('CARD')}
                        className="h-4 w-4 text-[#0A0A0A] border-gray-300 focus:ring-[#0A0A0A]"
                      />
                      <CreditCard className={`w-5 h-5 ml-4 ${paymentMethod === 'CARD' ? 'text-[#0A0A0A]' : 'text-[#999]'}`} />
                      <span className="ml-3 block text-xs font-medium text-[#0A0A0A] uppercase tracking-[0.1em]">Credit / Debit Card</span>
                    </div>
                    {paymentMethod === 'CARD' && (
                      <p className="ml-11 mt-2 text-[11px] text-[#888] tracking-wide">
                        You will be redirected to our secure payment gateway after placing your order.
                      </p>
                    )}
                  </label>

                  {/* BANK TRANSFER */}
                  <label className={`block p-4 border cursor-pointer transition-colors ${paymentMethod === 'BANK' ? 'border-[#0A0A0A] bg-[#FAFAF8]' : 'border-[#E8E4DE] hover:border-[#999]'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        value="BANK"
                        checked={paymentMethod === 'BANK'}
                        onChange={() => setPaymentMethod('BANK')}
                        className="h-4 w-4 text-[#0A0A0A] border-gray-300 focus:ring-[#0A0A0A]"
                      />
                      <Building className={`w-5 h-5 ml-4 ${paymentMethod === 'BANK' ? 'text-[#0A0A0A]' : 'text-[#999]'}`} />
                      <span className="ml-3 block text-xs font-medium text-[#0A0A0A] uppercase tracking-[0.1em]">Manual Bank Transfer</span>
                    </div>
                    {paymentMethod === 'BANK' && (
                      <div className="ml-11 mt-4 space-y-4">
                        <div className="p-4 bg-white border border-[#E8E4DE]">
                          <p className="text-[10px] font-medium text-[#0A0A0A] uppercase tracking-[0.15em] mb-3">Our Bank Details</p>
                          <p className="text-xs text-[#6B6B6B] tracking-wide">Bank: Commercial Bank</p>
                          <p className="text-xs text-[#6B6B6B] tracking-wide">Account Name: Craft Girly Store</p>
                          <p className="text-xs text-[#6B6B6B] tracking-wide mb-3">Account No: 1234 5678 9012</p>
                          <p className="text-[10px] text-[#888] italic tracking-wide">Please transfer the total amount and upload your slip below.</p>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-[#888] uppercase tracking-[0.15em] mb-2">Upload Payment Slip</label>
                          <input
                            type="file"
                            accept="image/*"
                            className="w-full text-xs text-[#6B6B6B] file:mr-4 file:py-2 file:px-4 file:border file:border-[#E8E4DE] file:text-xs file:font-medium file:bg-[#FAFAF8] file:text-[#0A0A0A] hover:file:bg-[#F0EDE8] file:uppercase file:tracking-wider transition-colors file:cursor-pointer"
                          />
                        </div>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="w-full bg-[#0A0A0A] text-white py-4 px-6 text-xs font-medium uppercase tracking-[0.15em] hover:bg-[#1a1a1a] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />Processing...
                  </>
                ) : (
                  <>
                    Place Order &bull; Rs. {cartTotal.toLocaleString()}
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#888] tracking-wide">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>

        {/* Right Column – Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-[#E8E4DE] overflow-hidden sticky top-24">
            <div className="p-5 border-b border-[#E8E4DE] bg-[#FAFAF8]">
              <h2 className="text-xs font-medium text-[#0A0A0A] uppercase tracking-[0.15em] flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Order Summary
              </h2>
            </div>

            <div className="p-5">
              <ul className="divide-y divide-[#E8E4DE] mb-4">
                {cartItems.map(item => (
                  <li key={`${item.id}-${item.variant || 'base'}`} className="py-3 flex gap-3">
                    <div className="w-14 h-14 overflow-hidden bg-[#F5F3EF] flex-shrink-0 border border-[#E8E4DE]">
                      <Image src={item.image} alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-[#0A0A0A] leading-tight line-clamp-2 tracking-wide">{item.name}</h4>
                      {item.variant && <p className="text-[10px] text-[#888] mt-0.5 tracking-wide">{item.variant}</p>}
                      <div className="flex justify-between items-center mt-1.5">
                        <span className="text-[10px] text-[#888] tracking-wide">Qty: {item.quantity}</span>
                        <span className="text-xs font-medium text-[#0A0A0A]">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-2 text-xs border-t border-[#E8E4DE] pt-4">
                <div className="flex justify-between text-[#6B6B6B] tracking-wide">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#6B6B6B] tracking-wide">
                  <span>Shipping</span>
                  <span>Calculated later</span>
                </div>
                <div className="flex justify-between items-center font-medium text-[#0A0A0A] pt-3 border-t border-[#E8E4DE]">
                  <span className="text-xs uppercase tracking-[0.1em]">Total</span>
                  <span className="text-base font-serif">Rs. {cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
