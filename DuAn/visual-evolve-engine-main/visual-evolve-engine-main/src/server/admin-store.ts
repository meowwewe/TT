import { promises as fs } from "fs";
import path from "path";

export type ProductData = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  image: string;
  badge?: string;
  stock: number;
  description: string;
  platforms: string[];
  specs: { label: string; value: string }[];
};

type CategoryData = { id: string; slug: string; name: string };
type CouponData = { id: string; code: string; discountPercent: number; active: boolean };
type KeyData = { id: string; productId: string; key: string; status: "available" | "used" };
type BannerData = { id: string; title: string; image: string; type: "banner" | "poster"; active: boolean };
type OrderItem = { productId: string; name: string; qty: number; price: number };
type OrderData = {
  id: string;
  email: string;
  phone: string;
  note: string;
  deliveryMethod: string;
  couponCode?: string;
  total: number;
  status: "pending" | "paid" | "approved" | "cancelled";
  createdAt: string;
  items: OrderItem[];
};
type NotificationData = {
  id: string;
  message: string;
  type: "order" | "payment" | "system";
  orderId?: string;
  createdAt: string;
  read: boolean;
};

type StoreData = {
  products: ProductData[];
  categories: CategoryData[];
  coupons: CouponData[];
  keys: KeyData[];
  banners: BannerData[];
  orders: OrderData[];
  notifications: NotificationData[];
};

const dataPath = path.join(process.cwd(), "data", "db.json");
let cache: StoreData | null = null;

async function readStore(): Promise<StoreData> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    cache = JSON.parse(raw) as StoreData;
  } catch (error) {
    throw new Error(`Could not read admin store: ${error}`);
  }
  return cache;
}

export async function writeStore(data: StoreData) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf8");
  cache = data;
}

export async function getStore() {
  return readStore();
}

export function cloneStore(data: StoreData): StoreData {
  return JSON.parse(JSON.stringify(data)) as StoreData;
}

export function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export type { CategoryData, CouponData, KeyData, BannerData, OrderData, NotificationData };
