import { readdirSync } from "fs";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import AdminShell from "@/components/admin/AdminShell";
import { saveProduct } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function FotosPage() {
  const session = await getSession();
  const db = await getDb();
  if (!session || session.role !== "dono") {
    return <div>Acesso negado.</div>;
  }

  let fotos: string[] = [];
  try {
    fotos = readdirSync("public/uploads/fotos/").filter((f: string) =>
      f.endsWith(".jpg") || f.endsWith(".png") || f.endsWith(".jpeg"),
    );
  } catch {
    fotos = [];
  }

  const categories = db.categories;

  return (
    <AdminShell
      storeName={db.settings.storeName}
      newOrders={0}
      unreadChats={0}
      role={session.role}
      userName={session.name ?? "Administrador"}
      isOpen={db.settings.isOpen}
    >
      <div className="px-4 py-8">
        <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
          Extração de fotos
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          {fotos.length} fotos · vincule produtos a cada uma
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {fotos.map((foto) => (
            <div key={foto} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <img
                src={`/uploads/fotos/${foto}`}
                alt={foto}
                className="mb-3 h-48 w-full rounded-xl object-cover"
              />
              <h3 className="text-sm font-bold text-zinc-100 truncate">{foto}</h3>
              <p className="text-xs text-zinc-500">Vincule produtos abaixo</p>

              <form action={async (formData) => {
                "use server";
                await saveProduct({
                  categoryId: String(formData.get("categoryId")),
                  name: String(formData.get("name")),
                  description: String(formData.get("description") ?? ""),
                  price: String(formData.get("price")),
                  imageUrl: `/uploads/fotos/${foto}`,
                  active: true,
                  featured: false,
                  badge: "",
                  cost: "",
                  stock: String(formData.get("stock") ?? "10"),
                  trackStock: true,
                  lowStockAt: "5",
                });
              }} className="mt-3 space-y-2">
                <input type="hidden" name="foto" value={foto} />
                <input
                  name="name"
                  placeholder="Nome do produto"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white placeholder-zinc-500"
                />
                <select
                  name="categoryId"
                  className="w-full rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white"
                >
                  {categories.map((c: { id: string; name: string; emoji: string }) => (
                    <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <input
                    name="price"
                    placeholder="Preço"
                    className="w-1/2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white placeholder-zinc-500"
                  />
                  <input
                    name="stock"
                    placeholder="Qtd estoque"
                    className="w-1/2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs text-white placeholder-zinc-500"
                    defaultValue="10"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-rose-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-600"
                >
                  Adicionar produto
                </button>
              </form>
            </div>
          ))}
        </div>
      </div>
    </AdminShell>
  );
}
