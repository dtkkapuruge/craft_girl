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
    <footer className="bg-[#DEC8D8] border-t border-[#E8E4DF] text-[#2D182B] rounded-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          {/* Brand Col */}
          <div className="space-y-4">
            {footerLogo ? (
              <img src={footerLogo} alt="Logo" className="h-8 w-auto object-contain" />
            ) : (
              <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900 mb-4">
                CRAFT GIRLY
              </h3>
            )}
            <p className="text-xs md:text-sm font-normal text-neutral-700 leading-relaxed">
              Premium handmade jewellery, resin crafts, flower preservation, and chocolate boxes. Handcrafted with love.
            </p>
            {/* Social Links Grouped */}
            <div className="flex items-center gap-4.5 pt-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D182B] hover:text-[#4A2040] transition-colors"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D182B] hover:text-[#4A2040] transition-colors"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href={SOCIAL_LINKS.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D182B] hover:text-[#4A2040] transition-colors"
                aria-label="TikTok"
              >
                <TikTokIcon />
              </a>
              <a
                href={SOCIAL_LINKS.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2D182B] hover:text-[#4A2040] transition-colors"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          {/* Shop Col */}
          <div>
            <h4 className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900 mb-4">Shop</h4>
            <ul className="space-y-3 text-[10px] font-bold tracking-widest uppercase">
              <li>
                <Link href="/category/jewellery" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  Bespoke Jewelry
                </Link>
              </li>
              <li>
                <Link href="/category/resin" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  Resin Art & Decor
                </Link>
              </li>
              <li>
                <Link href="/category/chocolate-boxes" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  Luxury Chocolate Boxes
                </Link>
              </li>
              <li>
                <Link href="/category/flower-preservation" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  Floral Preservation
                </Link>
              </li>
              <li>
                <Link href="/category/stationery" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  Aesthetic Stationery
                </Link>
              </li>
              <li>
                <Link href="/category/all-products" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Care Col */}
          <div>
            <h4 className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900 mb-4">Customer Care</h4>
            <ul className="space-y-3 text-[10px] font-bold tracking-widest uppercase">
              <li>
                <Link href="/contact" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-xs md:text-sm font-normal text-neutral-700 hover:text-black py-1 transition-colors block">
                  Search Products
                </Link>
              </li>
            </ul>
          </div>

          {/* Keep in Touch (Newsletter) Col */}
          <div>
            <h4 className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900 mb-4">Newsletter</h4>
            <p className="text-xs md:text-sm text-neutral-700 mb-3">
              Subscribe to receive updates on new custom collections and special offers.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
              <input
                required
                type="email"
                placeholder="YOUR EMAIL ADDRESS"
                className="w-full bg-white border border-[#4A2040] px-3.5 py-2.5 text-xs md:text-sm font-medium text-[#2D182B] focus:outline-none focus:border-[#4A2040] tracking-wider rounded-none"
              />
              <button
                type="submit"
                className="w-full bg-[#4A2040] text-white px-4 py-2.5 text-xs md:text-sm font-medium"
              >
                SUBSCRIBE
              </button>
            </form>
          </div>

        </div>

        <div className="border-t border-[#E8E4DF] my-8 md:my-12"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-normal text-neutral-600">
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