import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface LayoutSettings {
  navbarLogo?: string;
  footerLogo?: string;
  heroBanner1?: string;
  heroBanner2?: string;
  heroBanner3?: string;
  aboutUsImage?: string;
  aboutUsEditorialSplitBanner?: string;
  category_resin?: string;
  category_jewellery?: string;
  category_chocolate_boxes?: string;
  category_flower_preservation?: string;
  category_handmade?: string;
  category_stationery?: string;
}

export const DEFAULT_LAYOUT_SETTINGS: LayoutSettings = {
  navbarLogo: '',
  footerLogo: '',
  heroBanner1: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1920&auto=format&fit=crop',
  heroBanner2: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1920&auto=format&fit=crop',
  heroBanner3: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1920&auto=format&fit=crop',
  aboutUsImage: 'https://images.unsplash.com/photo-1610996841103-6f8dce4937bb?q=80&w=1000&auto=format&fit=crop',
  category_resin: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=1920&auto=format&fit=crop',
  category_jewellery: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=1920&auto=format&fit=crop',
  category_chocolate_boxes: 'https://images.unsplash.com/photo-1549007994-cb92ca817b7a?q=80&w=1920&auto=format&fit=crop',
  category_flower_preservation: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1920&auto=format&fit=crop',
  category_handmade: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1920&auto=format&fit=crop',
  category_stationery: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?q=80&w=1920&auto=format&fit=crop',
};

const SETTINGS_DOC_ID = 'global_layout';

export async function fetchLayoutSettings(): Promise<LayoutSettings> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        ...DEFAULT_LAYOUT_SETTINGS,
        ...docSnap.data()
      };
    }
  } catch (err) {
    console.error('Error fetching layout settings:', err);
  }
  return DEFAULT_LAYOUT_SETTINGS;
}

export async function updateLayoutSettings(settings: Partial<LayoutSettings>): Promise<void> {
  try {
    const docRef = doc(db, 'settings', SETTINGS_DOC_ID);
    await setDoc(docRef, settings, { merge: true });
  } catch (err) {
    console.error('Error updating layout settings:', err);
    throw err;
  }
}
