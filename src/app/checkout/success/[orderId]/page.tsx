'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { trackEvent } from '@/components/PixelTracker';
import {
  CheckCircle2,
  ShoppingBag,
  Truck,
  Calendar,
  Heart,
  Loader2,
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function OrderSuccessContent() {
  const params = useParams();
  const router = useRouter();

  let orderId = params?.orderId as string;
if (!orderId && typeof window !== 'undefined') {
  const parts = window.location.pathname.split('/');
  orderId = parts[parts.length - 1];
}

  const [orderNumber, setOrderNumber] = useState('CGS-UNKNOWN');
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

  // Fetch order data from Firestore
  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, 'orders', orderId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const data = snap.data();
          setOrderNumber(data?.orderNumber ?? data?.orderId ?? 'CGS-UNKNOWN');
          setTotalAmount(data?.totalBill ?? data?.total ?? 0);
        } else {
          setError('Order not found.');
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
        setError(error instanceof Error ? error.message : String(error));
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Trigger Purchase tracking when data is loaded
  useEffect(() => {
    if (!loading && orderId && totalAmount > 0) {
      trackEvent('Purchase', {
        content_name: `Order ${orderNumber}`,
        content_ids: [orderId],
        value: totalAmount,
        currency: 'LKR',
      });
    }
  }, [loading, orderId, orderNumber, totalAmount]);

  if (loading) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      <Loader2 className="w-12 h-12 text-[#442852] animate-spin" />
    </div>
  );
}

if (error) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
      <p className="text-red-600 font-semibold">{error}</p>
    </div>
  );
}

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
        Thank you for shopping with us! Your Cash on Delivery order has been
        successfully placed.
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
          <span className="text-sm font-semibold text-gray-500">
            Total Bill (Pay on Delivery)
          </span>
          <span className="text-base font-extrabold text-[#2D2D2D]">
            Rs. {totalAmount.toLocaleString()}.00
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-500">
            Payment Status
          </span>
          <span className="text-sm font-bold text-[#442852]">
            Pending Cash on Delivery
          </span>
        </div>
      </div>

      {/* Delivery Timelines details */}
      <div className="mt-10 max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm flex gap-3">
          <Truck className="h-5 w-5 text-[#B292C7] shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
              Delivery Time
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              2-3 business days within Western Province. 4-5 days islandwide.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[#E5E0D8] bg-white p-4 shadow-sm flex gap-3">
          <Calendar className="h-5 w-5 text-[#B292C7] shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-[#2D2D2D] uppercase tracking-wider">
              Order Update
            </h4>
            <p className="text-xs text-gray-500 mt-1">
              You will receive a phone call or SMS from our courier service once
              your package is dispatched.
            </p>
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
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-[#442852] animate-spin" />
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
