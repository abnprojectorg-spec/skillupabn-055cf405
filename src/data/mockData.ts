// Categories remain as static reference data
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

// Re-export Course type for backward compat with CourseCard
export interface Course {
  id: string;
  title: string;
  instructor: string;
  category: string;
  description: string;
  shortDescription: string;
  price: number;
  thumbnail: string;
  videoUrl: string;
  isFree?: boolean;
  playlistId?: string;
  rating: number;
  students: number;
  lessons: number;
  duration: string;
}

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
