'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { LogOut, Package, User, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
<<<<<<< HEAD
import toast from 'react-hot-toast';
=======
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.email) return;
      try {
        // Find orders where customer.email matches (we might need to add email to checkout form in a future step, or match by phone/UID)
        // For now, let's fetch all orders and filter by a field if we had one. Since checkout didn't capture email, this will be empty unless we update checkout.
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userOrders: any[] = [];
        querySnapshot.forEach((doc) => {
          // Mock filter: Since we didn't add email to the guest checkout before, we'll just show empty or mock for now
          // We will update checkout in Phase 5 to link to user UID
          if (doc.data().userId === user.uid) {
            userOrders.push({ id: doc.id, ...doc.data() });
          }
        });
        setOrders(userOrders);
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setFetchingOrders(false);
      }
    }

    if (user) {
      fetchOrders();
    }
  }, [user]);

  if (loading || !user) return (
    <div className="min-h-[60vh] flex items-center justify-center bg-[#F9F6F0]">
      <div className="w-10 h-10 border-4 border-[#CBB0DC] border-t-[#442852] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9F6F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E0D8] flex flex-col md:flex-row items-center gap-6">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || 'User'} className="w-24 h-24 rounded-full border-4 border-[#F9F6F0]" />
          ) : (
            <div className="w-24 h-24 bg-[#F9F6F0] rounded-full flex items-center justify-center border-4 border-white">
              <User className="w-10 h-10 text-[#442852]" />
            </div>
          )}
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#2D2D2D]">{user.displayName || 'Craft Girly Member'}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>

          <button
<<<<<<< HEAD
            onClick={async () => { await signOut(); toast.success('Signed out successfully.'); router.push('/'); }}
=======
            onClick={() => signOut()}
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
            className="flex items-center gap-2 px-6 py-3 bg-[#F9F6F0] text-[#442852] hover:bg-[#E5E0D8] rounded-xl font-medium transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Address Book Placeholder */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E0D8] md:col-span-1 h-fit">
            <h2 className="text-xl font-bold text-[#2D2D2D] flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-[#CBB0DC]" />
              Address Book
            </h2>
            <div className="p-4 bg-[#F9F6F0] rounded-xl border border-[#E5E0D8] text-sm text-gray-600 text-center">
              No saved addresses yet. They will be saved during your next checkout.
            </div>
          </div>

          {/* Order History */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E0D8] md:col-span-2">
            <h2 className="text-xl font-bold text-[#2D2D2D] flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-[#CBB0DC]" />
              Recent Orders
            </h2>

            {fetchingOrders ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-4 border-[#CBB0DC] border-t-[#442852] rounded-full animate-spin"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-12 px-4">
                <Package className="w-16 h-16 text-[#CBB0DC] mx-auto mb-4 opacity-50" />
                <p className="text-gray-500">You haven't placed any orders yet.</p>
                <button 
                  onClick={() => router.push('/')}
                  className="mt-4 px-6 py-2 bg-[#442852] text-white rounded-full font-medium hover:bg-[#321c3d] transition-colors"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-[#E5E0D8] rounded-xl p-4 hover:border-[#CBB0DC] transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-4 border-b border-[#F9F6F0]">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-bold text-[#442852]">{order.id}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="font-bold text-[#2D2D2D]">Rs. {order.totalAmount?.toLocaleString() || 0}.00</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#F9F6F0] text-[#442852] border border-[#CBB0DC]">
                        {order.status || 'Pending'}
                      </span>
                      <span className="text-sm text-gray-500">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString() : 'Recent'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
