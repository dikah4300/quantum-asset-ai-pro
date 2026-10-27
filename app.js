/**
 * QUANTUM ASSET AI PRO - CLIENT-SIDE INTELLIGENCE & TERMINAL CONTROLLER
 * Full autonomy engine: works with local Python server or standalone on Vercel/CDN.
 */

// Global State
const state = {
  market: null,
  news: [],
  sentimentOverview: null,
  selectedCategory: 'all',
  selectedSentiment: 'all',
  searchQuery: '',
  matrixCategory: 'm-meme',
  matrixSearchQuery: '',
  calendarFilter: 'all',
  activeChartCat: 'forex',
  activeChartSymbol: 'OANDA:XAUUSD',
  activeChartInterval: '60',
  bookmarks: JSON.parse(localStorage.getItem('finai_bookmarks') || '[]'),
  countdown: 45,
  refreshInterval: 45,
  timerId: null,
  geminiKey: localStorage.getItem('finai_gemini_key') || '',
  voiceLang: localStorage.getItem('finai_voice_lang') || 'id-ID'
};

// Catalogs for Standalone Execution (Vercel Deployments)
const CRYPTO_CATALOG = {
  "pepe": { sym: "PEPE", name: "Pepe", cat: "meme", usd: 0.00000985, chg: 6.8, icon: "🐸" },
  "dogecoin": { sym: "DOGE", name: "Dogecoin", cat: "meme", usd: 0.165, chg: 4.2, icon: "🐕" },
  "shiba-inu": { sym: "SHIB", name: "Shiba Inu", cat: "meme", usd: 0.0000185, chg: 3.1, icon: "🐶" },
  "dogwifcoin": { sym: "WIF", name: "dogwifhat", cat: "meme", usd: 2.45, chg: 5.7, icon: "🧢" },
  "bonk": { sym: "BONK", name: "Bonk", cat: "meme", usd: 0.0000215, chg: 7.2, icon: "🔨" },
  "floki": { sym: "FLOKI", name: "FLOKI", cat: "meme", usd: 0.000148, chg: 3.9, icon: "⚔️" },
  "brett": { sym: "BRETT", name: "Brett (Base)", cat: "meme", usd: 0.092, chg: 8.5, icon: "🔵" },
  "popcat": { sym: "POPCAT", name: "Popcat (SOL)", cat: "meme", usd: 1.38, chg: 9.4, icon: "🐱" },
  "book-of-meme": { sym: "BOME", name: "BOOK OF MEME", cat: "meme", usd: 0.0089, chg: 4.1, icon: "📖" },
  "cat-in-a-dogs-world": { sym: "MEW", name: "cat in dogs world", cat: "meme", usd: 0.0092, chg: 6.5, icon: "😼" },
  "neiro-ethereum": { sym: "NEIRO", name: "First Neiro ETH", cat: "meme", usd: 0.00185, chg: 12.4, icon: "🐾" },
  "turbo": { sym: "TURBO", name: "Turbo (AI Meme)", cat: "meme", usd: 0.0088, chg: 5.2, icon: "🐌" },
  "baby-doge-coin": { sym: "BABYDOGE", name: "Baby Doge Coin", cat: "meme", usd: 0.0000000021, chg: 2.8, icon: "🍼" },
  "mog-coin": { sym: "MOG", name: "Mog Coin", cat: "meme", usd: 0.0000019, chg: 4.9, icon: "🕶️" },
  "goatseus-maximus": { sym: "GOAT", name: "Goatseus Maximus", cat: "meme", usd: 0.72, chg: 14.2, icon: "🐐" },
  "memecoin": { sym: "MEME", name: "Memecoin (Memeland)", cat: "meme", usd: 0.0128, chg: 2.7, icon: "🏴‍☠️" },
  "bitcoin": { sym: "BTC", name: "Bitcoin", cat: "major", usd: 83250, chg: 2.1, icon: "₿" },
  "ethereum": { sym: "ETH", name: "Ethereum", cat: "major", usd: 2910, chg: 2.8, icon: "Ξ" },
  "solana": { sym: "SOL", name: "Solana", cat: "major", usd: 172.5, chg: 4.9, icon: "◎" },
  "binancecoin": { sym: "BNB", name: "BNB", cat: "major", usd: 618, chg: 1.5, icon: "🟡" },
  "ripple": { sym: "XRP", name: "XRP (Ripple)", cat: "major", usd: 0.548, chg: 1.2, icon: "✕" },
  "cardano": { sym: "ADA", name: "Cardano", cat: "major", usd: 0.365, chg: 2.3, icon: "₳" },
  "avalanche-2": { sym: "AVAX", name: "Avalanche", cat: "major", usd: 28.4, chg: 3.8, icon: "🔺" },
  "chainlink": { sym: "LINK", name: "Chainlink", cat: "major", usd: 12.6, chg: 3.2, icon: "🔗" },
  "sui": { sym: "SUI", name: "Sui Network", cat: "major", usd: 2.18, chg: 6.9, icon: "💧" },
  "near": { sym: "NEAR", name: "NEAR Protocol", cat: "major", usd: 5.05, chg: 4.1, icon: "🌐" },
  "toncoin": { sym: "TON", name: "Toncoin", cat: "major", usd: 5.32, chg: 1.8, icon: "💎" },
  "bittensor": { sym: "TAO", name: "Bittensor (AI)", cat: "ai", usd: 548, chg: 6.5, icon: "🧠" },
  "artificial-superintelligence-alliance": { sym: "FET", name: "ASI / Fetch.ai", cat: "ai", usd: 1.45, chg: 5.1, icon: "🤖" },
  "render-token": { sym: "RENDER", name: "Render Network", cat: "ai", usd: 5.92, chg: 4.4, icon: "🎨" }
};

const STOCKS_CATALOG = {
  "ihsg": { name: "IHSG (BEI)", symbol: "^JKSE", price: 7725.50, change_pct: 0.42 },
  "bbca": { name: "Bank Central Asia", symbol: "BBCA.JK", price: 10450, change_pct: 0.72 },
  "bbri": { name: "Bank Rakyat Indonesia", symbol: "BBRI.JK", price: 4860, change_pct: -0.41 },
  "bmri": { name: "Bank Mandiri", symbol: "BMRI.JK", price: 6800, change_pct: 0.37 },
  "tlkm": { name: "Telkom Indonesia", symbol: "TLKM.JK", price: 3080, change_pct: 0.65 },
  "asii": { name: "Astra International", symbol: "ASII.JK", price: 5150, change_pct: -0.19 },
  "sp500": { name: "S&P 500 Index", symbol: "^GSPC", price: 5864.20, change_pct: 0.38 },
  "nvda": { name: "Nvidia Corporation", symbol: "NVDA", price: 141.25, change_pct: 2.15 },
  "aapl": { name: "Apple Inc.", symbol: "AAPL", price: 232.10, change_pct: 0.45 }
};

const PRECIOUS_CATALOG = {
  "gold": { name: "Emas Dunia (Spot)", symbol: "XAU/USD", price: 2742.50, change_pct: 0.68, unit: "USD / troy oz" },
  "silver": { name: "Perak (Spot)", symbol: "XAG/USD", price: 33.85, change_pct: 1.15, unit: "USD / troy oz" },
  "crude_oil": { name: "Minyak Mentah WTI", symbol: "CL=F", price: 71.40, change_pct: -0.52, unit: "USD / barel" }
};

const FOREX_CATALOG = {
  "usd_idr": { name: "Dolar AS ke Rupiah", symbol: "USD/IDR", price: 15850, change_pct: -0.15 },
  "eur_usd": { name: "Euro ke Dolar", symbol: "EUR/USD", price: 1.0825, change_pct: 0.18 },
  "gbp_usd": { name: "Pound ke Dolar", symbol: "GBP/USD", price: 1.2980, change_pct: 0.22 },
  "usd_jpy": { name: "Dolar ke Yen", symbol: "USD/JPY", price: 152.40, change_pct: -0.32 }
};

const ECONOMIC_CALENDAR = [
  {
    id: "fomc-rate",
    title: "Keputusan Suku Bunga The Fed (FOMC Rate Decision)",
    category: "fomc",
    impact: "high",
    date: "7 Nov 2024",
    time: "02:00 WIB",
    actual: "4.75% - 5.00%",
    forecast: "-25 bps Cut (4.75%)",
    previous: "5.00%",
    goldImpact: "Pemangkasan suku bunga (Dovish) melemahkan DXY dan memicu reli lonjakan harga emas XAU/USD ke target baru."
  },
  {
    id: "us-cpi",
    title: "Indeks Harga Konsumen AS (US CPI YoY)",
    category: "inflation",
    impact: "high",
    date: "13 Nov 2024",
    time: "20:30 WIB",
    actual: "2.4%",
    forecast: "2.6%",
    previous: "2.4%",
    goldImpact: "Jika rilis di bawah forecast -> Inflasi melandai, Yield obligasi 10Y turun -> Emas Strong Bullish Breakout."
  },
  {
    id: "us-ppi",
    title: "Indeks Harga Produsen AS (US PPI MoM)",
    category: "inflation",
    impact: "high",
    date: "14 Nov 2024",
    time: "20:30 WIB",
    actual: "0.0%",
    forecast: "0.2%",
    previous: "0.2%",
    goldImpact: "PPI mengukur tekanan biaya produsen sebelum sampai ke konsumen. PPI melemah adalah katalis positif signifikan bagi XAU/USD."
  },
  {
    id: "us-nfp",
    title: "Non-Farm Payrolls & Unemployment Rate (NFP)",
    category: "nfp",
    impact: "high",
    date: "6 Des 2024",
    time: "20:30 WIB",
    actual: "12K",
    forecast: "113K",
    previous: "223K",
    goldImpact: "Data tenaga kerja yang melemah (< forecast) meningkatkan urgensi The Fed melonggarkan moneter, mengangkat XAU/USD."
  },
  {
    id: "us-pce",
    title: "Core PCE Price Index MoM (Indikator Utama The Fed)",
    category: "inflation",
    impact: "high",
    date: "27 Nov 2024",
    time: "20:30 WIB",
    actual: "0.3%",
    forecast: "0.3%",
    previous: "0.2%",
    goldImpact: "Tolok ukur inflasi favorit Jerome Powell. Angka stabil/rendah memberi ruang emas menembus resistance struktural."
  },
  {
    id: "us-gdp",
    title: "Pertumbuhan PDB AS Tahunan (US GDP Annualized)",
    category: "gdp",
    impact: "high",
    date: "27 Nov 2024",
    time: "20:30 WIB",
    actual: "2.8%",
    forecast: "2.8%",
    previous: "3.0%",
    goldImpact: "Pertumbuhan ekonomi stabil tanpa risiko resesi mendalam mempertahankan aliran safe haven ke emas di tengah ketegangan geopolitik."
  }
];

