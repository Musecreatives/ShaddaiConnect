/**
 * Content for the full site redesign (2026-09-06, Claude Design import "Shaddai Site.dc.html").
 * Real, verifiable facts (services, clients, about copy, process) are marked Real below.
 * Everything else is dummy placeholder content — bracketed `[ like this ]`, the same convention
 * the imported design itself used for unresolved specifics — standing in until the planned admin
 * CMS (Journal/Media/Site Content, per "Shaddai Admin.dc.html") can supply real rows. Swap those
 * sections for CMS reads once that backend exists; don't hand-edit fake specifics here to look
 * more real than they are.
 */

export interface ServicePillar {
  num: string;
  slug: string;
  title: string;
  blurb: string;
  long: string;
  image: string;
  items: string[];
}

// Real — descriptions and images match apps/website/src/app/services/page.tsx and the six
// existing /services/[slug] detail pages.
export const SERVICES: ServicePillar[] = [
  {
    num: '01',
    slug: 'networking',
    title: 'Networking Services',
    blurb: 'Starlink installation and CCTV — fast satellite internet and remote monitoring, installed properly.',
    long: 'Starlink installation and CCTV, done as one visit rather than two vendors. We site the dish, run and terminate cable properly, and set up remote monitoring you can actually check from your phone.',
    image: '/images/services/starlink.jpg',
    items: ['Starlink installation', 'CCTV & remote monitoring', 'Cabling & mounting'],
  },
  {
    num: '02',
    slug: 'brand-identity',
    title: 'Brand Identity',
    blurb: 'Logo, guidelines, and print materials — a cohesive identity from day one.',
    long: 'A logo and identity system that holds up across a shopfront sign, a receipt, and a social page — plus the guidelines so it stays consistent after we hand it over.',
    image: '/images/services/brand-identity.jpg',
    items: ['Logo & identity', 'Brand guidelines', 'Print materials'],
  },
  {
    num: '03',
    slug: 'software-development',
    title: 'Software Development',
    blurb: 'Websites and custom apps and management tools built around how your business actually works.',
    long: 'Websites, custom apps, and internal tools scoped around your actual workflow rather than a generic template — built, deployed, and supported by the same team.',
    image: '/images/services/software-development.jpg',
    items: ['Websites', 'Custom apps & tools', 'Ongoing support'],
  },
  {
    num: '04',
    slug: 'pos',
    title: 'POS & Business Tools',
    blurb: 'A simple digital till for tracking sales, stock, and daily takings.',
    long: 'A digital till that tracks sales, stock, and daily takings without a steep learning curve — set up on your existing hardware where possible.',
    image: '/images/services/pos.jpg',
    items: ['Digital till', 'Stock tracking', 'Daily takings reports'],
  },
  {
    num: '05',
    slug: 'musical-training',
    title: 'Musical Training',
    blurb: 'One-on-one and group lessons for piano, guitar, and voice, for all levels.',
    long: 'One-on-one and small-group lessons for piano, guitar, and voice — structured for beginners through to players preparing for grade exams or performance.',
    image: '/images/services/musical-training.jpg',
    items: ['Piano', 'Guitar', 'Voice'],
  },
  {
    num: '06',
    slug: 'media-production',
    title: 'Media Production',
    blurb: 'Podcast studio setup and motion graphics for your content.',
    long: 'Podcast studio setup — acoustics, mics, and a recording chain that sounds right the first time — plus motion graphics for the content that comes out of it.',
    image: '/images/services/media-production.jpg',
    items: ['Podcast studio setup', 'Motion graphics'],
  },
];

// Real.
export const CLIENTS = [
  { name: 'NCRS', image: '/images/clients/ncrs.png' },
  { name: 'GeoSmart', image: '/images/clients/geosmart.png' },
  { name: 'Optiplex', image: '/images/clients/optiplex.svg' },
];

