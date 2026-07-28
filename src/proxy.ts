import { type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "./lib/supabase/middleware";

const handleIntl = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const intlResponse = handleIntl(request);
  return await updateSession(request, intlResponse);
}

export const config = {
  // Matcher for internationalized routes including un-prefixed admin routes
  matcher: [
    "/",
    "/(hy|ru|en)/:path*",
    "/admin",
    "/admin/:path*",
  ],
};
