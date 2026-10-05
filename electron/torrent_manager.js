const fs = require('fs');
const path = require('path');
const { app, shell } = require('electron');

// High-speed open trackers for ISP/RKN block bypass
const BYPASS_TRACKERS = [
  'udp://tracker.opentrackr.org:1337/announce',
  'udp://open.stealth.si:80/announce',
  'udp://tracker.torrent.eu.org:451/announce',
  'udp://tracker.moeking.me:6969/announce',
  'udp://explodie.org:6969/announce',
  'udp://tracker.openbittorrent.com:6969/announce',
  'udp://p4p.arenabg.com:1337/announce',
  'udp://tracker.zerobytes.xyz:1337/announce',
  'udp://tracker.derpturkey.com:6969/announce',
  'udp://tracker.altrosky.nl:6969/announce'
];

class TorrentManager {
  constructor() {
    this.client = null;
    this.WebTorrentClass = null;
    this.torrents = new Map();
    this.defaultDownloadDir = 'C:\\Games';
    this.webContents = null;
    this.initPromise = null;
    this.settings = {
      downloadDir: 'C:\\Games',
      clientMode: 'internal', // 'internal' | 'external' | 'hybrid'
      bypassTrackers: true,
      maxConns: 55,
      autoRunSetup: false,
      proxy: ''
    };
  }

  async init(webContents) {
    this.webContents = webContents;

    // Load or create downloads dir
    this.ensureDownloadDir(this.settings.downloadDir);

    // Dynamically import WebTorrent (ESM module)
    if (!this.initPromise) {
      this.initPromise = (async () => {
        try {
          const mod = await import('webtorrent');
          this.WebTorrentClass = mod.default || mod;
          this.client = new this.WebTorrentClass({
            maxConns: this.settings.maxConns || 55,
          });
          console.log('[TorrentManager] WebTorrent engine dynamically loaded successfully!');
        } catch (err) {
          console.error('[TorrentManager] Could not load WebTorrent dynamically:', err);
        }
      })();
    }

    return this.initPromise;
  }

