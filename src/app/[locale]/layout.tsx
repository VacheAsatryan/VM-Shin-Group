import { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Inter, Noto_Sans_Armenian } from "next/font/google";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const notoArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  variable: "--font-noto-armenian",
  display: "swap",
});

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  // Validate locale
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  // Load translations for the request
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${notoArmenian.variable} h-full antialiased dark`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans selection:bg-primary-yellow/30 selection:text-white">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
