'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/components/PixelTracker';
import { fetchAllProducts } from '@/lib/productService';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { Loader2, ArrowRight } from 'lucide-react';
import { fetchLayoutSettings } from '@/lib/layoutService';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'ARTISANAL RESIN CRAFTS',
    title: 'CURED TO PERFECTION',
    description: 'Explore our bespoke custom resin pieces, handmade coasters, and customizable name keychains.',
    link: '/category/resin',
  },
  {
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'ETERNAL PETALS',
    title: 'FLOWER PRESERVATION',
    description: 'Keep your wedding bouquets and anniversary flowers fresh forever inside premium handcrafted resin.',
    link: '/category/flower-preservation',
  },
  {
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'PREMIUM ACCESSORIES',
    title: 'HANDCRAFTED JEWELLERY',
    description: 'Timeless custom engraved jewellery and aesthetic pendants crafted to complement your personal style.',
    link: '/category/jewellery',
  }
];

const CATEGORIES_SHOWCASE = [
  {
    key: 'jewellery',
    label: 'Custom Jewellery',
    count: 'AESTHETIC & HANDCRAFTED',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=600&auto=format&fit=crop',
  },
  {
    key: 'resin',
    label: 'Resin Crafts',
    count: 'KEYCHAINS & LETTERS',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop',
  },
  {
    key: 'stationery',
    label: 'Stationery Items',
    count: 'JOURNALS & WAX SEALS',
    image: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=600&auto=format&fit=crop',
  },
  {
    key: 'flower-preservation',
    label: 'Preservations',
    count: 'WEDDING & EVENT KEEPSAKES',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=600&auto=format&fit=crop',
  }
];

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [heroBanners, setHeroBanners] = useState({
    heroBanner1: '',
    heroBanner2: '',
    heroBanner3: '',
  });

  useEffect(() => {
    fetchLayoutSettings().then((settings) => {
      setHeroBanners({
        heroBanner1: settings.heroBanner1 || '',
        heroBanner2: settings.heroBanner2 || '',
        heroBanner3: settings.heroBanner3 || '',
      });
    });
  }, []);

  const dynamicSlides = useMemo(() => {
    return [
      {
        ...SLIDES[0],
        image: heroBanners.heroBanner1 || SLIDES[0].image,
      },
      {
        ...SLIDES[1],
        image: heroBanners.heroBanner2 || SLIDES[1].image,
      },
      {
        ...SLIDES[2],
        image: heroBanners.heroBanner3 || SLIDES[2].image,
      },
    ];
  }, [heroBanners]);

  // Auto-play hero slider every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dynamicSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dynamicSlides.length]);

  // Fetch trending products
  useEffect(() => {
    fetchAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

  // Viewport scroll reveal logic
  useEffect(() => {
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
  }, [loading]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.price,
      currency: 'LKR',
    });
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen text-[#0A0A0A] selection:bg-[#0A0A0A]/10 selection:text-[#0A0A0A] overflow-hidden">
      
      {/* ─── Hero Section (High-End Auto-Playing Slider) ─── */}
      <section className="relative w-full aspect-[16/7] md:aspect-[16/5] overflow-hidden bg-black rounded-none">
        {dynamicSlides.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
            >
              {/* Background image with Ken Burns */}
              <div className="absolute inset-0 bg-[#0A0A0A] rounded-none">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  priority={idx === 0}
                  className={`object-cover w-full h-full opacity-60 rounded-none ${
                    isActive ? 'hero-img-ken' : ''
                  }`}
                />
              </div>

              {/* Text overlay containing slideUp Animations */}
              {isActive && (
                <div className="absolute inset-0 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8 z-20">
                  <div className="max-w-4xl mx-auto text-center space-y-6">
                    <span className="hero-text-eyebrow block text-xs font-bold tracking-[0.25em] text-[#CBB0DC] uppercase">
                      {slide.eyebrow}
                    </span>
                    <h1 className="hero-text-title text-4xl sm:text-7xl font-extrabold tracking-widest text-white leading-tight uppercase">
                      {slide.title}
                    </h1>
                    <p className="hero-text-sub max-w-xl mx-auto text-[#FAFAF8]/85 text-xs sm:text-sm tracking-widest uppercase leading-relaxed font-bold">
                      {slide.description}
                    </p>
                    <div className="hero-text-cta pt-4">
                      <Link
                        href={slide.link}
                        className="inline-flex items-center justify-center bg-white text-black px-8 py-3.5 text-[10px] font-extrabold tracking-[0.25em] uppercase hover:bg-black hover:text-white border border-white transition-all rounded-none"
                      >
                        EXPLORE COLLECTION
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Slide Indicator Dots */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center gap-3">
          {dynamicSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`w-2.5 h-2.5 border border-white transition-all rounded-none ${
                idx === currentSlide ? 'bg-white scale-110' : 'bg-transparent opacity-50'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ─── Shop by Category Section ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase">CATEGORIES</span>
          <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-[0.2em] uppercase">BROWSE COLLECTIONS</h2>
          <div className="h-[1px] w-12 bg-black mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {CATEGORIES_SHOWCASE.map((cat) => (
            <Link
              key={cat.key}
              href={`/category/${cat.key}`}
              className="group relative aspect-[4/5] w-full overflow-hidden border border-[#E8E4DF] hover:border-black transition-colors duration-300 rounded-none bg-white"
            >
              <Image
                src={cat.image}
                alt={cat.label}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 rounded-none"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[8px] uppercase font-bold tracking-[0.2em] text-[#CBB0DC]">
                  {cat.count}
                </span>
                <h3 className="text-sm font-extrabold uppercase tracking-widest">{cat.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Trending Now Catalog Grid (No scroll animations for speed) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-12 gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase">CURATED LIST</span>
            <h2 className="text-2xl font-bold text-[#0A0A0A] tracking-[0.2em] uppercase">TRENDING PIECES</h2>
          </div>
          <Link
            href="/category/all-products"
            className="flex items-center gap-1 text-[#0A0A0A] font-extrabold text-[10px] uppercase tracking-widest hover:underline"
          >
            View All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-[#0A0A0A]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>

      {/* ─── Custom Editorial Banner (With Scroll Reveal) ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="reveal grid grid-cols-1 lg:grid-cols-2 border border-[#E8E4DF] bg-white rounded-none shadow-sm overflow-hidden">
          
          {/* Left Visual side */}
          <div className="relative aspect-[4/5] lg:aspect-square w-full min-h-[400px]">
            <Image
              src="https://images.unsplash.com/photo-1610996841103-6f8dce4937bb?q=80&w=1200&auto=format&fit=crop"
              alt="Preserved event keepsake"
              fill
              className="object-cover w-full h-full rounded-none"
            />
            <div className="absolute inset-0 bg-[#0A0A0A]/10" />
          </div>
          
          {/* Right Textual editorial story side */}
          <div className="p-8 md:p-16 flex flex-col justify-center space-y-6">
            <span className="text-[10px] font-bold tracking-[0.25em] text-purple-700 uppercase">
              GIFT PRESERVATION
            </span>
            <h2 className="text-xl sm:text-3xl font-bold tracking-[0.18em] text-[#0A0A0A] uppercase leading-snug">
              PRESERVE YOUR SPECIAL MEMORIES
            </h2>
            <div className="h-[1px] w-12 bg-black"></div>
            <p className="text-xs text-gray-500 uppercase tracking-widest leading-loose">
              We preserve wedding bouquets, anniversary flowers, and special event tokens inside custom resin displays, glass domes, and jewelry. Message us to plan your custom keepsake.
            </p>
            <div className="pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-[#0A0A0A] text-white px-8 py-4 text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#222222] transition-colors rounded-none"
              >
                Start Custom Order
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ─── Features Block ─── */}
      <section className="bg-white border-y border-[#E8E4DF] py-16 rounded-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-[0.2em]">Premium Quality</h3>
              <div className="h-[1px] w-6 bg-black mx-auto mt-2"></div>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto uppercase tracking-wider leading-relaxed">
                Handcrafted with carefully curated materials and meticulous attention to details.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-[0.2em]">Islandwide Delivery</h3>
              <div className="h-[1px] w-6 bg-black mx-auto mt-2"></div>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto uppercase tracking-wider leading-relaxed">
                Safe packaging and reliable shipping to your doorstep across all Sri Lankan districts.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-bold text-[#0A0A0A] uppercase tracking-[0.2em]">Cash on Delivery</h3>
              <div className="h-[1px] w-6 bg-black mx-auto mt-2"></div>
              <p className="text-[10px] text-gray-500 max-w-xs mx-auto uppercase tracking-wider leading-relaxed">
                Pay conveniently in Cash only when you receive your handmade craft parcel.
              </p>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}