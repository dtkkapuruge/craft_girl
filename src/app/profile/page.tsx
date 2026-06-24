'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/userService';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { LogOut, Package, User, MapPin, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [fetchingOrders, setFetchingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({ displayName: '', phoneNumber: '', address: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/');
    else if (user) {
      getUserProfile(user.uid).then((data) => {
        if (data) setProfile({
          displayName: data.displayName || user.displayName || '',
          phoneNumber: data.phoneNumber || '',
          address: data.address || ''
        });
      });
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        setOrders(snapshot.docs.map(d => ({ id: d.id, ...d.data() })).filter((o: any) => o.userId === user.uid));
      } catch (error) {
        console.error("Error fetching orders", error);
      } finally {
        setFetchingOrders(false);
      }
    }
    if (user) fetchOrders();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateUserProfile(user.uid, profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

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
          <div className="w-24 h-24 bg-[#F9F6F0] rounded-full flex items-center justify-center border-4 border-white">
            <User className="w-10 h-10 text-[#442852]" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-[#2D2D2D]">{user.displayName || 'User'}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
          <button onClick={async () => { await signOut(); router.push('/'); }} className="flex items-center gap-2 px-6 py-3 bg-[#F9F6F0] text-[#442852] hover:bg-[#E5E0D8] rounded-xl font-medium transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* වම් පස තීරුව: Edit Profile & Address Book */}
          <div className="space-y-8 md:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E0D8]">
              <h2 className="text-xl font-bold text-[#2D2D2D] flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-[#CBB0DC]" /> Profile & Address
              </h2>
              <div className="space-y-3">
                <input className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#442852] outline-none" placeholder="Full Name" value={profile.displayName} onChange={(e) => setProfile({ ...profile, displayName: e.target.value })} />
                <input className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#442852] outline-none" placeholder="Phone Number" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} />
                <input className="w-full border border-gray-200 p-3 rounded-xl focus:border-[#442852] outline-none" placeholder="Address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                <button onClick={handleSaveProfile} disabled={saving} className="w-full flex items-center justify-center gap-2 bg-[#442852] text-white py-3 rounded-xl hover:bg-[#321c3d]">
                  <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>

          {/* දකුණු පස තීරුව: Recent Orders */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E5E0D8] md:col-span-2">
            <h2 className="text-xl font-bold text-[#2D2D2D] flex items-center gap-2 mb-6">
              <Package className="w-5 h-5 text-[#CBB0DC]" /> Recent Orders
            </h2>
            {fetchingOrders ? <div className="text-center">Loading...</div> : orders.length === 0 ? <p className="text-center text-gray-500">You haven't placed any orders yet.</p> : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border border-[#E5E0D8] rounded-xl p-4">
                    <p className="font-bold">Order ID: {order.id}</p>
                    <p className="text-sm text-gray-500">Total: Rs. {order.totalAmount?.toLocaleString()}.00</p>
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