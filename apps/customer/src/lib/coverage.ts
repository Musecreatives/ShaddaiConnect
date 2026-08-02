/**
 * Known WiFi coverage locations within Ugbowo BDPA Estate, confirmed 2026-07-24. Streets marked
 * "(Expected)" are planned expansion, not yet live — kept in the same list since CoverageNotice
 * doesn't distinguish live vs. planned today; the label itself communicates that.
 */
export const COVERAGE_AREAS: string[] = [
  '21st Street',
  '22nd Street',
  '24th Street (Expected)',
  'Robinson Avenue',
  'Ugiagbe Street',
];

/** Nearby landmarks customers commonly use to describe their location — surfaced in the
 * waitlist form's location field placeholder and the landing page copy. */
export const COVERAGE_LANDMARKS: string[] = [
  'Deeper Life Campus Fellowship',
  'Redeemed Christian Fellowship (RCF)',
  'Friendzone',
  'Universal Tower',
];
