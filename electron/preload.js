const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('skyApi', {
  closeWindow: () => ipcRenderer.send('window-close'),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  openExternal: (url) => ipcRenderer.send('open-external', url),
  openPath: (path) => ipcRenderer.send('open-path', path),
  
  // Real torrent downloading & settings
  startTorrentDownload: (data) => ipcRenderer.send('start-torrent-download', data),
  pauseTorrent: (gameId) => ipcRenderer.send('pause-torrent', gameId),
  resumeTorrent: (gameId) => ipcRenderer.send('resume-torrent', gameId),
  cancelTorrent: (gameId) => ipcRenderer.send('cancel-torrent', gameId),
  updateTorrentSettings: (settings) => ipcRenderer.send('update-torrent-settings', settings),
  selectDownloadDir: () => ipcRenderer.invoke('select-download-dir'),

  // Auto-installer (Experimental background setup)
  runAutoInstaller: (data) => ipcRenderer.send('run-auto-installer', data),

  // File system & installation detection
  selectGameFolder: () => ipcRenderer.invoke('select-game-folder'),
  scanFolder: (folderPath) => ipcRenderer.invoke('scan-folder', folderPath),
  launchExecutable: (exePath) => ipcRenderer.send('launch-exe', exePath),
  getSysInfo: () => ipcRenderer.invoke('get-sys-info'),

  // Listeners
  onTorrentUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('torrent-update', handler);
    return () => ipcRenderer.removeListener('torrent-update', handler);
  },
  onTorrentCompleted: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('torrent-completed', handler);
    return () => ipcRenderer.removeListener('torrent-completed', handler);
  },
  onAutoInstallerUpdate: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('auto-installer-update', handler);
    return () => ipcRenderer.removeListener('auto-installer-update', handler);
  },
  onAutoInstallerCompleted: (callback) => {
    const handler = (_, data) => callback(data);
    ipcRenderer.on('auto-installer-completed', handler);
    return () => ipcRenderer.removeListener('auto-installer-completed', handler);
  }
});
