'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { trackEvent } from '@/components/PixelTracker';
import { CheckCircle2, ShoppingBag, Truck, Calendar, Heart, Loader2 } from 'lucide-react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();

  const orderId = params?.orderId as string;
  const orderNumber = searchParams.get('num') || 'CGS-UNKNOWN';
  const amountStr = searchParams.get('amt') || '0';
  const totalAmount = parseFloat(amountStr);

  // Trigger Purchase tracking on mount
  useEffect(() => {
    if (orderId && totalAmount > 0) {
      trackEvent('Purchase', {
        content_name: `Order ${orderNumber}`,
        content_ids: [orderId],
        value: totalAmount,
        currency: 'LKR',
      });
    }
  }, [orderId, orderNumber, totalAmount]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      {/* Success Animation Header */}
      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-[#F9F6F0] p-4 border border-[#E5E0D8] animate-bounce">
          <CheckCircle2 className="h-16 w-16 text-[#442852]" />
        </div>
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-[#2D2D2D] sm:text-4xl">
        Order Confirmed!
      </h1>
      <p className="mt-3 text-lg text-gray-500 leading-relaxed">
        Thank you for shopping with us! Your Cash on Delivery order has been successfully placed.
      </p>

      {/* Order Summary Card */}
      <div className="mt-10 rounded-3xl border border-[#E5E0D8] bg-white p-6 sm:p-8 shadow-sm max-w-md mx-auto text-left space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#F9F6F0]">
          <span className="text-sm font-semibold text-gray-500">Order Number</span>
          <span className="text-sm font-bold text-[#442852] bg-[#F9F6F0] px-3 py-1 rounded-full border border-[#D1C9C0]">
            {orderNumber}
          </span>
        </div>

        <div className="flex justify-between items-center pb-3 border-b border-[#F9F6F0]">
          <span className="text-sm font-semibold text-gray-500">Total Bill (Pay on Delivery)</span>
          <span className="text-base font-extrabold text-[#2D2D2D]">
            Rs. {totalAmount.toLocaleString()}.00
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-500">Payment Status</span>
          <span className="text-sm font-bold text-[#442852]">Pending Cash on Delivery</span>
        </div>
      </div>

      {/* Delivery Timelines details */}
      <div className="mt-10 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm flex gap-3">
          <Truck className="h-5 w-5 text-[#B292C7] shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">Delivery Time</h4>
            <p className="text-xs text-gray-500 mt-1">2-3 business days within Western Province. 4-5 days islandwide.</p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm flex gap-3">
          <Calendar className="h-5 w-5 text-[#B292C7] shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">Order Update</h4>
            <p className="text-xs text-gray-500 mt-1">You will receive a phone call or SMS from our courier service once your package is dispatched.</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center justify-center rounded-2xl bg-[#442852] px-6 py-3.5 text-sm font-bold text-white hover:bg-[#321c3d] transition shadow-sm"
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          Continue Shopping
        </button>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#F9F6F0]">
      <Suspense fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-[#442852] animate-spin" />
        </div>
      }>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
