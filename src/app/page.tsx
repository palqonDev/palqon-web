import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data, error } = await supabase.from("ping").select("*").limit(1);

  return (
    <main style={{ padding: 24 }}>
      <h1>PalqOn 🚀</h1>
      <pre>{JSON.stringify({ data, error }, null, 2)}</pre>
    </main>
  );
}
