/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack(config, { dev }) {
    if (!dev && config.optimization?.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.filter(
        (plugin) => plugin?.constructor?.name !== "CssMinimizerPlugin"
      );
    }

    return config;
  }
};

export default nextConfig;
