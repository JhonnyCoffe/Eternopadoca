import { promises as fs } from "fs";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "data", "data-requests.json");

export type DataRequest = {
  id: string;
  type: "access" | "deletion" | "rectification";
  name: string;
  email?: string;
  phone?: string;
  orderCode?: string;
  message?: string;
  createdAt: string;
  status: "pending" | "done" | "rejected";
};

async function readRequests(): Promise<DataRequest[]> {
  try {
    const raw = await fs.readFile(FILE_PATH, "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeRequests(requests: DataRequest[]): Promise<void> {
  await fs.writeFile(FILE_PATH, JSON.stringify(requests, null, 2));
}

export async function createDataRequest(input: Omit<DataRequest, "id" | "createdAt" | "status">): Promise<DataRequest> {
  const requests = await readRequests();
  const request: DataRequest = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "pending",
    ...input,
  };
  requests.push(request);
  await writeRequests(requests);
  return request;
}

export async function listDataRequests(): Promise<DataRequest[]> {
  return readRequests();
}

export async function updateDataRequestStatus(id: string, status: DataRequest["status"]): Promise<DataRequest | null> {
  const requests = await readRequests();
  const idx = requests.findIndex((r) => r.id === id);
  if (idx === -1) return null;
  requests[idx].status = status;
  await writeRequests(requests);
  return requests[idx];
}
