const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const rustBridge = require('./rust_bridge');
const torrentManager = require('./torrent_manager');
const installerAutomation = require('./installer_automation');

// Ensure dedicated userData and cache path for SkyLauncher
try {
  app.setPath('userData', path.join(app.getPath('appData'), 'SkyLauncherData'));
} catch (e) {}

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1180,
    height: 760,
    minWidth: 980,
    minHeight: 620,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#121316',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false
    },
    icon: path.join(__dirname, 'icon.png')
  });

  const prodPath = path.join(__dirname, '..', 'dist', 'index.html');
  const devUrl = 'http://localhost:5173';

  if (fs.existsSync(prodPath)) {
    mainWindow.loadFile(prodPath);
  } else {
    mainWindow.loadURL(devUrl).catch((e) => {
      console.warn('Could not load dev server, waiting...');
    });
  }

  torrentManager.init(mainWindow.webContents);
  rustBridge.init();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Window Controls
ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('open-external', (_, url) => {
  if (url) shell.openExternal(url);
});

ipcMain.on('open-path', (_, dirPath) => {
  if (dirPath && fs.existsSync(dirPath)) {
    shell.openPath(dirPath);
  }
});

// Settings & Directory Selection
ipcMain.handle('select-download-dir', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Выберите папку для загрузки игр',
    properties: ['openDirectory', 'createDirectory']
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  const selectedPath = result.filePaths[0];
  torrentManager.updateSettings({ downloadDir: selectedPath });
  return selectedPath;
});

ipcMain.on('update-torrent-settings', (_, settings) => {
  torrentManager.updateSettings(settings);
});

// Real Torrent Downloads
ipcMain.on('start-torrent-download', (_, data) => {
  const { gameId, title, magnetUri, savePath } = data;
  torrentManager.addTorrent(gameId, title, magnetUri, savePath);
});

ipcMain.on('pause-torrent', (_, gameId) => {
  torrentManager.pauseTorrent(gameId);
});

ipcMain.on('resume-torrent', (_, gameId) => {
  torrentManager.resumeTorrent(gameId);
});

ipcMain.on('cancel-torrent', (_, gameId) => {
  torrentManager.removeTorrent(gameId);
});

// Select installed game folder
ipcMain.handle('select-game-folder', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Выберите папку установленной игры',
    properties: ['openDirectory']
  });

  if (result.canceled || !result.filePaths.length) {
    return null;
  }

  const selectedDir = result.filePaths[0];
  const mainExe = torrentManager.scanInstalledGameFolder(selectedDir);
  return {
    folderPath: selectedDir,
    mainExe
  };
});

// Scan existing folder
ipcMain.handle('scan-folder', async (_, folderPath) => {
  if (!folderPath || !fs.existsSync(folderPath)) {
    return { exists: false, hasInstaller: false, mainExePath: null, installerPath: null };
  }
  const scan = torrentManager.scanFolderForInstaller(folderPath);
  return {
    exists: true,
    ...scan
  };
});

// Run background auto-installer (experimental)
ipcMain.on('run-auto-installer', (_, data) => {
  const { gameId, title, setupExePath, targetInstallDir } = data;
  installerAutomation.runAutoInstall(gameId, title, setupExePath, targetInstallDir, mainWindow.webContents);
});

// Launch game or setup installer
ipcMain.on('launch-exe', (_, exePath) => {
  if (!exePath) return;
  try {
    console.log('[SkyLauncher] Executing:', exePath);
    // 1. Forcefully release any active WebTorrent file handle locks
    torrentManager.releaseFileLocks(exePath);

    // 2. Small delay to ensure Windows OS file handles are fully freed
    setTimeout(() => {
      rustBridge.launchGame(exePath);
    }, 150);
  } catch (err) {
    console.error('[SkyLauncher] launch-exe error caught:', err.message);
    try {
      shell.openPath(exePath);
    } catch {}
  }
});

ipcMain.handle('get-sys-info', () => {
  return {
    platform: process.platform,
    arch: process.arch,
    version: app.getVersion()
  };
});
