import { supabase } from './supabaseClient';

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function signUpTenantOwner(email: string, password: string) {
  // Usado no onboarding de novos clientes do SaaS (cadastro self-service).
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}
