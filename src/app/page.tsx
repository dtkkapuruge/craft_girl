'use client';

export const dynamic = 'force-dynamic';

import Image from 'next/image';
import { fetchAllCategories, type Category } from '@/lib/categoryService';
import Link from 'next/link';
import { useEffect, useState, useMemo } from 'react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/components/PixelTracker';
import { fetchAllProducts } from '@/lib/productService';
import type { Product } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import { ArrowRight, Star, Truck, Wallet } from 'lucide-react';
import { fetchLayoutSettings, type LayoutSettings } from '@/lib/layoutService';

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

// Static categories removed – now fetched dynamically

export default function Home() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  // New loading flag for hero banners to avoid flashing default images
  const [heroLoading, setHeroLoading] = useState(true);
  const [slideLoaded, setSlideLoaded] = useState<boolean[]>([false, false, false]);

  const [heroBanners, setHeroBanners] = useState({
    heroBanner1: '',
    heroBanner2: '',
    heroBanner3: '',
  });
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetchLayoutSettings().then((settings) => {
      setHeroBanners({
        heroBanner1: settings.heroBanner1 || '',
        heroBanner2: settings.heroBanner2 || '',
        heroBanner3: settings.heroBanner3 || '',
      });
      setLayoutSettings(settings);
      // Hero banners fetched, stop showing placeholder
      setHeroLoading(false);
    });
    fetchAllCategories().then(setCategories);
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

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dynamicSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [dynamicSlides.length]);

  useEffect(() => {
    fetchAllProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  }, []);

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
    <div className="bg-[#FAFAF8] min-h-screen text-brand-text selection:bg-[#AB9266]/20 selection:text-brand-text overflow-hidden">
      
      {heroLoading ? (
        <div className="relative w-full h-screen bg-slate-50 animate-pulse" />
      ) : (
        <section className="relative w-full h-screen overflow-hidden bg-black rounded-none" style={{ aspectRatio: '16/9' }}>
          {dynamicSlides.map((slide, idx) => {
            const isActive = idx === currentSlide;
            return (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
              >
                <div className="absolute inset-0 bg-[#0A0A0A] rounded-none">
                  <Image
                    src={slide.image}
                    alt={slide.title}
                    fill
                    priority={idx === 0}
                    quality={80}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onLoadingComplete={() => {
                      setSlideLoaded((prev) => {
                        const newArr = [...prev];
                        newArr[idx] = true;
                        return newArr;
                      });
                    }}
                    className={`object-cover object-center w-full h-full rounded-none transition-opacity duration-700 ${
                      slideLoaded[idx] ? 'opacity-100' : 'opacity-0'
                    } ${isActive ? 'hero-img-ken' : ''}`}
                  />
                </div>

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
                          className="inline-flex items-center justify-center bg-brand-primary text-white px-8 py-3.5 text-[10px] font-extrabold tracking-[0.25em] uppercase hover:bg-brand-primary/90 hover:text-white border border-white transition-all rounded-none"
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
      )}

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-xl mx-auto mb-14 space-y-2">
          <span className="text-[10px] font-bold tracking-[0.25em] text-gray-400 uppercase">CATEGORIES</span>
          <h2 className="text-2xl font-bold text-brand-primary tracking-[0.2em] uppercase">BROWSE COLLECTIONS</h2>
          <div className="h-[1px] w-12 bg-[#AB9266] mx-auto mt-3"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.key}`}
              className="group relative aspect-[4/5] w-full overflow-hidden border border-[#E8E4DF] hover:border-[#AB9266] transition-colors duration-300 rounded-none bg-white"
            >
              <Image
                src={layoutSettings?.[`category_${cat.key.replace(/-/g, '_')}` as keyof LayoutSettings] || ''}
                alt={cat.label}
                fill
                sizes="(max-width: 768px) 100vw, 25vw"
                className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105 rounded-none"
              />
              <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
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
            <h2 className="text-2xl font-bold text-brand-primary tracking-[0.2em] uppercase">TRENDING PIECES</h2>
          </div>
          <Link
            href="/category/all-products"
            className="flex items-center gap-1 text-brand-primary font-extrabold text-[10px] uppercase tracking-widest hover:underline"
          >
            View All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          // Skeleton grid — same column structure as the real card grid so
          // layout never jumps when live products swap in.
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-white border border-[#E8E4DF] overflow-hidden rounded-none">
                {/* Image placeholder */}
                <div className="aspect-[3/4] w-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-[shimmer_1.4s_infinite]" />
                {/* Text placeholders */}
                <div className="p-4 space-y-2">
                  <div className="h-2 w-1/3 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-neutral-200 rounded animate-pulse mt-2" />
                </div>
              </div>
            ))}
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
              src={layoutSettings?.homepageEditorialBanner || "https://images.unsplash.com/photo-1610996841103-6f8dce4937bb?q=80&w=1200&auto=format&fit=crop"}
              alt="Preserved event keepsake"
              fill
              className="object-cover w-full h-full rounded-none"
            />
            <div className="absolute inset-0 bg-[#0A0A0A]/10" />
          </div>
          
          {/* Right Textual editorial story side */}
          <div className="p-8 md:p-16 flex flex-col justify-center space-y-6">
            <span className="text-[10px] font-bold tracking-[0.25em] text-brand-primary uppercase">
              GIFT PRESERVATION
            </span>
            <h2 className="text-xl sm:text-3xl font-bold tracking-[0.18em] text-brand-primary uppercase leading-snug">
              PRESERVE YOUR SPECIAL MEMORIES
            </h2>
            <div className="h-[1px] w-12 bg-[#AB9266]"></div>
            <p className="text-xs text-gray-500 uppercase tracking-widest leading-loose">
              We preserve wedding bouquets, anniversary flowers, and special event tokens inside custom resin displays, glass domes, and jewelry. Message us to plan your custom keepsake.
            </p>
            <div className="pt-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center bg-[#4A2244] text-white px-8 py-4 text-[10px] font-bold tracking-[0.25em] uppercase hover:bg-[#5C2B54] transition-colors rounded-none"
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
            
            <div className="flex flex-col items-center text-center space-y-3">
  <Star className="w-6 h-6 text-[#AB9266]" />
  <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900">Premium Quality</h3>
  <div className="h-[1px] w-6 bg-[#AB9266] mx-auto mt-2"></div>
  <p className="text-xs md:text-sm font-normal text-neutral-700 leading-relaxed">
    Handcrafted with carefully curated materials and meticulous attention to details.
  </p>
</div>

            <div className="flex flex-col items-center text-center space-y-3">
  <Truck className="w-6 h-6 text-[#AB9266]" />
  <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900">Islandwide Delivery</h3>
  <div className="h-[1px] w-6 bg-[#AB9266] mx-auto mt-2"></div>
  <p className="text-xs md:text-sm font-normal text-neutral-700 leading-relaxed">
    Safe packaging and reliable shipping to your doorstep across all Sri Lankan districts.
  </p>
</div>

            <div className="flex flex-col items-center text-center space-y-3">
  <Wallet className="w-6 h-6 text-[#AB9266]" />
  <h3 className="text-xs md:text-sm font-bold tracking-widest uppercase text-neutral-900">Cash on Delivery</h3>
  <div className="h-[1px] w-6 bg-[#AB9266] mx-auto mt-2"></div>
  <p className="text-xs md:text-sm font-normal text-neutral-700 leading-relaxed">
    Pay conveniently in Cash only when you receive your handmade craft parcel.
  </p>
</div>

          </div>
        </div>
      </section>

    </div>
  );
}