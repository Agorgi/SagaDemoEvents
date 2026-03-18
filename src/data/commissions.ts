import { events } from "@/src/data/demo";

export type CommissionType = "event" | "creator project";
export type CommissionStatus = "live" | "ending soon" | "funded";
export type CommissionActivityType = "commitment" | "update" | "comment" | "role";

export type CommissionTier = {
  id: string;
  title: string;
  amount: number;
  description: string;
  perks: string[];
};

export type CommissionOpenRole = {
  id: string;
  roleName: string;
  payoutRange: [number, number];
  requiredSkills: string[];
  status: "open" | "filled";
  filledByUserId?: string;
  applicantUserIds: string[];
};

export type CommissionActivity = {
  id: string;
  authorId: string;
  type: CommissionActivityType;
  text: string;
  createdAt: string;
  amount?: number;
};

export type DemoCommission = {
  id: string;
  title: string;
  shortDescription: string;
  description: string;
  type: CommissionType;
  fandomTags: string[];
  city: string;
  timingLabel: string;
  hostId: string;
  goalAmount: number;
  raisedAmount: number;
  backerCount: number;
  daysLeft: number;
  status: CommissionStatus;
  imageUrl: string;
  featured?: boolean;
  linkedEventId?: string;
  whatThisUnlocks: string[];
  trustNotes: string[];
  tiers: CommissionTier[];
  openRoles: CommissionOpenRole[];
  activity: CommissionActivity[];
  backedByUserIds: string[];
};

const poster = {
  court: events.find((event) => event.id === "court-of-stars")?.posterUrl ?? "",
  deepSpace:
    events.find((event) => event.id === "love-and-deepspace-afterdark")?.posterUrl ?? "",
  cosplay:
    events.find((event) => event.id === "cosplay-figure-drawing")?.posterUrl ?? "",
  uma:
    events.find((event) => event.id === "uma-musume-trackside-social")?.posterUrl ?? "",
  genshin:
    events.find((event) => event.id === "genshin-lantern-social")?.posterUrl ?? "",
  marvel:
    events.find((event) => event.id === "marvel-rivals-night-shift")?.posterUrl ?? "",
  jujutsu:
    events.find((event) => event.id === "jujutsu-night-out")?.posterUrl ?? "",
  digimon: events.find((event) => event.id === "digimon-night")?.posterUrl ?? ""
};

