'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import {
  fetchAdminUsers,
  createAdminUser,
  updateAdminUser,
  removeAdminUser,
  type AdminUser,
} from '@/lib/userService';
import {
  getRoleDisplayName,
  getRoleColor,
  type UserRole,
} from '@/lib/rbac';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Users,
  X,
  Shield,
  Phone,
  Mail,
  User,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react';

const ASSIGNABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: 'staff', label: 'Staff Member' },
  { value: 'admin', label: 'Administrator' },
  { value: 'super-admin', label: 'Super Administrator' }
];

function UserModal({
  open,
  onClose,
  onSave,
  initialUser,
  title,
  saving,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    email: string;
    role: UserRole;
    displayName: string;
    phoneNumber: string;
    status: 'active' | 'inactive';
    tempPassword?: string;
  }) => Promise<void>;
  initialUser: AdminUser | null;
  title: string;
  saving: boolean;
}) {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialUser) {
        setDisplayName(initialUser.displayName || '');
        setEmail(initialUser.email || '');
        setPhoneNumber(initialUser.phoneNumber || '');
        setTempPassword('');
        setRole(initialUser.role || 'staff');
        setStatus(initialUser.status || 'active');
      } else {
        setDisplayName('');
        setEmail('');
        setPhoneNumber('');
        setTempPassword('');
        setRole('staff');
        setStatus('active');
      }
      setShowPassword(false);
    }
  }, [open, initialUser]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      email,
      role,
      displayName,
      phoneNumber,
      status,
      tempPassword: tempPassword || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-zinc-955/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-3xl border border-gray-150 bg-white shadow-2xl overflow-hidden transition-all duration-300">
        <div className="flex items-center justify-between border-b border-gray-100 bg-[#FDFBF7] px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-750 flex items-center justify-center border border-purple-100">
              <Users className="w-4.5 h-4.5" />
            </div>
            <h2 className="text-md font-bold text-gray-900">{title}</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Full Name</label>
            <div className="relative">
              <input
                required
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. Dinushi Perera"
                className="w-full rounded-xl border border-gray-250 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-800"
              />
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <input
                required
                type="email"
                disabled={!!initialUser}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@craft.com"
                className="w-full rounded-xl border border-gray-250 bg-white pl-10 pr-4 py-2.5 text-sm disabled:bg-gray-50 disabled:text-gray-400 focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-800"
              />
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Phone Number</label>
            <div className="relative">
              <input
                required
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+94 77 123 4567"
                className="w-full rounded-xl border border-gray-250 bg-white pl-10 pr-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-800"
              />
              <Phone className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Temporary Password */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
              {initialUser ? 'New Password (Optional)' : 'Temporary Password'}
            </label>
            <div className="relative">
              <input
                required={!initialUser}
                type={showPassword ? 'text' : 'password'}
                value={tempPassword}
                onChange={(e) => setTempPassword(e.target.value)}
                placeholder={initialUser ? '••••••••' : 'temp_admin123'}
                className="w-full rounded-xl border border-gray-250 bg-white px-4 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
              </button>
            </div>
          </div>

          {/* Role Dropdown */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="w-full rounded-xl border border-gray-250 bg-white px-3.5 py-2.5 text-sm focus:border-purple-650 focus:outline-none focus:ring-1 focus:ring-purple-650 transition-all font-medium text-gray-800"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Account Status Switch */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
            <div>
              <p className="text-xs font-bold text-gray-700">Account Status</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Toggle between Active / Inactive workspace access</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus(status === 'active' ? 'inactive' : 'active')}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                status === 'active' ? 'bg-emerald-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  status === 'active' ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-xl bg-[#442852] py-3 text-sm font-bold text-white hover:bg-[#321c3d] shadow transition-all disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AdminUsersContent() {
  const { user: currentUser, role: userRole } = useAuth();
  const isSuperAdminUser = userRole === 'super-admin';

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setUsers(await fetchAdminUsers());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSave = async (data: {
    email: string;
    role: UserRole;
    displayName: string;
    phoneNumber: string;
    status: 'active' | 'inactive';
    tempPassword?: string;
  }) => {
    if (!isSuperAdminUser) return;
    setSaving(true);
    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, data);
      } else {
        await createAdminUser(data.email, data.role, data.displayName, data.phoneNumber, data.status, data.tempPassword);
      }
      setModalOpen(false);
      setEditingUser(null);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to save administrative user.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (adminUser: AdminUser) => {
    if (!isSuperAdminUser) return;
    if (adminUser.id === currentUser?.uid) {
      alert('You cannot remove your own admin access.');
      return;
    }
    if (!confirm(`Remove administrative access for ${adminUser.displayName || adminUser.email}? They will be demoted to Customer and status set to Inactive.`)) return;
    try {
      await removeAdminUser(adminUser.id);
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert('Failed to remove admin access.');
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
            User Management
          </h1>
          <p className="mt-1.5 text-xs font-medium text-gray-500">
            Control administrative and staff credentials, view phone contact details, and assign permission scopes.
          </p>
        </div>

        {/* Action Button - Super Admin only */}
        {isSuperAdminUser && (
          <button
            onClick={() => { setEditingUser(null); setModalOpen(true); }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#442852] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#321c3d] transition-all"
          >
            <Plus className="h-4 w-4" />
            Add New User
          </button>
        )}
      </div>

      {/* Access Restriction Notice */}
      {!isSuperAdminUser ? (
        <div className="inline-flex w-full items-center gap-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3.5 text-xs font-medium shadow-sm">
          <Shield className="h-4 w-4 text-amber-500 shrink-0" />
          <span><strong>Read-Only Mode:</strong> Only Super Administrators can add, edit, or remove administrative staff.</span>
        </div>
      ) : (
        <div className="inline-flex w-full items-center gap-2.5 rounded-2xl bg-purple-50 border border-purple-100 text-[#442852] px-4 py-3.5 text-xs font-medium shadow-sm">
          <Shield className="h-4 w-4 text-[#442852] shrink-0" />
          <span><strong>Super-Admin Privileges Active:</strong> You can create and manage credentials. Role changes take effect immediately on next session refresh.</span>
        </div>
      )}

      {/* Main Table Grid */}
      <div className="overflow-hidden rounded-3xl border border-gray-150 bg-white shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
            <p className="mt-3 text-xs font-semibold">Fetching user directory...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400">
            <Users className="h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-bold text-gray-500">No staff members found</p>
            <p className="text-xs text-gray-400 mt-1">Add a new administrative profile to give portal access.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 bg-[#FDFBF7] text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Phone Number</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Account Status</th>
                  {isSuperAdminUser && <th className="px-6 py-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-650 font-medium">
                {users.map((adminUser) => {
                  const isActive = adminUser.status !== 'inactive';
                  const isCurrent = adminUser.id === currentUser?.uid;
                  return (
                    <tr key={adminUser.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-gray-900">
                            {adminUser.displayName || '—'}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] bg-purple-50 text-purple-750 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">You</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{adminUser.email}</td>
                      <td className="px-6 py-4 text-gray-500 text-xs font-semibold">{adminUser.phoneNumber || '—'}</td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: getRoleColor(adminUser.role) }}
                        >
                          {getRoleDisplayName(adminUser.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          isActive 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-500" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-500" /> Inactive
                            </>
                          )}
                        </span>
                      </td>
                      {isSuperAdminUser && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => { setEditingUser(adminUser); setModalOpen(true); }}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                              title="Edit user profile"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(adminUser)}
                              disabled={isCurrent}
                              className="rounded-lg p-1.5 text-gray-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                              title="Demote access"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingUser(null); }}
        onSave={handleSave}
        initialUser={editingUser}
        title={editingUser ? 'Edit Staff Credentials' : 'Create Staff Credentials'}
        saving={saving}
      />
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AdminGuard minRole={['staff', 'admin', 'super-admin']} requiredPermission="canViewDashboard">
      <AdminUsersContent />
    </AdminGuard>
  );
}
