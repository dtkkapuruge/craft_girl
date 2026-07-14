'use client';

import { X, Plus, Minus, ShoppingBag, Gift } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function CartDrawer() {
  const router = useRouter();
  const { isCartOpen, toggleCart, cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [isGifting, setIsGifting] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftPackaging, setGiftPackaging] = useState('signature-wax');

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
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={() => toggleCart(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform transition-transform ease-in-out duration-300">
          <div className="flex h-full flex-col bg-white shadow-xl rounded-none">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#E8E4DF]">
              <h2 className="text-xs font-bold text-[#0A0A0A] flex items-center gap-2 uppercase tracking-[0.2em]">
                <ShoppingBag className="w-4.5 h-4.5" />
                YOUR CART
              </h2>
              <button
                type="button"
                className="relative -m-2 p-2 text-gray-400 hover:text-[#0A0A0A] transition-colors rounded-none"
                onClick={() => toggleCart(false)}
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <ShoppingBag className="w-12 h-12 text-[#9B9B9B]" />
                  <p className="text-xs font-bold uppercase tracking-widest text-[#6B6B6B]">Your cart is currently empty.</p>
                  <button
                    onClick={() => {
                      toggleCart(false);
                      router.push('/category/all-products');
                    }}
                    className="mt-4 px-6 py-3 bg-[#0A0A0A] text-white hover:bg-[#222222] transition-colors text-[10px] font-bold tracking-[0.2em] uppercase rounded-none"
                  >
                    CONTINUE SHOPPING
                  </button>
                </div>
              ) : (
                <ul role="list" className="-my-6 divide-y divide-[#E8E4DF]">
                  {cartItems.map((item) => (
                    <li key={`${item.id}-${item.variant || 'base'}`} className="flex py-6">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden border border-[#E8E4DF] bg-white rounded-none">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="h-full w-full object-cover object-center rounded-none"
                        />
                      </div>

                      <div className="ml-4 flex flex-1 flex-col justify-between">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#0A0A0A]">
                          <h3 className="line-clamp-2 leading-snug">{item.name}</h3>
                          <p className="ml-4 shrink-0">LKR {item.price.toLocaleString()}</p>
                        </div>
                        <div className="flex items-end justify-between text-xs mt-2">
                          <div className="flex items-center border border-[#C4BFBA] rounded-none bg-white">
                            <button
                              onClick={() => updateQuantity(item.id, item.variant, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500 hover:text-[#0A0A0A] rounded-none"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-0.5 text-[10px] font-bold border-x border-[#C4BFBA]">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.variant, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500 hover:text-[#0A0A0A] rounded-none"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id, item.variant)}
                            className="text-[10px] font-bold uppercase tracking-widest text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer / Checkout */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#E8E4DF] px-6 py-6 bg-white rounded-none space-y-6">
                
                {/* Gifting Option in Cart */}
                <div className="border border-[#E8E4DF] bg-[#FAFAF8] rounded-none p-4">
                  <label className="flex items-center cursor-pointer gap-2">
                    <input 
                      type="checkbox" 
                      checked={isGifting}
                      onChange={(e) => setIsGifting(e.target.checked)}
                      className="w-4 h-4 text-[#442852] border-gray-300 rounded-none focus:ring-[#442852] focus:ring-offset-0 bg-transparent cursor-pointer"
                    />
                    <span className="text-[10px] font-extrabold text-[#0A0A0A] uppercase tracking-[0.2em] flex items-center gap-2">
                      <Gift className="w-3.5 h-3.5 text-[#442852]" />
                      Send as a Luxury Gift
                    </span>
                  </label>

                  {isGifting && (
                    <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300 border-t border-[#E8E4DF] pt-4">
                      <div>
                        <label className="block text-[9px] font-bold text-[#0A0A0A] mb-2 uppercase tracking-widest">Handwritten Gift Message</label>
                        <textarea
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="Write your personalized message here..."
                          rows={2}
                          className="w-full rounded-none border border-[#C4BFBA] bg-white px-3 py-2 text-xs text-[#0A0A0A] placeholder-gray-400 focus:border-[#442852] focus:outline-none focus:ring-0 transition-all resize-none uppercase tracking-wide"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-[#0A0A0A] mb-2 uppercase tracking-widest">Packaging Selection</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setGiftPackaging('signature-wax')}
                            className={`border rounded-none p-2 text-[8px] font-extrabold uppercase tracking-widest text-center transition-colors ${
                              giftPackaging === 'signature-wax' 
                                ? 'border-[#442852] bg-[#442852] text-white' 
                                : 'border-[#E8E4DF] text-[#6B6B6B] hover:border-[#442852] hover:text-[#442852]'
                            }`}
                          >
                            Wax Seal
                          </button>
                          <button
                            type="button"
                            onClick={() => setGiftPackaging('custom-ribbon')}
                            className={`border rounded-none p-2 text-[8px] font-extrabold uppercase tracking-widest text-center transition-colors ${
                              giftPackaging === 'custom-ribbon' 
                                ? 'border-[#442852] bg-[#442852] text-white' 
                                : 'border-[#E8E4DF] text-[#6B6B6B] hover:border-[#442852] hover:text-[#442852]'
                            }`}
                          >
                            Custom Ribbon
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-xs font-extrabold uppercase tracking-widest text-[#0A0A0A]">
                  <p>SUBTOTAL</p>
                  <p>LKR {cartTotal.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => {
                    if (isGifting) {
                      localStorage.setItem('checkout_gifting', JSON.stringify({
                        isGifting: true,
                        giftMessage,
                        giftPackaging,
                      }));
                    } else {
                      localStorage.removeItem('checkout_gifting');
                    }
                    toggleCart(false);
                    router.push('/checkout');
                  }}
                  className="flex items-center justify-center w-full bg-[#0A0A0A] hover:bg-[#222222] py-4 text-white text-[10px] font-extrabold tracking-[0.25em] uppercase transition-colors rounded-none"
                >
                  PROCEED TO CHECKOUT
                </button>
                <div className="mt-4 text-center">
                  <button
                    onClick={() => {
                      toggleCart(false);
                      router.push('/category/all-products');
                    }}
                    className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#6B6B6B] hover:text-[#0A0A0A] transition-colors"
                  >
                    CONTINUE SHOPPING &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}