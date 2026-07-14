'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center px-4 bg-[#FAFAF8]">
      <div className="w-20 h-20 flex items-center justify-center bg-[#F5F3EF] mb-6 border border-[#E8E4DE]">
        <span className="text-[#0A0A0A] font-serif text-3xl tracking-wider">404</span>
      </div>
      <h1 className="text-3xl font-serif font-normal text-[#0A0A0A] tracking-wide sm:text-4xl uppercase">
        Page Not Found
      </h1>
      <p className="mt-4 text-sm text-[#6B6B6B] max-w-md mx-auto leading-relaxed tracking-wide">
        The page or product you&apos;re looking for may have been moved, removed, or doesn&apos;t exist.
      </p>
      <div className="mt-8">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 bg-[#0A0A0A] px-8 py-3.5 text-xs font-medium text-white uppercase tracking-[0.15em] hover:bg-[#1a1a1a] active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Shop
        </Link>
      </div>
    </div>
  );
}
