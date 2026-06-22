import { resolveCategorySlug } from '@/lib/categories';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  reviews: number;
  category: string;
  description?: string;
  stockCount?: number;
}

export const PRODUCTS: Product[] = [
  {
    id: "prod_001",
    name: "Custom Name Resin Necklace",
    price: 1450,
    image: "https://images.unsplash.com/photo-1599643478524-fb66f70d00f7?q=80&w=1000&auto=format&fit=crop",
    rating: 4.8,
    reviews: 124,
    category: "jewellery",
    description: "Beautifully crafted resin necklace featuring custom name engraving. Each piece is hand-poured using eco-friendly resin and finished with genuine 24k gold leaf accents. Perfect for personalising your jewellery collection or giving as a meaningful gift.",
  },
  {
    id: "prod_002",
    name: "Aesthetic Vintage Journal",
    price: 1200,
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000&auto=format&fit=crop",
    rating: 4.9,
    reviews: 89,
    category: "stationery",
    description: "A premium hardcover journal with aesthetic vintage design. Features quality paper pages perfect for journaling, sketching, or note-taking. Great for creative expression and daily reflection.",
  },
  {
    id: "prod_003",
    name: "Floral Resin Coaster Set",
    price: 2500,
    image: "https://images.unsplash.com/photo-1610996841103-6f8dce4937bb?q=80&w=1000&auto=format&fit=crop",
    rating: 4.7,
    reviews: 56,
    category: "resin",
    description: "Set of 4 hand-crafted resin coasters featuring beautiful dried flowers embedded in clear resin. Each coaster is heat-resistant and adds an elegant touch to any living space or workspace.",
  },
  {
    id: "prod_004",
    name: "Handmade Beaded Bracelet",
    price: 850,
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=1000&auto=format&fit=crop",
    rating: 4.6,
    reviews: 42,
    category: "jewellery",
    description: "Delicate beaded bracelet handmade with premium materials. Each bead is carefully selected and threaded by hand. Perfect for everyday wear or as a thoughtful gift.",
  },
  {
    id: "prod_005",
    name: "Ocean Theme Resin Tray",
    price: 3200,
    image: "https://images.unsplash.com/photo-1588693836267-33e38711bd48?q=80&w=1000&auto=format&fit=crop",
    rating: 4.9,
    reviews: 112,
    category: "resin",
    description: "Stunning resin tray featuring ocean-inspired design with blue and turquoise hues. Perfect for organising your desk, displaying decorative items, or serving drinks. A conversation starter for any room.",
  },
  {
    id: "prod_006",
    name: "Pastel Highlighter Set",
    price: 650,
    image: "https://images.unsplash.com/photo-1580569214296-5cf2bffc5ced?q=80&w=1000&auto=format&fit=crop",
    rating: 4.5,
    reviews: 38,
    category: "stationery",
    description: "Set of 6 smooth pastel highlighters in beautiful soft colours. Perfect for note-taking, studying, and adding aesthetic touches to your planner or journal.",
  },
  {
    id: "prod_007",
    name: "Luxury Chocolate Gift Box",
    price: 1850,
    image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?q=80&w=1000&auto=format&fit=crop",
    rating: 4.8,
    reviews: 67,
    category: "chocolate-boxes",
    description: "Beautifully curated luxury chocolate gift box featuring an assortment of premium handmade chocolates. Perfect for birthdays, anniversaries, and special occasions. Each box is elegantly packaged with ribbon.",
  },
  {
    id: "prod_008",
    name: "Personalised Truffle Box",
    price: 2200,
    image: "https://images.unsplash.com/photo-1511381939415-e44571f569d0?q=80&w=1000&auto=format&fit=crop",
    rating: 4.7,
    reviews: 45,
    category: "chocolate-boxes",
    description: "Custom-designed truffle box featuring your choice of premium dark, milk, and white chocolate truffles. Personalised with a custom message card. An unforgettable gift for your loved ones.",
  },
  {
    id: "prod_009",
    name: "Preserved Rose Dome",
    price: 3500,
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1000&auto=format&fit=crop",
    rating: 5.0,
    reviews: 93,
    category: "flower-preservation",
    description: "Exquisitely preserved roses encased in a hand-crafted glass dome. The flowers are treated with a special preservation technique to maintain their natural colour and shape indefinitely. A timeless keepsake.",
  },
  {
    id: "prod_010",
    name: "Dried Flower Resin Keychain",
    price: 750,
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?q=80&w=1000&auto=format&fit=crop",
    rating: 4.7,
    reviews: 81,
    category: "flower-preservation",
    description: "Delicate real dried flowers preserved inside a clear resin keychain. Each piece is unique, featuring seasonal blooms handpicked and carefully arranged before casting in high-quality resin.",
  },
  {
    id: "prod_011",
    name: "Custom Greeting Card Set",
    price: 450,
    image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=1000&auto=format&fit=crop",
    rating: 4.6,
    reviews: 52,
    category: "handmade",
    description: "Set of 5 beautifully handcrafted greeting cards, each uniquely decorated with pressed flowers, washi tape, and hand lettering. Perfect for birthdays, thank-you notes, and special occasions.",
  },
  {
    id: "prod_012",
    name: "Resin Letter Keychain",
    price: 680,
    image: "https://images.unsplash.com/photo-1591348278863-a8fb3887e2aa?q=80&w=1000&auto=format&fit=crop",
    rating: 4.8,
    reviews: 109,
    category: "resin",
    description: "Custom initial letter keychain crafted from premium resin with embedded glitter, dried flowers, or personalised elements. Each piece is uniquely made to order and makes a wonderful personalised gift.",
  },
];

export const getProductsByCategory = (categorySlug: string) => {
  const resolved = resolveCategorySlug(categorySlug);
  return PRODUCTS.filter((p) => p.category === resolved || p.category === categorySlug);
};
