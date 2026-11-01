import type { ChatMessage } from "@/lib/types";

export function messageAlignment(
  message: ChatMessage,
  mode: "loja" | "cliente",
): "left" | "right" {
  return message.from === mode ? "right" : "left";
}