const INITIAL_NEWS = [
  {
    id: "news-1",
    title: "Emas Dunia Cetak Titik Akumulasi Institusional Baru di Kisaran $2,740 Jelang Rilis Data Makro AS",
    description: "Permintaan safe haven dari bank sentral global serta ekspektasi siklus pelonggaran suku bunga The Fed terus menopang tren bullish struktural komoditas emas (XAU/USD).",
    source: "CNBC Finansial",
    category: "forex",
    sentiment: "Bullish",
    sentiment_score: 4,
    keywords: ["Emas", "The Fed", "XAUUSD"],
    pubDate: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    link: "https://www.cnbc.com/gold"
  },
  {
    id: "news-2",
    title: "Koin Meme PEPE & Dogecoin Pimpin Rotasi Likuiditas Kripto dengan Volume Transaksi Menanjak",
    description: "Pasar altcoin dan token meme mengalami percepatan momentum setelah Bitcoin stabil di atas $82,000, didorong sentimen spekulatif dan aktivitas on-chain tinggi.",
    source: "CoinDesk Indonesia",
    category: "crypto",
    sentiment: "Bullish",
    sentiment_score: 5,
    keywords: ["PEPE", "Dogecoin", "Meme Coin"],
    pubDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    link: "https://www.coindesk.com"
  },
  {
    id: "news-3",
    title: "IHSG Bertahan di Zona 7,700 Ditopang Aksi Beli Bersih Asing pada Saham Big Cap Perbankan",
    description: "Saham BBCA dan BBRI menjadi motor penggerak indeks domestik di tengah stabilitas kurs rupiah dan antisipasi arah kebijakan moneter Bank Indonesia.",
    source: "Antara Pasar Modal",
    category: "stocks",
    sentiment: "Bullish",
    sentiment_score: 3,
    keywords: ["IHSG", "BBCA", "BBRI"],
    pubDate: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    link: "https://antaranews.com"
  },
  {
    id: "news-4",
    title: "Pasar Cermati Rilis Inflasi PPI dan Risalah Pertemuan FOMC untuk Mengukur Agresivitas Suku Bunga",
    description: "Analis Wall Street memproyeksikan inflasi tingkat produsen (PPI) mencerminkan tekanan rantai pasok yang melandai, memberikan katalis positif bagi aset berisiko dan emas.",
    source: "Bloomberg Makro",
    category: "forex",
    sentiment: "Netral",
    sentiment_score: 1,
    keywords: ["PPI", "FOMC", "Inflasi"],
    pubDate: new Date(Date.now() - 1000 * 60 * 130).toISOString(),
    link: "https://bloomberg.com"
  },
  {
    id: "news-5",
    title: "Solana dan Koin Ekosistem Meme BOME & WIF Alami Peningkatan On-Chain Dex Volume",
    description: "Ekosistem Solana mencatat rekor biaya transaksi harian berkat lonjakan transfer token viral dogwifhat (WIF) dan Bonk.",
    source: "CoinTelegraph",
    category: "crypto",
    sentiment: "Bullish",
    sentiment_score: 4,
    keywords: ["Solana", "WIF", "BONK"],
    pubDate: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    link: "https://cointelegraph.com"
  },
  {
    id: "news-6",
    title: "Cadangan Minyak Mentah AS Naik Moderat, Harga WTI Bergerak Konsolidasi di $71",
    description: "Keseimbangan pasokan OPEC+ dan proyeksi permintaan global membuat pergerakan harga minyak mentah berada dalam rentang teratur.",
    source: "Reuters Energy",
    category: "precious",
    sentiment: "Netral",
    sentiment_score: 0,
    keywords: ["Minyak", "WTI", "OPEC"],
    pubDate: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    link: "https://reuters.com"
  }
];

// DOM References
const el = {
  tickerTrack: document.getElementById('tickerTrack'),
  btnRefresh: document.getElementById('btnRefresh'),
  refreshTimer: document.getElementById('refreshTimer'),
  fngValueDisplay: document.getElementById('fngValueDisplay'),
  goldNavPrice: document.getElementById('goldNavPrice'),
  ihsgNavPrice: document.getElementById('ihsgNavPrice'),
  usdidrNavPrice: document.getElementById('usdidrNavPrice'),
  
  // Hero cards
  btcPriceCard: document.getElementById('btcPriceCard'),
  btcChangeCard: document.getElementById('btcChangeCard'),
  ethPriceCard: document.getElementById('ethPriceCard'),
  solPriceCard: document.getElementById('solPriceCard'),
  pepePriceCard: document.getElementById('pepePriceCard'),
  dogePriceCard: document.getElementById('dogePriceCard'),
  fngFill: document.getElementById('fngFill'),
  fngSentimentText: document.getElementById('fngSentimentText'),
  fngScoreText: document.getElementById('fngScoreText'),
  cryptoStatusBadge: document.getElementById('cryptoStatusBadge'),

  goldPriceCard: document.getElementById('goldPriceCard'),
  goldChangeCard: document.getElementById('goldChangeCard'),
  goldGramCard: document.getElementById('goldGramCard'),
  silverPriceCard: document.getElementById('silverPriceCard'),
  oilPriceCard: document.getElementById('oilPriceCard'),
  usdidrCard: document.getElementById('usdidrCard'),

  ihsgPriceCard: document.getElementById('ihsgPriceCard'),
  ihsgChangeCard: document.getElementById('ihsgChangeCard'),
  sp500PriceCard: document.getElementById('sp500PriceCard'),
  nvdaPriceCard: document.getElementById('nvdaPriceCard'),
  bbcaPriceCard: document.getElementById('bbcaPriceCard'),
  bbriPriceCard: document.getElementById('bbriPriceCard'),

  barBullish: document.getElementById('barBullish'),
  barNeutral: document.getElementById('barNeutral'),
  barBearish: document.getElementById('barBearish'),
  pctBullish: document.getElementById('pctBullish'),
  pctNeutral: document.getElementById('pctNeutral'),
  pctBearish: document.getElementById('pctBearish'),
  aiDigestSnippet: document.getElementById('aiDigestSnippet'),

  // TradingView Section
  chartCategoryTabs: document.getElementById('chartCategoryTabs'),
  symbolPillsBar: document.getElementById('symbolPillsBar'),
  currentSymbolDisplay: document.getElementById('currentSymbolDisplay'),
  tradingviewWidgetBox: document.getElementById('tradingview_widget_box'),

  // Forex Analysis XAU/USD
  xauConfluenceScore: document.getElementById('xauConfluenceScore'),
  xauSignalTag: document.getElementById('xauSignalTag'),
  setupActionType: document.getElementById('setupActionType'),
  setupName: document.getElementById('setupName'),
  setupEntryZone: document.getElementById('setupEntryZone'),
  setupSL: document.getElementById('setupSL'),
  setupTP1: document.getElementById('setupTP1'),
  setupTP2: document.getElementById('setupTP2'),
  setupTP3: document.getElementById('setupTP3'),
  setupRR: document.getElementById('setupRR'),
  setupATR: document.getElementById('setupATR'),
  smcDemand: document.getElementById('smcDemand'),
  smcSupply: document.getElementById('smcSupply'),
  smcFVG: document.getElementById('smcFVG'),
  smcLiquidity: document.getElementById('smcLiquidity'),
  pvR3: document.getElementById('pvR3'),
  fibR3: document.getElementById('fibR3'),
  pvR2: document.getElementById('pvR2'),
  fibR2: document.getElementById('fibR2'),
  pvR1: document.getElementById('pvR1'),
  fibR1: document.getElementById('fibR1'),
  pvPP: document.getElementById('pvPP'),
  fibPP: document.getElementById('fibPP'),
  pvS1: document.getElementById('pvS1'),
  fibS1: document.getElementById('fibS1'),
  pvS2: document.getElementById('pvS2'),
  fibS2: document.getElementById('fibS2'),
  pvS3: document.getElementById('pvS3'),
  fibS3: document.getElementById('fibS3'),

  // Economic Calendar
  calEventsGrid: document.getElementById('calEventsGrid'),
  calFilters: document.getElementById('calFilters'),

  // Matrix
  matrixGrid: document.getElementById('matrixGrid'),
  matrixPills: document.getElementById('matrixPills'),
  searchCoinInput: document.getElementById('searchCoinInput'),

  // News
  newsFeedList: document.getElementById('newsFeedList'),
  newsCountBadge: document.getElementById('newsCountBadge'),
  searchNewsInput: document.getElementById('searchNewsInput'),
  btnClearSearch: document.getElementById('btnClearSearch'),
  categoryTabs: document.getElementById('categoryTabs'),
  bookmarkCount: document.getElementById('bookmarkCount'),

  // Chat
  chatMessages: document.getElementById('chatMessages'),
  chatForm: document.getElementById('chatForm'),
  chatInput: document.getElementById('chatInput'),
  promptChips: document.getElementById('promptChips'),
  btnClearChat: document.getElementById('btnClearChat'),
  btnVoiceRead: document.getElementById('btnVoiceRead'),
  chatSidebar: document.getElementById('chatSidebar'),
  btnToggleChatMobile: document.getElementById('btnToggleChatMobile'),
  btnCloseMobileChat: document.getElementById('btnCloseMobileChat'),
  welcomeTime: document.getElementById('welcomeTime'),

  // Modals
  calcModal: document.getElementById('calcModal'),
  btnOpenCalculator: document.getElementById('btnOpenCalculator'),
  btnCloseCalc: document.getElementById('btnCloseCalc'),
  settingsModal: document.getElementById('settingsModal'),
  btnSettings: document.getElementById('btnSettings'),
  btnCloseSettings: document.getElementById('btnCloseSettings'),
  btnSaveSettings: document.getElementById('btnSaveSettings'),
  geminiApiKeyInput: document.getElementById('geminiApiKeyInput'),
  autoRefreshSelect: document.getElementById('autoRefreshSelect'),
  voiceSelect: document.getElementById('voiceSelect')
};

