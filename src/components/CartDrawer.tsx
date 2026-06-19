'use client';

import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useEffect } from 'react';

export default function CartDrawer() {
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();

  // Prevent background scrolling when cart is open
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={() => toggleCart(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300">
          <div className="flex h-full flex-col bg-[#F9F6F0] shadow-xl">
            
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-6 sm:px-6 border-b border-[#E5E0D8]">
              <h2 className="text-xl font-bold text-[#442852] flex items-center gap-2">
                <ShoppingBag className="w-6 h-6" />
                Your Cart
              </h2>
              <button
                type="button"
                className="relative -m-2 p-2 text-gray-400 hover:text-[#442852] transition-colors"
                onClick={() => toggleCart(false)}
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Close panel</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag className="w-16 h-16 text-[#B292C7]" />
                  <p className="text-lg text-gray-500">Your cart is currently empty.</p>
                  <button 
                    onClick={() => toggleCart(false)}
                    className="mt-4 px-6 py-2 bg-[#442852] text-white rounded-full hover:bg-[#B292C7] transition-colors font-medium"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <ul role="list" className="-my-6 divide-y divide-[#E5E0D8]">
                  {cartItems.map((item) => (
                    <li key={`${item.id}-${item.variant || 'base'}`} className="flex py-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-[#E5E0D8] bg-white">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={96}
                          height={96}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col">
                        <div>
                          <div className="flex justify-between text-base font-medium text-[#2D2D2D]">
                            <h3>{item.name}</h3>
                            <p className="ml-4 font-bold text-[#442852]">Rs. {item.price.toLocaleString()}</p>
                          </div>
                          {item.variant && (
                            <p className="mt-1 text-sm text-gray-500">{item.variant}</p>
                          )}
                        </div>
                        <div className="flex flex-1 items-end justify-between text-sm">
                          {/* Quantity Selector */}
                          <div className="flex items-center border border-[#D1C9C0] rounded-md bg-white">
                            <button 
                              onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                              className="px-2 py-1 text-gray-600 hover:text-[#442852] transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-1 text-[#2D2D2D] font-medium border-x border-[#D1C9C0]">
                              {item.quantity}
                            </span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                              className="px-2 py-1 text-gray-600 hover:text-[#442852] transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="flex">
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id, item.variant)}
                              className="font-medium text-[#B292C7] hover:text-[#442852] transition-colors underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer / Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#E5E0D8] px-4 py-6 sm:px-6 bg-white">
                <div className="flex justify-between text-lg font-bold text-[#2D2D2D] mb-4">
                  <p>Subtotal</p>
                  <p className="text-[#442852]">Rs. {cartTotal.toLocaleString()}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500 mb-6">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6">
                  <Link
                    href="/checkout"
                    onClick={() => toggleCart(false)}
                    className="flex items-center justify-center rounded-md border border-transparent bg-[#442852] px-6 py-4 text-base font-medium text-white shadow-sm hover:bg-[#321c3d] transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                </div>
                <div className="mt-6 flex justify-center text-center text-sm text-gray-500">
                  <p>
                    or{' '}
                    <button
                      type="button"
                      className="font-medium text-[#B292C7] hover:text-[#442852] transition-colors"
                      onClick={() => toggleCart(false)}
                    >
                      Continue Shopping
                      <span aria-hidden="true"> &rarr;</span>
                    </button>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
