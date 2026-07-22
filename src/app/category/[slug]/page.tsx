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
  const [activeTab, setActiveTab] = useState<'all' | 'bestseller' | 'new'>('all');
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

      const sanitize = (str: string) => (str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const sanitizedSlug = sanitize(slug);
      const sanitizedResolved = sanitize(resolvedSlug);

      // Build a robust set of matching strings to compare against product.category
      const validMatches = new Set<string>([
        slug, resolvedSlug, sanitizedSlug, sanitizedResolved
      ]);

      // Cross-reference with our config to catch label matches (e.g. "luxury-chocolate-boxes" -> "chocolate-boxes")
      Object.entries(CATEGORY_META_CONFIG).forEach(([key, meta]) => {
        const sKey = sanitize(key);
        const sLabel = sanitize(meta.label);

        if (sKey === sanitizedSlug || sLabel === sanitizedSlug || sKey === sanitizedResolved || sLabel === sanitizedResolved) {
          validMatches.add(key);
          validMatches.add(sKey);
          validMatches.add(meta.label);
          validMatches.add(sLabel);
        }
      });

      return allProducts.filter((p) => {
        const pc = p.category || '';
        const pcSanitized = sanitize(pc);

        if (validMatches.has(pc) || validMatches.has(pcSanitized)) return true;

        // Fallback: Check for multi-word inclusion if one is a substring of another
        for (const match of Array.from(validMatches)) {
          if (match.length > 4 && (pcSanitized.includes(match) || match.includes(pcSanitized))) {
            return true;
          }
        }

        return false;
      });
    },
    [allProducts, resolvedSlug, slug]
  );

  // Apply Sub-navigation filtering (All Creations | Best Sellers | New In)
  const subFilteredProducts = useMemo(() => {
    if (activeTab === 'bestseller') {
      // Filter for Best Sellers: products where isBestSeller is true, tag is bestseller, or tag contains bestseller
      const filtered = baseProducts.filter(
        (p) =>
          (p as any).isBestSeller === true ||
          (p as any).isBestseller === true ||
          (p as any).tag === 'bestseller' ||
          (p as any).tags?.includes('bestseller')
      );
      if (filtered.length > 0) return filtered;

      // Fallback: Products with sales > 0 or rating >= 4.8
      return baseProducts.filter((p) => {
        const sales = salesMap[p.name] ?? salesMap[p.id] ?? 0;
        return sales > 0 || (p.rating && p.rating >= 4.8);
      });
    }
    if (activeTab === 'new') {
      // Filter for New In: products where isNew is true, or newest items sorting
      const explicitNewItems = baseProducts.filter((p) => (p as any).isNew === true);
      if (explicitNewItems.length > 0) {
        return explicitNewItems;
      }
      return [...baseProducts].sort((a, b) => {
        const getTime = (item: any) => {
          if (item.createdAt?.seconds) return item.createdAt.seconds * 1000;
          if (item.createdAt?._seconds) return item.createdAt._seconds * 1000;
          if (item.createdAt) return new Date(item.createdAt).getTime();
          return 0;
        };
        return getTime(b) - getTime(a);
      });
    }
    // Default: return base list (no additional sorting/filtering)
    return baseProducts;
  }, [baseProducts, activeTab, salesMap]);

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
  const displayedProducts = sortedProducts;

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
          <div className="flex items-center gap-6 md:gap-8 text-xs md:text-sm tracking-wider uppercase">
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-2 transition-colors ${
                activeTab === 'all'
                  ? 'border-b-2 border-black font-semibold text-neutral-900'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              All Creations
            </button>
            <button
              onClick={() => setActiveTab('bestseller')}
              className={`pb-2 transition-colors ${
                activeTab === 'bestseller'
                  ? 'border-b-2 border-black font-semibold text-neutral-900'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              Best Sellers
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`pb-2 transition-colors ${
                activeTab === 'new'
                  ? 'border-b-2 border-black font-semibold text-neutral-900'
                  : 'text-neutral-500 hover:text-black'
              }`}
            >
              New In
            </button>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4">
          <div className="relative w-full sm:max-w-xs py-2.5 px-4 rounded-md border border-neutral-200 focus-within:border-neutral-900">
            <input
              type="text"
              placeholder={`SEARCH IN ${categoryName.toUpperCase()}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-9 bg-white text-xs md:text-sm font-normal text-neutral-800 placeholder:text-neutral-400 focus:outline-none"
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
            <p className="text-xs md:text-sm font-medium text-neutral-700 tracking-wide">
              {loading ? 'LOADING…' : `${displayedProducts.length} PRODUCT${displayedProducts.length !== 1 ? 'S' : ''}`}
            </p>

            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-[9px] font-bold uppercase tracking-wider text-gray-400">SORT:</label>
              <div className="relative rounded-none">
                <select
                  id="sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'price-asc' | 'price-desc')}
                  className="appearance-none bg-white border border-neutral-300 text-neutral-800 py-2 px-4 rounded-md text-sm font-medium focus:outline-none focus:border-neutral-400"
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
            {displayedProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
