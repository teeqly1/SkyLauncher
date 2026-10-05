import React, { useState, useEffect } from 'react';
import {
  Play, Pause, Trash2, FolderOpen, DownloadCloud, AlertTriangle,
  FolderSearch, Clock, Bot, CheckCircle2
} from 'lucide-react';
import { DownloadItem } from '../types';
import { downloadService } from '../services/downloadService';
import { libraryService } from '../services/libraryService';
import { settingsService } from '../services/settingsService';
import { i18n } from '../services/i18nService';

export const DownloadsView: React.FC = () => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [autoInstallProgress, setAutoInstallProgress] = useState<Record<string, { progress: number; stage: string }>>({});
  const settings = settingsService.getSettings();
  const t = i18n.t();

  useEffect(() => {
    setDownloads([...downloadService.getDownloads()]);
    const unsubDl = downloadService.subscribe(() => {
      setDownloads([...downloadService.getDownloads()]);
    });

    if (typeof window !== 'undefined' && (window as any).skyApi) {
      const api = (window as any).skyApi;
      if (api.onAutoInstallerUpdate) {
        api.onAutoInstallerUpdate((data: any) => {
          setAutoInstallProgress(prev => ({
            ...prev,
            [data.gameId]: { progress: data.progress, stage: data.stage }
          }));
        });
      }

      if (api.onAutoInstallerCompleted) {
        api.onAutoInstallerCompleted((data: any) => {
          setAutoInstallProgress(prev => ({
            ...prev,
            [data.gameId]: { progress: 100, stage: 'Установка завершена!' }
          }));

          // Mark game as ready
          libraryService.updateGameStatus(data.gameId, {
            status: 'ready',
            isInstalled: true,
            installPath: data.targetInstallDir
          });
        });
      }
    }

    return unsubDl;
  }, []);

  const handleOpenFolder = (path: string) => {
    if (typeof window !== 'undefined' && (window as any).skyApi) {
      (window as any).skyApi.openPath?.(path);
    } else {
      alert(`Открытие папки: ${path}`);
    }
  };

  const handleLaunchInstaller = (installerPath?: string) => {
    if (installerPath && typeof window !== 'undefined' && (window as any).skyApi) {
      (window as any).skyApi.launchExecutable?.(installerPath);
    } else {
      alert(`Запуск установщика: ${installerPath || 'setup.exe'}`);
    }
  };

  const handleRunAutoInstaller = (item: DownloadItem) => {
    if (!item.installerPath) return;
    const targetDir = `${settings.downloadDir || 'C:\\Games'}\\${item.title.replace(/[\\/:*?"<>|]/g, '')}`;

    if (typeof window !== 'undefined' && (window as any).skyApi?.runAutoInstaller) {
      (window as any).skyApi.runAutoInstaller({
        gameId: item.id,
        title: item.title,
        setupExePath: item.installerPath,
        targetInstallDir: targetDir
      });
    }
  };

  const handleSelectGameFolder = async (item: DownloadItem) => {
    if (typeof window !== 'undefined' && (window as any).skyApi?.selectGameFolder) {
      const res = await (window as any).skyApi.selectGameFolder();
      if (res && res.folderPath) {
        item.status = 'completed';
        item.savePath = res.folderPath;
        item.mainExePath = res.mainExe;

        libraryService.addGame({
          id: 'lib_' + item.id,
          title: item.title,
          cleanTitle: item.title,
          coverUrl: item.coverUrl,
          fileSize: item.fileSize,
          isInstalled: true,
          playTimeMinutes: 0,
          addedAt: new Date().toISOString(),
          status: 'ready',
          installPath: res.folderPath,
          mainExePath: res.mainExe
        });

        alert(`Папка игры выбрана: ${res.folderPath}\nИсполняемый файл: ${res.mainExe || 'Обнаружен'}`);
      }
    }
  };

  return (
    <div className="downloads-view">
      <div className="downloads-header">
        <h2>{t.activeDownloads}</h2>
        {downloads.length > 0 && (
          <button
            className="clear-btn"
            onClick={() => {
              downloads.forEach(d => {
                if (d.status === 'completed') downloadService.cancelDownload(d.id);
              });
            }}
          >
            {t.clearCompleted}
          </button>
        )}
      </div>

      <div className="downloads-list">
        {downloads.map((item) => {
          const autoJob = autoInstallProgress[item.id];

          return (
            <div key={item.id} className="download-card" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', width: '100%' }}>
                <img
                  src={item.coverUrl || 'https://via.placeholder.com/100x60'}
                  alt={item.title}
                  className="download-cover"
                />

                <div className="download-info">
                  <div className="top-row">
                    <span className="title">{item.title}</span>
                    <span className="speed-badge">
                      {item.status === 'downloading'
                        ? item.speed
                        : item.status === 'needs_install'
                        ? t.statusNeedsInstall
                        : item.status === 'completed'
                        ? t.statusCompleted
                        : t.statusPaused}
                    </span>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${item.progress}%`,
                        background: item.status === 'completed' ? '#10b981' : item.status === 'needs_install' ? '#f59e0b' : undefined
                      }}
                    />
                  </div>

                  <div className="bottom-row">
                    <div className="meta-stats">
                      <span>{item.progress.toFixed(1)}%</span>
                      <span>•</span>
                      <span>{item.fileSize}</span>
                      {item.status === 'downloading' && (
                        <>
                          <span>•</span>
                          <span>Пиры: {item.peers}</span>
                          <span>•</span>
                          <span>Осталось: {item.eta}</span>
                        </>
                      )}
                    </div>
                    <span>{item.savePath}</span>
                  </div>
                </div>

                <div className="download-controls">
                  {item.status === 'downloading' && (
                    <button
                      className="btn-ctrl"
                      title="Пауза"
                      onClick={() => downloadService.pauseDownload(item.id)}
                    >
                      <Pause size={16} />
                    </button>
                  )}

                  {item.status === 'paused' && (
                    <button
                      className="btn-ctrl"
                      title="Возобновить"
                      onClick={() => downloadService.resumeDownload(item.id)}
                    >
                      <Play size={16} />
                    </button>
                  )}

                  <button
                    className="btn-ctrl"
                    title="Открыть папку"
                    onClick={() => handleOpenFolder(item.savePath)}
                  >
                    <FolderOpen size={16} />
                  </button>

                  <button
                    className="btn-ctrl btn-remove"
                    title="Удалить загрузку"
                    onClick={() => downloadService.cancelDownload(item.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* POST-INSTALLATION NOTICE REQUESTED BY USER */}
              {(item.status === 'completed' || item.status === 'needs_install') && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'rgba(56, 189, 248, 0.08)',
                    border: '1px solid rgba(56, 189, 248, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <Clock size={18} color="#38bdf8" style={{ flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>
                    {t.wait5Minutes}
                  </span>
                </div>
              )}

              {/* Auto-Installer Active Progress */}
              {autoJob && autoJob.progress < 100 && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#34d399' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Bot size={16} />
                      <span>{autoJob.stage}</span>
                    </div>
                    <span>{autoJob.progress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: '#232736', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${autoJob.progress}%`, height: '100%', background: '#10b981', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              )}

              {/* Installer Detected Banner */}
              {(item.status === 'needs_install' || item.installerDetected) && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.3)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    flexWrap: 'wrap'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#fbbf24' }}>
                        {t.gameInstalledWaitingUser}
                      </div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                        {t.installerDetectedDesc}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    {settings.autoSilentInstall && item.installerPath && (
                      <button
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#10b981',
                          color: '#fff',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        onClick={() => handleRunAutoInstaller(item)}
                      >
                        <Bot size={14} />
                        <span>{t.btnAutoInstall}</span>
                      </button>
                    )}

                    {item.installerPath && (
                      <button
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          background: '#f59e0b',
                          color: '#000',
                          fontSize: '12px',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                        onClick={() => handleLaunchInstaller(item.installerPath)}
                      >
                        {t.btnLaunchSetup}
                      </button>
                    )}

                    <button
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        background: '#252837',
                        border: '1px solid #3b4257',
                        color: '#fff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleSelectGameFolder(item)}
                    >
                      <FolderSearch size={14} color="#38bdf8" />
                      <span>{t.btnSelectFolder}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {downloads.length === 0 && (
          <div className="empty-downloads">
            <DownloadCloud size={40} style={{ marginBottom: '12px', opacity: 0.5 }} />
            <p>{t.noDownloads}</p>
          </div>
        )}
      </div>
    </div>
  );
};
