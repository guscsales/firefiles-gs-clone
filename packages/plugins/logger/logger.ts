/** biome-ignore-all lint/suspicious/noConsole: logger */
/** biome-ignore-all lint/suspicious/noExplicitAny: logger */

export const createLoggerClient = (namespace: string) => ({
  info(message: string, data: any = '') {
    console.info(`[INFO][${namespace}] ${message}`, data);
  },
  error(message: string, data: any = '') {
    console.error(`[ERROR][${namespace}] ${message}`, data);
  },
  warn(message: string, data: any = '') {
    console.warn(`[WARN][${namespace}] ${message}`, data);
  },
  debug(message: string, data: any = '') {
    console.debug(`[DEBUG][${namespace}] ${message}`, data);
  },
  trace(message: string, data: any = '') {
    console.trace(`[TRACE][${namespace}] ${message}`, data);
  },
  fatal(message: string, data: any = '') {
    console.error(`[FATAL][${namespace}] ${message}`, data);
  }
});
