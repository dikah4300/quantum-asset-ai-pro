/**
 * QUANTUM ASSET AI - CLIENT-SIDE INTELLIGENCE & DASHBOARD CONTROLLER
 */

// Global State
const state = {
  market: null,
  news: [],
  sentimentOverview: null,
  selectedCategory: 'all',
  selectedSentiment: 'all',
  searchQuery: '',
  bookmarks: JSON.parse(localStorage.getItem('finai_bookmarks') || '[]'),
  countdown: 60,
  refreshInterval: 60,
  timerId: null,
  geminiKey: localStorage.getItem('finai_gemini_key') || '',
  voiceLang: localStorage.getItem('finai_voice_lang') || 'id-ID'
};

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

  // Matrix
  matrixGrid: document.getElementById('matrixGrid'),
  matrixPills: document.getElementById('matrixPills'),

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
  el.btnRefresh.addEventListener('click', () => {
    el.btnRefresh.querySelector('i').classList.add('fa-spin');
    loadAllData().finally(() => {
      setTimeout(() => el.btnRefresh.querySelector('i').classList.remove('fa-spin'), 600);
    });
  });

  // Search News
  el.searchNewsInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value.trim().toLowerCase();
    el.btnClearSearch.style.display = state.searchQuery ? 'block' : 'none';
    renderNews();
  });

  el.btnClearSearch.addEventListener('click', () => {
    el.searchNewsInput.value = '';
    state.searchQuery = '';
    el.btnClearSearch.style.display = 'none';
    renderNews();
  });

  // Category Tabs
  el.categoryTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('.tab-btn');
    if (!btn) return;
    el.categoryTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.selectedCategory = btn.dataset.cat;
    renderNews();
  });

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
  el.matrixPills.addEventListener('click', (e) => {
    const pill = e.target.closest('.m-pill');
    if (!pill) return;
    el.matrixPills.querySelectorAll('.m-pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    renderMatrix(pill.dataset.target);
  });

  // Chat Submission
  el.chatForm.addEventListener('submit', handleChatSubmit);
  el.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleChatSubmit(e);
    }
  });

  // Quick Prompt Chips
  el.promptChips.addEventListener('click', (e) => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const promptText = chip.dataset.prompt;
    sendChatMessage(promptText);
  });

  // Clear Chat History
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

  // Voice Read-Aloud
  el.btnVoiceRead.addEventListener('click', handleVoiceSummary);

  // Mobile Chat Drawer
  el.btnToggleChatMobile.addEventListener('click', () => el.chatSidebar.classList.add('open'));
  el.btnCloseMobileChat.addEventListener('click', () => el.chatSidebar.classList.remove('open'));

  // Modals Handling
  el.btnOpenCalculator.addEventListener('click', () => el.calcModal.classList.add('open'));
  el.btnCloseCalc.addEventListener('click', () => el.calcModal.classList.remove('open'));
  el.calcModal.addEventListener('click', (e) => {
    if (e.target === el.calcModal) el.calcModal.classList.remove('open');
  });

  el.btnSettings.addEventListener('click', () => el.settingsModal.classList.add('open'));
  el.btnCloseSettings.addEventListener('click', () => el.settingsModal.classList.remove('open'));
  el.settingsModal.addEventListener('click', (e) => {
    if (e.target === el.settingsModal) el.settingsModal.classList.remove('open');
  });

  el.btnSaveSettings.addEventListener('click', saveSettings);

  // Calculator Tabs & Logic
  initCalculatorLogic();
}

