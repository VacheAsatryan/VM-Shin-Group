import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

// Next.js App Router requires a root layout. We pass through children to the dynamic [locale] layout.
export default function RootLayout({ children }: Props) {
  return children;
}
