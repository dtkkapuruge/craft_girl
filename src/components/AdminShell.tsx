'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleDisplayName, hasPermission } from '@/lib/rbac';
import toast from 'react-hot-toast';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  ChevronRight,
  Menu,
  X,
  Boxes,
  Folder,
  Shield,
  Settings,
} from 'lucide-react';

const ALL_NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, permission: 'canViewDashboard' as const },
  { href: '/admin/orders', label: 'Orders', icon: Package, permission: 'canViewOrders' as const },
  { href: '/admin/products', label: 'Product Management', icon: ShoppingBag, permission: 'canViewProducts' as const },
  { href: '/admin/categories', label: 'Category Manager', icon: Folder, permission: 'canViewProducts' as const },
  { href: '/admin/inventory', label: 'Inventory Log', icon: Boxes, permission: 'canViewProducts' as const },
  { href: '/admin/users', label: 'User Management', icon: Users, permission: 'canManageUsers' as const },
  { href: '/admin/roles', label: 'Role Permissions', icon: Shield, permission: 'canManagePermissions' as const },
  { href: '/admin/settings', label: 'Store Settings', icon: Settings, permission: 'canManagePermissions' as const },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/orders': 'Orders',
  '/admin/products': 'Product Management',
  '/admin/categories': 'Category Manager',
  '/admin/inventory': 'Inventory Log',
  '/admin/users': 'User Management',
  '/admin/roles': 'Role Permissions',
  '/admin/settings': 'Store Settings',
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = ALL_NAV_ITEMS.filter((item) =>
    hasPermission(role, item.permission)
  );

  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard';

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
      {navItems.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={onClick}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
              active
                ? 'bg-zinc-900 text-white shadow-sm'
                : 'text-zinc-650 hover:bg-zinc-50 hover:text-zinc-950 text-gray-600'
            }`}
          >
            <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-700'}`} />
            {label}
            {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-400" />}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#fafafa] overflow-hidden">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-zinc-200/80 bg-white">
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-zinc-100 shrink-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white text-xs font-semibold tracking-tight">
            CG
          </div>
          <div>
            <p className="text-sm font-bold text-zinc-900 tracking-tight">Craft Girly</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Admin Console</p>
          </div>
        </div>

        <NavLinks />

        <div className="border-t border-zinc-100 p-4 shrink-0">
          <div className="rounded-xl bg-zinc-50 px-3.5 py-3">
            <p className="text-xs font-bold text-zinc-900 truncate">{user?.email}</p>
            <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-wider">{getRoleDisplayName(role)}</p>
          </div>
          <button
            onClick={async () => { await signOut(); toast.success('Signed out successfully.'); router.push('/'); }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-bold text-zinc-600 transition-all duration-200 hover:border-zinc-350 hover:text-zinc-900 hover:shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          
          {/* Drawer container */}
          <aside className="relative flex w-full max-w-xs flex-col bg-white h-full shadow-2xl animate-in slide-in-from-left duration-300">
            <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white text-xs font-semibold tracking-tight">
                  CG
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900 tracking-tight">Craft Girly</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Admin Console</p>
                </div>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <NavLinks onClick={() => setMobileSidebarOpen(false)} />

            <div className="border-t border-zinc-100 p-4 shrink-0">
              <div className="rounded-xl bg-zinc-50 px-3.5 py-3">
                <p className="text-xs font-bold text-zinc-900 truncate">{user?.email}</p>
                <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-wider">{getRoleDisplayName(role)}</p>
              </div>
              <button
                onClick={async () => { await signOut(); toast.success('Signed out successfully.'); router.push('/'); }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-xs font-bold text-zinc-600 transition-all duration-200 hover:border-zinc-350 hover:text-zinc-900"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:pl-64 min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-3 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl px-4 lg:px-8">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 rounded-lg lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="w-5.5 h-5.5" />
          </button>
          
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white text-[10px] font-semibold lg:hidden">
            CG
          </div>
          
          <LayoutDashboard className="h-4 w-4 text-zinc-400 hidden sm:block" />
          <span className="text-sm font-semibold text-zinc-450 text-gray-500">Console</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
          <span className="text-sm font-extrabold text-zinc-900">{pageTitle}</span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 overflow-x-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
