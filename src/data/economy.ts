"use client";

import { events, getUserById, type DemoEvent, type DemoUser, users } from "@/src/data/demo";
import { type DemoLaunch, seedLaunches } from "@/src/data/launches";
import { portfolioItems } from "@/src/data/social";
import {
  createAvatarDataUri,
  createPosterDataUri
} from "@/src/lib/demo-media";

export type MatchableEntitySchema = {
  entityType: "opportunity" | "listing" | "storefront" | "business" | "creator" | "campaign" | "event";
  subtypes: string[];
  location: string;
  summary: string;
  coreSkills: string[];
  operationalStrengths: string[];
  primaryInterests: string[];
  franchiseInterests: string[];
  audienceOrientation: string[];
  eventFormats: string[];
  embeddingTags: string[];
  confidenceNotes: string[];
};

export type OpportunityStatus = "open" | "reviewing" | "filled";
export type ApplicationStatus = "submitted" | "shortlisted" | "accepted" | "declined";
export type ListingType = "merch" | "resale" | "commission" | "service";
export type ListingInterestKind = "saved" | "requested" | "mock_purchased";
export type BusinessType = "venue" | "studio" | "cafe" | "brand";
export type MatchTargetType = "launch" | "event" | "creator" | "opportunity";
export type SupportAction = "saved" | "hosting" | "supporting";

export type Opportunity = {
  id: string;
  title: string;
  roleType: string;
  summary: string;
  fandomTags: string[];
  city: string;
  dateLabel: string;
  locationLabel: string;
  compensation: string;
  perks: string[];
  skillTags: string[];
  eventId?: string;
  campaignId?: string;
  hostUserId: string;
  socialProof: string;
  schema: MatchableEntitySchema;
};

export type OpportunityApplication = {
  id: string;
  opportunityId: string;
  userId: string;
  status: ApplicationStatus;
  note: string;
  submittedAt: string;
};

export type Listing = {
  id: string;
  creatorUserId: string;
  storefrontId: string;
  type: ListingType;
  title: string;
  summary: string;
  description: string;
  priceLabel: string;
  city: string;
  imageUrl: string;
  fandomTags: string[];
  sublabel: string;
  schema: MatchableEntitySchema;
};

export type ListingInterest = {
  id: string;
  listingId: string;
  userId: string;
  kind: ListingInterestKind;
  createdAt: string;
};

export type Storefront = {
  id: string;
  ownerUserId: string;
  title: string;
  headline: string;
  description: string;
  accentTags: string[];
  listingIds: string[];
  serviceHighlights: string[];
  coverImageUrl: string;
  schema: MatchableEntitySchema;
};

export type VenueAvailability = {
  status: "available" | "limited" | "booked";
  windows: string[];
  capacities: string[];
  notes: string;
};

export type BusinessProfile = {
  id: string;
  ownerUserId: string;
  name: string;
  handle: string;
  businessType: BusinessType;
  city: string;
  area: string;
  avatarUrl: string;
  coverImageUrl: string;
  summary: string;
  hostingPreferences: string[];
  supportInterests: string[];
  fandomInterests: string[];
  eventFormatInterests: string[];
  availability: VenueAvailability;
  matchedItemIds: string[];
  schema: MatchableEntitySchema;
};

export type MatchExplanation = {
  id: string;
  businessId: string;
  targetType: MatchTargetType;
  targetId: string;
  title: string;
  summary: string;
  chips: string[];
  confidenceNotes: string[];
  suggestedAction: "host" | "support" | "book";
};

export type SupportIntent = {
  id: string;
  businessId: string;
  targetType: MatchTargetType;
  targetId: string;
  action: SupportAction;
  createdAt: string;
};

const creator = (id: string) => getUserById(id) as DemoUser;
const event = (id: string) => events.find((item) => item.id === id) as DemoEvent;
const launch = (id: string) => seedLaunches.find((item) => item.id === id) as DemoLaunch;
const portfolio = (id: string) => portfolioItems.find((item) => item.id === id)?.imageUrl;

const fallbackCover = (title: string, eyebrow: string, subtitle: string) =>
  createPosterDataUri({
    title,
    eyebrow,
    subtitle,
    accent: "#1F1CB8",
    accent2: "#6D5EF3"
  });

