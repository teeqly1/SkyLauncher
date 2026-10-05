import { GameItem, HydraSource } from '../types';
import { coverService } from './coverService';
import { cloudSync } from './supabaseService';

export const OFFICIAL_SOURCE_URL = 'https://raw.githubusercontent.com/ZeDarkAdam/igruha_hydra_links/refs/heads/main/igruha-hydra-links.json';
export const OFFICIAL_SOURCE_NAME = 'Torrents-Igruha (Official Hydra Links)';

const KNOWN_GAME_COVERS: Record<string, { cover: string; banner?: string; desc?: string; genres?: string[] }> = {
  'elden ring': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/1245620/capsule_616x353.jpg',
    desc: 'The Golden Order has been broken. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring and become an Elden Lord in the Lands Between.',
    genres: ['Action', 'RPG', 'Souls-like', 'Open World']
  },
  'red dead redemption 2': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/1174180/capsule_616x353.jpg',
    desc: 'Winner of over 175 Game of the Year Awards and recipient of over 250 perfect scores, RDR2 is the epic tale of outlaw Arthur Morgan and the Van der Linde gang.',
    genres: ['Action', 'Adventure', 'Open World', 'Story Rich']
  },
  'cyberpunk 2077': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/1091500/capsule_616x353.jpg',
    desc: 'An open-world, action-adventure RPG set in the dark future of Night City — a dangerous megalopolis obsessed with power, glamor, and relentless body modification.',
    genres: ['RPG', 'Open World', 'Cyberpunk', 'Sci-Fi']
  },
  'baldur\'s gate 3': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/1086940/capsule_616x353.jpg',
    desc: 'Gather your party and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.',
    genres: ['RPG', 'Turn-Based Combat', 'Story Rich', 'D&D']
  },
  'indiana jones and the great circle': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/2677660/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/2677660/capsule_616x353.jpg',
    desc: 'Uncover one of history\'s greatest mysteries in a first-person, single-player adventure. The year is 1937, sinister forces are scouring the globe for the secret to an ancient power connected to the Great Circle, and only one person can stop them - Indiana Jones™.',
    genres: ['Adventure', 'Action', 'Cinematic', 'First-Person']
  },
  'black myth: wukong': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/2358720/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/2358720/capsule_616x353.jpg',
    desc: 'Black Myth: Wukong is an action RPG rooted in Chinese mythology. You shall set out as the Destined One to venture into the challenges and marvels ahead.',
    genres: ['Action', 'RPG', 'Mythology', 'Souls-like']
  },
  'grand theft auto v': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/271590/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/271590/capsule_616x353.jpg',
    desc: 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening elements of the criminal underworld.',
    genres: ['Open World', 'Action', 'Multiplayer']
  },
  'god of war ragnarök': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/2322010/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/2322010/capsule_616x353.jpg',
    desc: 'Kratos and Atreus embark on a mythic journey for answers before Ragnarök arrives.',
    genres: ['Action', 'Story Rich', 'Mythology', 'Adventure']
  },
  'silent hill 2': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/2124490/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/2124490/capsule_616x353.jpg',
    desc: 'Having received a letter from his deceased wife, James heads to where they shared so many memories: Silent Hill.',
    genres: ['Psychological Horror', 'Survival Horror', 'Atmospheric']
  },
  'ghost of tsushima': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/2215430/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/2215430/capsule_616x353.jpg',
    desc: 'A storm is coming. Forge a new path and wage an unconventional war for the freedom of Tsushima.',
    genres: ['Open World', 'Action', 'Stealth', 'Samurai']
  },
  'a hat in time': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/253230/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/253230/capsule_616x353.jpg',
    desc: 'A Hat in Time is a cute-as-heck 3D platformer featuring a little girl who stitches hats for wicked powers.',
    genres: ['3D Platformer', 'Cute', 'Adventure', 'Collectathon']
  },
  'animal well': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/813230/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/813230/capsule_616x353.jpg',
    desc: 'Hatch from your egg and explore a dense, interconnected labyrinth, and solve intricate puzzles.',
    genres: ['Metroidvania', 'Pixel Graphics', 'Puzzle', 'Atmospheric']
  },
  'astroneer': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/361420/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/361420/capsule_616x353.jpg',
    desc: 'Explore and reshape distant worlds! ASTRONEER is set during the 25th century Intergalactic Age of Discovery.',
    genres: ['Open World Survival', 'Space', 'Crafting', 'Multiplayer']
  },
  'anode heart': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1592780/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/1592780/capsule_616x353.jpg',
    desc: 'A monster taming RPG with tactical turn-based combat set in a sprawling cyberpunk digital world.',
    genres: ['RPG', 'Monster Battler', 'Pixel Art', 'Cyberpunk']
  },
  'another crab\'s treasure': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1887840/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/1887840/capsule_616x353.jpg',
    desc: 'Another Crab\'s Treasure is a soulslike adventure set in a crumbling underwater world.',
    genres: ['Souls-like', 'Action', 'Underwater', 'Adventure']
  },
  'assemble with care': {
    cover: 'https://cdn.akamai.steamstatic.com/steam/apps/1202900/header.jpg',
    banner: 'https://cdn.akamai.steamstatic.com/steam/apps/1202900/capsule_616x353.jpg',
    desc: 'From the studio that brought you Monument Valley, a story about taking things apart and putting ourselves back together.',
    genres: ['Puzzle', 'Cozy', 'Short', 'Story Rich']
  }
};

