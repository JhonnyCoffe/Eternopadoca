import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.join(process.cwd(), "data", "app.sqlite"));

// Deletar pedido por código
const deleteOrder = db.prepare("DELETE FROM orders WHERE code = ?");
const info = deleteOrder.run("YW8B");
console.log("Pedidos deletados (YW8B):", info.changes);

// Deletar mensagens de teste (se ainda existirem, por conteúdo ou por referência)
// Como mensagens têm referência a orders com ON DELETE CASCADE, já foram removidas.
// Mas vamos garantir mensagens com texto de teste caso não tenha vínculo correto.
const deleteMsg = db.prepare("DELETE FROM messages WHERE data LIKE ?");
const msgInfo = deleteMsg.run('%"Teste chat E2E"%');
console.log("Mensagens de teste deletadas:", msgInfo.changes);

db.close();