export const storefronts: Storefront[] = [
  {
    id: "storefront-aphex",
    ownerUserId: "user-rephos",
    title: "Aphex Studio",
    headline: "Launch visuals, promo kits, and on-the-night creator support.",
    description: "Best for fandom socials that need social pull before doors open and polished moments after.",
    accentTags: ["Promo", "Creator support", "Scene launch"],
    listingIds: ["listing-aphex-promo-kit", "listing-aphex-commission-portrait", "listing-aphex-resale-badge"],
    serviceHighlights: ["Launch copy", "Creator coordination", "Event recap cuts"],
    coverImageUrl: event("court-of-stars").posterUrl,
    schema: {
      entityType: "storefront",
      subtypes: ["creator storefront", "services"],
      location: "Los Angeles, CA",
      summary: "Creator-led storefront for promo kits, portrait packages, and fandom scene support.",
      coreSkills: ["social promo", "creator coordination", "live content"],
      operationalStrengths: ["launch momentum", "creator wrangling"],
      primaryInterests: ["cosplay", "creator collabs", "live fandom nights"],
      franchiseInterests: ["Genshin Impact", "Uma Musume", "Love and Deepspace"],
      audienceOrientation: ["fans", "hosts", "contributors"],
      eventFormats: ["social", "showcase", "soft launch"],
      embeddingTags: ["promo", "fandom visuals", "launch support"],
      confidenceNotes: ["Strong fit for launches that need shareable social proof early."]
    }
  },
  {
    id: "storefront-noa",
    ownerUserId: "user-noa",
    title: "Noa Frames",
    headline: "Photo, reels, and aftermovie coverage for creator-led nights.",
    description: "Fast-turnaround visual coverage that makes repeat events easier to market.",
    accentTags: ["Photo", "Reels", "Aftermovie"],
    listingIds: ["listing-noa-photo-set", "listing-noa-aftermovie", "listing-noa-print-drop"],
    serviceHighlights: ["Portraits", "Aftermovie edits", "Highlight reels"],
    coverImageUrl: event("jujutsu-night-out").posterUrl,
    schema: {
      entityType: "storefront",
      subtypes: ["creator storefront", "services"],
      location: "Pasadena, CA",
      summary: "Visual coverage storefront for fandom events that want polished photo and recap assets.",
      coreSkills: ["photography", "reels", "aftermovie"],
      operationalStrengths: ["fast turnarounds", "coverage planning"],
      primaryInterests: ["cosplay", "anime nights", "creator socials"],
      franchiseInterests: ["Jujutsu Kaisen", "Love and Deepspace", "Marvel Rivals"],
      audienceOrientation: ["hosts", "fans"],
      eventFormats: ["social", "showcase"],
      embeddingTags: ["photo", "video", "recap"],
      confidenceNotes: ["Strong fit for repeatable events that need recap assets the next morning."]
    }
  },
  {
    id: "storefront-sera",
    ownerUserId: "user-sera",
    title: "Sera Portrait Club",
    headline: "Soft-glam portrait sessions and cosplay fan photo sets.",
    description: "Best for romance-coded nights, fan portrait booths, and premium creator tables.",
    accentTags: ["Portraits", "Soft glam", "Fan keepsakes"],
    listingIds: ["listing-sera-portrait-slot", "listing-sera-polaroid-pack"],
    serviceHighlights: ["Portraits", "Mini edits", "On-site photo corners"],
    coverImageUrl: event("love-and-deepspace-afterdark").posterUrl,
    schema: {
      entityType: "storefront",
      subtypes: ["creator storefront", "services"],
      location: "Los Angeles, CA",
      summary: "Portrait-first storefront for fandom nights that want keepsakes and photo-forward set pieces.",
      coreSkills: ["portraits", "editing"],
      operationalStrengths: ["on-site flow", "fan-facing experience"],
      primaryInterests: ["romance games", "cosplay"],
      franchiseInterests: ["Love and Deepspace", "Genshin Impact"],
      audienceOrientation: ["fans", "hosts"],
      eventFormats: ["social", "pop-up"],
      embeddingTags: ["portrait", "premium photo", "creator table"],
      confidenceNotes: ["Strong fit for fandoms where attendees want shareable portraits as part of the experience."]
    }
  },
  {
    id: "storefront-iris",
    ownerUserId: "user-iris",
    title: "Iris Night Shift",
    headline: "Host-led appearances, commentary sets, and creator collab nights.",
    description: "Programming help for game nights, after-hours watch parties, and launch copy polish.",
    accentTags: ["Hosting", "Commentary", "Scene hosting"],
    listingIds: ["listing-iris-hosting", "listing-iris-watch-party-kit"],
    serviceHighlights: ["Hosting", "Commentary", "Launch plan support"],
    coverImageUrl: event("marvel-rivals-night-shift").posterUrl,
    schema: {
      entityType: "storefront",
      subtypes: ["creator storefront", "services"],
      location: "New York, NY",
      summary: "Host-facing storefront for performance, commentary, and game-night momentum.",
      coreSkills: ["hosting", "commentary", "launch copy"],
      operationalStrengths: ["crowd energy", "programming"],
      primaryInterests: ["esports", "watch parties"],
      franchiseInterests: ["Marvel Rivals", "One Piece"],
      audienceOrientation: ["fans", "hosts"],
      eventFormats: ["showcase", "social"],
      embeddingTags: ["hosting", "commentary", "watch party"],
      confidenceNotes: ["Strong fit for louder rooms that need a clear on-stage voice."]
    }
  }
];

