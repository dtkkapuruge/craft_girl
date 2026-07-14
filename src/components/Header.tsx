'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ShoppingCart, Menu, UserCircle, X, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect, useRef } from 'react';
import { fetchAllCategories, STATIC_CATEGORIES } from '@/lib/categoryService';
import type { Category } from '@/lib/categoryService';
import { fetchLayoutSettings } from '@/lib/layoutService';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, toggleCart } = useCart();
  const { user, role, signOut, setAuthModalOpen } = useAuth();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [navbarLogo, setNavbarLogo] = useState('');

  // Dynamic categories
  const [categories, setCategories] = useState<Category[]>(STATIC_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const shopMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLayoutSettings().then((settings) => {
      if (settings.navbarLogo) setNavbarLogo(settings.navbarLogo);
    });
  }, []);

  // Scroll detection for transparent-to-solid overlay header on Homepage
  const isHomePage = pathname === '/home' || pathname === '/';
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (!isHomePage) return;
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    // Initialize
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHomePage]);

  // Categories fetch
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

  const isCategoryActive = categories.some((c) => isActive(`/category/${c.key}`));

  // Theme states
  const isDarkText = !isHomePage || isScrolled;

  return (
    <header
      className={`transition-all duration-300 w-full z-45 rounded-none ${
        isHomePage
          ? `fixed top-0 left-0 right-0 ${
              isScrolled
                ? 'bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E8E4DF]/50 shadow-sm py-4'
                : 'bg-transparent bg-gradient-to-b from-black/50 via-black/15 to-transparent border-b border-white/10 py-5'
            }`
          : 'sticky top-0 bg-[#FAFAF8]/95 backdrop-blur-md border-b border-[#E8E4DF]/50 py-4'
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Mobile hamburger */}
        <button
          onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileSearchOpen(false); }}
          className={`md:hidden p-2 rounded-none transition-colors ${
            isDarkText ? 'text-[#0A0A0A] hover:bg-black/5' : 'text-white hover:bg-white/10'
          }`}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Minimalist Logo Wordmark & Sparkle Icon */}
        <Link href="/home" className="flex items-center gap-2.5 flex-shrink-0 group">
          {navbarLogo ? (
            <img src={navbarLogo} alt="Logo" className="h-6 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80" />
          ) : (
            <>
              <svg
                className={`w-4 h-4 transition-transform duration-700 group-hover:rotate-90 ${
                  isDarkText ? 'text-[#442852]' : 'text-[#CBB0DC]'
                }`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M12 2L15 9L22 12L15 15L12 22L9 15L2 12L9 9L12 2Z" fill="currentColor" fillOpacity="0.1" />
              </svg>
              <span
                className={`font-bold text-xs tracking-[0.3em] uppercase transition-colors duration-300 ${
                  isDarkText
                    ? 'text-[#0A0A0A] group-hover:text-[#442852]'
                    : 'text-white group-hover:text-white/80'
                }`}
              >
                CRAFT GIRLY
              </span>
            </>
          )}
        </Link>

        {/* Desktop Nav with Luxury Spacing */}
        <nav
          className={`hidden md:flex items-center gap-8 text-[9px] font-extrabold uppercase tracking-[0.25em] ml-8 transition-colors duration-300 flex-1`}
        >
          {/* Home */}
          <Link
            href="/home"
            className={`transition-all duration-300 whitespace-nowrap ${
              pathname === '/home' || pathname === '/'
                ? isDarkText
                  ? 'text-[#442852] underline underline-offset-8 decoration-[#442852] decoration-[1.5px]'
                  : 'text-white underline underline-offset-8 decoration-white decoration-[1.5px]'
                : isDarkText
                ? 'text-[#6B6B6B] hover:text-[#442852]'
                : 'text-white/70 hover:text-white'
            }`}
          >
            Home
          </Link>

          {/* Admin link (staff/admin only) */}
          {isAdminOrStaff && (
            <Link
              href="/admin"
              className={`transition-all duration-300 whitespace-nowrap ${
                isActive('/admin')
                  ? isDarkText
                    ? 'text-[#442852] underline underline-offset-8 decoration-[#442852] decoration-[1.5px]'
                    : 'text-white underline underline-offset-8 decoration-white decoration-[1.5px]'
                  : isDarkText
                  ? 'text-[#6B6B6B] hover:text-[#442852]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              Admin
            </Link>
          )}

          {/* Dynamic Shop / Categories dropdown (customers only) */}
          {!isAdminOrStaff && (
            <div className="relative" ref={shopMenuRef}>
              <button
                onClick={() => setShopMenuOpen(!shopMenuOpen)}
                className={`flex items-center gap-1.5 transition-all duration-300 whitespace-nowrap ${
                  isCategoryActive
                    ? isDarkText
                      ? 'text-[#442852] underline underline-offset-8 decoration-[#442852] decoration-[1.5px]'
                      : 'text-white underline underline-offset-8 decoration-white decoration-[1.5px]'
                    : isDarkText
                    ? 'text-[#6B6B6B] hover:text-[#442852]'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Shop
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-200 ${shopMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {shopMenuOpen && (
                <div className="absolute top-full left-0 mt-3.5 w-56 bg-white border border-[#E8E4DF] rounded-none shadow-md py-2.5 z-50 animate-in fade-in duration-150 text-[#0A0A0A]">
                  {categoriesLoading ? (
                    <div className="px-4 py-3 space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-4 bg-[#FAFAF8] rounded-none animate-pulse" />
                      ))}
                    </div>
                  ) : (
                    <>
                      {categories.map((cat) => (
                        <Link
                          key={cat.key}
                          href={`/category/${cat.key}`}
                          onClick={() => setShopMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-[9px] font-bold tracking-widest uppercase transition-colors ${
                            isActive(`/category/${cat.key}`)
                              ? 'bg-[#FAFAF8] text-[#442852]'
                              : 'text-[#6B6B6B] hover:bg-[#FAFAF8] hover:text-[#442852]'
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-none flex-shrink-0 ${
                            isActive(`/category/${cat.key}`) ? 'bg-[#442852]' : 'bg-[#0A0A0A]'
                          }`} />
                          {cat.label}
                        </Link>
                      ))}
                      <div className="border-t border-[#E8E4DF] mt-2 pt-2">
                        <Link
                          href="/category/all-products"
                          onClick={() => setShopMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-[9px] font-extrabold tracking-widest text-[#0A0A0A] hover:text-[#442852] hover:bg-[#FAFAF8] transition-all uppercase"
                        >
                          All Products →
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
              className={`transition-all duration-300 whitespace-nowrap ${
                isActive(link.href)
                  ? isDarkText
                    ? 'text-[#442852] underline underline-offset-8 decoration-[#442852] decoration-[1.5px]'
                    : 'text-white underline underline-offset-8 decoration-white decoration-[1.5px]'
                  : isDarkText
                  ? 'text-[#6B6B6B] hover:text-[#442852]'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          {/* Desktop Search Icon */}
          <button
            onClick={() => setDesktopSearchOpen(true)}
            className={`hidden md:block p-2 rounded-none transition-colors ${
              isDarkText ? 'text-[#0A0A0A] hover:text-[#442852] hover:bg-black/5' : 'text-white hover:text-white/80 hover:bg-white/10'
            }`}
            aria-label="Open Search"
          >
            <Search className="w-4.5 h-4.5" />
          </button>
          {/* Mobile search toggle */}
          <button
            onClick={() => { setMobileSearchOpen(!mobileSearchOpen); setMobileMenuOpen(false); }}
            className={`md:hidden p-2 rounded-none transition-colors ${
              isDarkText ? 'text-[#0A0A0A] hover:bg-black/5' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* User / Profile */}
          <div className="relative">
            <button
              onClick={() => user ? setIsProfileMenuOpen(!isProfileMenuOpen) : setAuthModalOpen(true)}
              className={`p-2 rounded-none transition-colors ${
                isDarkText ? 'text-[#0A0A0A] hover:text-[#442852] hover:bg-black/5' : 'text-white hover:text-white/80 hover:bg-white/10'
              }`}
              aria-label="User Profile"
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-5 h-5 rounded-none object-cover" />
              ) : (
                <UserCircle className="w-4.5 h-4.5" />
              )}
            </button>

            {isProfileMenuOpen && user && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileMenuOpen(false)} />
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-none shadow-md border border-[#E8E4DF] py-2 z-50 text-[#0A0A0A]">
                  <div className="px-4 py-2 border-b border-[#E8E4DF] mb-2">
                    <p className="text-[10px] font-bold text-[#0A0A0A] truncate">{user.displayName || 'User'}</p>
                    <p className="text-[9px] font-medium text-gray-400 truncate">{user.email}</p>
                  </div>
                  {!isAdminOrStaff ? (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-[#6B6B6B] hover:bg-[#FAFAF8] hover:text-[#442852] transition-colors"
                      >
                        My Account
                      </Link>
                      <button
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await signOut();
                          router.push('/home');
                        }}
                        className="w-full text-left block px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50/50 transition-colors"
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="block px-4 py-2.5 text-[9px] font-extrabold uppercase tracking-wider text-[#0A0A0A] hover:bg-[#FAFAF8] hover:text-[#442852] transition-colors"
                      >
                        Admin Console
                      </Link>
                      <button
                        onClick={async () => {
                          setIsProfileMenuOpen(false);
                          await signOut();
                          router.push('/home');
                        }}
                        className="w-full text-left block px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-50/50 transition-colors"
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
              className={`relative p-2 rounded-none transition-colors ${
                isDarkText ? 'text-[#0A0A0A] hover:text-[#442852] hover:bg-black/5' : 'text-white hover:text-white/80 hover:bg-white/10'
              }`}
              aria-label="Open cart"
            >
              <ShoppingCart className="w-4.5 h-4.5" />
              {cartCount > 0 && (
                <span className={`absolute top-0.5 right-0.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[8px] font-extrabold leading-none rounded-none ${
                  isDarkText ? 'text-white bg-[#0A0A0A]' : 'text-black bg-white'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearchOpen && (
        <form onSubmit={handleSearch} className="md:hidden px-4 pb-3 pt-2 bg-white border-b border-[#E8E4DF] z-50">
          <div className="relative">
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
              className="w-full pl-9 pr-4 py-2 rounded-none border border-[#C4BFBA] bg-white text-xs text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:border-[#442852] uppercase tracking-wide"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </form>
      )}

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-[#E8E4DF] bg-white px-4 py-4 shadow-inner rounded-none z-50 relative">
          <ul className="space-y-1">
            {/* Home */}
            <li>
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-3 py-2.5 rounded-none text-xs font-bold uppercase tracking-widest transition-colors ${
                  pathname === '/home' || pathname === '/'
                    ? 'bg-[#442852] text-white'
                    : 'text-[#6B6B6B] hover:bg-[#FAFAF8] hover:text-[#442852]'
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
                  className={`block px-3 py-2.5 rounded-none text-xs font-bold uppercase tracking-widest transition-colors ${
                    isActive('/admin')
                      ? 'bg-[#442852] text-white'
                      : 'text-[#6B6B6B] hover:bg-[#FAFAF8] hover:text-[#442852]'
                  }`}
                >
                  Admin Console
                </Link>
              </li>
            )}

            {/* Dynamic category links (customers only) */}
            {!isAdminOrStaff && (
              <>
                <li className="pt-3 pb-1">
                  <p className="px-3 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400">Collections</p>
                </li>
                {categoriesLoading
                  ? [1, 2, 3].map((i) => (
                      <li key={i}>
                        <div className="mx-3 h-8 bg-[#FAFAF8] rounded-none animate-pulse" />
                      </li>
                    ))
                  : categories.map((cat) => (
                      <li key={cat.key}>
                        <Link
                          href={`/category/${cat.key}`}
                          onClick={() => setMobileMenuOpen(false)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-none text-xs font-bold uppercase tracking-widest transition-colors ${
                            isActive(`/category/${cat.key}`)
                              ? 'bg-[#442852] text-white'
                              : 'text-[#6B6B6B] hover:bg-[#FAFAF8] hover:text-[#442852]'
                          }`}
                        >
                          <span className={`w-1 h-1 rounded-none flex-shrink-0 ${
                            isActive(`/category/${cat.key}`) ? 'bg-white' : 'bg-[#442852]'
                          }`} />
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
                  className={`block px-3 py-2.5 rounded-none text-xs font-bold uppercase tracking-widest transition-colors ${
                    isActive(link.href)
                      ? 'bg-[#442852] text-white'
                      : 'text-[#6B6B6B] hover:bg-[#FAFAF8] hover:text-[#442852]'
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {/* Desktop Search Overlay */}
      {desktopSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-start justify-center pt-24 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl p-8 relative shadow-2xl">
            <button 
              onClick={() => setDesktopSearchOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-black transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <form onSubmit={(e) => { handleSearch(e); setDesktopSearchOpen(false); }} className="w-full">
              <input
                type="text"
                placeholder="SEARCH EDITORIAL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full border-b-2 border-black/10 py-4 text-4xl font-light tracking-tight text-black placeholder-gray-300 focus:outline-none focus:border-black transition-colors"
              />
            </form>
          </div>
        </div>
      )}
    </header>
  );
}