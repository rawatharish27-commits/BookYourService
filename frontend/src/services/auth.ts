import { supabase } from "../lib/supabase";

export async function signup(email: string, password: string, role: "customer" | "provider") {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  await supabase.from("users").insert({
    id: data.user?.id,
    email,
    role,
  });

  if (role === "provider") {
    await supabase.from("service_providers").insert({
      user_id: data.user?.id,
    });
  }

  if (role === "customer") {
    await supabase.from("customers").insert({
      user_id: data.user?.id,
    });
  }
}
