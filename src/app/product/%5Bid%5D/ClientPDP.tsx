'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { trackEvent } from '@/components/PixelTracker';
import { ShoppingBag, ChevronRight, Sparkles, Truck, ShieldCheck, Heart } from 'lucide-react';

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

  // State Management
  const [selectedImage, setSelectedImage] = useState(product.images[0]);
  const [selectedColor, setSelectedColor] = useState(product.attributes.colors[0] || '');
  const [selectedSize, setSelectedSize] = useState(product.attributes.sizes[0] || '');
  const [selectedMaterial, setSelectedMaterial] = useState(product.attributes.materials[0] || '');
  const [engravingText, setEngravingText] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  // Trigger ViewContent marketing event on mount
  useEffect(() => {
    trackEvent('ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.basePrice,
      currency: 'LKR',
    });
  }, [product]);

  const handleAddToCart = () => {
    if (product.personalizationRequired && !engravingText.trim()) {
      setError('Please enter your custom engraving text.');
      return;
    }
    setError('');

    // Track AddToCart event
    trackEvent('AddToCart', {
      content_name: product.name,
      content_ids: [product.id],
      value: product.basePrice * quantity,
      currency: 'LKR',
    });

    // Save product details to localStorage for checkout
    const checkoutItem = {
      productId: product.id,
      name: product.name,
      image: product.images[0],
      price: product.basePrice,
      quantity,
      variantChosen: {
        color: selectedColor,
        size: selectedSize,
        material: selectedMaterial,
        personalizationText: product.personalizationRequired ? engravingText : undefined,
      },
    };

    localStorage.setItem('checkout_item', JSON.stringify(checkoutItem));
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
      {/* 1. Media Gallery */}
      <div className="flex flex-col space-y-4">
        <div className="aspect-square overflow-hidden rounded-3xl bg-neutral-100 border border-rose-100 shadow-sm relative">
          <img
            src={selectedImage}
            alt={product.name}
            className="h-full w-full object-cover object-center transition duration-300"
          />
          {product.stockCount === 0 && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center">
              <span className="bg-neutral-900 text-white font-semibold px-4 py-2 rounded-full text-sm">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail Selector */}
        {product.images.length > 1 && (
          <div className="flex space-x-3 overflow-x-auto pb-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(img)}
                className={`h-20 w-20 overflow-hidden rounded-xl border-2 bg-neutral-100 transition-all duration-200 ${
                  selectedImage === img ? 'border-rose-400 scale-95 shadow-sm' : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img} alt="" className="h-full w-full object-cover object-center" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 2. Product Information & Attributes */}
      <div className="flex flex-col justify-between">
        <div>
          {/* Breadcrumb & Category */}
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider">
            <span>{product.categories.parent}</span>
            <ChevronRight className="h-3.5 w-3.5 text-neutral-300" />
            <span>{product.categories.sub}</span>
          </div>

          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
            {product.name}
          </h1>

          {/* Pricing & Stock badge */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-2xl font-bold text-neutral-950">
              Rs. {product.basePrice.toLocaleString()}.00
            </p>
            {product.stockCount > 0 ? (
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                In Stock ({product.stockCount} left)
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700 ring-1 ring-inset ring-rose-600/20">
                Out of Stock
              </span>
            )}
          </div>

          {/* Product Description */}
          <p className="mt-6 text-base text-neutral-600 leading-relaxed">
            {product.description}
          </p>

          <hr className="my-6 border-rose-100" />

          {/* Attributes Selectors */}
          <div className="space-y-6">
            {/* Color selection */}
            {product.attributes.colors.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-neutral-800">Select Color</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.attributes.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium border transition ${
                        selectedColor === color
                          ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-rose-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size selection */}
            {product.attributes.sizes.length > 0 && (
              <div>
                <span className="text-sm font-semibold text-neutral-800">Select Option</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {product.attributes.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-xl px-4 py-2 text-sm font-medium border transition ${
                        selectedSize === size
                          ? 'border-rose-400 bg-rose-50 text-rose-700 shadow-xs'
                          : 'border-neutral-200 bg-white text-neutral-700 hover:border-rose-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Personalization Box */}
            {product.personalizationRequired && (
              <div className="rounded-2xl border border-rose-100 bg-rose-50/30 p-4">
                <label className="flex items-center text-sm font-semibold text-rose-700 gap-1.5">
                  <Sparkles className="h-4 w-4 text-rose-400" />
                  Custom Engraving Name / Initials
                </label>
                <p className="text-xs text-rose-500 mt-0.5">Please specify the text/name you want engraved on this piece.</p>
                <input
                  type="text"
                  maxLength={40}
                  value={engravingText}
                  onChange={(e) => {
                    setEngravingText(e.target.value);
                    if (e.target.value.trim()) setError('');
                  }}
                  placeholder="e.g. Ama, Nethmi, Always Sparkle..."
                  className="mt-2 w-full rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm text-neutral-800 placeholder-neutral-400 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
                {error && <p className="mt-1 text-xs font-semibold text-rose-600">{error}</p>}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-semibold text-neutral-800">Quantity</span>
              <div className="flex items-center border border-neutral-200 rounded-xl overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 text-neutral-600 hover:bg-neutral-50 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1 text-sm font-semibold text-neutral-900 border-x border-neutral-200">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                  className="px-3 py-1 text-neutral-600 hover:bg-neutral-50 font-bold"
                  disabled={quantity >= product.stockCount}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 space-y-4">
          <button
            onClick={handleAddToCart}
            disabled={product.stockCount === 0}
            className="flex w-full items-center justify-center rounded-2xl bg-rose-500 px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:bg-neutral-300 disabled:cursor-not-allowed hover:scale-[1.01] active:scale-[0.99] transition duration-150"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Order Now (Cash on Delivery)
          </button>

          {/* Quick value badges */}
          <div className="grid grid-cols-2 gap-4 pt-4 text-xs font-medium text-neutral-500">
            <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-rose-50/50">
              <Truck className="h-4 w-4 text-rose-400 shrink-0" />
              <span>Islandwide Delivery (2-5 Days)</span>
            </div>
            <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-rose-50/50">
              <ShieldCheck className="h-4 w-4 text-rose-400 shrink-0" />
              <span>100% Secure COD Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