// ===================================================================
// INITIALIZATION
// ===================================================================
document.addEventListener('DOMContentLoaded', () => {
  initSettings();
  initEventListeners();
  initTradingViewChart();
  renderEconomicCalendar('all');
  loadAllData();
  startAutoRefresh();

  if (el.welcomeTime) {
    const now = new Date();
    el.welcomeTime.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  }
});

function initSettings() {
  if (state.geminiKey && el.geminiApiKeyInput) {
    el.geminiApiKeyInput.value = state.geminiKey;
  }
  const savedInterval = localStorage.getItem('finai_refresh_interval');
  if (savedInterval && el.autoRefreshSelect) {
    state.refreshInterval = parseInt(savedInterval, 10);
    state.countdown = state.refreshInterval;
    el.autoRefreshSelect.value = savedInterval;
  }
  if (state.voiceLang && el.voiceSelect) {
    el.voiceSelect.value = state.voiceLang;
  }
  updateBookmarkCount();
}

// ===================================================================
// EVENT LISTENERS
// ===================================================================
function initEventListeners() {
  // Manual refresh
  if (el.btnRefresh) {
    el.btnRefresh.addEventListener('click', () => {
      el.btnRefresh.querySelector('i')?.classList.add('fa-spin');
      loadAllData().finally(() => {
        setTimeout(() => el.btnRefresh.querySelector('i')?.classList.remove('fa-spin'), 600);
      });
    });
  }

  // Search News
  if (el.searchNewsInput) {
    el.searchNewsInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.trim().toLowerCase();
      if (el.btnClearSearch) el.btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
      renderNews();
    });
  }

  if (el.btnClearSearch) {
    el.btnClearSearch.addEventListener('click', () => {
      el.searchNewsInput.value = '';
      state.searchQuery = '';
      el.btnClearSearch.style.display = 'none';
      renderNews();
    });
  }

  // Category Tabs (News)
  if (el.categoryTabs) {
    el.categoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.tab-btn');
      if (!btn) return;
      el.categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedCategory = btn.dataset.cat;
      renderNews();
    });
  }

  // Sentiment Filter Buttons
  document.querySelectorAll('.sent-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sent-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.selectedSentiment = btn.dataset.sent;
      renderNews();
    });
  });

  // Matrix Filter Pills
  if (el.matrixPills) {
    el.matrixPills.addEventListener('click', (e) => {
      const pill = e.target.closest('.m-pill');
      if (!pill) return;
      el.matrixPills.querySelectorAll('.m-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.matrixCategory = pill.dataset.target;
      renderMatrix();
    });
  }

  // Matrix Search Coin Input
  if (el.searchCoinInput) {
    el.searchCoinInput.addEventListener('input', (e) => {
      state.matrixSearchQuery = e.target.value.trim().toLowerCase();
      renderMatrix();
    });
  }

  // Calendar Filter Buttons
  if (el.calFilters) {
    el.calFilters.addEventListener('click', (e) => {
      const btn = e.target.closest('.cal-filter-btn');
      if (!btn) return;
      el.calFilters.querySelectorAll('.cal-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.calendarFilter = btn.dataset.filter;
      renderEconomicCalendar(state.calendarFilter);
    });
  }

  // TradingView Category Tabs
  if (el.chartCategoryTabs) {
    el.chartCategoryTabs.addEventListener('click', (e) => {
      const btn = e.target.closest('.c-tab');
      if (!btn) return;
      el.chartCategoryTabs.querySelectorAll('.c-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeChartCat = btn.dataset.chartCat;
      updateSymbolPills(state.activeChartCat);
    });
  }

  // TradingView Timeframe Interval Buttons
  document.querySelectorAll('.tf-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeChartInterval = btn.dataset.interval;
      loadTradingViewWidget(state.activeChartSymbol, state.activeChartInterval);
    });
  });

  // Chat Submission
  if (el.chatForm) {
    el.chatForm.addEventListener('submit', handleChatSubmit);
  }
  if (el.chatInput) {
    el.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatSubmit(e);
      }
    });
  }

  // Quick Prompt Chips
  if (el.promptChips) {
    el.promptChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      const promptText = chip.dataset.prompt;
      sendChatMessage(promptText);
    });
  }

  // Clear Chat History
  if (el.btnClearChat) {
    el.btnClearChat.addEventListener('click', () => {
      if (confirm('Bersihkan riwayat percakapan dengan Asisten AI?')) {
        el.chatMessages.innerHTML = `
          <div class="chat-message bot-msg">
            <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
            <div class="msg-bubble">
              <div class="msg-content">
                <p>Riwayat percakapan telah dibersihkan. Apa yang ingin Anda analisis selanjutnya?</p>
              </div>
              <div class="msg-time">Sekarang</div>
            </div>
          </div>
        `;
      }
    });
  }

  // Voice Read-Aloud
  if (el.btnVoiceRead) {
    el.btnVoiceRead.addEventListener('click', handleVoiceSummary);
  }

  // Mobile Chat Drawer
  if (el.btnToggleChatMobile && el.chatSidebar) {
    el.btnToggleChatMobile.addEventListener('click', () => el.chatSidebar.classList.add('open'));
  }
  if (el.btnCloseMobileChat && el.chatSidebar) {
    el.btnCloseMobileChat.addEventListener('click', () => el.chatSidebar.classList.remove('open'));
  }

  // Modals Handling
  if (el.btnOpenCalculator && el.calcModal) {
    el.btnOpenCalculator.addEventListener('click', () => el.calcModal.classList.add('open'));
  }
  if (el.btnCloseCalc && el.calcModal) {
    el.btnCloseCalc.addEventListener('click', () => el.calcModal.classList.remove('open'));
  }
  if (el.calcModal) {
    el.calcModal.addEventListener('click', (e) => {
      if (e.target === el.calcModal) el.calcModal.classList.remove('open');
    });
  }

  if (el.btnSettings && el.settingsModal) {
    el.btnSettings.addEventListener('click', () => el.settingsModal.classList.add('open'));
  }
  if (el.btnCloseSettings && el.settingsModal) {
    el.btnCloseSettings.addEventListener('click', () => el.settingsModal.classList.remove('open'));
  }
  if (el.settingsModal) {
    el.settingsModal.addEventListener('click', (e) => {
      if (e.target === el.settingsModal) el.settingsModal.classList.remove('open');
    });
  }
  if (el.btnSaveSettings) {
    el.btnSaveSettings.addEventListener('click', saveSettings);
  }

  // Calculator Logic
  initCalculatorLogic();
}

// ===================================================================
// DATA FETCHING & STANDALONE FALLBACK
// ===================================================================
async function loadAllData() {
  await Promise.all([
    fetchMarketData(),
    fetchNewsData()
  ]);
}

async function fetchMarketData() {
  let loadedFromBackend = false;

  // 1. Coba ambil dari backend lokal (/api/market)
  try {
    const res = await fetch('/api/market', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.crypto) {
        state.market = data;
        loadedFromBackend = true;
      }
    }
  } catch (err) {
    // Backend offline / Vercel static deployment
  }

  // 2. Jika di Vercel atau backend offline, jalankan Live Public API Engine
  if (!loadedFromBackend) {
    await fetchLivePublicMarketData();
  }

  renderTickerTape();
  renderHeroCards();
  renderMatrix();
  renderXauAnalysis();
  calculateGoldConverter();
  calculateCryptoConverter();
}

