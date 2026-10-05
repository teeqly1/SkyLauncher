import React, { useState, useEffect } from 'react';
import {
  Home, LayoutGrid, Download, Settings, MessageSquareCode,
  PlusCircle, Trash2, FolderOpen, Play, X
} from 'lucide-react';
import { ViewTab, LibraryItem } from '../types';
import { libraryService } from '../services/libraryService';
import { downloadService } from '../services/downloadService';
import { coverService } from '../services/coverService';
import { i18n } from '../services/i18nService';

interface SidebarProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  onSelectLibraryGame?: (game: LibraryItem) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onSelectLibraryGame
}) => {
  const [libraryFilter, setLibraryFilter] = useState('');
  const [libraryGames, setLibraryGames] = useState<LibraryItem[]>([]);
  const [activeDownloadsCount, setActiveDownloadsCount] = useState(0);
  const [, setLangVersion] = useState(0);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; item: LibraryItem } | null>(null);

  useEffect(() => {
    setLibraryGames(libraryService.getLibrary());
    const unsubLib = libraryService.subscribe(() => {
      setLibraryGames(libraryService.getLibrary());
    });

    const unsubLang = i18n.subscribe(() => {
      setLangVersion(v => v + 1);
    });

    const updateDlCount = () => {
      const active = downloadService.getDownloads().filter(d => d.status === 'downloading').length;
      setActiveDownloadsCount(active);
    };
    updateDlCount();
    const unsubDl = downloadService.subscribe(updateDlCount);

    const handleGlobalClick = () => setContextMenu(null);
    window.addEventListener('click', handleGlobalClick);

    return () => {
      unsubLib();
      unsubDl();
      unsubLang();
      window.removeEventListener('click', handleGlobalClick);
    };
  }, []);

  const t = i18n.t();

  const filteredLibrary = libraryGames.filter(g =>
    g.title.toLowerCase().includes(libraryFilter.toLowerCase())
  );

  const handleContextMenu = (e: React.MouseEvent, item: LibraryItem) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const handleRemoveGame = (id: string) => {
    libraryService.removeGame(id);
    setContextMenu(null);
  };

  const handleLaunchGame = (item: LibraryItem) => {
    libraryService.launchGame(item);
    setContextMenu(null);
  };

  const handleOpenFolder = (item: LibraryItem) => {
    if (item.installPath && typeof window !== 'undefined' && (window as any).skyApi?.openPath) {
      (window as any).skyApi.openPath(item.installPath);
    }
    setContextMenu(null);
  };

  const handleAddLocalGame = async () => {
    if (typeof window !== 'undefined' && (window as any).skyApi?.selectGameFolder) {
      const res = await (window as any).skyApi.selectGameFolder();
      if (res && res.folderPath) {
        const folderName = res.folderPath.split(/[\\/]/).filter(Boolean).pop() || 'Локальная игра';
        const cover = coverService.getCoverForGame(folderName).coverUrl;

        libraryService.addGame({
          id: 'local_' + Date.now(),
          title: folderName,
          cleanTitle: folderName,
          coverUrl: cover,
          isInstalled: true,
          installPath: res.folderPath,
          mainExePath: res.mainExe,
          status: 'ready',
          playTimeMinutes: 0,
          addedAt: new Date().toISOString()
        });
      }
    }
  };

  return (
    <aside className="sidebar">
      {/* Brand Header (Autonomous / No Accounts) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px 14px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <div style={{
          width: '34px',
          height: '34px',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #ff5252, #ff7b7b)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 800,
          fontSize: '16px',
          boxShadow: '0 2px 10px rgba(255, 82, 82, 0.3)'
        }}>
          S
        </div>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.3px' }}>
            SkyLauncher
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
            Standalone Edition
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="nav-menu">
        <button
          className={`nav-item ${currentTab === 'home' ? 'active' : ''}`}
          onClick={() => onSelectTab('home')}
        >
          <Home className="nav-icon" />
          <span>{t.home}</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'catalogue' ? 'active' : ''}`}
          onClick={() => onSelectTab('catalogue')}
        >
          <LayoutGrid className="nav-icon" />
          <span>{t.catalogue}</span>
        </button>

        <button
          className={`nav-item ${currentTab === 'downloads' ? 'active' : ''}`}
          onClick={() => onSelectTab('downloads')}
        >
          <Download className="nav-icon" />
          <span>{t.downloads}</span>
          {activeDownloadsCount > 0 && (
            <span className="badge">{activeDownloadsCount}</span>
          )}
        </button>

        <button
          className={`nav-item ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => onSelectTab('settings')}
        >
          <Settings className="nav-icon" />
          <span>{t.settings}</span>
        </button>
      </nav>

      {/* Library Section */}
      <div className="library-section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: '4px' }}>
          <div className="library-header">{t.myLibrary}</div>
          <button
            onClick={handleAddLocalGame}
            title={t.addLocalGame}
            style={{ color: '#64748b', cursor: 'pointer', marginBottom: '8px' }}
          >
            <PlusCircle size={14} />
          </button>
        </div>

        <div className="library-filter-wrapper">
          <input
            type="text"
            placeholder={t.filterLibrary}
            value={libraryFilter}
            onChange={(e) => setLibraryFilter(e.target.value)}
          />
        </div>

        <div className="library-list">
          {filteredLibrary.map((item) => {
            const fallbackArt = coverService.generateFallbackCover(item.title);

            return (
              <div
                key={item.id}
                className="library-item"
                onClick={() => onSelectLibraryGame?.(item)}
                onContextMenu={(e) => handleContextMenu(e, item)}
                title={`${item.title} (${t.launchGame})`}
              >
                <img
                  src={item.coverUrl || fallbackArt}
                  alt={item.title}
                  className="game-icon"
                  onError={(e) => {
                    e.currentTarget.src = fallbackArt;
                  }}
                />
                <span className="game-title" style={{ flex: 1 }}>{item.title}</span>
                {item.status === 'needs_install' && (
                  <span
                    style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      color: '#fbbf24',
                      background: 'rgba(251, 191, 36, 0.15)',
                      padding: '1px 5px',
                      borderRadius: '4px'
                    }}
                  >
                    Setup
                  </span>
                )}
              </div>
            );
          })}

          {libraryGames.length === 0 && (
            <div style={{ padding: '24px 10px', fontSize: '12px', color: '#64748b', textAlign: 'center', lineHeight: '1.5', whiteSpace: 'pre-line' }}>
              {t.emptyLibrary}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <button className="help-button" onClick={() => onSelectTab('settings')}>
          <MessageSquareCode className="help-icon" />
          <span>{t.needHelp}</span>
        </button>
      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
            backgroundColor: '#1b1d26',
            border: '1px solid #363b4f',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.7)',
            padding: '5px',
            zIndex: 99999,
            minWidth: '190px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            animation: 'pageFadeIn 0.15s ease'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ padding: '6px 10px', fontSize: '11px', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 600 }}>
            {contextMenu.item.title.length > 20 ? contextMenu.item.title.slice(0, 18) + '...' : contextMenu.item.title}
          </div>

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              color: '#f8fafc',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onClick={() => handleLaunchGame(contextMenu.item)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Play size={14} color="#10b981" />
            <span>{t.launchGame}</span>
          </button>

          {contextMenu.item.installPath && (
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 10px',
                borderRadius: '6px',
                color: '#f8fafc',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left'
              }}
              onClick={() => handleOpenFolder(contextMenu.item)}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <FolderOpen size={14} color="#38bdf8" />
              <span>{t.openFolder}</span>
            </button>
          )}

          <button
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              color: '#f87171',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              textAlign: 'left'
            }}
            onClick={() => handleRemoveGame(contextMenu.item.id)}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Trash2 size={14} color="#ef4444" />
            <span>{t.removeFromLibrary}</span>
          </button>
        </div>
      )}
    </aside>
  );
};