export const seedCommissions: DemoCommission[] = [
  {
    id: "court-of-stars-expansion",
    title: "Fandom Paintball Day",
    shortDescription:
      "Back a team-based paintball takeover with faction color bands, referee crew, and a polished end-of-day photo reel.",
    description:
      "This commission funds a fandom-native paintball day designed to feel organized, cinematic, and easy to repeat. The money covers a reserved field block, visible team theming, cleaner referee support, and enough production polish to turn one chaotic outing into a format the community will want back on the calendar.",
    type: "event",
    fandomTags: ["Paintball", "Team Event", "Field Day"],
    city: "Pasadena, CA",
    timingLabel: "Fund by July 8 for the first field takeover",
    hostId: "user-zo",
    goalAmount: 10000,
    raisedAmount: 7600,
    backerCount: 184,
    daysLeft: 6,
    status: "live",
    imageUrl: "/commissions/paintball.png",
    featured: true,
    whatThisUnlocks: [
      "Reserved field time with clearer match pacing and team rotations.",
      "Referee and safety support so new players can join without friction.",
      "A cinematic end-of-day photo and clip package to help the format repeat."
    ],
    trustNotes: [
      "The host already has the player group and field hold lined up.",
      "Crew roles are visible before funding closes, not added later as an afterthought.",
      "Backers are funding a scoped production upgrade with obvious outputs."
    ],
    tiers: [
      {
        id: "court-tier-1",
        title: "Paint Ammo Support",
        amount: 10,
        description: "Help lock the field package and get production updates from the host.",
        perks: ["Backer badge", "Production updates"]
      },
      {
        id: "court-tier-2",
        title: "Player Slot",
        amount: 35,
        description: "Reserve a backer player slot in the first fully-produced session.",
        perks: ["Reserved player slot", "Digital photo pack"]
      },
      {
        id: "court-tier-3",
        title: "Squad Captain",
        amount: 85,
        description: "Lead a squad and join the host huddle before matches start.",
        perks: ["Reserved player slot", "Host huddle access", "Name on the thank-you wall"]
      }
    ],
    openRoles: [
      {
        id: "court-commission-role-1",
        roleName: "Field Marshal",
        payoutRange: [220, 420],
        requiredSkills: ["ops", "safety", "run of show"],
        status: "open",
        applicantUserIds: ["user-noa"]
      },
      {
        id: "court-commission-role-2",
        roleName: "Photo Capture Lead",
        payoutRange: [250, 480],
        requiredSkills: ["photography", "social promo", "editing"],
        status: "open",
        applicantUserIds: ["user-sia", "user-mika"]
      }
    ],
    activity: [
      {
        id: "court-activity-1",
        authorId: "user-zo",
        type: "update",
        text: "Field availability is locked. Funding now determines whether this feels like a real takeover or just a casual group outing.",
        createdAt: "2026-03-08T10:14:00"
      },
      {
        id: "court-activity-2",
        authorId: "user-kai",
        type: "commitment",
        text: "Backing because a fandom paintball day with actual production is exactly the kind of format that should come back monthly.",
        createdAt: "2026-03-09T18:22:00",
        amount: 35
      },
      {
        id: "court-activity-3",
        authorId: "user-noa",
        type: "role",
        text: "Interested in running field photography if the first takeover clears funding.",
        createdAt: "2026-03-10T08:40:00"
      }
    ],
    backedByUserIds: ["user-kai", "user-noa"]
  },
  {
    id: "cosplay-figure-drawing-night",
    title: "Wig Styling Meetup",
    shortDescription:
      "Fund a creator-led wig styling meetup with demo stations, shared supplies, and polished before-and-after portfolio shots.",
    description:
      "This commission turns an informal cosplay prep hang into a real community workshop. Funding covers communal tools, fiber stock, guided demo time, and a clean photo setup so attendees leave with both progress on their wigs and content worth sharing.",
    type: "creator project",
    fandomTags: ["Wig Styling", "Cosplay", "Workshop"],
    city: "Los Angeles, CA",
    timingLabel: "Funding closes before the next supply order",
    hostId: "user-rephos",
    goalAmount: 4200,
    raisedAmount: 2400,
    backerCount: 72,
    daysLeft: 11,
    status: "live",
    imageUrl: "/commissions/wig-styling-meetup.png",
    whatThisUnlocks: [
      "Shared styling stations with clamps, mirrors, and heat-safe setup.",
      "A material table so newcomers can participate without buying everything up front.",
      "Before-and-after portraits that help the workshop sell through the community."
    ],
    trustNotes: [
      "The host already runs creator-facing fandom gatherings in this city.",
      "Funding maps directly to tools, materials, and the workshop environment.",
      "The meetup can repeat easily once the first supply run is covered."
    ],
    tiers: [
      {
        id: "cosplay-tier-1",
        title: "Supply Table",
        amount: 12,
        description: "Help cover the communal materials table and get workshop updates.",
        perks: ["Workshop updates", "Digital styling reference pack"]
      },
      {
        id: "cosplay-tier-2",
        title: "Styling Seat",
        amount: 30,
        description: "Reserve a backer seat in the first styling meetup block.",
        perks: ["Reserved styling seat", "Digital styling reference pack"]
      },
      {
        id: "cosplay-tier-3",
        title: "Reference Circle",
        amount: 65,
        description: "Join the host circle for one guided review and portrait set at the end of the meetup.",
        perks: ["Reserved styling seat", "Guided review", "Workshop sticker sheet"]
      }
    ],
    openRoles: [
      {
        id: "cosplay-commission-role-1",
        roleName: "Workshop Assistant",
        payoutRange: [180, 280],
        requiredSkills: ["cosplay", "community moderation", "runner"],
        status: "open",
        applicantUserIds: ["user-jules"]
      }
    ],
    activity: [
      {
        id: "cosplay-activity-1",
        authorId: "user-rephos",
        type: "update",
        text: "The meetup space is ready. Funding now decides whether we can stock enough tools and fibers for everyone who wants in.",
        createdAt: "2026-03-07T15:20:00"
      },
      {
        id: "cosplay-activity-2",
        authorId: "user-marlowe",
        type: "comment",
        text: "Would love one clean portrait corner at the end so people can document the final styling work.",
        createdAt: "2026-03-08T09:55:00"
      }
    ],
    backedByUserIds: ["user-zo"]
  },
  {
    id: "jujutsu-rooftop-screening",
    title: "Netflix Writing Project",
    shortDescription:
      "Back a focused writers-room sprint for a pitch deck, character treatments, and a polished proof-of-concept packet.",
    description:
      "This commission funds a creator writers-room project with a clear output: a stronger pitch deck, tighter character work, and a packet that looks serious enough to circulate. Instead of funding a vague dream, backers are helping pay for focused work sessions, feedback, and the materials needed to package the concept professionally.",
    type: "creator project",
    fandomTags: ["Writing Room", "Pitch Deck", "Creator Project"],
    city: "Los Angeles, CA",
    timingLabel: "Writers-room sprint planned for next weekend",
    hostId: "user-rephos",
    goalAmount: 5800,
    raisedAmount: 5160,
    backerCount: 129,
    daysLeft: 2,
    status: "ending soon",
    imageUrl: "/commissions/netflix-writing-project.png",
    whatThisUnlocks: [
      "A full writers-room weekend with dedicated revision time.",
      "Formatted character treatments, deck pages, and series framing.",
      "A cleaner proof-of-concept packet for trusted early reads."
    ],
    trustNotes: [
      "Funding is already near the goal and tied to a defined output.",
      "The creator is sharing concrete deliverables, not just broad intent.",
      "Backers can see exactly what the last stretch of funding unlocks."
    ],
    tiers: [
      {
        id: "jujutsu-tier-1",
        title: "Script Supporter",
        amount: 15,
        description: "Help close the sprint budget and get progress updates from the writing room.",
        perks: ["Backer updates", "Writers-room recap"]
      },
      {
        id: "jujutsu-tier-2",
        title: "First Read",
        amount: 28,
        description: "Receive an early backer excerpt once the packet draft is ready.",
        perks: ["Early excerpt", "Writers-room recap"]
      },
      {
        id: "jujutsu-tier-3",
        title: "Feedback Circle",
        amount: 60,
        description: "Join a small backer feedback session after the first draft packet is assembled.",
        perks: ["Early excerpt", "Feedback session", "Signed concept page"]
      }
    ],
    openRoles: [
      {
        id: "jujutsu-commission-role-1",
        roleName: "Story Editor",
        payoutRange: [150, 260],
        requiredSkills: ["writing", "editing", "story development"],
        status: "open",
        applicantUserIds: ["user-jasper"]
      }
    ],
    activity: [
      {
        id: "jujutsu-activity-1",
        authorId: "user-rephos",
        type: "update",
        text: "The writing sprint calendar is set. We only need one more push to lock the editor and print-ready deck support.",
        createdAt: "2026-03-08T13:12:00"
      },
      {
        id: "jujutsu-activity-2",
        authorId: "user-kai",
        type: "commitment",
        text: "Backing because a polished packet is the difference between a cool idea and something people can actually champion.",
        createdAt: "2026-03-09T21:11:00",
        amount: 28
      }
    ],
    backedByUserIds: ["user-kai"]
  },
  {
    id: "digimon-fan-zine-launch-party",
    title: "Creator Photoshoot Day",
    shortDescription:
      "Fund a styled photoshoot day with a rented location, glam prep, and hero-image delivery for the creator lineup.",
    description:
      "This commission helps creators pool resources for a single high-quality shoot day instead of juggling fragmented DIY sessions. Funding goes into the location, lighting, prep support, and same-day selects so everyone walks away with content strong enough to anchor their next event or campaign drop.",
    type: "creator project",
    fandomTags: ["Photoshoot", "Portfolio", "Creator Drop"],
    city: "Los Angeles, CA",
    timingLabel: "Shoot date locks in 9 days",
    hostId: "user-pia",
    goalAmount: 3200,
    raisedAmount: 3340,
    backerCount: 108,
    daysLeft: 9,
    status: "funded",
    imageUrl: "/commissions/photoshoot.png",
    whatThisUnlocks: [
      "A better location with room for multiple clean setups.",
      "Lighting, glam prep, and a coordinated shoot schedule.",
      "Same-day selects that creators can immediately use for rollout."
    ],
    trustNotes: [
      "Funding already crossed the production threshold.",
      "Backers are helping scale the quality, not rescue an undefined plan.",
      "The creator roster and deliverables are already visible."
    ],
    tiers: [
      {
        id: "digimon-tier-1",
        title: "Call Sheet Support",
        amount: 8,
        description: "Help close the shoot budget and receive the final recap thread.",
        perks: ["Backer recap", "Contact sheet preview"]
      },
      {
        id: "digimon-tier-2",
        title: "Selects Pack",
        amount: 24,
        description: "Receive a backer selects pack once the best shots are delivered.",
        perks: ["Selects pack", "Contact sheet preview"]
      },
      {
        id: "digimon-tier-3",
        title: "Shoot Circle",
        amount: 55,
        description: "Join the behind-the-scenes circle and see the final lighting setup before cameras roll.",
        perks: ["Selects pack", "Shoot circle access", "Mini signed print"]
      }
    ],
    openRoles: [
      {
        id: "digimon-commission-role-1",
        roleName: "Set Producer",
        payoutRange: [140, 220],
        requiredSkills: ["ops", "photography", "run of show"],
        status: "open",
        applicantUserIds: ["user-ro"]
      }
    ],
    activity: [
      {
        id: "digimon-activity-1",
        authorId: "user-pia",
        type: "update",
        text: "Backed — production unlocked. We can upgrade the location and keep the final deliverables looking premium.",
        createdAt: "2026-03-09T12:02:00"
      },
      {
        id: "digimon-activity-2",
        authorId: "user-sel",
        type: "comment",
        text: "Would love one clean glam station so the styling and lighting feel consistent across the whole shoot.",
        createdAt: "2026-03-10T09:01:00"
      }
    ],
    backedByUserIds: ["user-kai", "user-noa", "user-zo"]
  },
  {
    id: "anime-dj-night",
    title: "Rafael Tribute Project",
    shortDescription:
      "Back a character-led tribute build centered on Rafael, with finishing work, reveal content, and a collectible print drop.",
    description:
      "This commission funds the last production push behind a Rafael tribute build: finishing details, final hero imagery, and the print-ready art package that turns a single costume concept into a full creator release. The ask is focused on visible output, not vague experimentation.",
    type: "creator project",
    fandomTags: ["Rafael", "Tribute Build", "Creator Drop"],
    city: "Los Angeles, CA",
    timingLabel: "Reveal package targeted for the next creator drop",
    hostId: "user-iris",
    goalAmount: 6500,
    raisedAmount: 2880,
    backerCount: 64,
    daysLeft: 15,
    status: "live",
    imageUrl: "/commissions/rafael.png",
    whatThisUnlocks: [
      "Final build materials and cleanup on the hero costume.",
      "A reveal shoot with better lighting and controlled set dressing.",
      "A collectible print pack that can fund the next drop."
    ],
    trustNotes: [
      "The creator already has the core build and concept in motion.",
      "Funding goes to the visible finishing layer that makes the release feel complete.",
      "Backers can map their support directly to a final reveal package."
    ],
    tiers: [
      {
        id: "djnight-tier-1",
        title: "Sketch Supporter",
        amount: 12,
        description: "Help close the finishing budget and receive the reveal recap.",
        perks: ["Reveal recap", "Backer update"]
      },
      {
        id: "djnight-tier-2",
        title: "Print Pack",
        amount: 32,
        description: "Reserve a collectible print pack from the final tribute release.",
        perks: ["Print pack", "Reveal recap"]
      },
      {
        id: "djnight-tier-3",
        title: "Reveal Circle",
        amount: 90,
        description: "Join the small backer circle for the reveal drop and behind-the-scenes breakdown.",
        perks: ["Print pack", "Reveal circle access", "Signed event card"]
      }
    ],
    openRoles: [
      {
        id: "djnight-role-1",
        roleName: "Fabrication Assistant",
        payoutRange: [260, 480],
        requiredSkills: ["fabrication", "costuming", "install"],
        status: "open",
        applicantUserIds: ["user-dae"]
      },
      {
        id: "djnight-role-2",
        roleName: "Reveal Photographer",
        payoutRange: [150, 240],
        requiredSkills: ["photography", "lighting", "editing"],
        status: "open",
        applicantUserIds: []
      }
    ],
    activity: [
      {
        id: "djnight-activity-1",
        authorId: "user-iris",
        type: "update",
        text: "Core build is finished. Funding now decides how polished the final reveal package can be.",
        createdAt: "2026-03-07T11:44:00"
      },
      {
        id: "djnight-activity-2",
        authorId: "user-dae",
        type: "role",
        text: "Can cover the reveal shoot and next-day selects if the commission goes live.",
        createdAt: "2026-03-09T17:06:00"
      }
    ],
    backedByUserIds: ["user-noa"]
  },
  {
    id: "fan-artist-merch-pop-up",
    title: "Fan Artist Merch Pop-Up",
    shortDescription:
      "Help fund a polished pop-up for local fan artists with table build-outs, signage, and check-in flow.",
    description:
      "A crowd-backed creator project designed to turn a casual fan artist meet-up into a merch-driven event with better discoverability, cleaner presentation, and room for repeat editions.",
    type: "creator project",
    fandomTags: ["Fan Artists", "Merch", "Pop-Up"],
    city: "Pasadena, CA",
    timingLabel: "Launches with the next city pop-up weekend",
    hostId: "user-eva",
    goalAmount: 4800,
    raisedAmount: 3560,
    backerCount: 91,
    daysLeft: 7,
    status: "live",
    imageUrl: poster.uma,
    whatThisUnlocks: [
      "Better table signage, wayfinding, and check-in flow.",
      "One premium photo area for artists and buyers to share.",
      "A repeatable pop-up format that can travel to other cities."
    ],
    trustNotes: [
      "The project already has artists and demand lined up.",
      "Funding goes into presentation and operational quality, not discovery alone.",
      "Backers can help the event become a repeatable series."
    ],
    tiers: [
      {
        id: "artist-tier-1",
        title: "Supporter",
        amount: 10,
        description: "Support the room build and get backer updates from the artist roster.",
        perks: ["Artist updates", "Digital thank-you wall"]
      },
      {
        id: "artist-tier-2",
        title: "Early Shop",
        amount: 22,
        description: "Get early shopper access before the room opens fully.",
        perks: ["Early shopper access", "Backer ribbon"]
      },
      {
        id: "artist-tier-3",
        title: "Collector Bundle",
        amount: 55,
        description: "Receive early shopper access plus a curated mini print bundle.",
        perks: ["Early shopper access", "Mini print bundle", "Collector ribbon"]
      }
    ],
    openRoles: [
      {
        id: "artist-role-1",
        roleName: "Vendor Coordinator",
        payoutRange: [180, 300],
        requiredSkills: ["hospitality", "community programming", "ops"],
        status: "open",
        applicantUserIds: ["user-ro"]
      },
      {
        id: "artist-role-2",
        roleName: "Signage Assistant",
        payoutRange: [150, 240],
        requiredSkills: ["signage", "fabrication", "install"],
        status: "open",
        applicantUserIds: ["user-sia"]
      }
    ],
    activity: [
      {
        id: "artist-activity-1",
        authorId: "user-eva",
        type: "update",
        text: "Artist list is almost full. Funding now goes into making the room feel premium instead of crowded.",
        createdAt: "2026-03-08T16:08:00"
      },
      {
        id: "artist-activity-2",
        authorId: "user-ro",
        type: "role",
        text: "Can run vendor hospitality and check-in if this clears.",
        createdAt: "2026-03-09T10:32:00"
      }
    ],
    backedByUserIds: ["user-kai"]
  },
  {
    id: "lantern-harbor-photo-build",
    title: "Lantern Harbor Photo Build",
    shortDescription:
      "Fund a larger photo-first social room with lantern installs, a cover set, and better guest circulation.",
    description:
      "A Genshin-adjacent social that already has the crowd. This commission adds the room build, photo lighting, and guest management that would make it feel worth repeating beyond a single fan meetup.",
    type: "event",
    fandomTags: ["Genshin Impact", "Photo Social", "Live Covers"],
    city: "Los Angeles, CA",
    timingLabel: "Funding closes in time for the spring social run",
    hostId: "user-zo",
    goalAmount: 5400,
    raisedAmount: 1980,
    backerCount: 48,
    daysLeft: 18,
    status: "live",
    imageUrl: poster.genshin,
    linkedEventId: "genshin-lantern-social",
    whatThisUnlocks: [
      "A dedicated lantern photo path instead of one shared corner.",
      "Guest movement planning that keeps the room from bottlenecking.",
      "A live cover set with better audio support."
    ],
    trustNotes: [
      "This is an upgrade to a room with proven demand.",
      "The host already knows how to turn fandom demand into repeatable events.",
      "Crew needs are transparent before the room scales."
    ],
    tiers: [
      {
        id: "lantern-tier-1",
        title: "Signal Lantern",
        amount: 14,
        description: "Help fund the build and receive the live set recap.",
        perks: ["Live set recap", "Backer thread access"]
      },
      {
        id: "lantern-tier-2",
        title: "Photo Lane",
        amount: 30,
        description: "Reserve a backer lane for the lantern photo path.",
        perks: ["Backer photo lane", "Digital cover set"]
      },
      {
        id: "lantern-tier-3",
        title: "Performer Circle",
        amount: 72,
        description: "Join the performer circle after the live cover set.",
        perks: ["Backer photo lane", "Performer circle", "Signed mini poster"]
      }
    ],
    openRoles: [
      {
        id: "lantern-role-1",
        roleName: "Photo Queue Lead",
        payoutRange: [160, 240],
        requiredSkills: ["check-in", "portrait lighting", "hospitality"],
        status: "open",
        applicantUserIds: ["user-mina"]
      }
    ],
    activity: [
      {
        id: "lantern-activity-1",
        authorId: "user-zo",
        type: "update",
        text: "The photo build is scoped. Funding now decides whether it feels adequate or exceptional.",
        createdAt: "2026-03-10T07:18:00"
      }
    ],
    backedByUserIds: []
  },
  {
    id: "marvel-rivals-caster-desk",
    title: "Marvel Rivals Caster Desk",
    shortDescription:
      "Back the caster desk, overlays, and creator shoutcasting package for the next Night Shift.",
    description:
      "A hybrid creator project and event upgrade: fund the broadcast layer that makes Marvel Rivals Night Shift feel bigger than a local meetup and easier to distribute across the fandom.",
    type: "creator project",
    fandomTags: ["Marvel Rivals", "Esports", "Creator Desk"],
    city: "New York, NY",
    timingLabel: "Needs support before tournament lock on Sunday",
    hostId: "user-iris",
    goalAmount: 3900,
    raisedAmount: 2110,
    backerCount: 57,
    daysLeft: 5,
    status: "ending soon",
    imageUrl: poster.marvel,
    linkedEventId: "marvel-rivals-night-shift",
    whatThisUnlocks: [
      "A staffed caster desk with graphics and overlays.",
      "Short-form clips that travel through creator networks after the event.",
      "A better sponsor-facing format for future tournament nights."
    ],
    trustNotes: [
      "The event already exists; this commission funds the distribution layer around it.",
      "Creator casting has direct value for ticket sales and repeatability.",
      "Backers can see the broadcast scope in concrete terms."
    ],
    tiers: [
      {
        id: "rivals-tier-1",
        title: "Desk Supporter",
        amount: 10,
        description: "Help fund the caster desk and receive the clip pack.",
        perks: ["Clip pack", "Backer status"]
      },
      {
        id: "rivals-tier-2",
        title: "Priority Seating",
        amount: 25,
        description: "Get closer seating near the desk and supporter access.",
        perks: ["Priority seating", "Clip pack"]
      },
      {
        id: "rivals-tier-3",
        title: "Creator Stack",
        amount: 55,
        description: "Meet the casting crew before doors open.",
        perks: ["Priority seating", "Creator stack access", "Signed event card"]
      }
    ],
    openRoles: [
      {
        id: "rivals-role-1",
        roleName: "Overlay Operator",
        payoutRange: [220, 380],
        requiredSkills: ["editing", "live content", "ops"],
        status: "open",
        applicantUserIds: ["user-dae"]
      }
    ],
    activity: [
      {
        id: "rivals-activity-1",
        authorId: "user-iris",
        type: "update",
        text: "If we close this, the next Night Shift gets real shoutcasting instead of a casual mic corner.",
        createdAt: "2026-03-08T21:30:00"
      }
    ],
    backedByUserIds: ["user-noa"]
  }
];

export function getCommissionById(
  commissionId: string,
  list: DemoCommission[] = seedCommissions
) {
  return list.find((commission) => commission.id === commissionId);
}

export function getFeaturedCommission(
  list: DemoCommission[] = seedCommissions
) {
  return list.find((commission) => commission.featured) ?? list[0];
}

export function getCommissionOpenRoleCount(commission: DemoCommission) {
  return commission.openRoles.filter((role) => role.status === "open").length;
}

export function getCommissionProgress(commission: DemoCommission) {
  return Math.min(
    100,
    Math.round((commission.raisedAmount / Math.max(commission.goalAmount, 1)) * 100)
  );
}
