import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Add your custom middleware logic here if needed
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // Only allow access to admin routes if user is authenticated and has admin role
        return token?.role === "ADMIN";
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
