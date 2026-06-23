'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, UserCircle, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { fetchAllCategories, STATIC_CATEGORIES } from '@/lib/categoryService';
import type { Category } from '@/lib/categoryService';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, toggleCart } = useCart();
  const { user, role, signOut, setAuthModalOpen } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── Dynamic categories from Firestore ──────────────────────────────────────
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAllCategories().then((cats) => {
      setCategories(cats);
      setCategoriesLoading(false);
    });
  }, []);

  // Close shop dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shopMenuRef.current && !shopMenuRef.current.contains(e.target as Node)) {
        setShopMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isAdminOrStaff =
    role === 'admin' ||
    role === 'staff' ||
    role === 'super-admin' ||
    (user as any)?.role === 'admin' ||
    (user as any)?.role === 'staff' ||
    (user as any)?.role === 'super-admin';

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setMobileSearchOpen(false);
      setMobileMenuOpen(false);
    }
  };

  const staticLinks = [
    { href: '/home', label: 'Home', active: pathname === '/home' || pathname === '/' },
    ...(isAdminOrStaff
      ? [{ href: '/admin', label: 'Admin Dashboard', active: isActive('/admin') }]
      : []),
    { href: '/about', label: 'About', active: isActive('/about') },
    { href: '/contact', label: 'Contact', active: isActive('/contact') },
  ];

  const isCategoryActive = categories.some((c) => isActive(`/category/${c.key}`));

  return (
    <header className="sticky top-0 z-40 w-full bg-[#F9F6F0] border-b border-[#E5E0D8] shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">

        {/* Mobile hamburger */}
        <button
          onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileSearchOpen(false); }}
          className="md:hidden p-2 text-[#442852] hover:bg-[#E5E0D8] rounded-md transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 flex-shrink-0">
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-[#442852]">
            <img
              src={process.env.NEXT_PUBLIC_STORE_LOGO_URL || 'https://ui-avatars.com/api/?name=CG&background=442852&color=fff'}
              alt="Craft Girly Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-bold text-xl hidden sm:block text-[#442852]">
            Craft Girly Store
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 text-sm font-medium ml-6">
          {/* Home */}
          <Link
            href="/home"
            className={`transition-colors whitespace-nowrap ${
              pathname === '/home' || pathname === '/'
                ? 'text-[#442852] underline underline-offset-4 decoration-[#442852] decoration-2'
                : 'text-[#2D2D2D] hover:text-[#442852]'
            }`}
          >
            Home
          </Link>

          {/* Admin link (staff/admin only) */}
          {isAdminOrStaff && (
            <Link
              href="/admin"
              className={`transition-colors whitespace-nowrap ${
                isActive('/admin')
                  ? 'text-[#442852] underline underline-offset-4 decoration-[#442852] decoration-2'
                  : 'text-[#2D2D2D] hover:text-[#442852]'
              }`}
            >
              Admin Dashboard
            </Link>
          )}

          {/* Dynamic Shop / Categories dropdown (customers only) */}
          {!isAdminOrStaff && (
            <div className="relative" ref={shopMenuRef}>
              <button
                onClick={() => setShopMenuOpen(!shopMenuOpen)}
                className={`flex items-center gap-1 transition-colors whitespace-nowrap ${
                  isCategoryActive
                    ? 'text-[#442852] underline underline-offset-4 decoration-[#442852] decoration-2'
                    : 'text-[#2D2D2D] hover:text-[#442852]'
                }`}
              >
                Shop
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${shopMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {shopMenuOpen && (
                <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[#E5E0D8] rounded-2xl shadow-lg py-2 z-50">
                  {categoriesLoading ? (
                    // Skeleton while loading
                    <div className="px-4 py-3 space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-gray-100 rounded-full animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {categories.map((cat) => (
                        <Link
                          key={cat.key}
                          href={`/category/${cat.key}`}
                          onClick={() => setShopMenuOpen(false)}
                          className={`flex items-center gap-2 px-4 py-2.5 text-sm transition-colors ${
                            isActive(`/category/${cat.key}`)
                              ? 'bg-[#F9F6F0] text-[#442852] font-semibold'
                              : 'text-[#2D2D2D] hover:bg-[#F9F6F0] hover:text-[#442852]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#CBB0DC] flex-shrink-0" />
                          {cat.label}
                        </Link>
                      ))}
                      <div className="border-t border-[#E5E0D8] mt-2 pt-2">
                        <Link
                          href="/home"
                          onClick={() => setShopMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#442852] font-semibold hover:bg-[#F9F6F0] transition-colors"
                        >
                          View All Products →
                        </Link>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* About & Contact */}
          {[
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`transition-colors whitespace-nowrap ${
                isActive(link.href)
                  ? 'text-[#442852] underline underline-offset-4 decoration-[#442852] decoration-2'
                  : 'text-[#2D2D2D] hover:text-[#442852]'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Search */}
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

        {/* Right icons */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile search toggle */}
          <button
            onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileMenuOpen(false); }}
            className="md:hidden p-2 text-[#442852] hover:bg-[#E5E0D8] rounded-full transition-colors"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* User / Profile */}
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
                    <Link
                      href="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#F9F6F0] hover:text-[#442852]"
                    >
                      My Profile & Orders
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2 text-sm font-semibold text-purple-700 hover:bg-[#F9F6F0]"
                      >
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

          {/* Cart */}
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

      {/* Mobile Search Bar */}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-[#E5E0D8] bg-[#F9F6F0] px-4 py-3">
          <ul className="space-y-1">
            {/* Home */}
            <li>
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  pathname === '/home' || pathname === '/'
                    ? 'bg-[#442852] text-white'
                    : 'text-[#2D2D2D] hover:bg-[#E5E0D8] hover:text-[#442852]'
                }`}
              >
                Home
              </Link>
            </li>

            {/* Admin (staff only) */}
            {isAdminOrStaff && (
              <li>
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/admin')
                      ? 'bg-[#442852] text-white'
                      : 'text-[#2D2D2D] hover:bg-[#E5E0D8] hover:text-[#442852]'
                  }`}
                >
                  Admin Dashboard
                </Link>
              </li>
            )}

            {/* Dynamic category links (customers only) */}
            {!isAdminOrStaff && (
              <>
                <li className="pt-1 pb-0.5">
                  <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">Shop</p>
                </li>
                {categoriesLoading
                  ? [1, 2, 3].map((i) => (
                      <li key={i}>
                        <div className="mx-3 h-8 bg-gray-200 rounded-xl animate-pulse" />
                      </li>
                    ))
                  : categories.map((cat) => (
                      <li key={cat.key}>
                        <Link
                          href={`/category/${cat.key}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                            isActive(`/category/${cat.key}`)
                              ? 'bg-[#442852] text-white'
                              : 'text-[#2D2D2D] hover:bg-[#E5E0D8] hover:text-[#442852]'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#CBB0DC] flex-shrink-0" />
                          {cat.label}
                        </Link>
                      </li>
                    ))}
              </>
            )}

            {/* About & Contact */}
            {[
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive(link.href)
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