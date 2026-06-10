/** @typedef {"work" | "fun"} ProjectCategory */

/**
 * @typedef {Object} Project
 * @property {string} id
 * @property {string} title
 * @property {string} year
 * @property {ProjectCategory} category
 * @property {string} summary
 * @property {string} intro
 * @property {string[]} body
 * @property {string} [externalUrl]
 */

/** @type {Project[]} */
export const projects = [
  {
    id: "capy",
    title: "Capy",
    year: "2024",
    category: "work",
    summary: "AI tooling, product + frontend",
    intro:
      "Founding design engineer work across workflows, prototypes, and production interfaces for AI-native tooling.",
    body: [
      "I joined Capy early to help shape what the product actually feels like — not just how it looks. That meant sitting close to eng on React / Next.js surfaces, building internal prototypes fast enough to test ideas before they hardened, and turning fuzzy workflow concepts into something a user could click through without a tour.",
      "A lot of the work lived in the gap between design system and product logic: dense panels, stateful editors, and interfaces where the model's output is never quite predictable. I cared about making those moments legible — clear hierarchy, honest loading states, and layouts that still work when the content changes size every run.",
      "The through-line was speed with restraint. Ship enough polish that the team could learn from real usage, but keep the system flexible enough that the next experiment didn't require a full rewrite.",
    ],
    externalUrl: "https://capy.ai",
  },
  {
    id: "highlight",
    title: "Highlight AI",
    year: "2022",
    category: "work",
    summary: "design + frontend, desktop AI",
    intro:
      "Design and frontend for a desktop AI assistant — bridging product thinking with shipped UI in a native-feeling shell.",
    body: [
      "At Highlight I worked across UX and frontend on a desktop AI product that needed to feel ambient, not intrusive. The interesting constraint was presence: the app had to be useful in the corner of your screen without competing with whatever you were already doing.",
      "I spent time on interaction models for capture, recall, and lightweight editing — flows where the user might only glance at the UI for a few seconds. That pushed toward tighter typography, calmer motion, and components that read clearly at small sizes on varied backgrounds.",
      "On the implementation side I partnered closely with engineering to land those patterns in production. The goal wasn't a pristine Figma file; it was a desktop surface that still felt intentional after weeks of real usage.",
    ],
    externalUrl: "https://highlightai.com",
  },
  {
    id: "wynnmarket",
    title: "Wynnmarket",
    year: "2024",
    category: "fun",
    summary: "real-time game market browser",
    intro:
      "A side project for browsing live game economies — part data viz, part rabbit hole.",
    body: [
      "Wynnmarket started as an excuse to poke at real-time market data from a game I was already playing too much. I wanted a browser that felt closer to a trading terminal than a wiki page: fast filtering, readable price history, and just enough context to answer \"is this listing actually good?\"",
      "The fun part was making dense numbers feel scannable. I leaned on tabular figures, tight row rhythm, and small visual cues for volatility instead of loud charts everywhere. It’s the kind of UI that only works if you respect how impatient players are when they're mid-run.",
      "It's a playground project, but it scratches the same itch as product work: take a messy live dataset and give it a shape people can reason about in seconds.",
    ],
    externalUrl: "https://wynnmarket.com",
  },
  {
    id: "suika-live",
    title: "suika.live",
    year: "2023",
    category: "fun",
    summary: "little JS video game for my girlfriend",
    intro:
      "A tiny browser game built as a gift — scrappy, personal, and very JS.",
    body: [
      "suika.live was a small game I made for my girlfriend: part joke, part love letter, entirely built in an afternoon stretch that turned into a weekend. No grand product thesis — just a silly idea that deserved to exist on the internet with its own URL.",
      "Technically it was a chance to stay loose: canvas or DOM sprites, arcade-y feedback, and whatever sound effects I could steal from royalty-free packs without laughing too hard. The bar was delight, not scalability.",
      "Projects like this remind me why I still like building on the web. You can go from \"wouldn't it be funny if\" to a shareable link faster than almost anywhere else — and the audience is one person, which is oddly freeing.",
    ],
    externalUrl: "https://suika.live",
  },
];

/** @type {Record<string, Project>} */
export const projectsById = Object.fromEntries(projects.map((p) => [p.id, p]));
