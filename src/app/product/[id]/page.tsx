import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PRODUCTS } from '@/lib/products';
import ClientPDP from './ClientPDP';

export const dynamic = 'force-dynamic';

interface ProductAttribute {
  colors: string[];
  sizes: string[];
  materials: string[];
}

interface ProductCategories {
  parent: string;
  sub: string;
}

interface PDPProduct {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  images: string[];
  attributes: ProductAttribute;
  personalizationRequired: boolean;
  stockCount: number;
  isHidden: boolean;
  categories: ProductCategories;
}

// Normalize any product shape (from Firestore or static) to PDPProduct
function normalizeProduct(id: string, data: Record<string, unknown>): PDPProduct {
  const images: string[] = [];
  if (Array.isArray(data.images)) {
    images.push(...(data.images as string[]));
  } else if (typeof data.image === 'string' && data.image) {
    images.push(data.image as string);
  }

  const attrs = (data.attributes as ProductAttribute) || {};

  return {
    id,
    name: (data.name as string) ?? '',
    description: (data.description as string) ?? '',
    basePrice: Number(data.basePrice ?? data.price) || 0,
    images: images.length > 0 ? images : ['https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=600'],
    attributes: {
      colors: (attrs.colors as string[]) ?? [],
      sizes: (attrs.sizes as string[]) ?? [],
      materials: (attrs.materials as string[]) ?? [],
    },
    personalizationRequired: Boolean(data.personalizationRequired),
    stockCount: Number(data.stockCount ?? data.stock) || 10,
    isHidden: Boolean(data.isHidden),
    categories: {
      parent: ((data.categories as ProductCategories)?.parent ?? (data.category as string) ?? 'Handmade'),
      sub: ((data.categories as ProductCategories)?.sub ?? ''),
    },
  };
}

async function getProduct(id: string): Promise<PDPProduct | null> {
  // 1. Check static PRODUCTS list first (works for prod_001 etc.)
  const staticProduct = PRODUCTS.find(p => p.id === id);
  if (staticProduct) {
    return normalizeProduct(id, staticProduct as unknown as Record<string, unknown>);
  }

  // 2. Try Firestore
  try {
    const docRef = doc(db, 'products', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data() as Record<string, unknown>;
      if (!data.isHidden) {
        return normalizeProduct(docSnap.id, data);
      }
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }

  return null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) return { title: 'Product Not Found | Craft Girly Store' };

  return {
    title: `${product.name} | Craft Girly Store`,
    description: product.description.substring(0, 155),
    openGraph: {
      title: `${product.name} - Handmade in Sri Lanka`,
      description: product.description,
      images: [{ url: product.images[0], alt: product.name }],
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'LKR',
      price: product.basePrice,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.stockCount > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  };

  return (
    <>
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
