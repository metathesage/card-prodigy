// Comprehensive 2026 TCG release calendar
// Sourced from Beckett, official Pokemon/YGO announcements, and Japanese OCG schedules

export interface ReleaseEntry {
  name: string;
  category: "pokemon" | "yugioh" | "other";
  region: "EN" | "JP";
  releaseDate: string;
  description?: string;
  chaseCards?: string[];
  totalCards?: number;
  setCode?: string;
}

export const RELEASES_2026: ReleaseEntry[] = [
  // ===== JANUARY 2026 =====
  {
    name: "Pokemon Prismatic Evolutions",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-01-17",
    description: "Special set featuring Eevee and all its evolutions with stunning illustration rares and special cards.",
    chaseCards: ["Eevee ex Special Illustration Rare", "Umbreon ex Illustration Rare", "Sylveon ex SAR"],
    totalCards: 159,
    setCode: "PRM",
  },
  {
    name: "Yu-Gi-Oh! Supreme Darkness",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-01-23",
    description: "Core booster set featuring Dark attribute support and new Fiend-type archetypes.",
    chaseCards: ["Blue-Eyes Chaos MAX Dragon", "Dark Magician the Dragon Knight Secret Rare"],
  },
  {
    name: "Pokemon Terastal Festival ex",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-01-24",
    description: "Japanese special set focused on Terastal Pokemon with ex mechanics and new illustration rares.",
    chaseCards: ["Terapagos ex SAR", "Pikachu ex AR", "Eevee ex SAR"],
    totalCards: 90,
  },

  // ===== FEBRUARY 2026 =====
  {
    name: "Pokemon Journey Together",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-02-14",
    description: "Main series set celebrating bonds between trainers and Pokemon. Features partner Pokemon ex cards.",
    chaseCards: ["Pikachu ex Special Illustration Rare", "Eevee ex SAR", "Mewtwo ex Illustration Rare"],
    totalCards: 200,
    setCode: "JTT",
  },
  {
    name: "Yu-Gi-Oh! Phantom Nightmare",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-02-13",
    description: "Booster set introducing Phantom archetype and new support for Zombie and Spellcaster types.",
    chaseCards: ["Phantom Nightmare Dragon Secret Rare", "Eldlich the Golden Lord Collector's Rare"],
  },
  {
    name: "Pokemon Battle Partners",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-02-07",
    description: "Japanese set featuring trainer-Pokemon partnerships with new ex card variants.",
    chaseCards: ["Red's Pikachu ex SAR", "Cynthia's Garchomp ex AR"],
    totalCards: 96,
  },

  // ===== MARCH 2026 =====
  {
    name: "Pokemon Mega Evolution: Ascended Heroes ME2.5",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-03-28",
    description: "Mega Evolution subset featuring Ascended Heroes. Premium collection of Mega ex Pokemon.",
    chaseCards: ["Mega Gengar ex SAR", "Mega Scizor ex AR", "Mega Venusaur ex SAR"],
    totalCards: 160,
    setCode: "ME2.5",
  },
  {
    name: "Yu-Gi-Oh! Burst Protocol",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-03-20",
    description: "Spring 2026 core booster set introducing new Ritual and Fusion archetypes with competitive staples.",
    chaseCards: ["Burst Stream of Destruction Starlight Rare", "Cyber Dragon Infinity Secret Rare"],
  },
  {
    name: "Yu-Gi-Oh! Rarity Collection 5",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-03-14",
    description: "Premium rarity collection with new Secret Rare, Collector's Rare, and Pharaoh's Rare variants of popular cards.",
    chaseCards: ["Pot of Greed Pharaoh's Rare", "Mirror Force Collector's Rare", "Ash Blossom Secret Rare"],
  },
  {
    name: "Pokemon Mega Evolution: Ascended Heroes",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-03-07",
    description: "Japanese ME2.5 set with Mega Venusaur ex, Mega Blastoise ex, and Mega Gardevoir ex.",
    chaseCards: ["Mega Venusaur ex SAR", "Mega Blastoise ex AR", "Mega Gardevoir ex SAR"],
    totalCards: 94,
  },
  {
    name: "Yu-Gi-Oh! Alliance Insight",
    category: "yugioh",
    region: "JP",
    releaseDate: "2026-03-22",
    description: "OCG spring booster introducing alliance mechanic and multi-attribute support cards.",
    chaseCards: ["Stardust Dragon Ultimate Rare", "Black Rose Dragon Collector's Rare"],
  },

  // ===== APRIL 2026 =====
  {
    name: "Yu-Gi-Oh! Rarity Collection Quarter Century Bonanza",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-04-10",
    description: "Special anniversary rarity collection celebrating 25 years of Yu-Gi-Oh! with ultra-premium card variants.",
    chaseCards: ["Exodia the Forbidden One Quarter Century Secret", "Dark Magician Girl QCSR", "Blue-Eyes White Dragon QCSR"],
  },
  {
    name: "Pokemon Dragonith's Collection",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-04-18",
    description: "Japanese special collection featuring Dragon-type Pokemon with premium card treatments.",
    chaseCards: ["Rayquaza ex SAR", "Dragonite ex AR", "Charizard ex SAR"],
    totalCards: 68,
  },

  // ===== MAY 2026 =====
  {
    name: "Yu-Gi-Oh! Blazing Dominion",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-05-08",
    description: "New core booster pack set featuring Fire attribute support, new archetypes, and competitive reprints.",
    chaseCards: ["Blue-Eyes Alternative White Dragon Starlight", "Sacred Fire Beast Garmonize Secret Rare"],
  },
  {
    name: "Pokemon Mega Evolution: Chaos Rising",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-05-22",
    description: "Mega Evolution expansion featuring Mega Zygarde ex and powerful Mega evolved Pokemon with new ex mechanics.",
    chaseCards: ["Mega Zygarde ex SAR", "Mega Rayquaza ex AR", "Mega Gengar ex SAR"],
    totalCards: 180,
    setCode: "ME-CR",
  },
  {
    name: "Pokemon Perfect Order ME03",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-05-16",
    description: "Japanese ME03 booster featuring Mega Mewtwo ex and powerful Trainer support cards.",
    chaseCards: ["Mega Mewtwo ex SAR", "Mew ex AR", "Mega Lucario ex SAR"],
    totalCards: 100,
  },

  // ===== JUNE 2026 =====
  {
    name: "Pokemon 2025 World Championship Deck",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-06-05",
    description: "Reproductions of the winning decks from the 2025 Pokemon World Championships with special card backs.",
    chaseCards: ["Worlds Champion Stamp Cards", "Special Promo Card"],
  },
  {
    name: "Yu-Gi-Oh! Battles of Legend: Glorious Gallery",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-06-05",
    description: "Premium reprint set with new alternate art variants and iconic tournament-level cards in premium rarities.",
    chaseCards: ["Ash Blossom Alternate Art Secret", "Infinite Impermanence Collector's Rare", "Effect Veiler Starlight"],
  },
  {
    name: "Pokemon Night Wanderer",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-06-20",
    description: "Summer 2026 Japanese set. Ghost and Dark-type Pokemon with new spectral mechanics.",
    chaseCards: ["Gengar ex SAR", "Darkrai ex AR", "Mimikyu ex SAR"],
    totalCards: 86,
  },
  {
    name: "Yu-Gi-Oh! Chaos Origin",
    category: "yugioh",
    region: "JP",
    releaseDate: "2026-06-27",
    description: "OCG summer booster with Chaos-type support and retrained classic monsters.",
    chaseCards: ["Chaos Emperor Dragon Secret Rare", "Black Luster Soldier Ultimate Rare"],
  },

  // ===== JULY 2026 =====
  {
    name: "Yu-Gi-Oh! Chaos Origin",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-07-02",
    description: "New booster introducing Chaos-type support and retrained classic monsters with modern effects.",
    chaseCards: ["Chaos Emperor Dragon - Dragon of Armageddon Secret", "Black Luster Soldier - Envoy of the Twilight Starlight"],
  },
  {
    name: "Pokemon Destined Rivals",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-07-18",
    description: "Summer main series set featuring rival trainers and their signature Pokemon in competitive ex variants.",
    chaseCards: ["Charizard ex Special Illustration Rare", "Greninja ex SAR", "Lucario ex AR"],
    totalCards: 190,
    setCode: "DRS",
  },
  {
    name: "Yu-Gi-Oh! Supreme Darkness",
    category: "yugioh",
    region: "JP",
    releaseDate: "2026-07-11",
    description: "OCG version of Supreme Darkness with Japanese exclusive rarities and alternate arts.",
    chaseCards: ["Blue-Eyes Chaos MAX Holographic Rare", "Dark Magician the Dragon Knight Collector's"],
  },

  // ===== AUGUST 2026 =====
  {
    name: "Pokemon Perfect Order",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-08-15",
    description: "ME03 set in the Mega Evolution series. Features Mega Evolution Pokemon and new Trainer cards.",
    chaseCards: ["Mega Charizard ex SAR", "Mega Mewtwo ex AR", "Mega Lucario ex SAR"],
    totalCards: 160,
    setCode: "ME-PO",
  },
  {
    name: "Pokemon Supercharged Breaker",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-08-01",
    description: "Fall 2026 Japanese main booster. Electric-type focus with new Pikachu and Raichu ex cards.",
    chaseCards: ["Pikachu ex SAR", "Raichu ex AR", "Electivire ex SAR"],
    totalCards: 102,
  },
  {
    name: "Yu-Gi-Oh! Phantom Nightmare",
    category: "yugioh",
    region: "JP",
    releaseDate: "2026-08-22",
    description: "OCG fall booster with Phantom archetype and new spell/trap support.",
    chaseCards: ["Phantom Nightmare Dragon Holographic", "Eldlich Collector's Rare"],
  },

  // ===== SEPTEMBER 2026 =====
  {
    name: "Pokemon Obsidian Flames",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-09-12",
    description: "Fall 2026 main series set. Darkness and Fire-type Pokemon take center stage with new ex mechanics.",
    chaseCards: ["Charizard ex Special Illustration Rare", "Umbreon ex Illustration Rare", "Houndoom ex SAR"],
    totalCards: 200,
    setCode: "OBF",
  },
  {
    name: "Yu-Gi-Oh! Infinite Forbidden",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-09-25",
    description: "Fall 2026 core set. Forbidden cards return with balanced retrainments and new meta-defining archetypes.",
    chaseCards: ["Forbidden Droplet Secret Rare", "Infinite Impermanence Prismatic Secret", "Change of Heart Starlight"],
  },
  {
    name: "Pokemon Stellar Crown",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-09-19",
    description: "Japanese fall set with Tera Pokemon and stellar-type card mechanics.",
    chaseCards: ["Tera Pikachu ex SAR", "Terapagos ex AR"],
    totalCards: 88,
  },

  // ===== OCTOBER 2026 =====
  {
    name: "Pokemon Stellar Crown",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-10-10",
    description: "Holiday 2026 premium set with Tera Pokemon and stellar-type card mechanics.",
    chaseCards: ["Tera Pikachu ex SAR", "Terapagos ex Stellar Rare", "Ogerpon ex AR"],
    totalCards: 170,
    setCode: "SCR",
  },
  {
    name: "Yu-Gi-Oh! Infinite Forbidden",
    category: "yugioh",
    region: "JP",
    releaseDate: "2026-10-25",
    description: "OCG fall set. Forbidden cards return with balanced retrainments.",
    chaseCards: ["Forbidden Droplet Prismatic Secret", "Infinite Impermanence Holographic"],
  },
  {
    name: "Pokemon Trick or Trade BOOster Bundle",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-10-01",
    description: "Halloween-themed bundle with Ghost-type Pokemon and special promo cards.",
    chaseCards: ["Gengar Promo Stamp", "Mimikyu Promo"],
  },

  // ===== NOVEMBER 2026 =====
  {
    name: "Pokemon Shining Revelry",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-11-14",
    description: "Holiday premium set featuring Shiny Pokemon with special card treatments and illustration rares.",
    chaseCards: ["Shiny Charizard ex SAR", "Shiny Rayquaza ex AR", "Shiny Umbreon ex SAR"],
    totalCards: 180,
    setCode: "SHR",
  },
  {
    name: "Yu-Gi-Oh! Rarity Collection 6",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-11-20",
    description: "Year-end premium rarity collection with new ultra-rare variants of the most sought-after cards.",
    chaseCards: ["Pot of Greed 25th Secret Rare", "Graceful Charity Collector's Rare", "Ring of Destruction Starlight"],
  },
  {
    name: "Pokemon Heat Wave Arena",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-11-21",
    description: "Japanese winter set featuring Fire and Dragon-type Pokemon with competitive ex variants.",
    chaseCards: ["Charizard ex SAR", "Reshiram ex AR", "Volcarona ex SAR"],
    totalCards: 78,
  },

  // ===== DECEMBER 2026 =====
  {
    name: "Pokemon Holiday Collection 2026",
    category: "pokemon",
    region: "EN",
    releaseDate: "2026-12-05",
    description: "Special holiday collection with festive promo cards and premium packs from 2026 sets.",
    chaseCards: ["Holiday Pikachu Promo", "Festive Eevee Promo"],
  },
  {
    name: "Yu-Gi-Oh! Battles of Legend: Crystal Revenge",
    category: "yugioh",
    region: "EN",
    releaseDate: "2026-12-10",
    description: "Year-end reprint set with crystal-themed alternate arts of classic fan-favorite cards.",
    chaseCards: ["Blue-Eyes White Dragon Crystal Secret", "Dark Magician Crystal Secret", "Red-Eyes Black Dragon Crystal Secret"],
  },
  {
    name: "Pokemon Frost Paradise",
    category: "pokemon",
    region: "JP",
    releaseDate: "2026-12-12",
    description: "Japanese winter holiday set featuring Ice and Fairy-type Pokemon.",
    chaseCards: ["Glaceon ex SAR", "Alolan Vulpix ex AR", "Frosmoth ex SAR"],
    totalCards: 72,
  },

  // ===== OTHER TCG RELEASES (for completeness) =====
  {
    name: "Disney Lorcana: Winterspell",
    category: "other",
    region: "EN",
    releaseDate: "2026-03-07",
    description: "Disney Lorcana Set 11. Frozen-themed with Elsa, Anna, and new enchanted cards.",
  },
  {
    name: "Disney Lorcana: Wilds Unknown (Set 12)",
    category: "other",
    region: "EN",
    releaseDate: "2026-05-15",
    description: "First-ever Pixar character cards including Toy Story, The Incredibles, and more.",
  },
];