// Real.
export const PROCESS = [
  { letter: 'A', name: 'Ask', text: 'Tell us what you need — networking, a website, branding, custom software — pick a service and reach out.' },
  { letter: 'S', name: 'Scope', text: 'A quick chat, then real pricing for your setup. No guessing, no surprises.' },
  { letter: 'D', name: 'Deliver', text: 'A team you can actually reach, not a call centre that disappears after the invoice.' },
  { letter: 'S', name: 'Support', text: 'We stay reachable after handover — the same people, not a ticket queue.' },
];

// Dummy — no case studies published yet. Bracketed fields follow the imported design's own
// convention for content pending real data.
export interface Project {
  slug: string;
  name: string;
  scope: string;
  category: 'Networking' | 'Software' | 'Brand' | 'Media';
  facts: { k: string; v: string }[];
  brief: string;
  approach: string;
  outcome: string;
}

export const PROJECTS: Project[] = [
  {
    slug: 'estate-wide-starlink-rollout',
    name: 'Estate-wide Starlink rollout',
    scope: 'Networking · Starlink installation, CCTV',
    category: 'Networking',
    facts: [
      { k: 'Client', v: '[ Residential estate, Benin City ]' },
      { k: 'Services', v: 'Starlink installation, CCTV' },
      { k: 'Duration', v: '[ 00 weeks ]' },
      { k: 'Result', v: '[ Headline outcome ]' },
    ],
    brief: 'A residential estate needed reliable internet across multiple homes without running fibre to each one, plus basic CCTV coverage on shared access points.',
    approach: 'Starlink units sited and mounted per home, cabled properly rather than run loose, with CCTV added at the estate\'s access gates.',
    outcome: '[ Measured result — coverage, uptime, or resident feedback goes here once written up. ]',
  },
  {
    slug: 'retail-pos-rollout',
    name: 'Retail POS rollout',
    scope: 'Software · POS & business tools',
    category: 'Software',
    facts: [
      { k: 'Client', v: '[ Retail outlet, Benin City ]' },
      { k: 'Services', v: 'POS & business tools' },
      { k: 'Duration', v: '[ 00 weeks ]' },
      { k: 'Result', v: '[ Headline outcome ]' },
    ],
    brief: 'A shop tracking sales and stock on paper needed a digital till without retraining staff from scratch.',
    approach: 'A POS setup on existing hardware where possible, with a short on-site training session for staff.',
    outcome: '[ Measured result — time saved, stock accuracy, or takings visibility goes here once written up. ]',
  },
  {
    slug: 'brand-refresh',
    name: 'Local business brand refresh',
    scope: 'Brand · Identity, print materials',
    category: 'Brand',
    facts: [
      { k: 'Client', v: '[ Local business, Benin City ]' },
      { k: 'Services', v: 'Brand identity, print materials' },
      { k: 'Duration', v: '[ 00 weeks ]' },
      { k: 'Result', v: '[ Headline outcome ]' },
    ],
    brief: 'An existing business had an inconsistent logo across signage, receipts, and social media.',
    approach: 'A single identity system and guidelines document, then new print materials rolled out from it.',
    outcome: '[ Measured result — before/after consistency, customer feedback goes here once written up. ]',
  },
  {
    slug: 'podcast-studio-setup',
    name: 'Podcast studio build-out',
    scope: 'Media · Studio setup, motion graphics',
    category: 'Media',
    facts: [
      { k: 'Client', v: '[ Content creator, Benin City ]' },
      { k: 'Services', v: 'Podcast studio setup, motion graphics' },
      { k: 'Duration', v: '[ 00 weeks ]' },
      { k: 'Result', v: '[ Headline outcome ]' },
    ],
    brief: 'A creator recording in an untreated room needed a proper acoustic and recording setup.',
    approach: 'Acoustic treatment, mic and interface selection, and a simple recording chain the creator could run themselves.',
    outcome: '[ Measured result — audio quality, output pace goes here once written up. ]',
  },
];

