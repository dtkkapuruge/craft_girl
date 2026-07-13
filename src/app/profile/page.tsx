'use client';

import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { getUserProfile, updateUserProfile } from '@/lib/userService';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { Package, User, MapPin, Edit2, LogOut, Phone, ShieldCheck, Mail, Calendar, CreditCard } from 'lucide-react';
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
      // 1. Fetch profile data
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

      // 2. Fetch orders
      const fetchOrders = async () => {
        try {
          const q = query(
            collection(db, 'orders'),
            where('userId', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const orderData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

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
      toast.success('Profile updated successfully! 🎉');
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
      case 'Dispatched':
        return 'bg-purple-50 text-purple-700 border border-purple-200';
      case 'Processing':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      default:
        return 'bg-rose-50 text-rose-700 border border-rose-200';
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] bg-[#F9F6F0]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#442852] mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const userInitials = (profile.displayName || user.displayName || user.email || 'CG')
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-[#FDFBF7] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-[#E5E0D8] flex flex-col sm:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#442852] to-[#6d4082] rounded-3xl flex items-center justify-center text-white text-2xl font-extrabold shadow-md border border-[#E5E0D8]">
              {userInitials}
            </div>
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">{profile.displayName || 'Handmade Lover'}</h1>
                <span className="inline-flex self-center items-center gap-1 bg-[#F9F6F0] text-[#442852] border border-[#E5E0D8] px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-3 h-3" /> Customer
                </span>
              </div>
              <p className="text-sm text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-1">
                <Mail className="w-4 h-4 text-gray-400" /> {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={async () => {
              await signOut();
              toast.success('Signed out successfully! 👋');
              router.push('/home');
            }}
            className="inline-flex items-center gap-2 rounded-2xl border border-rose-250 bg-rose-50/50 hover:bg-rose-50 px-5 py-3 text-xs font-bold text-rose-600 transition-all hover:scale-[1.01] active:scale-[0.99] border-rose-200"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Address Book Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E5E0D8] lg:col-span-1 h-fit space-y-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-800 flex items-center gap-2 text-md">
                <MapPin className="text-[#442852] w-5 h-5" /> Delivery Address
              </h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 hover:bg-[#F9F6F0] text-[#442852] rounded-xl border border-transparent hover:border-[#E5E0D8] transition-all"
                  title="Edit profile details"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Full Name</label>
                  <input
                    className="w-full rounded-xl border border-[#D1C9C0] bg-white px-4 py-2.5 text-sm focus:border-[#442852] focus:ring-1 focus:ring-[#442852] outline-none font-semibold text-gray-800 transition-all"
                    value={tempProfile.displayName}
                    onChange={(e) => setTempProfile({ ...tempProfile, displayName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <input
                    className="w-full rounded-xl border border-[#D1C9C0] bg-white px-4 py-2.5 text-sm focus:border-[#442852] focus:ring-1 focus:ring-[#442852] outline-none font-semibold text-gray-800 transition-all"
                    value={tempProfile.phoneNumber}
                    onChange={(e) => setTempProfile({ ...tempProfile, phoneNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Delivery Address</label>
                  <textarea
                    rows={3}
                    className="w-full rounded-xl border border-[#D1C9C0] bg-white px-4 py-2.5 text-sm focus:border-[#442852] focus:ring-1 focus:ring-[#442852] outline-none font-semibold text-gray-800 transition-all resize-none"
                    value={tempProfile.address}
                    onChange={(e) => setTempProfile({ ...tempProfile, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={handleSave} className="flex-1 bg-[#442852] hover:bg-[#321c3d] text-white py-3 rounded-xl font-bold text-xs shadow-sm transition-all">Save</button>
                  <button onClick={() => { setTempProfile(profile); setIsEditing(false); }} className="px-4 py-3 border border-[#D1C9C0] hover:bg-gray-50 rounded-xl font-bold text-xs text-gray-600 transition-all">Cancel</button>
                </div>
              </div>
            ) : (
              <div className="space-y-5 text-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name</p>
                  <p className="font-semibold text-gray-800">{profile.displayName || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> Phone</p>
                  <p className="font-semibold text-gray-800">{profile.phoneNumber || '-'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Address</p>
                  <p className="font-semibold text-gray-800 leading-relaxed">{profile.address || '-'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Orders Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-[#E5E0D8] lg:col-span-2 hover:shadow-md transition-shadow">
            <h2 className="font-extrabold text-gray-800 flex items-center gap-2 text-md pb-4 border-b border-gray-100 mb-6">
              <Package className="text-[#442852] w-5 h-5" /> Recent Orders
            </h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-16 px-4 text-gray-400 space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#F9F6F0] border border-[#E5E0D8] flex items-center justify-center mx-auto opacity-70">
                  <Package className="w-7 h-7 text-[#CBB0DC]" />
                </div>
                <p className="text-sm font-semibold">You haven&apos;t placed any orders yet.</p>
                <p className="text-xs text-gray-400">All your craft orders will appear here once placed.</p>
              </div>
            ) : (
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                {orders.map((order: any) => (
                  <div key={order.id} className="border border-[#E5E0D8] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-purple-250 transition-all hover:shadow-sm">
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-[#442852] bg-[#F9F6F0] border border-[#E5E0D8] px-2.5 py-1 rounded-full uppercase tracking-wider">
                          #{order.orderNumber || order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${getStatusStyles(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 font-semibold">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-gray-300" /> {order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString('en-LK') : 'Date N/A'}</span>
                        <span className="flex items-center gap-1"><CreditCard className="w-3.5 h-3.5 text-gray-300" /> {order.paymentMethod || 'COD'}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Amount</p>
                      <p className="text-lg font-extrabold text-[#2D2D2D]">Rs. {Number(order.totalAmount || 0).toLocaleString()}</p>
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

const Loader2 = ({ className, ...props }: any) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    {...props}
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);