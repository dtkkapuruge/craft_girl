'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { trackEvent } from '@/components/PixelTracker';
import { ShoppingBag, CheckCircle, AlertCircle, Loader2, CreditCard, Banknote, Building } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  
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

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.displayName || prev.name,
      }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0 && status !== 'submitting') {
      router.push('/');
    }
  }, [cartItems, router, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setStatus('submitting');
    setErrorMessage('');

    try {
      const orderData = {
        userId: user?.uid || null,
        customer: {
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          email: user?.email || null,
        },
        items: cartItems.map(item => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          variant: item.variant || null,
        })),
        totalAmount: cartTotal,
        paymentMethod: paymentMethod,
        status: paymentMethod === 'COD' ? 'pending' : 'awaiting_payment',
        notes: formData.notes,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'orders'), orderData);
      
      // Track Purchase Event
      trackEvent('Purchase', {
        content_ids: cartItems.map(i => i.id),
        value: cartTotal,
        currency: 'LKR',
      });

      clearCart();
      router.push(`/checkout/success/${docRef.id}`);
      
    } catch (error: any) {
      console.error('Order submission failed:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to place order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#442852] animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-[#E5E0D8] overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-2xl font-bold text-[#2D2D2D] mb-6 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-[#442852]" />
              Secure Checkout
            </h1>

            {status === 'error' && (
              <div className="mb-6 bg-red-50 text-red-700 p-4 rounded-lg flex items-start gap-3 text-sm border border-red-200">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Shipping Details */}
              <div>
                <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#D1C9C0] rounded-lg focus:ring-2 focus:ring-[#CBB0DC] focus:border-[#442852] outline-none transition-shadow"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#D1C9C0] rounded-lg focus:ring-2 focus:ring-[#CBB0DC] focus:border-[#442852] outline-none transition-shadow"
                      placeholder="07X XXX XXXX"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      required
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#D1C9C0] rounded-lg focus:ring-2 focus:ring-[#CBB0DC] focus:border-[#442852] outline-none transition-shadow"
                      placeholder="123 Resin Art Street"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#D1C9C0] rounded-lg focus:ring-2 focus:ring-[#CBB0DC] focus:border-[#442852] outline-none transition-shadow"
                      placeholder="Colombo"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Order Notes (Optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      rows={3}
                      value={formData.notes}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-[#D1C9C0] rounded-lg focus:ring-2 focus:ring-[#CBB0DC] focus:border-[#442852] outline-none transition-shadow"
                      placeholder="Special instructions for delivery or custom requests..."
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-t border-[#E5E0D8] pt-6">
                <h2 className="text-lg font-semibold text-[#2D2D2D] mb-4">Payment Method</h2>
                
                <div className="space-y-4">
                  {/* COD */}
                  <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'border-[#442852] bg-[#F9F6F0]' : 'border-[#E5E0D8] hover:border-[#CBB0DC]'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        value="COD"
                        checked={paymentMethod === 'COD'}
                        onChange={() => setPaymentMethod('COD')}
                        className="h-4 w-4 text-[#442852] border-gray-300 focus:ring-[#442852]"
                      />
                      <Banknote className={`w-6 h-6 ml-4 ${paymentMethod === 'COD' ? 'text-[#442852]' : 'text-gray-400'}`} />
                      <span className="ml-3 block font-bold text-[#2D2D2D]">Cash on Delivery (COD)</span>
                    </div>
                    {paymentMethod === 'COD' && (
                      <p className="ml-11 mt-2 text-sm text-gray-500">
                        Pay securely with cash upon delivery. Perfect for first-time buyers!
                      </p>
                    )}
                  </label>

                  {/* CARD */}
                  <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'CARD' ? 'border-[#442852] bg-[#F9F6F0]' : 'border-[#E5E0D8] hover:border-[#CBB0DC]'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        value="CARD"
                        checked={paymentMethod === 'CARD'}
                        onChange={() => setPaymentMethod('CARD')}
                        className="h-4 w-4 text-[#442852] border-gray-300 focus:ring-[#442852]"
                      />
                      <CreditCard className={`w-6 h-6 ml-4 ${paymentMethod === 'CARD' ? 'text-[#442852]' : 'text-gray-400'}`} />
                      <span className="ml-3 block font-bold text-[#2D2D2D]">Credit / Debit Card</span>
                    </div>
                    {paymentMethod === 'CARD' && (
                      <div className="ml-11 mt-4 p-4 bg-white rounded-lg border border-[#E5E0D8]">
                        <p className="text-sm text-gray-500 mb-3">You will be redirected to our secure payment gateway (PayHere/Stripe) after placing your order.</p>
                        <div className="h-10 bg-gray-100 rounded animate-pulse w-full"></div>
                      </div>
                    )}
                  </label>

                  {/* BANK TRANSFER */}
                  <label className={`block p-4 rounded-xl border-2 cursor-pointer transition-colors ${paymentMethod === 'BANK' ? 'border-[#442852] bg-[#F9F6F0]' : 'border-[#E5E0D8] hover:border-[#CBB0DC]'}`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment_method"
                        value="BANK"
                        checked={paymentMethod === 'BANK'}
                        onChange={() => setPaymentMethod('BANK')}
                        className="h-4 w-4 text-[#442852] border-gray-300 focus:ring-[#442852]"
                      />
                      <Building className={`w-6 h-6 ml-4 ${paymentMethod === 'BANK' ? 'text-[#442852]' : 'text-gray-400'}`} />
                      <span className="ml-3 block font-bold text-[#2D2D2D]">Manual Bank Transfer</span>
                    </div>
                    {paymentMethod === 'BANK' && (
                      <div className="ml-11 mt-4 space-y-4">
                        <div className="p-4 bg-white rounded-lg border border-[#CBB0DC]">
                          <p className="text-sm font-semibold text-[#442852] mb-2">Our Bank Details:</p>
                          <p className="text-sm text-gray-600">Bank: Commercial Bank</p>
                          <p className="text-sm text-gray-600">Account Name: Craft Girly Store</p>
                          <p className="text-sm text-gray-600 mb-2">Account No: 1234 5678 9012</p>
                          <p className="text-xs text-gray-500 italic">Please transfer the total amount and upload your slip below.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Payment Slip</label>
                          <input type="file" accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#F9F6F0] file:text-[#442852] hover:file:bg-[#E5E0D8] transition-colors"/>
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
                className="w-full bg-[#442852] text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-[#CBB0DC] hover:text-[#442852] disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {status === 'submitting' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Place Order • Rs. {cartTotal.toLocaleString()}</>
                )}
              </button>
              
              <p className="text-xs text-center text-gray-500 mt-4">
                By placing your order, you agree to our Terms of Service and Privacy Policy.
              </p>
            </form>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl shadow-sm border border-[#E5E0D8] overflow-hidden sticky top-24">
            <div className="p-6 md:p-8 border-b border-[#E5E0D8] bg-[#F9F6F0]">
              <h2 className="text-lg font-bold text-[#2D2D2D] flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#442852]" />
                Order Summary
              </h2>
            </div>
            
            <div className="p-6 md:p-8">
              <ul className="divide-y divide-[#E5E0D8] mb-6">
                {cartItems.map((item) => (
                  <li key={`${item.id}-${item.variant || 'base'}`} className="py-4 flex gap-4">
                    <div className="w-16 h-16 rounded-md overflow-hidden bg-gray-100 flex-shrink-0 border border-[#E5E0D8]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-[#2D2D2D] text-sm leading-tight mb-1">{item.name}</h4>
                      {item.variant && <p className="text-xs text-gray-500 mb-1">Variant: {item.variant}</p>}
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Qty: {item.quantity}</span>
                        <span className="font-semibold text-[#442852]">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="space-y-3 text-sm border-t border-[#E5E0D8] pt-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>Rs. {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>Calculated later</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-[#2D2D2D] pt-4 border-t border-[#E5E0D8] mt-4">
                  <span>Total</span>
                  <span className="text-[#442852]">Rs. {cartTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
