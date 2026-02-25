/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,

  env: {
    // Vercel 배포 시 git SHA를 code_version으로 사용
    NEXT_PUBLIC_ROLLBAR_CODE_VERSION:
      process.env.NEXT_PUBLIC_ROLLBAR_CODE_VERSION ||
      process.env.VERCEL_GIT_COMMIT_SHA ||
      "unknown",
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "web-worker": false,
      };
    }
    return config;
  },

  experimental: {
    optimizePackageImports: [
      // Radix UI 컴포넌트들 - 트리 쉐이킹 최적화로 사용하는 컴포넌트만 번들에 포함
      "@radix-ui/react-accordion",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-collapsible",
      "@radix-ui/react-context-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-hover-card",
      "@radix-ui/react-menubar",
      "@radix-ui/react-navigation-menu",
      "@radix-ui/react-popover",
      "@radix-ui/react-progress",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slider",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-toggle",
      "@radix-ui/react-toggle-group",
      "@radix-ui/react-tooltip",
      // 아이콘 라이브러리 - 사용하는 아이콘만 번들에 포함
      "lucide-react",
      // 유틸리티 라이브러리 - 사용하는 함수만 번들에 포함
      "date-fns",
      "lodash",
      // 애니메이션 라이브러리 - 사용하는 컴포넌트만 번들에 포함
      "framer-motion",
      // 차트 라이브러리 - 사용하는 차트만 번들에 포함
      "recharts",
      // 드래그 앤 드롭 라이브러리 - 사용하는 기능만 번들에 포함
      "@dnd-kit/core",
      "@dnd-kit/sortable",
    ],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "lpgfbjohdashthkhxzab.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "jjrsknqxiqbzqiraexpc.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },
};

export default nextConfig;
