export const CATEGORIES = [
  "Programming & Tech",
  "Design & Creativity",
  "Business & Entrepreneurship",
  "Personal Development",
  "Languages & Communication",
  "Marketing & Social Media",
  "Finance & Investment",
  "Health & Fitness",
  "Arts & Music",
  "Science & Engineering",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: Category;
  description: string;
  shortDescription: string;
  price: number;
  thumbnail: string;
  videoUrl: string;
  rating: number;
  students: number;
  lessons: number;
  duration: string;
}

export const COURSES: Course[] = [
  {
    id: "c1",
    title: "Full-Stack Web Development with React & Node",
    instructor: "Abebe Kebede",
    category: "Programming & Tech",
    description: "Master modern web development from scratch. Build real-world applications using React, Node.js, and PostgreSQL. This comprehensive course covers everything from HTML/CSS basics to deploying production applications.",
    shortDescription: "Build production-ready web apps from scratch",
    price: 499,
    thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.8,
    students: 142,
    lessons: 48,
    duration: "32 hours",
  },
  {
    id: "c2",
    title: "UI/UX Design Masterclass",
    instructor: "Sara Tesfaye",
    category: "Design & Creativity",
    description: "Learn to design beautiful, user-friendly interfaces. From wireframing to high-fidelity prototypes in Figma. Includes real client projects and portfolio building.",
    shortDescription: "Design stunning interfaces with Figma",
    price: 399,
    thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.9,
    students: 98,
    lessons: 36,
    duration: "24 hours",
  },
  {
    id: "c3",
    title: "Digital Marketing & Social Media Strategy",
    instructor: "Dawit Hailu",
    category: "Marketing & Social Media",
    description: "Master digital marketing from SEO to social media ads. Learn to grow brands online, create content strategies, and run profitable campaigns on Facebook, Instagram, and TikTok.",
    shortDescription: "Grow brands with digital marketing",
    price: 349,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.7,
    students: 187,
    lessons: 28,
    duration: "18 hours",
  },
  {
    id: "c4",
    title: "Personal Finance & Investment Basics",
    instructor: "Hana Girma",
    category: "Finance & Investment",
    description: "Take control of your finances. Learn budgeting, saving strategies, stock market basics, and building passive income streams. Practical advice for the Ethiopian market.",
    shortDescription: "Build wealth with smart money habits",
    price: 299,
    thumbnail: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?w=600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.6,
    students: 210,
    lessons: 22,
    duration: "14 hours",
  },
  {
    id: "c5",
    title: "Mobile App Development with Flutter",
    instructor: "Yonas Mulugeta",
    category: "Programming & Tech",
    description: "Build cross-platform mobile apps with Flutter and Dart. Create beautiful, natively compiled applications for iOS and Android from a single codebase.",
    shortDescription: "Build iOS & Android apps with Flutter",
    price: 549,
    thumbnail: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.8,
    students: 76,
    lessons: 42,
    duration: "28 hours",
  },
  {
    id: "c6",
    title: "Entrepreneurship: Start Your Business",
    instructor: "Meron Alemayehu",
    category: "Business & Entrepreneurship",
    description: "From idea validation to launching your startup. Learn business planning, fundraising, marketing, and scaling. Includes Ethiopian market insights and case studies.",
    shortDescription: "Launch your startup from scratch",
    price: 449,
    thumbnail: "https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.5,
    students: 134,
    lessons: 30,
    duration: "20 hours",
  },
  {
    id: "c7",
    title: "English Communication Skills",
    instructor: "Bethlehem Tadesse",
    category: "Languages & Communication",
    description: "Improve your English speaking, writing, and presentation skills. Perfect for professionals looking to advance their careers through better communication.",
    shortDescription: "Master professional English communication",
    price: 249,
    thumbnail: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.7,
    students: 230,
    lessons: 24,
    duration: "16 hours",
  },
  {
    id: "c8",
    title: "Photography & Video Production",
    instructor: "Abel Wondimu",
    category: "Arts & Music",
    description: "Learn professional photography and videography. From camera basics to advanced editing with Adobe Premiere Pro and Lightroom. Start your creative career.",
    shortDescription: "Create stunning visual content",
    price: 379,
    thumbnail: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=600",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    rating: 4.6,
    students: 89,
    lessons: 34,
    duration: "22 hours",
  },
];

export const TESTIMONIALS = [
  {
    name: "Kidist Mengistu",
    role: "Web Developer",
    text: "This platform changed my career. I learned web development and now work as a freelancer earning 3x my previous salary.",
    avatar: "KM",
  },
  {
    name: "Samuel Bekele",
    role: "Digital Marketer",
    text: "The marketing course gave me practical skills I use every day. The Telebirr payment made it so easy to get started.",
    avatar: "SB",
  },
  {
    name: "Tigist Assefa",
    role: "UI Designer",
    text: "From zero design knowledge to landing my first client in 3 months. The project-based learning approach is incredible.",
    avatar: "TA",
  },
];

export const COMMUNITY_LINKS = [
  { category: "Programming & Tech", url: "https://t.me/programming_community" },
  { category: "Design & Creativity", url: "https://t.me/design_community" },
  { category: "Business & Entrepreneurship", url: "https://t.me/business_community" },
  { category: "Personal Development", url: "https://t.me/personal_dev_community" },
  { category: "Marketing & Social Media", url: "https://t.me/marketing_community" },
  { category: "Finance & Investment", url: "https://t.me/finance_community" },
  { category: "Languages & Communication", url: "https://t.me/languages_community" },
  { category: "Health & Fitness", url: "https://t.me/health_community" },
  { category: "Arts & Music", url: "https://t.me/arts_community" },
  { category: "Science & Engineering", url: "https://t.me/science_community" },
];

export interface Transaction {
  id: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  status: "pending" | "confirmed" | "failed";
  date: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "txn_001", studentName: "Kidist Mengistu", courseTitle: "Full-Stack Web Development", amount: 499, status: "confirmed", date: "2026-03-05" },
  { id: "txn_002", studentName: "Samuel Bekele", courseTitle: "Digital Marketing", amount: 349, status: "confirmed", date: "2026-03-04" },
  { id: "txn_003", studentName: "Tigist Assefa", courseTitle: "UI/UX Design", amount: 399, status: "pending", date: "2026-03-06" },
  { id: "txn_004", studentName: "Abel Wondimu", courseTitle: "Flutter Development", amount: 549, status: "failed", date: "2026-03-03" },
  { id: "txn_005", studentName: "Hana Girma", courseTitle: "English Communication", amount: 249, status: "confirmed", date: "2026-03-02" },
];

export const MOCK_USER = {
  id: "user_001",
  fullName: "Kidist Mengistu",
  email: "kidist@example.com",
  coursesUnlocked: ["c1", "c3"],
  signupDate: "2026-01-15",
  profileImage: null,
};
