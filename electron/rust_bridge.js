const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const { shell } = require('electron');

/**
 * SkyLauncher Rust & C++ Native Bridge
 * Connects Node.js / Electron with the Rust high performance engine and C++ game launcher.
 */
class RustBridge {
  constructor() {
    this.rustProcess = null;
    this.reqId = 1;
    this.callbacks = new Map();
  }

  init() {
    // Check if compiled rust binary exists
    const possiblePaths = [
      path.join(__dirname, '..', 'native', 'rust-engine', 'target', 'release', 'sky_engine.exe'),
      path.join(__dirname, '..', 'native', 'rust-engine', 'target', 'debug', 'sky_engine.exe'),
    ];

    let binaryPath = possiblePaths.find(p => fs.existsSync(p));

    if (binaryPath) {
      try {
        this.rustProcess = spawn(binaryPath, [], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        this.rustProcess.stdout.on('data', (data) => {
          const lines = data.toString().split('\n');
          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const res = JSON.parse(line);
              if (res.id && this.callbacks.has(res.id)) {
                const cb = this.callbacks.get(res.id);
                this.callbacks.delete(res.id);
                cb(res);
              }
            } catch (e) {
              console.error('[RustEngine Output]', line);
            }
          }
        });

        this.rustProcess.on('error', (err) => {
          console.warn('[RustEngine] Fallback to embedded engine:', err.message);
          this.rustProcess = null;
        });

        console.log('[SkyBridge] Connected to native Rust engine at:', binaryPath);
      } catch (err) {
        console.warn('[SkyBridge] Native spawn error:', err);
      }
    } else {
      console.log('[SkyBridge] Using integrated JavaScript/TypeScript Torrent engine');
    }
  }

  parseMagnet(uri) {
    if (this.rustProcess) {
      return new Promise((resolve) => {
        const id = this.reqId++;
        this.callbacks.set(id, (res) => resolve(res.result));
        this.rustProcess.stdin.write(JSON.stringify({
          id,
          action: 'parse_magnet',
          payload: { uri }
        }) + '\n');
      });
    }

    // High performance embedded fallback parser
    try {
      const parsed = new URL(uri);
      const xt = parsed.searchParams.get('xt') || '';
      const dn = parsed.searchParams.get('dn') || '';
      const infoHash = xt.replace('urn:btih:', '');
      return Promise.resolve({
        info_hash: infoHash,
        name: dn,
        trackers: parsed.searchParams.getAll('tr')
      });
    } catch {
      return Promise.resolve(null);
    }
  }

  launchGame(targetPath, args = []) {
    if (!targetPath) return false;
    try {
      // If it's a directory or general executable, shell.openPath is the safest Windows shell executor
      if (!fs.existsSync(targetPath)) {
        console.warn('[RustBridge] Target path does not exist:', targetPath);
        return false;
      }

      const stat = fs.statSync(targetPath);
      if (stat.isDirectory()) {
        shell.openPath(targetPath);
        return true;
      }

      // Check for native C++ launcher
      const cppLauncher = path.join(__dirname, '..', 'native', 'cpp-core', 'game_launcher.exe');
      if (fs.existsSync(cppLauncher)) {
        try {
          const child = spawn(cppLauncher, [targetPath, ...args], { detached: true, stdio: 'ignore' });
          child.on('error', (err) => {
            console.warn('[RustBridge] C++ launcher error, falling back to shell:', err.message);
            shell.openPath(targetPath);
          });
          child.unref();
          return true;
        } catch (e) {
          console.warn('[RustBridge] C++ spawn failed:', e.message);
        }
      }

      // Safe direct spawn
      try {
        const child = spawn(targetPath, args, {
          detached: true,
          stdio: 'ignore',
          cwd: path.dirname(targetPath)
        });
        child.on('error', (err) => {
          console.warn('[RustBridge] Spawn error, falling back to shell.openPath:', err.message);
          shell.openPath(targetPath);
        });
        child.unref();
        return true;
      } catch (err) {
        console.warn('[RustBridge] Spawn exception, using shell.openPath:', err.message);
        shell.openPath(targetPath);
        return true;
      }
    } catch (outerErr) {
      console.error('[RustBridge] launchGame fatal caught:', outerErr.message);
      try {
        shell.openPath(targetPath);
      } catch {}
      return false;
    }
  }
}

module.exports = new RustBridge();
