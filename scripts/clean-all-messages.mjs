import { DatabaseSync } from "node:sqlite";
import path from "node:path";

const db = new DatabaseSync(path.join(process.cwd(), "data", "app.sqlite"));
db.exec("PRAGMA foreign_keys = ON;");
const delMsgs = db.prepare("DELETE FROM messages");
const info = delMsgs.run();
console.log("Mensagens deletadas:", info.changes);
db.close();
