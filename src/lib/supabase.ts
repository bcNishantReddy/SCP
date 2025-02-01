import { createClient } from '@supabase/supabase-js';

// Direct configuration values for Supabase
const supabaseUrl = 'https://YOUR_PROJECT_URL.supabase.co';
const supabaseAnonKey = 'YOUR_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User types
export type UserRole = 'admin' | 'student' | 'faculty' | 'investor' | 'alumni';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  title?: string;
  bio?: string;
  avatar_url?: string;
  is_approved: boolean;
  created_at: string;
}

// Helper functions for authentication
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  return profile;
};

export const signUp = async (email: string, password: string, role: UserRole, name: string) => {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) throw authError;

  if (authData.user) {
    const { error: profileError } = await supabase.from('profiles').insert({
      id: authData.user.id,
      email,
      role,
      name,
      is_approved: role === 'admin',
      created_at: new Date().toISOString(),
    });

    if (profileError) throw profileError;
  }

  return authData;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Admin functions
export const createInitialAdmins = async () => {
  const adminEmails = ['iepdbossonomics1@gmail.com', 'bommireddyc.btech23@rvu.edu.in'];
  const password = 'IeP.d$@2025';

  for (const email of adminEmails) {
    try {
      await signUp(email, password, 'admin', 'Admin User');
      console.log(`Admin user created: ${email}`);
    } catch (error) {
      console.error(`Error creating admin user ${email}:`, error);
    }
  }
};

export const updateUserRole = async (userId: string, newRole: UserRole) => {
  const { error } = await supabase
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId);

  if (error) throw error;
};

export const approveUser = async (userId: string) => {
  const { error } = await supabase
    .from('profiles')
    .update({ is_approved: true })
    .eq('id', userId);

  if (error) throw error;
};