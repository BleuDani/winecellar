"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  });
  if (error) return { error: error.message };
  redirect("/");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirmPassword") as string;
  if (password !== confirm) return { error: "Passwords do not match" };
  const { error } = await supabase.auth.signUp({
    email: formData.get("email") as string,
    password,
  });
  if (error) return { error: error.message };
  redirect("/login?registered=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function changePassword(formData: FormData) {
  const password = formData.get("password") as string;
  const confirm = formData.get("confirmPassword") as string;
  if (password !== confirm) return { error: "Passwords do not match" };
  if (password.length < 6) return { error: "Password must be at least 6 characters" };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: error.message };
  return { error: null };
}