export const listings: Listing[] = [
  {
    id: "listing-aphex-promo-kit",
    creatorUserId: "user-rephos",
    storefrontId: "storefront-aphex",
    type: "service",
    title: "Launch promo kit",
    summary: "Moodboard, teaser copy, and early-post asset set for fandom event drops.",
    description: "A compact launch package for hosts who want to soft-launch with a stronger visual identity and clearer social hooks.",
    priceLabel: "$220 package",
    city: "Los Angeles, CA",
    imageUrl: portfolio("portfolio-aphex-2") ?? event("court-of-stars").posterUrl,
    fandomTags: ["Cosplay", "Creator Collabs"],
    sublabel: "Service",
    schema: {
      entityType: "listing",
      subtypes: ["service", "promo"],
      location: "Los Angeles, CA",
      summary: "Creative launch package for hosts who need social-ready fandom event assets.",
      coreSkills: ["social promo", "creator coordination"],
      operationalStrengths: ["launch packaging"],
      primaryInterests: ["cosplay", "creator socials"],
      franchiseInterests: ["Genshin Impact", "Love and Deepspace"],
      audienceOrientation: ["hosts"],
      eventFormats: ["soft launch", "social"],
      embeddingTags: ["promo kit", "launch assets"],
      confidenceNotes: ["Works best for hosts who already have a concept but need it to feel real fast."]
    }
  },
  {
    id: "listing-aphex-commission-portrait",
    creatorUserId: "user-rephos",
    storefrontId: "storefront-aphex",
    type: "commission",
    title: "Fandom teaser portrait",
    summary: "Poster-ready commission portrait for launch art or host promos.",
    description: "Single-image portrait commission built to announce a fandom night or creator collab with a strong first impression.",
    priceLabel: "$140 commission",
    city: "Los Angeles, CA",
    imageUrl: portfolio("portfolio-aphex-1") ?? event("court-of-stars").posterUrl,
    fandomTags: ["Cosplay", "Genshin Impact"],
    sublabel: "Commission",
    schema: {
      entityType: "listing",
      subtypes: ["commission", "portrait"],
      location: "Los Angeles, CA",
      summary: "Custom portrait art for launch posts and event identity.",
      coreSkills: ["portrait direction", "promo art"],
      operationalStrengths: ["single-asset launch support"],
      primaryInterests: ["cosplay", "creator reveals"],
      franchiseInterests: ["Genshin Impact", "One Piece"],
      audienceOrientation: ["hosts", "creators"],
      eventFormats: ["soft launch", "showcase"],
      embeddingTags: ["portrait", "hero art"],
      confidenceNotes: ["Good for early campaigns that need a face and mood before tickets exist."]
    }
  },
  {
    id: "listing-aphex-resale-badge",
    creatorUserId: "user-rephos",
    storefrontId: "storefront-aphex",
    type: "resale",
    title: "Creator collab badge set",
    summary: "Resale drop of acrylic guest badges from a past nightlife collab.",
    description: "Limited leftover guest badges from a creator collab night, sold as a keepsake drop for collectors.",
    priceLabel: "$28 each",
    city: "Los Angeles, CA",
    imageUrl: event("court-of-stars").posterUrl,
    fandomTags: ["Creator Collabs"],
    sublabel: "Resale",
    schema: {
      entityType: "listing",
      subtypes: ["resale", "collectible"],
      location: "Los Angeles, CA",
      summary: "Small resale drop tied to a real creator event series.",
      coreSkills: ["creator merch"],
      operationalStrengths: ["limited drop"],
      primaryInterests: ["creator collabs"],
      franchiseInterests: ["Original IP"],
      audienceOrientation: ["fans"],
      eventFormats: ["social"],
      embeddingTags: ["badge", "collectible"],
      confidenceNotes: ["Best when social proof already exists around the night it came from."]
    }
  },
  {
    id: "listing-noa-photo-set",
    creatorUserId: "user-noa",
    storefrontId: "storefront-noa",
    type: "service",
    title: "Event coverage photo set",
    summary: "Two-hour coverage block with edits ready for next-day posting.",
    description: "Fast fandom event coverage with hero selects, crowd moments, and polished edits sized for social.",
    priceLabel: "$340 coverage",
    city: "Pasadena, CA",
    imageUrl: portfolio("portfolio-noa-1") ?? event("jujutsu-night-out").posterUrl,
    fandomTags: ["Photography", "Cosplay"],
    sublabel: "Service",
    schema: {
      entityType: "listing",
      subtypes: ["service", "photo"],
      location: "Pasadena, CA",
      summary: "Photo coverage service for fandom events and creator-led rooms.",
      coreSkills: ["photography", "editing"],
      operationalStrengths: ["fast edits", "event coverage"],
      primaryInterests: ["anime nights", "creator socials"],
      franchiseInterests: ["Jujutsu Kaisen", "Marvel Rivals"],
      audienceOrientation: ["hosts"],
      eventFormats: ["social", "showcase"],
      embeddingTags: ["photo coverage", "recap"],
      confidenceNotes: ["Most useful for events that depend on social proof after the first run."]
    }
  },
  {
    id: "listing-noa-aftermovie",
    creatorUserId: "user-noa",
    storefrontId: "storefront-noa",
    type: "service",
    title: "Next-day aftermovie edit",
    summary: "Short vertical recap cut for hosts who need the room to keep traveling online.",
    description: "One recap reel with captions, hero beats, and crowd moments for the day after your event.",
    priceLabel: "$280 edit",
    city: "Pasadena, CA",
    imageUrl: event("jujutsu-night-out").posterUrl,
    fandomTags: ["Reels", "Aftermovie"],
    sublabel: "Service",
    schema: {
      entityType: "listing",
      subtypes: ["service", "video"],
      location: "Pasadena, CA",
      summary: "Fast-turnaround aftermovie service for scene momentum.",
      coreSkills: ["video", "editing"],
      operationalStrengths: ["quick recap"],
      primaryInterests: ["anime nights", "creator showcases"],
      franchiseInterests: ["Jujutsu Kaisen", "Love and Deepspace"],
      audienceOrientation: ["hosts"],
      eventFormats: ["social", "showcase"],
      embeddingTags: ["video recap", "aftermovie"],
      confidenceNotes: ["Best when the host wants the next city or next night to sell off social proof."]
    }
  },
  {
    id: "listing-noa-print-drop",
    creatorUserId: "user-noa",
    storefrontId: "storefront-noa",
    type: "merch",
    title: "Night Shift print drop",
    summary: "Limited glossy photo prints from a late-night tournament set.",
    description: "Small merch drop of selected stills from a crowd-favorite game night.",
    priceLabel: "$18 print",
    city: "Pasadena, CA",
    imageUrl: event("marvel-rivals-night-shift").posterUrl,
    fandomTags: ["Marvel Rivals"],
    sublabel: "Merch",
    schema: {
      entityType: "listing",
      subtypes: ["merch", "print"],
      location: "Pasadena, CA",
      summary: "Photo print merch tied to a live fandom event.",
      coreSkills: ["photo product"],
      operationalStrengths: ["small-batch drop"],
      primaryInterests: ["esports", "late-night scenes"],
      franchiseInterests: ["Marvel Rivals"],
      audienceOrientation: ["fans"],
      eventFormats: ["social"],
      embeddingTags: ["print drop", "collectible"],
      confidenceNotes: ["Works because the original night already has recognizable scene identity."]
    }
  },
  {
    id: "listing-sera-portrait-slot",
    creatorUserId: "user-sera",
    storefrontId: "storefront-sera",
    type: "service",
    title: "Soft-glam portrait slot",
    summary: "Individual portrait session for romance-coded fandom looks.",
    description: "Edited portrait slot for fans or creators who want a polished, keepsake-forward set.",
    priceLabel: "$95 slot",
    city: "Los Angeles, CA",
    imageUrl: portfolio("portfolio-sera-1") ?? event("love-and-deepspace-afterdark").posterUrl,
    fandomTags: ["Love and Deepspace", "Cosplay"],
    sublabel: "Service",
    schema: {
      entityType: "listing",
      subtypes: ["service", "portrait"],
      location: "Los Angeles, CA",
      summary: "Portrait session for fandom looks and creator profile moments.",
      coreSkills: ["portrait photography"],
      operationalStrengths: ["fan-facing sessions"],
      primaryInterests: ["romance games", "cosplay"],
      franchiseInterests: ["Love and Deepspace", "Genshin Impact"],
      audienceOrientation: ["fans", "creators"],
      eventFormats: ["social", "pop-up"],
      embeddingTags: ["portrait slot", "soft glam"],
      confidenceNotes: ["Best for fandoms where attendees want a keepsake as much as a ticket."]
    }
  },
  {
    id: "listing-sera-polaroid-pack",
    creatorUserId: "user-sera",
    storefrontId: "storefront-sera",
    type: "merch",
    title: "Signed polaroid pack",
    summary: "Five edited mini prints from the last soft-glam creator night.",
    description: "Collector pack of mini prints and polaroid-style portraits from a past event set.",
    priceLabel: "$22 pack",
    city: "Los Angeles, CA",
    imageUrl: event("love-and-deepspace-afterdark").posterUrl,
    fandomTags: ["Love and Deepspace"],
    sublabel: "Merch",
    schema: {
      entityType: "listing",
      subtypes: ["merch", "print"],
      location: "Los Angeles, CA",
      summary: "Mini print pack with strong fandom keepsake energy.",
      coreSkills: ["fan merch"],
      operationalStrengths: ["small drop"],
      primaryInterests: ["romance games"],
      franchiseInterests: ["Love and Deepspace"],
      audienceOrientation: ["fans"],
      eventFormats: ["social"],
      embeddingTags: ["print pack", "collector"],
      confidenceNotes: ["Works best when tied to a memorable photo-forward night."]
    }
  },
  {
    id: "listing-iris-hosting",
    creatorUserId: "user-iris",
    storefrontId: "storefront-iris",
    type: "service",
    title: "Host + commentary set",
    summary: "On-stage hosting package for game nights, screenings, and watch parties.",
    description: "Host-led set with intro beats, crowd handoffs, and commentary moments tuned for fandom rooms.",
    priceLabel: "$420 set",
    city: "New York, NY",
    imageUrl: event("marvel-rivals-night-shift").posterUrl,
    fandomTags: ["Marvel Rivals", "Esports"],
    sublabel: "Service",
    schema: {
      entityType: "listing",
      subtypes: ["service", "hosting"],
      location: "New York, NY",
      summary: "Host and commentary package for crowd-energy-heavy fandom nights.",
      coreSkills: ["hosting", "commentary"],
      operationalStrengths: ["crowd momentum", "programming"],
      primaryInterests: ["watch parties", "competitive play"],
      franchiseInterests: ["Marvel Rivals", "One Piece"],
      audienceOrientation: ["hosts", "fans"],
      eventFormats: ["showcase", "social"],
      embeddingTags: ["host set", "commentary"],
      confidenceNotes: ["Best for events that want a stronger stage identity without overbuilding production."]
    }
  },
  {
    id: "listing-iris-watch-party-kit",
    creatorUserId: "user-iris",
    storefrontId: "storefront-iris",
    type: "commission",
    title: "Watch-party programming kit",
    summary: "Custom segment list, crowd prompts, and run sheet for creator-led watch nights.",
    description: "A planning pack for hosts who want a watch party to feel paced and community-led instead of passive.",
    priceLabel: "$160 kit",
    city: "New York, NY",
    imageUrl: event("marvel-rivals-night-shift").posterUrl,
    fandomTags: ["Marvel Rivals", "One Piece"],
    sublabel: "Commission",
    schema: {
      entityType: "listing",
      subtypes: ["commission", "programming"],
      location: "New York, NY",
      summary: "Planning kit for creator-led watch parties and crowd segments.",
      coreSkills: ["programming", "hosting"],
      operationalStrengths: ["room pacing"],
      primaryInterests: ["watch parties", "fan screenings"],
      franchiseInterests: ["Marvel Rivals", "One Piece"],
      audienceOrientation: ["hosts"],
      eventFormats: ["showcase", "social"],
      embeddingTags: ["run sheet", "watch party"],
      confidenceNotes: ["Useful when a host has venue and fandom but wants a stronger room cadence."]
    }
  }
];

