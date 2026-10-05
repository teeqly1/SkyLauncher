import React, { useState } from 'react';
import { Globe, Check, ArrowRight } from 'lucide-react';
import { i18n, Language } from '../services/i18nService';

interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  description: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    name: 'Английский',
    nativeName: 'English',
    flag: '🇬🇧',
    description: 'Interface, catalog and system texts in English'
  },
  {
    code: 'ru',
    name: 'Русский',
    nativeName: 'Русский',
    flag: '🇷🇺',
    description: 'Интерфейс, каталог и системные уведомления на русском'
  },
  {
    code: 'it',
    name: 'Итальянский',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    description: 'Interfaccia, catalogo e testi di sistema in italiano'
  }
];

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({ isOpen, onClose }) => {
  const [selectedLang, setSelectedLang] = useState<Language>(i18n.getLanguage());

  if (!isOpen) return null;

  const handleSelectLanguage = (lang: Language) => {
    setSelectedLang(lang);
    i18n.setLanguage(lang);
  };

  const handleConfirm = () => {
    i18n.setLanguage(selectedLang);
    i18n.markLanguageChosen();
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(5, 7, 13, 0.88)',
      backdropFilter: 'blur(10px)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      animation: 'fadeIn 0.25s ease'
    }}>
      <div style={{
        background: 'linear-gradient(180deg, #181a24 0%, #12131a 100%)',
        border: '1px solid #2b2e40',
        boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(255, 82, 82, 0.15)',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '520px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        color: '#fff'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'rgba(255, 82, 82, 0.12)',
            border: '1px solid rgba(255, 82, 82, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#ff5252'
          }}>
            <Globe size={28} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px', letterSpacing: '-0.3px' }}>
            Выберите язык / Select Language
          </h2>
          <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0, lineHeight: 1.5 }}>
            Пожалуйста, выберите предпочитаемый язык интерфейса для SkyLauncher:
          </p>
        </div>

        {/* Options List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {LANGUAGE_OPTIONS.map((item) => {
            const isSelected = selectedLang === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => handleSelectLanguage(item.code)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(255, 82, 82, 0.16) 0%, rgba(255, 82, 82, 0.06) 100%)'
                    : '#1a1c26',
                  border: isSelected
                    ? '1.5px solid #ff5252'
                    : '1px solid #282b3a',
                  color: '#fff',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: isSelected ? '0 4px 20px rgba(255, 82, 82, 0.2)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '26px', lineHeight: 1 }}>{item.flag}</span>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{item.name}</span>
                      <span style={{ fontSize: '12px', color: isSelected ? '#ff8585' : '#71788e', fontWeight: 400 }}>
                        ({item.nativeName})
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#8b92a5', marginTop: '3px' }}>
                      {item.description}
                    </div>
                  </div>
                </div>

                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? '#ff5252' : '#232534',
                  color: '#fff',
                  transition: 'all 0.2s ease',
                  flexShrink: 0
                }}>
                  {isSelected && <Check size={14} strokeWidth={3} />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={handleConfirm}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            width: '100%',
            padding: '14px 24px',
            background: 'linear-gradient(135deg, #ff5252 0%, #e02424 100%)',
            border: 'none',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(255, 82, 82, 0.35)',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{selectedLang === 'ru' ? 'Продолжить' : selectedLang === 'it' ? 'Continua' : 'Continue'}</span>
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