// ===================================================================
// DATA FETCHING (MARKET, NEWS, SENTIMENT)
// ===================================================================
async function loadAllData() {
  try {
    await Promise.all([
      fetchMarketData(),
      fetchNewsData()
    ]);
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

async function fetchMarketData() {
  try {
    const res = await fetch('/api/market');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.market = data;
    renderTickerTape();
    renderHeroCards();
    const activePill = el.matrixPills.querySelector('.m-pill.active');
    renderMatrix(activePill ? activePill.dataset.target : 'm-crypto');
    calculateGoldConverter();
    calculateCryptoConverter();
  } catch (err) {
    console.error('Gagal mengambil data pasar:', err);
  }
}

async function fetchNewsData() {
  try {
    const res = await fetch('/api/news');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    state.news = data.articles || [];
    state.sentimentOverview = data.sentiment_overview || null;
    renderSentimentSummary();
    renderNews();
  } catch (err) {
    console.error('Gagal mengambil berita:', err);
    el.newsFeedList.innerHTML = `
      <div class="empty-state text-center p-4">
        <i class="fa-solid fa-triangle-exclamation text-crimson fa-2x mb-2"></i>
        <p>Gagal memuat feed berita terkini. Periksa koneksi atau coba klik tombol refresh.</p>
      </div>
    `;
  }
}

// ===================================================================
// RENDERING TICKER TAPE & HERO CARDS
// ===================================================================
function renderTickerTape() {
  if (!state.market) return;
  const m = state.market;
  const items = [];

  // Crypto
  if (m.crypto) {
    if (m.crypto.bitcoin) items.push({ sym: 'BTC', price: formatUSD(m.crypto.bitcoin.usd), chg: m.crypto.bitcoin.usd_24h_change });
    if (m.crypto.ethereum) items.push({ sym: 'ETH', price: formatUSD(m.crypto.ethereum.usd), chg: m.crypto.ethereum.usd_24h_change });
    if (m.crypto.solana) items.push({ sym: 'SOL', price: formatUSD(m.crypto.solana.usd), chg: m.crypto.solana.usd_24h_change });
  }

  // Precious Metals & Forex
  if (m.precious) {
    if (m.precious.gold) items.push({ sym: 'EMAS (XAU)', price: formatUSD(m.precious.gold.price), chg: m.precious.gold.change_pct });
    if (m.precious.silver) items.push({ sym: 'PERAK (XAG)', price: formatUSD(m.precious.silver.price), chg: m.precious.silver.change_pct });
    if (m.precious.crude_oil) items.push({ sym: 'MINYAK WTI', price: formatUSD(m.precious.crude_oil.price), chg: m.precious.crude_oil.change_pct });
  }
  if (m.forex && m.forex.usd_idr) {
    items.push({ sym: 'USD/IDR', price: formatIDR(m.forex.usd_idr.price), chg: m.forex.usd_idr.change_pct });
  }

  // Stocks
  if (m.stocks) {
    if (m.stocks.ihsg) items.push({ sym: 'IHSG', price: m.stocks.ihsg.price.toFixed(2), chg: m.stocks.ihsg.change_pct });
    if (m.stocks.sp500) items.push({ sym: 'S&P 500', price: m.stocks.sp500.price.toFixed(2), chg: m.stocks.sp500.change_pct });
    if (m.stocks.nvda) items.push({ sym: 'NVDA', price: formatUSD(m.stocks.nvda.price), chg: m.stocks.nvda.change_pct });
    if (m.stocks.bbca) items.push({ sym: 'BBCA', price: formatIDR(m.stocks.bbca.price), chg: m.stocks.bbca.change_pct });
  }

  // Duplicate for seamless infinite marquee loop
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
  if (m.crypto && m.crypto.bitcoin) {
    const btc = m.crypto.bitcoin;
    el.btcPriceCard.textContent = formatUSD(btc.usd);
    renderChangeBadge(el.btcChangeCard, btc.usd_24h_change);
    el.ethPriceCard.textContent = m.crypto.ethereum ? formatUSD(m.crypto.ethereum.usd) : '--';
    el.solPriceCard.textContent = m.crypto.solana ? formatUSD(m.crypto.solana.usd) : '--';
  }

  // Fear & Greed
  if (m.indicators && m.indicators.fear_and_greed) {
    const fng = m.indicators.fear_and_greed;
    el.fngValueDisplay.textContent = `${fng.value} (${fng.classification})`;
    el.fngScoreText.textContent = `${fng.value} / 100`;
    el.fngSentimentText.textContent = `Sentimen: ${fng.classification}`;
    el.fngFill.style.width = `${fng.value}%`;
    el.cryptoStatusBadge.textContent = fng.classification;
  }

  // Precious Metals & Forex Hero
  if (m.precious && m.precious.gold) {
    const gold = m.precious.gold;
    el.goldPriceCard.textContent = formatUSD(gold.price) + ' / oz';
    renderChangeBadge(el.goldChangeCard, gold.change_pct);
    el.goldNavPrice.textContent = formatUSD(gold.price);

    // Calculate gram estimate in IDR: 1 troy oz = 31.1035 grams
    const usdIdr = (m.forex && m.forex.usd_idr) ? m.forex.usd_idr.price : 16000;
    const pricePerGram = (gold.price * usdIdr) / 31.1035;
    el.goldGramCard.textContent = formatIDR(pricePerGram);

    el.silverPriceCard.textContent = m.precious.silver ? formatUSD(m.precious.silver.price) : '--';
    el.oilPriceCard.textContent = m.precious.crude_oil ? formatUSD(m.precious.crude_oil.price) : '--';
  }

  if (m.forex && m.forex.usd_idr) {
    el.usdidrNavPrice.textContent = formatIDR(m.forex.usd_idr.price);
    el.usdidrCard.textContent = formatIDR(m.forex.usd_idr.price);
  }

  // Stocks Hero
  if (m.stocks && m.stocks.ihsg) {
    const ihsg = m.stocks.ihsg;
    el.ihsgPriceCard.textContent = ihsg.price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    renderChangeBadge(el.ihsgChangeCard, ihsg.change_pct);
    el.ihsgNavPrice.textContent = ihsg.price.toFixed(0);

    el.sp500PriceCard.textContent = m.stocks.sp500 ? m.stocks.sp500.price.toFixed(2) : '--';
    el.nvdaPriceCard.textContent = m.stocks.nvda ? formatUSD(m.stocks.nvda.price) : '--';
    el.bbcaPriceCard.textContent = m.stocks.bbca ? formatIDR(m.stocks.bbca.price) : '--';
    el.bbriPriceCard.textContent = m.stocks.bbri ? formatIDR(m.stocks.bbri.price) : '--';
  }
}

function renderChangeBadge(element, changePct) {
  const pct = changePct || 0;
  const isUp = pct >= 0;
  element.className = `stat-change ${isUp ? 'up' : 'down'}`;
  element.innerHTML = `${isUp ? '<i class="fa-solid fa-arrow-up"></i> +' : '<i class="fa-solid fa-arrow-down"></i> '}${pct.toFixed(2)}%`;
}

// ===================================================================
// ASSET MATRIX CARDS
// ===================================================================
function renderMatrix(target) {
  if (!state.market) return;
  const m = state.market;
  let items = [];

  if (target === 'm-crypto' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      items.push({
        name: capitalize(key),
        tag: key.toUpperCase(),
        price: formatUSD(coin.usd),
        subPrice: formatIDR(coin.idr),
        change: coin.usd_24h_change || 0
      });
    }
  } else if (target === 'm-stocks' && m.stocks) {
    for (const [key, stock] of Object.entries(m.stocks)) {
      const isIndo = key.endsWith('.JK') || key === 'ihsg' || key === 'bbca' || key === 'bbri' || key === 'tlkm';
      items.push({
        name: stock.name || key.toUpperCase(),
        tag: stock.symbol || key.toUpperCase(),
        price: isIndo ? formatIDR(stock.price) : formatUSD(stock.price),
        subPrice: `Sesi: Terakhir`,
        change: stock.change_pct || 0
      });
    }
  } else if (target === 'm-commodities' && m.precious) {
    for (const [key, item] of Object.entries(m.precious)) {
      items.push({
        name: item.name || key.toUpperCase(),
        tag: item.symbol || 'COMMODITY',
        price: formatUSD(item.price),
        subPrice: item.unit || 'USD',
        change: item.change_pct || 0
      });
    }
  } else if (target === 'm-forex' && m.forex) {
    for (const [key, fx] of Object.entries(m.forex)) {
      items.push({
        name: fx.name || key.replace('_', ' ').toUpperCase(),
        tag: fx.symbol || 'VALAS',
        price: formatIDR(fx.price),
        subPrice: 'Bank Indonesia Kurs',
        change: fx.change_pct || 0
      });
    }
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
// NEWS & SENTIMENT RENDERING
// ===================================================================
function renderSentimentSummary() {
  if (!state.sentimentOverview) return;
  const s = state.sentimentOverview;

  const total = (s.bullish_count || 0) + (s.neutral_count || 0) + (s.bearish_count || 0) || 1;
  const pctBull = Math.round((s.bullish_count / total) * 100);
  const pctNeu = Math.round((s.neutral_count / total) * 100);
  const pctBear = 100 - pctBull - pctNeu;

  el.barBullish.style.width = `${pctBull}%`;
  el.barNeutral.style.width = `${pctNeu}%`;
  el.barBearish.style.width = `${pctBear}%`;

  el.pctBullish.textContent = `${pctBull}%`;
  el.pctNeutral.textContent = `${pctNeu}%`;
  el.pctBearish.textContent = `${pctBear}%`;

  el.aiDigestSnippet.textContent = s.ai_summary || 'Analisis sentimen AI berjalan aktif memetakan berita pasar modal, kripto, dan komoditas.';
}

function renderNews() {
  const container = el.newsFeedList;
  if (!state.news || state.news.length === 0) {
    container.innerHTML = `
      <div class="empty-state text-center p-4">
        <i class="fa-solid fa-newspaper text-muted fa-2x mb-2"></i>
        <p>Tidak ada berita ditemukan.</p>
      </div>
    `;
    el.newsCountBadge.textContent = '0 Berita';
    return;
  }

  // Filter by category
  let filtered = state.news.filter(article => {
    if (state.selectedCategory === 'all') return true;
    if (state.selectedCategory === 'crypto') return article.category === 'crypto';
    if (state.selectedCategory === 'stocks') return article.category === 'stocks';
    if (state.selectedCategory === 'precious') return article.category === 'precious';
    if (state.selectedCategory === 'bookmarks') return state.bookmarks.includes(article.id || article.link);
    return true;
  });

  // Filter by sentiment
  if (state.selectedSentiment !== 'all') {
    filtered = filtered.filter(a => a.sentiment === state.selectedSentiment);
  }

  // Filter by search query
  if (state.searchQuery) {
    filtered = filtered.filter(a => {
      const q = state.searchQuery;
      return (a.title && a.title.toLowerCase().includes(q)) ||
             (a.description && a.description.toLowerCase().includes(q)) ||
             (a.source && a.source.toLowerCase().includes(q));
    });
  }

  el.newsCountBadge.textContent = `${filtered.length} Berita`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="empty-state text-center p-4">
        <i class="fa-solid fa-filter-circle-xmark text-muted fa-2x mb-2"></i>
        <p>Tidak ada berita yang cocok dengan filter atau kata kunci saat ini.</p>
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
            <button class="btn-ai-analyze" onclick="askAiAboutArticle(${JSON.stringify(article.title).replace(/"/g, '&quot;')}, ${JSON.stringify(article.link).replace(/"/g, '&quot;')})">
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
// CHATBOT INTERACTION
// ===================================================================
async function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const text = el.chatInput.value.trim();
  if (!text) return;

  el.chatInput.value = '';
  sendChatMessage(text);
}

window.askAiAboutArticle = function(title, link) {
  // Switch to chat drawer if on mobile
  if (window.innerWidth <= 1180) {
    el.chatSidebar.classList.add('open');
  }
  const prompt = `Tolong bedah dan analisis berita ini secara mendalam:\n"${title}"\n\nApa dampaknya bagi pasar crypto, saham, atau aset berharga seperti emas? Serta apa risiko yang perlu diwaspadai investor?`;
  sendChatMessage(prompt);
};

async function sendChatMessage(promptText) {
  // Append User Message to UI
  appendMessage('user', promptText);

  // Append Bot Loading Indicator
  const loadingId = 'loading-' + Date.now();
  appendLoadingBubble(loadingId);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: promptText,
        gemini_api_key: state.geminiKey || '',
        market_context: state.market ? true : false
      })
    });

    removeMessageBubble(loadingId);

    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    appendMessage('bot', data.reply || 'Maaf, saya tidak dapat memproses jawaban saat ini.');
  } catch (err) {
    console.error('Chat error:', err);
    removeMessageBubble(loadingId);
    appendMessage('bot', `⚠️ Maaf, terjadi gangguan saat menghubungi mesin intelijen AI. Pastikan server lokal Anda aktif.`);
  }
}

