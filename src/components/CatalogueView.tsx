import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { GameItem } from '../types';
import { catalogService } from '../services/catalogService';
import { downloadService } from '../services/downloadService';
import { coverService } from '../services/coverService';
import { i18n } from '../services/i18nService';

interface CatalogueViewProps {
  onSelectGame: (game: GameItem) => void;
  externalSearch?: string;
}

const ITEMS_PER_PAGE = 24;

export const CatalogueView: React.FC<CatalogueViewProps> = ({
  onSelectGame,
  externalSearch = ''
}) => {
  const [games, setGames] = useState<GameItem[]>([]);
  const [search, setSearch] = useState(externalSearch);
  const [sortBy, setSortBy] = useState<'title' | 'size' | 'date'>('title');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const t = i18n.t();

  useEffect(() => {
    if (externalSearch) {
      setSearch(externalSearch);
    }
  }, [externalSearch]);

  useEffect(() => {
    setLoading(true);
    catalogService.getGames().then(res => {
      setGames(res);
      setLoading(false);
    });
  }, []);

  const filteredGames = useMemo(() => {
    let result = games;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(g =>
        g.cleanTitle.toLowerCase().includes(q) ||
        g.title.toLowerCase().includes(q) ||
        (g.repacker && g.repacker.toLowerCase().includes(q))
      );
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'title') {
        return a.cleanTitle.localeCompare(b.cleanTitle);
      }
      if (sortBy === 'date') {
        return (b.uploadDate || '').localeCompare(a.uploadDate || '');
      }
      return 0;
    });
  }, [games, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredGames.length / ITEMS_PER_PAGE));
  const currentSlice = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredGames.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredGames, currentPage]);

  const handleQuickDownload = (e: React.MouseEvent, game: GameItem) => {
    e.stopPropagation();
    downloadService.addDownload(game);
  };

  return (
    <div className="catalogue-view">
      <div className="catalogue-header">
        <div className="header-info">
          <h2>{t.catalogue}</h2>
          <p>
            {loading
              ? t.loadingCatalog
              : `${t.gamesFound} ${filteredGames.length}`}
          </p>
        </div>

        <div className="catalogue-controls">
          <select
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="title">{t.sortTitle}</option>
            <option value="date">{t.sortDate}</option>
          </select>
        </div>
      </div>

      <div className="catalog-search-bar">
        <Search className="search-icon" />
        <input
          type="text"
          placeholder={`${t.searchGames}...`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
          {t.loadingCatalog}
        </div>
      ) : filteredGames.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>
          {t.noGamesFound}
        </div>
      ) : (
        <>
          <div className="catalogue-grid">
            {currentSlice.map((game) => (
              <div
                key={game.id}
                className="catalog-card"
                onClick={() => onSelectGame(game)}
              >
                <div className="card-cover">
                  <img
                    src={game.coverUrl}
                    alt={game.cleanTitle}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.src = coverService.generateFallbackCover(game.cleanTitle);
                    }}
                  />
                  <span className="repack-pill">{game.repacker}</span>
                </div>
                <div className="card-details">
                  <span className="card-name" title={game.title}>
                    {game.cleanTitle}
                  </span>
                  <div className="card-meta">
                    <span className="size">{game.fileSize || 'N/A'}</span>
                    <button
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        background: 'rgba(255, 82, 82, 0.1)',
                        color: '#ff5252',
                        fontSize: '11px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                      onClick={(e) => handleQuickDownload(e, game)}
                    >
                      <Download size={11} />
                      <span>{t.quickDownload}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination-container">
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              >
                <ChevronLeft size={16} />
              </button>

              <span style={{ fontSize: '13px', color: '#94a3b8', margin: '0 8px' }}>
                {t.pageOf} {currentPage} / {totalPages}
              </span>

              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
