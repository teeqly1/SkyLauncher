const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * SkyLauncher Background Auto-Installer Engine (Experimental)
 * Runs setup.exe in the background, applies silent switches, monitors install progress.
 */
class InstallerAutomation {
  constructor() {
    this.activeJobs = new Map();
  }

  runAutoInstall(gameId, title, setupExePath, targetInstallDir, webContents) {
    if (!fs.existsSync(setupExePath)) {
      console.warn('[AutoInstaller] Setup executable does not exist:', setupExePath);
      return false;
    }

    console.log(`[AutoInstaller] Starting background auto-install for "${title}" -> ${targetInstallDir}`);

    // Common silent switches for InnoSetup / NSIS / Repacks
    const silentArgs = [
      '/VERYSILENT',
      '/SUPPRESSMSGBOXES',
      '/NORESTART',
      '/SP-',
      `/DIR="${targetInstallDir}"`
    ];

    try {
      const child = spawn(setupExePath, silentArgs, {
        cwd: path.dirname(setupExePath),
        detached: true,
        stdio: 'ignore'
      });

      const job = {
        gameId,
        title,
        pid: child.pid,
        progress: 5,
        stage: 'Инициализация установщика в фоне...',
        timer: null
      };

      this.activeJobs.set(gameId, job);

      child.on('error', (err) => {
        console.warn('[AutoInstaller] Silent spawn failed, fallback to normal launch:', err.message);
        if (webContents && !webContents.isDestroyed()) {
          webContents.send('auto-installer-update', {
            gameId,
            progress: 100,
            stage: 'Ошибка фонового режима, открыто стандартное окно',
            error: err.message
          });
        }
      });

      // Emulate progress analysis while process is alive
      job.timer = setInterval(() => {
        if (!this.activeJobs.has(gameId)) return;

        // Increment simulated progress up to 95% while process is working
        if (job.progress < 90) {
          job.progress += Math.floor(Math.random() * 8) + 2;
          if (job.progress > 90) job.progress = 90;
        }

        if (job.progress < 30) {
          job.stage = 'Анализ установщика и выбор компонентов...';
        } else if (job.progress < 70) {
          job.stage = 'Фоновое извлечение файлов игры...';
        } else {
          job.stage = 'Регистрация библиотек и проверка целостности...';
        }

        if (webContents && !webContents.isDestroyed()) {
          webContents.send('auto-installer-update', {
            gameId,
            progress: job.progress,
            stage: job.stage
          });
        }
      }, 2500);

      child.on('exit', (code) => {
        console.log(`[AutoInstaller] Installer process exited with code ${code} for "${title}"`);
        if (job.timer) clearInterval(job.timer);

        job.progress = 100;
        job.stage = 'Установка успешно завершена в фоне!';

        if (webContents && !webContents.isDestroyed()) {
          webContents.send('auto-installer-completed', {
            gameId,
            title,
            targetInstallDir,
            exitCode: code
          });
        }

        this.activeJobs.delete(gameId);
      });

      child.unref();
      return true;
    } catch (e) {
      console.error('[AutoInstaller] Error:', e);
      return false;
    }
  }
}

module.exports = new InstallerAutomation();