function appendMessage(sender, text) {
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
  const isBot = sender === 'bot';

  const msgDiv = document.createElement('div');
  msgDiv.className = `chat-message ${isBot ? 'bot-msg' : 'user-msg'}`;

  // Format markdown-like bold and bullet lists
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
  // Simple sanitizer & markdown formatter
  let html = escapeHtml(text);
  
  // Format bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Format bullet lines
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

  // Stop if already speaking
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
    el.btnVoiceRead.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
    return;
  }

  // Construct summary speech text
  const m = state.market;
  const btcPrice = m && m.crypto && m.crypto.bitcoin ? `$${m.crypto.bitcoin.usd.toLocaleString()}` : 'tidak tersedia';
  const goldPrice = m && m.precious && m.precious.gold ? `$${m.precious.gold.price.toFixed(1)} per troy ounce` : 'tidak tersedia';
  const ihsgVal = m && m.stocks && m.stocks.ihsg ? m.stocks.ihsg.price.toFixed(0) : 'tidak tersedia';
  const digest = state.sentimentOverview ? state.sentimentOverview.ai_summary : 'Pasar bergerak dinamis.';

  const speechText = `Laporan intelijen Quantum Asset AI. Harga Bitcoin berada di kisaran ${btcPrice}. Emas dunia diperdagangkan di ${goldPrice}. Indeks Saham Gabungan IHSG berada di level ${ihsgVal}. Rangkuman sentimen: ${digest}`;

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = state.voiceLang || 'id-ID';
  utterance.rate = 1.0;

  utterance.onstart = () => {
    el.btnVoiceRead.innerHTML = '<i class="fa-solid fa-stop text-crimson"></i>';
  };
  utterance.onend = () => {
    el.btnVoiceRead.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  };
  utterance.onerror = () => {
    el.btnVoiceRead.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
  };

  window.speechSynthesis.speak(utterance);
}

