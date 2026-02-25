type LogLevel = "error" | "warning" | "info" | "debug";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private log(level: LogLevel, message: string, context?: LogContext) {
    const logFn =
      level === "error" ? console.error : level === "warning" ? console.warn : console.log;
    logFn(`[${level.toUpperCase()}]`, message, context ?? "");
  }

  error(message: string, context?: LogContext) {
    this.log("error", message, context);
  }

  warning(message: string, context?: LogContext) {
    this.log("warning", message, context);
  }

  info(message: string, context?: LogContext) {
    this.log("info", message, context);
  }

  debug(message: string, context?: LogContext) {
    this.log("debug", message, context);
  }
}

export const logger = new Logger();
