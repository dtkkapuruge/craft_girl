import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Suspense } from "react";
import PixelTracker from "@/components/PixelTracker";
import ConditionalSiteChrome from "@/components/ConditionalSiteChrome";
import CartDrawer from "@/components/CartDrawer";
import AuthModal from "@/components/AuthModal";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Craft Girly Store | Handmade Jewellery, Resin Crafts & Stationery",
  description: "Explore premium handmade resin jewellery, customised crafts, and aesthetic stationery. Get safe Cash on Delivery (COD) shipping across Sri Lanka.",
  openGraph: {
    title: "Craft Girly Store | Premium Handmade resin jewellery & customised crafts",
    description: "Upgrade your aesthetic with custom name engravings, resin art, and handmade jewellery. Secure Cash on Delivery (COD) islandwide.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Craft Girly Store Sri Lanka",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider>
          <CartProvider>
            <Suspense fallback={null}>
              <PixelTracker />
            </Suspense>

            {/* Global Slide-over UI & Modals */}
            <CartDrawer />
            <AuthModal />

            <ConditionalSiteChrome>{children}</ConditionalSiteChrome>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}