// ===================================================================
// CALCULATOR & CONVERTER LOGIC
// ===================================================================
function initCalculatorLogic() {
  // Tabs
  document.querySelectorAll('.calc-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.calc-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.calc-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // Gold Inputs
  document.getElementById('goldGramInput').addEventListener('input', calculateGoldConverter);

  // Crypto Inputs
  document.getElementById('cryptoSelect').addEventListener('change', calculateCryptoConverter);
  document.getElementById('cryptoAmountInput').addEventListener('input', calculateCryptoConverter);

  // DCA
  document.getElementById('btnRunDCA').addEventListener('click', calculateDCA);
}

function calculateGoldConverter() {
  const gram = parseFloat(document.getElementById('goldGramInput').value) || 0;
  const m = state.market;
  if (!m || !m.precious || !m.precious.gold) return;

  const goldOz = m.precious.gold.price;
  const usdIdr = (m.forex && m.forex.usd_idr) ? m.forex.usd_idr.price : 16000;
  const pricePerGram = (goldOz * usdIdr) / 31.1035;
  const total = gram * pricePerGram;

  document.getElementById('goldTotalRupiah').textContent = formatIDR(total);
  document.getElementById('goldRateInfo').textContent = `Harga per gram saat ini: ${formatIDR(pricePerGram)} (Kurs: ${formatIDR(usdIdr)})`;
}

function calculateCryptoConverter() {
  const coinKey = document.getElementById('cryptoSelect').value;
  const amount = parseFloat(document.getElementById('cryptoAmountInput').value) || 0;
  const m = state.market;
  if (!m || !m.crypto || !m.crypto[coinKey]) return;

  const coin = m.crypto[coinKey];
  const totalUsd = amount * (coin.usd || 0);
  const totalIdr = amount * (coin.idr || (totalUsd * 16000));

  document.getElementById('cryptoTotalRupiah').textContent = formatIDR(totalIdr);
  document.getElementById('cryptoTotalUSD').textContent = formatUSD(totalUsd);
}

function calculateDCA() {
  const p = parseFloat(document.getElementById('dcaAmount').value) || 0;
  const years = parseFloat(document.getElementById('dcaYears').value) || 1;
  const rate = (parseFloat(document.getElementById('dcaReturnRate').value) || 0) / 100;

  const months = years * 12;
  const monthlyRate = rate / 12;
  const totalPrincipal = p * months;

  // Future Value of monthly annuity
  let fv = 0;
  if (monthlyRate > 0) {
    fv = p * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  } else {
    fv = totalPrincipal;
  }

  document.getElementById('dcaPrincipal').textContent = formatIDR(totalPrincipal);
  document.getElementById('dcaResultTotal').textContent = formatIDR(fv);
}

// ===================================================================
// SETTINGS PERSISTENCE
// ===================================================================
function saveSettings() {
  const key = el.geminiApiKeyInput.value.trim();
  const interval = el.autoRefreshSelect.value;
  const voice = el.voiceSelect.value;

  state.geminiKey = key;
  state.refreshInterval = parseInt(interval, 10);
  state.voiceLang = voice;

  localStorage.setItem('finai_gemini_key', key);
  localStorage.setItem('finai_refresh_interval', interval);
  localStorage.setItem('finai_voice_lang', voice);

  state.countdown = state.refreshInterval;
  el.settingsModal.classList.remove('open');
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
// HELPERS
// ===================================================================
function formatUSD(num) {
  if (num === undefined || num === null) return '$0.00';
  return '$' + Number(num).toLocaleString('en-US', {
    minimumFractionDigits: num < 1 ? 4 : 2,
    maximumFractionDigits: num < 1 ? 4 : 2
  });
}

function formatIDR(num) {
  if (num === undefined || num === null) return 'Rp 0';
  return 'Rp ' + Math.round(Number(num)).toLocaleString('id-ID');
}

function capitalize(s) {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function truncate(str, max) {
  if (!str) return '';
  return str.length > max ? str.substring(0, max) + '...' : str;
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return 'Baru saja';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const diffSec = Math.floor((new Date() - d) / 1000);
    if (diffSec < 60) return 'Baru saja';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mnt lalu`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
    return `${Math.floor(diffSec / 86400)} hari lalu`;
  } catch (e) {
    return dateStr;
  }
}
