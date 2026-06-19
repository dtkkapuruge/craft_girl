import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { PRODUCTS, type Product } from '@/lib/products';
import { getCategoryLabel } from '@/lib/categories';

export type ProductInput = {
  name: string;
  description: string;
  price: number;
  category: string;
  stockCount: number;
  image: string;
};

function docToProduct(id: string, data: Record<string, unknown>): Product {
  return {
    id,
    name: (data.name as string) ?? '',
    description: (data.description as string) ?? '',
    price: Number(data.price) || 0,
    category: (data.category as string) ?? 'handmade',
    image: (data.image as string) ?? (data.images as string[])?.[0] ?? '',
    rating: Number(data.rating) || 4.8,
    reviews: Number(data.reviews) || 0,
    stockCount: Number(data.stockCount ?? data.stock) || 0,
  };
}

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) return PRODUCTS;
    return snapshot.docs.map((d) => docToProduct(d.id, d.data()));
  } catch {
    return PRODUCTS;
  }
}

export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const storageRef = ref(storage, `products/${productId}/${Date.now()}.${ext}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function createProduct(
  input: ProductInput,
  imageFile?: File | null
): Promise<Product> {
  const id = `prod_${Date.now()}`;
  let imageUrl = input.image;

  if (imageFile) {
    imageUrl = await uploadProductImage(imageFile, id);
  }

  const product = {
    ...input,
    image: imageUrl,
    rating: 4.8,
    reviews: 0,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(doc(db, 'products', id), product);
  return docToProduct(id, product);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
  imageFile?: File | null
): Promise<void> {
  const payload: Record<string, unknown> = {
    ...input,
    updatedAt: Timestamp.now(),
  };

  if (imageFile) {
    payload.image = await uploadProductImage(imageFile, id);
  }

  await updateDoc(doc(db, 'products', id), payload);
}

export async function deleteProduct(id: string): Promise<void> {
  await deleteDoc(doc(db, 'products', id));
}

export function filterProducts(
  products: Product[],
  searchQuery: string,
  category?: string
): Product[] {
  const q = searchQuery.trim().toLowerCase();
  return products.filter((p) => {
    const categoryLabel = getCategoryLabel(p.category).toLowerCase();
    const matchesCategory = !category || category === 'all' || p.category === category;
    if (!q) return matchesCategory;
    const haystack = `${p.name} ${p.description ?? ''} ${p.category} ${categoryLabel}`.toLowerCase();
    return matchesCategory && haystack.includes(q);
  });
}
