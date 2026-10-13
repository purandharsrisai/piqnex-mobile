/** Category list (slug/name) with an Ionicons name for each. */
export interface Category {
  slug: string;
  name: string;
  icon: string;
}
export const CATEGORIES: Category[] = [
  { slug: "electronics", name: "Electronics", icon: "headset-outline" },
  { slug: "laptops", name: "Laptops", icon: "laptop-outline" },
  { slug: "gaming", name: "Gaming", icon: "game-controller-outline" },
  { slug: "wearables", name: "Wearables", icon: "watch-outline" },
  { slug: "cameras", name: "Cameras", icon: "camera-outline" },
  { slug: "appliances", name: "Appliances", icon: "bonfire-outline" },
  { slug: "furniture", name: "Furniture", icon: "bed-outline" },
  { slug: "automotive", name: "Automotive", icon: "car-outline" },
  { slug: "other", name: "Other", icon: "extension-puzzle-outline" },
];
