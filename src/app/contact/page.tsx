'use client';

import { MapPin, Phone, MessageCircle, ChevronDown, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const WHATSAPP_NUMBER = '94766722187';
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi Craft Girly! I'm interested in your handmade crafts and would like to get more information."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

const FAQS = [
  {
    question: "Do you offer Cash on Delivery (COD)?",
    answer: "Yes! We support Cash on Delivery (COD) islandwide across Sri Lanka, so you can pay conveniently at your doorstep."
  },
  {
    question: "How long does delivery take?",
    answer: "Our standard delivery takes 3 to 5 business days. For customized orders, resin flower preservation, or custom jewelry, it may take 7 to 10 days to craft and cure before dispatch."
  },
  {
    question: "Can I customize a product or place a special request?",
    answer: "Absolutely! Customization is our specialty. You can request specific flowers, name lettering, color themes, or design layouts. The best way to discuss custom orders is to reach out directly via our WhatsApp link!"
  },
  {
    question: "What is your return and exchange policy?",
    answer: "Since our products are individually handmade and personalized, we generally do not accept returns or exchanges unless the item arrives damaged. If your product is damaged during transit, please notify us within 24 hours of delivery with pictures so we can send a replacement."
  }
];

export default function ContactPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="bg-[#FAFAF8] min-h-screen text-[#0A0A0A] selection:bg-[#442852]/10 selection:text-[#442852]">
      
      {/* Editorial Header Banner */}
      <section className="bg-[#FAFAF8] py-16 px-4 text-center border-b border-[#E8E4DF]">
        <div className="max-w-3xl mx-auto space-y-4">
          <span className="text-[10px] font-bold tracking-[0.25em] text-[#9B9B9B] uppercase">
            GET IN TOUCH
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-wider text-[#442852] font-serif uppercase">
            CONTACT US
          </h1>
          <div className="h-[1px] w-12 bg-[#442852] mx-auto mt-2"></div>
          <p className="text-xs uppercase tracking-widest text-[#6B6B6B] leading-relaxed max-w-lg mx-auto mt-4">
            We&apos;d love to hear from you. Reach out for custom orders, flower preservation requests, or inquiries about our jewelry.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        
        {/* WhatsApp Block */}
        <div className="bg-white border border-[#E8E4DF] p-8 md:p-12 text-center rounded-none shadow-sm">
          <MessageCircle className="h-8 w-8 text-[#442852] mx-auto mb-4" />
          <h2 className="text-sm font-bold tracking-[0.2em] text-[#0A0A0A] uppercase mb-2">CHAT ON WHATSAPP</h2>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-6 max-w-md mx-auto leading-relaxed">
            The fastest way to reach us. Tap below to start a direct consultation on customized crafts and keepsake designs.
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-[#4A2244] hover:bg-[#5C2B54] text-white text-[10px] font-bold tracking-[0.25em] uppercase px-8 py-3.5 transition-colors rounded-none shadow-sm"
          >
            Message on WhatsApp
          </a>
        </div>

        {/* Directory details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          
          <div className="bg-white border border-[#E8E4DF] p-6 rounded-none space-y-3">
            <MapPin className="h-4.5 w-4.5 text-[#442852]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Address</h3>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider leading-relaxed">
              244/B Deheragoda Ellawala,<br />
              Eheliyagoda, Sri Lanka, 70606
            </p>
          </div>

          <div className="bg-white border border-[#E8E4DF] p-6 rounded-none space-y-3">
            <Phone className="h-4.5 w-4.5 text-[#442852]" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Phone</h3>
            <a href="tel:+94766722187" className="block text-[10px] text-[#442852] font-bold tracking-widest hover:underline">
              076 672 2187
            </a>
          </div>

          <div className="bg-white border border-[#E8E4DF] p-6 rounded-none space-y-3">
            <svg className="h-4.5 w-4.5 text-[#442852] fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
            </svg>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#0A0A0A]">Facebook</h3>
            <a
              href="https://www.facebook.com/profile.php?id=100086577828998"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-[10px] text-[#442852] font-bold tracking-widest hover:underline"
            >
              Craft Girly Store
            </a>
          </div>

        </div>

        {/* FAQ Accordion Section */}
        <div className="mt-16 bg-white border border-[#E8E4DF] p-8 md:p-10 rounded-none shadow-sm text-left">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-5 h-5 text-[#442852]" />
            <h2 className="text-xs font-bold tracking-[0.2em] text-[#0A0A0A] uppercase">FREQUENTLY ASKED QUESTIONS</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="border-b border-[#E8E4DF] last:border-b-0 pb-4 last:pb-0">
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full flex items-center justify-between text-left py-3 text-xs font-bold tracking-wider text-[#0A0A0A] hover:text-[#442852] transition-colors focus:outline-none uppercase"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#442852]' : ''}`} />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="text-[10px] text-[#6B6B6B] uppercase tracking-wide leading-relaxed pl-1">{faq.answer}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center mt-12 text-[10px] font-bold uppercase tracking-widest text-[#9B9B9B]">
          Or browse our{' '}
          <Link href="/about" className="text-[#442852] hover:underline">
            About page
          </Link>{' '}
          to learn more about our story.
        </p>
      </section>
    </div>
  );
}