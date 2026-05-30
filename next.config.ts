import type { NextConfig } from "next";
import { TASK_SUBMISSION_MAX_FILE_SIZE_BYTES } from "@/lib/upload-limits";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: TASK_SUBMISSION_MAX_FILE_SIZE_BYTES,
    },
  },
};

export default nextConfig;
