import React, { useState, useEffect } from 'react';
import { ViewTab, GameItem, LibraryItem } from './types';
import { catalogService } from './services/catalogService';
import { i18n } from './services/i18nService';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { StatusBar } from './components/StatusBar';
import { HomeView } from './components/HomeView';
import { CatalogueView } from './components/CatalogueView';
import { DownloadsView } from './components/DownloadsView';
import { SettingsView } from './components/SettingsView';
import { GameDetailsView } from './components/GameDetailsView';
import { LanguageSelectModal } from './components/LanguageSelectModal';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ViewTab>('home');
  const [history, setHistory] = useState<ViewTab[]>(['home']);
  const [hasSources, setHasSources] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showLanguageModal, setShowLanguageModal] = useState<boolean>(!i18n.hasChosenLanguage());
  const [, setLangVersion] = useState(0);

  useEffect(() => {
    setHasSources(catalogService.hasSources());
    const unsubLang = i18n.subscribe(() => {
      setLangVersion(v => v + 1);
    });
    return unsubLang;
  }, []);

  const navigateTo = (tab: ViewTab) => {
    setCurrentTab(tab);
    setHistory((prev) => [...prev, tab]);
  };

  const handleGoBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop(); // remove current
      const prevTab = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      setCurrentTab(prevTab);
    }
  };

  const handleSelectGame = (game: GameItem) => {
    setSelectedGame(game);
    navigateTo('game-details');
  };

  const handleSelectLibraryGame = async (libGame: LibraryItem) => {
    // Find matching game in catalog or create on the fly
    const games = await catalogService.getGames();
    const found = games.find(g => g.cleanTitle.toLowerCase() === libGame.cleanTitle.toLowerCase());
    if (found) {
      handleSelectGame(found);
    } else {
      handleSelectGame({
        id: libGame.id,
        title: libGame.title,
        cleanTitle: libGame.cleanTitle,
        uris: [],
        fileSize: libGame.fileSize,
        coverUrl: libGame.coverUrl,
        bannerUrl: libGame.coverUrl,
        repacker: 'Installed',
        description: `${libGame.cleanTitle} установлена в вашей библиотеке.`
      });
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigateTo('catalogue');
    }
  };

  return (
    <div className="app-container">
      <Header
        currentTab={currentTab}
        canGoBack={history.length > 1}
        onGoBack={handleGoBack}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onOpenLanguageModal={() => setShowLanguageModal(true)}
      />

      <div className="app-body">
        <Sidebar
          currentTab={currentTab}
          onSelectTab={navigateTo}
          onSelectLibraryGame={handleSelectLibraryGame}
        />

        <main className="main-content">
          <div className="page-container">
            {currentTab === 'home' && (
              <HomeView
                hasSources={hasSources}
                onNavigateToSettings={() => navigateTo('settings')}
                onSelectGame={handleSelectGame}
              />
            )}

            {currentTab === 'catalogue' && (
              <CatalogueView
                onSelectGame={handleSelectGame}
                externalSearch={searchQuery}
              />
            )}

            {currentTab === 'downloads' && <DownloadsView />}

            {currentTab === 'settings' && (
              <SettingsView
                onSourcesUpdated={() => setHasSources(catalogService.hasSources())}
              />
            )}

            {currentTab === 'game-details' && selectedGame && (
              <GameDetailsView game={selectedGame} />
            )}
          </div>
        </main>
      </div>

      <StatusBar />

      <LanguageSelectModal
        isOpen={showLanguageModal}
        onClose={() => setShowLanguageModal(false)}
      />
    </div>
  );
};

export default App;
