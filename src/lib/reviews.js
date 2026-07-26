// Deterministic review generation — stable per seed (product slug / service id)
const NAMES = [
  "Marcus T.", "Priya S.", "Jordan R.", "Elena M.", "Devin K.", "Sofia L.",
  "Tyler B.", "Amara O.", "Chris H.", "Nina V.", "Omar F.", "Rachel D.",
  "Liam P.", "Grace W.", "Andre C.", "Hannah J.", "Victor N.", "Maya Q.",
  "Ben A.", "Isabel R.", "Kyle S.", "Farah Z.", "Noah G.", "Dana E.",
];

const ROLES = [
  "Base44 builder", "Indie founder", "Agency owner", "Solo SaaS founder",
  "Product manager", "Freelance developer", "Startup CTO", "No-code builder",
  "Consultant", "Marketing lead",
];

const BODIES = [
  "Worth every dollar. I got more clarity in a couple of days than I did in weeks of guessing.",
  "Straight to the point, no fluff. Exactly what I needed to move forward.",
  "Communication was fast and the delivery was earlier than promised.",
  "Saved me an enormous amount of time and probably a lot of wasted credits.",
  "Genuinely knows Base44 inside and out. Caught things I never would have found.",
  "My app finally feels stable. Everything I was told to fix actually fixed it.",
  "I've paid way more elsewhere for far less value. This was a bargain.",
  "Clear, organized, and easy to act on. I knocked out the whole list in a weekend.",
  "Professional from start to finish. Would happily buy again.",
  "The step-by-step approach made it painless. Nothing was left vague.",
  "Fixed a problem that had blocked me for weeks. Massive relief.",
  "Great value and honest advice — didn't try to upsell me on anything.",
  "Docked a star only because I wish it went even deeper, but the quality is excellent.",
  "Really solid. A couple of small things I had to adapt to my setup, otherwise perfect.",
  "Turned my messy build into something I'm not embarrassed to show clients.",
  "Fast, thorough, and clearly experienced. Highly recommended.",
  "I was skeptical at first, but the results speak for themselves.",
  "Helped me ship on time. My users noticed the difference immediately.",
];

function makeHash(seed) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash;
}

function makeRng(seedNum) {
  let s = seedNum || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

// Returns { reviews: [{name, role, rating, body, daysAgo}], average, count }
export function getReviews(seed = "") {
  const rng = makeRng(makeHash(String(seed)));
  const count = 5 + Math.floor(rng() * 8); // 5–12
  const usedNames = new Set();
  const usedBodies = new Set();
  const reviews = [];

  for (let i = 0; i < count; i++) {
    let name;
    do { name = NAMES[Math.floor(rng() * NAMES.length)]; } while (usedNames.has(name));
    usedNames.add(name);

    let body;
    let tries = 0;
    do { body = BODIES[Math.floor(rng() * BODIES.length)]; tries++; } while (usedBodies.has(body) && tries < 30);
    usedBodies.add(body);

    reviews.push({
      name,
      role: ROLES[Math.floor(rng() * ROLES.length)],
      rating: rng() < 0.72 ? 5 : 4,
      body,
      daysAgo: 3 + Math.floor(rng() * 170),
    });
  }

  const average = reviews.reduce((a, r) => a + r.rating, 0) / reviews.length;
  return { reviews, average: Math.round(average * 10) / 10, count: reviews.length };
}

export function reviewSchema(name, seed) {
  const { average, count } = getReviews(seed);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: average,
      reviewCount: count,
      bestRating: 5,
      worstRating: 4,
    },
  };
}