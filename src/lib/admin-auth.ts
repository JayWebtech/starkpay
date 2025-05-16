import { supabase } from './supabase';

export type AdminUser = {
  id: string;
  email: string;
  role: 'admin';
};

export async function signInAdmin(email: string, password: string) {
  try {
    console.log('Attempting to sign in admin:', email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in successful, verifying admin role');

    // Verify if the user has admin role
    const { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', data.user.id)
      .single();

    console.log('Admin profile check:', profile, 'Error:', profileError);

    if (profileError || profile?.role !== 'admin') {
      console.log('User is not an admin, signing out');
      await supabase.auth.signOut();
      throw new Error('Unauthorized access');
    }

    console.log('Admin verification successful');
    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Admin sign in error:', error);
    throw error;
  }
}

export async function signOutAdmin() {
  try {
    console.log('Signing out admin');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error);
      throw error;
    }
    console.log('Sign out successful');
  } catch (error) {
    console.error('Admin sign out error:', error);
    throw error;
  }
}

export async function getCurrentAdmin() {
  try {
    console.log('Checking current admin session');
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session check error:', error);
      throw error;
    }
    
    if (!session) {
      console.log('No active session found');
      return null;
    }

    console.log('Session found, verifying admin role for:', session.user.email);

    const { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    console.log('Admin profile check:', profile, 'Error:', profileError);

    if (profileError || profile?.role !== 'admin') {
      console.log('User is not an admin, signing out');
      await supabase.auth.signOut();
      return null;
    }

    console.log('Admin verification successful');
    return session.user;
  } catch (error) {
    console.error('Get current admin error:', error);
    return null;
  }
} 