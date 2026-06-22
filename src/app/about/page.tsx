import Link from 'next/link';
import { Heart, Sparkles, Palette, Flower2, Gem, Gift } from 'lucide-react';

export const metadata = {
  title: 'About Us | Craft Girly Store',
  description: 'Handmade art and craft shop specializing in resin items, flower preservation, jewellery, and chocolate boxes.',
};

const SPECIALTIES = [
  { icon: Palette, title: 'Resin Art', desc: 'Custom resin pieces crafted with precision and love.' },
  { icon: Flower2, title: 'Flower Preservation', desc: 'Preserve your precious moments in timeless resin keepsakes.' },
  { icon: Gem, title: 'Handmade Jewellery', desc: 'Unique jewellery pieces with personal touches and custom engravings.' },
  { icon: Gift, title: 'Chocolate Boxes', desc: 'Beautifully curated chocolate boxes for every special occasion.' },
];

export default function AboutPage() {
  return (
    <div className="bg-[#F9F6F0] min-h-screen">
      <section className="relative bg-[#442852] text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-[#CBB0DC]/30 to-transparent" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <p className="text-[#CBB0DC] text-sm font-medium tracking-widest uppercase mb-4">
            Our Story
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Handmade Items 🥰❤️
          </h1>
          <p className="text-lg text-[#E5E0D8] leading-relaxed">
            Welcome to Craft Girly Store — an Art and Craft shop born from passion, creativity, and love for handmade beauty.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white rounded-3xl border border-[#E5E0D8] p-8 md:p-12 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="h-5 w-5 text-[#442852]" />
            <h2 className="text-2xl font-bold text-[#2D2D2D]">Who We Are</h2>
          </div>
          <p className="text-[#2D2D2D] leading-relaxed mb-4">
            Craft Girly Store is a boutique Art and Craft shop based in Sri Lanka, specializing in beautifully handmade items
            that celebrate creativity and personal expression. Every piece we create is crafted with care, attention to detail,
            and a whole lot of love.
          </p>
          <p className="text-[#5A5A5A] leading-relaxed">
            From stunning resin art and preserved flower keepsakes to elegant handmade jewellery and curated chocolate boxes,
            we pour our heart into every creation. Our mission is to bring joy, beauty, and a personal touch to your everyday
            life and special moments.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="text-center mb-10">
          <Sparkles className="h-6 w-6 text-[#442852] mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-[#2D2D2D]">What We Specialize In</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SPECIALTIES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white rounded-2xl border border-[#E5E0D8] p-6 text-center hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#F9F6F0] rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon className="h-5 w-5 text-[#442852]" />
              </div>
              <h3 className="font-bold text-[#2D2D2D] mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white border-t border-[#E5E0D8] py-12">
        <div className="max-w-2xl mx-auto text-center px-4">
          <p className="text-[#442852] font-semibold text-lg mb-4">Ready to explore our handmade collection?</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#442852] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#321c3d] transition-all"
          >
            Shop Now
          </Link>
        </div>
      </section>
    </div>
  );
}
