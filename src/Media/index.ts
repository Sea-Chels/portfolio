// web dev gif imports--------------------------------------
import mmConverter from './vid_milimeterConverter.gif'
import artistPortfolio from './artist-portfolio.gif'
import closedloop from './closedloop-logo.png'
import zipdrug from './zipdrug-logo.webp'
import sanctuary from './sanctuary-logo.png'
// artwork imports------------------------------------------
import bonnieAndClyde from './personalWork/a_bonnie-and-clyde.png'
import chillWitch from './personalWork/a_chill-witch.png'
import frogGiveUp from './personalWork/a_frog-give-up.png'
import granolaGhost from './personalWork/a_granola-ghost-illustration.png'
import screamingRaccoon from './personalWork/a_screaming-raccoon.png'
import witchCat from './personalWork/a_witch-cat.png'
import photo1 from './personalWork/photo-1.jpeg'
import photo2 from './personalWork/photo-2.jpeg'
import photo4 from './personalWork/photo-4.jpeg'
import photo5 from './personalWork/photo-5.jpeg'
import photo6 from './personalWork/photo-6.jpeg'
import photo7 from './personalWork/photo-7.jpeg'
import photo9 from './personalWork/photo-9.jpeg'
import photo10 from './personalWork/photo-10.jpeg'
import photo11 from './personalWork/photo-11.jpeg'
import photo13 from './personalWork/photo-13.jpeg'
import photo14 from './personalWork/photo-14.jpeg'
import photo16 from './personalWork/photo-16.jpeg'
import photo17 from './personalWork/photo-17.jpeg'
import photo18 from './personalWork/photo-18.jpeg'
import photo19 from './personalWork/photo-19.jpeg'
import photo21 from './personalWork/photo-21.jpeg'
import photo22 from './personalWork/photo-22.jpeg'
import photo23 from './personalWork/photo-23.jpeg'
import photo24 from './personalWork/photo-24.jpeg'
import photo25 from './personalWork/photo-25.jpeg'
import photo26 from './personalWork/photo-26.jpeg'

export interface Project {
  title: string
  path: string
  alt: string
  description: string
  website?: string
  link?: string
  appStore?: string
}

export interface Artwork {
  path: string
  alt: string
}

