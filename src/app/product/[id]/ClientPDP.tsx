'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/components/PixelTracker';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { ShoppingBag, ShoppingCart, ChevronRight, Sparkles, Truck, ShieldCheck, Star, ArrowLeft } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  attributes: {
    colors: string[];
    sizes: string[];
    materials: string[];
  };
  personalizationRequired: boolean;
  stockCount: number;
  isHidden: boolean;
  categories: {
    parent: string;
    sub: string;
  };
}

export default function ClientPDP({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user, setAuthModalOpen } = useAuth();

  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.attributes.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.attributes.sizes[0] || '');
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    trackEvent('ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.basePrice,
      currency: 'LKR',
    });
  }, [product]);

  const variant = [selectedColor, selectedSize].filter(Boolean).join(' / ') || undefined;

  const handleAddToCart = () => {
    if (product.personalizationRequired && !engravingText.trim()) {
      setError('Please enter your custom engraving text.');
      return;
    }
    setError('');

    addToCart({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.images[0],
      quantity,
      variant,
    });

    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.basePrice * quantity,
      currency: 'LKR',
    });

    toast.success(`"${product.name}" added to cart!`);
  };

  const handleBuyNow = () => {
    if (!user) {
      toast.error('Please sign in to place an order.');
      setAuthModalOpen(true);
      return;
    }

    if (product.personalizationRequired && !engravingText.trim()) {
      setError('Please enter your custom engraving text.');
      return;
    }
    setError('');

    addToCart({
      id: product.id,
      name: product.name,
      price: product.basePrice,
      image: product.images[0],
      quantity,
      variant,
    });

    router.push('/checkout');
  };

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6 flex-wrap">
        <Link href="/" className="hover:text-[#442852] transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
        {product.categories.parent && (
          <>
            <span className="capitalize">{product.categories.parent}</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-300" />
          </>
        )}
        <span className="text-[#442852] font-medium line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="flex flex-col space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-gray-100 border border-[#E5E0D8] shadow-sm">
            {!imgLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-2xl" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt={product.name}
              className={`h-full w-full object-cover object-center transition-all duration-500 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImgLoaded(true)}
            />
            {product.stockCount === 0 && (
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="bg-gray-900 text-white font-semibold px-4 py-2 rounded-full text-sm">
                  Out of Stock
                </span>
              </div>
            )}
          </div>

          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedImage(img); setImgLoaded(false); }}
                  className={`h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 bg-gray-100 transition-all ${
                    selectedImage === img ? 'border-[#442852] scale-95 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#B292C7] uppercase tracking-wider">
            <span>{product.categories.parent}</span>
            {product.categories.sub && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
                <span>{product.categories.sub}</span>
              </>
            )}
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#2D2D2D] leading-tight">
            {product.name}
          </h1>

          {/* Rating row */}
          <div className="mt-3 flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-[#B292C7] text-[#B292C7]' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-sm text-gray-500">4.8 (120+ reviews)</span>
          </div>

          {/* Price & Stock */}
          <div className="mt-4 flex items-center gap-4">
            <p className="text-3xl font-bold text-[#442852]">
              Rs. {product.basePrice.toLocaleString()}.00
            </p>
            {product.stockCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
                In Stock ({product.stockCount} left)
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 ring-1 ring-rose-600/20">
                Out of Stock
              </span>
            )}
          </div>

          <p className="mt-4 text-gray-600 leading-relaxed text-sm">{product.description}</p>

          <div className="mt-6 space-y-5">
            {/* Colors */}
            {product.attributes.colors.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-[#2D2D2D] mb-2 block">
                  Color: <span className="font-normal text-gray-500">{selectedColor}</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.attributes.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
                        selectedColor === color
                          ? 'border-[#442852] bg-[#F9F6F0] text-[#442852]'
                          : 'border-[#E5E0D8] bg-white text-gray-600 hover:border-[#CBB0DC]'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.attributes.sizes.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-[#2D2D2D] mb-2 block">Option</span>
                <div className="flex flex-wrap gap-2">
                  {product.attributes.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium border transition ${
                        selectedSize === size
                          ? 'border-[#442852] bg-[#F9F6F0] text-[#442852]'
                          : 'border-[#E5E0D8] bg-white text-gray-600 hover:border-[#CBB0DC]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalization */}
            {product.personalizationRequired && (
              <div className="rounded-2xl border border-[#CBB0DC] bg-[#F9F6F0] p-4">
                <label className="flex items-center text-sm font-semibold text-[#442852] gap-1.5 mb-1">
                  <Sparkles className="h-4 w-4" />
                  Custom Engraving / Personalization
                </label>
                <p className="text-xs text-gray-500 mb-2">Please specify the text/name to engrave on this piece.</p>
                <input
                  type="text"
                  maxLength={40}
                  value={engravingText}
                  onChange={(e) => {
                    setEngravingText(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  placeholder="e.g. Ama, Nethmi, Always Sparkle..."
                  className="w-full rounded-xl border border-[#D1C9C0] bg-white px-3 py-2 text-sm text-[#2D2D2D] focus:border-[#442852] focus:outline-none focus:ring-1 focus:ring-[#442852] transition-all"
                />
                {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-[#2D2D2D]">Quantity</span>
              <div className="flex items-center border border-[#E5E0D8] rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 text-[#442852] hover:bg-[#F9F6F0] font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-5 py-2 text-sm font-semibold text-[#2D2D2D] border-x border-[#E5E0D8]">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="px-4 py-2 text-[#442852] hover:bg-[#F9F6F0] font-bold transition-colors"
                  disabled={quantity >= product.stockCount}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleBuyNow}
              disabled={product.stockCount === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#442852] px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-[#321c3d] focus:outline-none focus:ring-2 focus:ring-[#442852] focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <ShoppingBag className="mr-1 h-5 w-5" />
              Buy Now (Cash on Delivery)
            </button>

            <button
              onClick={handleAddToCart}
              disabled={product.stockCount === 0}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-[#442852] bg-white px-8 py-3.5 text-base font-semibold text-[#442852] hover:bg-[#F9F6F0] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ShoppingCart className="mr-1 h-5 w-5" />
              Add to Cart
            </button>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 bg-[#F9F6F0] rounded-xl p-3 border border-[#E5E0D8]">
                <Truck className="h-4 w-4 text-[#442852] shrink-0" />
                <span className="text-xs font-medium text-gray-600">Islandwide Delivery (2-5 Days)</span>
              </div>
              <div className="flex items-center gap-2 bg-[#F9F6F0] rounded-xl p-3 border border-[#E5E0D8]">
                <ShieldCheck className="h-4 w-4 text-[#442852] shrink-0" />
                <span className="text-xs font-medium text-gray-600">100% Secure COD Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