export const opportunities: Opportunity[] = [
  {
    id: "opp-court-social-capture",
    title: "Social capture lead",
    roleType: "Photography / reels",
    summary: "Shoot the hero looks, fan portraits, and launch-night recap for Cosplay Live Drawing.",
    fandomTags: ["Cosplay", "Live Drawing"],
    city: "Pasadena, CA",
    dateLabel: "Apr 3 · 7:30 PM",
    locationLabel: "KTown loft",
    compensation: "$260 + meal + photo credit",
    perks: ["Repeat-series priority", "Creator tag in launch recap"],
    skillTags: ["Photography", "Reels", "Portraits"],
    eventId: "court-of-stars",
    hostUserId: "user-zo",
    socialProof: "Hosted by Zo · repeat city series",
    schema: {
      entityType: "opportunity",
      subtypes: ["photography", "creator role"],
      location: "Pasadena, CA",
      summary: "Lead social capture role on a photo-forward fandom night.",
      coreSkills: ["photography", "reels"],
      operationalStrengths: ["night coverage", "hero selects"],
      primaryInterests: ["cosplay", "creator socials"],
      franchiseInterests: ["Madoka Magica", "Genshin Impact"],
      audienceOrientation: ["fans", "hosts"],
      eventFormats: ["social", "showcase"],
      embeddingTags: ["photo", "reels", "launch recap"],
      confidenceNotes: ["Best fit for creators with quick-turn recap instincts."]
    }
  },
  {
    id: "opp-court-guest-cosplayer",
    title: "Guest cosplayer appearance",
    roleType: "Guest appearance",
    summary: "Lead a quick sketch pose set and meet-and-greet during Cosplay Live Drawing.",
    fandomTags: ["Cosplay", "Creator Feature"],
    city: "Pasadena, CA",
    dateLabel: "Apr 3 · 8:15 PM",
    locationLabel: "KTown loft",
    compensation: "$180 appearance fee",
    perks: ["Tagged promo feature", "Featured on post-event reel"],
    skillTags: ["Cosplay", "On-camera", "Guest experience"],
    eventId: "court-of-stars",
    hostUserId: "user-zo",
    socialProof: "12 mutuals already talking about this night",
    schema: {
      entityType: "opportunity",
      subtypes: ["guest", "creator role"],
      location: "Pasadena, CA",
      summary: "Featured guest role for a creator-facing cosplay night.",
      coreSkills: ["cosplay", "on-camera"],
      operationalStrengths: ["fan-facing presence"],
      primaryInterests: ["cosplay", "creator collabs"],
      franchiseInterests: ["Madoka Magica", "Love and Deepspace"],
      audienceOrientation: ["fans"],
      eventFormats: ["showcase"],
      embeddingTags: ["guest", "appearance", "cosplay"],
      confidenceNotes: ["Most valuable for creators with a recognizable look and easy crowd presence."]
    }
  },
  {
    id: "opp-deepspace-vendor",
    title: "Table vendor pop-in",
    roleType: "Vendor",
    summary: "Bring romance-game merch or fan keepsakes to the Love and Deepspace event.",
    fandomTags: ["Love and Deepspace", "Vendor"],
    city: "Los Angeles, CA",
    dateLabel: "May 27 · 8:00 PM",
    locationLabel: "Court of Stars Hall",
    compensation: "$90 table fee split",
    perks: ["Audience already primed for soft-glam merch"],
    eventId: "love-and-deepspace-afterdark",
    hostUserId: "user-zo",
    socialProof: "Community turnout is already trending above average",
    skillTags: ["Merch table", "Fan service", "Checkout"],
    schema: {
      entityType: "opportunity",
      subtypes: ["vendor", "table"],
      location: "Los Angeles, CA",
      summary: "Vendor table opportunity inside a romance-game fandom night.",
      coreSkills: ["merch", "fan-facing service"],
      operationalStrengths: ["table setup"],
      primaryInterests: ["romance games", "fan keepsakes"],
      franchiseInterests: ["Love and Deepspace"],
      audienceOrientation: ["fans"],
      eventFormats: ["social", "pop-up"],
      embeddingTags: ["vendor", "merch table"],
      confidenceNotes: ["Strong fit for small-batch drops and premium print goods."]
    }
  },
  {
    id: "opp-rivals-dj",
    title: "Tournament warm-up DJ",
    roleType: "Performer",
    summary: "Open Marvel Rivals Night Shift with a thirty-minute high-energy set.",
    fandomTags: ["Marvel Rivals", "Performer"],
    city: "New York, NY",
    dateLabel: "Jun 14 · 7:00 PM",
    locationLabel: "Night Shift rooftop",
    compensation: "$320 set fee",
    perks: ["Repeat invite if turnout clears forecast"],
    eventId: "marvel-rivals-night-shift",
    hostUserId: "user-iris",
    socialProof: "Hosted by Iris · strong repeat crowd",
    skillTags: ["DJ", "Audio", "Crowd read"],
    schema: {
      entityType: "opportunity",
      subtypes: ["performer", "dj"],
      location: "New York, NY",
      summary: "Warm-up DJ slot for a competitive fandom night.",
      coreSkills: ["dj", "audio"],
      operationalStrengths: ["crowd energy"],
      primaryInterests: ["esports", "nightlife"],
      franchiseInterests: ["Marvel Rivals"],
      audienceOrientation: ["fans"],
      eventFormats: ["social", "showcase"],
      embeddingTags: ["dj", "tournament"],
      confidenceNotes: ["Best for DJs who can pace a crowd before brackets lock in."]
    }
  },
  {
    id: "opp-rivals-photo",
    title: "Clips + stills shooter",
    roleType: "Photo / video",
    summary: "Capture bracket reactions and hero moments for the Night Shift recap.",
    fandomTags: ["Marvel Rivals", "Content"],
    city: "New York, NY",
    dateLabel: "Jun 14 · 7:00 PM",
    locationLabel: "Night Shift rooftop",
    compensation: "$280 coverage",
    perks: ["Tag on every recap asset", "Potential repeat city date"],
    eventId: "marvel-rivals-night-shift",
    hostUserId: "user-iris",
    socialProof: "Launch already has strong clip-sharing pull",
    skillTags: ["Photography", "Video", "Fast edits"],
    schema: {
      entityType: "opportunity",
      subtypes: ["photo", "video"],
      location: "New York, NY",
      summary: "Capture role for a loud, clip-driven gaming event.",
      coreSkills: ["video", "photo"],
      operationalStrengths: ["reaction capture"],
      primaryInterests: ["gaming", "esports"],
      franchiseInterests: ["Marvel Rivals"],
      audienceOrientation: ["fans", "hosts"],
      eventFormats: ["social"],
      embeddingTags: ["clips", "stills", "gaming"],
      confidenceNotes: ["Strong fit for creators who edit for social first, archive second."]
    }
  },
  {
    id: "opp-jujutsu-checkin",
    title: "Guest flow + check-in",
    roleType: "Host support",
    summary: "Handle check-in and line pacing for Jujutsu Kaisen Night Out.",
    fandomTags: ["Jujutsu Kaisen", "Ops"],
    city: "Los Angeles, CA",
    dateLabel: "Apr 18 · 6:30 PM",
    locationLabel: "Downtown social hall",
    compensation: "$140 shift",
    perks: ["Free ticket + creator intro"],
    eventId: "jujutsu-night-out",
    hostUserId: "user-iris",
    socialProof: "Low-friction role with strong repeat-host upside",
    skillTags: ["Check-in", "Guest experience", "Crowd flow"],
    schema: {
      entityType: "opportunity",
      subtypes: ["ops", "check-in"],
      location: "Los Angeles, CA",
      summary: "Guest-flow role for a high-energy anime social.",
      coreSkills: ["guest experience", "check-in"],
      operationalStrengths: ["line pacing", "ops support"],
      primaryInterests: ["anime nights"],
      franchiseInterests: ["Jujutsu Kaisen"],
      audienceOrientation: ["fans"],
      eventFormats: ["social"],
      embeddingTags: ["check-in", "ops"],
      confidenceNotes: ["Great first role for contributors who want to get inside trusted host circles."]
    }
  },
  {
    id: "opp-digimon-merch",
    title: "Retro merch table",
    roleType: "Vendor",
    summary: "Bring pins, prints, or vintage finds to Digimon Night.",
    fandomTags: ["Digimon", "Vendor"],
    city: "Pasadena, CA",
    dateLabel: "Apr 11 · 7:00 PM",
    locationLabel: "Arcadia Collectors Hall",
    compensation: "Table split + no booth fee",
    perks: ["Collectors already in room"],
    eventId: "digimon-night",
    hostUserId: "user-zo",
    socialProof: "Collectors hall already wants a merch anchor",
    skillTags: ["Merch table", "Collector sales", "Display"],
    schema: {
      entityType: "opportunity",
      subtypes: ["vendor", "merch"],
      location: "Pasadena, CA",
      summary: "Retro vendor table for a nostalgia-coded fandom night.",
      coreSkills: ["merch", "display"],
      operationalStrengths: ["small-footprint booth"],
      primaryInterests: ["retro anime", "collector culture"],
      franchiseInterests: ["Digimon"],
      audienceOrientation: ["fans"],
      eventFormats: ["social", "pop-up"],
      embeddingTags: ["retro", "vendor", "booth"],
      confidenceNotes: ["Strong fit for resale sellers and small merch drops."]
    }
  },
  {
    id: "opp-onepiece-artist",
    title: "Artist alley anchor",
    roleType: "Artist",
    summary: "Help set the creative tone for Harbor Run, a One Piece soft launch still building momentum.",
    fandomTags: ["One Piece", "Soft launch"],
    city: "Los Angeles, CA",
    dateLabel: "Date still forming",
    locationLabel: "Harbor district",
    compensation: "Revenue share + featured billing",
    perks: ["Front-page creator card on launch page"],
    campaignId: "launch-harbor-run-0x1",
    hostUserId: "user-zo",
    socialProof: "One Piece room is already debating themes",
    skillTags: ["Illustration", "Table setup", "Fan merch"],
    schema: {
      entityType: "opportunity",
      subtypes: ["artist", "soft launch"],
      location: "Los Angeles, CA",
      summary: "Artist alley anchor role for a fandom night still in interest-check mode.",
      coreSkills: ["illustration", "merch"],
      operationalStrengths: ["table presence"],
      primaryInterests: ["one piece", "artist alleys"],
      franchiseInterests: ["One Piece"],
      audienceOrientation: ["fans"],
      eventFormats: ["soft launch", "pop-up"],
      embeddingTags: ["artist alley", "soft launch"],
      confidenceNotes: ["Works best when the creator can help sell the mood before a venue is locked."]
    }
  },
  {
    id: "opp-genshin-wig",
    title: "Wig styling pop-up",
    roleType: "Service table",
    summary: "Offer touch-ups and styling help during Genshin Scavenger Hunt kickoff.",
    fandomTags: ["Genshin Impact", "Cosplay"],
    city: "Los Angeles, CA",
    dateLabel: "May 26 · 4:30 PM",
    locationLabel: "City-wide kickoff point",
    compensation: "$160 + tip jar",
    perks: ["Your service gets featured in clue-drop promo"],
    eventId: "cosplay-figure-drawing",
    hostUserId: "user-rephos",
    socialProof: "Teams already want service stops mapped into the route",
    skillTags: ["Wig styling", "Touch-ups", "Cosplay"],
    schema: {
      entityType: "opportunity",
      subtypes: ["service", "pop-up"],
      location: "Los Angeles, CA",
      summary: "On-site styling service for a cosplay-friendly scavenger hunt.",
      coreSkills: ["wig styling", "fan service"],
      operationalStrengths: ["portable setup"],
      primaryInterests: ["cosplay", "game fandoms"],
      franchiseInterests: ["Genshin Impact"],
      audienceOrientation: ["fans"],
      eventFormats: ["scavenger hunt", "pop-up"],
      embeddingTags: ["styling", "touch-ups"],
      confidenceNotes: ["Great for creators who make the event itself feel more worth showing up for."]
    }
  },
  {
    id: "opp-nightshift-moderator",
    title: "Floor moderator",
    roleType: "Moderator",
    summary: "Help pace crowd transitions, rules clarifications, and stage handoffs.",
    fandomTags: ["Marvel Rivals", "Ops"],
    city: "New York, NY",
    dateLabel: "Jun 14 · 8:00 PM",
    locationLabel: "Night Shift rooftop",
    compensation: "$180 shift",
    perks: ["Priority on next city expansion"],
    eventId: "marvel-rivals-night-shift",
    hostUserId: "user-iris",
    socialProof: "Host is already planning repeat runs",
    skillTags: ["Moderation", "Ops", "Crowd control"],
    schema: {
      entityType: "opportunity",
      subtypes: ["moderator", "ops"],
      location: "New York, NY",
      summary: "Room moderator role for a loud gaming night.",
      coreSkills: ["moderation", "ops"],
      operationalStrengths: ["crowd control"],
      primaryInterests: ["gaming", "competitive scenes"],
      franchiseInterests: ["Marvel Rivals"],
      audienceOrientation: ["fans"],
      eventFormats: ["social", "showcase"],
      embeddingTags: ["moderation", "ops"],
      confidenceNotes: ["Best for contributors who can keep pace without flattening the energy."]
    }
  },
  {
    id: "opp-softlaunch-copy",
    title: "Launch copy collaborator",
    roleType: "Creator collaboration",
    summary: "Help write teaser copy and early social posts for a soft-launch romance-game salon.",
    fandomTags: ["Love and Deepspace", "Soft launch"],
    city: "Los Angeles, CA",
    dateLabel: "Remote this week",
    locationLabel: "Async",
    compensation: "$120 project",
    perks: ["Byline on launch assets"],
    campaignId: "launch-moonlit-salon-0x1",
    hostUserId: "user-zo",
    socialProof: "Host wants the launch to feel premium from day one",
    skillTags: ["Copywriting", "Launch messaging", "Social"],
    schema: {
      entityType: "opportunity",
      subtypes: ["copy", "soft launch"],
      location: "Los Angeles, CA",
      summary: "Short copy collaboration role for a romance-game interest check.",
      coreSkills: ["copywriting", "social"],
      operationalStrengths: ["launch framing"],
      primaryInterests: ["romance games", "soft glam"],
      franchiseInterests: ["Love and Deepspace"],
      audienceOrientation: ["fans", "hosts"],
      eventFormats: ["soft launch", "social"],
      embeddingTags: ["copy", "teaser"],
      confidenceNotes: ["Strong fit for creators who can make a launch concept feel worth sharing."]
    }
  }
];

