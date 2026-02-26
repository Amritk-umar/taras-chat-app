import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes (like sign-in or sign-up)
const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)']);

export default clerkMiddleware(async (auth, request) => {
  // If it's not a public route, protect it with Clerk
  if (!isPublicRoute(request)) {
    await await auth.protect(); 
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};