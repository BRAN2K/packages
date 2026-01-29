import { describe, it, expect } from "bun:test";
import { Logger, logger } from "./index";

describe("Logger exports", () => {
  it("should allow creating new logger instances", () => {
    const newLogger = new Logger();
    expect(newLogger).toBeInstanceOf(Logger);
    expect(newLogger).not.toBe(logger);
  });
});
