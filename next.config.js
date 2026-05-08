/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'kngjfhugorxhnwydnftc.supabase.co' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/inquiry.html',
        destination: '/',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
