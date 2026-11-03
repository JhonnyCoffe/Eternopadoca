import { DatabaseSync } from "node:sqlite";
import path from "node:path";
const db = new DatabaseSync(path.join(process.cwd(), "data", "app.sqlite"));
console.log("TABELAS:", db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all());
console.log("ORDERS REMAINING:", db.prepare("SELECT count(*) as c FROM orders").get());
console.log("MESSAGES REMAINING:", db.prepare("SELECT count(*) as c FROM messages").get());
db.close();
