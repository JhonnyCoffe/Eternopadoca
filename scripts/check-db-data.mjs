import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.join(process.cwd(), "data", "app.sqlite"));
const rows = db.prepare("SELECT id, code, data FROM orders").all();
for (const r of rows) {
  const d = JSON.parse(r.data);
  console.log("PEDIDO", r.code, "cliente=", d.clientName || d.client?.name, "valor=", d.total, "status=", d.status);
}
const msgRows = db.prepare("SELECT id, order_id, data FROM messages").all();
for (const m of msgRows) {
  const d = JSON.parse(m.data);
  console.log("MSG", m.id, "text=", d.text || d.content || d.body, "sender=", d.sender);
}
db.close();
