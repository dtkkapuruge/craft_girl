'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminGuard from '@/components/AdminGuard';
import { useAuth } from '@/context/AuthContext';
import {
  fetchRolePermissions,
  fetchCustomRolePermissions,
  saveRolePermissions,
  createNewRole,
  fetchAllCustomRoles,
  getPermissions,
  getRoleDisplayName,
  DEFAULT_PERMISSIONS,
  type UserRole,
  type RolePermission,
  type CustomRole,
} from '@/lib/rbac';
import toast from 'react-hot-toast';
import {
  Shield,
  Save,
  RotateCcw,
  Loader2,
  Sparkles,
  Info,
  Plus,
  X,
  AlertTriangle,
  Lock,
  Eye,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────

interface PermissionDefinition {
  key: keyof RolePermission;
  label: string;
  description: string;
}

interface PermissionGroup {
  name: string;
  description: string;
  colorClasses: string;
  permissions: PermissionDefinition[];
}

/** Unified entry for the sidebar — either a built-in role or a custom one. */
type SidebarEntry =
  | { kind: 'builtin'; key: UserRole; displayName: string }
  | { kind: 'custom'; key: string; displayName: string };

// ─── Static data ─────────────────────────────────────────────────────────────

const PERMISSION_GROUPS: PermissionGroup[] = [
  {
    name: 'Dashboard & Insights',
    description: 'Control access to visual analytics and financial reporting panels.',
    colorClasses: 'from-emerald-50/50 to-teal-50/20 border-emerald-100 text-emerald-800',
    permissions: [
      {
        key: 'canViewDashboard',
        label: 'View Dashboard',
        description: 'Access basic dashboard metrics and summaries.',
      },
      {
        key: 'canViewRevenue',
        label: 'View Revenue',
        description: 'See sensitive income reports, sale balances, and charts.',
      },
      {
        key: 'canViewAnalytics',
        label: 'View Analytics',
        description: 'Review user visits, conversion rates, and logging metrics.',
      },
    ],
  },
  {
    name: 'Content & Products',
    description: 'Define permissions for catalog modifications and craft item creations.',
    colorClasses: 'from-purple-50/50 to-pink-50/20 border-purple-100 text-purple-800',
    permissions: [
      {
        key: 'canViewProducts',
        label: 'View Products List',
        description: 'Search and inspect products and inventory listings.',
      },
      {
        key: 'canManageProducts',
        label: 'Manage Products',
        description: 'Create, modify, upload pictures for, and delete catalog listings.',
      },
    ],
  },
  {
    name: 'Orders & Sales Flow',
    description: 'Set employee privileges for processing checkout transactions and statuses.',
    colorClasses: 'from-blue-50/50 to-indigo-50/20 border-blue-100 text-blue-800',
    permissions: [
      {
        key: 'canViewOrders',
        label: 'View Orders',
        description: 'Access client purchases, address coordinates, and tracking indices.',
      },
      {
        key: 'canManageOrders',
        label: 'Edit Order Details',
        description: 'Amend order items, manual adjustments, or buyer info.',
      },
      {
        key: 'canUpdateOrderStatus',
        label: 'Process Order Status',
        description: 'Mark orders as completed, ready, or update transit indicators.',
      },
    ],
  },
  {
    name: 'Admin & System Control',
    description: 'Protect platform-critical adjustments and user directories.',
    colorClasses: 'from-rose-50/50 to-orange-50/20 border-rose-100 text-rose-800',
    permissions: [
      {
        key: 'canManageUsers',
        label: 'Manage Customer Lists',
        description: 'Supervise registered store shopper profiles.',
      },
      {
        key: 'canManageStaff',
        label: 'Manage Staff Members',
        description: 'Add, update credentials of, or remove store assistants.',
      },
      {
        key: 'canManagePermissions',
        label: 'Edit Role Permissions',
        description: 'Recalibrate access boundaries for administrative roles.',
      },
    ],
  },
];

const BUILTIN_ROLES: SidebarEntry[] = [
  { kind: 'builtin', key: 'staff', displayName: 'Staff Member' },
  { kind: 'builtin', key: 'admin', displayName: 'Administrator' },
  { kind: 'builtin', key: 'super-admin', displayName: 'Super Administrator' },
];

// ─── Create Role Modal ────────────────────────────────────────────────────────

function CreateRoleModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (key: string, name: string) => Promise<void>;
}) {
  const [roleName, setRoleName] = useState('');
  const [roleKey, setRoleKey] = useState('');
  const [keyManual, setKeyManual] = useState(false);
  const [creating, setCreating] = useState(false);

  // Auto-derive key from name unless the user has manually changed it
  const handleNameChange = (value: string) => {
    setRoleName(value);
    if (!keyManual) {
      setRoleKey(value.trim().toLowerCase().replace(/\s+/g, '-'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim() || !roleKey.trim()) return;
    const builtIn = ['customer', 'staff', 'admin', 'super-admin'];
    if (builtIn.includes(roleKey.trim().toLowerCase())) {
      toast.error('That role key conflicts with a built-in role. Choose a different key.');
      return;
    }
    setCreating(true);
    try {
      await onCreate(roleKey, roleName.trim());
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-3xl border border-purple-100/50 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-[#FDFBF7] to-purple-50/30 px-6 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#442852]/10 text-[#442852]">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Create New Role</h2>
              <p className="text-[10px] text-gray-400 font-medium">
                Initialised with all permissions disabled.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Role Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
              Role Name
            </label>
            <input
              required
              type="text"
              value={roleName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Merchandiser"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-800 focus:border-[#442852] focus:outline-none focus:ring-1 focus:ring-[#442852] transition-all"
            />
          </div>

          {/* Role Key */}
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">
              Role Key{' '}
              <span className="normal-case font-normal text-gray-400">(auto-generated — edit if needed)</span>
            </label>
            <input
              required
              type="text"
              value={roleKey}
              onChange={(e) => {
                setKeyManual(true);
                setRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
              }}
              placeholder="e.g. merchandiser"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-mono font-medium text-purple-800 focus:border-[#442852] focus:outline-none focus:ring-1 focus:ring-[#442852] transition-all"
            />
            <p className="mt-1 text-[10px] text-gray-400">
              Lowercase letters, numbers and hyphens only. Used as the Firestore document ID.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2.5 rounded-2xl bg-amber-50/60 border border-amber-100 px-4 py-3 text-[10px] text-amber-800">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span>All permissions will be <strong>disabled by default</strong>. Enable them after creation.</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating || !roleName.trim() || !roleKey.trim()}
              className="flex-1 rounded-xl bg-[#442852] py-2.5 text-sm font-bold text-white hover:bg-[#321c3d] shadow transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Creating…
                </>
              ) : (
                'Create Role'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function RolePermissionsContent() {
  const { role: userRole } = useAuth();

  // Admins can VIEW but not edit. Super-admins have full control.
  const isReadOnly = userRole === 'admin';

  // Sidebar state
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [loadingCustom, setLoadingCustom] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Selected role state
  const [selectedEntry, setSelectedEntry] = useState<SidebarEntry>(BUILTIN_ROLES[2]); // default: super-admin
  const [permissionsState, setPermissionsState] = useState<RolePermission | null>(null);
  const [loadingPerms, setLoadingPerms] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Load custom roles from Firestore
  const loadCustomRoles = useCallback(async () => {
    setLoadingCustom(true);
    try {
      const roles = await fetchAllCustomRoles();
      setCustomRoles(roles);
    } catch {
      toast.error('Failed to load custom roles.');
    } finally {
      setLoadingCustom(false);
    }
  }, []);

  useEffect(() => {
    loadCustomRoles();
  }, [loadCustomRoles]);

  // ── Load permissions for the selected role
  const loadPermissions = useCallback(async (entry: SidebarEntry) => {
    setLoadingPerms(true);
    try {
      if (entry.kind === 'builtin') {
        const perms = await fetchRolePermissions(entry.key as UserRole);
        setPermissionsState(perms);
      } else {
        const perms = await fetchCustomRolePermissions(entry.key);
        setPermissionsState(perms);
      }
    } catch {
      toast.error('Failed to load permissions.');
    } finally {
      setLoadingPerms(false);
    }
  }, []);

  useEffect(() => {
    loadPermissions(selectedEntry);
  }, [selectedEntry, loadPermissions]);

  // ── Handlers
  const handleCheckboxChange = (key: keyof RolePermission) => {
    if (!permissionsState) return;
    setPermissionsState({ ...permissionsState, [key]: !permissionsState[key] });
  };

  const handleSave = async () => {
    if (!permissionsState) return;
    setSaving(true);
    try {
      await saveRolePermissions(selectedEntry.key, permissionsState);
      toast.success(`Permissions for "${selectedEntry.displayName}" saved!`);
    } catch {
      toast.error('Failed to save permissions.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (selectedEntry.kind === 'builtin') {
      setPermissionsState(getPermissions(selectedEntry.key as UserRole));
    } else {
      setPermissionsState({ ...DEFAULT_PERMISSIONS });
    }
    toast.success('Permissions reset to defaults — save to persist.');
  };

  const handleCreateRole = async (key: string, name: string) => {
    try {
      await createNewRole(key, name);
      toast.success(`Role "${name}" created!`);
      setShowCreateModal(false);
      await loadCustomRoles();
      // Auto-select the newly created role
      setSelectedEntry({ kind: 'custom', key, displayName: name });
    } catch {
      toast.error('Failed to create role. The key may already exist.');
    }
  };

  // ── Sidebar rendering helpers
  const allEntries: SidebarEntry[] = [
    ...BUILTIN_ROLES,
    ...customRoles.map<SidebarEntry>((r) => ({
      kind: 'custom',
      key: r.key,
      displayName: r.name,
    })),
  ];

  const loading = loadingPerms;

  return (
    <div className="mx-auto max-w-7xl space-y-6 antialiased">
      {/* Create Role Modal */}
      {showCreateModal && (
        <CreateRoleModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateRole}
        />
      )}

      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[#442852] font-bold text-xs uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>Access Policies</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-800 sm:text-3xl">
            Role Access Permissions
          </h1>
          <p className="mt-1.5 text-xs font-medium text-gray-500">
            {isReadOnly
              ? 'You have read-only access to this panel. Contact a Super Administrator to make changes.'
              : 'Define dynamic permissions for administrative and staff accounts. All roles are fully editable.'}
          </p>
        </div>

        {/* Action buttons — hidden entirely for read-only admin role */}
        {!isReadOnly && (
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleReset}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>
            <button
              onClick={handleSave}
              disabled={loading || saving}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#442852] px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#321c3d] disabled:opacity-50 transition-all active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  Save Access Plan
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">

        {/* ── Left Sidebar: Role Selector ── */}
        <div className="lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400">
              Select Role
            </h2>
          </div>

          <div className="flex flex-row lg:flex-col gap-2.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {/* Built-in roles */}
            {allEntries.map((entry) => {
              const isActive =
                selectedEntry.key === entry.key && selectedEntry.kind === entry.kind;
              const isSuper = entry.kind === 'builtin' && entry.key === 'super-admin';

              return (
                <button
                  key={`${entry.kind}-${entry.key}`}
                  onClick={() => setSelectedEntry(entry)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden shrink-0 lg:shrink ${
                    isActive
                      ? 'bg-white/80 border-[#442852]/30 shadow-md backdrop-blur-md'
                      : 'bg-white/40 border-gray-200/40 hover:bg-white/60'
                  }`}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-[#b292c7] to-[#442852]" />
                  )}
                  <div className="flex items-center justify-between mb-1 gap-1">
                    <span className="font-bold text-sm text-gray-800 tracking-tight truncate">
                      {entry.displayName}
                    </span>
                    {isSuper && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 shrink-0">
                        Owner
                      </span>
                    )}
                    {entry.kind === 'custom' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">
                    {entry.key}
                  </div>
                </button>
              );
            })}

            {/* Create New Role button — super-admin only */}
            {!isReadOnly && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full text-left p-4 rounded-2xl border border-dashed border-[#442852]/30 bg-[#442852]/5 hover:bg-[#442852]/10 transition-all duration-300 shrink-0 lg:shrink flex items-center gap-3 group"
              >
                <div className="w-7 h-7 rounded-xl bg-[#442852]/10 group-hover:bg-[#442852]/20 flex items-center justify-center transition-colors">
                  <Plus className="w-3.5 h-3.5 text-[#442852]" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#442852]">Create New Role</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">All permissions off by default</div>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* ── Right Side: Permission Checkbox Editor ── */}
        <div className="lg:col-span-3">
          <div className="rounded-3xl border border-gray-150/40 bg-white/40 shadow-sm backdrop-blur-md p-6 sm:p-8 space-y-8">

            {/* Role title bar */}
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100/50">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#442852] to-[#7f56d9] flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-gray-900 tracking-tight">
                  {selectedEntry.displayName}
                </h3>
                <p className="text-[11px] text-gray-400 font-mono mt-0.5">{selectedEntry.key}</p>
              </div>
              {/* Badge: Fully Editable (super-admin) or Read-Only (admin) */}
              {selectedEntry.kind === 'builtin' && selectedEntry.key === 'super-admin' && !isReadOnly && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  Fully Editable
                </span>
              )}
              {isReadOnly && (
                <span className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 px-3 py-1.5 text-xs font-bold">
                  <Eye className="w-3.5 h-3.5 text-blue-500" />
                  View Only
                </span>
              )}
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-28 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-purple-700" />
                <p className="mt-3 text-xs font-semibold">Resolving access profile keys…</p>
              </div>
            ) : !permissionsState ? (
              <div className="flex flex-col items-center justify-center py-28 text-gray-400">
                <Info className="w-8 h-8" />
                <p className="mt-3 text-xs font-semibold">No permissions configuration found.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {/* Read-only notice for admin role */}
                {isReadOnly && (
                  <div className="flex items-center gap-2.5 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-800 px-4 py-3.5 text-xs font-semibold">
                    <Lock className="w-4 h-4 text-blue-500 shrink-0" />
                    <span>
                      <strong>View-Only Mode:</strong> You can inspect permissions but cannot make changes. Contact a Super Administrator to modify access levels.
                    </span>
                  </div>
                )}
                {PERMISSION_GROUPS.map((group) => (
                  <div key={group.name} className="space-y-4">
                    {/* Group banner */}
                    <div
                      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3.5 rounded-2xl border bg-gradient-to-r ${group.colorClasses}`}
                    >
                      <div>
                        <h4 className="text-sm font-bold tracking-wide">{group.name}</h4>
                        <p className="text-[10px] opacity-75 leading-tight mt-0.5">
                          {group.description}
                        </p>
                      </div>
                      {/* Group select-all toggle — hidden in read-only mode */}
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={() => {
                            const allOn = group.permissions.every((p) => permissionsState[p.key]);
                            const updated = { ...permissionsState };
                            group.permissions.forEach((p) => {
                              updated[p.key] = !allOn as never;
                            });
                            setPermissionsState(updated);
                          }}
                          className="text-[10px] font-bold underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap"
                        >
                          {group.permissions.every((p) => permissionsState[p.key])
                            ? 'Disable All'
                            : 'Enable All'}
                        </button>
                      )}
                    </div>

                    {/* Checkbox grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.permissions.map((perm) => {
                        const isChecked = !!permissionsState[perm.key];
                        const inputId = `perm-${selectedEntry.key}-${perm.key}`;
                        return (
                          <label
                            key={perm.key}
                            htmlFor={isReadOnly ? undefined : inputId}
                            className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all duration-300 select-none ${
                              isReadOnly
                                ? 'cursor-not-allowed opacity-80'
                                : 'cursor-pointer'
                            } ${
                              isChecked
                                ? 'bg-[#F2EEF5]/70 border-purple-200/60 shadow-sm'
                                : 'bg-white/50 border-gray-150/40 hover:bg-white/80 hover:border-gray-200/60'
                            }`}
                          >
                            {/* Custom checkbox — disabled in read-only mode */}
                            <div className="relative flex items-center mt-0.5 shrink-0">
                              <input
                                id={inputId}
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleCheckboxChange(perm.key)}
                                disabled={isReadOnly}
                                className="sr-only"
                              />
                              <div
                                className={`w-5 h-5 rounded-lg border transition-all duration-200 flex items-center justify-center ${
                                  isChecked
                                    ? 'bg-gradient-to-tr from-[#442852] to-[#7f56d9] border-[#442852] text-white shadow-sm shadow-purple-500/30'
                                    : 'border-gray-250 bg-white/70'
                                }`}
                              >
                                {isChecked && (
                                  <svg
                                    className="w-3.5 h-3.5 stroke-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Text */}
                            <div className="flex-1 space-y-0.5">
                              <span
                                className={`text-xs font-bold block ${
                                  isChecked ? 'text-[#442852]' : 'text-gray-700'
                                }`}
                              >
                                {perm.label}
                              </span>
                              <span className="text-[10px] text-gray-400 leading-normal block">
                                {perm.description}
                              </span>
                              <span className="text-[9px] font-mono text-gray-300 block pt-0.5">
                                {perm.key}
                              </span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info notice */}
            <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 text-amber-900 flex gap-3 text-xs">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-0.5">Immediate Access Application</p>
                <p className="text-[10px] text-amber-800/80 leading-normal">
                  Changes take effect upon the next permission check. Active sessions may need
                  a page refresh before they reflect updated access controls.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page export ──────────────────────────────────────────────────────────────

export default function RolePermissionsPage() {
  return (
    // super-admin = full control; admin = read-only view
    <AdminGuard minRole={['super-admin', 'admin']}>
      <RolePermissionsContent />
    </AdminGuard>
  );
}
