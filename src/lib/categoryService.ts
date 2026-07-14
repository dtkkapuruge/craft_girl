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
    label: 'Resin Art & Decor',
    description: 'Custom cured resin sculptures, trays, name keychains, and botanical letter preservation handcrafted in optical-grade epoxy.',
  },
  {
    id: 'jewellery',
    key: 'jewellery',
    label: 'Bespoke Jewelry',
    description: 'Aesthetic sterling silver bracelets, custom-engraved name lockets, dried flower necklaces, and minimal beaded fine jewelry.',
  },
  {
    id: 'chocolate-boxes',
    key: 'chocolate-boxes',
    label: 'Luxury Chocolate Boxes',
    description: 'Rich artisanal chocolates paired with beautifully curated luxury gift cases for special occasions and anniversaries.',
  },
  {
    id: 'flower-preservation',
    key: 'flower-preservation',
    label: 'Floral Preservation',
    description: 'Timeless preservation of wedding bouquets, memorial flowers, and event florals cast inside crystal-clear resin blocks and domes.',
  },
  {
    id: 'handmade',
    key: 'handmade',
    label: 'Artisanal Keepsakes',
    description: 'Aesthetic custom greeting cards, bespoke photo frames, hand-woven fiber decor, and personalized memories.',
  },
  {
    id: 'stationery',
    key: 'stationery',
    label: 'Aesthetic Stationery',
    description: 'Premium journals, customizable monogram wax seals, linen notebooks, and hand-pressed botanical paper accessories.',
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

/**
 * Update an existing category document in Firestore.
 */
export async function updateCategory(key: string, input: Partial<CategoryInput>): Promise<void> {
  const docRef = doc(db, 'categories', key);
  await setDoc(docRef, {
    ...input,
    updatedAt: new Date().toISOString(),
  }, { merge: true });
}
