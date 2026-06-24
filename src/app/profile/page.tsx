'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/userService';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore'; // where එක අලුතින් එකතු කළා
import { Package, User, MapPin, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]); // මෙතනට දත්ත ඇවිත් තියෙන්න ඕනේ
  const [isEditing, setIsEditing] = useState(false);

  const [profile, setProfile] = useState({ displayName: '', phoneNumber: '', address: '' });
  const [tempProfile, setTempProfile] = useState(profile);

  useEffect(() => {
    if (!loading && !user) router.push('/');
    else if (user) {
      // 1. Profile දත්ත ලබා ගැනීම
      getUserProfile(user.uid).then((data) => {
        if (data) {
          const fetched = {
            displayName: data.displayName || user.displayName || '',
            phoneNumber: data.phoneNumber || '',
            address: data.address || ''
          };
          setProfile(fetched);
          setTempProfile(fetched);
        }
      });

      // 2. Orders දත්ත ලබා ගැනීම (අලුතින් එකතු කළ කොටස)
      const fetchOrders = async () => {
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid), // ඔබේ දත්ත සමුදායේ field name එක 'userId' නම් මෙය පාවිච්චි කරන්න
            orderBy('createdAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const orderData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setOrders(orderData);
        } catch (error) {
          console.error("Error fetching orders: ", error);
        }
      };
      fetchOrders();
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    if (!user) return;
    try {
      await updateUserProfile(user.uid, tempProfile);
      setProfile(tempProfile);
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  if (loading || !user) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F9F6F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E0D8] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#F9F6F0] rounded-full flex items-center justify-center">
              <User className="text-[#442852]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{profile.displayName || 'User'}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <button onClick={signOut} className="text-[#442852] font-medium hover:underline">Sign Out</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Address Book */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E0D8] md:col-span-1 h-fit">
            {/* ... ඔබේ පරණ address code එක මෙතන තියෙන්න දෙන්න ... */}
          </div>

          {/* Recent Orders - සංස්කරණය කරන ලදී */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E0D8] md:col-span-2">
            <h2 className="font-bold flex items-center gap-2 mb-6"><Package size={20} /> Recent Orders</h2>

            {orders.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-500">
                <Package className="w-16 h-16 text-[#CBB0DC] mx-auto mb-4 opacity-50" />
                <p>You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="border-b pb-4 flex justify-between">
                    <div>
                      <p className="font-semibold">Order ID: {order.id.slice(0, 8)}...</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt?.toDate()).toLocaleDateString()}</p>
                    </div>
                    <p className="font-bold">Rs. {order.totalAmount}</p>
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