export function cleanGameTitle(rawTitle: string): { cleanTitle: string; repacker: string } {
  let text = rawTitle.trim();
  let repacker = 'Repack';

  // Extract repacker info
  const repackMatch = text.match(/\|?\s*(?:repack\s+by\s+|by\s+|portable|gog\s+rip|p2p|dodi|fitgirl|igruha)(.*)$/i);
  if (repackMatch) {
    repacker = repackMatch[0].replace(/^\|\s*/, '').trim();
    text = text.substring(0, repackMatch.index).trim();
  }

  // Remove build numbers / versions in parentheses if at the end
  text = text.replace(/\s*\((?:build|v|ver|patch)[\s0-9._-]+\).*$/i, '').trim();
  // Remove trailing pipes or dashes
  text = text.replace(/[\s\-|]+$/, '').trim();

  return {
    cleanTitle: text || rawTitle,
    repacker
  };
}

export function getCoverForGame(title: string, cleanTitle: string): { coverUrl: string; bannerUrl: string; desc?: string; genres?: string[] } {
  const normalized = cleanTitle.toLowerCase();
  
  for (const [key, data] of Object.entries(KNOWN_GAME_COVERS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return {
        coverUrl: data.cover,
        bannerUrl: data.banner || data.cover,
        desc: data.desc,
        genres: data.genres
      };
    }
  }

  const steamArtwork = coverService.getCoverForGame(cleanTitle);

  return {
    coverUrl: steamArtwork.coverUrl,
    bannerUrl: steamArtwork.bannerUrl,
    desc: `${cleanTitle} - полная версия игры с последними обновлениями и дополнениями.`,
    genres: ['Action', 'Adventure', 'Simulation']
  };
}

