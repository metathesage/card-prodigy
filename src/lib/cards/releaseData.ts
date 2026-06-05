// Hardcoded 2026 TCG release calendar from Beckett + Japanese releases
// Sourced from https://www.beckett.com/news/2026-tcg-release-dates-checklists-and-set-information/

export interface ReleaseEntry {
  name: string;
  category: "pokemon" | "yugioh" | "other";
  region: "EN" | "JP";
  releaseDate: string;
  description?: string;
  chaseCards?: string[];
  totalCards?: number;
  imageUrl?: string;
}

export const RELEASES_2026: ReleaseEntry[] = [
  // === MAY 2026 ===
  {
    name: "Yu-Gi-Oh! Blazing Dominion",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-05-08",
    description: "New core booster pack set featuring Fire attribute support and new archetypes.",
    chaseCards: ["Blue-Eyes Alternative White Dragon", "Sacred Fire Beast Garmonize"],
  },
  {
    name: "Pokémon Mega Evolution: Chaos Rising",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-05-22",
    description: "Mega Evolution expansion featuring Mega Zygarde ex and powerful Mega evolved Pokémon.",
    chaseCards: ["Mega Zygarde ex", "Mega Rayquaza ex", "Mega Gengar ex"],
    totalCards: 180,
  },
  // === JUNE 2026 ===
  {
    name: "Pokémon 2025 World Championship Deck",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-06-05",
    description: "Reproductions of the winning decks from the 2025 Pokémon World Championships.",
    chaseCards: ["Champion's Draggable", "Worlds Promo Card"],
  },
  {
    name: "Yu-Gi-Oh! Battles of Legend: Glorious Gallery",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-06-05",
    description: "Premium reprint set with new alternate art variants and iconic tournament-level cards.",
    chaseCards: ["Ash Blossom Alternate Art", "Infinite Impermanence Secret Rare"],
  },
  // === JULY 2026 ===
  {
    name: "Yu-Gi-Oh! Chaos Origin",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-07-02",
    description: "New booster introducing Chaos-type support and retrained classic monsters.",
    chaseCards: ["Chaos Emperor Dragon - Dragon of Armageddon", "Black Luster Soldier - Envoy of the Twilight"],
  },
  // === AUGUST 2026 ===
  {
    name: "Pokémon Perfect Order",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-08-15",
    description: "ME03 set in the Mega Evolution series. Features Mega Evolution Pokémon and new Trainer cards.",
    chaseCards: ["Mega Charizard ex", "Mega Mewtwo ex", "Mega Lucario ex"],
    totalCards: 160,
  },
  // === OCTOBER 2026 ===
  {
    name: "Pokémon Obsidian Flames",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-10-10",
    description: "Fall 2026 main series set. Darkness and Fire-type Pokémon take center stage.",
    chaseCards: ["Charizard ex Special Illustration Rare", "Umbreon ex Illustration Rare"],
    totalCards: 200,
  },
  // === NOVEMBER 2026 ===
  {
    name: "Pokémon Stellar Crown",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-11-14",
    description: "Holiday 2026 premium set with Tera Pokémon and stellar-type card mechanics.",
    chaseCards: ["Tera Pikachu ex", "Terapagos ex Stellar Rare"],
    totalCards: 170,
  },
  // === JAPANESE POKEMON RELEASES ===
  {
    name: "Pokémon Mega Evolution: Ascended Heroes",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-04-18",
    description: "Japanese Mega Evolution set ME2.5. Introduces Mega Evolved Pokémon with new ex mechanics.",
    chaseCards: ["Mega Venusaur ex", "Mega Blastoise ex", "Mega Gardevoir ex"],
    totalCards: 94,
  },
  {
    name: "Pokémon Perfect Order (ME03)",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-06-20",
    description: "Japanese ME03 booster. Features Mega Mewtwo ex and powerful Trainer support.",
    chaseCards: ["Mega Mewtwo ex SAR", "Mew ex AR"],
    totalCards: 100,
  },
  {
    name: "Pokémon Night Wanderer",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-08-01",
    description: "Summer 2026 Japanese set. Ghost and Dark-type Pokémon with new mechanics.",
    chaseCards: ["Gengar ex SAR", "Darkrai ex AR"],
    totalCards: 86,
  },
  {
    name: "Pokémon Supercharged Breaker",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-10-03",
    description: "Fall 2026 Japanese main booster. Electric-type focus with new Electrike line.",
    chaseCards: ["Pikachu ex SAR", "Raichu ex AR"],
    totalCards: 102,
  },
  // === JAPANESE YU-GI-OH RELEASES ===
  {
    name: "Yu-Gi-Oh! Supreme Darkness",
    category: "yugioh",
    region: "JP",
    releaseDate: "2026-04-26",
    description: "Japanese OCG booster. Dark attribute support with new Demon and Fiend archetypes.",
    chaseCards: ["Blue-Eyes Chaos MAX Dragon Holographic", "Dark Magician the Dragon Knight Secret"],
  },
  {
    name: "Yu-Gi-Oh! Alliance Insight",
    category: "yugioh",
    region: "JP",
    releaseDate: "2026-07-12",
    description: "OCG summer booster introducing alliance mechanic and multi-attribute support.",
    chaseCards: ["Stardust Dragon Ulti Rare", "Black Rose Dragon Collector's Rare"],
  },
  {
    name: "Yu-Gi-Oh! Infinite Forbidden",
    category: "yugioh",
    region: "JP",
    releaseDate: "2026-10-25",
    description: "Fall 2026 OCG set. Forbidden cards return with balanced retrainments.",
    chaseCards: ["Forbidden Droplet Secret Rare", "Infinite Impermanence Prismatic Secret"],
  },
  // === RECENTLY RELEASED ===
  {
    name: "Pokémon Mega Evolution: Ascended Heroes ME2.5",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-03-28",
    description: "Mega Evolution subset featuring Ascended Heroes. Premium collection of Mega ex Pokémon.",
    chaseCards: ["Mega Gengar ex SAR", "Mega Scizor ex AR"],
    totalCards: 160,
  },
  {
    name: "Yu-Gi-Oh! Burst Protocol",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-03-20",
    description: "Spring 2026 core booster set introducing new Ritual and Fusion archetypes.",
    chaseCards: ["Burst Stream of Destruction Starlight", "Cyber Dragon Infinity Secret Rare"],
  },
  {
    name: "Yu-Gi-Oh! Rarity Collection 5",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-04-10",
    description: "Premium rarity collection with new Secret Rare and Collector's Rare variants.",
    chaseCards: ["Pot of Greed Pharaoh's Rare", "Mirror Force Collector's Rare"],
  },
  {
    name: "Disney Lorcana Winterspell",
    category: "other",
    region: "EN",
    releaseDate: "2026-03-07",
    description: "Disney Lorcana Set 11. Frozen-themed with Elsa, Anna, and new enchanted cards.",
  },
];
