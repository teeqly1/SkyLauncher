export type Language = 'en' | 'ru' | 'it';

export interface Translations {
  // Navigation & Header
  home: string;
  catalogue: string;
  downloads: string;
  settings: string;
  gameDetails: string;
  searchGames: string;
  filterLibrary: string;
  myLibrary: string;
  needHelp: string;
  standaloneEdition: string;
  emptyLibrary: string;
  addLocalGame: string;

  // Context Menu
  launchGame: string;
  openFolder: string;
  removeFromLibrary: string;

  // Home View
  noSourcesTitle: string;
  noSourcesDesc: string;
  goToSettings: string;
  featured: string;
  hotNow: string;
  topWeek: string;
  gamesToBeat: string;
  surpriseMe: string;
  quickDownload: string;
  details: string;
  loadingCatalog: string;

  // Catalogue
  gamesFound: string;
  sortTitle: string;
  sortDate: string;
  noGamesFound: string;
  pageOf: string;

  // Downloads & Post-install
  activeDownloads: string;
  clearCompleted: string;
  statusDownloading: string;
  statusNeedsInstall: string;
  statusCompleted: string;
  statusPaused: string;
  noDownloads: string;
  wait5Minutes: string;
  gameInstalledWaitingUser: string;
  installerDetectedDesc: string;
  btnLaunchSetup: string;
  btnSelectFolder: string;
  btnAutoInstall: string;

  // Settings
  settingsTitle: string;
  settingsDesc: string;
  tabSources: string;
  tabInstallation: string;
  tabNetwork: string;
  tabSystem: string;

  // Settings: Sources
  sourcesTitle: string;
  sourcesDesc: string;
  btnAddOfficial: string;
  btnAddCustom: string;
  inputSourcePlaceholder: string;
  officialBadge: string;
  noSourcesHint: string;

  // Settings: Installation
  installPathTitle: string;
  installPathDesc: string;
  btnBrowse: string;
  autoSetupTitle: string;
  testFeatureBadge: string;
  autoSetupDesc: string;
  autoSetupActive: string;
  warningModalTitle: string;
  warningModalDesc: string;
  warningModalDetails: string;
  btnEnableTestMode: string;
  btnCancel: string;

  // Settings: Network & Bypass
  trackerBypassTitle: string;
  trackerBypassDesc: string;
  clientModeTitle: string;
  clientInternalTitle: string;
  clientInternalDesc: string;
  clientExternalTitle: string;
  clientExternalDesc: string;

  // Language Picker
  selectLanguageTitle: string;
  selectLanguageDesc: string;
  btnContinue: string;
}

