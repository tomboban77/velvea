import type { ProductFormData } from "@/components/admin/ProductForm";
import type { ArticleFormData } from "@/components/admin/ArticleForm";

// Server-safe factories (client components can't be called from server components).
export function emptyProduct(): ProductFormData {
  return {
    slug: "",
    name: { en: "", fr: "" },
    tagline: { en: "", fr: "" },
    description: { en: "", fr: "" },
    care: { en: "", fr: "" },
    contents: [],
    priceCents: 0,
    compareAtCents: null,
    sku: "",
    status: "DRAFT",
    featured: false,
    bestseller: false,
    badges: [],
    leadTimeDays: 1,
    weightGrams: null,
    inventory: null,
    collectionIds: [],
    images: [],
    variants: [],
    seoTitle: { en: "", fr: "" },
    seoDescription: { en: "", fr: "" },
  };
}

export function emptyArticle(): ArticleFormData {
  return {
    slug: "",
    category: "OCCASIONS",
    title: { en: "", fr: "" },
    excerpt: { en: "", fr: "" },
    body: { en: "", fr: "" },
    coverImage: null,
    coverPublicId: null,
    author: "The Velvea Team",
    readMinutes: 4,
    status: "DRAFT",
    featured: false,
  };
}