export const opportunityApplications: OpportunityApplication[] = [
  {
    id: "application-1",
    opportunityId: "opp-court-social-capture",
    userId: "user-noa",
    status: "shortlisted",
    note: "I can turn the first selects around that same night.",
    submittedAt: "2026-03-20T17:10:00"
  },
  {
    id: "application-2",
    opportunityId: "opp-onepiece-artist",
    userId: "user-sera",
    status: "submitted",
    note: "I can bring portrait mini-prints and a quick sketch station.",
    submittedAt: "2026-03-19T11:24:00"
  },
  {
    id: "application-3",
    opportunityId: "opp-rivals-photo",
    userId: "user-rephos",
    status: "accepted",
    note: "I can handle clips, stills, and social-first framing.",
    submittedAt: "2026-03-18T09:04:00"
  }
];

export const listingInterests: ListingInterest[] = [
  {
    id: "listing-interest-1",
    listingId: "listing-sera-polaroid-pack",
    userId: "user-kai",
    kind: "saved",
    createdAt: "2026-03-19T15:00:00"
  },
  {
    id: "listing-interest-2",
    listingId: "listing-aphex-promo-kit",
    userId: "user-zo",
    kind: "requested",
    createdAt: "2026-03-18T17:00:00"
  }
];

const businessCover = (title: string, subtitle: string) =>
  fallbackCover(title, "business", subtitle);

