import win11 from "../../Anh_sp_win/win11_home1.webp";
import win11pro from "../../Anh_sp_win/win11_pro1.jpg";
import office from "../../Anh_sp_office/office_home1.png";
import m365 from "../../Anh_sp_office/office_family1.webp";
import kaspersky from "../../Anh_sp_virus/virus_kas1.jpg";
import eset from "../../Anh_sp_virus/virus_es1.jpg";
import bitdefender from "../../Anh_sp_virus/virus_bit1.jpg";
import adobe from "@/assets/sw-adobe.jpg";

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  sales?: number;
  image: string;
  badge?: string;
  stock: number;
  description: string;
  platforms: string[];
  specs: { label: string; value: string }[];
};

export const categories = [
  { slug: "windows", name: "Windows", icon: "windows", image: "/Anh_danh_muc/windows_danhmuc.jpg" },
  { slug: "office", name: "Office", icon: "office", image: "/Anh_danh_muc/office365_danhmuc.jpg" },
  { slug: "antivirus", name: "Diệt virus", icon: "shield", image: "/Anh_danh_muc/dietvirus_danhmuc.jpg" },
];

export const products: Product[] = [
  {
    id: "p1", slug: "windows-11-home", name: "Windows 11 Home – Key bản quyền vĩnh viễn", brand: "Microsoft", category: "windows",
    price: 1990000, compareAt: 3290000, rating: 4.8, reviews: 1245, image: win11, badge: "Bán chạy", stock: 120,
    description: "Key kích hoạt Windows 11 Home chính hãng Microsoft, bản quyền vĩnh viễn, sử dụng cho 1 thiết bị. Nhận key sau 5 phút qua email, hỗ trợ cài đặt từ xa miễn phí.",
    platforms: ["Windows"],
    specs: [
      { label: "Loại license", value: "Retail – vĩnh viễn" },
      { label: "Số thiết bị", value: "1 PC" },
      { label: "Ngôn ngữ", value: "Đa ngôn ngữ (có Tiếng Việt)" },
      { label: "Nền tảng", value: "Windows 11" },
      { label: "Bảo hành", value: "Trọn đời sử dụng" },
    ],
  },
  {
    id: "p2", slug: "windows-11-pro", name: "Windows 11 Pro – Key bản quyền vĩnh viễn", brand: "Microsoft", category: "windows",
    price: 2690000, compareAt: 4590000, rating: 4.9, reviews: 872, image: win11pro, badge: "Mới", stock: 80,
    description: "Phiên bản Windows 11 Pro dành cho doanh nghiệp và người dùng chuyên nghiệp. Hỗ trợ BitLocker, Hyper-V, Remote Desktop và Domain Join.",
    platforms: ["Windows"],
    specs: [
      { label: "Loại license", value: "Retail – vĩnh viễn" },
      { label: "Số thiết bị", value: "1 PC" },
      { label: "Tính năng", value: "BitLocker, Hyper-V, RDP" },
      { label: "Nền tảng", value: "Windows 11 Pro" },
    ],
  },
  {
    id: "p3", slug: "office-2024-home-student", name: "Office 2024 Home & Student – Trọn đời", brand: "Microsoft", category: "office",
    price: 1490000, compareAt: 2990000, rating: 4.7, reviews: 2140, image: office, badge: "-50%", stock: 200,
    description: "Bộ Office 2024 gồm Word, Excel, PowerPoint và OneNote. Bản quyền vĩnh viễn cho 1 PC hoặc Mac, không cần trả phí hàng năm.",
    platforms: ["Windows", "macOS"],
    specs: [
      { label: "Ứng dụng", value: "Word, Excel, PowerPoint, OneNote" },
      { label: "Loại license", value: "Vĩnh viễn" },
      { label: "Số thiết bị", value: "1 PC / Mac" },
      { label: "Ngôn ngữ", value: "Đa ngôn ngữ" },
    ],
  },
  {
    id: "p4", slug: "microsoft-365-family", name: "Microsoft 365 Family – 12 tháng cho 6 người", brand: "Microsoft", category: "office",
    price: 1290000, compareAt: 1990000, rating: 4.8, reviews: 3421, image: m365, badge: "Ưu đãi", stock: 150,
    description: "Gói Microsoft 365 Family bản quyền 12 tháng, dùng cho 6 người trên tối đa 5 thiết bị/người. Kèm 1TB OneDrive/người và các ứng dụng luôn cập nhật.",
    platforms: ["Windows", "macOS"],
    specs: [
      { label: "Thời hạn", value: "12 tháng" },
      { label: "Số người dùng", value: "6 người" },
      { label: "OneDrive", value: "1 TB / người" },
      { label: "Ứng dụng", value: "Word, Excel, PowerPoint, Outlook, Teams" },
    ],
  },
  {
    id: "p5", slug: "kaspersky-standard", name: "Kaspersky Standard – 1 PC / 12 tháng", brand: "Kaspersky", category: "antivirus",
    price: 290000, compareAt: 490000, rating: 4.7, reviews: 5210, sales: 880, image: kaspersky, badge: "-40%", stock: 300,
    description: "Giải pháp diệt virus toàn diện của Kaspersky. Chống mã độc, ransomware, lừa đảo trực tuyến và bảo vệ giao dịch ngân hàng.",
    platforms: ["Windows", "macOS"],
    specs: [
      { label: "Thời hạn", value: "12 tháng" },
      { label: "Số thiết bị", value: "1 PC" },
      { label: "Hệ điều hành", value: "Windows / macOS" },
      { label: "Tính năng", value: "Anti-ransomware, Safe Money" },
    ],
  },
  {
    id: "p6", slug: "eset-home-security-essential", name: "ESET HOME Security Essential – 1 thiết bị", brand: "ESET", category: "antivirus",
    price: 250000, compareAt: 450000, rating: 4.6, reviews: 1820, sales: 760, image: eset, stock: 250,
    description: "Phần mềm diệt virus ESET nhẹ, nhanh, ít tốn tài nguyên. Bảo vệ thời gian thực khỏi virus, mã độc và tấn công mạng.",
    platforms: ["Windows", "Android", "macOS"],
    specs: [
      { label: "Thời hạn", value: "12 tháng" },
      { label: "Số thiết bị", value: "1 thiết bị" },
      { label: "Nền tảng", value: "Windows / Android / macOS" },
    ],
  },
  {
    id: "p7", slug: "bitdefender-total-security", name: "Bitdefender Total Security – 5 thiết bị / 1 năm", brand: "Bitdefender", category: "antivirus",
    price: 590000, compareAt: 990000, rating: 4.9, reviews: 940, sales: 650, image: bitdefender, badge: "Đề cử", stock: 90,
    description: "Giải pháp bảo mật toàn diện đa nền tảng cho tối đa 5 thiết bị Windows, macOS, Android, iOS. Đạt nhiều giải AV-TEST.",
    platforms: ["Windows", "macOS", "Android", "iOS"],
    specs: [
      { label: "Thời hạn", value: "12 tháng" },
      { label: "Số thiết bị", value: "5 thiết bị" },
      { label: "Nền tảng", value: "Windows / macOS / Android / iOS" },
      { label: "Tính năng", value: "VPN 200MB, Parental Control, Anti-theft" },
    ],
  },
  {
    id: "p8", slug: "adobe-creative-cloud", name: "Adobe Creative Cloud All Apps – 12 tháng", brand: "Adobe", category: "do-hoa",
    price: 3990000, compareAt: 5890000, rating: 4.8, reviews: 612, image: adobe, badge: "Chuyên nghiệp", stock: 40,
    description: "Trọn bộ 20+ ứng dụng sáng tạo Adobe: Photoshop, Illustrator, Premiere Pro, After Effects, Lightroom… Bản quyền 12 tháng.",
    platforms: ["Windows", "macOS"],
    specs: [
      { label: "Thời hạn", value: "12 tháng" },
      { label: "Ứng dụng", value: "20+ apps (Photoshop, Illustrator, Premiere…)" },
      { label: "Cloud", value: "100 GB Adobe Cloud" },
      { label: "Nền tảng", value: "Windows / macOS" },
    ],
  },
];

export const brands = ["Microsoft", "Kaspersky", "ESET", "Bitdefender", "Adobe"];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const getByCategory = (cat: string) => products.filter((p) => p.category === cat);
export const money = (n: number) => `${n.toLocaleString("vi-VN")}₫`;