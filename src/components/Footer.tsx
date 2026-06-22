'use client';

import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#2D1B3D] border-t border-[#442852]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#CBB0DC] rounded-full flex items-center justify-center">
                <span className="text-[#2D1B3D] font-bold text-sm">CG</span>
              </div>
              <h3 className="font-bold text-xl text-white">Craft Girly Store</h3>
            </div>
            <p className="text-sm text-[#CBB0DC]/80 leading-relaxed mb-4">
              Premium handmade jewellery, resin crafts, flower preservation, and chocolate boxes. Handcrafted with love 🥰❤️
            </p>
            {/* Facebook Round Button */}
            <a
              href="https://www.facebook.com/profile.php?id=100086577828998"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="inline-flex w-10 h-10 bg-[#442852] rounded-full items-center justify-center text-[#CBB0DC] hover:bg-[#CBB0DC] hover:text-[#2D1B3D] transition-all"
            >
              {/* Custom SVG Facebook Icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
              </svg>
            </a>
          </div>

          <div>
            <h4 className="font-bold text-[#CBB0DC] mb-6 text-sm uppercase tracking-wider">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/category/jewellery" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  Jewellery
                </Link>
              </li>
              <li>
                <Link href="/category/resin" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  Resin Crafts
                </Link>
              </li>
              <li>
                <Link href="/category/chocolate-boxes" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  Chocolate Boxes
                </Link>
              </li>
              <li>
                <Link href="/category/stationery" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  Stationery
                </Link>
              </li>
              <li>
                <Link href="/" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#CBB0DC] mb-6 text-sm uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/contact" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  Search Products
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#CBB0DC] mb-6 text-sm uppercase tracking-wider">Keep in Touch</h4>
            <div className="space-y-4">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#CBB0DC] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-[#E5E0D8]/80">
                  <p>244/B Deheragoda Ellawala,</p>
                  <p>Eheliyagoda, Sri Lanka, 70606</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-[#CBB0DC] flex-shrink-0 mt-0.5" />
                <a href="tel:+94766722187" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  076 672 2187
                </a>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-[#CBB0DC] flex-shrink-0 mt-0.5" />
                <a href="mailto:hello@craftgirly.lk" className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors">
                  hello@craftgirly.lk
                </a>
              </div>
              <div className="flex gap-3">
                {/* Inline SVG for Facebook List Item */}
                <svg className="w-5 h-5 text-[#CBB0DC] flex-shrink-0 mt-0.5 fill-current" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                </svg>
                <a
                  href="https://www.facebook.com/profile.php?id=100086577828998"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#E5E0D8]/80 hover:text-white transition-colors"
                >
                  Facebook Page
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-[#442852] my-8 md:my-12"></div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#CBB0DC]/60">
            © {currentYear} Craft Girly Store. All rights reserved.
          </p>
          <p className="text-xs text-[#CBB0DC]/40">
            Handmade items 🥰❤️
          </p>
        </div>
      </div>
    </footer>
  );
}