import { DownloadItem, GameItem } from '../types';
import { libraryService } from './libraryService';
import { settingsService } from './settingsService';

class DownloadService {
  private downloadsKey = 'sky_launcher_downloads_real';
  private downloads: DownloadItem[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.load();
    this.initElectronListeners();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.save();
    this.listeners.forEach(cb => cb());
  }

  private load() {
    try {
      const data = localStorage.getItem(this.downloadsKey);
      if (data) {
        this.downloads = JSON.parse(data);
      } else {
        this.downloads = [];
      }
    } catch {
      this.downloads = [];
    }
  }

  private save() {
    localStorage.setItem(this.downloadsKey, JSON.stringify(this.downloads));
  }

  private initElectronListeners() {
    if (typeof window !== 'undefined' && (window as any).skyApi) {
      const api = (window as any).skyApi;

      if (api.onTorrentUpdate) {
        api.onTorrentUpdate((data: any) => {
          const item = this.downloads.find(d => d.id === data.id);
          if (item) {
            item.progress = data.progress;
            item.speed = data.speed;
            item.downloadedBytes = data.downloadedBytes;
            item.totalBytes = data.totalBytes;
            item.peers = data.peers;
            item.eta = data.eta;
            item.status = data.status;
            if (data.savePath) item.savePath = data.savePath;
            if (data.installerDetected) {
              item.installerDetected = data.installerDetected;
              item.installerPath = data.installerPath;
            }
            this.notify();
          }
        });
      }

      if (api.onTorrentCompleted) {
        api.onTorrentCompleted((data: any) => {
          const item = this.downloads.find(d => d.id === data.id);
          if (item) {
            item.progress = 100;
            item.speed = '0 KB/s';
            item.eta = 'Завершено';
            item.installerDetected = data.installerDetected;
            item.installerPath = data.installerPath;
            item.mainExePath = data.mainExePath;

            if (data.installerDetected) {
              item.status = 'needs_install';
            } else {
              item.status = 'completed';
            }

            // Sync with My Library
            libraryService.addGame({
              id: 'lib_' + item.id,
              title: item.title,
              cleanTitle: item.title,
              coverUrl: item.coverUrl,
              fileSize: item.fileSize,
              isInstalled: true,
              playTimeMinutes: 0,
              addedAt: new Date().toISOString(),
              status: data.installerDetected ? 'needs_install' : 'ready',
              installerDetected: data.installerDetected,
              installerPath: data.installerPath,
              installPath: data.savePath,
              mainExePath: data.mainExePath
            });

            this.notify();
          }
        });
      }
    }
  }

  public getDownloads(): DownloadItem[] {
    return this.downloads;
  }

  public getActiveDownload(): DownloadItem | null {
    return this.downloads.find(d => d.status === 'downloading') || null;
  }

  public addDownload(game: GameItem, uriIndex: number = 0): DownloadItem {
    const uri = game.uris[uriIndex] || (game.uris.length > 0 ? game.uris[0] : '');

    const existing = this.downloads.find(d => d.title === game.cleanTitle);
    if (existing) {
      if (existing.status === 'paused') {
        this.resumeDownload(existing.id);
      }
      return existing;
    }

    const settings = settingsService.getSettings();
    const safeTitle = game.cleanTitle.replace(/[\\/:*?"<>|]/g, '').trim();
    const savePath = `${settings.downloadDir || 'C:\\Games'}\\${safeTitle}`;

    const item: DownloadItem = {
      id: 'dl_' + Date.now(),
      title: game.cleanTitle,
      coverUrl: game.coverUrl,
      fileSize: game.fileSize || 'Torrent Data',
      progress: 0,
      downloadedBytes: 0,
      totalBytes: 0,
      speed: '0 KB/s',
      peers: 0,
      status: 'downloading',
      magnetUri: uri,
      savePath,
      eta: 'Поиск пиров...'
    };

    this.downloads.unshift(item);
    this.notify();

    if (settings.clientMode === 'external') {
      if (typeof window !== 'undefined' && (window as any).skyApi?.openExternal) {
        (window as any).skyApi.openExternal(uri);
      }
    } else if (typeof window !== 'undefined' && (window as any).skyApi?.startTorrentDownload) {
      (window as any).skyApi.startTorrentDownload({
        gameId: item.id,
        title: game.cleanTitle,
        magnetUri: uri,
        savePath
      });
    }

    return item;
  }

  public pauseDownload(id: string) {
    const item = this.downloads.find(d => d.id === id);
    if (item && item.status === 'downloading') {
      item.status = 'paused';
      item.speed = '0 KB/s';
      this.notify();
      if (typeof window !== 'undefined' && (window as any).skyApi?.pauseTorrent) {
        (window as any).skyApi.pauseTorrent(id);
      }
    }
  }

  public resumeDownload(id: string) {
    const item = this.downloads.find(d => d.id === id);
    if (item && item.status === 'paused') {
      item.status = 'downloading';
      this.notify();
      if (typeof window !== 'undefined' && (window as any).skyApi?.resumeTorrent) {
        (window as any).skyApi.resumeTorrent(id);
      }
    }
  }

  public cancelDownload(id: string) {
    this.downloads = this.downloads.filter(d => d.id !== id);
    this.notify();
    if (typeof window !== 'undefined' && (window as any).skyApi?.cancelTorrent) {
      (window as any).skyApi.cancelTorrent(id);
    }
  }

  public async scanExistingFolder(id: string) {
    const item = this.downloads.find(d => d.id === id);
    if (!item) return;

    if (typeof window !== 'undefined' && (window as any).skyApi?.scanFolder) {
      const res = await (window as any).skyApi.scanFolder(item.savePath);
      if (res && res.hasInstaller) {
        item.status = 'needs_install';
        item.installerDetected = true;
        item.installerPath = res.installerPath;
        item.progress = 100;
        this.notify();

        libraryService.addGame({
          id: 'lib_' + item.id,
          title: item.title,
          cleanTitle: item.title,
          coverUrl: item.coverUrl,
          fileSize: item.fileSize,
          isInstalled: true,
          playTimeMinutes: 0,
          addedAt: new Date().toISOString(),
          status: 'needs_install',
          installerDetected: true,
          installerPath: res.installerPath,
          installPath: item.savePath
        });
      }
    }
  }
}

export const downloadService = new DownloadService();
