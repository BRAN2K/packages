import pino from "pino";
import { LogLevel } from "./enum/log-level";
import { randomUUID } from "crypto";
import type { Request } from "express";
import type { LoggerUser } from "./interfaces/logger-user";
import type { LoggerConfig, LogEntry } from "./interfaces/logger-config";

export class Logger {
  logger: pino.Logger;
  config: LoggerConfig;

  constructor() {
    this.config = {};
    this.logger = pino({
      base: null,
      messageKey: "message",
      formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
      },
    });

    this.setLevel((process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO);
  }

  setLevel(level: LogLevel): void {
    this.logger.level = level;
  }

  setService(service: string): void {
    this.config.service = service;
  }

  setRequestId(requestId: string): void {
    this.config.requestId = requestId;
  }

  setHttp(method: string, url: string, host: string): void {
    const http = { method, url };

    this.config.http = http;
    this.config.host = host;
  }

  setUser(user: LoggerUser): void {
    this.config.user = user;
  }

  reset(): void {
    this.config = {};
  }

  getConfig() {
    return {
      created_at: new Date().toISOString(),
      type: "log",
      ...this.config,
    };
  }

  setEvent(service: string, event: Request): void {
    this.reset();
    this.setService(service);
    this.setRequestId(randomUUID());

    const { headers } = event;

    this.setUser({
      email: headers["x-user-email"] as string,
      id: headers["x-user-id"] as string,
    });

    this.setHttp(event.method, event.url, event.hostname);
  }

  trace(log: LogEntry): void {
    const config = this.getConfig();
    this.logger.child(config).trace(log);
  }

  debug(log: LogEntry): void {
    const config = this.getConfig();
    this.logger.child(config).debug(log);
  }

  info(log: LogEntry): void {
    const config = this.getConfig();
    this.logger.child(config).info(log);
  }

  warn(log: LogEntry): void {
    const config = this.getConfig();
    this.logger.child(config).warn(log);
  }

  error(log: LogEntry): void {
    const config = this.getConfig();
    this.logger.child(config).error(log);
  }
}
