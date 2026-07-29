import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // There is a stray lockfile in the home directory; pin the root to this
  // project so Next stops inferring the wrong one.
  turbopack: {
    root: path.resolve(import.meta.dirname),
  },
};

export default nextConfig;
