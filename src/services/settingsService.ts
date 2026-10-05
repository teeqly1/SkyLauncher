export interface LauncherSettings {
  downloadDir: string;
  clientMode: 'internal' | 'external' | 'hybrid';
  bypassTrackers: boolean;
  autoRunSetup: boolean;
  autoSilentInstall: boolean;
  maxConns: number;
  speedLimit: string;
  proxy: string;
}

const DEFAULT_SETTINGS: LauncherSettings = {
  downloadDir: 'C:\\Games',
  clientMode: 'internal',
  bypassTrackers: true,
  autoRunSetup: false,
  autoSilentInstall: false,
  maxConns: 55,
  speedLimit: 'unlimited',
  proxy: ''
};

import { cloudSync } from './supabaseService';

class SettingsService {
  private key = 'sky_launcher_settings';
  private settings: LauncherSettings = { ...DEFAULT_SETTINGS };
  private listeners: Array<() => void> = [];

  constructor() {
    this.load();
    this.syncWithElectron();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.save();
    this.syncWithElectron();
    cloudSync.schedulePush();
    this.listeners.forEach(cb => cb());
  }

  private load() {
    try {
      const stored = localStorage.getItem(this.key);
      if (stored) {
        this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch {
      this.settings = { ...DEFAULT_SETTINGS };
    }
  }

  private save() {
    localStorage.setItem(this.key, JSON.stringify(this.settings));
  }

  private syncWithElectron() {
    if (typeof window !== 'undefined' && (window as any).skyApi?.updateTorrentSettings) {
      (window as any).skyApi.updateTorrentSettings(this.settings);
    }
  }

  public getSettings(): LauncherSettings {
    return this.settings;
  }

  public updateSettings(partial: Partial<LauncherSettings>) {
    this.settings = { ...this.settings, ...partial };
    this.notify();
  }

  public async browseDownloadDir(): Promise<string | null> {
    if (typeof window !== 'undefined' && (window as any).skyApi?.selectDownloadDir) {
      const chosen = await (window as any).skyApi.selectDownloadDir();
      if (chosen) {
        this.updateSettings({ downloadDir: chosen });
        return chosen;
      }
    }
    return null;
  }
}

export const settingsService = new SettingsService();
