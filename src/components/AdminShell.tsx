'use client';

import Link from 'next/link';
<<<<<<< HEAD
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleDisplayName, hasPermission } from '@/lib/rbac';
import toast from 'react-hot-toast';
=======
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleDisplayName, hasPermission } from '@/lib/rbac';
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  ChevronRight,
} from 'lucide-react';

const ALL_NAV_ITEMS = [
  { href: '/admin/orders', label: 'Orders', icon: Package, permission: 'canViewOrders' as const },
  { href: '/admin/products', label: 'Product Management', icon: ShoppingBag, permission: 'canViewProducts' as const },
  { href: '/admin/users', label: 'User Management', icon: Users, permission: 'canManageUsers' as const },
];

const PAGE_TITLES: Record<string, string> = {
  '/admin/orders': 'Orders',
  '/admin/products': 'Product Management',
  '/admin/users': 'User Management',
};

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, role, signOut } = useAuth();
<<<<<<< HEAD
  const router = useRouter();
=======
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3

  const navItems = ALL_NAV_ITEMS.filter((item) =>
    hasPermission(role, item.permission)
  );

  const pageTitle = PAGE_TITLES[pathname] ?? 'Dashboard';

  return (
    <div className="flex min-h-screen bg-[#fafafa]">
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-zinc-200/80 bg-white">
        <div className="flex h-16 items-center gap-2.5 px-6 border-b border-zinc-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white text-xs font-semibold tracking-tight">
            CG
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-900 tracking-tight">Craft Girly</p>
            <p className="text-[11px] text-zinc-400 font-medium">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-zinc-300' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                {label}
                {active && <ChevronRight className="ml-auto h-3.5 w-3.5 text-zinc-500" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-zinc-100 p-4">
          <div className="rounded-xl bg-zinc-50 px-3.5 py-3">
            <p className="text-xs font-medium text-zinc-900 truncate">{user?.email}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{getRoleDisplayName(role)}</p>
          </div>
          <button
<<<<<<< HEAD
            onClick={async () => { await signOut(); toast.success('Signed out successfully.'); router.push('/'); }}
=======
            onClick={() => signOut()}
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-medium text-zinc-600 transition-all duration-200 hover:border-zinc-300 hover:text-zinc-900 hover:shadow-sm"
          >
            <LogOut className="h-3.5 w-3.5" />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-zinc-200/80 bg-white/80 backdrop-blur-xl px-4 lg:px-8">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white text-[10px] font-semibold lg:hidden">
            CG
          </div>
          <LayoutDashboard className="h-4 w-4 text-zinc-400 hidden sm:block" />
          <span className="text-sm font-medium text-zinc-500">Dashboard</span>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-300" />
          <span className="text-sm font-semibold text-zinc-900">{pageTitle}</span>
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
