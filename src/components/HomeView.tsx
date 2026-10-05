import React, { useState, useEffect } from 'react';
import { AlertCircle, Flame, Calendar, Trophy, Sparkles, Download, ArrowRight } from 'lucide-react';
import { GameItem } from '../types';
import { catalogService } from '../services/catalogService';
import { downloadService } from '../services/downloadService';
import { coverService } from '../services/coverService';
import { i18n } from '../services/i18nService';

interface HomeViewProps {
  hasSources: boolean;
  onNavigateToSettings: () => void;
  onSelectGame: (game: GameItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  hasSources,
  onNavigateToSettings,
  onSelectGame
}) => {
  const [activeTab, setActiveTab] = useState<'hot' | 'week' | 'beat'>('hot');
  const [featuredGame, setFeaturedGame] = useState<GameItem | null>(null);
  const [gamesList, setGamesList] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(false);
  const t = i18n.t();

  useEffect(() => {
    if (hasSources) {
      setLoading(true);
      catalogService.getGames().then(games => {
        setFeaturedGame(catalogService.getFeaturedGame());
        setGamesList(catalogService.getHotGames());
        setLoading(false);
      });
    }
  }, [hasSources]);

  const handleSurpriseMe = () => {
    if (gamesList.length === 0) return;
    const randomGame = gamesList[Math.floor(Math.random() * gamesList.length)];
    onSelectGame(randomGame);
  };

  const handleQuickDownload = (e: React.MouseEvent, game: GameItem) => {
    e.stopPropagation();
    downloadService.addDownload(game);
  };

  if (!hasSources) {
    return (
      <div className="home-view">
        <div className="no-sources-banner">
          <div className="warning-icon-wrapper">
            <AlertCircle size={36} />
          </div>
          <h2 className="warning-title">
            {t.noSourcesTitle}
          </h2>
          <p className="warning-desc">
            {t.noSourcesDesc}
          </p>
          <button className="settings-btn" onClick={onNavigateToSettings}>
            <span>{t.goToSettings}</span>
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home-view">
      {/* Featured Banner */}
      {featuredGame && (
        <section className="featured-section">
          <img
            src={featuredGame.bannerUrl || featuredGame.coverUrl}
            alt={featuredGame.cleanTitle}
            className="featured-backdrop"
            onError={(e) => {
              e.currentTarget.src = coverService.generateFallbackCover(featuredGame.cleanTitle);
            }}
          />
          <div className="featured-overlay" />
          <div className="featured-content">
            <span className="featured-tag">{t.featured}</span>
            <h1 className="featured-title">{featuredGame.cleanTitle}</h1>
            <p className="featured-description">
              {featuredGame.description || 'Погрузитесь в захватывающее одиночное приключение с непревзойденной графикой и сюжетом.'}
            </p>
            <div className="featured-actions">
              <button
                className="btn-download-hero"
                onClick={(e) => handleQuickDownload(e, featuredGame)}
              >
                <Download size={16} />
                <span>{t.quickDownload} ({featuredGame.fileSize || 'Torrent'})</span>
              </button>
              <button
                className="btn-details-hero"
                onClick={() => onSelectGame(featuredGame)}
              >
                <span>{t.details}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tabs */}
      <div className="home-tabs-bar">
        <div className="tabs-group">
          <button
            className={`tab-pill ${activeTab === 'hot' ? 'active' : ''}`}
            onClick={() => setActiveTab('hot')}
          >
            <Flame size={15} color="#ff5252" />
            <span>{t.hotNow}</span>
          </button>
          <button
            className={`tab-pill ${activeTab === 'week' ? 'active' : ''}`}
            onClick={() => setActiveTab('week')}
          >
            <Calendar size={15} color="#38bdf8" />
            <span>{t.topWeek}</span>
          </button>
          <button
            className={`tab-pill ${activeTab === 'beat' ? 'active' : ''}`}
            onClick={() => setActiveTab('beat')}
          >
            <Trophy size={15} color="#fbbf24" />
            <span>{t.gamesToBeat}</span>
          </button>
        </div>

        <button className="surprise-pill" onClick={handleSurpriseMe}>
          <Sparkles size={15} />
          <span>{t.surpriseMe}</span>
        </button>
      </div>

      {/* Hot Now Section */}
      <section className="content-section">
        <h2 className="section-title">
          <span>{t.hotNow}</span>
        </h2>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            {t.loadingCatalog}
          </div>
        ) : (
          <div className="games-grid">
            {gamesList.map((game) => (
              <div
                key={game.id}
                className="game-card"
                onClick={() => onSelectGame(game)}
              >
                <div className="card-image-wrap">
                  <img
                    src={game.coverUrl}
                    alt={game.cleanTitle}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = coverService.generateFallbackCover(game.cleanTitle);
                    }}
                  />
                  <span className="card-badge">{game.fileSize || 'Rip'}</span>
                </div>
                <div className="card-content">
                  <div className="card-title" title={game.title}>
                    {game.cleanTitle}
                  </div>
                  <div className="card-repacker">{game.repacker}</div>
                  <div className="card-footer">
                    <span className="card-size">{game.fileSize || 'N/A'}</span>
                    <button
                      className="card-action-btn"
                      onClick={(e) => handleQuickDownload(e, game)}
                    >
                      {t.quickDownload}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
