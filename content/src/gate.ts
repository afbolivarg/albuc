import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { bookDir } from "./paths";
import type { Gate, GateStatus } from "./types";

export function gatePath(slug: string) {
  return join(bookDir(slug), "gate.json");
}

export function readGate(slug: string): Gate | null {
  const path = gatePath(slug);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as Gate;
}

export function writeGate(slug: string, gate: Gate) {
  mkdirSync(bookDir(slug), { recursive: true });
  writeFileSync(gatePath(slug), `${JSON.stringify(gate, null, 2)}\n`);
}

export function setGate(
  slug: string,
  status: GateStatus,
  notes = "",
  approvedBy: string | null = null,
): Gate {
  const now = new Date().toISOString();
  const prev = readGate(slug);
  const gate: Gate = {
    status,
    notes: notes || prev?.notes || "",
    updatedAt: now,
    approvedAt: status === "APPROVED" ? now : null,
    approvedBy: status === "APPROVED" ? approvedBy ?? "andres" : null,
  };
  writeGate(slug, gate);
  return gate;
}

export function assertApproved(slug: string): Gate {
  const gate = readGate(slug);
  if (!gate || gate.status !== "APPROVED") {
    const status = gate?.status ?? "missing";
    throw new Error(
      `Publish blocked: ${slug} is ${status}. Andrés must approve first (bun run content:approve ${slug}).`,
    );
  }
  return gate;
}
