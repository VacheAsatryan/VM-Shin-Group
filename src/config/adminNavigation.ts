export interface AdminNavItem {
  id: string;
  translationKey: string;
  href: string;
  iconName: "dashboard" | "requests" | "documents" | "news" | "vacancies" | "seo";
  isPlaceholder?: boolean;
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "dashboard",
    translationKey: "dashboard",
    href: "/admin",
    iconName: "dashboard",
  },
  {
    id: "requests",
    translationKey: "requests",
    href: "/admin/requests",
    iconName: "requests",
  },
  {
    id: "documents",
    translationKey: "documents",
    href: "/admin/documents",
    iconName: "documents",
    isPlaceholder: true,
  },
  {
    id: "news",
    translationKey: "news",
    href: "/admin/news",
    iconName: "news",
  },
  {
    id: "vacancies",
    translationKey: "vacancies",
    href: "/admin/vacancies",
    iconName: "vacancies",
    isPlaceholder: true,
  },
  {
    id: "seo",
    translationKey: "seo",
    href: "/admin/seo",
    iconName: "seo",
    isPlaceholder: true,
  },
];