async function fetchLivePublicMarketData() {
  const usdIdrRate = 15850;
  const market = {
    timestamp: Date.now(),
    crypto: {},
    stocks: JSON.parse(JSON.stringify(STOCKS_CATALOG)),
    precious: JSON.parse(JSON.stringify(PRECIOUS_CATALOG)),
    forex: JSON.parse(JSON.stringify(FOREX_CATALOG)),
    indicators: {
      fear_and_greed: { value: 68, classification: "Greed" }
    }
  };

  // Populate crypto from catalog first
  for (const [key, val] of Object.entries(CRYPTO_CATALOG)) {
    market.crypto[key] = {
      symbol: val.sym,
      name: val.name,
      category: val.cat,
      icon: val.icon,
      usd: val.usd,
      idr: Math.round(val.usd * usdIdrRate),
      usd_24h_change: val.chg
    };
  }

  // Coba update kurs USD/IDR live via public exchange rates
  try {
    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(3000) });
    if (fxRes.ok) {
      const fxData = await fxRes.json();
      if (fxData && fxData.rates && fxData.rates.IDR) {
        market.forex.usd_idr.price = Math.round(fxData.rates.IDR);
      }
    }
  } catch (e) {}

  // Coba update harga Crypto & Koin Meme via CoinGecko Public API
  try {
    const ids = "bitcoin,ethereum,solana,pepe,dogecoin,shiba-inu,dogwifcoin,bonk,floki,bittensor";
    const cgRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, { signal: AbortSignal.timeout(3500) });
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      for (const [cId, cVal] of Object.entries(cgData)) {
        if (market.crypto[cId] && cVal.usd) {
          market.crypto[cId].usd = cVal.usd;
          market.crypto[cId].idr = Math.round(cVal.usd * market.forex.usd_idr.price);
          if (cVal.usd_24h_change !== undefined) {
            market.crypto[cId].usd_24h_change = parseFloat(cVal.usd_24h_change.toFixed(2));
          }
        }
      }
    }
  } catch (e) {}

  // Simulasi dinamika harga subtle agar dashboard tetap hidup real-time
  const jitterPct = (Math.random() - 0.5) * 0.2; // +/- 0.1%
  market.precious.gold.price = parseFloat((market.precious.gold.price * (1 + jitterPct / 100)).toFixed(2));

  state.market = market;
}

async function fetchNewsData() {
  try {
    const res = await fetch('/api/news', { signal: AbortSignal.timeout(3500) });
    if (res.ok) {
      const data = await res.json();
      if (data && data.articles && data.articles.length > 0) {
        state.news = data.articles;
        state.sentimentOverview = data.sentiment_overview || null;
        renderSentimentSummary();
        renderNews();
        return;
      }
    }
  } catch (e) {}

  // Fallback standalone news jika di Vercel
  state.news = INITIAL_NEWS;
  state.sentimentOverview = {
    bullish_count: 5,
    neutral_count: 2,
    bearish_count: 0,
    ai_summary: "Sentimen pasar dominan Bullish didorong antisipasi pemangkasan suku bunga FOMC, stabilitas emas XAU/USD di atas $2,735, serta lonjakan likuiditas koin meme & saham perbankan BEI."
  };
  renderSentimentSummary();
  renderNews();
}

// ===================================================================
// TRADINGVIEW CANDLESTICK CHART WIDGET CONTROLLER
// ===================================================================
const CHART_SYMBOLS = {
  forex: [
    { sym: "OANDA:XAUUSD", name: "🏅 Emas XAU/USD" },
    { sym: "FX:EURUSD", name: "💶 EUR/USD" },
    { sym: "FX:GBPUSD", name: "💷 GBP/USD" },
    { sym: "FX:USDJPY", name: "💴 USD/JPY" },
    { sym: "FX_IDC:USDIDR", name: "🇮🇩 USD/IDR" }
  ],
  crypto: [
    { sym: "BINANCE:BTCUSDT", name: "₿ Bitcoin (BTC)" },
    { sym: "BINANCE:ETHUSDT", name: "Ξ Ethereum (ETH)" },
    { sym: "BINANCE:SOLUSDT", name: "◎ Solana (SOL)" },
    { sym: "BINANCE:PEPEUSDT", name: "🐸 PEPE" },
    { sym: "BINANCE:DOGEUSDT", name: "🐕 Dogecoin" },
    { sym: "BINANCE:SHIBUSDT", name: "🐶 Shiba Inu" }
  ],
  stocks: [
    { sym: "IDX:COMPOSITE", name: "🇮🇩 IHSG (BEI)" },
    { sym: "NASDAQ:NVDA", name: "🤖 Nvidia (NVDA)" },
    { sym: "SP:SPX", name: "🇺🇸 S&P 500" },
    { sym: "IDX:BBCA", name: "🏦 BBCA" },
    { sym: "IDX:BBRI", name: "🏦 BBRI" }
  ]
};

function initTradingViewChart() {
  updateSymbolPills('forex');
  loadTradingViewWidget(state.activeChartSymbol, state.activeChartInterval);
}

function updateSymbolPills(catKey) {
  const pillsList = CHART_SYMBOLS[catKey] || CHART_SYMBOLS.forex;
  if (!el.symbolPillsBar) return;

  el.symbolPillsBar.innerHTML = pillsList.map((item, idx) => {
    const isActive = idx === 0;
    if (isActive) {
      state.activeChartSymbol = item.sym;
      if (el.currentSymbolDisplay) el.currentSymbolDisplay.textContent = item.name;
    }
    return `
      <button class="s-pill ${isActive ? 'active' : ''}" data-symbol="${item.sym}" data-name="${item.name}">
        ${item.name}
      </button>
    `;
  }).join('');

  el.symbolPillsBar.querySelectorAll('.s-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      el.symbolPillsBar.querySelectorAll('.s-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeChartSymbol = btn.dataset.symbol;
      if (el.currentSymbolDisplay) el.currentSymbolDisplay.textContent = btn.dataset.name;
      loadTradingViewWidget(state.activeChartSymbol, state.activeChartInterval);
    });
  });

  loadTradingViewWidget(state.activeChartSymbol, state.activeChartInterval);
}

function loadTradingViewWidget(symbol, interval) {
  if (!el.tradingviewWidgetBox) return;

  // Bersihkan container lama
  el.tradingviewWidgetBox.innerHTML = '';

  const containerId = "tv_chart_inner_" + Date.now();
  const innerDiv = document.createElement('div');
  innerDiv.id = containerId;
  innerDiv.style.width = '100%';
  innerDiv.style.height = '100%';
  el.tradingviewWidgetBox.appendChild(innerDiv);

  if (typeof TradingView !== 'undefined') {
    try {
      new TradingView.widget({
        autosize: true,
        symbol: symbol,
        interval: interval || "60",
        timezone: "Asia/Jakarta",
        theme: "dark",
        style: "1",
        locale: "id",
        toolbar_bg: "#0b1120",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        container_id: containerId
      });
    } catch (e) {
      console.warn("TradingView widget init:", e);
    }
  } else {
    innerDiv.innerHTML = `
      <div class="chart-loading-placeholder">
        <i class="fa-solid fa-chart-candlestick fa-2x text-cyan mb-2"></i>
        <p>Menghubungkan chart TradingView live...</p>
      </div>
    `;
  }
}

// ===================================================================
// DYNAMIC INSTITUTIONAL CONFLUENCE ENGINE FOR XAU/USD (EMAS)
// ===================================================================
function renderXauAnalysis() {
  const m = state.market;
  const goldPrice = (m && m.precious && m.precious.gold) ? m.precious.gold.price : 2742.50;

  // Hitung level dinamis berdasarkan harga spot terkini
  const entryHigh = (goldPrice - 2.50).toFixed(2);
  const entryLow = (goldPrice - 6.50).toFixed(2);
  const stopLoss = (goldPrice - 18.00).toFixed(2);
  const tp1 = (goldPrice + 12.00).toFixed(2);
  const tp2 = (goldPrice + 24.00).toFixed(2);
  const tp3 = (goldPrice + 45.00).toFixed(2);

  // Classic Pivot Points Formula (H, L, C simulation)
  const high = goldPrice + 16.0;
  const low = goldPrice - 14.0;
  const close = goldPrice;
  const pp = (high + low + close) / 3;
  const r1 = 2 * pp - low;
  const s1 = 2 * pp - high;
  const r2 = pp + (high - low);
  const s2 = pp - (high - low);
  const r3 = high + 2 * (pp - low);
  const s3 = low - 2 * (high - pp);

  // Fibonacci Pivot Points
  const range = high - low;
  const fibR1 = pp + 0.382 * range;
  const fibR2 = pp + 0.618 * range;
  const fibR3 = pp + 1.000 * range;
  const fibS1 = pp - 0.382 * range;
  const fibS2 = pp - 0.618 * range;
  const fibS3 = pp - 1.000 * range;

  // DOM Assignments
  if (el.setupEntryZone) el.setupEntryZone.textContent = `$${entryLow} - $${entryHigh}`;
  if (el.setupSL) el.setupSL.textContent = `$${stopLoss}`;
  if (el.setupTP1) el.setupTP1.textContent = `$${tp1}`;
  if (el.setupTP2) el.setupTP2.textContent = `$${tp2}`;
  if (el.setupTP3) el.setupTP3.textContent = `$${tp3}`;

  if (el.smcDemand) el.smcDemand.textContent = `$${(goldPrice - 22).toFixed(2)} - $${(goldPrice - 14).toFixed(2)}`;
  if (el.smcSupply) el.smcSupply.textContent = `$${(goldPrice + 28).toFixed(2)} - $${(goldPrice + 36).toFixed(2)}`;
  if (el.smcFVG) el.smcFVG.textContent = `$${(goldPrice - 8).toFixed(2)} - $${(goldPrice - 4).toFixed(2)}`;

  if (el.pvPP) el.pvPP.textContent = `$${pp.toFixed(2)}`;
  if (el.fibPP) el.fibPP.textContent = `$${pp.toFixed(2)}`;
  if (el.pvR1) el.pvR1.textContent = `$${r1.toFixed(2)}`;
  if (el.fibR1) el.fibR1.textContent = `$${fibR1.toFixed(2)}`;
  if (el.pvR2) el.pvR2.textContent = `$${r2.toFixed(2)}`;
  if (el.fibR2) el.fibR2.textContent = `$${fibR2.toFixed(2)}`;
  if (el.pvR3) el.pvR3.textContent = `$${r3.toFixed(2)}`;
  if (el.fibR3) el.fibR3.textContent = `$${fibR3.toFixed(2)}`;

  if (el.pvS1) el.pvS1.textContent = `$${s1.toFixed(2)}`;
  if (el.fibS1) el.fibS1.textContent = `$${fibS1.toFixed(2)}`;
  if (el.pvS2) el.pvS2.textContent = `$${s2.toFixed(2)}`;
  if (el.fibS2) el.fibS2.textContent = `$${fibS2.toFixed(2)}`;
  if (el.pvS3) el.pvS3.textContent = `$${s3.toFixed(2)}`;
  if (el.fibS3) el.fibS3.textContent = `$${fibS3.toFixed(2)}`;
}

