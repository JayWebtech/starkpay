import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Skip middleware for login page
  if (req.nextUrl.pathname === '/admin/login') {
    const { data: { session } } = await supabase.auth.getSession();
    console.log('Login page - Session:', session?.user?.email);
    
    if (session) {
      const { data: profile, error: profileError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      console.log('Login page - Profile:', profile, 'Error:', profileError);

      if (profile?.role === 'admin') {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
      }
    }
    
    return res;
  }

  // For all other admin routes, check authentication
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    console.log('Admin route - Session:', session?.user?.email, 'Error:', sessionError);

    if (!session) {
      console.log('No session found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // Verify admin role
    const { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    console.log('Admin route - Profile:', profile, 'Error:', profileError);

    if (!profile || profile.role !== 'admin') {
      console.log('No admin profile found, signing out and redirecting to login');
      await supabase.auth.signOut();
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
}; 