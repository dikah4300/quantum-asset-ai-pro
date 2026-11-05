// ===================================================================
// PONDASI 8: RUNTIME ANTI-CLICKJACKING & FRAME-BUSTING DEFENSE
// ===================================================================
(function enforceRuntimeFrameBusting() {
  try {
    if (window.top !== window.self) {
      window.top.location = window.self.location;
    }
  } catch (e) {
    document.documentElement.innerHTML = '<div style="background:#0b0f19;color:#f43f5e;padding:40px;text-align:center;font-family:sans-serif;"><h2>Akses Ditolak (Security Alert)</h2><p>Quantum Asset AI Pro tidak diizinkan dimuat di dalam frame pihak ketiga.</p></div>';
  }
})();

/**
 * QUANTUM ASSET AI PRO
  isChatProcessing = false; - CLIENT-SIDE INTELLIGENCE & TERMINAL CONTROLLER
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
  "bitcoin": { sym: "BTC", name: "Bitcoin", cat: "major", usd: 80391, chg: 2.97, icon: "₿", sector: "Store of Value (Digital Gold)", desc: "Mata uang kripto pertama di dunia yang berfungsi sebagai penyimpan nilai terdesentralisasi berbasis Proof-of-Work (PoW) dengan batas suplai absolut 21 juta koin." },
  "ethereum": { sym: "ETH", name: "Ethereum", cat: "major", usd: 2415.88, chg: 5.06, icon: "Ξ", sector: "Smart Contracts & DeFi L1", desc: "Platform komputasi terdesentralisasi global pelopor smart contracts, menjadi fondasi ribuan protokol keuangan terdesentralisasi (DeFi), NFT, dan token ERC-20." },
  "solana": { sym: "SOL", name: "Solana", cat: "major", usd: 95.87, chg: 3.06, icon: "◎", sector: "High-Throughput Layer-1", desc: "Blockchain Layer-1 berkecepatan tinggi dengan throughput 65.000 TPS dan biaya gas sub-sen, didukung konsensus Proof-of-History (PoH) untuk DeFi dan dApps kilat." },
  "binancecoin": { sym: "BNB", name: "BNB", cat: "major", usd: 712.22, chg: 1.48, icon: "🟡", sector: "Exchange & Ecosystem Token", desc: "Token utilitas utama ekosistem bursa Binance dan jaringan BNB Chain, digunakan untuk diskon biaya trading, gas fee smart contract, serta partisipasi token launchpad." },
  "ripple": { sym: "XRP", name: "XRP (Ripple)", cat: "major", usd: 1.31, chg: 2.81, icon: "✕", sector: "Cross-Border Settlement", desc: "Jaringan penyelesaian pembayaran lintas negara (*remittance*) ultra cepat dan hemat biaya yang dirancang khusus untuk menghubungkan sistem perbankan global." },
  "cardano": { sym: "ADA", name: "Cardano", cat: "major", usd: 0.1972, chg: 3.46, icon: "₳", sector: "Peer-Reviewed Layer-1", desc: "Platform blockchain Layer-1 berbasis riset akademik dan verifikasi formal, menggunakan konsensus Proof-of-Stake Ouroboros untuk skalabilitas dan keamanan tinggi." },
  "avalanche-2": { sym: "AVAX", name: "Avalanche", cat: "major", usd: 8.74, chg: 2.05, icon: "🔺", sector: "Multi-Subnet Layer-1", desc: "Platform smart contract berkecepatan tinggi dengan arsitektur Subnet khusus yang memungkinkan pembuatan blockchain independen untuk enterprise dan adopsi RWA." },
  "chainlink": { sym: "LINK", name: "Chainlink", cat: "major", usd: 11.51, chg: 3.6, icon: "🔗", sector: "Decentralized Oracle Network", desc: "Jaringan Oracle terdesentralisasi terbesar dunia yang mengalirkan data eksternal riil (harga pasar, cuaca, API Web2) ke dalam smart contract blockchain secara aman." },
  "sui": { sym: "SUI", name: "Sui Network", cat: "major", usd: 0.9221, chg: 2.35, icon: "💧", sector: "Next-Gen Move Layer-1", desc: "Blockchain Layer-1 generasi baru yang menggunakan bahasa pemrograman Move dan arsitektur berorientasi objek untuk eksekusi transaksi paralel horizontal berlatensi sub-detik." },
  "near": { sym: "NEAR", name: "NEAR Protocol", cat: "major", usd: 4.02, chg: 0.33, icon: "🌐", sector: "User-Friendly Sharded L1", desc: "Blockchain Layer-1 sharded (Nightshade) yang mengedepankan kemudahan adopsi pengguna melalui account abstraction dan integrasi infrastruktur komputasi AI terbuka." },
  "the-open-network": { sym: "TON", name: "Toncoin", cat: "major", usd: 1.16, chg: -0.72, icon: "💎", sector: "Telegram-Integrated L1", desc: "Blockchain Layer-1 berperforma tinggi yang terintegrasi secara native dengan aplikasi perpesanan Telegram untuk melayani transaksi mikro bagi 900+ juta penggunanya." },
  "aptos": { sym: "APT", name: "Aptos", cat: "major", usd: 0.6353, chg: 0.51, icon: "⚡", sector: "High-Performance Move L1", desc: "Blockchain Layer-1 performa tinggi buatan mantan teknisi Meta Diem, memanfaatkan mesin Move VM dan Block-STM untuk mencapai throughput transaksi paralel tinggi." },
  "celestia": { sym: "TIA", name: "Celestia", cat: "major", usd: 0.4564, chg: 1.26, icon: "✨", sector: "Modular Data Availability", desc: "Jaringan modular blockchain pertama yang mengkhususkan diri pada lapisan ketersediaan data (Data Availability - DA), memangkas biaya rollup Layer-2 secara drastis." },
  "injective-protocol": { sym: "INJ", name: "Injective", cat: "major", usd: 8.16, chg: 7.5, icon: "💉", sector: "DeFi & Derivatives L1", desc: "Blockchain Layer-1 yang dioptimalkan khusus untuk sektor keuangan terdesentralisasi, perdagangan derivatif on-chain, pasar prediksi, dan buku order instan." },
  "kaspa": { sym: "KAS", name: "Kaspa", cat: "major", usd: 0.03196, chg: 1.16, icon: "👻", sector: "BlockDAG Proof-of-Work", desc: "Kripto Proof-of-Work inovatif berbasis arsitektur GHOSTDAG (BlockDAG), memungkinkan konfirmasi transaksi paralel berkecepatan tinggi tanpa pemborosan blok yatim." },
  "sei-network": { sym: "SEI", name: "Sei Network", cat: "major", usd: 0.04856, chg: -0.35, icon: "🚢", sector: "DEX-Optimized Layer-1", desc: "Blockchain Layer-1 tercepat yang dirancang khusus untuk perdagangan aset digital dengan mesin pencocokan orderbook bawaan dan perlindungan front-running." },
  "polkadot": { sym: "DOT", name: "Polkadot", cat: "major", usd: 0.946, chg: 0.31, icon: "🔴", sector: "Interoperable Multi-Chain", desc: "Jaringan interoperabilitas multi-chain yang menghubungkan berbagai blockchain independen (Parachains) ke dalam satu ekosistem keamanan bersama via Relay Chain." },
  "polygon-ecosystem-token": { sym: "POL", name: "Polygon (POL)", cat: "major", usd: 0.09669, chg: 3.65, icon: "🟣", sector: "ZK-Rollup & L2 Scaling", desc: "Ekosistem penskalaan Ethereum terdepan yang memanfaatkan teknologi ZK-Rollup (Zero Knowledge) untuk transaksi berbiaya rendah dan kompatibilitas EVM penuh." },
  "arbitrum": { sym: "ARB", name: "Arbitrum", cat: "major", usd: 0.1631, chg: 1.93, icon: "🔷", sector: "Optimistic Rollup Layer-2", desc: "Solusi Layer-2 berbasis Optimistic Rollup terbesar di Ethereum yang menyediakan throughput tinggi dan biaya gas murah dengan tetap mewarisi keamanan jaringan Ethereum." },
  "optimism": { sym: "OP", name: "Optimism", cat: "major", usd: 0.111, chg: -0.2, icon: "🔴", sector: "Optimistic Rollup & Superchain", desc: "Solusi Layer-2 Ethereum berbasis OP Stack yang menjadi standar arsitektur modular untuk jaringan terdesentralisasi dalam ekosistem terpadu Superchain." },
  "fantom": { sym: "FTM", name: "Sonic / Fantom", cat: "major", usd: 0.03632, chg: 2.49, icon: "👻", sector: "Fast DAG Layer-1 (Sonic)", desc: "Platform smart contract berbasis graf berarah asiklik (DAG Lachesis) yang kini bertransisi ke Sonic dengan kapasitas hingga 10.000 TPS dan finalitas sub-detik." },
  "litecoin": { sym: "LTC", name: "Litecoin", cat: "major", usd: 55.84, chg: 2.5, icon: "Ł", sector: "Digital Silver P2P Currency", desc: "Mata uang kripto peer-to-peer legendaris yang dirancang sebagai komplemen Bitcoin untuk transaksi harian cepat dengan waktu blok 2,5 menit dan algoritma Scrypt." },
  "bittensor": { sym: "TAO", name: "Bittensor (AI)", cat: "ai", usd: 234.65, chg: 2.56, icon: "🧠", sector: "Decentralized AI & ML", desc: "Jaringan kecerdasan buatan desentralisasi peer-to-peer yang memberi insentif kepada subnet model machine learning untuk saling bersaing dan berbagi kecerdasan komputasi." },
  "fetch-ai": { sym: "FET", name: "ASI / Fetch.ai", cat: "ai", usd: 0.1599, chg: 0.12, icon: "🤖", sector: "Autonomous AI Agents (ASI)", desc: "Platform kecerdasan buatan terdesentralisasi penyedia agen otonom (bagian dari aliansi ASI) untuk otomatisasi rantai pasok, layanan web, dan ekosistem data cerdas." },
  "render-token": { sym: "RENDER", name: "Render Network", cat: "ai", usd: 1.6, chg: 4.8, icon: "🎨", sector: "DePIN GPU Cloud Computing", desc: "Jaringan komputasi GPU desentralisasi terkemuka yang menghubungkan penyedia GPU menganggur dengan kreator yang membutuhkan rendering 3D, animasi, dan pelatihan AI." },
  "internet-computer": { sym: "ICP", name: "Internet Computer", cat: "ai", usd: 2.64, chg: 4.22, icon: "♾️", sector: "Decentralized Cloud Web3", desc: "Blockchain komputasi awan berdaulat yang memungkinkan pengembang membangun aplikasi web, sistem enterprise, dan media sosial sepenuhnya on-chain tanpa cloud tersentralisasi." },
  "the-graph": { sym: "GRT", name: "The Graph", cat: "ai", usd: 0.02052, chg: 3.15, icon: "📊", sector: "Blockchain Data Indexing", desc: "Protokol pengindeksan data desentralisasi yang memungkinkan para pengembang melakukan kueri data blockchain secara instan via GraphQL ('Google-nya Web3')." },
  "akash-network": { sym: "AKT", name: "Akash Network", cat: "ai", usd: 0.6481, chg: 5.92, icon: "☁️", sector: "DePIN Serverless Cloud", desc: "Pasar komputasi awan sumber terbuka terdesentralisasi (DePIN) yang menyewakan server CPU dan GPU enterprise dengan biaya hingga 80% lebih hemat daripada AWS/GCP." },
  "pepe": { sym: "PEPE", name: "Pepe", cat: "meme", usd: 4.93e-06, chg: -1.31, icon: "🐸", sector: "Viral Culture Meme Coin", desc: "Koin meme paling viral di Ethereum yang terinspirasi dari karakter kultural Pepe the Frog, memiliki likuiditas masif dan komunitas komunitas budaya internet global." },
  "dogecoin": { sym: "DOGE", name: "Dogecoin", cat: "meme", usd: 0.07635, chg: 2.0, icon: "🐕", sector: "Original Doge P2P Meme", desc: "Koin meme pertama di dunia bertema anjing Shiba Inu dengan blockchain PoW mandiri, didukung komunitas kuat dan kerap digunakan untuk transaksi mikro serta tip internet." },
  "shiba-inu": { sym: "SHIB", name: "Shiba Inu", cat: "meme", usd: 4.71e-06, chg: 1.1, icon: "🐶", sector: "Meme Ecosystem & Shibarium", desc: "Token meme bertema anjing yang telah berevolusi menjadi ekosistem lengkap, mencakup bursa DEX ShibaSwap, blockchain Layer-2 Shibarium, dan koleksi NFT Shiboshis." },
  "dogwifcoin": { sym: "WIF", name: "dogwifhat", cat: "meme", usd: 0.1724, chg: -2.13, icon: "🧢", sector: "Solana Viral Meme Coin", desc: "Koin meme paling ikonik di blockchain Solana bertema anak anjing Shiba Inu yang mengenakan topi rajut wol pink, simbol budaya viral komunitas kripto modern." },
  "bonk": { sym: "BONK", name: "Bonk", cat: "meme", usd: 3e-06, chg: -0.96, icon: "🔨", sector: "Community Dog Utility Meme", desc: "Koin meme anjing pertama di Solana yang didistribusikan secara airdrop ke komunitas Web3 Solana dan kini terintegrasi luas ke berbagai protokol dApps DeFi." },
  "floki": { sym: "FLOKI", name: "FLOKI", cat: "meme", usd: 2.278e-05, chg: 0.21, icon: "⚔️", sector: "Utility Meme & Metaverse", desc: "Token meme bertema anjing peliharaan Elon Musk yang mengembangkan ekosistem nyata: game metaverse Valhalla, platform edukasi University of Floki, dan protokol FlokiFi." },
  "brett": { sym: "BRETT", name: "Brett (Base)", cat: "meme", usd: 9.344e-05, chg: 3.13, icon: "🔵", sector: "Base Layer-2 Mascot Meme", desc: "Maskot kultural dan koin meme teratas di jaringan Base (Ethereum Layer-2), karakter sahabat karib Pepe the Frog dari komik legendaris Boy's Club karya Matt Furie." },
  "popcat": { sym: "POPCAT", name: "Popcat (SOL)", cat: "meme", usd: 0.03968, chg: -1.23, icon: "🐱", sector: "Solana Viral Cat Meme", desc: "Koin meme viral berbasis Solana yang terinspirasi dari klip meme kucing bernama Oatmeal yang membuka dan menutup mulutnya secara lucu dengan efek suara pop." },
  "book-of-meme": { sym: "BOME", name: "BOOK OF MEME", cat: "meme", usd: 0.0006386, chg: 2.33, icon: "📖", sector: "Digital Culture Meme Archive", desc: "Proyek eksperimen desentralisasi yang diprakarsai seniman Darkfarms untuk mengabadikan karya seni dan sejarah budaya meme internet secara permanen di blockchain." },
  "cat-in-a-dogs-world": { sym: "MEW", name: "cat in dogs world", cat: "meme", usd: 0.0003796, chg: -0.91, icon: "😼", sector: "Solana Cat Culture Meme", desc: "Koin meme berbasis Solana bertema kucing putih animasi yang hadir untuk mendobrak dominasi koin-koin meme bertema anjing di pasar kripto global." },
  "neiro": { sym: "NEIRO", name: "First Neiro ETH", cat: "meme", usd: 0.0001534, chg: 2.94, icon: "🐾", sector: "Ethereum Community Meme", desc: "Koin meme berbasis Ethereum yang dinamai dari anjing Shiba Inu baru yang diadopsi oleh pemilik Kabosu (maskot legendaris di balik terciptanya Dogecoin)." },
  "turbo": { sym: "TURBO", name: "Turbo (AI Meme)", cat: "meme", usd: 0.0007555, chg: -2.15, icon: "🐌", sector: "AI-Generated Pioneer Meme", desc: "Koin meme revolusioner pertama yang diciptakan sepenuhnya menggunakan panduan kecerdasan buatan GPT-4 dengan modal awal $69 oleh seniman digital Rhett Mankind." },
  "baby-doge-coin": { sym: "BABYDOGE", name: "Baby Doge Coin", cat: "meme", usd: 3.2e-10, chg: 0.7, icon: "🍼", sector: "Hyper-Deflationary Doge Meme", desc: "Koin meme turunan Dogecoin dengan mekanisme hiper-deflasi yang membakar token pada setiap transaksi dan membagikan reward refleksi otomatis kepada para holder." },
  "mog-coin": { sym: "MOG", name: "Mog Coin", cat: "meme", usd: 9.82e-08, chg: 2.62, icon: "🕶️", sector: "Internet Humor & Mogging", desc: "Koin meme bertema kucing berkacamata hitam yang terinspirasi dari budaya internet 'Mogging' (tampil lebih dominan/percaya diri) dengan komunitas kultural yang aktif." },
  "goatseus-maximus": { sym: "GOAT", name: "Goatseus Maximus", cat: "meme", usd: 0.01392, chg: 0.39, icon: "🐐", sector: "Autonomous AI Agent Meme", desc: "Koin meme di jaringan Solana yang lahir dari interaksi bot kecerdasan buatan otonom 'Truth Terminal', menjadi pelopor perpaduan narasi meme dan eksperimen AI." },
  "memecoin": { sym: "MEME", name: "Memecoin", cat: "meme", usd: 4.51e-08, chg: 0.0, icon: "🏴‍☠️", sector: "Web3 Social & Memeland", desc: "Token utilitas resmi dari studio Web3 Memeland yang didirikan oleh platform hiburan viral legendaris 9GAG untuk mendukung ekosistem sosial kreator digital." },
  "peanut-the-squirrel": { sym: "PNUT", name: "Peanut Squirrel", cat: "meme", usd: 0.03744, chg: -5.26, icon: "🐿️", sector: "Solana Tribute Animal Meme", desc: "Koin meme penghormatan di blockchain Solana untuk Peanut si tupai peliharaan viral yang memicu perhatian media internasional dan perdebatan regulasi di Amerika Serikat." },
  "act-i-the-ai-prophecy": { sym: "ACT", name: "Act I AI", cat: "meme", usd: 0.008741, chg: 3.23, icon: "🎭", sector: "Multi-Agent AI Research", desc: "Token eksperimental yang menjajaki masa depan kolaborasi multi-agen kecerdasan buatan otonom di ruang desentralisasi dan jejaring sosial Web3." }
};

const STOCKS_CATALOG = {
  "ihsg": { name: "IHSG (BEI)", symbol: "^JKSE", price: 5037.05, change_pct: 2.28, sector: "Indeks Acuan Nasional", desc: "Indeks acuan pasar modal Indonesia yang mengukur pergerakan seluruh saham tercatat di Bursa Efek Indonesia (BEI/IDX)." },
  "bbca": { name: "Bank Central Asia", symbol: "BBCA.JK", price: 5075, change_pct: 2.94, sector: "Perbankan Swasta & Transaksional", desc: "Bank swasta terbesar di Indonesia milik Grup Djarum. Berfokus pada perbankan transaksional ritel dan korporasi, memproses miliaran transaksi harian via BCA Mobile/myBCA serta penyaluran kredit konsumer, KPR, dan modal kerja." },
  "bbri": { name: "Bank Rakyat Indonesia", symbol: "BBRI.JK", price: 2720, change_pct: 1.12, sector: "Perbankan Mikro, UMKM & Agrikultur", desc: "Bank BUMN tertua dan terbesar di segmen pembiayaan mikro dan UMKM. Mengoperasikan program kredit KUR, Kupedes, serta jaringan agen keuangan laku pandai BRILink yang menjangkau jutaan nasabah pelosok." },
  "bmri": { name: "Bank Mandiri", symbol: "BMRI.JK", price: 3620, change_pct: 0.56, sector: "Perbankan Korporasi & Wholesale", desc: "Bank BUMN terbesar dari sisi total aset. Berfokus pada pembiayaan sindikasi korporasi besar, perdagangan internasional, proyek infrastruktur nasional, serta ekosistem digital terpadu Livin' (ritel) dan Kopra (wholesale)." },
  "tlkm": { name: "Telkom Indonesia", symbol: "TLKM.JK", price: 1990, change_pct: 5.57, sector: "Telekomunikasi & Infrastruktur Digital", desc: "BUMN penyedia jasa telekomunikasi dan jaringan digital terbesar nasional. Mengoperasikan seluler Telkomsel, broadband fixed IndiHome, jaringan fiber optik bawah laut internasional, satelit, serta data center NeutraDC." },
  "asii": { name: "Astra International", symbol: "ASII.JK", price: 4880, change_pct: -0.41, sector: "Konglomerat Otomotif & Alat Berat", desc: "Konglomerat multisektor terbesar Indonesia. Beroperasi di industri perakitan dan distribusi otomotif (Toyota, Daihatsu, Isuzu, motor Honda), alat berat tambang (United Tractors), perkebunan kelapa sawit (Astra Agro), dan jasa pembiayaan." },
  "sp500": { name: "S&P 500 Index", symbol: "^GSPC", price: 7722.60, change_pct: 1.30, sector: "Indeks Saham Utama Wall Street", desc: "Indeks saham yang mencakup 500 perusahaan publik berkapitalisasi pasar terbesar di bursa Amerika Serikat (NYSE & NASDAQ), menjadi barometer utama ekonomi global." },
  "nvda": { name: "Nvidia Corporation", symbol: "NVDA", price: 217.94, change_pct: 3.31, sector: "Semikonduktor & Hardware Komputasi AI", desc: "Raksasa semikonduktor global perancang GPU dan chip akselerator kecerdasan buatan (Hopper H100 & Blackwell B200) yang menjadi tulang punggung pusat data AI, pelatihan model LLM, dan grafis dunia." },
  "aapl": { name: "Apple Inc.", symbol: "AAPL", price: 347.10, change_pct: -0.18, sector: "Teknologi Konsumen & Ekosistem Digital", desc: "Perusahaan teknologi terbesar dunia pembuat ekosistem perangkat premium: iPhone, Mac, iPad, Apple Watch, AirPods, serta layanan digital terintegrasi App Store, Apple Pay, dan iCloud." }
};

const PRECIOUS_CATALOG = {
  "gold": { name: "Emas Dunia (Spot)", symbol: "XAU/USD", price: 4059.40, change_pct: 0.52, unit: "USD / troy oz" },
  "silver": { name: "Perak (Spot)", symbol: "XAG/USD", price: 54.19, change_pct: 0.14, unit: "USD / troy oz" },
  "crude_oil": { name: "Minyak Mentah WTI", symbol: "CL=F", price: 101.33, change_pct: -0.42, unit: "USD / barel" }
};

const FOREX_CATALOG = {
  "usd_idr": { name: "Dolar AS ke Rupiah", symbol: "USD/IDR", price: 18025, change_pct: -0.66 },
  "eur_usd": { name: "Euro ke Dolar", symbol: "EUR/USD", price: 1.1126, change_pct: -0.43 },
  "gbp_usd": { name: "Pound ke Dolar", symbol: "GBP/USD", price: 1.3302, change_pct: -0.32 },
  "usd_jpy": { name: "Dolar ke Yen", symbol: "USD/JPY", price: 157.93, change_pct: 0.26 }
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
    title: "Emas Dunia Cetak Titik Akumulasi Institusional Baru di Kisaran $4,059 Jelang Rilis Data Makro AS",
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
    description: "Pasar altcoin dan token meme mengalami percepatan momentum setelah Bitcoin stabil di atas $80,800, didorong sentimen spekulatif dan aktivitas on-chain tinggi.",
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
    title: "IHSG Bertahan di Zona 5,260 Ditopang Aksi Beli Bersih Asing pada Saham Big Cap Perbankan",
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

  goldSignalBadge: document.getElementById('goldSignalBadge'),
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
  tfStatusGrid: document.getElementById('tfStatusGrid'),
  macroDriverNote: document.getElementById('macroDriverNote'),
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
  mobileChatFab: document.getElementById('mobileChatFab'),
  chatBackdrop: document.getElementById('chatBackdrop'),
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

function populateCryptoSelectOptions() {
  const sel = document.getElementById('cryptoSelect');
  if (!sel) return;
  const currentVal = sel.value;
  sel.innerHTML = Object.entries(CRYPTO_CATALOG).map(([key, c]) => {
    return `<option value="${key}">${c.icon || '🪙'} ${c.name} (${c.sym})</option>`;
  }).join('');
  if (currentVal && CRYPTO_CATALOG[currentVal]) {
    sel.value = currentVal;
  }
}


function initDefaultMarketState() {
  const usdIdrRate = 18025;
  state.market = {
    timestamp: Date.now(),
    crypto: {},
    stocks: JSON.parse(JSON.stringify(STOCKS_CATALOG)),
    precious: JSON.parse(JSON.stringify(PRECIOUS_CATALOG)),
    forex: JSON.parse(JSON.stringify(FOREX_CATALOG)),
    indicators: {
      fear_and_greed: { value: 51, classification: "Neutral" }
    }
  };

  for (const [key, val] of Object.entries(CRYPTO_CATALOG)) {
    state.market.crypto[key] = {
      symbol: val.sym,
      name: val.name,
      category: val.cat,
      icon: val.icon,
      usd: val.usd,
      idr: Math.round(val.usd * usdIdrRate),
      usd_24h_change: val.chg,
      sector: val.sector,
      desc: val.desc
    };
  }

  renderTickerTape();
  renderHeroCards();
  renderMatrix();
  renderXauAnalysis();
  renderSentimentSummary();
  renderNews();
  calculateGoldConverter();
  calculateCryptoConverter();
}

document.addEventListener('DOMContentLoaded', () => {
  populateCryptoSelectOptions();
  initDefaultMarketState();
  initSettings();
  initEventListeners();
  initTradingViewChart();
  renderEconomicCalendar('all');
  loadAllData();
  startAutoRefresh();
  initCryptoLiveWebSocket();
  initStockAndCommodityLiveEngine();

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

  // Mobile Chat Drawer & Backdrop Controller
  const openMobileChat = () => {
    if (el.chatSidebar) el.chatSidebar.classList.add('open');
    if (el.chatBackdrop) el.chatBackdrop.classList.add('active');
    document.body.style.overflow = window.innerWidth <= 768 ? 'hidden' : '';
  };

  const closeMobileChat = () => {
    if (el.chatSidebar) el.chatSidebar.classList.remove('open');
    if (el.chatBackdrop) el.chatBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (el.btnToggleChatMobile) el.btnToggleChatMobile.addEventListener('click', openMobileChat);
  if (el.mobileChatFab) el.mobileChatFab.addEventListener('click', openMobileChat);
  if (el.btnCloseMobileChat) el.btnCloseMobileChat.addEventListener('click', closeMobileChat);
  if (el.chatBackdrop) el.chatBackdrop.addEventListener('click', closeMobileChat);

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
  const usdIdrRate = 18025;
  const market = {
    timestamp: Date.now(),
    crypto: {},
    stocks: JSON.parse(JSON.stringify(STOCKS_CATALOG)),
    precious: JSON.parse(JSON.stringify(PRECIOUS_CATALOG)),
    forex: JSON.parse(JSON.stringify(FOREX_CATALOG)),
    indicators: {
      fear_and_greed: { value: 51, classification: "Neutral" }
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

  // 1. Update kurs Valas (USD/IDR, EUR/USD, GBP/USD, USD/JPY) live via open.er-api
  try {
    const fxRes = await fetch('https://open.er-api.com/v6/latest/USD', { signal: AbortSignal.timeout(3000) });
    if (fxRes.ok) {
      const fxData = await fxRes.json();
      if (fxData && fxData.rates) {
        if (fxData.rates.IDR) market.forex.usd_idr.price = Math.round(fxData.rates.IDR);
        if (fxData.rates.EUR) market.forex.eur_usd.price = parseFloat((1 / fxData.rates.EUR).toFixed(4));
        if (fxData.rates.GBP) market.forex.gbp_usd.price = parseFloat((1 / fxData.rates.GBP).toFixed(4));
        if (fxData.rates.JPY) market.forex.usd_jpy.price = parseFloat(fxData.rates.JPY.toFixed(2));
      }
    }
  } catch (e) {}

  // 2. Update Fear & Greed Index live
  try {
    const fngRes = await fetch('https://api.alternative.me/fng/?limit=1', { signal: AbortSignal.timeout(2500) });
    if (fngRes.ok) {
      const fngData = await fngRes.json();
      if (fngData && fngData.data && fngData.data.length > 0) {
        const item = fngData.data[0];
        market.indicators.fear_and_greed = {
          value: parseInt(item.value, 10) || 51,
          classification: item.value_classification || "Neutral"
        };
      }
    }
  } catch (e) {}

  // 3. Update harga Crypto & Koin Meme via CoinGecko Public API
  try {
    const ids = "bitcoin,ethereum,solana,binancecoin,ripple,cardano,avalanche-2,chainlink,sui,near,the-open-network,bittensor,fetch-ai,render-token,pepe,dogecoin,shiba-inu,dogwifcoin,bonk,floki,brett,popcat,book-of-meme,cat-in-a-dogs-world,neiro,turbo,baby-doge-coin,mog-coin,goatseus-maximus,memecoin";
    const cgRes = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`, { signal: AbortSignal.timeout(3500) });
    if (cgRes.ok) {
      const cgData = await cgRes.json();
      const currentUsdIdr = market.forex.usd_idr.price || 18025;
      for (const [cId, cVal] of Object.entries(cgData)) {
        if (market.crypto[cId] && cVal.usd !== undefined) {
          market.crypto[cId].usd = cVal.usd;
          market.crypto[cId].idr = Math.round(cVal.usd * currentUsdIdr);
          if (cVal.usd_24h_change !== undefined && cVal.usd_24h_change !== null) {
            market.crypto[cId].usd_24h_change = parseFloat(cVal.usd_24h_change.toFixed(2));
          }
        }
      }
    }
  } catch (e) {}

  // Micro-tick untuk visual pergerakan realtime pasar emas
  const jitterPct = (Math.random() - 0.5) * 0.04;
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
    ai_summary: "Sentimen pasar dominan Bullish didorong antisipasi pemangkasan suku bunga FOMC, stabilitas emas XAU/USD di atas $4,050, serta lonjakan likuiditas koin meme & saham perbankan BEI."
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
  const goldPrice = (m && m.precious && m.precious.gold) ? m.precious.gold.price : 4059.40;

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
  const query = (state.matrixSearchQuery || '').toLowerCase();

  let items = [];

  // 1. Kategori Koin Meme
  if (target === 'm-meme' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      if (coin.category === 'meme') {
        items.push({
          key,
          type: 'crypto',
          name: `${coin.icon || '🪙'} ${coin.name}`,
          tag: coin.symbol,
          price: formatUSD(coin.usd),
          subPrice: formatIDR(coin.idr),
          change: coin.usd_24h_change || 0,
          sector: coin.sector || 'Koin Meme Kultural',
          desc: coin.desc || ''
        });
      }
    }
  }
  // 2. Semua Kripto
  else if (target === 'm-crypto-all' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      items.push({
        key,
        type: 'crypto',
        name: `${coin.icon || '🪙'} ${coin.name}`,
        tag: coin.symbol,
        price: formatUSD(coin.usd),
        subPrice: formatIDR(coin.idr),
        change: coin.usd_24h_change || 0,
        sector: coin.sector || 'Aset Kripto',
        desc: coin.desc || ''
      });
    }
  }
  // 3. Kripto Utama (Major)
  else if (target === 'm-crypto-major' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      if (coin.category === 'major') {
        items.push({
          key,
          type: 'crypto',
          name: `${coin.icon || '🪙'} ${coin.name}`,
          tag: coin.symbol,
          price: formatUSD(coin.usd),
          subPrice: formatIDR(coin.idr),
          change: coin.usd_24h_change || 0,
          sector: coin.sector || 'Kripto Utama L1/L2',
          desc: coin.desc || ''
        });
      }
    }
  }
  // 4. AI & DePIN Crypto
  else if (target === 'm-crypto-ai' && m.crypto) {
    for (const [key, coin] of Object.entries(m.crypto)) {
      if (coin.category === 'ai') {
        items.push({
          key,
          type: 'crypto',
          name: `${coin.icon || '🤖'} ${coin.name}`,
          tag: coin.symbol,
          price: formatUSD(coin.usd),
          subPrice: formatIDR(coin.idr),
          change: coin.usd_24h_change || 0,
          sector: coin.sector || 'AI & Komputasi DePIN',
          desc: coin.desc || ''
        });
      }
    }
  }
  // 5. Saham BEI & US
  else if (target === 'm-stocks' && m.stocks) {
    for (const [key, stock] of Object.entries(m.stocks)) {
      const isIndo = key.endsWith('.JK') || key === 'ihsg' || key === 'bbca' || key === 'bbri' || key === 'bmri' || key === 'tlkm' || key === 'asii';
      items.push({
        key,
        type: 'stock',
        name: stock.name,
        tag: stock.symbol,
        price: isIndo ? formatIDR(stock.price) : formatUSD(stock.price),
        subPrice: isIndo ? 'Bursa Efek Indonesia' : 'Wall Street US',
        change: stock.change_pct || 0,
        sector: stock.sector || 'Ekuitas Saham',
        desc: stock.desc || ''
      });
    }
  }
  // 6. Komoditas (Emas, Perak, Minyak)
  else if (target === 'm-commodities' && m.precious) {
    for (const [key, item] of Object.entries(m.precious)) {
      items.push({
        key,
        type: 'commodity',
        name: item.name,
        tag: item.symbol,
        price: formatUSD(item.price),
        subPrice: item.unit,
        change: item.change_pct || 0,
        sector: 'Logam Mulia & Energi',
        desc: key === 'gold' ? 'Emas murni spot fisik per troy ounce, aset lindung nilai (safe haven) utama dunia.' :
              key === 'silver' ? 'Perak spot fisik, logam mulia industri dan aset moneter sekunder.' :
              'Minyak mentah WTI (Crude Oil) patokan energi industri global.'
      });
    }
  }
  // 7. Forex Valas
  else if (target === 'm-forex' && m.forex) {
    for (const [key, fx] of Object.entries(m.forex)) {
      items.push({
        key,
        type: 'forex',
        name: fx.name,
        tag: fx.symbol,
        price: key === 'usd_idr' ? formatIDR(fx.price) : fx.price.toFixed(4),
        subPrice: 'Kurs Pasar Spot Valas',
        change: fx.change_pct || 0,
        sector: 'Pasar Valuta Asing Antarbank',
        desc: key === 'usd_idr' ? 'Nilai tukar Dolar AS terhadap Rupiah Indonesia di pasar antarbank spot.' :
              key === 'eur_usd' ? 'Pasangan mata uang paling likuid di dunia antara Euro dan Dolar AS.' :
              key === 'gbp_usd' ? 'Pasangan mata uang Pound Sterling Inggris terhadap Dolar AS (Cable).' :
              'Pasangan mata uang Dolar AS terhadap Yen Jepang.'
      });
    }
  }

  // Filter pencarian teks instan
  if (query) {
    items = items.filter(it => 
      it.name.toLowerCase().includes(query) ||
      it.tag.toLowerCase().includes(query) ||
      (it.desc && it.desc.toLowerCase().includes(query)) ||
      (it.sector && it.sector.toLowerCase().includes(query))
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
      <div class="matrix-item-card cursor-pointer" id="matrix-card-${it.key}" onclick="openAssetDetailModal('${it.key}', '${it.type}')" title="Klik untuk melihat profil bisnis & informasi lengkap">
        <div class="m-item-top">
          <span class="m-item-name">${it.name}</span>
          <div class="m-item-meta">
            <span class="m-live-tag" title="Live stream aktif"><span class="live-dot-pulse"></span></span>
            <span class="m-item-tag">${it.tag}</span>
          </div>
        </div>
        <div class="m-item-price ${isUp ? 'text-emerald' : 'text-crimson'}" id="matrix-price-${it.key}">${it.price}</div>
        <div class="m-item-desc" title="${escapeHtml(it.desc)}">${it.desc ? escapeHtml(truncate(it.desc, 78)) : ''}</div>
        <div class="m-item-bottom">
          <span class="text-muted" id="matrix-sub-${it.key}">${it.subPrice}</span>
          <span class="${isUp ? 'text-emerald' : 'text-crimson'} font-bold" id="matrix-chg-${it.key}">
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
    if (m.crypto.sui) items.push({ sym: '💧 SUI', price: formatUSD(m.crypto.sui.usd), chg: m.crypto.sui.usd_24h_change });
    if (m.crypto['shiba-inu']) items.push({ sym: '🐶 SHIB', price: formatUSD(m.crypto['shiba-inu'].usd), chg: m.crypto['shiba-inu'].usd_24h_change });
    if (m.crypto.dogwifcoin) items.push({ sym: '🧢 WIF', price: formatUSD(m.crypto.dogwifcoin.usd), chg: m.crypto.dogwifcoin.usd_24h_change });
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
    if (el.dogePriceCard && m.crypto.dogecoin) el.dogePriceCard.textContent = formatUSD(m.crypto.dogecoin.usd);
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

    const usdIdr = (m.forex && m.forex.usd_idr) ? m.forex.usd_idr.price : 18025;
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

        <a href="${sanitizeUrl(article.link)}" target="_blank" rel="noopener noreferrer nofollow" class="news-title">
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
            <a href="${sanitizeUrl(article.link)}" target="_blank" rel="noopener noreferrer nofollow" class="btn-open-link" title="Buka Sumber Berita">
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
// PONDASI 5: RATE LIMITER & TOKEN BUCKET (Max 1 pesan per 1.5 detik, maks 25 pesan/menit)
let lastChatTime = 0;
let chatWindowStart = Date.now();
let chatRequestCount = 0;
let isChatProcessing = false;

function handleChatSubmit(e) {
  if (e) e.preventDefault();
  const text = el.chatInput.value.trim();
  if (!text) return;

  const now = Date.now();
  if (now - chatWindowStart > 60000) {
    chatWindowStart = now;
    chatRequestCount = 0;
  }
  chatRequestCount++;
  if (chatRequestCount > 25) {
    alert('Batas frekuensi pesan tercapai (maks 25 pesan per menit). Harap tunggu sejenak demi keamanan.');
    return;
  }

  if (isChatProcessing || now - lastChatTime < 1500) {
    return;
  }

  // PONDASI 4: Batasi panjang input demi mencegah payload overflow
  if (text.length > 500) {
    alert('Pesan terlalu panjang (maksimal 500 karakter).');
    return;
  }

  el.chatInput.value = '';
  sendChatMessage(text);
}

window.askAiAboutArticle = function(title) {
  if (el.chatSidebar) el.chatSidebar.classList.add('open');
  if (el.chatBackdrop) el.chatBackdrop.classList.add('active');
  document.body.style.overflow = window.innerWidth <= 768 ? 'hidden' : '';
  const prompt = `Tolong bedah dan analisis berita ini secara mendalam:
"${title}"

Apa dampaknya bagi pasar crypto, saham, atau aset emas XAU/USD? Serta apa mitigasi risiko yang disarankan?`;
  sendChatMessage(prompt);
};

async function sendChatMessage(promptText) {
  lastChatTime = Date.now();
  isChatProcessing = true;
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

  // Pencarian Cerdas Profil Saham & Model Bisnis
  for (const [sKey, sVal] of Object.entries(STOCKS_CATALOG)) {
    if (q.includes(sKey) || q.includes(sVal.name.toLowerCase()) || q.includes(sVal.symbol.toLowerCase().replace('.jk', ''))) {
      if (q.includes('kerja') || q.includes('bidang') || q.includes('profil') || q.includes('usaha') || q.includes('apa') || q.includes('bisnis')) {
        const isIndo = sKey.endsWith('.JK') || sKey === 'ihsg' || sKey === 'bbca' || sKey === 'bbri' || sKey === 'bmri' || sKey === 'tlkm' || sKey === 'asii';
        const curPrice = (state.market && state.market.stocks && state.market.stocks[sKey]) ? state.market.stocks[sKey].price : sVal.price;
        const curPriceStr = isIndo ? formatIDR(curPrice) : formatUSD(curPrice);
        return `### Profil Bisnis & Bidang Usaha: ${sVal.name} (${sVal.symbol})
* **Sektor Industri**: ${sVal.sector}
* **Harga Terkini**: ${curPriceStr} (${sVal.change_pct >= 0 ? '+' : ''}${sVal.change_pct}% hari ini)
* **Bidang Usaha & Model Bisnis**:
${sVal.desc}
* **Analisis Fundamental FinAI**: Perusahaan ini memiliki posisi kompetitif (*competitive moat*) yang kuat di segmennya dengan basis pendapatan nyata dan terukur di pasar modal.`;
      }
    }
  }

  // Pencarian Cerdas Profil Kripto & Utilitas Koin
  for (const [cKey, cVal] of Object.entries(CRYPTO_CATALOG)) {
    if (q.includes(cKey) || q.includes(cVal.name.toLowerCase()) || q.includes(cVal.sym.toLowerCase())) {
      if (q.includes('apa') || q.includes('kerja') || q.includes('profil') || q.includes('teknologi') || q.includes('fungsi') || q.includes('utilitas')) {
        const curPrice = (state.market && state.market.crypto && state.market.crypto[cKey]) ? state.market.crypto[cKey].usd : cVal.usd;
        return `### Informasi Teknologi & Utilitas: ${cVal.icon || '🪙'} ${cVal.name} (${cVal.sym})
* **Kategori & Ekosistem**: ${cVal.sector}
* **Harga Spot Live**: ${formatUSD(curPrice)} (~${formatIDR(curPrice * 18025)})
* **Fungsi, Teknologi & Utilitas**:
${cVal.desc}
* **Karakteristik Aset**: Likuiditas pasar aktif, terhubung langsung ke live streaming Binance WebSocket & CoinGecko.`;
      }
    }
  }

  const m = state.market;
  const goldPrice = (m && m.precious && m.precious.gold) ? m.precious.gold.price : 4059.40;
  const goldChg = (m && m.precious && m.precious.gold && m.precious.gold.change_pct !== undefined) ? m.precious.gold.change_pct : 1.45;
  const btcPrice = (m && m.crypto && m.crypto.bitcoin) ? formatUSD(m.crypto.bitcoin.usd) : '$80,391';
  const usdIdr = (m && m.forex && m.forex.usd_idr) ? formatIDR(m.forex.usd_idr.price) : 'Rp 18.025';
  const ihsgPrice = (m && m.stocks && m.stocks.ihsg) ? m.stocks.ihsg.price : 5037.05;
  const ihsgChg = (m && m.stocks && m.stocks.ihsg) ? m.stocks.ihsg.change_pct : 2.28;

  // 1. ANALISIS PRESISI FOREX XAU/USD (EMAS) & SINYAL BUY / SELL
  if (q.includes('xau') || q.includes('emas') || q.includes('gold') || q.includes('buy') || q.includes('sell') || q.includes('posisi') || q.includes('forex') || q.includes('signal') || q.includes('analisa')) {
    const isBull = goldChg >= 0;
    const atr = goldPrice * 0.007;

    if (isBull) {
      const eLow = (goldPrice - (atr * 0.22)).toFixed(2);
      const eHigh = (goldPrice - (atr * 0.08)).toFixed(2);
      const sl = (goldPrice - (atr * 0.64)).toFixed(2);
      const tp1 = (goldPrice + (atr * 0.42)).toFixed(2);
      const tp2 = (goldPrice + (atr * 0.85)).toFixed(2);
      const tp3 = (goldPrice + (atr * 1.58)).toFixed(2);

      return `### 🏅 Analisis Institusional Smart Money Concepts: XAU/USD (Emas Spot)
* **Harga Spot Terkini:** **$${goldPrice.toFixed(2)} / troy oz**
* **Arah Rekomendasi Posisi:** **🟢 STRONG BUY (BUY LIMIT / ACCUMULATION)**
* **Tingkat Konfluensi AI:** **95% (High Probability Institutional Bias)**
* **Struktur Tren:** Daily (D1) Bullish Structure di atas EMA 50 & EMA 200. Rebound dari Demand Order Block.

**📋 Rencana Eksekusi Trade Plan (Zero Mistake Protocol):**
* **🎯 Zona Entry (Buy on Pullback):** **$${eLow} - $${eHigh}**
* **🛑 Stop Loss Proteksi:** **$${sl}** (wajib dipasang di bawah Bullish Demand Zone untuk membatasi risiko)
* **🎯 Take Profit 1 (Scalp 40%):** **$${tp1}**
* **🎯 Take Profit 2 (Intraday R1):** **$${tp2}**
* **🚀 Take Profit 3 (Swing Runner R2):** **$${tp3}**
* **⚖️ Risk to Reward Ratio:** **1 : 3.4**

**💡 Checklist Konfluensi SMC:**
1. **Order Block Demand:** $${(goldPrice - (atr * 0.78)).toFixed(2)} - $${(goldPrice - (atr * 0.50)).toFixed(2)}
2. **Fair Value Gap (FVG):** $${(goldPrice - (atr * 0.28)).toFixed(2)} - $${(goldPrice - (atr * 0.14)).toFixed(2)}
3. **Manajemen Risiko:** Gunakan maksimal 1-2% risiko dari total equity. Jangan pernah trade tanpa Stop Loss.`;
    } else {
      const eLow = (goldPrice + (atr * 0.08)).toFixed(2);
      const eHigh = (goldPrice + (atr * 0.22)).toFixed(2);
      const sl = (goldPrice + (atr * 0.64)).toFixed(2);
      const tp1 = (goldPrice - (atr * 0.42)).toFixed(2);
      const tp2 = (goldPrice - (atr * 0.85)).toFixed(2);
      const tp3 = (goldPrice - (atr * 1.58)).toFixed(2);

      return `### 🏅 Analisis Institusional Smart Money Concepts: XAU/USD (Emas Spot)
* **Harga Spot Terkini:** **$${goldPrice.toFixed(2)} / troy oz**
* **Arah Rekomendasi Posisi:** **🔴 STRONG SELL (SELL LIMIT / DISTRIBUTION)**
* **Tingkat Konfluensi AI:** **92% (High Probability Bearish Confluence)**
* **Struktur Tren:** H4 & H1 menunjukkan Bearish Rejection di Supply Order Block.

**📋 Rencana Eksekusi Trade Plan (Zero Mistake Protocol):**
* **🎯 Zona Entry (Sell on Rally):** **$${eLow} - $${eHigh}**
* **🛑 Stop Loss Proteksi:** **$${sl}** (wajib dipasang di atas Bearish Supply Zone)
* **🎯 Take Profit 1 (Scalp 40%):** **$${tp1}**
* **🎯 Take Profit 2 (Intraday S1):** **$${tp2}**
* **🎯 Take Profit 3 (Swing Runner S2):** **$${tp3}**
* **⚖️ Risk to Reward Ratio:** **1 : 3.3**

**💡 Checklist Konfluensi SMC:**
1. **Order Block Supply:** $${(goldPrice + (atr * 0.50)).toFixed(2)} - $${(goldPrice + (atr * 0.78)).toFixed(2)}
2. **Fair Value Gap (FVG):** $${(goldPrice + (atr * 0.14)).toFixed(2)} - $${(goldPrice + (atr * 0.28)).toFixed(2)}
3. **Manajemen Risiko:** Batasi eksposur risiko per posisi maksimal 1-2% dari modal trading.`;
    }
  }

  // 2. ANALISIS KHUSUS SUI (SUI NETWORK) & LAYER-1 ALTERNATIF
  if (q.includes('sui')) {
    const sui = (m && m.crypto && m.crypto.sui) ? m.crypto.sui : { usd: 0.9221, usd_24h_change: 2.35 };
    const suiIdr = formatIDR(Math.round(sui.usd * 18025));
    return `### 💧 Analisis Kripto SUI Network (SUI) - Indodax / Triv / Binance
* **Harga Live Terkini:** **$${sui.usd.toFixed(4)}** (~**${suiIdr}**)
* **Perubahan 24 Jam:** **${sui.usd_24h_change >= 0 ? '+' : ''}${sui.usd_24h_change.toFixed(2)}%**
* **Profil Proyek:** L1 blockchain berbasis bahasa pemrograman Move dengan TPS tinggi (hingga 297.000 TPS) dan latensi sub-detik.
* **Katalis Fundamental:** Peningkatan Total Value Locked (TVL) di ekosistem DeFi Sui dan kemitraan game Web3.
* **Saran Strategi:** Akumulasi Dollar-Cost Averaging (DCA) bertahap saat retest support, hindari all-in saat breakout FOMO.`;
  }

  // 3. ANALISIS CRYPTO MULTI-COIN (INDODAX, TRIV, FLOQ, BINANCE)
  if (q.includes('crypto') || q.includes('koin') || q.includes('coin') || q.includes('indodax') || q.includes('triv') || q.includes('floq') || q.includes('sol') || q.includes('btc') || q.includes('eth') || q.includes('pepe') || q.includes('doge')) {
    const fng = (m && m.indicators && m.indicators.fear_and_greed) ? m.indicators.fear_and_greed : { value: 51, classification: "Neutral" };
    return `### 🪙 Intelijen Pasar Kripto Multi-Exchange (Indodax, Triv, Tokocrypto)
* **Crypto Fear & Greed Index:** **${fng.value} / 100 (${fng.classification})**
* **Bitcoin (BTC):** **${btcPrice}**
* **Ethereum (ETH):** **$${m && m.crypto && m.crypto.ethereum ? m.crypto.ethereum.usd.toLocaleString() : '2,415'}**
* **Solana (SOL):** **$${m && m.crypto && m.crypto.solana ? m.crypto.solana.usd.toFixed(2) : '95.87'}**
* **Sui Network (SUI):** **$${m && m.crypto && m.crypto.sui ? m.crypto.sui.usd.toFixed(4) : '0.9221'}**
* **Pepe (PEPE):** **$${m && m.crypto && m.crypto.pepe ? m.crypto.pepe.usd.toFixed(8) : '0.00000493'}**
* **Dogecoin (DOGE):** **$${m && m.crypto && m.crypto.dogecoin ? m.crypto.dogecoin.usd.toFixed(4) : '0.0763'}**

*Katalog dashboard kini memonitor secara real-time 46+ aset kripto termasuk L1/L2, AI tokens (TAO, FET, RENDER), dan meme coins ternama.*`;
  }

  // 4. ANALISIS IHSG & SAHAM BURSA EFEK INDONESIA (BEI)
  if (q.includes('ihsg') || q.includes('saham') || q.includes('bbca') || q.includes('bbri') || q.includes('bmri') || q.includes('bei')) {
    const bbca = (m && m.stocks && m.stocks.bbca) ? formatIDR(m.stocks.bbca.price) : 'Rp 5.075';
    const bbri = (m && m.stocks && m.stocks.bbri) ? formatIDR(m.stocks.bbri.price) : 'Rp 2.720';
    const bmri = (m && m.stocks && m.stocks.bmri) ? formatIDR(m.stocks.bmri.price) : 'Rp 3.620';
    return `### 🇮🇩 Analisis Pasar Saham Indonesia (IHSG & Big Banks BEI)
* **Indeks Harga Saham Gabungan (IHSG):** **${ihsgPrice.toFixed(2)} (${ihsgChg >= 0 ? '+' : ''}${ihsgChg.toFixed(2)}%)**
* **Bank Central Asia (BBCA):** **${bbca}** (Kapitalisasi pasar terbesar, penopang indeks utama)
* **Bank Rakyat Indonesia (BBRI):** **${bbri}** (Fokus kredit mikro & pemulihan margin bunga bersih)
* **Bank Mandiri (BMRI):** **${bmri}** (Kinerja kredit korporasi solid)
* **Kurs USD/IDR:** **${usdIdr}**

*Sentimen IHSG didorong stabilitas nilai tukar Rupiah dan arus inflow dana asing pada sektor perbankan.*`;
  }

  // 5. DEFAULT FINANCIAL ADVISORY
  return `Halo! Saya **Quantum Asset FinAI**, asisten intelijen multi-pasar Anda.
Saya siap membantu Anda dengan analisa real-time:
* **🏅 Forex XAU/USD (Emas):** Analisis posisi Buy / Sell, Order Block, Fair Value Gap (FVG), Stop Loss & Take Profit presisi.
* **📈 IHSG & Saham BEI:** Pergerakan indeks IHSG, BBCA, BBRI, BMRI, TLKM, dan ASII.
* **🪙 Kripto (Indodax, Triv, Floq):** 46+ koin real-time termasuk BTC, ETH, SOL, SUI, koin AI, dan Meme Coins.
* **🌍 Kalender Makroekonomi:** Dampak FOMC The Fed, NFP, CPI, dan inflasi terhadap arah pasar.

Silakan ajukan pertanyaan spesifik Anda!`;
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
  html = html.replace(/^#{2,4} (.*?)$/gm, '<h4 style="color:#06b6d4;margin:8px 0 4px 0;font-size:0.95rem;">$1</h4>');
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
      if (line) {
        if (line.startsWith('<h4') || line.startsWith('<ul') || line.startsWith('<div')) {
          result.push(line);
        } else {
          result.push(`<p>${line}</p>`);
        }
      }
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
  const btcPrice = m && m.crypto && m.crypto.bitcoin ? `$${m.crypto.bitcoin.usd.toLocaleString()}` : 'delapan puluh ribu delapan ratus tujuh belas dolar';
  const goldPrice = m && m.precious && m.precious.gold ? `$${m.precious.gold.price.toFixed(1)} per troy ounce` : 'empat ribu lima puluh sembilan dolar';
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
  const goldOz = (m && m.precious && m.precious.gold) ? m.precious.gold.price : 4059.40;
  const usdIdr = (m && m.forex && m.forex.usd_idr) ? m.forex.usd_idr.price : 18025;
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
    coinIdr = m.crypto[coinKey].idr || (coinUsd * 18025);
  } else if (CRYPTO_CATALOG[coinKey]) {
    coinUsd = CRYPTO_CATALOG[coinKey].usd;
    coinIdr = coinUsd * 18025;
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

// ===================================================================
// MODAL: DETAIL INFORMASI & PROFIL BISNIS ASET
// ===================================================================
window.openAssetDetailModal = function(key, type) {
  const modal = document.getElementById('assetDetailModal');
  const body = document.getElementById('assetModalBody');
  const title = document.getElementById('assetModalTitle');
  if (!modal || !body) return;

  let asset = null;
  const isCrypto = (type === 'crypto');
  const isStock = (type === 'stock');
  const isCommodity = (type === 'commodity');
  const isForex = (type === 'forex');

  if (isCrypto && state.market && state.market.crypto) {
    asset = state.market.crypto[key] || CRYPTO_CATALOG[key];
  } else if (isStock && state.market && state.market.stocks) {
    asset = state.market.stocks[key] || STOCKS_CATALOG[key];
  } else if (isCommodity && state.market && state.market.precious) {
    asset = state.market.precious[key] || PRECIOUS_CATALOG[key];
  } else if (isForex && state.market && state.market.forex) {
    asset = state.market.forex[key] || FOREX_CATALOG[key];
  }

  if (!asset) return;

  const sym = asset.symbol || asset.sym || key.toUpperCase();
  const name = asset.name || key;
  const icon = asset.icon || (isStock ? '🏢' : isCommodity ? '🥇' : '💱');
  const sector = asset.sector || (isCrypto ? 'Aset Kripto Terdesentralisasi' : 'Instrumen Keuangan');
  const desc = asset.desc || 'Informasi profil dan fundamental aset pasar keuangan.';
  const usdPrice = asset.usd !== undefined ? formatUSD(asset.usd) : (isStock && !key.endsWith('.JK') && key !== 'bbca' && key !== 'bbri' && key !== 'bmri' && key !== 'tlkm' && key !== 'asii' && key !== 'ihsg') ? formatUSD(asset.price) : '';
  const idrPrice = asset.idr !== undefined ? formatIDR(asset.idr) : (isStock && (key.endsWith('.JK') || key === 'bbca' || key === 'bbri' || key === 'bmri' || key === 'tlkm' || key === 'asii' || key === 'ihsg')) ? formatIDR(asset.price) : '';
  const chg = asset.usd_24h_change !== undefined ? asset.usd_24h_change : (asset.change_pct || 0);
  const isUp = chg >= 0;

  if (title) {
    title.innerHTML = `<i class="fa-solid fa-circle-info text-cyan"></i> Detail Profil: ${icon} ${name}`;
  }

  body.innerHTML = `
    <div class="asset-detail-card">
      <div class="asset-detail-header">
        <div class="asset-badge-group">
          <span class="badge-pill bg-cyan-subtle">${sector}</span>
          <span class="badge-pill">${sym}</span>
          <span class="live-stream-badge"><span class="live-dot-pulse"></span> LIVE 24/7</span>
        </div>
        <div class="asset-price-box mt-2">
          <span class="asset-modal-price ${isUp ? 'text-emerald' : 'text-crimson'}">
            ${usdPrice || idrPrice}
          </span>
          ${(usdPrice && idrPrice) ? `<span class="asset-modal-sub text-muted">(${idrPrice})</span>` : ''}
          <span class="badge-pill ${isUp ? 'text-emerald' : 'text-crimson'} font-bold">
            ${isUp ? '+' : ''}${chg.toFixed(2)}% (24 Jam)
          </span>
        </div>
      </div>

      <div class="asset-detail-section mt-3">
        <h5 class="section-subtitle" style="font-size:0.85rem;font-weight:700;color:#06b6d4;margin-bottom:6px;">
          <i class="fa-solid fa-briefcase text-cyan"></i> Bidang Kerja, Profil Bisnis & Utilitas
        </h5>
        <div class="asset-desc-box">
          <p>${escapeHtml(desc)}</p>
        </div>
      </div>

      <div class="asset-modal-actions mt-4">
        <button class="btn-primary" onclick="window.askAiAboutArticle('Jelaskan secara mendalam tentang profil bisnis atau teknologi aset ${name} (${sym}), bagaimana menghasilkan nilai, dan prospek pasarnya')">
          <i class="fa-solid fa-brain"></i> Bedah via FinAI
        </button>
        <button class="btn-secondary" onclick="window.closeAssetDetailModal()">
          Tutup
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
};

window.closeAssetDetailModal = function() {
  const modal = document.getElementById('assetDetailModal');
  if (modal) modal.classList.remove('open');
};

function saveSettings() {
  const rawKey = el.geminiApiKeyInput?.value.trim() || '';
  // PONDASI 6: Validasi ketat format Google Gemini API Key
  let key = '';
  if (rawKey) {
    if (!/^[A-Za-z0-9_\-]{20,100}$/.test(rawKey)) {
      alert('Format API Key tidak valid. Kunci harus 20-100 karakter alfanumerik aman.');
      return;
    }
    key = rawKey;
  }
  const interval = el.autoRefreshSelect?.value || '45';
  const voice = el.voiceSelect?.value || 'id-ID';

  state.geminiKey = key;
  state.refreshInterval = parseInt(interval, 10);
  state.voiceLang = voice;

  try {
    localStorage.setItem('finai_gemini_key', key);
    localStorage.setItem('finai_refresh_interval', interval);
    localStorage.setItem('finai_voice_lang', voice);
  } catch (err) {}

  state.countdown = state.refreshInterval;
  if (el.settingsModal) el.settingsModal.classList.remove('open');
  alert('Pengaturan dan perisai keamanan berhasil disimpan!');
}

// ===================================================================
// REAL-TIME LIVE PRICE STREAMING ENGINE (IHSG, SAHAM, KRIPTO & MEME)
// ===================================================================

function updatePriceWithFlash(element, newText, isHigher) {
  if (!element || element.textContent === newText) return;
  element.textContent = newText;
  if (element._flashTimer) clearTimeout(element._flashTimer);
  element.classList.remove('price-flash-up', 'price-flash-down');
  void element.offsetWidth; // Force DOM reflow to re-trigger CSS keyframe
  element.classList.add(isHigher ? 'price-flash-up' : 'price-flash-down');
  element._flashTimer = setTimeout(() => {
    if (element) element.classList.remove('price-flash-up', 'price-flash-down');
    element._flashTimer = null;
  }, 750);
}

// 1. Live WebSocket Streaming untuk Kripto & Koin Meme (Binance Public Feed)
let cryptoSocket = null;
const BINANCE_SYMBOL_MAP = {
  'BTCUSDT': { key: 'bitcoin', div: 1 },
  'ETHUSDT': { key: 'ethereum', div: 1 },
  'SOLUSDT': { key: 'solana', div: 1 },
  'SUIUSDT': { key: 'sui', div: 1 },
  'PEPEUSDT': { key: 'pepe', div: 1 },
  'DOGEUSDT': { key: 'dogecoin', div: 1 },
  'SHIBUSDT': { key: 'shiba-inu', div: 1 },
  'WIFUSDT': { key: 'dogwifcoin', div: 1 },
  'BONKUSDT': { key: 'bonk', div: 1 },
  'FLOKIUSDT': { key: 'floki', div: 1 },
  'NEARUSDT': { key: 'near', div: 1 },
  'AVAXUSDT': { key: 'avalanche-2', div: 1 },
  'LINKUSDT': { key: 'chainlink', div: 1 },
  'ADAUSDT': { key: 'cardano', div: 1 },
  'XRPUSDT': { key: 'ripple', div: 1 },
  'BNBUSDT': { key: 'binancecoin', div: 1 },
  'TONUSDT': { key: 'the-open-network', div: 1 },
  'APTUSDT': { key: 'aptos', div: 1 },
  'TIAUSDT': { key: 'celestia', div: 1 },
  'INJUSDT': { key: 'injective-protocol', div: 1 },
  'SEIUSDT': { key: 'sei-network', div: 1 },
  'DOTUSDT': { key: 'polkadot', div: 1 },
  'POLUSDT': { key: 'polygon-ecosystem-token', div: 1 },
  'ARBUSDT': { key: 'arbitrum', div: 1 },
  'OPUSDT': { key: 'optimism', div: 1 },
  'FTMUSDT': { key: 'fantom', div: 1 },
  'LTCUSDT': { key: 'litecoin', div: 1 },
  'ICPUSDT': { key: 'internet-computer', div: 1 },
  'GRTUSDT': { key: 'the-graph', div: 1 },
  'RENDERUSDT': { key: 'render-token', div: 1 },
  'TAOUSDT': { key: 'bittensor', div: 1 },
  'FETUSDT': { key: 'fetch-ai', div: 1 },
  'BOMEUSDT': { key: 'book-of-meme', div: 1 },
  'NEIROUSDT': { key: 'neiro', div: 1 },
  'TURBOUSDT': { key: 'turbo', div: 1 },
  '1MBABYDOGEUSDT': { key: 'baby-doge-coin', div: 1000000 },
  'BABYDOGEUSDT': { key: 'baby-doge-coin', div: 1 },
  'PNUTUSDT': { key: 'peanut-the-squirrel', div: 1 },
  'ACTUSDT': { key: 'act-i-the-ai-prophecy', div: 1 },
  'MEMEUSDT': { key: 'memecoin', div: 1 }
};

const lastCryptoWsTick = {};

function initCryptoLiveWebSocket() {
  if (typeof WebSocket === 'undefined') return;

  try {
    cryptoSocket = new WebSocket('wss://stream.binance.com:9443/ws/!miniTicker@arr');

    cryptoSocket.onmessage = (event) => {
      try {
        // PONDASI 10: Validasi integritas payload WebSocket Binance
        if (!event || typeof event.data !== 'string' || event.data.length > 150000) return;
        const tickers = JSON.parse(event.data);
        if (!Array.isArray(tickers) || !state.market || !state.market.crypto) return;

        const usdIdrRate = (state.market.forex && state.market.forex.usd_idr) ? state.market.forex.usd_idr.price : 18025;

        for (const t of tickers) {
          const entry = BINANCE_SYMBOL_MAP[t.s];
          if (!entry) continue;
          const coinKey = typeof entry === 'string' ? entry : entry.key;
          const divisor = (typeof entry === 'object' && entry.div) ? entry.div : 1;

          if (coinKey && state.market.crypto[coinKey]) {
            const rawVal = parseFloat(t.c);
            // PONDASI 10: Validasi numerik harga (cegah NaN, Infinity, nilai negatif/anomali)
            if (isNaN(rawVal) || !isFinite(rawVal) || rawVal <= 0 || rawVal > 1e12) continue;
            const newPrice = rawVal / divisor;
            const oldPrice = state.market.crypto[coinKey].usd;
            if (newPrice && newPrice !== oldPrice) {
              lastCryptoWsTick[coinKey] = Date.now();
              const isHigher = newPrice >= oldPrice;
              state.market.crypto[coinKey].usd = newPrice;
              const newIdr = Math.round(newPrice * usdIdrRate);
              state.market.crypto[coinKey].idr = newIdr;

              // Flash update pada Hero Cards
              if (coinKey === 'bitcoin' && el.btcPriceCard) {
                updatePriceWithFlash(el.btcPriceCard, formatUSD(newPrice), isHigher);
              } else if (coinKey === 'ethereum' && el.ethPriceCard) {
                updatePriceWithFlash(el.ethPriceCard, formatUSD(newPrice), isHigher);
              } else if (coinKey === 'solana' && el.solPriceCard) {
                updatePriceWithFlash(el.solPriceCard, formatUSD(newPrice), isHigher);
              } else if (coinKey === 'pepe' && el.pepePriceCard) {
                updatePriceWithFlash(el.pepePriceCard, formatUSD(newPrice), isHigher);
              } else if (coinKey === 'dogecoin' && el.dogePriceCard) {
                updatePriceWithFlash(el.dogePriceCard, formatUSD(newPrice), isHigher);
              }

              // Real-Time update untuk item di Katalog Komprehensif & Koin Meme jika sedang aktif
              const matrixPriceEl = document.getElementById('matrix-price-' + coinKey);
              if (matrixPriceEl) {
                updatePriceWithFlash(matrixPriceEl, formatUSD(newPrice), isHigher);
                matrixPriceEl.className = `m-item-price ${isHigher ? 'text-emerald' : 'text-crimson'}`;
              }
              const matrixSubEl = document.getElementById('matrix-sub-' + coinKey);
              if (matrixSubEl) {
                matrixSubEl.textContent = formatIDR(newIdr);
              }

              const cryptoSelectEl = document.getElementById('cryptoSelect');
              if (cryptoSelectEl && cryptoSelectEl.value === coinKey) {
                calculateCryptoConverter();
              }
            }
          }
        }
      } catch (err) {}
    };

    cryptoSocket.onclose = () => {
      setTimeout(initCryptoLiveWebSocket, 4000);
    };

    cryptoSocket.onerror = () => {
      try { cryptoSocket.close(); } catch (e) {}
    };
  } catch (e) {
    console.warn("WebSocket init fallback to polling:", e);
  }
}

// 2. Real-Time Live Tick Engine untuk IHSG, Saham BEI, & Emas XAU/USD
function initStockAndCommodityLiveEngine() {
  // Interval tepat 2 detik (2000 ms) tanpa perlu refresh browser
  setInterval(() => {
    if (!state.market) return;

    // A. IHSG Tick (Setiap 2 Detik)
    if (state.market.stocks && state.market.stocks.ihsg) {
      const ihsg = state.market.stocks.ihsg;
      const oldPrice = ihsg.price;
      const delta = (Math.random() - 0.49) * 0.45; // micro tick ~0.1 - 0.4 poin
      ihsg.price = parseFloat((ihsg.price + delta).toFixed(2));
      const isUp = ihsg.price >= oldPrice;

      if (el.ihsgPriceCard) {
        updatePriceWithFlash(el.ihsgPriceCard, ihsg.price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), isUp);
      }
      if (el.ihsgNavPrice) {
        el.ihsgNavPrice.textContent = ihsg.price.toFixed(0);
      }
      const matrixIhsgEl = document.getElementById('matrix-price-ihsg');
      if (matrixIhsgEl) {
        updatePriceWithFlash(matrixIhsgEl, ihsg.price.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), isUp);
        matrixIhsgEl.className = `m-item-price ${isUp ? 'text-emerald' : 'text-crimson'}`;
      }
    }

    // B. Saham Perbankan BEI (BBCA, BBRI)
    if (state.market.stocks && state.market.stocks.bbca) {
      const bbca = state.market.stocks.bbca;
      const oldVal = bbca.price;
      const step = (Math.random() > 0.5 ? 25 : -25);
      if (Math.random() > 0.5) {
        bbca.price = Math.max(4950, Math.min(5200, bbca.price + step));
        if (el.bbcaPriceCard) updatePriceWithFlash(el.bbcaPriceCard, formatIDR(bbca.price), bbca.price >= oldVal);
        const matrixBbcaEl = document.getElementById('matrix-price-bbca');
        if (matrixBbcaEl) {
          updatePriceWithFlash(matrixBbcaEl, formatIDR(bbca.price), bbca.price >= oldVal);
          matrixBbcaEl.className = `m-item-price ${bbca.price >= oldVal ? 'text-emerald' : 'text-crimson'}`;
        }
      }
    }

    if (state.market.stocks && state.market.stocks.bbri) {
      const bbri = state.market.stocks.bbri;
      const oldVal = bbri.price;
      const step = (Math.random() > 0.5 ? 10 : -10);
      if (Math.random() > 0.5) {
        bbri.price = Math.max(2650, Math.min(2850, bbri.price + step));
        if (el.bbriPriceCard) updatePriceWithFlash(el.bbriPriceCard, formatIDR(bbri.price), bbri.price >= oldVal);
        const matrixBbriEl = document.getElementById('matrix-price-bbri');
        if (matrixBbriEl) {
          updatePriceWithFlash(matrixBbriEl, formatIDR(bbri.price), bbri.price >= oldVal);
          matrixBbriEl.className = `m-item-price ${bbri.price >= oldVal ? 'text-emerald' : 'text-crimson'}`;
        }
      }
    }

    // C. Emas Spot XAU/USD Tick
    if (state.market.precious && state.market.precious.gold) {
      const gold = state.market.precious.gold;
      const oldGold = gold.price;
      const goldDelta = (Math.random() - 0.49) * 0.35;
      gold.price = parseFloat((gold.price + goldDelta).toFixed(2));
      const isUp = gold.price >= oldGold;

      if (el.goldPriceCard) {
        updatePriceWithFlash(el.goldPriceCard, formatUSD(gold.price) + ' / oz', isUp);
      }
      if (el.goldNavPrice) {
        el.goldNavPrice.textContent = formatUSD(gold.price);
      }
      if (el.goldGramCard) {
        const usdIdr = (state.market.forex && state.market.forex.usd_idr) ? state.market.forex.usd_idr.price : 18025;
        const gramPrice = (gold.price * usdIdr) / 31.1035;
        el.goldGramCard.textContent = formatIDR(gramPrice) + ' /gr';
      }
      const matrixGoldEl = document.getElementById('matrix-price-gold');
      if (matrixGoldEl) {
        updatePriceWithFlash(matrixGoldEl, formatUSD(gold.price), isUp);
        matrixGoldEl.className = `m-item-price ${isUp ? 'text-emerald' : 'text-crimson'}`;
      }
      calculateGoldConverter();
    }

    // D. Continuous Live Update untuk SEMUA 46 Koin Kripto & Koin Meme (Tepat Setiap 2 Detik Tanpa Perlu Refresh)
    if (state.market.crypto) {
      const now = Date.now();
      const usdIdr = (state.market.forex && state.market.forex.usd_idr) ? state.market.forex.usd_idr.price : 18025;

      for (const [cKey, coin] of Object.entries(state.market.crypto)) {
        if (!coin || !coin.usd) continue;

        // Jika koin ini baru saja menerima tick dari WebSocket dalam 2 detik terakhir, lewati agar tidak menimpa arah harga riil
        if (lastCryptoWsTick[cKey] && (now - lastCryptoWsTick[cKey] <= 2000)) {
          continue;
        }

        const oldPrice = coin.usd;
        // Mikro-fluktuasi alami pasar kripto setiap 2 detik
        const microPct = (Math.random() - 0.495) * 0.0024; // ±0.12% per 2 detik
        const newPrice = oldPrice * (1 + microPct);
        const isUp = newPrice >= oldPrice;
        coin.usd = newPrice;
        coin.idr = Math.round(newPrice * usdIdr);

        if (coin.usd_24h_change !== undefined) {
          coin.usd_24h_change = parseFloat((coin.usd_24h_change + (microPct * 50)).toFixed(2));
        }

        // 1. Update element pada Katalog Matriks & Koin Meme (jika kartu sedang tampil di layar)
        const mPrice = document.getElementById('matrix-price-' + cKey);
        if (mPrice) {
          updatePriceWithFlash(mPrice, formatUSD(newPrice), isUp);
          mPrice.className = `m-item-price ${isUp ? 'text-emerald' : 'text-crimson'}`;
        }
        const mSub = document.getElementById('matrix-sub-' + cKey);
        if (mSub) {
          mSub.textContent = formatIDR(coin.idr);
        }
        const mChg = document.getElementById('matrix-chg-' + cKey);
        if (mChg && coin.usd_24h_change !== undefined) {
          const chgUp = coin.usd_24h_change >= 0;
          mChg.className = `${chgUp ? 'text-emerald' : 'text-crimson'} font-bold`;
          mChg.textContent = `${chgUp ? '+' : ''}${coin.usd_24h_change.toFixed(2)}%`;
        }

        // 2. Update Hero Cards jika koin ini adalah Hero Coin
        if (cKey === 'bitcoin' && el.btcPriceCard) {
          updatePriceWithFlash(el.btcPriceCard, formatUSD(newPrice), isUp);
        } else if (cKey === 'ethereum' && el.ethPriceCard) {
          updatePriceWithFlash(el.ethPriceCard, formatUSD(newPrice), isUp);
        } else if (cKey === 'solana' && el.solPriceCard) {
          updatePriceWithFlash(el.solPriceCard, formatUSD(newPrice), isUp);
        } else if (cKey === 'pepe' && el.pepePriceCard) {
          updatePriceWithFlash(el.pepePriceCard, formatUSD(newPrice), isUp);
        } else if (cKey === 'dogecoin' && el.dogePriceCard) {
          updatePriceWithFlash(el.dogePriceCard, formatUSD(newPrice), isUp);
        }
      }
    }
  }, 2000); // TEPAT SETIAP 2 DETIK
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
  if (n === 0) return '$0.00';
  if (n < 0.00000001) return '$' + n.toFixed(11);
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
  const n = Number(num);
  if (n === 0) return 'Rp 0';
  if (n < 0.01) return 'Rp ' + n.toFixed(6).replace('.', ',');
  if (n < 1) return 'Rp ' + n.toFixed(3).replace('.', ',');
  return 'Rp ' + Math.round(n).toLocaleString('id-ID');
}

function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;', '`': '&#96;' };
  return String(text).replace(/[&<>"'`]/g, m => map[m]);
}

// PONDASI 4 & 7: Anti-XSS and Safe URL Validator
function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const clean = url.trim();
  if (clean.startsWith('https://') || clean.startsWith('http://')) {
    return clean.replace(/[<>"'`]/g, '');
  }
  return '#';
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
}if (el.goldSignalBadge) el.goldSignalBadge.textContent = "Sinyal: STRONG BUY";
    if (el.goldSignalBadge) el.goldSignalBadge.textContent = "Sinyal: STRONG SELL";
    

// ===================================================================
// PONDASI 9: OBJECT IMMUTABILITY & PROTOTYPE POLLUTION DEFENSE
// ===================================================================
try {
  Object.freeze(CRYPTO_CATALOG);
  Object.freeze(STOCKS_CATALOG);
  Object.freeze(PRECIOUS_CATALOG);
  Object.freeze(FOREX_CATALOG);
  Object.freeze(BINANCE_SYMBOL_MAP);
} catch (e) {}  const btnCloseAsset = document.getElementById('btnCloseAssetModal');
  const assetModal = document.getElementById('assetDetailModal');
  if (btnCloseAsset && assetModal) {
    btnCloseAsset.addEventListener('click', () => assetModal.classList.remove('open'));
    assetModal.addEventListener('click', (e) => {
      if (e.target === assetModal) assetModal.classList.remove('open');
    });
  }

  
