import canvaLogo from '../../assets/logo/canva.jpeg'
import cursorLogo from '../../assets/logo/cursor.webp'
import figmaLogo from '../../assets/logo/figma.png'
import framerLogo from '../../assets/logo/framer.jpeg'
import gsapLogo from '../../assets/logo/gsap.svg'
import mongodbLogo from '../../assets/logo/mongodb.png'
import nextJsLogo from '../../assets/logo/nextjs.jpeg'
import nodeJsLogo from '../../assets/logo/nodejs.png'
import reactLogo from '../../assets/logo/react.png'
import stripeLogo from '../../assets/logo/stripe.jpeg'
import supabaseLogo from '../../assets/logo/supabase.jpeg'
import tailwindLogo from '../../assets/logo/tailwindcss.jpeg'
import typescriptLogo from '../../assets/logo/typescript.png'
import vscodeLogo from '../../assets/logo/vscode.jpeg'
import neonLogo from '../../assets/logo/neon.jpeg'
import wordpressLogo from '../../assets/logo/wordpress.jpeg'
import lenisLogo from '../../assets/logo/lenis.png'
import javascriptLogo from '../../assets/logo/js.png'
import cssLogo from '../../assets/logo/css.png'
import htmlLogo from '../../assets/logo/html.png'
import githubLogo from '../../assets/logo/github.png'
const assetMap = {
  react: { src: reactLogo, alt: 'React' },
  nextjs: { src: nextJsLogo, alt: 'Next.js' },
  tailwindcss: { src: tailwindLogo, alt: 'Tailwind CSS' },
  typescript: { src: typescriptLogo, alt: 'TypeScript' },
  mongodb: { src: mongodbLogo, alt: 'MongoDB' },
  nodejs: { src: nodeJsLogo, alt: 'Node.js' },
  stripe: { src: stripeLogo, alt: 'Stripe' },
  supabase: { src: supabaseLogo, alt: 'Supabase' },
  figma: { src: figmaLogo, alt: 'Figma' },
  framer: { src: framerLogo, alt: 'Framer' },
  canva: { src: canvaLogo, alt: 'Canva' },
  gsap: { src: gsapLogo, alt: 'GSAP' },
  cursor: { src: cursorLogo, alt: 'Cursor' },
  vscode: { src: vscodeLogo, alt: 'VS Code' },
  neon: { src: neonLogo, alt: 'Neon' },
  wordpress: { src: wordpressLogo, alt: 'WordPress' },
  lenis: { src: lenisLogo, alt: 'Lenis' },
  javascript: { src: javascriptLogo, alt: 'JavaScript' },
  css: { src: cssLogo, alt: 'CSS' },
  html: { src: htmlLogo, alt: 'HTML' },
  github: { src: githubLogo, alt: 'GitHub' },
}

const aliasMap = {
  next: 'nextjs',
  nextjs13: 'nextjs',
  nextjs14: 'nextjs',
  tailwind: 'tailwindcss',
  tailwindcss3: 'tailwindcss',
  reactjs: 'react',
  ts: 'typescript',
  typescriptlang: 'typescript',
  mongo: 'mongodb',
  mongodatabase: 'mongodb',
  node: 'nodejs',
  nodejs18: 'nodejs',
  vscode: 'vscode',
  neon: 'neon',
  wordpress: 'wordpress',
  lenis: 'lenis',
  javascript: 'javascript',
  css: 'css',
  html: 'html',
  github: 'github',
}

const normalise = (value) => {
  if (!value) return ''
  return value
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

export const getLogoAsset = (name) => {
  const normalised = normalise(name)
  const key = aliasMap[normalised] || normalised
  return assetMap[key] || null
}


