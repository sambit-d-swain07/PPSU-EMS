import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export default async function TodosPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos, error } = await supabase.from("todos").select();

  return (
    <div className="p-8">
      <h1 className="text-xl font-bold mb-4">Supabase Connection Test</h1>
      {error && (
        <p className="text-sm text-amber-600 mb-2">
          Note: If the &quot;todos&quot; table is not created yet in Supabase, this will return empty or an error.
        </p>
      )}
      <ul className="list-disc pl-5">
        {todos?.map((todo) => (
          <li key={todo.id}>{todo.name}</li>
        ))}
      </ul>
      {(!todos || todos.length === 0) && (
        <p className="text-sm text-slate-500">No items found.</p>
      )}
    </div>
  );
}

