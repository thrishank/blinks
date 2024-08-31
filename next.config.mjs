/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "./app/api/actions/poll/*": ["./public/fonts/**/*"],
    },
  },
};

export default nextConfig;
