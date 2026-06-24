'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/userService';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { LogOut, Package, User, MapPin, Save, Edit2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState({ displayName: '', phoneNumber: '', address: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState(profile);

  useEffect(() => {
    if (!loading && !user) router.push('/');
    else if (user) {
      getUserProfile(user.uid).then((data) => {
        if (data) {
          const loadedData = { displayName: data.displayName || user.displayName || '', phoneNumber: data.phoneNumber || '', address: data.address || '' };
          setProfile(loadedData);
          setTempProfile(loadedData);
        }
      });
    }
  }, [user, loading, router]);

  const handleSave = async () => {
    await updateUserProfile(user!.uid, tempProfile);
    setProfile(tempProfile);
    setIsEditing(false);
    toast.success('Profile updated!');
  };

  return (
    <div className="min-h-screen bg-[#F9F6F0] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header (පෙර පරිදිම) */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-[#E5E0D8]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-bold flex items-center gap-2"><MapPin size={20} /> Profile & Address</h2>
              {!isEditing && <button onClick={() => setIsEditing(true)}><Edit2 size={16} className="text-[#442852]" /></button>}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                {['displayName', 'phoneNumber', 'address'].map((field) => (
                  <div key={field}>
                    <label className="text-xs text-gray-400 capitalize">{field}</label>
                    <input className="w-full border p-2 rounded" value={(tempProfile as any)[field]} onChange={(e) => setTempProfile({ ...tempProfile, [field]: e.target.value })} />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 bg-[#442852] text-white py-2 rounded">Save</button>
                  <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {[{ l: 'Name', v: profile.displayName }, { l: 'Phone', v: profile.phoneNumber }, { l: 'Address', v: profile.address }].map((item) => (
                  <div key={item.l}>
                    <p className="text-xs text-gray-400">{item.l}</p>
                    <p className="font-medium text-[#2D2D2D]">{item.v || 'Not set'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#E5E0D8]">
            <h2 className="font-bold flex items-center gap-2 mb-6"><Package size={20} /> Recent Orders</h2>
            {/* Orders list logic */}
          </div>
        </div>
      </div>
    </div>
  );
}