export const businessProfiles: BusinessProfile[] = [
  {
    id: "business-neon-shrine",
    ownerUserId: "user-viv",
    name: "Neon Shrine Rooftop",
    handle: "@neonshrine",
    businessType: "venue",
    city: "Los Angeles, CA",
    area: "Arts District",
    avatarUrl: createAvatarDataUri("Neon Shrine", "#1F1CB8", "#7B57FF"),
    coverImageUrl: businessCover("Neon Shrine Rooftop", "Late-night rooftop built for fan screenings and performance-led socials"),
    summary: "Flexible rooftop venue that likes fandom nights with strong visual identity and repeat-city upside.",
    hostingPreferences: ["Late-night socials", "Watch parties", "Soft-launch fandom nights"],
    supportInterests: ["Launch boosts", "Creator tables", "Room upgrades"],
    fandomInterests: ["Marvel Rivals", "One Piece", "Jujutsu Kaisen"],
    eventFormatInterests: ["social", "showcase", "pop-up"],
    availability: {
      status: "available",
      windows: ["Thu evenings", "Fri late", "Sun sunset"],
      capacities: ["80 seated", "140 standing"],
      notes: "Open to holds once a launch is funded or nearly there."
    },
    matchedItemIds: ["match-neon-marvel", "match-neon-onepiece", "match-neon-iris"],
    schema: {
      entityType: "business",
      subtypes: ["venue", "rooftop"],
      location: "Los Angeles, CA",
      summary: "Rooftop venue focused on fandom nights with stage moments and visual social pull.",
      coreSkills: ["hosting", "roof access", "late-night ops"],
      operationalStrengths: ["night visibility", "repeat series support"],
      primaryInterests: ["watch parties", "fandom nightlife"],
      franchiseInterests: ["Marvel Rivals", "One Piece", "Jujutsu Kaisen"],
      audienceOrientation: ["fans", "creators"],
      eventFormats: ["social", "showcase"],
      embeddingTags: ["rooftop", "nightlife", "fandom"],
      confidenceNotes: ["Best for campaigns that already look social-first and city-coded."]
    }
  },
  {
    id: "business-k-town-loft",
    ownerUserId: "user-zo",
    name: "K-Town Photo Loft",
    handle: "@ktownloft",
    businessType: "studio",
    city: "Pasadena, CA",
    area: "Koreatown",
    avatarUrl: createAvatarDataUri("KTown Loft", "#4C8CFF", "#1F1CB8"),
    coverImageUrl: businessCover("K-Town Photo Loft", "Photo-first studio for creator socials, portraits, and small live sets"),
    summary: "Studio-loft hybrid perfect for live drawing, portraits, styling tables, and social-first launches.",
    hostingPreferences: ["Creator salons", "Portrait nights", "Soft launch previews"],
    supportInterests: ["Photo corners", "Backdrop support"],
    fandomInterests: ["Cosplay", "Love and Deepspace", "Genshin Impact"],
    eventFormatInterests: ["showcase", "social"],
    availability: {
      status: "available",
      windows: ["Weeknights", "Sunday afternoons"],
      capacities: ["60 standing", "40 seated"],
      notes: "Best when the room is photo-driven."
    },
    matchedItemIds: ["match-loft-court", "match-loft-sera", "match-loft-genshin"],
    schema: {
      entityType: "business",
      subtypes: ["studio", "photo loft"],
      location: "Pasadena, CA",
      summary: "Photo loft that pairs well with creator-first fandom nights and portraits.",
      coreSkills: ["photo setup", "small event hosting"],
      operationalStrengths: ["lighting", "set flexibility"],
      primaryInterests: ["cosplay", "portrait-driven socials"],
      franchiseInterests: ["Love and Deepspace", "Genshin Impact"],
      audienceOrientation: ["fans", "creators"],
      eventFormats: ["showcase", "social"],
      embeddingTags: ["photo loft", "portraits", "creator night"],
      confidenceNotes: ["Strong fit when visual output is part of the value prop."]
    }
  },
  {
    id: "business-harbor-house",
    ownerUserId: "user-viv",
    name: "Harbor House Cafe",
    handle: "@harborhouse",
    businessType: "cafe",
    city: "Los Angeles, CA",
    area: "San Pedro",
    avatarUrl: createAvatarDataUri("Harbor House", "#3B7D96", "#1F1CB8"),
    coverImageUrl: businessCover("Harbor House Cafe", "Cafe lounge for softer fandom salons, merch drops, and intimate creator nights"),
    summary: "Intimate cafe that likes low-pressure fandom salons, merch pop-ins, and community soft launches.",
    hostingPreferences: ["Salons", "Creator meetups", "Merch drops"],
    supportInterests: ["Drink support", "Check-in support"],
    fandomInterests: ["One Piece", "Love and Deepspace", "Genshin Impact"],
    eventFormatInterests: ["social", "workshop", "pop-up"],
    availability: {
      status: "limited",
      windows: ["Saturdays before 6 PM", "Mondays after 7 PM"],
      capacities: ["35 seated", "50 standing"],
      notes: "Good fit for intimate launches and community meetups."
    },
    matchedItemIds: ["match-harbor-onepiece", "match-harbor-aphex"],
    schema: {
      entityType: "business",
      subtypes: ["cafe", "salon"],
      location: "Los Angeles, CA",
      summary: "Intimate cafe-lounge well matched to small fandom salons and merch drops.",
      coreSkills: ["small event hosting", "beverage support"],
      operationalStrengths: ["intimacy", "hospitality"],
      primaryInterests: ["salons", "merch drops"],
      franchiseInterests: ["One Piece", "Love and Deepspace"],
      audienceOrientation: ["fans", "creators"],
      eventFormats: ["social", "workshop", "pop-up"],
      embeddingTags: ["cafe", "salon", "low-pressure"],
      confidenceNotes: ["Best when the night is about intimacy and repeat local community."]
    }
  },
  {
    id: "business-arcadia-hall",
    ownerUserId: "user-viv",
    name: "Arcadia Collectors Hall",
    handle: "@arcadiahall",
    businessType: "brand",
    city: "Pasadena, CA",
    area: "Arcadia",
    avatarUrl: createAvatarDataUri("Arcadia Hall", "#FF9E3D", "#1F1CB8"),
    coverImageUrl: businessCover("Arcadia Collectors Hall", "Collector-focused space for nostalgia nights, booths, and fandom trading"),
    summary: "Collector hall and retail partner that likes nostalgia-coded fandom nights, resale tables, and vendor-heavy events.",
    hostingPreferences: ["Retro nights", "Vendor halls", "Collector meetups"],
    supportInterests: ["Prize support", "Merch sponsorship", "Vendor anchor"],
    fandomInterests: ["Digimon", "One Piece", "Marvel Rivals"],
    eventFormatInterests: ["pop-up", "social", "showcase"],
    availability: {
      status: "available",
      windows: ["Fri evenings", "Weekend all day"],
      capacities: ["120 standing", "40 table spots"],
      notes: "Strong fit for merch, resale, and nostalgia-coded formats."
    },
    matchedItemIds: ["match-arcadia-digimon", "match-arcadia-vendor", "match-arcadia-store"],
    schema: {
      entityType: "business",
      subtypes: ["collector hall", "retail partner"],
      location: "Pasadena, CA",
      summary: "Collector venue with built-in support for vendor-heavy fandom nights.",
      coreSkills: ["vendor setup", "merch support"],
      operationalStrengths: ["collector audience", "table infrastructure"],
      primaryInterests: ["nostalgia fandoms", "vendor activations"],
      franchiseInterests: ["Digimon", "One Piece"],
      audienceOrientation: ["fans", "vendors"],
      eventFormats: ["pop-up", "social"],
      embeddingTags: ["collector", "vendor", "retro"],
      confidenceNotes: ["Best for nights where merchandise and booth culture are part of the draw."]
    }
  }
];

