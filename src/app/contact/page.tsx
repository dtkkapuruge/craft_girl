import { MapPin, Phone, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Contact Us | Craft Girly Store',
  description: 'Get in touch with Craft Girly Store via WhatsApp, phone, or visit us in Eheliyagoda, Sri Lanka.',
};

const WHATSAPP_NUMBER = '94766722187';
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi Craft Girly! I'm interested in your handmade crafts and would like to get more information."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export default function ContactPage() {
  return (
    <div className="bg-[#F9F6F0] min-h-screen">
      <section className="bg-[#442852] text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4">Contact Us</h1>
        <p className="text-[#E5E0D8] max-w-lg mx-auto">
          We&apos;d love to hear from you! Reach out for custom orders, questions, or just to say hello.
        </p>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="bg-white rounded-3xl border border-[#E5E0D8] p-8 md:p-12 shadow-sm text-center">
          <MessageCircle className="h-10 w-10 text-[#25D366] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2D2D2D] mb-2">Chat on WhatsApp</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            The fastest way to reach us! Tap below to start a conversation on WhatsApp.
          </p>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] text-white font-semibold text-lg px-10 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Message on WhatsApp
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <MapPin className="h-5 w-5 text-[#442852] mb-3" />
            <h3 className="font-bold text-[#2D2D2D] mb-2">Address</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              244/B Deheragoda Ellawala,<br />
              Eheliyagoda, Sri Lanka, 70606
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            <Phone className="h-5 w-5 text-[#442852] mb-3" />
            <h3 className="font-bold text-[#2D2D2D] mb-2">Phone</h3>
            <a href="tel:+94766722187" className="text-sm text-[#442852] font-semibold hover:underline">
              076 672 2187
            </a>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E0D8] p-6">
            {/* Inline SVG for Facebook */}
            <svg className="h-5 w-5 text-[#442852] mb-3 fill-current" viewBox="0 0 24 24">
              <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
            </svg>
            <h3 className="font-bold text-[#2D2D2D] mb-2">Facebook</h3>
            <a
              href="https://www.facebook.com/profile.php?id=100086577828998"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-[#442852] font-semibold hover:underline"
            >
              Craft Girly Store
            </a>
          </div>
        </div>

        <p className="text-center mt-10 text-sm text-gray-500">
          Or browse our{' '}
          <Link href="/about" className="text-[#442852] font-medium hover:underline">
            About page
          </Link>{' '}
          to learn more about what we create.
        </p>
      </section>
    </div>
  );
}