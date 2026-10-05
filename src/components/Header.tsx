import React from 'react';
import { ArrowLeft, Search, Globe } from 'lucide-react';
import { ViewTab } from '../types';
import { i18n } from '../services/i18nService';

interface HeaderProps {
  currentTab: ViewTab;
  canGoBack: boolean;
  onGoBack: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit: () => void;
  onOpenLanguageModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  canGoBack,
  onGoBack,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onOpenLanguageModal
}) => {
  const t = i18n.t();
  const currentLang = i18n.getLanguage();

  const getTabTitle = (tab: ViewTab) => {
    switch (tab) {
      case 'home': return t.home;
      case 'catalogue': return t.catalogue;
      case 'downloads': return t.downloads;
      case 'settings': return t.settings;
      case 'game-details': return t.gameDetails;
      default: return t.home;
    }
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && (window as any).skyApi) {
      (window as any).skyApi.closeWindow?.();
    } else {
      window.close();
    }
  };

  const handleMinimize = () => {
    if (typeof window !== 'undefined' && (window as any).skyApi) {
      (window as any).skyApi.minimizeWindow?.();
    }
  };

  const handleMaximize = () => {
    if (typeof window !== 'undefined' && (window as any).skyApi) {
      (window as any).skyApi.maximizeWindow?.();
    }
  };

  const langFlag = currentLang === 'ru' ? '🇷🇺 RU' : currentLang === 'it' ? '🇮🇹 IT' : '🇬🇧 EN';

  return (
    <header className="app-header">
      <div className="header-left">
        <div className="traffic-lights">
          <div className="dot red" onClick={handleClose} title="Закрыть" />
          <div className="dot yellow" onClick={handleMinimize} title="Свернуть" />
          <div className="dot green" onClick={handleMaximize} title="Развернуть" />
        </div>

        <div className="nav-breadcrumbs">
          <button 
            className="back-btn" 
            onClick={onGoBack} 
            disabled={!canGoBack}
            title="Назад"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="page-title">{getTabTitle(currentTab)}</span>
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="search-container">
          <Search className="search-icon" size={15} />
          <input
            type="text"
            className="search-input"
            placeholder={t.searchGames}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSearchSubmit();
            }}
          />
        </div>

        {onOpenLanguageModal && (
          <button
            type="button"
            onClick={onOpenLanguageModal}
            title="Выбор языка / Language / Lingua"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#191b26',
              border: '1px solid #282a3c',
              borderRadius: '8px',
              padding: '6px 12px',
              color: '#cbd5e1',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Globe size={14} color="#ff5252" />
            <span>{langFlag}</span>
          </button>
        )}
      </div>
    </header>
  );
};