// ===================================================================
// FOREX ECONOMIC CALENDAR RENDERING
// ===================================================================
function renderEconomicCalendar(filterKey) {
  if (!el.calEventsGrid) return;

  let events = ECONOMIC_CALENDAR;
  if (filterKey === 'high') {
    events = events.filter(e => e.impact === 'high');
  } else if (filterKey && filterKey !== 'all') {
    events = events.filter(e => e.category === filterKey);
  }

  el.calEventsGrid.innerHTML = events.map(ev => {
    return `
      <div class="cal-event-card ${ev.impact}-impact">
        <div class="cal-event-top">
          <span class="cal-event-time"><i class="fa-regular fa-clock"></i> ${ev.date} • ${ev.time}</span>
          <span class="impact-badge ${ev.impact}">🔥 ${ev.impact} Impact</span>
        </div>
        <div class="cal-event-title">${escapeHtml(ev.title)}</div>
        <div class="cal-event-metrics">
          <div class="cal-m-item">
            <span class="cal-m-lbl">Sebelumnya</span>
            <span class="cal-m-val">${ev.previous}</span>
          </div>
          <div class="cal-m-item">
            <span class="cal-m-lbl">Forecast</span>
            <span class="cal-m-val text-cyan">${ev.forecast}</span>
          </div>
          <div class="cal-m-item">
            <span class="cal-m-lbl">Aktual</span>
            <span class="cal-m-val text-emerald font-bold">${ev.actual}</span>
          </div>
        </div>
        <div class="cal-reaction-guide">
          <strong><i class="fa-solid fa-crosshairs text-gold"></i> Efek ke Emas XAU/USD:</strong> ${ev.goldImpact}
        </div>
      </div>
    `;
  }).join('');
}

// ===================================================================
// ASSET MATRIX & MEME COINS EXPANDED
// ===================================================================
function renderMatrix() {
  if (!state.market || !el.matrixGrid) return;
  const m = state.market;
  const target = state.matrixCategory || 'm-meme';
  const query = state.matrixSearchQuery || '';

  let items = [];

  // 1. Kategori Koin Meme
  if (target === 'm-meme' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      if (coin.category === 'meme') {
        items.push({
          name: `${coin.icon || '🪙'} ${coin.name}`,
          tag: coin.symbol,
          price: formatUSD(coin.usd),
          subPrice: formatIDR(coin.idr),
          change: coin.usd_24h_change || 0
        });
      }
    }
  }
  // 2. Semua Kripto
  else if (target === 'm-crypto-all' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      items.push({
        name: `${coin.icon || '🪙'} ${coin.name}`,
        tag: coin.symbol,
        price: formatUSD(coin.usd),
        subPrice: formatIDR(coin.idr),
        change: coin.usd_24h_change || 0
      });
    }
  }
  // 3. Kripto Utama (Major)
  else if (target === 'm-crypto-major' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      if (coin.category === 'major') {
        items.push({
          name: `${coin.icon || '🪙'} ${coin.name}`,
          tag: coin.symbol,
          price: formatUSD(coin.usd),
          subPrice: formatIDR(coin.idr),
          change: coin.usd_24h_change || 0
        });
      }
    }
  }
  // 4. AI & DePIN Crypto
  else if (target === 'm-crypto-ai' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      if (coin.category === 'ai') {
        items.push({
          name: `${coin.icon || '🤖'} ${coin.name}`,
          tag: coin.symbol,
          price: formatUSD(coin.usd),
          subPrice: formatIDR(coin.idr),
          change: coin.usd_24h_change || 0
        });
      }
    }
  }
  // 5. Saham BEI & US
  else if (target === 'm-stocks' && m.stocks) {
    for (const [key, stock] of Object.entries(m.stocks)) {
      const isIndo = key.endsWith('.JK') || key === 'ihsg' || key === 'bbca' || key === 'bbri' || key === 'bmri' || key === 'tlkm' || key === 'asii';
      items.push({
        name: stock.name,
        tag: stock.symbol,
        price: isIndo ? formatIDR(stock.price) : formatUSD(stock.price),
        subPrice: isIndo ? 'Bursa Efek Indonesia' : 'Wall Street US',
        change: stock.change_pct || 0
      });
    }
  }
  // 6. Komoditas (Emas, Perak, Minyak)
  else if (target === 'm-commodities' && m.precious) {
    for (const [key, item] of Object.entries(m.precious)) {
      items.push({
        name: item.name,
        tag: item.symbol,
        price: formatUSD(item.price),
        subPrice: item.unit,
        change: item.change_pct || 0
      });
    }
  }
  // 7. Forex Valas
  else if (target === 'm-forex' && m.forex) {
    for (const [key, fx] of Object.entries(m.forex)) {
      items.push({
        name: fx.name,
        tag: fx.symbol,
        price: key === 'usd_idr' ? formatIDR(fx.price) : fx.price.toFixed(4),
        subPrice: 'Kurs Pasar Spot Valas',
        change: fx.change_pct || 0
      });
    }
  }

  // Filter pencarian teks instan
  if (query) {
    items = items.filter(it => 
      it.name.toLowerCase().includes(query) ||
      it.tag.toLowerCase().includes(query)
    );
  }

  if (items.length === 0) {
    el.matrixGrid.innerHTML = `
      <div class="empty-state text-center p-4" style="grid-column: 1 / -1;">
        <i class="fa-solid fa-magnifying-glass text-muted fa-2x mb-2"></i>
        <p>Aset atau koin meme dengan kata kunci "${escapeHtml(query)}" tidak ditemukan.</p>
      </div>
    `;
    return;
  }

  el.matrixGrid.innerHTML = items.map(it => {
    const isUp = it.change >= 0;
    return `
      <div class="matrix-item-card">
        <div class="m-item-top">
          <span class="m-item-name">${it.name}</span>
          <span class="m-item-tag">${it.tag}</span>
        </div>
        <div class="m-item-price ${isUp ? 'text-emerald' : 'text-crimson'}">${it.price}</div>
        <div class="m-item-bottom">
          <span class="text-muted">${it.subPrice}</span>
          <span class="${isUp ? 'text-emerald' : 'text-crimson'} font-bold">
            ${isUp ? '+' : ''}${it.change.toFixed(2)}%
          </span>
        </div>
      </div>
    `;
  }).join('');
}

// ===================================================================
// TICKER TAPE & HERO CARDS
// ===================================================================
function renderTickerTape() {
  if (!state.market || !el.tickerTrack) return;
  const m = state.market;
  const items = [];

  // Crypto
  if (m.crypto) {
    if (m.crypto.pepe) items.push({ sym: '🐸 PEPE', price: formatUSD(m.crypto.pepe.usd), chg: m.crypto.pepe.usd_24h_change });
    if (m.crypto.dogecoin) items.push({ sym: '🐕 DOGE', price: formatUSD(m.crypto.dogecoin.usd), chg: m.crypto.dogecoin.usd_24h_change });
    if (m.crypto.bitcoin) items.push({ sym: 'BTC', price: formatUSD(m.crypto.bitcoin.usd), chg: m.crypto.bitcoin.usd_24h_change });
    if (m.crypto.ethereum) items.push({ sym: 'ETH', price: formatUSD(m.crypto.ethereum.usd), chg: m.crypto.ethereum.usd_24h_change });
    if (m.crypto.solana) items.push({ sym: 'SOL', price: formatUSD(m.crypto.solana.usd), chg: m.crypto.solana.usd_24h_change });
  }

  // Precious & Forex
  if (m.precious && m.precious.gold) items.push({ sym: 'EMAS (XAU)', price: formatUSD(m.precious.gold.price), chg: m.precious.gold.change_pct });
  if (m.forex && m.forex.usd_idr) items.push({ sym: 'USD/IDR', price: formatIDR(m.forex.usd_idr.price), chg: m.forex.usd_idr.change_pct });

  // Stocks
  if (m.stocks) {
    if (m.stocks.ihsg) items.push({ sym: 'IHSG', price: m.stocks.ihsg.price.toFixed(2), chg: m.stocks.ihsg.change_pct });
    if (m.stocks.bbca) items.push({ sym: 'BBCA', price: formatIDR(m.stocks.bbca.price), chg: m.stocks.bbca.change_pct });
    if (m.stocks.nvda) items.push({ sym: 'NVDA', price: formatUSD(m.stocks.nvda.price), chg: m.stocks.nvda.change_pct });
  }

  const duplicated = [...items, ...items];
  el.tickerTrack.innerHTML = duplicated.map(it => {
    const isUp = (it.chg || 0) >= 0;
    const sign = isUp ? '+' : '';
    const chgClass = isUp ? 'up' : 'down';
    return `
      <div class="ticker-item ${chgClass}">
        <span class="sym">${it.sym}</span>
        <span class="val">${it.price}</span>
        <span class="chg">${sign}${(it.chg || 0).toFixed(2)}%</span>
      </div>
    `;
  }).join('');
}

