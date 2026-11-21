import { lazy } from 'react'
import newityLogo from '../Media/newity-logo.webp'
import sanctuaryLogo from '../Media/sanctuary-logo.png'
import closedloopLogo from '../Media/closedloop-logo.png'
import zipdrugLogo from '../Media/zipdrug-logo.webp'
import diyHub from '../Media/diy-hub.jpg'
import artistPortfolio from '../Media/artist-portfolio.gif'
import mmConverter from '../Media/vid_milimeterConverter.gif'
import type { CaseStudy } from './types'

export const caseStudies: CaseStudy[] = [
  {
    id: 'newity',
    title: 'NEWITY',
    role: 'Product Engineer · AI R&D',
    kind: 'job',
    image: newityLogo,
    alt: 'NEWITY logo',
    logoBackground: '#083df4',
    summary:
      'Owning the platform foundations and AI research at a small-business lending company: the design system, the access-control model and the R&D behind new products.',
    concept: {
      name: 'Role-based access control',
      teaser: 'One permission model for every role in the loan lifecycle, enforced the same way everywhere.',
    },
    challenge:
      'NEWITY connects small businesses with SBA 7(a) and term loans and sells lending software to enterprise partners. Lending is regulated, document-heavy and split across specialists (underwriters, credit managers, closers), so every feature has to respect who may see and decide what. I work as an owner across that surface: running my own AI research, deciding what users actually need, and building the foundations other features stand on.',
    approach: [
      'Drive AI research and R&D in Python, taking ideas from experiment to prototype to production feature.',
      'Architected the RBAC system: one permission model that maps underwriters, credit managers, closers and admins onto what each can view, edit, approve and close.',
      'Built the design system from scratch: the tokens, components and patterns the product is built from.',
      'Own features end to end, from user conversations and product decisions through design, implementation and release.',
    ],
    decisions: [
      {
        call: 'Check permissions, never roles',
        why: 'Code asks can(user, "decisions:approve"), so adding or reshaping a role is a data change, not a hunt through every screen for role === checks.',
      },
      {
        call: 'Roles compose instead of duplicating',
        why: 'A credit manager inherits underwriting and adds approval; admins inherit both branches. Each grant is defined once, so roles can’t quietly drift apart.',
      },
      {
        call: 'The design system is the shared contract',
        why: 'Tokens and components give design and engineering one vocabulary, so new features are consistent by default instead of by review.',
      },
      {
        call: 'Prove AI ideas before productizing them',
        why: 'Research runs as Python experiments first, and only what holds up gets built into the product. R&D stays fast without destabilizing the platform.',
      },
    ],
    outcome:
      'Foundations the whole platform builds on: one design language, one permission model, and a research loop that turns AI experiments into product.',
    stack: ['Python', 'AI / LLMs', 'TypeScript', 'React', 'Design systems', 'RBAC'],
    links: { website: 'https://newitymarket.com/' },
    demoIntro:
      'A simplified model of the pattern. Each role lists only what it adds and inherits the rest: a credit manager is an underwriter who can also approve, and an admin inherits from both the credit manager and closer branches. The UI asks can(role, permission), never role === "admin". Switch roles to see what unlocks.',
    Demo: lazy(() => import('./demos/RbacDemo')),
  },
  {
    id: 'sanctuary',
    title: 'Sanctuary Innovations',
    role: 'Full-Stack Engineer',
    kind: 'job',
    image: sanctuaryLogo,
    alt: 'Sanctuary Innovations logo',
    summary:
      'Designed and shipped end-to-end encrypted messaging across the full stack, alongside encrypted financial data, flag-gated rollouts and a build migration that unblocked the codebase.',
    concept: {
      name: 'End-to-end encryption',
      teaser: 'Messages and keys are stored only as ciphertext the database can’t read.',
    },
    challenge:
      'Sanctuary’s consumer platform carries private conversations and creators’ banking details. Privacy had to be guaranteed by the architecture, not promised by policy: a breached database or a curious insider should yield nothing readable. All of it had to ship without disrupting existing users, on a codebase held back by an aging Create React App build.',
    approach: [
      'Designed and built end-to-end encrypted messaging across the client, the key service and the database.',
      'Used a layered key design: each person has their own keys, each conversation has its own key, and only the people in it can unlock it.',
      'Kept private keys locked with each user’s password, so the server stores only ciphertext.',
      'Also introduced feature flags for progressive rollouts, led a build-tooling migration, and brought AI-assisted PR review into the team’s workflow.',
    ],
    decisions: [
      {
        call: 'Keys live with the user, not the server',
        why: 'Keys are locked in the browser before they’re stored, so a breached database yields only ciphertext. The trade-off is deliberate: the server can’t read or search messages.',
      },
      {
        call: 'Hybrid encryption',
        why: 'Slow public-key crypto only protects small keys, while fast symmetric crypto encrypts the messages. Adding someone to a conversation means sharing one key, not re-encrypting history.',
      },
      {
        call: 'Version everything',
        why: 'Keys and messages record how they were encrypted, so keys can be rotated and algorithms upgraded without breaking older history.',
      },
      {
        call: 'Make every guess expensive',
        why: 'Password-based key unlocking is deliberately slow and key endpoints are rate limited, so brute-force attacks don’t scale.',
      },
    ],
    outcome:
      'Private messages, keys and financial data are stored only as ciphertext, with a key model that supports rotation and algorithm upgrades without migrations that break history. The Vite migration unblocked dependency upgrades, resolved long-standing security vulnerabilities and dramatically sped up builds and HMR.',
    stack: ['TypeScript', 'React', 'Web Crypto API', 'Node.js', 'Express', 'Prisma', 'PostgreSQL', 'Vite', 'Claude Code'],
    links: { website: 'https://www.sanctuaryinnovations.com/products' },
    demoIntro:
      'A working model of the architecture, running real Web Crypto in your browser. Each user has an RSA key pair whose private half is wrapped with their password, and the conversation’s AES-256-GCM key is wrapped once per participant. The middle column is everything the database holds. Send a message, let the server try to read it, flip a bit in transit, or unlock Bob’s browser with the wrong password.',
    Demo: lazy(() => import('./demos/E2eDemo')),
  },
  {
    id: 'closedloop',
    title: 'ClosedLoop.ai',
    role: 'Software Engineer',
    kind: 'job',
    image: closedloopLogo,
    alt: 'ClosedLoop company logo',
    summary:
      'A HIPAA-compliant AI health coach on iOS and web, built as a multi-agent system that converses, logs health data and watches for risk in the same turn.',
    concept: {
      name: 'Multi-agent orchestration',
      teaser: 'One message, several specialist agents in parallel, each behind its own guardrail.',
    },
    challenge:
      'Healthy had to hold a natural conversation while turning what people said into structured health data and noticing when a message signaled real clinical risk. One prompt doing all of that would be slow, hard to test and impossible to trust with health data. Then the market shifted, and a lean team had to keep shipping through a pivot to B2B SaaS.',
    approach: [
      'Helped build the coach as a team of specialist AI agents on Google ADK that work on each message at the same time: one talks, one quietly logs health data, one watches for risk.',
      'Put guardrails at each step, from input checks to safety screening that can stop a reply before anyone sees it.',
      'Built the coach’s plans and daily checklists, from the agents through to storage.',
      'Built the real-time path to the app, so replies stream in and logged data appears under the message it came from, where people can correct it.',
      'After the pivot, owned the frontend and API of the web-formatting product and built delivery automation around Claude Code.',
    ],
    decisions: [
      {
        call: 'Parallel specialists, not one mega-prompt',
        why: 'Each agent has one job, so it can be tested and tuned on its own, and the extra work adds no wait to the reply.',
      },
      {
        call: 'Gate the expensive check',
        why: 'Most messages carry no health risk. A quick screen runs on every message, and the deeper check runs only when it’s needed.',
      },
      {
        call: 'Moderation can veto the reply',
        why: 'The safety check runs alongside the reply and can stop it. A flagged message gets support resources, never an AI answer.',
      },
      {
        call: 'Transfers persist across turns',
        why: 'When the coach hands a conversation to a specialist, the next message stays with that specialist instead of starting over.',
      },
    ],
    outcome:
      'Healthy shipped on iOS and web and remains on the App Store, with conversation, data capture and risk detection running in a single turn. The same team then carried that pace through the pivot on an AI-automated delivery pipeline.',
    stack: ['Python', 'Google ADK', 'FastAPI', 'PostgreSQL', 'TypeScript', 'React Native', 'Socket.IO', 'Claude Code'],
    links: {
      website: 'https://www.closedloop.ai/',
      appStore: 'https://apps.apple.com/us/app/healthy-habit-health-coach/id6473211484',
      github: 'https://github.com/closedloop-ai',
    },
    demoIntro:
      'Send the health coach a message and watch one turn move through a simplified agent system: an input check, three agents working in parallel, a safety screen, then the updates sent to the app. Simple keyword rules stand in for the AI so it runs in your browser.',
    Demo: lazy(() => import('./demos/AgentDemo')),
  },
  {
    id: 'zipdrug',
    title: 'Zipdrug / CarelonRx',
    role: 'Full-Stack Engineer',
    kind: 'job',
    image: zipdrugLogo,
    alt: 'Zipdrug / CarelonRx logo',
    summary:
      'A bilingual, browser-based call center on Twilio inside a PHI-heavy pharmacy platform, through to its acquisition by Elevance Health.',
    concept: {
      name: 'Bilingual call routing',
      teaser: 'Every call reaches someone who speaks the member’s language and knows their plan.',
    },
    challenge:
      'Zipdrug routed prescriptions for patients with chronic conditions, and much of the care happened over the phone. Care managers had to call and take calls from members in English and Spanish across Medicare Advantage, Commercial and Medicaid plans, hand calls off without dropping anyone, and do it all inside a system where protected health information (PHI) flowed through nearly every layer.',
    approach: [
      'Built a browser-based call center on Twilio Voice for care managers to call and take calls from members.',
      'Ran it in English and Spanish, routing each call to someone who speaks the member’s language and knows their plan, with voicemail for callback when no one is free.',
      'Supported warm transfers, supervisor coaching and interpreters, with call status kept live on every screen.',
      'Built GraphQL APIs and React interfaces over protected health data.',
    ],
    decisions: [
      {
        call: 'Every call is a conference',
        why: 'Transfers, coaching and three-way calls become people joining or leaving the same call, so members are never dropped during a handoff.',
      },
      {
        call: 'Language and plan are requirements, not preferences',
        why: 'A Spanish-speaking member should never land with someone who can’t help them. Routing would rather take a voicemail than connect the wrong person.',
      },
      {
        call: 'The server owns call state',
        why: 'Call and agent status are pushed live from the server, so everyone on the team sees the same picture of who’s on the line.',
      },
      {
        call: 'The schema is the privacy boundary',
        why: 'Each screen asks for exactly the data it needs, so exposure of health information is explicit and easy to review.',
      },
    ],
    outcome:
      'Members reached a care manager in their own language, with handoffs that kept them on the line, on a healthcare-grade platform spanning interface to database at a company acquired by Elevance Health and folded into CarelonRx.',
    stack: ['Twilio Voice', 'GraphQL', 'Apollo', 'Node.js', 'Sequelize', 'React', 'Redux', 'Python'],
    links: { website: 'https://www.carelonrx.com/', github: 'https://github.com/zipdrug' },
    demoIntro:
      'A simplified model of the routing and call flow. Pick the caller’s language and plan and place the call: it rings every available care manager who speaks that language and covers that plan, or goes to voicemail. Choose who picks up, then bring in a coaching supervisor or an interpreter, or warm-transfer the call.',
    Demo: lazy(() => import('./demos/CallCenterDemo')),
  },
  {
    id: 'diy',
    title: 'DIY Workshops',
    role: 'Personal project · Creator',
    kind: 'personal',
    image: diyHub,
    alt: 'The DIY hub with PC, Garage, Home and Garden workshops',
    summary:
      'A comic-book 3D repair platform: four interactive Three.js workshops, every model built in code, one style system from CSS to shaders, and animation that renders only while something moves.',
    concept: {
      name: 'A comic style system',
      teaser: 'One palette and one shader recipe give every model in four workshops the same hand-inked look.',
    },
    challenge:
      'Repair guides are walls of text that assume you already know where the part is. I wanted fixes you can point at: a PC, car, house and garden you click into, with steps, cautions and videos for the exact thing in front of you. Four very different subjects had to feel like one illustrated world, run smoothly on a phone, and stay correct where safety is involved.',
    approach: [
      'Modeled every object procedurally in TypeScript, from PC internals to cars, kitchens and gardens: about 9,700 lines of scene code and no 3D asset files.',
      'Wrote a comic-book shading system on top of three.js toon materials: cel-banded light, hard specular, a cartoon horizon reflection for metal, screen-space halftone in the shadows, and inverted-hull ink outlines plus hand-placed ink lines.',
      'One palette drives CSS and 3D: Vite injects it as custom properties, and scene code reads the same colors as numbers, named by role (steel, porcelain, safety red) rather than per-model hex values.',
      'Choreographed the interactions on one tween system: the camera arcs in to each part, side panels swing open, the hood lifts, coolers rise off the CPU, and a vertex shader sways the garden in the wind.',
      'Backed it with real tooling: a pure-rule PC parts picker, garage guides tailored by NHTSA vehicle data, and every deploy gated on typechecks, lint, Vitest and Playwright.',
    ],
    decisions: [
      {
        call: 'Style as code, not assets',
        why: 'Materials are recipes (toon(color, { shine, metal })) and colors are named roles, so a new model looks right the moment it’s built and the whole world restyles from one place.',
      },
      {
        call: 'Render on demand',
        why: 'Frames are drawn only while something moves, and the shadow map redraws only when a shadow-casting part moves. An idle workshop costs nothing, which matters on phones and laptops.',
      },
      {
        call: 'Motion with intent',
        why: 'Camera flights arc instead of sliding, lids land with a slight overshoot, and a new tween replaces the one in flight instead of queueing. With reduced motion on, tweens jump to their end and idle loops hold still.',
      },
      {
        call: 'Content as data, safety as tests',
        why: 'Guides and parts are typed data checked by pure rules, and the suite fails if any electrical guide touches wiring before the power is off.',
      },
    ],
    outcome:
      'Live on GitHub Pages: four workshops that read as one illustrated world, 54 garage guides across car, motorcycle and bike, a parts picker that catches incompatible builds, and a renderer that sits idle until you touch it.',
    stack: ['TypeScript', 'Three.js', 'GLSL', 'Vite', 'Vitest', 'Playwright', 'GitHub Actions'],
    links: { website: 'https://sea-chels.github.io/diy-app/', github: 'https://github.com/Sea-Chels/diy-app' },
    demoIntro:
      'DIY’s comic shader, ported from the repo and running live. The toolbox, wrench, ball and ring are built in code like everything in DIY. Turn the layers off one at a time to see what each adds, open the lid, or fly the camera in. Nothing renders while nothing moves.',
    Demo: lazy(() => import('./demos/ToonDemo')),
  },
  {
    id: 'artist-portfolio',
    title: 'Artist Portfolio',
    role: 'Freelance client',
    kind: 'client',
    image: artistPortfolio,
    alt: 'An artist’s portfolio site',
    summary: 'A gallery site delivered for a working artist, built around fast, shareable browsing by category.',
    concept: {
      name: 'Client-side routing',
      teaser: 'Real URLs and a working back button, without ever reloading the page.',
    },
    challenge:
      'An artist needed a clear, low-friction way for visitors to browse a curated body of work by category, without the cost of bespoke design.',
    approach: [
      'Built with React, React Router and Ant Design to ship a polished gallery without bespoke design overhead.',
      'Gave every category a real URL so work can be shared, bookmarked and navigated with the back button.',
    ],
    decisions: [
      {
        call: 'Client-side routing',
        why: 'One page load, then instant navigation between categories, while keeping real URLs and browser history.',
      },
      {
        call: 'A component library over custom UI',
        why: 'Ant Design covered the interface, so the time went into the gallery experience itself.',
      },
    ],
    outcome: 'A lightweight site focused on letting visitors move through the work quickly.',
    stack: ['React', 'React Router', 'Ant Design'],
    links: { github: 'https://github.com/Sea-Chels/Aaron-Portfolio' },
    demoIntro:
      'A router keeps its own history stack and swaps the view in place. Click around, try the back button and the broken link: the page never reloads.',
    Demo: lazy(() => import('./demos/RoutingDemo')),
  },
  {
    id: 'mm-converter',
    title: 'Millimeter Converter',
    role: 'Client tool',
    kind: 'client',
    image: mmConverter,
    alt: 'A simple input box that converts inches to millimeters',
    summary: 'A desktop utility built around one CAD designer’s workflow, packaged as an offline Windows app.',
    concept: {
      name: 'Parse what people type',
      teaser: 'Designers write 3 3/8, not 3.375. The input should understand both.',
    },
    challenge:
      'A CAD designer needed a fast converter that lived next to their other tools instead of buried in a browser tab.',
    approach: [
      'Packaged a React app with Electron as a standalone Windows executable that works offline.',
      'Kept the interface to a single input and a single answer.',
    ],
    decisions: [
      {
        call: 'Desktop, not a web page',
        why: 'Electron put the tool beside the designer’s CAD software and made it work offline.',
      },
      {
        call: 'One input, one answer',
        why: 'For a quick lookup, the fastest interface is one with nothing else on it.',
      },
    ],
    outcome: 'A standalone tool that sits beside the designer’s other apps and works offline.',
    stack: ['Electron', 'React', 'JavaScript'],
    links: { website: 'https://sea-chels.github.io/aarons-converter/', github: 'https://github.com/Sea-Chels/aarons-converter' },
    demoIntro:
      'The converter idea taken a step further: it reads whole numbers, decimals, fractions and mixed numbers, with or without an inch mark, and rounds to a hundredth of a millimeter.',
    Demo: lazy(() => import('./demos/ConverterDemo')),
  },
]
