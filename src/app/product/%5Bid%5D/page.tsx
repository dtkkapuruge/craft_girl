import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ClientPDP from './ClientPDP';

// Define TS Interface for Product
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

// Fallback Mock Data for demo and development purposes
const MOCK_PRODUCTS: Record<string, Product> = {
  'resin-flower-pendant': {
    id: 'resin-flower-pendant',
    name: 'Floral Resin Blossom Pendant',
    description: 'A beautiful, hand-crafted resin pendant made with real dried pink gypsophila flowers and flakes of genuine 24k gold leaf. Perfect for gift-giving and adding an elegant, romantic touch to your outfits.',
    basePrice: 1450,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&q=80&w=600'
    ],
    attributes: {
      colors: ['Rose Gold', 'Silver', 'Gold'],
      sizes: ['Standard Chain (45cm)', 'Long Chain (60cm)'],
      materials: ['Resin & Gold Foil', 'Resin & Silver Flakes']
    },
    personalizationRequired: true,
    stockCount: 12,
    isHidden: false,
    categories: {
      parent: 'Handmade Jewelry',
      sub: 'Pendants'
    }
  },
  'aesthetic-resin-coaster': {
    id: 'aesthetic-resin-coaster',
    name: 'Aesthetic Terrazzo Resin Coaster',
    description: 'Individually cast resin coasters featuring a contemporary terrazzo pattern. Finished with a heat-resistant coating to protect your dressing tables and nightstands.',
    basePrice: 850,
    images: [
      'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600'
    ],
    attributes: {
      colors: ['Sage Green', 'Lilac Pastel', 'Blush Pink'],
      sizes: ['Round (10cm)', 'Hexagon (10cm)'],
      materials: ['Pure Acrylic Resin']
    },
    personalizationRequired: false,
    stockCount: 5,
    isHidden: false,
    categories: {
      parent: 'Resin Crafts',
      sub: 'Coasters'
    }
  }
};

// Helper function to fetch product from Firestore or mock database
async function getProduct(id: string): Promise<Product | null> {
  // 1. Try to fetch from Mock Data first (for instant preview/testing)
  if (MOCK_PRODUCTS[id]) {
    return MOCK_PRODUCTS[id];
  }

  // 2. Try Firestore if not in mock database
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (!data.isHidden) {
        return { id: docSnap.id, ...data } as Product;
      }
    }
  } catch (error) {
    console.error('Error fetching product from Firestore:', error);
  }

  return null;
}

// 1. DYNAMIC METADATA GENERATION FOR SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found | Craft Girly Store',
    };
  }

  return {
    title: `${product.name} | Craft Girly Store`,
    description: product.description.substring(0, 155) + '...',
    openGraph: {
      title: `${product.name} - Handmade in Sri Lanka`,
      description: product.description,
      images: [
        {
          url: product.images[0],
          alt: product.name,
        },
      ],
    },
  };
}

// 2. DYNAMIC STATIC PATHS FOR PRE-RENDERING (ISR)
export async function generateStaticParams() {
  return [
    { id: 'resin-flower-pendant' },
    { id: 'aesthetic-resin-coaster' }
  ];
}

// 3. SERVER COMPONENT ENABLING SSR
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Schema.org structured data markup (JSON-LD)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      url: `https://craftgirly.store/product/${product.id}`,
      priceCurrency: 'LKR',
      price: product.basePrice,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stockCount > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      priceValidUntil: '2027-12-31',
    },
  };

  return (
    <>
      {/* Insert JSON-LD into head */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <ClientPDP product={product} />
      </div>
    </>
  );
}