const TRANSLATIONS: Record<Language, Translations> = {
  ru: {
    home: 'Главная',
    catalogue: 'Каталог',
    downloads: 'Загрузки',
    settings: 'Настройки',
    gameDetails: 'Об игре',
    searchGames: 'Поиск игр',
    filterLibrary: 'Фильтр библиотеки',
    myLibrary: 'МОЯ БИБЛИОТЕКА',
    needHelp: 'Помощь',
    standaloneEdition: 'Автономная версия',
    emptyLibrary: 'Ваша библиотека пуста.\nСкачайте игру из каталога или нажмите + для выбора папки на ПК.',
    addLocalGame: 'Добавить установленную игру с диска',

    launchGame: 'Запустить игру',
    openFolder: 'Открыть папку',
    removeFromLibrary: 'Удалить из библиотеки',

    noSourcesTitle: 'Упс.... Каталог не появится пока ссылки не будут добавлены',
    noSourcesDesc: 'Для отображения каталога игр и постеров необходимо добавить источник ссылок в настройках лаунчера.',
    goToSettings: 'Перейти в настройки',
    featured: 'Популярное',
    hotNow: '🔥 Горячие новинки',
    topWeek: 'Топ недели',
    gamesToBeat: 'Лучшие для прохождения',
    surpriseMe: 'Случайная игра',
    quickDownload: 'Скачать',
    details: 'Подробнее',
    loadingCatalog: 'Загрузка каталога...',

    gamesFound: 'Найдено игр:',
    sortTitle: 'По названию (А-Я)',
    sortDate: 'По дате обновления',
    noGamesFound: 'По вашему запросу игр не найдено.',
    pageOf: 'Страница',

    activeDownloads: 'Загрузки',
    clearCompleted: 'Очистить завершенные',
    statusDownloading: 'Загрузка',
    statusNeedsInstall: 'Ожидает установки',
    statusCompleted: 'Готово к запуску',
    statusPaused: 'На паузе',
    noDownloads: 'Нет активных загрузок',
    wait5Minutes: 'Подождите как минимум еще 5 минут чтобы все файлы докачались и все работало нормально.',
    gameInstalledWaitingUser: 'Игра установилась ожидаем пока вы установите игру',
    installerDetectedDesc: 'В папке обнаружен установщик (setup.exe). Установите игру и укажите путь к ней.',
    btnLaunchSetup: 'Запустить setup.exe',
    btnSelectFolder: 'Выбрать папку игры',
    btnAutoInstall: 'Авто-пройти setup.exe',

    settingsTitle: 'Настройки',
    settingsDesc: 'Категории конфигурации SkyLauncher, управление источниками и установка',
    tabSources: 'Ссылки',
    tabInstallation: 'Установка',
    tabNetwork: 'Сеть и обход блокировок',
    tabSystem: 'Система',

    sourcesTitle: 'Источники ссылок каталога (Hydra Links)',
    sourcesDesc: 'Подключите ссылки на базы раздач. При нажатии «Добавить офф ссылки» загружается официальный каталог Igruha с более чем 14,300 играми.',
    btnAddOfficial: 'Добавить офф ссылки',
    btnAddCustom: 'Добавить ссылку',
    inputSourcePlaceholder: 'Вставьте URL JSON-источника...',
    officialBadge: 'ОФИЦИАЛЬНЫЙ',
    noSourcesHint: 'Источники не добавлены. Нажмите «Добавить офф ссылки» выше для появления каталога.',

    installPathTitle: 'Путь установки',
    installPathDesc: 'Выберите папку на диске, куда по умолчанию будут загружаться и устанавливаться игры.',
    btnBrowse: 'Обзор...',
    autoSetupTitle: 'Автоматически пройти setup.exe',
    testFeatureBadge: 'ТЕСТОВАЯ ФУНКЦИЯ',
    autoSetupDesc: 'Запускает инсталлятор в фоновом режиме, автоматически подтверждает шаги установки, анализирует процент распаковки файлов и производит установку игры без вашего участия.',
    autoSetupActive: 'Функция активна. После скачивания торрента установщик автоматически пройдёт все этапы в фоне.',
    warningModalTitle: 'Внимание! Тестовая функция',
    warningModalDesc: 'Внимание! Эта функция на стадии разработки у нее могут быть неполадки в работе, вы действительно хотите включить эту функцию?',
    warningModalDetails: 'Функция пытается автоматически запустить инсталлятор в тихом фоновом режиме, проанализировать распаковку файлов и подтвердить все этапы установки без вмешательства пользователя.',
    btnEnableTestMode: 'Включить (Тестовый режим)',
    btnCancel: 'Отмена',

    trackerBypassTitle: 'Обход блокировок трекеров (ISP & DPI Bypass)',
    trackerBypassDesc: 'Добавляет 10+ резервных скоростных трекеров в каждую магнет-ссылку для мгновенного нахождения пиров при блокировках.',
    clientModeTitle: 'Режим скачивания',
    clientInternalTitle: 'Встроенный клиент SkyLauncher',
    clientInternalDesc: 'Фоновая загрузка внутри лаунчера с прогрессом и авто-прохождением setup.exe.',
    clientExternalTitle: 'Внешний торрент-клиент',
    clientExternalDesc: 'Передача ссылки в qBittorrent или uTorrent.',

    selectLanguageTitle: 'Добро пожаловать в SkyLauncher',
    selectLanguageDesc: 'Пожалуйста, выберите предпочитаемый язык интерфейса:',
    btnContinue: 'Продолжить'
  },

  en: {
    home: 'Home',
    catalogue: 'Catalogue',
    downloads: 'Downloads',
    settings: 'Settings',
    gameDetails: 'Game Details',
    searchGames: 'Search games',
    filterLibrary: 'Filter library',
    myLibrary: 'MY LIBRARY',
    needHelp: 'Need help?',
    standaloneEdition: 'Standalone Edition',
    emptyLibrary: 'Your library is empty.\nDownload a game from catalogue or click + to add a local game folder.',
    addLocalGame: 'Add installed local game from drive',

    launchGame: 'Launch game',
    openFolder: 'Open folder',
    removeFromLibrary: 'Remove from library',

    noSourcesTitle: 'Oops.... Catalogue will not appear until links are added',
    noSourcesDesc: 'To display games and artworks, please add a source link in the launcher settings.',
    goToSettings: 'Go to settings',
    featured: 'Featured',
    hotNow: '🔥 Hot now',
    topWeek: 'Top games of the week',
    gamesToBeat: 'Games to beat',
    surpriseMe: 'Surprise me',
    quickDownload: 'Download',
    details: 'Details',
    loadingCatalog: 'Loading catalogue...',

    gamesFound: 'Games found:',
    sortTitle: 'By title (A-Z)',
    sortDate: 'By update date',
    noGamesFound: 'No games found matching your search.',
    pageOf: 'Page',

    activeDownloads: 'Downloads',
    clearCompleted: 'Clear completed',
    statusDownloading: 'Downloading',
    statusNeedsInstall: 'Awaiting installation',
    statusCompleted: 'Ready to launch',
    statusPaused: 'Paused',
    noDownloads: 'No active downloads',
    wait5Minutes: 'Please wait at least another 5 minutes so all files finish downloading and everything works properly.',
    gameInstalledWaitingUser: 'Game installed, waiting for you to install the game',
    installerDetectedDesc: 'An installer was detected in the folder (setup.exe). Install the game and select its folder.',
    btnLaunchSetup: 'Launch setup.exe',
    btnSelectFolder: 'Select game folder',
    btnAutoInstall: 'Auto-complete setup.exe',

    settingsTitle: 'Settings',
    settingsDesc: 'SkyLauncher configuration categories, source management and installation',
    tabSources: 'Sources',
    tabInstallation: 'Installation',
    tabNetwork: 'Network & Bypass',
    tabSystem: 'System',

    sourcesTitle: 'Catalogue Sources (Hydra Links)',
    sourcesDesc: 'Connect JSON repack sources. Clicking "Add official links" adds verified Igruha repository with 14,300+ games.',
    btnAddOfficial: 'Add official links',
    btnAddCustom: 'Add source link',
    inputSourcePlaceholder: 'Paste JSON source URL...',
    officialBadge: 'OFFICIAL',
    noSourcesHint: 'No sources added. Click "Add official links" above to populate the catalogue.',

    installPathTitle: 'Installation Path',
    installPathDesc: 'Select the drive directory where games will be downloaded and installed by default.',
    btnBrowse: 'Browse...',
    autoSetupTitle: 'Automatically complete setup.exe',
    testFeatureBadge: 'EXPERIMENTAL FEATURE',
    autoSetupDesc: 'Runs the installer silently in the background, automatically confirms installation dialogs, tracks decompression progress and finishes setup autonomously.',
    autoSetupActive: 'Feature active. After torrent download finishes, setup will proceed in the background automatically.',
    warningModalTitle: 'Attention! Experimental Feature',
    warningModalDesc: 'Warning! This feature is currently in development and might experience glitches. Are you sure you want to enable this feature?',
    warningModalDetails: 'This feature attempts to launch the installer in silent mode, analyze archive decompression and automatically confirm all steps without user input.',
    btnEnableTestMode: 'Enable (Test Mode)',
    btnCancel: 'Cancel',

    trackerBypassTitle: 'ISP & DPI Tracker Bypass',
    trackerBypassDesc: 'Injects 10+ high-speed backup global trackers into every magnet link to find peers during censorship blocks.',
    clientModeTitle: 'Download Mode',
    clientInternalTitle: 'SkyLauncher Internal Engine',
    clientInternalDesc: 'Background downloading inside launcher with progress tracking and auto setup.exe.',
    clientExternalTitle: 'External Torrent Client',
    clientExternalDesc: 'Direct magnet dispatch to qBittorrent or uTorrent.',

    selectLanguageTitle: 'Welcome to SkyLauncher',
    selectLanguageDesc: 'Please select your preferred interface language:',
    btnContinue: 'Continue'
  },

  it: {
    home: 'Home',
    catalogue: 'Catalogo',
    downloads: 'Download',
    settings: 'Impostazioni',
    gameDetails: 'Dettagli gioco',
    searchGames: 'Cerca giochi',
    filterLibrary: 'Filtra libreria',
    myLibrary: 'LA MIA LIBRERIA',
    needHelp: 'Serve aiuto?',
    standaloneEdition: 'Edizione Standalone',
    emptyLibrary: 'La tua libreria è vuota.\nScarica un gioco dal catalogo o clicca su + per aggiungere una cartella locale.',
    addLocalGame: 'Aggiungi gioco locale dal disco',

    launchGame: 'Avvia gioco',
    openFolder: 'Apri cartella',
    removeFromLibrary: 'Rimuovi dalla libreria',

    noSourcesTitle: 'Oops.... Il catalogo non apparirà finché non saranno aggiunti i link',
    noSourcesDesc: 'Per visualizzare i giochi e le copertine, aggiungi una fonte nelle impostazioni del launcher.',
    goToSettings: 'Vai alle impostazioni',
    featured: 'In evidenza',
    hotNow: '🔥 Più popolari',
    topWeek: 'Top della settimana',
    gamesToBeat: 'I migliori da completare',
    surpriseMe: 'Sorprendimi',
    quickDownload: 'Scarica',
    details: 'Dettagli',
    loadingCatalog: 'Caricamento catalogo...',

    gamesFound: 'Giochi trovati:',
    sortTitle: 'Per titolo (A-Z)',
    sortDate: 'Per data di aggiornamento',
    noGamesFound: 'Nessun gioco trovato.',
    pageOf: 'Pagina',

    activeDownloads: 'Download',
    clearCompleted: 'Cancella completati',
    statusDownloading: 'In download',
    statusNeedsInstall: 'In attesa di installazione',
    statusCompleted: 'Pronto per l\'avvio',
    statusPaused: 'In pausa',
    noDownloads: 'Nessun download attivo',
    wait5Minutes: 'Attendere almeno altri 5 minuti affinché tutti i file finiscano di scaricarsi e tutto funzioni correttamente.',
    gameInstalledWaitingUser: 'Gioco installato, in attesa che tu installi il gioco',
    installerDetectedDesc: 'Rilevato installer nella cartella (setup.exe). Installa il gioco e seleziona la cartella.',
    btnLaunchSetup: 'Avvia setup.exe',
    btnSelectFolder: 'Seleziona cartella gioco',
    btnAutoInstall: 'Completamento automatico setup.exe',

    settingsTitle: 'Impostazioni',
    settingsDesc: 'Categorie di configurazione di SkyLauncher, gestione fonti e installazione',
    tabSources: 'Fonti',
    tabInstallation: 'Installazione',
    tabNetwork: 'Rete e Bypass',
    tabSystem: 'Sistema',

    sourcesTitle: 'Fonti del catalogo (Hydra Links)',
    sourcesDesc: 'Collega i cataloghi di repack. Cliccando "Aggiungi link ufficiali" caricherai il catalogo Igruha con oltre 14.300 giochi.',
    btnAddOfficial: 'Aggiungi link ufficiali',
    btnAddCustom: 'Aggiungi fonte',
    inputSourcePlaceholder: 'Incolla URL fonte JSON...',
    officialBadge: 'UFFICIALE',
    noSourcesHint: 'Nessuna fonte aggiunta. Clicca su "Aggiungi link ufficiali" sopra per visualizzare il catalogo.',

    installPathTitle: 'Percorso di installazione',
    installPathDesc: 'Seleziona la cartella su disco dove scaricare e installare i giochi per impostazione predefinita.',
    btnBrowse: 'Sfoglia...',
    autoSetupTitle: 'Completamento automatico setup.exe',
    testFeatureBadge: 'FUNZIONE SPERIMENTALE',
    autoSetupDesc: 'Avvia l\'installer in background, conferma automaticamente i passaggi, analizza l\'estrazione e completa l\'installazione senza intervento dell\'utente.',
    autoSetupActive: 'Funzione attiva. Al termine del download, l\'installer procederà in background automaticamente.',
    warningModalTitle: 'Attenzione! Funzione sperimentale',
    warningModalDesc: 'Attenzione! Questa funzione è in fase di sviluppo e potrebbe presentare problemi. Sei sicuro di volerla abilitare?',
    warningModalDetails: 'Questa funzione tenta di avviare l\'installer in modalità silenziosa, analizzare l\'estrazione dei file e confermare tutti i passaggi automaticamente.',
    btnEnableTestMode: 'Abilita (Modalità test)',
    btnCancel: 'Annulla',

    trackerBypassTitle: 'Bypass blocchi tracker (ISP & DPI)',
    trackerBypassDesc: 'Aggiunge oltre 10 tracker globali di backup in ogni magnet link per trovare peer anche con blocchi di rete.',
    clientModeTitle: 'Modalità di download',
    clientInternalTitle: 'Client interno SkyLauncher',
    clientInternalDesc: 'Download in background con avanzamento e gestione automatica di setup.exe.',
    clientExternalTitle: 'Client torrent esterno',
    clientExternalDesc: 'Invio diretto del link a qBittorrent o uTorrent.',

    selectLanguageTitle: 'Benvenuto in SkyLauncher',
    selectLanguageDesc: 'Seleziona la lingua dell\'interfaccia desiderata:',
    btnContinue: 'Continua'
  }
};

