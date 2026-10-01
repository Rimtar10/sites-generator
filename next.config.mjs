/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Everything runs locally; no remote image optimisation needed.
  images: { unoptimized: true },
};

export default nextConfig;
