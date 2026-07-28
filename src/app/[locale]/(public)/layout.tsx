import { ReactNode } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface PublicLayoutProps {
  children: ReactNode;
}

/**
 * Shared layout for all public website routes.
 * Renders the public Header and Footer exclusively for public pages.
 * Admin pages (/[locale]/admin/*) and Login (/[locale]/admin/login) remain outside this layout.
 */
export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 flex flex-col pt-20">{children}</main>
      <Footer />
    </div>
  );
}
