// High Quality Steam Artwork Provider for SkyLauncher
const CACHE_KEY = 'sky_steam_artwork_cache';

const PRELOADED_APP_IDS: Record<string, number> = {
  'my summer car': 516750,
  'sins of a solar empire 2': 1575940,
  'train sim world 5': 2677660,
  'beamng.drive': 284160,
  'beamng': 284160,
  'euro truck simulator 2': 227300,
  'the witcher 3': 292030,
  'witcher 3': 292030,
  'forza horizon 5': 1551360,
  'forza horizon 4': 1293830,
  'cities: skylines ii': 949230,
  'cities skylines 2': 949230,
  'stalker 2': 1643320,
  's.t.a.l.k.e.r. 2': 1643320,
  'warhammer 40,000: space marine 2': 2183900,
  'space marine 2': 2183900,
  'manor lords': 1363080,
  'satisfactory': 526870,
  'palworld': 1623730,
  'helldivers 2': 553850,
  'rust': 252490,
  'valheim': 892970,
  'subnautica': 264710,
  'subnautica: below zero': 848450,
  'hollow knight': 367520,
  'lethal company': 1966720,
  'phasmophobia': 739630,
  'enshrouded': 1203620,
  'hades ii': 1145350,
  'hades': 1145360,
  'god of war': 1593500,
  'god of war ragnarök': 2322010,
  'marvel’s spider-man': 1817070,
  'spider-man': 1817070,
  'cyberpunk 2077': 1091500,
  'elden ring': 1245620,
  'baldur\'s gate 3': 1086940,
  'red dead redemption 2': 1174180,
  'grand theft auto v': 271590,
  'gta v': 271590,
  'gta 5': 271590,
  'black myth: wukong': 2358720,
  'wukong': 2358720,
  'silent hill 2': 2124490,
  'ghost of tsushima': 2215430,
  'a hat in time': 253230,
  'animal well': 813230,
  'astroneer': 361420,
  'anode heart': 1592780,
  'another crab\'s treasure': 1887840,
  'assemble with care': 1202900,
  'indiana jones and the great circle': 2677660,
  'half-life: alyx': 546560,
  'portal 2': 620,
  'teardown': 1167630,
  'project zomboid': 108600,
  'terraria': 105600,
  'rimworld': 294100,
  'dave the diver': 1868140,
  'sea of stars': 1244090,
  'lies of p': 1627720,
  'armored core vi': 1888160,
  'starfield': 1716740,
  'resident evil 4': 2050650,
  'hogwarts legacy': 990080,
  'the last of us': 1888930,
  'sons of the forest': 1326470,
  'fallout 4': 377160,
  'the elder scrolls v: skyrim': 489830,
  'skyrim': 489830,
  'mount & blade ii: bannerlord': 261550,
  'ready or not': 1144200,
  'dying light 2': 534380,
  'dead space': 1693980,
  'no man\'s sky': 275850,
  'ark: survival ascended': 2399830,
  'far cry 6': 2369390,
  'assassin\'s creed valhalla': 2208920,
  'detroit: become human': 1222140
};

class CoverService {
  private cache: Record<string, { appid?: number; cover: string; banner: string; icon: string }> = {};

  constructor() {
    this.loadCache();
  }

  private loadCache() {
    try {
      const data = localStorage.getItem(CACHE_KEY);
      if (data) {
        this.cache = JSON.parse(data);
      }
    } catch {
      this.cache = {};
    }
  }

  private saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(this.cache));
    } catch {}
  }

  public getCoverForGame(cleanTitle: string): { coverUrl: string; bannerUrl: string; iconUrl: string } {
    const key = cleanTitle.toLowerCase().trim();

    // Check memory / localStorage cache
    if (this.cache[key]) {
      return {
        coverUrl: this.cache[key].cover,
        bannerUrl: this.cache[key].banner,
        iconUrl: this.cache[key].icon
      };
    }

    // Check preloaded app IDs
    for (const [titleKey, appid] of Object.entries(PRELOADED_APP_IDS)) {
      if (key.includes(titleKey) || titleKey.includes(key)) {
        const cover = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;
        const banner = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_616x353.jpg`;
        const icon = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_184x69.jpg`;

        this.cache[key] = { appid, cover, banner, icon };
        this.saveCache();
        return { coverUrl: cover, bannerUrl: banner, iconUrl: icon };
      }
    }

    // Trigger async Steam API query for any unknown title
    this.fetchSteamAppAsync(cleanTitle);

    // Fallback dynamic high quality artwork
    const fallback = this.generateFallbackCover(cleanTitle);
    return {
      coverUrl: fallback,
      bannerUrl: fallback,
      iconUrl: fallback
    };
  }

  private async fetchSteamAppAsync(cleanTitle: string) {
    const key = cleanTitle.toLowerCase().trim();
    if (this.cache[key]) return;

    try {
      // Steam community search API
      const searchUrl = `https://steamcommunity.com/actions/SearchApps/${encodeURIComponent(cleanTitle.slice(0, 30))}`;
      const res = await fetch(searchUrl);
      if (!res.ok) return;

      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) {
        const item = items[0];
        const appid = item.appid;
        if (appid) {
          const cover = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/header.jpg`;
          const banner = `https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/${appid}/capsule_616x353.jpg`;
          const icon = item.icon || item.logo || cover;

          this.cache[key] = { appid, cover, banner, icon };
          this.saveCache();
        }
      }
    } catch {
      // silent fallback
    }
  }

  public generateFallbackCover(title: string): string {
    const colors = [
      ['#1e3a8a', '#3b82f6'],
      ['#581c87', '#a855f7'],
      ['#831843', '#ec4899'],
      ['#7c2d12', '#f97316'],
      ['#064e3b', '#10b981'],
      ['#134e4a', '#14b8a6']
    ];

    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    const pair = colors[Math.abs(hash) % colors.length];
    const safeTitle = title.length > 25 ? title.slice(0, 23) + '...' : title;

    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="460" height="215" viewBox="0 0 460 215"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${pair[0]}"/><stop offset="100%" stop-color="${pair[1]}"/></linearGradient></defs><rect width="460" height="215" rx="8" fill="url(%23g)"/><text x="230" y="100" fill="%23ffffff" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-weight="800" font-size="24" text-anchor="middle" dominant-baseline="middle">${encodeURIComponent(safeTitle)}</text><text x="230" y="135" fill="%23ffffff" opacity="0.6" font-family="-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif" font-size="13" font-weight="600" text-anchor="middle">SkyLauncher Game</text></svg>`;
  }
}

export const coverService = new CoverService();
