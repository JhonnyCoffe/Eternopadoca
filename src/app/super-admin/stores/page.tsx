import { getStores } from "@/lib/store-db";

export default async function SuperAdminStoresPage() {
  const stores = await getStores();
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 p-8">
      <h1 className="text-2xl font-black text-white mb-6">Super Admin — Lojas</h1>
      <div className="space-y-2">
        {stores.map((s) => (
          <div key={s.id} className="rounded-xl border border-white/[0.08] bg-[#0e0e13]/60 p-4 flex items-center justify-between">
            <div>
              <p className="font-bold text-white">{s.name}</p>
              <p className="text-xs text-zinc-500">{s.subdomain}</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300">Ativa</span>
          </div>
        ))}
        {stores.length === 0 && <p className="text-xs text-zinc-500">Nenhuma loja registrada.</p>}
      </div>
    </div>
  );
}
