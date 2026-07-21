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
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-widest text-neutral-900 uppercase mb-3">
            CONTACT US
          </h1>
          <div className="h-[1px] w-12 bg-[#442852] mx-auto mt-2"></div>
          <p className="text-sm md:text-base font-normal text-neutral-600 max-w-md mx-auto leading-relaxed mb-10">
            We&apos;d love to hear from you. Reach out for custom orders, flower preservation requests, or inquiries about our jewelry.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">

        {/* WhatsApp Block */}
        <div className="bg-white p-8 border border-neutral-100 rounded-lg shadow-sm text-center">
          <MessageCircle className="w-7 h-7 text-neutral-800 mb-3 mx-auto" />
          <h2 className="text-xs md:text-sm font-bold tracking-[0.15em] text-neutral-900 uppercase mb-2">CHAT ON WHATSAPP</h2>
          <p className="text-xs md:text-sm font-normal text-neutral-600 max-w-md mx-auto leading-relaxed mb-6">
            The fastest way to reach us. Tap below to start a direct consultation on customized crafts and keepsake designs.
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-[#3d1835] hover:bg-black text-white text-xs md:text-sm font-semibold tracking-widest uppercase rounded-sm transition-colors shadow-sm"
          >
            Message on WhatsApp
          </a>
        </div>

        {/* Directory details grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 mb-4 shadow-inner"><MapPin className="h-5 w-5 text-neutral-800" /></div>
            <h3 className="text-xs font-bold tracking-[0.2em] text-neutral-900 uppercase mb-2">ADDRESS</h3>
            <p className="text-xs md:text-sm font-normal text-neutral-600 leading-relaxed max-w-[220px]">
              244/B Dehieragoda, Ellawala,<br />
              Eheliyagoda, Sri Lanka, 70606
            </p>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 mb-4 shadow-inner"><Phone className="h-5 w-5 text-neutral-800" /></div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-900 mb-2">PHONE</h3>
            <a href="tel:+94766722187" className="block text-xs md:text-sm font-medium text-neutral-800 hover:text-black transition-colors">
              076 672 2187
            </a>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 mb-4 shadow-inner"><svg className="h-5 w-5 text-neutral-800 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
            </svg></div>
            <h3 className="text-xs font-bold tracking-widest uppercase text-neutral-900 mb-2">FACEBOOK</h3>
            <a
              href="https://www.facebook.com/profile.php?id=100086577828998"
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs md:text-sm font-medium text-neutral-800 hover:text-black transition-colors"
            >
              Craft Girly Store
            </a>
          </div>

        </div>

        {/* FAQ Accordion Section */}
        <div className="mt-16 bg-white border border-[#E8E4DF] p-8 md:p-10 rounded-none shadow-sm text-left">
          <div className="flex items-center gap-3 mb-8">
            <HelpCircle className="w-5 h-5 text-[#442852]" />
            <h2 className="text-sm md:text-base font-bold tracking-[0.15em] uppercase text-neutral-900 flex items-center justify-center gap-2 mb-8">FREQUENTLY ASKED QUESTIONS</h2>
          </div>
          <div className="space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div key={idx} className="border-b border-neutral-100">
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="text-sm md:text-base font-semibold text-neutral-800 hover:text-black py-4 flex items-center justify-between transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#442852]' : ''}`} />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'
                      }`}
                  >
                    <p className="text-xs md:text-sm font-normal text-neutral-600 leading-relaxed pb-5 pr-6">{faq.answer}</p>
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