  ensureDownloadDir(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      this.defaultDownloadDir = dirPath;
    } catch {
      this.defaultDownloadDir = path.join(app.getPath('downloads'), 'SkyLauncherGames');
      try {
        if (!fs.existsSync(this.defaultDownloadDir)) {
          fs.mkdirSync(this.defaultDownloadDir, { recursive: true });
        }
      } catch (e) {
        console.error('Fallback folder error:', e);
      }
    }
  }

  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    if (newSettings.downloadDir) {
      this.ensureDownloadDir(newSettings.downloadDir);
    }
    console.log('[TorrentManager] Settings updated:', this.settings);
  }

  injectBypassTrackers(magnetUri) {
    if (!this.settings.bypassTrackers || !magnetUri.startsWith('magnet:?')) {
      return magnetUri;
    }

    let enriched = magnetUri;
    for (const tr of BYPASS_TRACKERS) {
      if (!enriched.includes(encodeURIComponent(tr))) {
        enriched += `&tr=${encodeURIComponent(tr)}`;
      }
    }
    return enriched;
  }

  async addTorrent(gameId, title, rawMagnetUri, customDownloadDir) {
    await this.initPromise;

    const safeTitle = title.replace(/[\\/:*?"<>|]/g, '').trim();
    const savePath = customDownloadDir || path.join(this.settings.downloadDir || this.defaultDownloadDir, safeTitle);
    const magnetUri = this.injectBypassTrackers(rawMagnetUri);

    if (!fs.existsSync(savePath)) {
      try {
        fs.mkdirSync(savePath, { recursive: true });
      } catch (e) {
        console.error('Failed to create savePath:', e);
      }
    }

    // External client mode bypass
    if (this.settings.clientMode === 'external') {
      console.log(`[TorrentManager] Dispatching magnet to external client for "${title}"`);
      shell.openExternal(magnetUri);
      return {
        id: gameId,
        title,
        savePath,
        magnetUri,
        status: 'completed',
        isExternal: true
      };
    }

    if (this.torrents.has(gameId)) {
      return this.torrents.get(gameId);
    }

    if (!this.client) {
      console.warn('[TorrentManager] WebTorrent not ready, falling back to external client');
      shell.openExternal(magnetUri);
      return null;
    }

    console.log(`[TorrentManager] Starting internal download for "${title}" -> ${savePath}`);

    try {
      const torrent = this.client.add(magnetUri, {
        path: savePath,
        destroyStoreOnDestroy: false
      });

      const info = {
        id: gameId,
        title,
        savePath,
        magnetUri,
        torrent,
        status: 'downloading',
        installerDetected: false,
        installerPath: null,
        mainExePath: null
      };

      this.torrents.set(gameId, info);

      torrent.on('download', () => {
        this.emitProgress(info);
      });

      torrent.on('done', () => {
        console.log(`[TorrentManager] Torrent done for "${title}"`);
        info.status = 'completed';

        // CRITICAL FIX: Close open file handles immediately so Windows allows running the game / setup.exe!
        try {
          torrent.pause();
          torrent.destroy({ destroyStore: false });
          info.torrent = null;
          console.log(`[TorrentManager] File handles released for "${title}" to prevent EBUSY/file-in-use lock`);
        } catch (errDestroy) {
          console.warn('[TorrentManager] Error releasing torrent file handles:', errDestroy.message);
        }

        // Scan for setup.exe or installer hints
        const scanResult = this.scanFolderForInstaller(savePath);
        if (scanResult.hasInstaller) {
          info.installerDetected = true;
          info.installerPath = scanResult.installerPath;
          console.log(`[TorrentManager] Installer detected: ${scanResult.installerPath}`);
          
          if (this.settings.autoRunSetup && scanResult.installerPath) {
            shell.openPath(scanResult.installerPath);
          }
        } else if (scanResult.mainExePath) {
          info.mainExePath = scanResult.mainExePath;
        }

        this.emitCompleted(info);
      });

      torrent.on('error', (err) => {
        console.error(`[TorrentManager] Torrent error for "${title}":`, err.message);
        info.status = 'error';
        info.errorMessage = err.message;
        this.emitProgress(info);
      });

      return info;
    } catch (err) {
      console.error('[TorrentManager] Failed to add torrent:', err);
      // Fallback: open in external client
      shell.openExternal(magnetUri);
      return null;
    }
  }

  scanFolderForInstaller(folderPath) {
    const result = {
      hasInstaller: false,
      installerPath: null,
      mainExePath: null
    };

    if (!fs.existsSync(folderPath)) return result;

    try {
      const scanDir = (dir, depth = 0) => {
        if (depth > 2) return;
        const files = fs.readdirSync(dir, { withFileTypes: true });

        for (const file of files) {
          const fullPath = path.join(dir, file.name);
          if (file.isDirectory()) {
            scanDir(fullPath, depth + 1);
          } else if (file.isFile()) {
            const lowerName = file.name.toLowerCase();

            if (
              lowerName.includes('setup') ||
              lowerName.includes('install') ||
              lowerName === 'autorun.exe' ||
              lowerName.endsWith('.iso')
            ) {
              result.hasInstaller = true;
              if (lowerName.endsWith('.exe')) {
                result.installerPath = fullPath;
              }
            } else if (lowerName.endsWith('.exe') && !result.mainExePath) {
              if (
                !lowerName.includes('unins') &&
                !lowerName.includes('crash') &&
                !lowerName.includes('unitycrash') &&
                !lowerName.includes('update') &&
                !lowerName.includes('redist') &&
                !lowerName.includes('vcredist') &&
                !lowerName.includes('directx')
              ) {
                result.mainExePath = fullPath;
              }
            }
          }
        }
      };

      scanDir(folderPath);
    } catch (e) {
      console.error('Scan error:', e);
    }

    return result;
  }

  scanInstalledGameFolder(folderPath) {
    if (!fs.existsSync(folderPath)) return null;

    try {
      const files = fs.readdirSync(folderPath, { withFileTypes: true });
      let candidateExe = null;

      for (const file of files) {
        if (file.isFile() && file.name.toLowerCase().endsWith('.exe')) {
          const lower = file.name.toLowerCase();
          if (
            !lower.includes('unins') &&
            !lower.includes('crash') &&
            !lower.includes('dxwebsetup') &&
            !lower.includes('vcredist') &&
            !lower.includes('setup')
          ) {
            candidateExe = path.join(folderPath, file.name);
            break;
          }
        }
      }

      if (!candidateExe) {
        for (const file of files) {
          if (file.isDirectory()) {
            const subDir = path.join(folderPath, file.name);
            const subFiles = fs.readdirSync(subDir, { withFileTypes: true });
            for (const sub of subFiles) {
              if (sub.isFile() && sub.name.toLowerCase().endsWith('.exe')) {
                const lower = sub.name.toLowerCase();
                if (!lower.includes('unins') && !lower.includes('crash')) {
                  candidateExe = path.join(subDir, sub.name);
                  break;
                }
              }
            }
            if (candidateExe) break;
          }
        }
      }

      return candidateExe;
    } catch (e) {
      console.error('Error scanning folder:', e);
      return null;
    }
  }

  pauseTorrent(gameId) {
    const info = this.torrents.get(gameId);
    if (info && info.torrent) {
      info.torrent.pause();
      info.status = 'paused';
      this.emitProgress(info);
    }
  }

  resumeTorrent(gameId) {
    const info = this.torrents.get(gameId);
    if (info && info.torrent) {
      info.torrent.resume();
      info.status = 'downloading';
      this.emitProgress(info);
    }
  }

  removeTorrent(gameId) {
    const info = this.torrents.get(gameId);
    if (info && info.torrent) {
      try {
        info.torrent.destroy({ destroyStore: false });
      } catch (e) {
        console.error('Destroy error:', e);
      }
      this.torrents.delete(gameId);
    }
  }

  releaseFileLocks(targetPath) {
    for (const [id, info] of this.torrents.entries()) {
      if (info.torrent) {
        const matches = !targetPath || (targetPath.toLowerCase().includes(info.savePath.toLowerCase()));
        if (matches) {
          try {
            console.log(`[TorrentManager] Forcefully releasing file lock for: ${info.title}`);
            info.torrent.pause();
            info.torrent.destroy({ destroyStore: false });
            info.torrent = null;
          } catch (e) {
            console.error('Lock release error:', e);
          }
        }
      }
    }
  }

  emitProgress(info) {
    if (!this.webContents || this.webContents.isDestroyed()) return;

    const t = info.torrent;
    const speedBytes = t ? t.downloadSpeed : 0;
    const speedMB = (speedBytes / (1024 * 1024)).toFixed(1);
    const progress = t ? t.progress * 100 : 0;
    const downloaded = t ? t.downloaded : 0;
    const total = t ? t.length : 0;
    const peers = t ? t.numPeers : 0;

    let eta = 'Поиск пиров...';
    if (speedBytes > 0 && total > downloaded) {
      const secLeft = Math.ceil((total - downloaded) / speedBytes);
      const m = Math.floor(secLeft / 60);
      const s = secLeft % 60;
      eta = `${m}m ${s}s`;
    }

    this.webContents.send('torrent-update', {
      id: info.id,
      title: info.title,
      progress,
      downloadedBytes: downloaded,
      totalBytes: total,
      speed: `${speedMB} MB/s`,
      peers,
      eta,
      status: info.status,
      savePath: info.savePath,
      installerDetected: info.installerDetected,
      installerPath: info.installerPath
    });
  }

  emitCompleted(info) {
    if (!this.webContents || this.webContents.isDestroyed()) return;

    this.webContents.send('torrent-completed', {
      id: info.id,
      title: info.title,
      savePath: info.savePath,
      installerDetected: info.installerDetected,
      installerPath: info.installerPath,
      mainExePath: info.mainExePath
    });
  }
}

module.exports = new TorrentManager();
