'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, UserCircle, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, toggleCart } = useCart();
  const { user, role, signOut, setAuthModalOpen } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminOrStaff = role === 'admin' || role === 'staff' || role === 'super-admin' || (user as any)?.role === 'admin' || (user as any)?.role === 'staff' || (user as any)?.role === 'super-admin';

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { href: '/home', label: 'Home', active: pathname === '/home' || pathname === '/' },
    ...(!isAdminOrStaff ? [
      { href: '/category/jewellery', label: 'Jewellery', active: isActive('/category/jewellery') || isActive('/category/handmade-jewelry') },
      { href: '/category/resin', label: 'Resin Crafts', active: isActive('/category/resin') || isActive('/category/resin-crafts') },
      { href: '/category/stationery', label: 'Stationery', active: isActive('/category/stationery') },
      { href: '/category/chocolate-boxes', label: 'Chocolate Boxes', active: isActive('/category/chocolate-boxes') },
    ] : [
      { href: '/admin', label: 'Admin Dashboard', active: isActive('/admin') }
    ]),
    { href: '/about', label: 'About', active: isActive('/about') },
    { href: '/contact', label: 'Contact', active: isActive('/contact') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F9F6F0] border-b border-[#E5E0D8] shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        <button
          onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileSearchOpen(false); }}
          className="md:hidden p-2 text-[#442852] hover:bg-[#E5E0D8] rounded-md transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <Link href="/home" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#442852]">
            <span className="text-white font-bold text-sm">CG</span>
          </div>
          <span className="font-bold text-xl hidden sm:block text-[#442852]">
            Craft Girly Store
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-5 text-sm font-medium ml-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors whitespace-nowrap ${link.active
                  ? 'text-[#442852] underline underline-offset-4 decoration-[#442852] decoration-2'
                  : 'text-[#2D2D2D] hover:text-[#442852]'
                }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-6 relative">
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[#D1C9C0] bg-white text-[#2D2D2D] focus:outline-none focus:border-[#442852] focus:ring-1 focus:ring-[#442852] transition-all"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </form>

        <div className="flex items-center gap-2 sm:gap-4">
          <button
            onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileMenuOpen(false); }}
            className="md:hidden p-2 text-[#442852] hover:bg-[#E5E0D8] rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => user ? setIsProfileMenuOpen(!isProfileMenuOpen) : setAuthModalOpen(true)}
              className="p-2 text-[#442852] hover:bg-[#E5E0D8] rounded-full transition-colors"
              aria-label="User Profile"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full" />
              ) : (
                <UserCircle className="w-6 h-6" />
              )}
            </button>

            {isProfileMenuOpen && user && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#E5E0D8] py-2 z-50">
                  <div className="px-4 py-2 border-b border-[#E5E0D8] mb-2">
                    <p className="text-sm font-bold text-[#2D2D2D] truncate">{user.displayName || 'User'}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  {!isAdminOrStaff ? (
                    <Link href="/profile" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#F9F6F0] hover:text-[#442852]">
                      My Profile & Orders
                    </Link>
                  ) : (
                    <>
                      <Link href="/admin" onClick={() => setIsProfileMenuOpen(false)} className="block px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#F9F6F0] hover:text-[#442852] font-semibold text-purple-700">
                        Admin Dashboard
                      </Link>
                      <button
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await signOut();
                          router.push('/home');
                        }}
                        className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          {!isAdminOrStaff && (
            <button
              onClick={() => toggleCart(true)}
              className="relative p-2 text-[#442852] hover:bg-[#E5E0D8] rounded-full transition-colors"
              aria-label="Open cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-[#442852] rounded-full">
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search & Menu components */}
      {mobileSearchOpen && (
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-[#D1C9C0] bg-white text-[#2D2D2D] focus:outline-none focus:border-[#442852] focus:ring-1 focus:ring-[#442852]"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </form>
      )}

      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-[#E5E0D8] bg-[#F9F6F0] px-4 py-3">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${link.active
                      ? 'bg-[#442852] text-white'
                      : 'text-[#2D2D2D] hover:bg-[#E5E0D8] hover:text-[#442852]'
                    }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}