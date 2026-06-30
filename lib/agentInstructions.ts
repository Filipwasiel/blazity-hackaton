import { AgentInstructions } from "./types";

const KEY = "agent-instructions-v1";

export function loadAgentInstructions(): AgentInstructions {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AgentInstructions) : {};
  } catch {
    return {};
  }
}

export function saveAgentInstructions(instructions: AgentInstructions): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(instructions));
}
