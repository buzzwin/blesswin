/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'firebasestorage.googleapis.com', 'image.tmdb.org', 'xsgames.co', 'graph.facebook.com']
  }
};

module.exports = nextConfig;
