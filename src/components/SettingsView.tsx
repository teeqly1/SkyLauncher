import React, { useState, useEffect } from 'react';
import {
  Link2, Plus, Sparkles, Trash2, RefreshCw, CheckCircle,
  Cpu, HardDrive, Shield, DownloadCloud, FolderOpen,
  Sliders, AlertTriangle, Radio, PlayCircle, X, Globe
} from 'lucide-react';
import { HydraSource } from '../types';
import { catalogService, OFFICIAL_SOURCE_URL } from '../services/catalogService';
import { settingsService, LauncherSettings } from '../services/settingsService';
import { i18n, Language } from '../services/i18nService';

interface SettingsViewProps {
  onSourcesUpdated: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onSourcesUpdated }) => {
  const [activeCategory, setActiveCategory] = useState<'sources' | 'installation' | 'network' | 'system'>('sources');
  const [sources, setSources] = useState<HydraSource[]>([]);
  const [settings, setSettings] = useState<LauncherSettings>(settingsService.getSettings());
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [, setLangVersion] = useState(0);

  // Warning Modal for experimental auto-install feature
  const [showAutoInstallWarning, setShowAutoInstallWarning] = useState(false);

  useEffect(() => {
    setSources(catalogService.getSources());
    const unsub = settingsService.subscribe(() => {
      setSettings({ ...settingsService.getSettings() });
    });
    const unsubLang = i18n.subscribe(() => {
      setLangVersion(v => v + 1);
    });
    return () => {
      unsub();
      unsubLang();
    };
  }, []);

  const t = i18n.t();

  const refreshSources = () => {
    setSources([...catalogService.getSources()]);
    onSourcesUpdated();
  };

  const handleAddOfficial = async () => {
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await catalogService.addOfficialSources();
      if (res.success) {
        setStatusMessage({
          text: `Официальные ссылки добавлены! Загружено игр: ${res.count}`,
          type: 'success'
        });
        refreshSources();
      } else {
        setStatusMessage({
          text: res.error || 'Ошибка при добавлении официальных ссылок',
          type: 'error'
        });
      }
    } catch (e: any) {
      setStatusMessage({ text: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await catalogService.addSource(newUrl);
      if (res.success) {
        setStatusMessage({
          text: `Источник добавлен! Загружено игр: ${res.count}`,
          type: 'success'
        });
        setNewUrl('');
        refreshSources();
      } else {
        setStatusMessage({
          text: res.error || 'Ошибка при добавлении источника',
          type: 'error'
        });
      }
    } catch (e: any) {
      setStatusMessage({ text: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSource = async (id: string) => {
    await catalogService.removeSource(id);
    setStatusMessage({ text: 'Источник удален', type: 'success' });
    refreshSources();
  };

  const handleBrowseDir = async () => {
    const chosen = await settingsService.browseDownloadDir();
    if (chosen) {
      setStatusMessage({ text: `Папка установки изменена на: ${chosen}`, type: 'success' });
    }
  };

  const handleToggleAutoInstall = () => {
    if (!settings.autoSilentInstall) {
      // Show warning modal before enabling
      setShowAutoInstallWarning(true);
    } else {
      // Turn off directly
      settingsService.updateSettings({ autoSilentInstall: false });
    }
  };

  const confirmEnableAutoInstall = () => {
    settingsService.updateSettings({ autoSilentInstall: true });
    setShowAutoInstallWarning(false);
    setStatusMessage({ text: 'Экспериментальная функция «Автоматически пройти setup.exe» включена!', type: 'success' });
  };

  return (
    <div className="settings-view">
      <div className="settings-header">
        <h2>{t.settingsTitle}</h2>
        <p>{t.settingsDesc}</p>
      </div>

      {/* Categories Bar */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #282a38', paddingBottom: '12px', flexWrap: 'wrap' }}>
        <button
          className={`tab-pill ${activeCategory === 'sources' ? 'active' : ''}`}
          onClick={() => setActiveCategory('sources')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeCategory === 'sources' ? '#262938' : '#181920',
            border: `1px solid ${activeCategory === 'sources' ? '#ff5252' : '#282a38'}`,
            color: activeCategory === 'sources' ? '#fff' : '#94a3b8',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Link2 size={16} color="#ff5252" />
          <span>{t.tabSources}</span>
        </button>

        <button
          className={`tab-pill ${activeCategory === 'installation' ? 'active' : ''}`}
          onClick={() => setActiveCategory('installation')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeCategory === 'installation' ? '#262938' : '#181920',
            border: `1px solid ${activeCategory === 'installation' ? '#38bdf8' : '#282a38'}`,
            color: activeCategory === 'installation' ? '#fff' : '#94a3b8',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <HardDrive size={16} color="#38bdf8" />
          <span>{t.tabInstallation}</span>
        </button>

        <button
          className={`tab-pill ${activeCategory === 'network' ? 'active' : ''}`}
          onClick={() => setActiveCategory('network')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeCategory === 'network' ? '#262938' : '#181920',
            border: `1px solid ${activeCategory === 'network' ? '#10b981' : '#282a38'}`,
            color: activeCategory === 'network' ? '#fff' : '#94a3b8',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Shield size={16} color="#10b981" />
          <span>{t.tabNetwork}</span>
        </button>

        <button
          className={`tab-pill ${activeCategory === 'system' ? 'active' : ''}`}
          onClick={() => setActiveCategory('system')}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            background: activeCategory === 'system' ? '#262938' : '#181920',
            border: `1px solid ${activeCategory === 'system' ? '#fbbf24' : '#282a38'}`,
            color: activeCategory === 'system' ? '#fff' : '#94a3b8',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Cpu size={16} color="#fbbf24" />
          <span>{t.tabSystem}</span>
        </button>
      </div>

      {statusMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: statusMessage.type === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${statusMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: statusMessage.type === 'success' ? '#34d399' : '#f87171'
          }}
        >
          {statusMessage.type === 'success' && <CheckCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* CATEGORY 1: Ссылки */}
      {activeCategory === 'sources' && (
        <div className="settings-section-card">
          <div className="section-header-row">
            <div className="title-group">
              <Link2 className="icon" />
              <h3>Источники ссылок каталога (Hydra Links)</h3>
            </div>

            <button
              className="btn-add-official"
              onClick={handleAddOfficial}
              disabled={loading}
            >
              <Sparkles size={16} />
              <span>Добавить офф ссылки</span>
            </button>
          </div>

          <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5' }}>
            Подключите ссылки на базы раздач. При нажатии «Добавить офф ссылки» загружается официальный каталог Igruha
            с более чем 14,300 играми.
          </p>

          <form className="add-source-form" onSubmit={handleAddCustom}>
            <input
              type="text"
              placeholder="Вставьте URL JSON-источника..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn-add-custom" disabled={loading || !newUrl.trim()}>
              <Plus size={16} />
              <span>{loading ? 'Загрузка...' : 'Добавить ссылку'}</span>
            </button>
          </form>

          <div className="sources-list">
            {sources.map((src) => (
              <div key={src.id} className="source-item">
                <div className="source-meta">
                  <div className="source-title-row">
                    <span className="source-name">{src.name}</span>
                    {src.url === OFFICIAL_SOURCE_URL && (
                      <span className="official-badge">ОФИЦИАЛЬНЫЙ</span>
                    )}
                    <span className="count-badge">{src.downloadsCount} игр</span>
                  </div>
                  <div className="source-url" title={src.url}>{src.url}</div>
                </div>

                <div className="source-actions">
                  <button
                    className="btn-icon"
                    title="Обновить каталог"
                    onClick={() => refreshSources()}
                  >
                    <RefreshCw size={15} />
                  </button>
                  <button
                    className="btn-icon btn-delete"
                    title="Удалить источник"
                    onClick={() => handleRemoveSource(src.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}

            {sources.length === 0 && (
              <div className="no-sources-hint">
                Источники не добавлены. Нажмите «Добавить офф ссылки» выше для появления каталога.
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATEGORY 2: Установка */}
      {activeCategory === 'installation' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Путь установки */}
          <div className="settings-section-card">
            <div className="section-header-row">
              <div className="title-group">
                <HardDrive className="icon" />
                <h3>Путь установки</h3>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              Выберите папку на диске, куда по умолчанию будут загружаться и устанавливаться игры.
            </p>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                readOnly
                value={settings.downloadDir}
                style={{
                  flex: 1,
                  backgroundColor: '#13141a',
                  border: '1px solid #282b3a',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#fff',
                  fontFamily: 'monospace',
                  fontSize: '13px'
                }}
              />
              <button
                className="btn-add-custom"
                onClick={handleBrowseDir}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FolderOpen size={16} />
                <span>Обзор...</span>
              </button>
            </div>
          </div>

          {/* Функция: Автоматически пройти setup.exe */}
          <div className="settings-section-card">
            <div className="section-header-row">
              <div className="title-group">
                <PlayCircle className="icon" color="#fbbf24" />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3>Автоматически пройти setup.exe</h3>
                    <span style={{ fontSize: '10px', fontWeight: 800, background: 'rgba(251, 191, 36, 0.2)', color: '#fbbf24', padding: '2px 6px', borderRadius: '4px' }}>
                      ТЕСТОВАЯ ФУНКЦИЯ
                    </span>
                  </div>
                </div>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={settings.autoSilentInstall}
                  onChange={handleToggleAutoInstall}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: settings.autoSilentInstall ? '#10b981' : '#334155',
                    borderRadius: '26px',
                    transition: '0.2s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: settings.autoSilentInstall ? '24px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.2s'
                    }}
                  />
                </span>
              </label>
            </div>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.6' }}>
              Запускает инсталлятор (setup.exe) в фоновом режиме, автоматически подтверждает шаги установки,
              анализирует процент распаковки файлов и производит установку игры без вашего участия.
            </p>

            {settings.autoSilentInstall && (
              <div style={{ padding: '10px 14px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} />
                <span>Функция активна. После скачивания торрента установщик автоматически пройдёт все этапы в фоне.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CATEGORY 3: Сеть и обход блокировок */}
      {activeCategory === 'network' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="settings-section-card">
            <div className="section-header-row">
              <div className="title-group">
                <Shield className="icon" />
                <h3>Обход блокировок трекеров (ISP & DPI Bypass)</h3>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
                  Автоматическая инъекция глобальных трекеров
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Добавляет 10+ резервных скоростных трекеров в каждую магнет-ссылку для мгновенного нахождения пиров при блокировках.
                </div>
              </div>

              <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px' }}>
                <input
                  type="checkbox"
                  checked={settings.bypassTrackers}
                  onChange={(e) => settingsService.updateSettings({ bypassTrackers: e.target.checked })}
                  style={{ opacity: 0, width: 0, height: 0 }}
                />
                <span
                  style={{
                    position: 'absolute',
                    cursor: 'pointer',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: settings.bypassTrackers ? '#10b981' : '#334155',
                    borderRadius: '26px',
                    transition: '0.2s'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      content: '""',
                      height: '20px',
                      width: '20px',
                      left: settings.bypassTrackers ? '24px' : '3px',
                      bottom: '3px',
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      transition: '0.2s'
                    }}
                  />
                </span>
              </label>
            </div>
          </div>

          <div className="settings-section-card">
            <div className="section-header-row">
              <div className="title-group">
                <Sliders className="icon" />
                <h3>Режим скачивания</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              <div
                onClick={() => settingsService.updateSettings({ clientMode: 'internal' })}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: settings.clientMode === 'internal' ? 'rgba(56, 189, 248, 0.1)' : '#14151b',
                  border: `1px solid ${settings.clientMode === 'internal' ? '#38bdf8' : '#242735'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>Встроенный клиент SkyLauncher</span>
                  <Radio size={16} color={settings.clientMode === 'internal' ? '#38bdf8' : '#64748b'} />
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Фоновая загрузка внутри лаунчера с прогрессом и авто-прохождением setup.exe.
                </p>
              </div>

              <div
                onClick={() => settingsService.updateSettings({ clientMode: 'external' })}
                style={{
                  padding: '14px',
                  borderRadius: '8px',
                  background: settings.clientMode === 'external' ? 'rgba(56, 189, 248, 0.1)' : '#14151b',
                  border: `1px solid ${settings.clientMode === 'external' ? '#38bdf8' : '#242735'}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700, color: '#fff', fontSize: '14px' }}>Внешний торрент-клиент</span>
                  <Radio size={16} color={settings.clientMode === 'external' ? '#38bdf8' : '#64748b'} />
                </div>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Передача ссылки в qBittorrent или uTorrent.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: Система */}
      {activeCategory === 'system' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="engine-status-box">
            <div className="engine-info">
              <div className="engine-icon">
                <Cpu size={20} />
              </div>
              <div className="engine-text">
                <h4>SkyEngine Standalone (Rust + C++ + ESM Core)</h4>
                <p>Автономный лаунчер без аккаунтов, прямая работа с WinAPI</p>
              </div>
            </div>
            <span className="engine-tag">ГОТОВ К РАБОТЕ</span>
          </div>

          <div className="settings-section-card">
            <div className="section-header-row">
              <div className="title-group">
                <Globe className="icon" color="#38bdf8" />
                <h3>{t.selectLanguageTitle}</h3>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              {t.selectLanguageDesc}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
              {[
                { code: 'en' as Language, name: 'Английский', native: 'English', flag: '🇬🇧' },
                { code: 'ru' as Language, name: 'Русский', native: 'Русский', flag: '🇷🇺' },
                { code: 'it' as Language, name: 'Итальянский', native: 'Italiano', flag: '🇮🇹' },
              ].map(item => {
                const isSelected = i18n.getLanguage() === item.code;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => i18n.setLanguage(item.code)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '8px',
                      background: isSelected ? 'rgba(56, 189, 248, 0.15)' : '#13141a',
                      border: `1px solid ${isSelected ? '#38bdf8' : '#232734'}`,
                      color: '#fff',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>{item.flag}</span>
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{item.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{item.native}</div>
                      </div>
                    </div>
                    {isSelected && <CheckCircle size={16} color="#38bdf8" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="settings-section-card">
            <h3 style={{ fontSize: '16px', color: '#fff', marginBottom: '8px' }}>Параметры окружения</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', fontSize: '13px' }}>
              <div style={{ background: '#13141a', padding: '12px', borderRadius: '6px', border: '1px solid #232734' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Платформа</span>
                <span style={{ color: '#f1f5f9', fontWeight: 600 }}>Windows (x64)</span>
              </div>
              <div style={{ background: '#13141a', padding: '12px', borderRadius: '6px', border: '1px solid #232734' }}>
                <span style={{ color: '#64748b', display: 'block' }}>Авто-установщик</span>
                <span style={{ color: settings.autoSilentInstall ? '#10b981' : '#64748b', fontWeight: 600 }}>
                  {settings.autoSilentInstall ? 'Активен' : 'Отключен'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Warning for "Автоматически пройти setup.exe" */}
      {showAutoInstallWarning && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#181921',
              border: '1px solid #383c50',
              borderRadius: '14px',
              maxWidth: '520px',
              width: '100%',
              padding: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.8)',
              animation: 'pageFadeIn 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(251, 191, 36, 0.15)',
                  border: '1px solid rgba(251, 191, 36, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  flexShrink: 0
                }}
              >
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                  {t.warningModalTitle}
                </h3>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {t.autoSetupTitle}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '14px', color: '#cbd5e1', lineHeight: '1.6' }}>
              {t.warningModalDesc}
            </p>

            <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.5' }}>
              {t.warningModalDetails}
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button
                onClick={() => setShowAutoInstallWarning(false)}
                style={{
                  padding: '10px 18px',
                  borderRadius: '8px',
                  background: '#232734',
                  border: '1px solid #363b4e',
                  color: '#cbd5e1',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {t.btnCancel}
              </button>

              <button
                onClick={confirmEnableAutoInstall}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  background: '#f59e0b',
                  color: '#000',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
                }}
              >
                {t.btnEnableTestMode}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
