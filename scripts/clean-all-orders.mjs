import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.join(process.cwd(), "data", "app.sqlite"));

// Limpa todos os pedidos e mensagens de teste
const delOrders = db.prepare("DELETE FROM orders");
const infoOrders = delOrders.run();
console.log("Pedidos deletados:", infoOrders.changes);

const delMsgs = db.prepare("DELETE FROM messages");
const infoMsgs = delMsgs.run();
console.log("Mensagens deletadas:", infoMsgs.changes);

db.close();