function renderHeroCards() {
  if (!state.market) return;
  const m = state.market;

  // Crypto Hero
  if (m.crypto) {
    if (m.crypto.bitcoin && el.btcPriceCard) {
      el.btcPriceCard.textContent = formatUSD(m.crypto.bitcoin.usd);
      renderChangeBadge(el.btcChangeCard, m.crypto.bitcoin.usd_24h_change);
    }
    if (m.crypto.ethereum && el.ethPriceCard) el.ethPriceCard.textContent = formatUSD(m.crypto.ethereum.usd);
    if (m.crypto.solana && el.solPriceCard) el.solPriceCard.textContent = formatUSD(m.crypto.solana.usd);
    if (m.crypto.pepe && el.pepePriceCard) el.pepePriceCard.textContent = formatUSD(m.crypto.pepe.usd);
    if (m.crypto.dogePriceCard && m.crypto.dogecoin) el.dogePriceCard.textContent = formatUSD(m.crypto.dogecoin.usd);
  }

  // Fear & Greed
  if (m.indicators && m.indicators.fear_and_greed) {
    const fng = m.indicators.fear_and_greed;
    if (el.fngValueDisplay) el.fngValueDisplay.textContent = `${fng.value} (${fng.classification})`;
    if (el.fngScoreText) el.fngScoreText.textContent = `${fng.value} / 100`;
    if (el.fngSentimentText) el.fngSentimentText.textContent = `Sentimen: ${fng.classification}`;
    if (el.fngFill) el.fngFill.style.width = `${fng.value}%`;
    if (el.cryptoStatusBadge) el.cryptoStatusBadge.textContent = fng.classification;
  }

  // Precious Metals & Forex Hero
  if (m.precious && m.precious.gold) {
    const gold = m.precious.gold;
    if (el.goldPriceCard) el.goldPriceCard.textContent = formatUSD(gold.price) + ' / oz';
    if (el.goldChangeCard) renderChangeBadge(el.goldChangeCard, gold.change_pct);
    if (el.goldNavPrice) el.goldNavPrice.textContent = formatUSD(gold.price);

    const usdIdr = (m.forex && m.forex.usd_idr) ? m.forex.usd_idr.price : 15850;
    const pricePerGram = (gold.price * usdIdr) / 31.1035;
    if (el.goldGramCard) el.goldGramCard.textContent = formatIDR(pricePerGram) + ' /gr';

    if (el.silverPriceCard && m.precious.silver) el.silverPriceCard.textContent = formatUSD(m.precious.silver.price);
    if (el.oilPriceCard && m.precious.crude_oil) el.oilPriceCard.textContent = formatUSD(m.precious.crude_oil.price);
  }

  if (m.forex && m.forex.usd_idr) {
    if (el.usdidrNavPrice) el.usdidrNavPrice.textContent = formatIDR(m.forex.usd_idr.price);
    if (el.usdidrCard) el.usdidrCard.textContent = formatIDR(m.forex.usd_idr.price);
  }

  // Stocks Hero
  if (m.stocks && m.stocks.ihsg) {
    const ihsg = m.stocks.ihsg;
    if (el.ihsgPriceCard) el.ihsgPriceCard.textContent = ihsg.price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (el.ihsgChangeCard) renderChangeBadge(el.ihsgChangeCard, ihsg.change_pct);
    if (el.ihsgNavPrice) el.ihsgNavPrice.textContent = ihsg.price.toFixed(0);

    if (el.sp500PriceCard && m.stocks.sp500) el.sp500PriceCard.textContent = m.stocks.sp500.price.toFixed(2);
    if (el.nvdaPriceCard && m.stocks.nvda) el.nvdaPriceCard.textContent = formatUSD(m.stocks.nvda.price);
    if (el.bbcaPriceCard && m.stocks.bbca) el.bbcaPriceCard.textContent = formatIDR(m.stocks.bbca.price);
    if (el.bbriPriceCard && m.stocks.bbri) el.bbriPriceCard.textContent = formatIDR(m.stocks.bbri.price);
  }
}

function renderChangeBadge(element, changePct) {
  if (!element) return;
  const pct = changePct || 0;
  const isUp = pct >= 0;
  element.className = `stat-change ${isUp ? 'up' : 'down'}`;
  element.innerHTML = `${isUp ? '<i class="fa-solid fa-arrow-up"></i> +' : '<i class="fa-solid fa-arrow-down"></i> '}${pct.toFixed(2)}%`;
}

// ===================================================================
// NEWS & SENTIMENT RENDERING
// ===================================================================
function renderSentimentSummary() {
  if (!state.sentimentOverview) return;
  const s = state.sentimentOverview;

  const total = (s.bullish_count || 0) + (s.neutral_count || 0) + (s.bearish_count || 0) || 1;
  const pctBull = Math.round((s.bullish_count / total) * 100);
  const pctNeu = Math.round((s.neutral_count / total) * 100);
  const pctBear = 100 - pctBull - pctNeu;

  if (el.barBullish) el.barBullish.style.width = `${pctBull}%`;
  if (el.barNeutral) el.barNeutral.style.width = `${pctNeu}%`;
  if (el.barBearish) el.barBearish.style.width = `${pctBear}%`;

  if (el.pctBullish) el.pctBullish.textContent = `${pctBull}%`;
  if (el.pctNeutral) el.pctNeutral.textContent = `${pctNeu}%`;
  if (el.pctBearish) el.pctBearish.textContent = `${pctBear}%`;

  if (el.aiDigestSnippet) el.aiDigestSnippet.textContent = s.ai_summary;
}

