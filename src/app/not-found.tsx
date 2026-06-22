'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center px-4 bg-[#FDFBF7]">
      <div className="w-20 h-20 rounded-full flex items-center justify-center bg-[#F9F6F0] mb-6 border border-[#E5E0D8] shadow-sm">
        <span className="text-[#442852] font-extrabold text-2xl">404</span>
      </div>
      <h1 className="text-3xl font-extrabold text-[#2D2D2D] tracking-tight sm:text-4xl">
        Product or Page Not Found
      </h1>
      <p className="mt-4 text-base text-gray-500 max-w-md mx-auto leading-relaxed">
        Sorry, we couldn't find the page or product you're looking for. It might have been moved, deleted, or doesn't exist.
      </p>
      <div className="mt-8">
        <Link
          href="/home"
          className="inline-flex items-center gap-2 rounded-2xl bg-[#442852] px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-[#321c3d] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Shop Home
        </Link>
      </div>
    </div>
  );
}
