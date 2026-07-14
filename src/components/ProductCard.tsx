'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/products';
import { getCategoryLabel } from '@/lib/categories';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const outOfStock = product.stockCount !== undefined && product.stockCount <= 0;

  const handleAddToCart = () => {
    if (outOfStock) return;
    onAddToCart(product);
    toast.success(`"${product.name}" added to cart!`);
  };

  return (
    <div className="group bg-white border border-[#E8E4DF] overflow-hidden hover:border-[#0A0A0A] transition-colors duration-300 flex flex-col h-full rounded-none">
      {/* Image Container with sliding Quick Add bar */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[3/4] w-full overflow-hidden bg-neutral-50 shrink-0 rounded-none">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 rounded-none"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />
        {outOfStock && (
          <span className="absolute top-3 left-3 bg-[#0A0A0A] px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-[#FAFAF8] rounded-none">
            Out of Stock
          </span>
        )}
        
        {/* Quick Add Bar - slides up on hover, visible by default on mobile touch screens */}
        {outOfStock ? (
          <div className="quick-add-bar out-of-stock lg:translate-y-[100%] lg:group-hover:translate-y-0 transition-transform duration-300 rounded-none">
            Out of Stock
          </div>
        ) : (
          <div
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleAddToCart();
            }}
            className="quick-add-bar lg:translate-y-[100%] lg:group-hover:translate-y-0 transition-transform duration-300 rounded-none"
          >
            Quick Add +
          </div>
        )}
      </Link>

      {/* Product Information */}
      <div className="p-4 flex flex-col flex-grow justify-between bg-white rounded-none">
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#9B9B9B] mb-1.5">
            {getCategoryLabel(product.category)}
          </p>

          <Link href={`/product/${product.id}`}>
            <h3 className="font-bold text-xs text-[#0A0A0A] uppercase tracking-wider line-clamp-2 hover:text-[#442852] transition-colors leading-relaxed">
              {product.name}
            </h3>
          </Link>
        </div>

        <p className="text-[#0A0A0A] font-semibold text-xs mt-2 uppercase tracking-widest">
          LKR {product.price.toLocaleString()}
        </p>
      </div>
    </div>
  );
}