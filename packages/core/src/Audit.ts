import { Storage } from "./Storage";
import { EntityId } from "./Formula";
import { v4 as uuidv4 } from "uuid";

export type AuditAction = 
  | "VAULT_SETUP" 
  | "VAULT_UNLOCK" 
  | "PASSWORD_RESET" 
  | "NOTE_CREATED" 
  | "NOTE_UPDATED" 
  | "NOTE_DELETED" 
  | "SECURITY_ALERT"
  | "DOCTOR_FIX";

export interface AuditEntry {
  id: EntityId;
  timestamp: string;
  action: AuditAction;
  details: string;
  metadata?: Record<string, unknown>;
}

export const Audit = {
  /**
   * Logs a new action to the audit trail
   */
  async log(action: AuditAction, details: string, metadata?: Record<string, unknown>): Promise<void> {
    const entry: AuditEntry = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      action,
      details,
      metadata
    };

    try {
      // We use a dedicated 'audit' store in the storage
      const existingRaw = await Storage.getAll("kv"); // Using KV for simple sequential logs for now
      // Actually, better to use a dedicated collection if the adapter supports it, 
      // but current FileAdapter/Storage is schema-locked. 
      // I'll use 'kv' with a specific prefix.
      
      await Storage.set("kv", `audit_${entry.timestamp}_${entry.id}`, entry);
      
      if (process.env.DEBUG === "true") {
        console.log(`[AUDIT] ${entry.action}: ${entry.details}`);
      }
    } catch (e) {
      console.error("[AUDIT_ERROR] Failed to write log:", e);
    }
  },

  /**
   * Retrieves all logs sorted by timestamp (newest first)
   */
  async getLogs(limit: number = 50): Promise<AuditEntry[]> {
    try {
      const allKv = await Storage.getAll("kv") as any[];
      const logs = allKv
        .filter(item => item && item.id && item.timestamp && item.action)
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      
      return logs.slice(0, limit);
    } catch {
      return [];
    }
  }
};
