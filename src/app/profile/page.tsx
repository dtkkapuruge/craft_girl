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

  // Profile දත්ත සඳහා state
  const [profile, setProfile] = useState({
    displayName: '',
    phoneNumber: '',
    address: ''
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    } else if (user) {
      // දත්ත ලබා ගැනීම
      getUserProfile(user.uid).then((data) => {
        if (data) {
          setProfile({
            displayName: data.displayName || user.displayName || '',
            phoneNumber: data.phoneNumber || '',
            address: data.address || ''
          });
        }
      });
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchOrders() {
      if (!user?.uid) return;
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const userOrders = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((o: any) => o.userId === user.uid);
        setOrders(userOrders);
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

        {/* Profile Header & Edit Section */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#E5E0D8] space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-[#F9F6F0] rounded-full flex items-center justify-center border-4 border-white">
              <User className="w-10 h-10 text-[#442852]" />
            </div>
            <div className="flex-1 w-full space-y-4">
              <input
                className="text-2xl font-bold text-[#2D2D2D] w-full border-b border-gray-200 focus:outline-none focus:border-[#442852]"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                placeholder="Your Name"
              />
              <p className="text-gray-500">{user.email}</p>
            </div>
            <button onClick={async () => { await signOut(); router.push('/'); }} className="flex items-center gap-2 px-6 py-3 bg-[#F9F6F0] text-[#442852] rounded-xl font-medium hover:bg-[#E5E0D8] transition-colors">
              <LogOut className="w-5 h-5" /> Sign Out
            </button>
          </div>

          {/* Edit Form */}
          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-[#F9F6F0]">
            <input className="border p-3 rounded-xl" placeholder="Phone Number" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} />
            <input className="border p-3 rounded-xl" placeholder="Address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            <button onClick={handleSaveProfile} disabled={saving} className="md:col-span-2 flex items-center justify-center gap-2 bg-[#442852] text-white py-3 rounded-xl hover:bg-[#321c3d]">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </div>

        {/* Orders section (Remaining code stays same) */}
        {/* ... (orders section code) ... */}
      </div>
    </div>
  );
}