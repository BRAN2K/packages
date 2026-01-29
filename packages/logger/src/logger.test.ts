import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import type { Request } from "express";
import { Logger } from "./logger";
import { LogLevel } from "./enum/log-level";

describe("Logger", () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
  });

  describe("initialization", () => {
    it("should create a logger instance with default config", () => {
      expect(logger).toBeDefined();
      expect(logger.config).toEqual({});
    });

    it("should use INFO level by default", () => {
      expect(logger.logger.level).toBe(LogLevel.INFO);
    });
  });

  describe("setters", () => {
    it("should set the log level", () => {
      logger.setLevel(LogLevel.DEBUG);
      expect(logger.logger.level).toBe(LogLevel.DEBUG);

      logger.setLevel(LogLevel.ERROR);
      expect(logger.logger.level).toBe(LogLevel.ERROR);
    });

    it("should set the service name", () => {
      logger.setService("test-service");
      expect(logger.config.service).toBe("test-service");
    });

    it("should set the request ID", () => {
      const requestId = "test-request-id-123";
      logger.setRequestId(requestId);
      expect(logger.config.requestId).toBe(requestId);
    });

    it("should set HTTP metadata", () => {
      logger.setHttp("GET", "/api/test", "localhost");
      expect(logger.config.http).toEqual({
        method: "GET",
        url: "/api/test",
      });
      expect(logger.config.host).toBe("localhost");
    });

    it("should set user information", () => {
      const user = { id: "user-123", email: "test@example.com" };
      logger.setUser(user);
      expect(logger.config.user).toEqual(user);
    });

    it("should reset the config to empty", () => {
      logger.setService("test-service");
      logger.setRequestId("test-id");
      logger.setUser({ id: "user-123", email: "test@example.com" });

      expect(logger.config).not.toEqual({});

      logger.reset();
      expect(logger.config).toEqual({});
    });

    it("should return config", () => {
      const config = logger.getConfig();

      expect(config.type).toBe("log");
    });

    it("should configure logger from Express request", () => {
      const mockRequest: Partial<Request> = {
        method: "POST",
        url: "/api/users",
        hostname: "example.com",
        headers: {
          "x-user-email": "user@example.com",
          "x-user-id": "user-456",
        },
      };

      logger.setEvent("api-service", mockRequest as Request);

      expect(logger.config.service).toBe("api-service");
      expect(logger.config.requestId).toBeDefined();
      expect(logger.config.user).toEqual({
        email: "user@example.com",
        id: "user-456",
      });
      expect(logger.config.http).toEqual({
        method: "POST",
        url: "/api/users",
      });
      expect(logger.config.host).toBe("example.com");
    });

    it("should reset config before setting new event", () => {
      logger.setService("old-service");

      const mockRequest: Partial<Request> = {
        method: "GET",
        url: "/test",
        hostname: "localhost",
        headers: {},
      };

      logger.setEvent("new-service", mockRequest as Request);

      expect(logger.config.service).toBe("new-service");
    });
  });

  describe("logging methods", () => {
    let traceSpy: ReturnType<typeof spyOn>;
    let debugSpy: ReturnType<typeof spyOn>;
    let infoSpy: ReturnType<typeof spyOn>;
    let warnSpy: ReturnType<typeof spyOn>;
    let errorSpy: ReturnType<typeof spyOn>;

    beforeEach(() => {
      traceSpy = spyOn(logger.logger, "trace");
      debugSpy = spyOn(logger.logger, "debug");
      infoSpy = spyOn(logger.logger, "info");
      warnSpy = spyOn(logger.logger, "warn");
      errorSpy = spyOn(logger.logger, "error");
    });

    it("should call trace with log entry", () => {
      const logEntry = { message: "trace message" };
      logger.trace(logEntry);
      expect(traceSpy).toHaveBeenCalled();
    });

    it("should call debug with log entry", () => {
      const logEntry = { message: "debug message" };
      logger.debug(logEntry);
      expect(debugSpy).toHaveBeenCalled();
    });

    it("should call info with log entry", () => {
      const logEntry = { message: "info message" };
      logger.info(logEntry);
      expect(infoSpy).toHaveBeenCalled();
    });

    it("should call warn with log entry", () => {
      const logEntry = { message: "warn message" };
      logger.warn(logEntry);
      expect(warnSpy).toHaveBeenCalled();
    });

    it("should call error with log entry", () => {
      const logEntry = { message: "error message" };
      logger.error(logEntry);
      expect(errorSpy).toHaveBeenCalled();
    });

    it("should include details in log entry", () => {
      const logEntry = {
        message: "test message",
        details: { key: "value", count: 42 },
      };
      logger.info(logEntry);
      expect(infoSpy).toHaveBeenCalled();
    });
  });
});
