const isGitHubPages=process.env.GITHUB_ACTIONS==='true';

/** @type {import('next').NextConfig} */
const config={
  output:'export',
  trailingSlash:true,
  basePath:isGitHubPages?'/JustinPlan2026':'',
  assetPrefix:isGitHubPages?'/JustinPlan2026':'',
  images:{unoptimized:true},
  turbopack:{root:process.cwd()},
};

export default config;