export const projects: Project[] = [
  {
    title: 'Sanctuary Innovations',
    path: sanctuary,
    alt: 'Sanctuary Innovations logo',
    description:
      "As a full-stack engineer at Sanctuary Innovations, I contributed across multiple areas of the company's consumer platform — architecting backend services for new features, implementing feature flags for safe progressive rollouts, and shipping end-to-end user-facing functionality with privacy and platform stability as priorities. I also led a full migration of the codebase from Create React App to Vite, which unblocked dependency upgrades, resolved long-standing security vulnerabilities, and dramatically improved local build and HMR performance.\n To reduce code-review bottlenecks and raise consistency across the team, I built a custom Claude Code plugin tailored to the project's conventions and integrated AI-assisted PR reviews directly into the development workflow. Pairing hands-on AI tooling with architectural ownership and cross-functional collaboration, this role let me blend product engineering with meaningful platform-level improvements.",
    website: 'https://www.sanctuaryinnovations.com/products',
  },
  {
    title: 'ClosedLoop.ai',
    path: closedloop,
    alt: 'ClosedLoop company logo',
    description:
      "As an engineer at ClosedLoop.ai, I contributed to two distinct products across the company's evolution. I joined to help deliver Healthy — an AI-driven, HIPAA-compliant consumer health platform designed to help users track symptoms, body measurements, and nutrition while building sustainable wellness habits. The app paired a personalized chatbot, smart notifications, and customizable checklists with AI-generated insights, acting as a personal health coach across iOS and web. From pre-launch through the product's full lifecycle, I contributed across the stack — TypeScript, React Native, and Python in a monorepo architecture — shipping fluid, cross-platform interfaces. Healthy was later sunset as the company strategically pivoted toward a B2B SaaS offering in response to a shifting competitive landscape, but it remains available on the App Store as a snapshot of what the team built together.\n After the pivot, I shifted focus to ClosedLoop's SaaS platform, where I primarily owned the frontend and API surface for the company's web-formatting product. The codebase leaned heavily on Claude Code workflows and GitHub Actions to automate large portions of the development lifecycle — from scaffolding and code generation to PR review — letting a lean team ship at a much larger team's velocity. The work let me pair traditional product engineering with hands-on AI-driven developer-experience tooling, blending feature delivery with continuous improvements to how code itself got written and shipped.",
    website: 'https://www.closedloop.ai/',
    appStore: 'https://apps.apple.com/us/app/healthy-habit-health-coach/id6473211484',
    link: 'https://github.com/closedloop-ai',
  },
  {
    title: 'Zipdrug / CarelonRx',
    path: zipdrug,
    alt: 'Zipdrug / CarelonRx website',
    description:
      "As part of a full-stack team, I helped build a pharmacy delivery platform for a company that was later acquired by Elevance Health. The product routed prescriptions for patients with chronic conditions, with protected health information (PHI) flowing through nearly every layer of the system — making security and data integrity core requirements rather than afterthoughts.\n On the frontend, I built user-facing interfaces with React and Redux. On the backend, I developed GraphQL endpoints, architected schemas, and worked with large PHI-bearing datasets through Sequelize and Node.js. I also integrated Twilio for patient-facing communication flows. The stack spanned JavaScript, Python, React, Redux, Apollo, Sequelize, Node.js, and Twilio — giving me hands-on experience across a healthcare-grade codebase from interface to database.",
    link: 'https://github.com/zipdrug',
    website: 'https://www.carelonrx.com/',
  },
  {
    title: 'Artist Portfolio',
    path: artistPortfolio,
    alt: 'artists portfolio',
    description:
      "A portfolio site built for an artist to showcase their work, organized into browsable categories with smooth client-side routing. Built with React, React Router, and Ant Design — chosen to deliver a clean, gallery-friendly UI quickly without the overhead of bespoke design work. Lightweight in scope but focused: the goal was a clear, low-friction way for visitors to navigate a curated body of work.",
    // website: 'https://www.spudmd.com/',
    link: 'https://github.com/Sea-Chels/Aaron-Portfolio',
  },
  {
    title: 'React Millimeter Converter',
    path: mmConverter,
    alt: 'A gif of a wepage containing a simple input box that converts inches to millimeters',
    description:
      "A small desktop utility that converts inches to millimeters, packaged with Electron so it runs as a standalone Windows executable — usable offline and outside the browser entirely. Originally built for a CAD designer who needed a fast, always-accessible converter that lived next to their other tools instead of buried in a tab. Built with Electron, React, and JavaScript.",
    website: 'https://sea-chels.github.io/aarons-converter/',
    link: 'https://github.com/Sea-Chels/aarons-converter',
  },
]

export const artworks: Artwork[] = [
  // --- Column 1 (top): two featured illustrations, then photos ---
  {
    path: bonnieAndClyde,
    alt: 'Bonnie and Clyde illustration',
  },
  {
    path: chillWitch,
    alt: 'Chill witch illustration',
  },
  {
    path: photo1,
    alt: 'soon to be project',
  },
  {
    path: photo2,
    alt: 'soon to be project',
  },
  {
    path: photo4,
    alt: 'soon to be project',
  },
  {
    path: photo24,
    alt: 'soon to be project',
  },
  {
    path: photo5,
    alt: 'soon to be project',
  },
  {
    path: photo25,
    alt: 'soon to be project',
  },
  {
    path: photo26,
    alt: 'soon to be project',
  },
  // --- Column 2 (top): two featured illustrations, then photos ---
  {
    path: witchCat,
    alt: 'Witch cat illustration',
  },
  {
    path: granolaGhost,
    alt: 'Granola ghost illustration',
  },
  {
    path: photo6,
    alt: 'soon to be project',
  },
  {
    path: photo7,
    alt: 'soon to be project',
  },
  {
    path: photo9,
    alt: 'soon to be project',
  },
  {
    path: photo10,
    alt: 'soon to be project',
  },
  {
    path: photo11,
    alt: 'soon to be project',
  },
  {
    path: photo13,
    alt: 'soon to be project',
  },
  // --- Column 3 (top): two featured illustrations, then photos ---
  {
    path: screamingRaccoon,
    alt: 'Screaming raccoon illustration',
  },
  {
    path: frogGiveUp,
    alt: 'Frog giving up illustration',
  },
  {
    path: photo14,
    alt: 'soon to be project',
  },
  {
    path: photo16,
    alt: 'soon to be project',
  },
  {
    path: photo17,
    alt: 'soon to be project',
  },
  {
    path: photo18,
    alt: 'soon to be project',
  },
  {
    path: photo19,
    alt: 'soon to be project',
  },
  {
    path: photo21,
    alt: 'soon to be project',
  },
  {
    path: photo22,
    alt: 'soon to be project',
  },
  {
    path: photo23,
    alt: 'soon to be project',
  },
]
