import pino from "pino";

export const LOGGER = pino(
    {
        level: process.env.LOG_LEVEL || "info",
    },
    process.env.NODE_ENV === "development"
        ? pino.transport({
            target: "pino-pretty",
            options: {
                colorize: true,
            },
        })
        : undefined
);