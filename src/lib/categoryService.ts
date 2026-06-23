import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Category {
  id: string;          // Firestore doc id (same as key/slug)
  key: string;         // slug, e.g. "resin-art"
  label: string;       // display name, e.g. "Resin Art"
  description: string;
  createdAt?: string;
  isCustom?: boolean;  // true = created via admin panel
}

export interface CategoryInput {
  key: string;
  label: string;
  description: string;
}

// ─── Static seed data (used as fallback when Firestore is empty) ──────────────

export const STATIC_CATEGORIES: Category[] = [
  {
    id: 'resin',
    key: 'resin',
    label: 'Resin',
    description: 'Custom resin accessories, keychains, and letter sets handcrafted using epoxy resin.',
  },
  {
    id: 'jewellery',
    key: 'jewellery',
    label: 'Jewellery',
    description: 'Aesthetic bracelets, custom name lockets, flower necklaces, and beaded sets.',
  },
  {
    id: 'chocolate-boxes',
    key: 'chocolate-boxes',
    label: 'Chocolate Boxes',
    description: 'Special occasion luxury packaging boxes and handmade chocolate pairings.',
  },
  {
    id: 'flower-preservation',
    key: 'flower-preservation',
    label: 'Flower Preservation',
    description: 'Wedding and special event flower preservation inside glass dome displays.',
  },
  {
    id: 'handmade',
    key: 'handmade',
    label: 'Handmade Items',
    description: 'Assorted custom aesthetic greeting cards, frames, and hand-woven artifacts.',
  },
  {
    id: 'stationery',
    key: 'stationery',
    label: 'Stationery',
    description: 'Cute notebooks, customized wax seals, pastel highlighters, and aesthetic journals.',
  },
];

// ─── Firestore helpers ────────────────────────────────────────────────────────

function docToCategory(id: string, data: Record<string, unknown>): Category {
  return {
    id,
    key: (data.key as string) ?? id,
    label: (data.label as string) ?? id,
    description: (data.description as string) ?? '',
    createdAt: (data.createdAt as string) ?? '',
    isCustom: Boolean(data.isCustom),
  };
}

/**
 * Fetch all categories from Firestore.
 * Falls back to STATIC_CATEGORIES if the collection is empty or unreachable.
 */
export async function fetchAllCategories(): Promise<Category[]> {
  try {
    const q = query(collection(db, 'categories'), orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      return snapshot.docs.map((d) => docToCategory(d.id, d.data()));
    }
  } catch (err) {
    console.error('fetchAllCategories: Firestore error, using static data.', err);
  }
  return STATIC_CATEGORIES;
}

/**
 * Create a new category document in Firestore.
 * The document id is the slug/key.
 */
export async function createCategory(input: CategoryInput): Promise<Category> {
  const normalized = input.key.trim().toLowerCase().replace(/\s+/g, '-');
  const now = new Date().toISOString();

  const payload = {
    key: normalized,
    label: input.label.trim(),
    description: input.description.trim(),
    isCustom: true,
    createdAt: now,
  };

  await setDoc(doc(db, 'categories', normalized), payload);

  return {
    id: normalized,
    ...payload,
  };
}

/**
 * Delete a category by its key/id.
 */
export async function deleteCategory(key: string): Promise<void> {
  await deleteDoc(doc(db, 'categories', key));
}