// Dummy — no submitted testimonials yet.
export const TESTIMONIALS = [
  {
    text: '[ A client quote about the work will go here once we have one to publish. ]',
    name: '[ Client name ]',
    role: '[ Role, business ]',
  },
  {
    text: '[ A second client quote will go here. ]',
    name: '[ Client name ]',
    role: '[ Role, business ]',
  },
];

// Dummy — no journal posts published yet; topics are realistic for the actual services so the
// section reads honestly once real posts replace these.
export interface Post {
  slug: string;
  tag: string;
  title: string;
  date: string;
  excerpt: string;
}

export const POSTS: Post[] = [
  {
    slug: 'choosing-a-satellite-internet-setup',
    tag: 'Networking',
    title: 'What to check before installing Starlink at home',
    date: '[ Publish date ]',
    excerpt: 'Site survey, mounting, and power considerations that decide whether an install goes smoothly.',
  },
  {
    slug: 'pos-for-small-shops',
    tag: 'Software',
    title: 'Do you actually need a POS system yet?',
    date: '[ Publish date ]',
    excerpt: 'The signs a paper ledger is starting to cost you money, and what to look for in a first system.',
  },
  {
    slug: 'brand-identity-on-a-budget',
    tag: 'Brand',
    title: 'A cohesive brand without a big budget',
    date: '[ Publish date ]',
    excerpt: 'What to prioritise first when funds are tight — logo, guidelines, or print materials.',
  },
];

export const CATEGORIES = ['All', 'Networking', 'Software', 'Brand', 'Media'];

// Real — matches SiteFooter's contact block and the existing /contact page.
export const NEEDS = SERVICES.map((s) => s.title).concat('Something else');

// Dummy — the "free review" isn't a live, named product yet, but the offer it describes
// (a first look before quoting) matches how the business already engages new enquiries.
export const AUDIT_COVERS = [
  { title: 'Setup health', text: 'Where your current networking, POS, or software setup creates risk or slows you down.' },
  { title: 'What to prioritise', text: 'Which fix matters most first, given your budget and timeline.' },
  { title: 'Real pricing', text: 'A written estimate for the work, with no obligation to proceed.' },
];

export const FAQS = [
  {
    q: 'What exactly is the free review?',
    a: 'A short visit or call where we look at what you have running today — network, POS, software, or brand — and tell you plainly what needs attention first.',
  },
  {
    q: 'Is it really free? What is the catch?',
    a: 'No fee, no obligation. It is the fastest way for both sides to judge whether we are a fit before any paid work starts.',
  },
  {
    q: 'Do I need to already have a problem?',
    a: 'No — if you are just planning a Starlink install, a new POS setup, or a rebrand, the same review works as a starting point.',
  },
  {
    q: 'How long does it take?',
    a: 'Most reviews are a single visit or call, with a short written summary to follow within a few days.',
  },
];

// Dummy — no open roles right now; shape kept so the empty state and eventual real listings use
// the same component.
export const JOBS: { title: string; meta: string }[] = [];

// Dummy — credentials/certifications not yet catalogued.
export const CREDENTIALS: string[] = [];

// Real — reflects how the business already operates (see /about), phrased as stated values.
export const VALUES = [
  { name: 'Directness', text: 'If a request is the wrong fix for the problem, we say so before quoting for it.' },
  { name: 'One team', text: 'Networking, brand, software, POS, music, and media are handled by the same people — not handed off between vendors.' },
  { name: 'No long contracts', text: 'You can leave whenever the work stops being worth it to you. We would rather earn the next job.' },
  { name: 'Direct access', text: 'You deal with the person doing the work, not a call centre or an account manager.' },
];

// Dummy — team roster not yet published individually.
export const TEAM: { name: string; role: string }[] = [];

export const TOC_PLACEHOLDER = ['Overview', 'What to check', 'Common mistakes', 'In summary'];
export const SHARES = ['in', 'X', 'wa'];
