'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Product } from '@/lib/products';
import Link from 'next/link';
import { ArrowDownAZ, ArrowUpAZ, Clock, Search, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { trackEvent } from '@/components/PixelTracker';
import { useState, useMemo, useEffect } from 'react';
import { fetchAllProducts } from '@/lib/productService';
import { resolveCategorySlug, getCategoryLabel } from '@/lib/categories';
import ProductCard from '@/components/ProductCard';
import { fetchLayoutSettings, type LayoutSettings } from '@/lib/layoutService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface CategoryMetadata {
  heroImage: string;
  eyebrow: string;
  label: string;
  introText: string;
  storyColumns: {
    title: string;
    text: string;
  }[];
}

const CATEGORY_META_CONFIG: Record<string, CategoryMetadata> = {
  resin: {
    heroImage: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'ARTISANAL DECOR',
    label: 'Resin Art & Decor',
    introText: 'Explore botanical letters, hand-cured coasters, and statement serving trays designed to introduce organic luxury into your daily rituals.',
    storyColumns: [
      {
        title: 'OPTICAL EPOXY',
        text: 'Every creation is hand-cured over 48 hours using high-grade, UV-resistant optical epoxy to achieve glass-like clarity.'
      },
      {
        title: 'BOTANICAL INFUSION',
        text: 'We carefully dehydrate and press native blooms, encapsulating their natural patterns inside liquid glass forever.'
      },
      {
        title: 'BESPOKE FINISHING',
        text: 'Each piece undergoes fine-grit wet sanding and hand polishing for a flawless, sharp, architectural bevel.'
      }
    ]
  },
  jewellery: {
    heroImage: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'FINE JEWELRY',
    label: 'Bespoke Jewelry',
    introText: 'Discover timeless beaded chains, personalized letter pendants, and floral locks designed to celebrate intimate personal narratives.',
    storyColumns: [
      {
        title: 'STERLING SILVER',
        text: 'Crafted with premium metals and raw semi-precious stones selected for their individual color profiles and light-refraction.'
      },
      {
        title: 'HAND-ENGRAVING',
        text: 'Custom monograms, initials, and date marks are carefully engraved using traditional metal-cutting hand tools.'
      },
      {
        title: 'MINIMAL DESIGN',
        text: 'Every ring, necklace, and bracelet balances minimal forms with delicate details for daily, effortless wear.'
      }
    ]
  },
  'chocolate-boxes': {
    heroImage: 'https://images.unsplash.com/photo-1549007994-cb92ca817b7a?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'FINE CONFECTIONS',
    label: 'Luxury Chocolate Boxes',
    introText: 'Indulge in artisanal chocolate truffles, hand-painted bonbons, and custom flavor assortments beautifully presented in custom linen boxes.',
    storyColumns: [
      {
        title: 'SINGLE-ORIGIN COCOA',
        text: 'We select ethically sourced single-origin cocoa beans from certified estates, roasting them in small batches for complex notes.'
      },
      {
        title: 'ARTISANAL FLAVORS',
        text: 'Infused with native herbs, organic floral distillates, and roasted nuts, balancing textures and sweetness.'
      },
      {
        title: 'LUXURY PACKAGING',
        text: 'Delivered in rigid, hand-assembled linen-wrapped boxes, complete with custom foil-stamped greeting messages.'
      }
    ]
  },
  'flower-preservation': {
    heroImage: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'ETERNAL BLOOMS',
    label: 'Floral Preservation',
    introText: 'Preserve wedding bouquets, anniversary flowers, or sentimental arrangements forever in architectural blocks and modern faceted crystal domes.',
    storyColumns: [
      {
        title: 'DESICCANT DRYING',
        text: 'Flowers are dried using customized granular silica formulas, retaining their natural 3D contours and color vibrance.'
      },
      {
        title: 'LAYERED CASTING',
        text: 'Liquid glass is poured in precise, microscopic layers to prevent overheating and lines, ensuring absolute transparent clarity.'
      },
      {
        title: 'KEEPSAKE ART',
        text: 'A permanent, emotional sculpture that acts as a living archive of your most cherished life milestones and celebrations.'
      }
    ]
  },
  handmade: {
    heroImage: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'ARTISANAL DECOR',
    label: 'Artisanal Keepsakes',
    introText: 'Celebrate fine details with custom photo displays, hand-stitched leather envelopes, and woven linen decorations crafted by local artisans.',
    storyColumns: [
      {
        title: 'RAW MATERIALISM',
        text: 'We source sustainable solid wood, organic cotton threads, and natural clays for an earthy, honest touch.'
      },
      {
        title: 'ONE-OFF CASTS',
        text: 'No two items are ever identical; every piece carries signature tool marks and texture variations of the creator.'
      },
      {
        title: 'SENTIMENTAL VALUE',
        text: 'Each keepsake acts as a bridge of memory, tailored to be passed down through generations as heirloom artifacts.'
      }
    ]
  },
  stationery: {
    heroImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1920&auto=format&fit=crop',
    eyebrow: 'MINIMALIST SCRIBES',
    label: 'Aesthetic Stationery',
    introText: 'Premium cotton-blend notebook journals, hand-cut botanical paper sheets, and custom monogram wax sealing kits for slow correspondence.',
    storyColumns: [
      {
        title: 'COTTON RAG PAPERS',
        text: 'Our journals feature acid-free, heavy cotton rag papers, hand-pressed and deckled for archival ink absorption.'
      },
      {
        title: 'WAX ENGRAVINGS',
        text: 'Custom stamps are solid brass, CNC-machined to sharp geometric tolerances for clean wax seals.'
      },
      {
        title: 'MINIMAL UTILITY',
        text: 'Stripped of unnecessary details, our stationary emphasizes clean layouts, high tracking grid lines, and classic styling.'
      }
    ]
  },
};

