'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { fetchLayoutSettings } from '@/lib/layoutService';

const SPECIALTIES = [
  { title: 'RESIN ARTISTRY', desc: 'Custom curated resin works shaped with artistic precision.' },
  { title: 'FLOWER KEEPSAKES', desc: 'Preserving wedding and event florals in clear, enduring resin.' },
  { title: 'HANDMADE ACCENTS', desc: 'Bespoke custom engravings and personal style-focused jewelry.' },
  { title: 'CURATED BOXES', desc: 'Stunningly packaged gift selections tailored for your occasions.' },
];

export default function AboutPage() {
  const [aboutImage, setAboutImage] = useState('https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=800&auto=format&fit=crop');
  
  // Set up intersection observer for scroll reveals
  useEffect(() => {
    fetchLayoutSettings().then((settings) => {
      if (settings.aboutUsImage) setAboutImage(settings.aboutUsImage);
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <div className="bg-[#FAFAF8] min-h-screen text-[#0A0A0A] selection:bg-[#0A0A0A]/10 selection:text-[#0A0A0A]">
      
      {/* ─── Hero Header Strip ─── */}
      <section className="border-b border-[#E8E4DF] bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#9B9B9B] uppercase">
            WHO WE ARE
          </span>
          <h1 className="text-2xl md:text-4xl font-bold tracking-[0.2em] uppercase text-[#0A0A0A]">
            CRAFT GIRLY STUDIO
          </h1>
          <div className="h-[1px] w-12 bg-black mx-auto"></div>
          <p className="text-xs uppercase tracking-widest text-[#6B6B6B] leading-relaxed max-w-xl mx-auto">
            A premium Sri Lankan studio dedicated to resin craftsmanship, memory preservation, and fine handmade creations.
          </p>
        </div>
      </section>

      {/* ─── Editorial Split-Screen Story Section (Usha's Style) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Large Rectangular Image (Reveals left to right) */}
          <div className="reveal-left relative h-[450px] sm:h-[600px] border border-[#E8E4DF] bg-white">
            <Image
              src={aboutImage}
              alt="Premium Resin Craftsmanship"
              fill
              className="object-cover rounded-none"
            />
          </div>

          {/* Right Column: Editorial Text Blocks (Staggered scroll reveal) */}
          <div className="space-y-12">
            
            <div className="reveal reveal-d1 space-y-4">
              <span className="text-[9px] font-bold tracking-[0.3em] text-gray-405 text-gray-400">01 / BRAND MISSION</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-[#0A0A0A]">
                THE ART OF PRESERVATION
              </h2>
              <div className="h-[1px] w-8 bg-black"></div>
              <p className="text-xs uppercase tracking-widest leading-loose text-[#6B6B6B]">
                Craft Girly Store is a boutique studio specializing in transforming transient life moments into solid keepsakes. We preserve bridal bouquets, anniversary florals, and memorable tokens inside premium, optical-grade resin that prevents yellowing.
              </p>
            </div>

            <div className="reveal reveal-d2 space-y-4">
              <span className="text-[9px] font-bold tracking-[0.3em] text-gray-400">02 / CRAFTSMANSHIP</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-[0.2em] uppercase text-[#0A0A0A]">
                HANDCRAFTED WITH LOVE
              </h2>
              <div className="h-[1px] w-8 bg-black"></div>
              <p className="text-xs uppercase tracking-widest leading-loose text-[#6B6B6B]">
                Every single piece we design undergoes a meticulous curing, polishing, and setting cycle inside our studio. From initial flower drying to final resin curing, we pay absolute attention to detail, bubble removal, and structural clarity.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ─── Specialties Grid (Minimalist list cards) ─── */}
      <section className="border-t border-[#E8E4DF] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16 space-y-2">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#9B9B9B] uppercase">STUDIO STRENGTHS</span>
          <h2 className="text-2xl font-bold tracking-[0.2em] text-[#0A0A0A] uppercase">OUR AREAS OF EXPERTISE</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPECIALTIES.map(({ title, desc }) => (
            <div key={title} className="bg-white border border-[#E8E4DF] p-8 space-y-4 hover:border-black transition-colors duration-300 rounded-none text-left">
              <div className="h-[1px] w-6 bg-black"></div>
              <h3 className="font-extrabold text-xs tracking-widest text-[#0A0A0A] uppercase">{title}</h3>
              <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wider leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="bg-white border-t border-[#E8E4DF] py-16">
        <div className="max-w-2xl mx-auto text-center px-4 space-y-6">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6B6B6B]">
            DISCOVER THE FULL HANDMADE CATALOGUE
          </p>
          <div className="pt-2">
            <Link
              href="/category/all-products"
              className="inline-flex items-center justify-center bg-[#0A0A0A] text-white px-10 py-4 text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#222222] transition-colors rounded-none"
            >
              SHOP NEW RELEASES
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
