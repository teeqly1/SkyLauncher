export interface GameItem {
  id: string;
  title: string;
  cleanTitle: string;
  uris: string[];
  uploadDate?: string;
  fileSize?: string;
  coverUrl?: string;
  bannerUrl?: string;
  repacker?: string;
  description?: string;
  genres?: string[];
  rating?: number;
  featured?: boolean;
}

export interface HydraSource {
  id: string;
  name: string;
  url: string;
  downloadsCount: number;
  addedAt: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  errorMessage?: string;
  isDefault?: boolean;
}

export interface DownloadItem {
  id: string;
  title: string;
  coverUrl?: string;
  fileSize?: string;
  progress: number; // 0 - 100
  downloadedBytes: number;
  totalBytes: number;
  speed: string; // e.g. "24.5 MB/s"
  peers: number;
  status: 'downloading' | 'paused' | 'completed' | 'needs_install' | 'error';
  magnetUri: string;
  infoHash?: string;
  savePath: string;
  eta: string;
  installerDetected?: boolean;
  installerPath?: string;
  mainExePath?: string;
}

export interface LibraryItem {
  id: string;
  title: string;
  coverUrl?: string;
  cleanTitle: string;
  installPath?: string;
  mainExePath?: string;
  isInstalled: boolean;
  fileSize?: string;
  lastPlayed?: string;
  playTimeMinutes: number;
  addedAt: string;
  status?: 'ready' | 'needs_install';
  installerDetected?: boolean;
  installerPath?: string;
}

export type ViewTab = 'home' | 'catalogue' | 'downloads' | 'settings' | 'game-details';
