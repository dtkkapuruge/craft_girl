'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/userService';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { Package, User, MapPin, Edit2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
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

      // 2. Orders දත්ත ලබා ගැනීම
      const fetchOrders = async () => {
        try {
          // createdAt නොමැති ඇණවුම් ගැටලුව වළක්වා ගැනීමට orderBy තාවකාලිකව ඉවත් කර දත්ත පරීක්ෂා කිරීම
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid)
          );

          const querySnapshot = await getDocs(q);

          // Debugging සඳහා log එකක්
          console.log("Found orders count:", querySnapshot.size);

          const orderData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          // දත්ත වර්ග කිරීම (createdAt තිබේ නම් පමණක් අනුව)
          const sortedOrders = orderData.sort((a: any, b: any) => {
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
            return dateB.getTime() - dateA.getTime();
          });

          setOrders(sortedOrders);
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold flex items-center gap-2"><MapPin size={20} /> Address Book</h2>
              {!isEditing && <button onClick={() => setIsEditing(true)}><Edit2 size={16} className="text-[#442852]" /></button>}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div><label className="text-xs text-gray-500">Name</label>
                  <input className="w-full border p-2 rounded" value={tempProfile.displayName} onChange={(e) => setTempProfile({ ...tempProfile, displayName: e.target.value })} /></div>
                <div><label className="text-xs text-gray-500">Phone</label>
                  <input className="w-full border p-2 rounded" value={tempProfile.phoneNumber} onChange={(e) => setTempProfile({ ...tempProfile, phoneNumber: e.target.value })} /></div>
                <div><label className="text-xs text-gray-500">Address</label>
                  <input className="w-full border p-2 rounded" value={tempProfile.address} onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })} /></div>
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 bg-[#442852] text-white py-2 rounded">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-sm">
                <div><p className="text-gray-400">Name</p><p>{profile.displayName || '-'}</p></div>
                <div><p className="text-gray-400">Phone</p><p>{profile.phoneNumber || '-'}</p></div>
                <div><p className="text-gray-400">Address</p><p>{profile.address || '-'}</p></div>
              </div>
            )}
          </div>

          {/* Recent Orders */}
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
                      <p className="text-sm text-gray-500">
                        {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Date N/A'}
                      </p>
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