// Configuración de OpenNext para Cloudflare: indica cómo adaptar Next.js al runtime de Cloudflare Workers con soporte Node.js.
import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  edgeExternals: ["node:crypto"],
  middleware: {
    external: false,
  },
  cloudflare: {
    dangerousDisableConfigValidation: true,
  },
};

export default config;