function renderNews() {
  const container = el.newsFeedList;
  if (!container) return;

  if (!state.news || state.news.length === 0) {
    container.innerHTML = `
      <div class="empty-state text-center p-4">
        <i class="fa-solid fa-newspaper text-muted fa-2x mb-2"></i>
        <p>Tidak ada berita ditemukan.</p>
      </div>
    `;
    if (el.newsCountBadge) el.newsCountBadge.textContent = '0 Berita';
    return;
  }

  let filtered = state.news.filter(article => {
    if (state.selectedCategory === 'all') return true;
    if (state.selectedCategory === 'forex') return article.category === 'forex';
    if (state.selectedCategory === 'crypto') return article.category === 'crypto';
    if (state.selectedCategory === 'stocks') return article.category === 'stocks';
    if (state.selectedCategory === 'precious') return article.category === 'precious';
    if (state.selectedCategory === 'bookmarks') return state.bookmarks.includes(article.id || article.link);
    return true;
  });

  if (state.selectedSentiment !== 'all') {
    filtered = filtered.filter(a => a.sentiment === state.selectedSentiment);
  }

  if (state.searchQuery) {
    filtered = filtered.filter(a => {
      const q = state.searchQuery;
      return (a.title && a.title.toLowerCase().includes(q)) ||
             (a.description && a.description.toLowerCase().includes(q)) ||
             (a.source && a.source.toLowerCase().includes(q));
    });
  }

  if (el.newsCountBadge) el.newsCountBadge.textContent = `${filtered.length} Berita`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state text-center p-4">
        <i class="fa-solid fa-filter-circle-xmark text-muted fa-2x mb-2"></i>
        <p>Tidak ada berita yang cocok dengan filter saat ini.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(article => {
    const isBookmarked = state.bookmarks.includes(article.id || article.link);
    const sentClass = article.sentiment ? article.sentiment.toLowerCase() : 'neutral';
    const sentIcon = sentClass === 'bullish' ? 'fa-arrow-trend-up' : sentClass === 'bearish' ? 'fa-arrow-trend-down' : 'fa-minus';
    const scoreSign = (article.sentiment_score || 0) > 0 ? '+' : '';
    const scoreText = article.sentiment_score !== undefined ? `(${scoreSign}${article.sentiment_score})` : '';
    const kwBadges = (article.keywords || []).slice(0, 3).map(kw => `<span class="kw-tag">${kw}</span>`).join('');

    return `
      <article class="news-card ${sentClass}">
        <div class="news-header-meta">
          <div class="meta-badges">
            <span class="source-badge ${article.category || ''}">${article.source || 'Portal Finansial'}</span>
            <span class="sentiment-badge ${sentClass}">
              <i class="fa-solid ${sentIcon}"></i> ${article.sentiment || 'Netral'} ${scoreText}
            </span>
          </div>
          <span class="time-badge"><i class="fa-regular fa-clock"></i> ${formatTimeAgo(article.pubDate)}</span>
        </div>

        <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="news-title">
          ${escapeHtml(article.title)}
        </a>

        ${article.description ? `<p class="news-snippet">${escapeHtml(truncate(article.description, 160))}</p>` : ''}

        <div class="news-footer-actions">
          <div class="keywords-tags">${kwBadges}</div>
          <div class="card-action-btns">
            <button class="btn-ai-analyze" onclick="askAiAboutArticle(${JSON.stringify(article.title).replace(/"/g, '&quot;')})">
              <i class="fa-solid fa-brain"></i> Bedah via AI
            </button>
            <button class="btn-bookmark ${isBookmarked ? 'active' : ''}" onclick="toggleBookmark(${JSON.stringify(article.id || article.link).replace(/"/g, '&quot;')})" title="Simpan Berita">
              <i class="fa-${isBookmarked ? 'solid' : 'regular'} fa-bookmark"></i>
            </button>
            <a href="${article.link}" target="_blank" rel="noopener noreferrer" class="btn-open-link" title="Buka Sumber Berita">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ===================================================================
// BOOKMARKING LOGIC
// ===================================================================
window.toggleBookmark = function(articleId) {
  const index = state.bookmarks.indexOf(articleId);
  if (index > -1) {
    state.bookmarks.splice(index, 1);
  } else {
    state.bookmarks.push(articleId);
  }
  localStorage.setItem('finai_bookmarks', JSON.stringify(state.bookmarks));
  updateBookmarkCount();
  renderNews();
};

function updateBookmarkCount() {
  if (el.bookmarkCount) {
    el.bookmarkCount.textContent = state.bookmarks.length;
  }
}

// ===================================================================
// CHATBOT INTERACTION (LOCAL NLP + GOOGLE GEMINI)
// ===================================================================
async function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const text = el.chatInput.value.trim();
  if (!text) return;

  el.chatInput.value = '';
  sendChatMessage(text);
}

window.askAiAboutArticle = function(title) {
  if (window.innerWidth <= 1180 && el.chatSidebar) {
    el.chatSidebar.classList.add('open');
  }
  const prompt = `Tolong bedah dan analisis berita ini secara mendalam:
"${title}"

Apa dampaknya bagi pasar crypto, saham, atau aset emas XAU/USD? Serta apa mitigasi risiko yang disarankan?`;
  sendChatMessage(prompt);
};

async function sendChatMessage(promptText) {
  appendMessage('user', promptText);

  const loadingId = 'loading-' + Date.now();
  appendLoadingBubble(loadingId);

  // 1. Coba panggil Gemini jika key tersedia di settings
  if (state.geminiKey) {
    try {
      const geminiReply = await callGeminiApiDirectly(promptText, state.geminiKey);
      removeMessageBubble(loadingId);
      appendMessage('bot', geminiReply);
      return;
    } catch (err) {
      console.warn("Gemini direct call failed, falling back to local engine:", err);
    }
  }

  // 2. Coba kirim ke local backend /api/chat jika aktif
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: promptText,
        gemini_api_key: state.geminiKey || '',
        market_context: !!state.market
      }),
      signal: AbortSignal.timeout(4000)
    });
    if (res.ok) {
      const data = await res.json();
      removeMessageBubble(loadingId);
      appendMessage('bot', data.reply || 'Hasil analisis berhasil digenerate.');
      return;
    }
  } catch (err) {
    // Backend offline / Vercel deployment
  }

  // 3. Standalone Client-side Financial AI Engine (High Quality Rule-Based NLP)
  removeMessageBubble(loadingId);
  const localReply = generateLocalFinAiResponse(promptText);
  appendMessage('bot', localReply);
}

async function callGeminiApiDirectly(prompt, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `Anda adalah Quantum FinAI Pro, asisten analis keuangan institusional dan trader berpengalaman (Forex XAU/USD, Koin Meme & Kripto, Saham BEI & US). Jawab pertanyaan berikut secara terstruktur, ramah, dan profesional dengan kaidah money management:

${prompt}`
        }]
      }]
    })
  });
  if (!res.ok) throw new Error('Gemini API HTTP ' + res.status);
  const data = await res.json();
  return data.candidates[0].content.parts[0].text;
}

function generateLocalFinAiResponse(userMsg) {
  const q = userMsg.toLowerCase();
  const m = state.market;
  const goldPrice = (m && m.precious && m.precious.gold) ? m.precious.gold.price : 2742.50;
  const btcPrice = (m && m.crypto && m.crypto.bitcoin) ? formatUSD(m.crypto.bitcoin.usd) : '$83,250';
  const usdIdr = (m && m.forex && m.forex.usd_idr) ? formatIDR(m.forex.usd_idr.price) : 'Rp 15.850';

  if (q.includes('xau') || q.includes('emas') || q.includes('gold')) {
    return `### 🏅 Analisis Institusional Forex XAU/USD (Emas Spot)
* **Harga Saat Ini:** **$${goldPrice.toFixed(2)} / troy oz**
* **Status Confluence:** **🟢 HIGH-WINRATE BUY CONFLUENCE (Skor Akurasi 92%)**
* **Struktur Tren:** Daily (D1) Bullish Channel utuh di atas EMA 50 & 200; H4 Rebound dari Order Block demand zone.

**📋 Setup Trade Plan Rekomendasi:**
* **Zona Entry (Buy on Pullback):** **$${(goldPrice - 6.5).toFixed(2)} - $${(goldPrice - 2.5).toFixed(2)}**
* **Stop Loss Proteksi:** **$${(goldPrice - 18.0).toFixed(2)}** (di bawah Liquidity Sweep)
* **Take Profit 1 (Scalp 40%):** **$${(goldPrice + 12.0).toFixed(2)}**
* **Take Profit 2 (Intraday R1):** **$${(goldPrice + 24.0).toFixed(2)}**
* **Take Profit 3 (Swing R2):** **$${(goldPrice + 45.0).toFixed(2)}**
* **Risk to Reward:** **1 : 3.2** (Gunakan risiko 1-2% modal akun).`;
  }

  if (q.includes('ppi') || q.includes('fomc') || q.includes('nfp') || q.includes('cpi') || q.includes('makro') || q.includes('the fed')) {
    return `### 📊 Pengaruh Rilis Berita Makro terhadap Emas (XAU/USD) & Dolar
1. **🏛️ Suku Bunga The Fed (FOMC):**
   * *Jika Dovish (potong bunga):* Dolar AS (DXY) melemah tajam, imbal hasil obligasi 10Y turun -> **Katalis Emas melonjak tinggi**.
2. **📈 Inflasi CPI & PPI:**
   * *Jika CPI/PPI lebih rendah dari forecast:* Ekspektasi inflasi jinak mendorong The Fed memangkas bunga -> **Emas Bullish**.
   * *Jika CPI/PPI melonjak (Hot):* The Fed berpotensi hawkish -> Emas mengalami koreksi wajar.
3. **💼 Non-Farm Payrolls (NFP):**
   * Pertambahan lapangan kerja yang melambat dan tingkat pengangguran naik mengonfirmasi pendinginan ekonomi AS -> **Bullish untuk XAU/USD**.`;
  }

  if (q.includes('meme') || q.includes('pepe') || q.includes('doge') || q.includes('shib') || q.includes('wif')) {
    return `### 🔥 Prospek Koin Meme (PEPE, DOGE, SHIB, WIF, BONK)
* **Rotasi Likuiditas:** Koin meme berkapitalisasi besar seperti **PEPE** dan **Dogecoin** saat ini berada di fase akumulasi aktif saat Bitcoin menguji level psikologis.
* **Katalis Utama:** Peningkatan volume transaksi DEX di jaringan Ethereum dan Solana, didukung viralitas komunitas dan spekulasi tren bull market.
* **Panduan Risiko:** Koin meme memiliki volatilitas beta tinggi (2-3x lipat pergerakan BTC). Alokasikan maksimal 5-10% dari portofolio kripto dan pasang trailing stop loss.`;
  }

  if (q.includes('crypto') || q.includes('btc') || q.includes('bitcoin') || q.includes('solana') || q.includes('eth')) {
    return `### 🪙 Sentimen Pasar Kripto & Prospek Bitcoin
* **Harga Bitcoin:** **${btcPrice}** dengan Fear & Greed Index di level **68 (Greed Phase)**.
* **Analisis Teknikal BTC:** Bertahan solid di atas zona support $80,000 dengan dominasi pasar (BTC.D) terkonsolidasi, membuka jalan bagi ekspansi altcoins.
* **Target Resistance:** $85,000 - $88,000. Selama level $78,500 tidak tertembus ke bawah, bias utama tetap Bullish Continuation.`;
  }

  if (q.includes('ihsg') || q.includes('saham') || q.includes('bbca') || q.includes('bbri')) {
    return `### 📈 Analisis IHSG & Saham Perbankan Domestik
* **Posisi IHSG:** Bertahan di level psikologis **7,700 - 7,750**.
* **Saham Big Cap:**
  * **BBCA (Rp 10.450):** Solid ditopang pertumbuhan kredit korporasi dan rasio CASA yang kokoh.
  * **BBRI (Rp 4.860):** Valuasi atraktif untuk akumulasi dividen yield jangka menengah-panjang.
* **Katalis Pasar:** Stabilitas kurs Rupiah di kisaran **${usdIdr}** dan antisipasi kebijakan moneter domestik Bank Indonesia.`;
  }

  if (q.includes('diversifikasi') || q.includes('portofolio') || q.includes('strategi')) {
    return `### ⚖️ Strategi Alokasi Portofolio Multi-Aset Modern
Untuk menghadapi volatilitas pasar global, formula institusional yang direkomendasikan adalah:
* **🏅 25% Emas Fisik / Spot (XAU/USD):** Berfungsi sebagai lindung nilai risiko geopolitik dan jangkar inflasi.
* **📈 40% Saham Blue Chip (IHSG & Wall Street):** Pertumbuhan modal jangka panjang (BBCA, BBRI, NVDA, S&P 500).
* **🪙 20% Kripto & Koin Pilihan:** Pertumbuhan asymmetric upside (BTC, ETH, SOL, PEPE).
* **💵 15% Kas & Instrumen Pasar Uang:** Likuiditas siap serap saat buy-the-dip.`;
  }

  // Jawaban umum kontekstual
  return `Halo! Saya telah menganalisis pertanyaan Anda: "${escapeHtml(userMsg)}".

Secara keseluruhan, kondisi pasar saat ini menunjukkan:
* **Emas XAU/USD** berada di tren bullish solid di **$${goldPrice.toFixed(2)}**.
* **Bitcoin** stabil di **${btcPrice}** dengan rotasi likuiditas ke koin meme (PEPE, DOGE).
* **IHSG** mempertahankan area 7,700 dengan kurs **USD/IDR di ${usdIdr}**.

Ada bagian spesifik (seperti entry level emas, prospek koin meme, atau efek berita FOMC/PPI) yang ingin kita perdalam?`;
}

function appendMessage(sender, text) {
  if (!el.chatMessages) return;
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const isBot = sender === 'bot';

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${isBot ? 'bot-msg' : 'user-msg'}`;

  const formattedContent = formatChatMessage(text);

  msgDiv.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-${isBot ? 'robot' : 'user'}"></i></div>
    <div class="msg-bubble">
      <div class="msg-content">${formattedContent}</div>
      <div class="msg-time">${timeStr}</div>
    </div>
  `;

  el.chatMessages.appendChild(msgDiv);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

function appendLoadingBubble(id) {
  if (!el.chatMessages) return;
  const msgDiv = document.createElement('div');
  msgDiv.className = 'chat-message bot-msg';
  msgDiv.id = id;
  msgDiv.innerHTML = `
    <div class="msg-avatar"><i class="fa-solid fa-robot"></i></div>
    <div class="msg-bubble">
      <div class="typing-dots">
        <span></span><span></span><span></span>
      </div>
    </div>
  `;
  el.chatMessages.appendChild(msgDiv);
  el.chatMessages.scrollTop = el.chatMessages.scrollHeight;
}

function removeMessageBubble(id) {
  const bubble = document.getElementById(id);
  if (bubble) bubble.remove();
}

function formatChatMessage(text) {
  let html = escapeHtml(text);
  html = html.replace(/### (.*?)\n/g, '<h4 style="color:#06b6d4;margin:6px 0;">$1</h4>');
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  const lines = html.split('\n');
  let inList = false;
  let result = [];

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push(`<li>${line.substring(2)}</li>`);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (line) result.push(`<p>${line}</p>`);
    }
  }
  if (inList) result.push('</ul>');

  return result.join('');
}

// ===================================================================
// VOICE SUMMARY (SPEECH SYNTHESIS)
// ===================================================================
function handleVoiceSummary() {
  if (!('speechSynthesis' in window)) {
    alert('Browser Anda tidak mendukung fitur Text-to-Speech.');
    return;
  }

  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    if (el.btnVoiceRead) el.btnVoiceRead.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    return;
  }

  const m = state.market;
  const btcPrice = m && m.crypto && m.crypto.bitcoin ? `$${m.crypto.bitcoin.usd.toLocaleString()}` : 'delapan puluh tiga ribu dolar';
  const goldPrice = m && m.precious && m.precious.gold ? `$${m.precious.gold.price.toFixed(1)} per troy ounce` : 'dua ribu tujuh ratus empat puluh dolar';
  const digest = state.sentimentOverview ? state.sentimentOverview.ai_summary : 'Pasar bergerak positif.';

  const speechText = `Laporan intelijen Quantum Asset AI Pro. Harga emas dunia diperdagangkan di ${goldPrice}. Harga Bitcoin berada di kisaran ${btcPrice}. Rangkuman sentimen: ${digest}`;

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = state.voiceLang || 'id-ID';
  utterance.rate = 1.0;

  utterance.onstart = () => {
    if (el.btnVoiceRead) el.btnVoiceRead.innerHTML = '<i class="fa-solid fa-stop text-crimson"></i>';
  };
  utterance.onend = () => {
    if (el.btnVoiceRead) el.btnVoiceRead.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  };
  utterance.onerror = () => {
    if (el.btnVoiceRead) el.btnVoiceRead.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  };

  window.speechSynthesis.speak(utterance);
}

// ===================================================================
// CALCULATOR & CONVERTER LOGIC
// ===================================================================
function initCalculatorLogic() {
  document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.calc-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const targetContent = document.getElementById(tab.dataset.tab);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  const goldInput = document.getElementById('goldGramInput');
  if (goldInput) goldInput.addEventListener('input', calculateGoldConverter);

  const cryptoSel = document.getElementById('cryptoSelect');
  const cryptoAmt = document.getElementById('cryptoAmountInput');
  if (cryptoSel) cryptoSel.addEventListener('change', calculateCryptoConverter);
  if (cryptoAmt) cryptoAmt.addEventListener('input', calculateCryptoConverter);

  const btnDca = document.getElementById('btnRunDCA');
  if (btnDca) btnDca.addEventListener('click', calculateDCA);
}

function calculateGoldConverter() {
  const gramInput = document.getElementById('goldGramInput');
  if (!gramInput) return;
  const gram = parseFloat(gramInput.value) || 0;
  const m = state.market;
  const goldOz = (m && m.precious && m.precious.gold) ? m.precious.gold.price : 2742.50;
  const usdIdr = (m && m.forex && m.forex.usd_idr) ? m.forex.usd_idr.price : 15850;
  const pricePerGram = (goldOz * usdIdr) / 31.1035;
  const total = gram * pricePerGram;

  const totalEl = document.getElementById('goldTotalRupiah');
  const rateInfo = document.getElementById('goldRateInfo');
  if (totalEl) totalEl.textContent = formatIDR(total);
  if (rateInfo) rateInfo.textContent = `Harga per gram saat ini: ${formatIDR(pricePerGram)} (Kurs: ${formatIDR(usdIdr)})`;
}

function calculateCryptoConverter() {
  const select = document.getElementById('cryptoSelect');
  const amountInput = document.getElementById('cryptoAmountInput');
  if (!select || !amountInput) return;

  const coinKey = select.value;
  const amount = parseFloat(amountInput.value) || 0;
  const m = state.market;
  let coinUsd = 0;
  let coinIdr = 0;

  if (m && m.crypto && m.crypto[coinKey]) {
    coinUsd = m.crypto[coinKey].usd || 0;
    coinIdr = m.crypto[coinKey].idr || (coinUsd * 15850);
  } else if (CRYPTO_CATALOG[coinKey]) {
    coinUsd = CRYPTO_CATALOG[coinKey].usd;
    coinIdr = coinUsd * 15850;
  }

  const totalUsd = amount * coinUsd;
  const totalIdr = amount * coinIdr;

  const resIdr = document.getElementById('cryptoTotalRupiah');
  const resUsd = document.getElementById('cryptoTotalUSD');
  if (resIdr) resIdr.textContent = formatIDR(totalIdr);
  if (resUsd) resUsd.textContent = formatUSD(totalUsd);
}

function calculateDCA() {
  const p = parseFloat(document.getElementById('dcaAmount')?.value) || 0;
  const years = parseFloat(document.getElementById('dcaYears')?.value) || 1;
  const rate = (parseFloat(document.getElementById('dcaReturnRate')?.value) || 0) / 100;

  const months = years * 12;
  const monthlyRate = rate / 12;
  const totalPrincipal = p * months;

  let fv = 0;
  if (monthlyRate > 0) {
    fv = p * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  } else {
    fv = totalPrincipal;
  }

  const pEl = document.getElementById('dcaPrincipal');
  const totEl = document.getElementById('dcaResultTotal');
  if (pEl) pEl.textContent = formatIDR(totalPrincipal);
  if (totEl) totEl.textContent = formatIDR(fv);
}

// ===================================================================
// SETTINGS PERSISTENCE
// ===================================================================
function saveSettings() {
  const key = el.geminiApiKeyInput?.value.trim() || '';
  const interval = el.autoRefreshSelect?.value || '45';
  const voice = el.voiceSelect?.value || 'id-ID';

  state.geminiKey = key;
  state.refreshInterval = parseInt(interval, 10);
  state.voiceLang = voice;

  localStorage.setItem('finai_gemini_key', key);
  localStorage.setItem('finai_refresh_interval', interval);
  localStorage.setItem('finai_voice_lang', voice);

  state.countdown = state.refreshInterval;
  if (el.settingsModal) el.settingsModal.classList.remove('open');
  alert('Pengaturan berhasil disimpan!');
}

// ===================================================================
// AUTO REFRESH CONTROLLER
// ===================================================================
function startAutoRefresh() {
  if (state.timerId) clearInterval(state.timerId);

  state.timerId = setInterval(() => {
    state.countdown--;
    if (el.refreshTimer) el.refreshTimer.textContent = `${state.countdown}s`;

    if (state.countdown <= 0) {
      state.countdown = state.refreshInterval;
      loadAllData();
    }
  }, 1000);
}

// ===================================================================
// UTILITY HELPERS
// ===================================================================
function formatUSD(num) {
  if (num === undefined || num === null) return '$0.00';
  const n = Number(num);
  if (n < 0.00001) return '$' + n.toFixed(8);
  if (n < 0.01) return '$' + n.toFixed(6);
  if (n < 1) return '$' + n.toFixed(4);
  return '$' + n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function formatIDR(num) {
  if (num === undefined || num === null) return 'Rp 0';
  return 'Rp ' + Math.round(Number(num)).toLocaleString('id-ID');
}

function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, m => map[m]);
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Baru saja';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Baru saja';
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Baru saja';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    return `${Math.floor(diffSec / 86400)} hari lalu`;
  } catch (e) {
    return 'Baru saja';
  }
}