export const matchExplanations: MatchExplanation[] = [
  {
    id: "match-neon-marvel",
    businessId: "business-neon-shrine",
    targetType: "launch",
    targetId: "marvel-rivals-night-shift",
    title: "Night Shift fits the rooftop",
    summary: "Late-night energy, competitive crowd, and strong clip-sharing pull make this a clean hosting fit.",
    chips: ["Location fit", "Late-night format", "Crowd energy"],
    confidenceNotes: ["Audience wants a louder room", "Night access suits the format"],
    suggestedAction: "host"
  },
  {
    id: "match-neon-onepiece",
    businessId: "business-neon-shrine",
    targetType: "launch",
    targetId: "launch-harbor-run-0x1",
    title: "Harbor Run could scale here",
    summary: "If the harbor concept keeps momentum, the rooftop can host a dockside-night reinterpretation.",
    chips: ["Format fit", "Audience fit", "Visual identity"],
    confidenceNotes: ["Would work once the soft launch clears threshold"],
    suggestedAction: "support"
  },
  {
    id: "match-neon-iris",
    businessId: "business-neon-shrine",
    targetType: "creator",
    targetId: "user-iris",
    title: "Iris is a strong host voice for this room",
    summary: "Commentary, pacing, and on-stage clarity all match the rooftop’s best-performing nights.",
    chips: ["Host fit", "Stage fit", "Audience fit"],
    confidenceNotes: ["Could anchor future repeat city nights"],
    suggestedAction: "book"
  },
  {
    id: "match-loft-court",
    businessId: "business-k-town-loft",
    targetType: "event",
    targetId: "court-of-stars",
    title: "Cosplay Live Drawing belongs in the loft",
    summary: "Photo-first lighting, creator tables, and portrait demand line up with the loft’s strongest use case.",
    chips: ["Visual fit", "Format fit", "Location fit"],
    confidenceNotes: ["Already proven on this format"],
    suggestedAction: "host"
  },
  {
    id: "match-loft-sera",
    businessId: "business-k-town-loft",
    targetType: "creator",
    targetId: "user-sera",
    title: "Sera would elevate portrait nights here",
    summary: "Portrait-led fan sessions and premium creator tables fit the studio’s visual identity.",
    chips: ["Creator fit", "Visual fit", "Service fit"],
    confidenceNotes: ["Could be bundled into photo-first fan nights"],
    suggestedAction: "book"
  },
  {
    id: "match-loft-genshin",
    businessId: "business-k-town-loft",
    targetType: "opportunity",
    targetId: "opp-genshin-wig",
    title: "The wig styling stop complements the loft",
    summary: "Touch-up service and cosplay prep moments match the loft’s prep-night audience.",
    chips: ["Service fit", "Cosplay fit", "Audience fit"],
    confidenceNotes: ["Could be paired with portraits or a soft-launch preview"],
    suggestedAction: "support"
  },
  {
    id: "match-harbor-onepiece",
    businessId: "business-harbor-house",
    targetType: "launch",
    targetId: "launch-harbor-run-0x1",
    title: "Harbor Run is a natural cafe soft-launch",
    summary: "The One Piece concept reads intimate enough to start here before graduating to a larger venue.",
    chips: ["Theme fit", "Scale fit", "Neighborhood fit"],
    confidenceNotes: ["Great if the host wants an early-community version first"],
    suggestedAction: "host"
  },
  {
    id: "match-harbor-aphex",
    businessId: "business-harbor-house",
    targetType: "creator",
    targetId: "user-rephos",
    title: "Aphex could help package cafe launches",
    summary: "Their promo and creator support work would make Harbor House launches feel intentional fast.",
    chips: ["Creator fit", "Launch fit", "Scene fit"],
    confidenceNotes: ["Strong partner for intimate launch copy and visuals"],
    suggestedAction: "book"
  },
  {
    id: "match-arcadia-digimon",
    businessId: "business-arcadia-hall",
    targetType: "event",
    targetId: "digimon-night",
    title: "Digimon Night maps cleanly to Arcadia",
    summary: "Collector energy, resale tables, and nostalgia-coded programming all align here.",
    chips: ["Collector fit", "Format fit", "Audience fit"],
    confidenceNotes: ["Could expand into a larger vendor night"],
    suggestedAction: "host"
  },
  {
    id: "match-arcadia-vendor",
    businessId: "business-arcadia-hall",
    targetType: "opportunity",
    targetId: "opp-digimon-merch",
    title: "Vendor table call matches the hall",
    summary: "The hall already supports the exact kind of collector tables this night wants.",
    chips: ["Vendor fit", "Infrastructure fit", "Audience fit"],
    confidenceNotes: ["Could be supported with prize packs or extra tables"],
    suggestedAction: "support"
  },
  {
    id: "match-arcadia-store",
    businessId: "business-arcadia-hall",
    targetType: "creator",
    targetId: "user-noa",
    title: "Noa’s print drop would sell here",
    summary: "Collector-minded traffic and retro fandom overlap make the print merch a strong fit.",
    chips: ["Merch fit", "Audience fit", "Location fit"],
    confidenceNotes: ["Could anchor a small creator merch corner"],
    suggestedAction: "book"
  }
];

