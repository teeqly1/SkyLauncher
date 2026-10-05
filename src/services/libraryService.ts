import { LibraryItem } from '../types';
import { cloudSync } from './supabaseService';

class LibraryService {
  private libraryKey = 'sky_launcher_library_real';
  private library: LibraryItem[] = [];
  private listeners: Array<() => void> = [];

  constructor() {
    this.load();
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  private notify() {
    this.save();
    cloudSync.schedulePush();
    this.listeners.forEach(cb => cb());
  }

  private load() {
    try {
      const data = localStorage.getItem(this.libraryKey);
      if (data) {
        this.library = JSON.parse(data);
      } else {
        // No dummy/placeholder games! Only real games added or downloaded by the user
        this.library = [];
      }
    } catch {
      this.library = [];
    }
  }

  private save() {
    localStorage.setItem(this.libraryKey, JSON.stringify(this.library));
  }

  public getLibrary(): LibraryItem[] {
    return this.library;
  }

  public addGame(item: LibraryItem) {
    const existingIndex = this.library.findIndex(
      g => g.cleanTitle.toLowerCase() === item.cleanTitle.toLowerCase()
    );

    if (existingIndex >= 0) {
      this.library[existingIndex] = { ...this.library[existingIndex], ...item };
    } else {
      this.library.unshift(item);
    }
    this.notify();
  }

  public removeGame(id: string) {
    this.library = this.library.filter(g => g.id !== id);
    this.notify();
  }

  public updateGameStatus(id: string, updates: Partial<LibraryItem>) {
    const item = this.library.find(g => g.id === id);
    if (item) {
      Object.assign(item, updates);
      this.notify();
    }
  }

  public async selectGameFolder(id: string) {
    if (typeof window !== 'undefined' && (window as any).skyApi?.selectGameFolder) {
      const res = await (window as any).skyApi.selectGameFolder();
      if (res && res.folderPath) {
        this.updateGameStatus(id, {
          installPath: res.folderPath,
          mainExePath: res.mainExe || undefined,
          status: 'ready'
        });
        return res;
      }
    }
    return null;
  }

  public launchGame(item: LibraryItem) {
    if (typeof window !== 'undefined' && (window as any).skyApi?.launchExecutable) {
      if (item.status === 'needs_install' && item.installerPath) {
        (window as any).skyApi.launchExecutable(item.installerPath);
        return;
      }

      const exeToRun = item.mainExePath || item.installPath;
      if (exeToRun) {
        (window as any).skyApi.launchExecutable(exeToRun);
      } else if (item.installPath) {
        (window as any).skyApi.openPath(item.installPath);
      }
    }
  }
}

export const libraryService = new LibraryService();
