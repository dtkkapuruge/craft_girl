'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchLayoutSettings } from '@/lib/layoutService';

// Configurable social URLs
const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/profile.php?id=100086577828998',
  instagram: 'https://www.instagram.com/craft_girly',
  tiktok: 'https://www.tiktok.com/@craft_girly',
  whatsapp: 'https://wa.me/94766722187',
};

// Configurable contact details
const CONTACT_DETAILS = {
  phone: '076 672 2187',
  location: 'Sri Lanka',
  email: 'info@craftgirly.com',
};

const FacebookIcon = () => (
  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>
  </svg>
);

const WhatsAppIcon = () => (
  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [footerLogo, setFooterLogo] = useState('');

  useEffect(() => {
    fetchLayoutSettings().then((settings) => {
      if (settings.footerLogo) setFooterLogo(settings.footerLogo);
    });
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Thank you for subscribing to our newsletter!');
  };

  return (
    <footer className="bg-[#FAFAF8] border-t border-[#E8E4DF] text-[#0A0A0A] rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand Col */}
          <div className="space-y-4">
            {footerLogo ? (
              <img src={footerLogo} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <h3 className="font-bold text-xs tracking-[0.25em] uppercase text-[#0A0A0A]">
                CRAFT GIRLY
              </h3>
            )}
            <p className="text-[11px] text-[#6B6B6B] leading-relaxed uppercase tracking-wider">
              Premium handmade jewellery, resin crafts, flower preservation, and chocolate boxes. Handcrafted with love.
            </p>
            {/* Social Links Grouped */}
            <div className="flex items-center gap-4.5 pt-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A0A0A] hover:text-[#442852] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A0A0A] hover:text-[#442852] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A0A0A] hover:text-[#442852] transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0A0A0A] hover:text-[#442852] transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h4 className="font-bold text-[#0A0A0A] mb-6 text-[10px] uppercase tracking-[0.2em]">Shop</h4>
            <ul className="space-y-3 text-[10px] font-bold tracking-widest uppercase">
              <li>
                <Link href="/category/jewellery" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  Bespoke Jewelry
                </Link>
              </li>
              <li>
                <Link href="/category/resin" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  Resin Art & Decor
                </Link>
              </li>
              <li>
                <Link href="/category/chocolate-boxes" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  Luxury Chocolate Boxes
                </Link>
              </li>
              <li>
                <Link href="/category/flower-preservation" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  Floral Preservation
                </Link>
              </li>
              <li>
                <Link href="/category/stationery" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  Aesthetic Stationery
                </Link>
              </li>
              <li>
                <Link href="/category/all-products" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Care Col */}
          <div>
            <h4 className="font-bold text-[#0A0A0A] mb-6 text-[10px] uppercase tracking-[0.2em]">Customer Care</h4>
            <ul className="space-y-3 text-[10px] font-bold tracking-widest uppercase">
              <li>
                <Link href="/contact" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-[#6B6B6B] hover:text-[#442852] transition-colors">
                  Search Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Keep in Touch (Newsletter) Col */}
          <div>
            <h4 className="font-bold text-[#0A0A0A] mb-6 text-[10px] uppercase tracking-[0.2em]">Newsletter</h4>
            <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider mb-4 leading-relaxed">
              Subscribe to receive updates on new custom collections and special offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                required
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                className="w-full bg-white border border-[#C4BFBA] px-3.5 py-2.5 text-[10px] font-semibold text-[#0A0A0A] focus:outline-none focus:border-[#442852] tracking-wider rounded-none uppercase transition-colors"
              />
              <button
                type="submit"
                className="w-full bg-[#0A0A0A] text-white px-4 py-2.5 text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#442852] transition-colors rounded-none"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-[#E8E4DF] my-8 md:my-12"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[9px] font-bold tracking-widest uppercase text-[#9B9B9B]">
          <p>
            © {currentYear} Craft Girly Store. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {CONTACT_DETAILS.location}
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {CONTACT_DETAILS.phone}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}