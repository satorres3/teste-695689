/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['supabase.com', 'cqzfwnyhxmmasjannfvx.supabase.co'], // Add your Supabase storage domain
  },
  env: {
    CUSTOM_KEY: 'howtomecm-website',
  },
}

module.exports = nextConfig