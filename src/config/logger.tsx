import pino from "pino";

const pinoConfig = {
  level: process.env.LOG_LEVEL || "info",
  base: undefined, // Elimina pid y hostname
};

const transport = process.env.NODE_ENV === "development"
  ? pino.transport({
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: false,
        translateTime: "SYS:standard",
        ignore: "pid,hostname",
      },
    })
  : undefined;

export const LOGGER = pino(pinoConfig, transport);

// Extensiones útiles para loguear objetos como console.log
export const logObject = (message: string, obj?: any) => {
  if (obj !== undefined && obj !== null) {
    LOGGER.info({ data: obj }, message);
  } else {
    LOGGER.info(message);
  }
};

export const logError = (message: string, error?: Error, context?: any) => {
  if (error instanceof Error) {
    LOGGER.error({ err: error, context }, message);
  } else {
    LOGGER.error(message);
  }
};

export const logDebug = (message: string, data?: any) => {
  if (data !== undefined && data !== null) {
    LOGGER.debug({ data }, message);
  } else {
    LOGGER.debug(message);
  }
};

export const logInfo = (message: string, data?: any) => {
  if (data !== undefined && data !== null) {
    LOGGER.info({ data }, message);
  } else {
    LOGGER.info(message);
  }
};