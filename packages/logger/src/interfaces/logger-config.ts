import type { LoggerUser } from "./logger-user";

export interface LoggerConfig {
  user?: LoggerUser;
  host?: string;
  http?: { method: string; url: string };
  requestId?: string;
  service?: string;
}

export interface LogEntry {
  message: string;
  details?: Record<string, unknown>;
}