function getDeterministicColor(str: string): string {
  const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#06b6d4', '#6366f1', '#e11d48'];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

class CatalogService {
  private sourcesKey = 'sky_launcher_sources';
  private cachedGamesKey = 'sky_launcher_games_cache';
  private games: GameItem[] = [];
  private sources: HydraSource[] = [];

  constructor() {
    this.loadSources();
  }

  public getSources(): HydraSource[] {
    return this.sources;
  }

  public hasSources(): boolean {
    return this.sources.length > 0;
  }

  public loadSources(): HydraSource[] {
    try {
      const stored = localStorage.getItem(this.sourcesKey);
      if (stored) {
        this.sources = JSON.parse(stored);
      } else {
        this.sources = [];
      }
    } catch {
      this.sources = [];
    }
    return this.sources;
  }

  private saveSources() {
    localStorage.setItem(this.sourcesKey, JSON.stringify(this.sources));
    cloudSync.schedulePush();
  }

  public async addSource(url: string, name?: string): Promise<{ success: boolean; count: number; error?: string }> {
    const trimmed = url.trim();
    if (!trimmed) {
      return { success: false, count: 0, error: 'Ссылка не может быть пустой' };
    }

    if (this.sources.some(s => s.url === trimmed)) {
      return { success: false, count: 0, error: 'Данная ссылка уже добавлена' };
    }

    const newSource: HydraSource = {
      id: 'src_' + Date.now(),
      name: name || (trimmed === OFFICIAL_SOURCE_URL ? OFFICIAL_SOURCE_NAME : 'Пользовательский источник'),
      url: trimmed,
      downloadsCount: 0,
      addedAt: new Date().toISOString(),
      status: 'loading',
      isDefault: trimmed === OFFICIAL_SOURCE_URL
    };

    this.sources.push(newSource);
    this.saveSources();

    try {
      const res = await fetch(trimmed);
      if (!res.ok) {
        throw new Error(`Ошибка сети: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      
      let itemsList: any[] = [];
      if (data && Array.isArray(data.downloads)) {
        itemsList = data.downloads;
        if (data.name && !name) {
          newSource.name = data.name;
        }
      } else if (Array.isArray(data)) {
        itemsList = data;
      }

      newSource.downloadsCount = itemsList.length;
      newSource.status = 'success';
      this.saveSources();

      await this.reloadAllGames();
      return { success: true, count: itemsList.length };
    } catch (err: any) {
      newSource.status = 'error';
      newSource.errorMessage = err.message || 'Не удалось загрузить каталог';
      this.saveSources();
      return { success: false, count: 0, error: err.message };
    }
  }

  public async addOfficialSources(): Promise<{ success: boolean; count: number; error?: string }> {
    return this.addSource(OFFICIAL_SOURCE_URL, OFFICIAL_SOURCE_NAME);
  }

  public async removeSource(id: string): Promise<void> {
    this.sources = this.sources.filter(s => s.id !== id);
    this.saveSources();
    await this.reloadAllGames();
  }

  public async reloadAllGames(): Promise<GameItem[]> {
    const allGames: GameItem[] = [];

    for (const source of this.sources) {
      try {
        const res = await fetch(source.url);
        if (!res.ok) continue;
        const data = await res.json();
        const downloads: any[] = data.downloads || (Array.isArray(data) ? data : []);

        downloads.forEach((item, index) => {
          const rawTitle = item.title || item.name || 'Unknown Game';
          const { cleanTitle, repacker } = cleanGameTitle(rawTitle);
          const meta = getCoverForGame(rawTitle, cleanTitle);

          allGames.push({
            id: `${source.id}_${index}`,
            title: rawTitle,
            cleanTitle,
            uris: item.uris || (item.uri ? [item.uri] : []),
            uploadDate: item.uploadDate,
            fileSize: item.fileSize,
            coverUrl: meta.coverUrl,
            bannerUrl: meta.bannerUrl,
            repacker,
            description: meta.desc,
            genres: meta.genres,
            rating: 4.5 + ((rawTitle.length % 5) / 10)
          });
        });
      } catch (e) {
        console.error('Failed to load source', source.url, e);
      }
    }

    this.games = allGames;
    return allGames;
  }

  public async getGames(): Promise<GameItem[]> {
    if (this.games.length === 0 && this.sources.length > 0) {
      await this.reloadAllGames();
    }
    return this.games;
  }

  public getHotGames(): GameItem[] {
    // Return curated popular games matching user screenshot
    const hotTitles = [
      'elden ring',
      'red dead redemption 2',
      'cyberpunk 2077',
      'baldur\'s gate 3',
      'black myth: wukong',
      'silent hill 2',
      'god of war ragnarök',
      'ghost of tsushima'
    ];

    const results: GameItem[] = [];
    for (const hot of hotTitles) {
      const match = this.games.find(g => g.cleanTitle.toLowerCase().includes(hot));
      if (match) {
        results.push(match);
      }
    }

    if (results.length === 0 && this.games.length > 0) {
      return this.games.slice(0, 8);
    }
    return results;
  }

  public getFeaturedGame(): GameItem | null {
    if (this.games.length === 0) return null;
    const indiana = this.games.find(g => g.cleanTitle.toLowerCase().includes('indiana jones'));
    if (indiana) return indiana;
    const elden = this.games.find(g => g.cleanTitle.toLowerCase().includes('elden ring'));
    if (elden) return elden;
    return this.games[0] || null;
  }
}

export const catalogService = new CatalogService();
