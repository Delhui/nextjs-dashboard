import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
    // suppress errors for missing 'import React' in files
    "react/react-in-jsx-scope": "off",
    // allow jsx syntax in js files (for next.js project)
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }], //should add ".ts" if typescript project
};

export default nextConfig;
