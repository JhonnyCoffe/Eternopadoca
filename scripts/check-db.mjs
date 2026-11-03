import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.join(process.cwd(), "data", "app.sqlite"));
const rows = db.prepare("SELECT id, code, data FROM orders").all();
console.log("Pedidos no banco sqlite:", rows.length);
for (const r of rows) {
  console.log("-", r.code, r.id);
}
const msgRows = db.prepare("SELECT id, order_id, data FROM messages").all();
console.log("Mensagens:", msgRows.length);
for (const m of msgRows) {
  console.log("-", m.id, m.order_id, m.data.substring(0, 80));
}
db.close();