export const supportIntents: SupportIntent[] = [
  {
    id: "support-1",
    businessId: "business-k-town-loft",
    targetType: "event",
    targetId: "court-of-stars",
    action: "hosting",
    createdAt: "2026-03-18T17:00:00"
  },
  {
    id: "support-2",
    businessId: "business-arcadia-hall",
    targetType: "event",
    targetId: "digimon-night",
    action: "supporting",
    createdAt: "2026-03-20T13:10:00"
  }
];

export function getStorefrontById(id: string) {
  return storefronts.find((item) => item.id === id);
}

export function getStorefrontForUser(userId: string) {
  return storefronts.find((item) => item.ownerUserId === userId);
}

export function getListingsForUser(userId: string, listingPool: Listing[] = listings) {
  return listingPool.filter((item) => item.creatorUserId === userId);
}

export function getOpportunityById(id: string) {
  return opportunities.find((item) => item.id === id);
}

export function getListingById(id: string, listingPool: Listing[] = listings) {
  return listingPool.find((item) => item.id === id);
}

export function getBusinessProfileById(id: string, businessPool: BusinessProfile[] = businessProfiles) {
  return businessPool.find((item) => item.id === id);
}

export function getMatchExplanationsForBusiness(businessId: string) {
  return matchExplanations.filter((item) => item.businessId === businessId);
}

export function getOpportunityContext(opportunity: Opportunity) {
  return opportunity.eventId ? event(opportunity.eventId) : opportunity.campaignId ? launch(opportunity.campaignId) : null;
}

export function getStorefrontContext(userId: string) {
  const storefront = getStorefrontForUser(userId);
  const owner = users.find((item) => item.id === userId);

  return {
    storefront,
    owner,
    listings: getListingsForUser(userId)
  };
}
