import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Supabase Storage 공개 URL 호스트 화이트리스트.
    // 패턴: https://{project}.supabase.co/storage/v1/object/public/<bucket>/<path>
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;
