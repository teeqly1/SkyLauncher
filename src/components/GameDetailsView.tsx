import React, { useState, useEffect } from 'react';
import { Download, Bookmark, BookmarkCheck, Copy, Check, HardDrive, Calendar, ShieldCheck, Play, FolderSearch, AlertTriangle } from 'lucide-react';
import { GameItem, LibraryItem } from '../types';
import { downloadService } from '../services/downloadService';
import { libraryService } from '../services/libraryService';
import { coverService } from '../services/coverService';

interface GameDetailsViewProps {
  game: GameItem;
}

export const GameDetailsView: React.FC<GameDetailsViewProps> = ({ game }) => {
  const [libraryEntry, setLibraryEntry] = useState<LibraryItem | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    const checkLib = () => {
      const lib = libraryService.getLibrary();
      const match = lib.find(g => g.cleanTitle.toLowerCase() === game.cleanTitle.toLowerCase());
      setLibraryEntry(match || null);
    };
    checkLib();
    return libraryService.subscribe(checkLib);
  }, [game]);

  const handleDownload = () => {
    downloadService.addDownload(game);
  };

  const handleToggleLibrary = () => {
    if (libraryEntry) {
      libraryService.removeGame(libraryEntry.id);
      setLibraryEntry(null);
    } else {
      const newItem: LibraryItem = {
        id: 'lib_' + Date.now(),
        title: game.cleanTitle,
        cleanTitle: game.cleanTitle,
        coverUrl: game.coverUrl,
        fileSize: game.fileSize,
        isInstalled: false,
        playTimeMinutes: 0,
        addedAt: new Date().toISOString(),
        status: 'ready'
      };
      libraryService.addGame(newItem);
      setLibraryEntry(newItem);
    }
  };

  const handleLaunchGame = () => {
    if (libraryEntry) {
      libraryService.launchGame(libraryEntry);
    }
  };

  const handleLaunchInstaller = () => {
    if (libraryEntry?.installerPath && typeof window !== 'undefined' && (window as any).skyApi) {
      (window as any).skyApi.launchExecutable?.(libraryEntry.installerPath);
    }
  };

  const handleSelectFolder = async () => {
    if (libraryEntry) {
      await libraryService.selectGameFolder(libraryEntry.id);
    }
  };

  const handleCopyUri = (uri: string, index: number) => {
    navigator.clipboard.writeText(uri);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="game-details-view">
      <div className="details-hero">
        <img
          src={game.bannerUrl || game.coverUrl}
          alt={game.cleanTitle}
          className="hero-img"
          onError={(e) => {
            e.currentTarget.src = coverService.generateFallbackCover(game.cleanTitle);
          }}
        />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="tags-row">
            {game.genres?.map(g => (
              <span key={g} className="genre-pill">{g}</span>
            ))}
            <span className="repack-pill">{game.repacker || 'Torrent Repack'}</span>
          </div>

          <h1 className="game-title">{game.cleanTitle}</h1>

          <div className="meta-stats-row">
            <span>
              <HardDrive size={15} />
              {game.fileSize || 'Не указан'}
            </span>
            {game.uploadDate && (
              <span>
                <Calendar size={15} />
                {new Date(game.uploadDate).toLocaleDateString('ru-RU')}
              </span>
            )}
            <span>
              <ShieldCheck size={15} color="#10b981" />
              Проверено антивирусом
            </span>
          </div>

          <div className="action-buttons-row">
            {libraryEntry?.status === 'ready' && libraryEntry.isInstalled ? (
              <button
                className="btn-download-big"
                style={{ background: '#10b981', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}
                onClick={handleLaunchGame}
              >
                <Play size={18} fill="#fff" />
                <span>Запустить игру</span>
              </button>
            ) : libraryEntry?.status === 'needs_install' ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  className="btn-download-big"
                  style={{ background: '#f59e0b', color: '#000' }}
                  onClick={handleLaunchInstaller}
                >
                  <Play size={18} fill="#000" />
                  <span>Запустить setup.exe</span>
                </button>
                <button
                  className="btn-library-toggle"
                  onClick={handleSelectFolder}
                >
                  <FolderSearch size={16} color="#38bdf8" />
                  <span>Выбрать папку игры</span>
                </button>
              </div>
            ) : (
              <button className="btn-download-big" onClick={handleDownload}>
                <Download size={18} />
                <span>Загрузить ({game.fileSize || 'Torrent'})</span>
              </button>
            )}

            <button className="btn-library-toggle" onClick={handleToggleLibrary}>
              {libraryEntry ? <BookmarkCheck size={18} color="#10b981" /> : <Bookmark size={18} />}
              <span>{libraryEntry ? 'В библиотеке' : 'В библиотеку'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Warning banner if installer detected */}
      {libraryEntry?.status === 'needs_install' && (
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={24} color="#f59e0b" />
            <div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#fbbf24', marginBottom: '2px' }}>
                Игра установилась ожидаем пока вы установите игру
              </h4>
              <p style={{ fontSize: '13px', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>
                Подождите как минимум еще 5 минут чтобы все файлы докачались и все работало нормально.
              </p>
              <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '2px' }}>
                Файлы репака успешно загружены. Запустите инсталлятор и после установки укажите целевую папку игры.
              </p>
            </div>
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '8px',
              background: '#232735',
              border: '1px solid #3d4357',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
            onClick={handleSelectFolder}
          >
            <FolderSearch size={16} color="#38bdf8" />
            <span>Выбрать папку игры</span>
          </button>
        </div>
      )}

      <div className="details-grid">
        <div className="info-card">
          <h3>Об игре</h3>
          <p>
            {game.description || `${game.cleanTitle} — полная версия игры с последними обновлениями.`}
          </p>

          <h3 style={{ marginTop: '14px' }}>Магнет ссылки и раздачи</h3>
          <div className="torrent-uris-list">
            {game.uris && game.uris.length > 0 ? (
              game.uris.map((uri, idx) => (
                <div key={idx} className="uri-item">
                  <span className="uri-link" title={uri}>{uri}</span>
                  <button
                    className="copy-btn"
                    onClick={() => handleCopyUri(uri, idx)}
                  >
                    {copiedIndex === idx ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981' }}>
                        <Check size={13} /> Скопировано
                      </span>
                    ) : (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Copy size={13} /> Скопировать Magnet
                      </span>
                    )}
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: '#64748b' }}>Прямые ссылки отсутствуют</p>
            )}
          </div>
        </div>

        <div className="info-card">
          <h3>Информация</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Оригинальное имя</span>
              <span style={{ color: '#cbd5e1' }}>{game.title}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Репакер</span>
              <span style={{ color: '#38bdf8' }}>{game.repacker}</span>
            </div>
            <div>
              <span style={{ color: '#64748b', display: 'block' }}>Статус</span>
              <span style={{ color: libraryEntry?.status === 'needs_install' ? '#fbbf24' : libraryEntry?.isInstalled ? '#10b981' : '#94a3b8' }}>
                {libraryEntry?.status === 'needs_install'
                  ? 'Ожидает установки (setup.exe)'
                  : libraryEntry?.isInstalled
                  ? 'Установлена'
                  : 'Доступна к загрузке'}
              </span>
            </div>
            {libraryEntry?.installPath && (
              <div>
                <span style={{ color: '#64748b', display: 'block' }}>Путь</span>
                <span style={{ color: '#94a3b8', fontFamily: 'monospace', fontSize: '11px', wordBreak: 'break-all' }}>
                  {libraryEntry.installPath}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
