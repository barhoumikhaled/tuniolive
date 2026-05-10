import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isErpRoute = createRouteMatcher(["/erp(.*)"]);

const isErpPublicRoute = createRouteMatcher([
  "/erp/sign-in(.*)",
  "/erp/sign-up(.*)",
  "/api/health",
]);

export default clerkMiddleware(async (auth, req) => {
  // Only apply Clerk auth to /erp routes
  if (isErpRoute(req) && !isErpPublicRoute(req)) {
    await auth.protect();
  }
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