class I18nService {
  private currentLanguage: Language = 'ru';
  private listeners: Array<() => void> = [];
  private hasChosenLangKey = 'sky_launcher_has_chosen_lang';
  private langKey = 'sky_launcher_lang';

  constructor() {
    this.loadLanguage();
  }

  private loadLanguage() {
    try {
      const stored = localStorage.getItem(this.langKey) as Language;
      if (stored && ['en', 'ru', 'it'].includes(stored)) {
        this.currentLanguage = stored;
      } else {
        // Default to Russian per user preference, but check choice flag
        this.currentLanguage = 'ru';
      }
    } catch {
      this.currentLanguage = 'ru';
    }
  }

  public hasChosenLanguage(): boolean {
    return localStorage.getItem(this.hasChosenLangKey) === 'true';
  }

  public markLanguageChosen() {
    localStorage.setItem(this.hasChosenLangKey, 'true');
  }

  public getLanguage(): Language {
    return this.currentLanguage;
  }

  public setLanguage(lang: Language) {
    this.currentLanguage = lang;
    localStorage.setItem(this.langKey, lang);
    this.markLanguageChosen();
    this.listeners.forEach(cb => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.push(cb);
    return () => {
      this.listeners = this.listeners.filter(l => l !== cb);
    };
  }

  public t(): Translations {
    return TRANSLATIONS[this.currentLanguage] || TRANSLATIONS.ru;
  }
}

export const i18n = new I18nService();
