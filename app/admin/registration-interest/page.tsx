import RegistrationInterestTools from "@/components/admin/RegistrationInterestTools";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RegistrationInterestPage({ searchParams }: { searchParams: Promise<{ q?: string; sort?: string }> }) {
  const { q = "", sort = "newest" } = await searchParams;
  const supabase = createSupabaseServerClient();
  let query = supabase.from("registration_interest").select("id,first_name,email,created_at");
  const search = q.trim().replace(/[,%()]/g, "");
  if (search) query = query.or(`first_name.ilike.%${search}%,email.ilike.%${search}%`);
  const { data, error } = await query.order(sort === "oldest" ? "created_at" : sort === "email" ? "email" : "created_at", { ascending: sort === "oldest" || sort === "email" });
  if (error) throw new Error("Registration interest could not be loaded.");
  const rows = data ?? [];
  return <div className="space-y-5"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-wide text-[#D4A017]">Website Analytics</p><h1 className="mt-1 text-2xl font-black uppercase text-red-500">Registration Interest</h1></div><RegistrationInterestTools emails={rows.map((row) => row.email)} /></header>
    <form className="flex flex-wrap gap-3"><input name="q" defaultValue={q} aria-label="Search registration interest" placeholder="Search name or email" className="min-h-11 flex-1 border border-white/15 bg-[#111] px-3 text-sm"/><select name="sort" defaultValue={sort} aria-label="Sort registration interest" className="min-h-11 border border-white/15 bg-[#111] px-3 text-sm"><option value="newest">Newest</option><option value="oldest">Oldest</option><option value="email">Email</option></select><button className="bg-red-700 px-5 text-xs font-bold uppercase">Search</button></form>
    <div className="overflow-x-auto border border-white/10 bg-[#111]"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-neutral-500"><tr><th className="px-5 py-3">First Name</th><th className="px-5 py-3">Email Address</th><th className="px-5 py-3">Date Submitted</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} className="border-t border-white/5"><td className="px-5 py-3">{row.first_name || "—"}</td><td className="px-5 py-3">{row.email}</td><td className="px-5 py-3">{new Date(row.created_at).toLocaleString()}</td></tr>)}</tbody></table></div></div>;
}
