/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: ["@boro/config", "@boro/database", "@boro/types", "@boro/ui", "@boro/validators"]
};

export default nextConfig;
