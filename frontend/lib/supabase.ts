import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ydjvvcdbhcnrzirg wbtp.supabase.co".replace(" ", "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkanZ2Y2RiaGNucnppcmd3YnRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NTE1NzUsImV4cCI6MjA5NDQyNzU3NX0.g3ZnNvoWo1P5nChlPOrZEPB5UAgDocIfhuxROnQeeVQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Document helpers
export async function listDocuments(userId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getAIMemory(userId: string) {
  const { data, error } = await supabase
    .from("ai_memory")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw error;
  return data || [];
}

export async function saveConversation(
  userId: string,
  message: string,
  response: string,
  model: string
) {
  await supabase.from("conversations").insert({
    user_id: userId,
    message,
    response,
    model,
    created_at: new Date().toISOString(),
  });
}

export async function uploadDocument(
  userId: string,
  file: File,
  title: string,
  content: string
) {
  const { data, error } = await supabase.from("documents").insert({
    user_id: userId,
    title,
    content,
    file_name: file.name,
    file_size: file.size,
    created_at: new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return data;
}
