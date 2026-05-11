import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

export const LOGGER = pino(
    {
        level: process.env.LOG_LEVEL || "info",
    },
    isProduction ? pino.destination() : process.stdout
);