'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/products';
import { getCategoryLabel } from '@/lib/categories';
<<<<<<< HEAD
import toast from 'react-hot-toast';
=======
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stockCount !== undefined && product.stockCount <= 0;

<<<<<<< HEAD
  const handleAddToCart = () => {
    if (outOfStock) return;
    onAddToCart(product);
    toast.success(`"${product.name}" added to cart!`);
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-[#E5E0D8] overflow-hidden hover:shadow-md transition-all duration-300">
=======
  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-[#E5E0D8] overflow-hidden hover:shadow-md transition-shadow">
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
<<<<<<< HEAD
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
=======
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
        />
        {outOfStock && (
          <span className="absolute top-3 left-3 rounded-full bg-zinc-900/80 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-sm">
            Out of Stock
          </span>
        )}
<<<<<<< HEAD
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="p-4 sm:p-5">
=======
      </Link>

      <div className="p-5">
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
        <div className="flex items-center gap-1 mb-2">
          <Star className="w-4 h-4 fill-[#B292C7] text-[#B292C7]" />
          <span className="text-sm font-medium text-gray-600">{product.rating}</span>
          <span className="text-xs text-gray-400">({product.reviews})</span>
        </div>

        <p className="text-[10px] font-medium uppercase tracking-wider text-[#B292C7] mb-1">
          {getCategoryLabel(product.category)}
        </p>

        <Link href={`/product/${product.id}`}>
<<<<<<< HEAD
          <h3 className="font-bold text-base sm:text-lg text-[#2D2D2D] line-clamp-2 hover:text-[#442852] transition-colors leading-tight">
=======
          <h3 className="font-bold text-lg text-[#2D2D2D] line-clamp-1 hover:text-[#442852] transition-colors">
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
            {product.name}
          </h3>
        </Link>

<<<<<<< HEAD
        <p className="text-[#442852] font-bold text-lg sm:text-xl mt-2 mb-4">
=======
        <p className="text-[#442852] font-bold text-xl mt-2 mb-4">
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
          Rs. {product.price.toLocaleString()}.00
        </p>

        <button
<<<<<<< HEAD
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="w-full flex items-center justify-center gap-2 bg-[#442852] text-white py-2.5 px-4 rounded-xl font-medium hover:bg-[#321c3d] hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#442852] text-sm"
        >
          <ShoppingCart className="w-4 h-4" />
=======
          onClick={() => onAddToCart(product)}
          disabled={outOfStock}
          className="w-full flex items-center justify-center gap-2 bg-[#442852] text-white py-3 px-4 rounded-xl font-medium hover:bg-[#321c3d] hover:shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#442852]"
        >
          <ShoppingCart className="w-5 h-5" />
>>>>>>> 24e10e7af165d9d6fee0db4791fe2a2a8a334ab3
          {outOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
