import { NextResponse } from "next/server";

// Only enforce admin/staff via cookies; user/agent use client-side guards (localStorage)
const authPaths = ['/admin/login', '/admin'];

export async function middleware(request){
  try {
    const isAuthenticated = request.cookies.get('is_auth')?.value;
    const isRole = request.cookies.get("role")?.value;
    const path = request.nextUrl.pathname;

    // Handle admin route specifically
    if (path === '/admin' && !isAuthenticated) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // If hitting /admin/login and already authenticated, route accordingly
    if (path === '/admin/login' && isAuthenticated) {
      if (isRole === 'admin') return NextResponse.redirect(new URL('/admin', request.url));
      // Redirect all staff roles to staff1 dashboard
      const staffRoles = ['staff1', 'staff2', 'staff3', 'staff4'];
      if (staffRoles.includes(isRole)) {
        return NextResponse.redirect(new URL('/staff1/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/staff1/dashboard', request.url));
    }

    // Block staff users from accessing any admin routes
    if (path.startsWith('/admin') && path !== '/admin/login' && isAuthenticated) {
      const staffRoles = ['staff1', 'staff2', 'staff3', 'staff4'];
      if (staffRoles.includes(isRole)) {
        console.log('Middleware - BLOCKING staff access to admin route:', path);
        return NextResponse.redirect(new URL('/staff1/dashboard', request.url));
      }
    }

    return NextResponse.next()
  } catch (error) {
    console.error('Error occured while checking authentication:',error);
    return NextResponse.error();
  }
}

export const config = {
  matcher: ['/admin/:path*']
}