const DEFAULT_META: CategoryMetadata = {
  heroImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?q=80&w=1920&auto=format&fit=crop',
  eyebrow: 'BOUTIQUE COLLECTION',
  label: 'Craft Girly Creations',
  introText: 'Discover our premium, hand-assembled catalogue of artisanal items, curated to elevate your lifestyle with bespoke quality.',
  storyColumns: [
    {
      title: 'ARTISANAL ETHOS',
      text: 'Every item is created by hand in small, deliberate batches, avoiding mass manufacture in favor of true craft.'
    },
    {
      title: 'TAILORED DETAILS',
      text: 'We customize engravings, colors, and botanical contents to build a product unique to your home and story.'
    },
    {
      title: 'LOCAL COMMERCE',
      text: 'By supporting our workshop, you directly empower local handcraft practitioners and sustainable material sourcing.'
    }
  ]
};

const SLUG_TO_SETTING_KEY: Record<string, keyof LayoutSettings> = {
  resin: 'category_resin',
  jewellery: 'category_jewellery',
  'chocolate-boxes': 'category_chocolate_boxes',
  'flower-preservation': 'category_flower_preservation',
  handmade: 'category_handmade',
  stationery: 'category_stationery',
};

export default function CategoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSubFilter, setActiveSubFilter] = useState<'all' | 'best' | 'new'>('all');
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>({});
  const [salesMap, setSalesMap] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchLayoutSettings().then((settings) => {
      setLayoutSettings(settings);
    });
  }, []);

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const map: Record<string, number> = {};
        snap.forEach(doc => {
          const data = doc.data();
          const items = Array.isArray(data.items) ? data.items : [];
          items.forEach(item => {
            const key = item.name || item.productId;
            if (key) {
              map[key] = (map[key] || 0) + (Number(item.quantity) || 1);
            }
          });
        });
        setSalesMap(map);
      } catch (err) {
        console.error('Failed to fetch sales data:', err);
      }
    };
    fetchSales();
  }, []);

  useEffect(() => {
    fetchAllProducts().then((data) => {
      setAllProducts(data);
      setLoading(false);
    });
  }, []);

  const resolvedSlug = resolveCategorySlug(slug);
  const categoryName = slug === 'all-products' || slug === 'all' ? 'All Products' : getCategoryLabel(resolvedSlug);

  // Retrieve rich metadata based on slug
  const meta = useMemo(() => {
    return CATEGORY_META_CONFIG[resolvedSlug] || CATEGORY_META_CONFIG[slug] || {
      ...DEFAULT_META,
      label: categoryName
    };
  }, [resolvedSlug, slug, categoryName]);

  const bannerImage = useMemo(() => {
    const settingKey = SLUG_TO_SETTING_KEY[resolvedSlug] || SLUG_TO_SETTING_KEY[slug];
    if (settingKey && layoutSettings[settingKey]) {
      return layoutSettings[settingKey] as string;
    }
    return meta.heroImage;
  }, [resolvedSlug, slug, layoutSettings, meta.heroImage]);

  const baseProducts = useMemo(
    () => {
      if (slug === 'all-products' || slug === 'all') {
        return allProducts;
      }
      return allProducts.filter((p) => p.category === resolvedSlug || p.category === slug);
    },
    [allProducts, resolvedSlug, slug]
  );

  // Apply Sub-navigation filtering (All Creations | Best Sellers | New In)
  const subFilteredProducts = useMemo(() => {
    if (activeSubFilter === 'best') {
      // Sort by sales count if available, otherwise fallback to rating then reviews then id
      return [...baseProducts].sort((a, b) => {
        const salesA = salesMap[a.name] ?? salesMap[a.id] ?? 0;
        const salesB = salesMap[b.name] ?? salesMap[b.id] ?? 0;
        if (salesA !== salesB) return salesB - salesA;
        const ratingA = (a as any).rating ?? 0;
        const ratingB = (b as any).rating ?? 0;
        if (ratingA !== ratingB) return ratingB - ratingA;
        const reviewsA = (a as any).reviews ?? 0;
        const reviewsB = (b as any).reviews ?? 0;
        if (reviewsA !== reviewsB) return reviewsB - reviewsA;
        // As final fallback, sort by numeric part of id (higher means newer)
        const idNumA = parseInt(a.id.replace(/\D+/g, ''), 10) || 0;
        const idNumB = parseInt(b.id.replace(/\D+/g, ''), 10) || 0;
        return idNumB - idNumA;
      });
    }
    if (activeSubFilter === 'new') {
      // Sort by creation time if present, otherwise fall back to numeric id descending (newest first)
      return [...baseProducts].sort((a, b) => {
        const createdA = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
        const createdB = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
        if (createdA !== createdB) return createdB - createdA;
        const idNumA = parseInt(a.id.replace(/\D+/g, ''), 10) || 0;
        const idNumB = parseInt(b.id.replace(/\D+/g, ''), 10) || 0;
        return idNumB - idNumA;
      });
    }
    // Default: return base list (no additional sorting/filtering)
    return baseProducts;
  }, [baseProducts, activeSubFilter, salesMap]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return subFilteredProducts;
    return subFilteredProducts.filter((p) =>
      `${p.name} ${p.description ?? ''}`.toLowerCase().includes(q)
    );
  }, [subFilteredProducts, searchQuery]);

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    if (sortBy === 'price-asc') return products.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') return products.sort((a, b) => b.price - a.price);
    return products.sort((a, b) => b.id.localeCompare(a.id));
  }, [filteredProducts, sortBy]);

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
    <div className="bg-[#FAFAF8] min-h-screen text-[#0A0A0A] selection:bg-[#442852]/10 selection:text-[#442852]">
      
      {/* 1. Immersive Luxury Hero Banner */}
      <section className="relative h-[40vh] md:h-[48vh] w-full flex items-center justify-center bg-[#0A0A0A] overflow-hidden">
        <Image
          src={bannerImage}
          alt={meta.label}
          fill
          priority
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A]/50 via-transparent to-[#0A0A0A]/20" />
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4 space-y-3">
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#CBB0DC] uppercase">
            {meta.eyebrow}
          </span>
          <h1 className="text-3xl sm:text-5xl font-normal text-white tracking-[0.25em] uppercase font-serif">
            {meta.label}
          </h1>
        </div>
      </section>

      {/* 2. Storytelling Divider */}
      <section className="bg-[#FAFAF8] border-b border-[#442852]/20 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Elegant italicized intro block */}
          <p className="text-center text-sm md:text-base font-serif italic text-[#442852] max-w-3xl mx-auto leading-relaxed tracking-wide">
            &ldquo;{meta.introText}&rdquo;
          </p>

          {/* Three-column craftsmanship stories */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#442852]/15">
            {meta.storyColumns.map((col, idx) => (
              <div key={idx} className="space-y-3 pl-4 border-l border-[#442852]/20 md:border-l md:first:border-l-0 md:pl-8 first:border-l-0">
                <h4 className="text-[9px] font-bold tracking-[0.25em] text-[#442852] uppercase">
                  {col.title}
                </h4>
                <p className="text-xs text-[#6B6B6B] leading-relaxed uppercase tracking-wider font-medium">
                  {col.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Product Catalog & Controls */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* 3. Sleek, Minimal Sub-navigation Filtering Bar */}
        <div className="flex justify-center border-b border-[#E8E4DF] pb-3 mb-10">
          <div className="flex items-center gap-8 text-[9px] font-bold uppercase tracking-[0.22em]">
            <button
              onClick={() => setActiveSubFilter('all')}
              className={`pb-3 transition-all relative ${
                activeSubFilter === 'all'
                  ? 'text-[#442852]'
                  : 'text-gray-400 hover:text-[#0A0A0A]'
              }`}
            >
              All Creations
              {activeSubFilter === 'all' && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#442852]" />
              )}
            </button>
            <button
              onClick={() => setActiveSubFilter('best')}
              className={`pb-3 transition-all relative ${
                activeSubFilter === 'best'
                  ? 'text-[#442852]'
                  : 'text-gray-400 hover:text-[#0A0A0A]'
              }`}
            >
              Best Sellers
              {activeSubFilter === 'best' && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#442852]" />
              )}
            </button>
            <button
              onClick={() => setActiveSubFilter('new')}
              className={`pb-3 transition-all relative ${
                activeSubFilter === 'new'
                  ? 'text-[#442852]'
                  : 'text-gray-400 hover:text-[#0A0A0A]'
              }`}
            >
              New In
              {activeSubFilter === 'new' && (
                <span className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[#442852]" />
              )}
            </button>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="relative w-full sm:max-w-xs rounded-none">
            <input
              type="text"
              placeholder={`SEARCH IN ${categoryName.toUpperCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 py-2.5 rounded-none border border-[#C4BFBA] bg-white text-[10px] font-semibold text-[#0A0A0A] placeholder-gray-400 focus:outline-none focus:border-[#442852] tracking-wider uppercase transition-all"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#442852] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
              {loading ? 'LOADING…' : `${sortedProducts.length} PRODUCT${sortedProducts.length !== 1 ? 'S' : ''}`}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-[9px] font-bold uppercase tracking-wider text-gray-400">SORT:</label>
              <div className="relative rounded-none">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc')}
                  className="appearance-none bg-white border border-[#C4BFBA] text-[#0A0A0A] py-2 pl-4 pr-10 rounded-none focus:outline-none focus:border-[#442852] font-semibold text-[10px] uppercase tracking-wider"
                >
                  <option value="newest">Newest Arrivals</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#442852]">
                  {sortBy === 'newest' ? <Clock className="w-3.5 h-3.5" /> : sortBy === 'price-asc' ? <ArrowUpAZ className="w-3.5 h-3.5" /> : <ArrowDownAZ className="w-3.5 h-3.5" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          // Skeleton grid — same column layout as real product cards so the
          // page height is stable and there is zero flash when data arrives.
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col bg-white border border-[#E8E4DF] overflow-hidden rounded-none">
                <div className="aspect-[3/4] w-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-[shimmer_1.4s_infinite]" />
                <div className="p-4 space-y-2">
                  <div className="h-2 w-1/3 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-3 w-1/2 bg-neutral-200 rounded animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="text-center py-20">
            <Search className="h-8 w-8 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
              {searchQuery 
                ? 'No creations match your search query.' 
                : `No creations found in the "${categoryName}" category.`}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-3 text-xs text-[#442852] font-bold uppercase tracking-widest hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
