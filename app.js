/* ==========================================================================
   天巡者 Weather Dashboard - Core Logic Application (ES6+)
   Features: Real-time GPS, CWA API client, 1H Caching, High-Fidelity Simulation,
             Interactive SVG Charting, Apple Weather Range Bars, Zoomable Radar
   ========================================================================== */

// --------------------------------------------------------------------------
// 1. Taiwan 22 Counties Database & Configuration
// --------------------------------------------------------------------------
const TAIWAN_COUNTIES = [
  { name: '臺北市', english: 'Taipei', lat: 25.0329, lon: 121.5654, region: '北部' },
  { name: '新北市', english: 'New Taipei', lat: 25.0142, lon: 121.4638, region: '北部' },
  { name: '桃園市', english: 'Taoyuan', lat: 24.9936, lon: 121.3009, region: '北部' },
  { name: '臺中市', english: 'Taichung', lat: 24.1477, lon: 120.6736, region: '中部' },
  { name: '臺南市', english: 'Tainan', lat: 22.9997, lon: 120.2270, region: '南部' },
  { name: '高雄市', english: 'Kaohsiung', lat: 22.6273, lon: 120.3014, region: '南部' },
  { name: '基隆市', english: 'Keelung', lat: 25.1283, lon: 121.7419, region: '北部' },
  { name: '新竹市', english: 'Hsinchu City', lat: 24.8138, lon: 120.9674, region: '北部' },
  { name: '新竹縣', english: 'Hsinchu County', lat: 24.8383, lon: 121.0177, region: '北部' },
  { name: '苗栗縣', english: 'Miaoli', lat: 24.5601, lon: 120.8206, region: '中部' },
  { name: '彰化縣', english: 'Changhua', lat: 24.0518, lon: 120.5161, region: '中部' },
  { name: '南投縣', english: 'Nantou', lat: 23.9155, lon: 120.6868, region: '中部' },
  { name: '雲林縣', english: 'Yunlin', lat: 23.7092, lon: 120.4313, region: '中部' },
  { name: '嘉義市', english: 'Chiayi City', lat: 23.4800, lon: 120.4491, region: '南部' },
  { name: '嘉義縣', english: 'Chiayi County', lat: 23.4518, lon: 120.2554, region: '南部' },
  { name: '屏東縣', english: 'Pingtung', lat: 22.5515, lon: 120.5487, region: '南部' },
  { name: '宜蘭縣', english: 'Yilan', lat: 24.7021, lon: 121.7377, region: '東部' },
  { name: '花蓮縣', english: 'Hualien', lat: 23.9871, lon: 121.6015, region: '東部' },
  { name: '臺東縣', english: 'Taitung', lat: 22.7972, lon: 121.0772, region: '東部' },
  { name: '澎湖縣', english: 'Penghu', lat: 23.5711, lon: 119.5793, region: '離島' },
  { name: '金門縣', english: 'Kinmen', lat: 24.4482, lon: 118.3764, region: '離島' },
  { name: '連江縣', english: 'Matsu', lat: 26.1519, lon: 119.9392, region: '離島' }
];

// Pre-configured default key (Left empty for GitHub security - user can input in Settings modal)
const DEFAULT_API_KEY = '';

const TOWNSHIP_DATA = {
  "臺北市": "中正區 萬華區 大同區 中山區 松山區 大安區 信義區 內湖區 南港區 士林區 北投區 文山區",
  "新北市": "板橋區 三重區 中和區 永和區 新莊區 新店區 土城區 蘆洲區 汐止區 樹林區 鶯歌區 三峽區 淡水區 瑞芳區 五股區 泰山區 林口區 深坑區 石碇區 坪林區 三芝區 石門區 八里區 平溪區 雙溪區 貢寮區 金山區 萬里區 烏來區",
  "桃園市": "桃園區 中壢區 平鎮區 八德區 楊梅區 蘆竹區 大溪區 龍潭區 龜山區 大園區 觀音區 新屋區 復興區",
  "臺中市": "中區 東區 南區 西區 北區 北屯區 西屯區 南屯區 太平區 大里區 霧峰區 烏日區 豐原區 后里區 石岡區 東勢區 和平區 新社區 潭子區 大雅區 神岡區 大肚區 沙鹿區 龍井區 梧棲區 清水區 大甲區 外埔區 大安區",
  "臺南市": "新營區 鹽水區 白河區 柳營區 後壁區 東山區 麻豆區 下營區 六甲區 官田區 大內區 佳里區 學甲區 西港區 七股區 將軍區 北門區 新化區 善化區 新市區 安定區 山上區 玉井區 楠西區 南化區 左鎮區 仁德區 歸仁區 關廟區 龍崎區 永康區 安南區 安平區 中西區 北區 南區 東區",
  "高雄市": "鹽埕區 鼓山區 左營區 楠梓區 三民區 新興區 前金區 苓雅區 前鎮區 旗津區 小港區 鳳山區 林園區 大寮區 大樹區 大社區 仁武區 鳥松區 岡山區 橋頭區 燕巢區 田寮區 阿蓮區 路竹區 湖內區 茄萣區 永安區 彌陀區 梓官區 旗山區 美濃區 六龜區 甲仙區 杉林區 內門區 茂林區 桃源區 那瑪夏區",
  "基隆市": "中正區 信義區 仁愛區 中山區 安樂區 暖暖區 七堵區",
  "新竹市": "東區 北區 香山區",
  "嘉義市": "東區 西區",
  "新竹縣": "竹北市 竹東鎮 新埔鎮 關西鎮 湖口鄉 新豐鄉 芎林鄉 橫山鄉 北埔鄉 寶山鄉 峨眉鄉 尖石鄉 五峰鄉",
  "苗栗縣": "苗栗市 頭份市 竹南鎮 後龍鎮 通霄鎮 苑裡鎮 卓蘭鎮 造橋鄉 西湖鄉 頭屋鄉 公館鄉 銅鑼鄉 三義鄉 大湖鄉 獅潭鄉 三灣鄉 南庄鄉 泰安鄉",
  "彰化縣": "彰化市 員林市 和美鎮 鹿港鎮 溪湖鎮 田中鎮 北斗鎮 二林鎮 線西鄉 伸港鄉 福興鄉 秀水鄉 花壇鄉 大村鄉 埔鹽鄉 埔心鄉 永靖鄉 社頭鄉 二水鄉 田尾鄉 埤頭鄉 芳苑鄉 大城鄉 竹塘鄉 溪州鄉 芬園鄉",
  "南投縣": "南投市 草屯鎮 埔里鎮 竹山鎮 集集鎮 名間鄉 鹿谷鄉 中寮鄉 魚池鄉 國姓鄉 水里鄉 信義鄉 仁愛鄉",
  "雲林縣": "斗六市 斗南鎮 虎尾鎮 西螺鎮 土庫鎮 北港鎮 古坑鄉 大埤鄉 莿桐鄉 林內鄉 二崙鄉 崙背鄉 麥寮鄉 東勢鄉 褒忠鄉 台西鄉 元長鄉 四湖鄉 口湖鄉 水林鄉",
  "嘉義縣": "太保市 朴子市 布袋鎮 大林鎮 民雄鄉 溪口鄉 新港鄉 六腳鄉 東石鄉 義竹鄉 鹿草鄉 水上鄉 中埔鄉 竹崎鄉 梅山鄉 番路鄉 大埔鄉 阿里山鄉",
  "屏東縣": "屏東市 潮州鎮 東港鎮 恆春鎮 萬丹鄉 長治鄉 麟洛鄉 九如鄉 里港鄉 鹽埔鄉 高樹鄉 萬巒鄉 內埔鄉 竹田鄉 新埤鄉 枋寮鄉 新園鄉 崁頂鄉 林邊鄉 南州鄉 佳冬鄉 琉球鄉 車城鄉 滿州鄉 枋山鄉 三地門鄉 霧台鄉 瑪家鄉 泰武鄉 來義鄉 春日鄉 獅子鄉 牡丹鄉",
  "宜蘭縣": "宜蘭市 羅東鎮 蘇澳鎮 頭城鎮 礁溪鄉 壯圍鄉 員山鄉 冬山鄉 五結鄉 三星鄉 大同鄉 南澳鄉",
  "花蓮縣": "花蓮市 鳳林鎮 玉里鎮 新城鄉 吉安鄉 壽豐鄉 光復鄉 豐濱鄉 瑞穗鄉 富里鄉 秀林鄉 萬榮鄉 卓溪鄉",
  "臺東縣": "台東市 成功鎮 關山鎮 卑南鄉 大武鄉 太麻里鄉 東河鄉 長濱鄉 鹿野鄉 池上鄉 綠島鄉 延平鄉 海端鄉 達仁鄉 金峰鄉 蘭嶼鄉",
  "澎湖縣": "馬公市 湖西鄉 白沙鄉 西嶼鄉 望安鄉 七美鄉",
  "金門縣": "金城鎮 金湖鎮 金沙鎮 金寧鄉 烈嶼鄉 烏坵鄉",
  "連江縣": "南竿鄉 北竿鄉 莒光鄉 東引鄉"
};

const COUNTY_TOWN_APIS = {
  "宜蘭縣": { 3: "F-D0047-001", 7: "F-D0047-003" },
  "桃園市": { 3: "F-D0047-005", 7: "F-D0047-007" },
  "新竹縣": { 3: "F-D0047-009", 7: "F-D0047-011" },
  "苗栗縣": { 3: "F-D0047-013", 7: "F-D0047-015" },
  "彰化縣": { 3: "F-D0047-017", 7: "F-D0047-019" },
  "南投縣": { 3: "F-D0047-021", 7: "F-D0047-023" },
  "雲林縣": { 3: "F-D0047-025", 7: "F-D0047-027" },
  "嘉義縣": { 3: "F-D0047-029", 7: "F-D0047-031" },
  "屏東縣": { 3: "F-D0047-033", 7: "F-D0047-035" },
  "臺東縣": { 3: "F-D0047-037", 7: "F-D0047-039" },
  "花蓮縣": { 3: "F-D0047-041", 7: "F-D0047-043" },
  "澎湖縣": { 3: "F-D0047-045", 7: "F-D0047-047" },
  "基隆市": { 3: "F-D0047-049", 7: "F-D0047-051" },
  "新竹市": { 3: "F-D0047-053", 7: "F-D0047-055" },
  "嘉義市": { 3: "F-D0047-057", 7: "F-D0047-059" },
  "臺北市": { 3: "F-D0047-061", 7: "F-D0047-063" },
  "高雄市": { 3: "F-D0047-065", 7: "F-D0047-067" },
  "新北市": { 3: "F-D0047-069", 7: "F-D0047-071" },
  "臺中市": { 3: "F-D0047-073", 7: "F-D0047-075" },
  "臺南市": { 3: "F-D0047-077", 7: "F-D0047-079" },
  "連江縣": { 3: "F-D0047-081", 7: "F-D0047-083" },
  "金門縣": { 3: "F-D0047-085", 7: "F-D0047-087" }
};

// Cloudflare Worker Proxy URL (Optional)
// If you deploy a Cloudflare Worker to proxy CWA API and hide your API key, paste its URL here.
// Example: 'https://taiwan-weather-proxy.yourname.workers.dev'
const CLOUDFLARE_PROXY_URL = 'https://wearther-proxy.simon6314.workers.dev';

// --------------------------------------------------------------------------
// 2. Application State Management
// --------------------------------------------------------------------------
const AppState = {
  apiKey: localStorage.getItem('cwa_api_key') || DEFAULT_API_KEY,
  dataMode: 'live', // Enforce live CWA only
  isSimulationActive: false,
  activeAlerts: [], // Store live or simulated weather alerts
  
  currentLocationCounty: '臺北市中正區', // Default fallback
  currentWeather: {},            // Cached current weather for main display
  addedRegions: JSON.parse(localStorage.getItem('cwa_added_regions')) || ['新北市', '臺中市', '高雄市'],
  allCountiesWeatherData: {},    // Map of countyName -> parsed weather profile
  observations: [],              // Real-time automatic weather station observations
  rainfallObservations: [],      // Real-time rain gauge observations
  
  activeTab: 'weather',          // 'weather' or 'radar'
  radarZoom: 1,
  radarPan: { x: 0, y: 0 },
  isDraggingRadar: false,
  dragStart: { x: 0, y: 0 },
  drawerMap: null,                // Leaflet map instance inside details drawer
  strongWindCapTowns: []          // CAP parsed townships under active wind warning
};

// Ensure API Key is initialized in local storage if not present
if (!localStorage.getItem('cwa_api_key')) {
  localStorage.setItem('cwa_api_key', DEFAULT_API_KEY);
}

// --------------------------------------------------------------------------
// 3. UI Selectors & Event Binding
// --------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initSettings();
  initNavigation();
  initSearch();
  initRadarControls();
  initDetailsDrawer();
  

  // Make main location panel clickable to open detailed forecast
  const mainPanel = document.querySelector('.main-panel');
  if (mainPanel) {
    mainPanel.style.cursor = 'pointer';
    mainPanel.addEventListener('click', () => {
      openDrawerForecast(AppState.currentLocationCounty);
    });
  }
  
  // Initial Boot Sequence
  startupSequence();
});

// Live clock ticking
function initClock() {
  const clockEl = document.getElementById('live-clock');
  const updateClock = () => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    const yyyy = now.getFullYear();
    const mm = pad(now.getMonth() + 1);
    const dd = pad(now.getDate());
    const hh = pad(now.getHours());
    const mi = pad(now.getMinutes());
    const ss = pad(now.getSeconds());
    clockEl.textContent = `${yyyy}/${mm}/${dd} ${hh}:${mi}:${ss}`;
  };
  updateClock();
  setInterval(updateClock, 1000);
}

// Header Navigation Tabs
function initNavigation() {
  const weatherTabBtn = document.getElementById('btn-tab-weather');
  const radarTabBtn = document.getElementById('btn-tab-radar');
  const typhoonTabBtn = document.getElementById('btn-tab-typhoon');
  const weatherPane = document.getElementById('tab-content-weather');
  const radarPane = document.getElementById('tab-content-radar');
  const typhoonPane = document.getElementById('tab-content-typhoon');
  
  const switchTab = (tab) => {
    AppState.activeTab = tab;
    
    // Stop radar animation if switching away from radar
    if (tab !== 'radar' && typeof toggleRadarPlay === 'function' && radarPlayInterval) {
      toggleRadarPlay();
    }
    
    // Reset active class on all tabs
    weatherTabBtn.classList.remove('active');
    radarTabBtn.classList.remove('active');
    if (typhoonTabBtn) typhoonTabBtn.classList.remove('active');
    
    // Reset active class on all panes
    weatherPane.classList.remove('active');
    radarPane.classList.remove('active');
    if (typhoonPane) typhoonPane.classList.remove('active');
    
    if (tab === 'weather') {
      weatherTabBtn.classList.add('active');
      weatherPane.classList.add('active');
    } else if (tab === 'radar') {
      radarTabBtn.classList.add('active');
      radarPane.classList.add('active');
      loadRadarImage();
    } else if (tab === 'typhoon') {
      if (typhoonTabBtn) typhoonTabBtn.classList.add('active');
      if (typhoonPane) typhoonPane.classList.add('active');
      initTyphoonTracker();
    }
  };
  
  weatherTabBtn.addEventListener('click', () => switchTab('weather'));
  radarTabBtn.addEventListener('click', () => switchTab('radar'));
  if (typhoonTabBtn) typhoonTabBtn.addEventListener('click', () => switchTab('typhoon'));
}

// --------------------------------------------------------------------------
// 4. Geolocation Positioning & Mapping
// --------------------------------------------------------------------------
// Proactive Cache Validation to scan and remove any corrupted caches containing NaN/undefined/null
function validateAndCleanAllCaches() {
  console.log('Validating cache integrity in localStorage...');
  
  // Clean up legacy caches from prior versions (V11, V10, V9, V8, V7, V2) to reclaim space and force immediate updates!
  const legacyKeys = [
    'cwa_weather_cache_v11', 'cwa_weather_cache_time_v11',
    'cwa_weather_cache_v10', 'cwa_weather_cache_time_v10',
    'cwa_weather_cache_v9', 'cwa_weather_cache_time_v9',
    'cwa_weather_cache_v8', 'cwa_weather_cache_time_v8',
    'cwa_weather_cache_v7', 'cwa_weather_cache_time_v7',
    'cwa_typhoon_cache_v2', 'cwa_typhoon_cache_time_v2',
    'cwa_typhoon_cache', 'cwa_typhoon_cache_time',
    'cwa_alerts_cache_v13', 'cwa_alerts_cache_time_v13',
    'cwa_alerts_cache_v12', 'cwa_alerts_cache_time_v12',
    'cwa_weather_cache_v12', 'cwa_weather_cache_time_v12',
    'cwa_alerts_cache_v14', 'cwa_alerts_cache_time_v14',
    'cwa_typhoon_cache_v3', 'cwa_typhoon_cache_time_v3',
    'cwa_rainfall_cache_v1', 'cwa_rainfall_cache_time_v1',
    'cwa_cap_wind_cache_v1', 'cwa_cap_wind_cache_time_v1'
  ];
  legacyKeys.forEach(k => localStorage.removeItem(k));
  
  // Wipe legacy township caches (including V10, V9, V8, V7)
  const legacyTownshipKeys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('cwa_town_cache_v10_') || key.startsWith('cwa_town_cache_time_v10_') ||
                key.startsWith('cwa_town_cache_v9_') || key.startsWith('cwa_town_cache_time_v9_') ||
                key.startsWith('cwa_town_cache_v8_') || key.startsWith('cwa_town_cache_time_v8_') ||
                key.startsWith('cwa_town_cache_v7_') || key.startsWith('cwa_town_cache_time_v7_'))) {
      legacyTownshipKeys.push(key);
    }
  }
  legacyTownshipKeys.forEach(k => localStorage.removeItem(k));
  
  // 1. Validate county cache
  const countyCacheKey = 'cwa_weather_cache_v13';
  const countyTimeKey = 'cwa_weather_cache_time_v13';
  const countyCache = localStorage.getItem(countyCacheKey);
  if (countyCache) {
    try {
      const parsed = JSON.parse(countyCache);
      const counties = Object.values(parsed);
      const sample = counties.find(c => c && c.current && !c.error);
      const isValid = sample && 
                      sample.current.temp !== undefined && 
                      sample.current.temp !== null && 
                      !isNaN(sample.current.temp) && 
                      sample.current.desc !== undefined &&
                      parsed._observations !== undefined;
      if (!isValid) {
        console.warn('Wiping invalid/corrupted/outdated county cache from localStorage');
        localStorage.removeItem(countyCacheKey);
        localStorage.removeItem(countyTimeKey);
      }
    } catch (e) {
      localStorage.removeItem(countyCacheKey);
      localStorage.removeItem(countyTimeKey);
    }
  }
  
  // 2. Validate all township caches
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('cwa_town_cache_v12_') && !key.includes('_time_')) {
      const townCache = localStorage.getItem(key);
      if (townCache) {
        try {
          const parsed = JSON.parse(townCache);
          const towns = Object.values(parsed);
          const sample = towns.find(t => t && t.current && !t.error);
          const isValid = sample && 
                          sample.current.temp !== undefined && 
                          sample.current.temp !== null && 
                          !isNaN(sample.current.temp) && 
                          sample.current.desc !== undefined;
          if (!isValid) {
            keysToRemove.push(key);
          }
        } catch (e) {
          keysToRemove.push(key);
        }
      }
    }
  }
  
  keysToRemove.forEach(key => {
    console.warn(`Wiping invalid/corrupted township cache: ${key}`);
    localStorage.removeItem(key);
    const timeKey = key.replace('cwa_town_cache_v12_', 'cwa_town_cache_time_v12_');
    localStorage.removeItem(timeKey);
  });
}

function startupSequence() {
  validateAndCleanAllCaches();
  updateDataBadge('定位中...', 'loading');
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        console.log(`GPS Coordinates received: Lat ${latitude}, Lon ${longitude}`);
        
        // Try reverse geocoding to get township-level details
        const geocoded = await reverseGeocodeTownship(latitude, longitude);
        
        if (geocoded) {
          AppState.currentLocationCounty = geocoded.county + geocoded.town;
          console.log(`Geocoded location: ${AppState.currentLocationCounty}`);
        } else {
          // Fallback to geometric matching
          const matchedCounty = getClosestTaiwanCounty(latitude, longitude);
          const fallbackTown = COUNTY_CAPITALS[matchedCounty.name] || '中正區';
          AppState.currentLocationCounty = matchedCounty.name + fallbackTown;
          console.log(`Geocoding failed. Geometric fallback: ${AppState.currentLocationCounty}`);
        }
        
        // Load data for the matched location
        loadWeatherDashboard();
      },
      (error) => {
        console.warn('Geolocation failed or denied. Defaulting to Taipei City. Code:', error.code);
        AppState.currentLocationCounty = '臺北市中正區';
        loadWeatherDashboard();
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  } else {
    AppState.currentLocationCounty = '臺北市中正區';
    loadWeatherDashboard();
  }
}

// Find closest Taiwan county using basic 2D Euclidean distance (used as offline fallback)
function getClosestTaiwanCounty(lat, lon) {
  let closest = TAIWAN_COUNTIES[0];
  let minDistance = Infinity;
  
  for (const county of TAIWAN_COUNTIES) {
    const dist = Math.pow(lat - county.lat, 2) + Math.pow(lon - county.lon, 2);
    if (dist < minDistance) {
      minDistance = dist;
      closest = county;
    }
  }
  return closest;
}

// Default capital/central township for each county (offline fallback)
const COUNTY_CAPITALS = {
  '臺北市': '中正區',
  '新北市': '板橋區',
  '桃園市': '桃園區',
  '臺中市': '西區',
  '臺南市': '安平區',
  '高雄市': '苓雅區',
  '基隆市': '中正區',
  '新竹市': '東區',
  '新竹縣': '竹北市',
  '苗栗縣': '苗栗市',
  '彰化縣': '彰化市',
  '南投縣': '南投市',
  '雲林縣': '斗六市',
  '嘉義市': '東區',
  '嘉義縣': '太保市',
  '屏東縣': '屏東市',
  '宜蘭縣': '宜蘭市',
  '花蓮縣': '花蓮市',
  '臺東縣': '臺東市',
  '澎湖縣': '馬公市',
  '金門縣': '金城鎮',
  '連江縣': '南竿鄉'
};

// Double-layered client-side reverse geocoding API fetcher
async function reverseGeocodeTownship(lat, lon) {
  // Layer 1: BigDataCloud (Fast, client-side friendly API, high limits under fair use)
  try {
    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=zh`);
    if (res.ok) {
      const data = await res.json();
      let county = data.city || data.principalSubdivision || '';
      let town = data.locality || '';
      
      county = county.replace('台', '臺').trim();
      town = town.replace('台', '臺').trim();
      
      const matchedCounty = TAIWAN_COUNTIES.find(c => county.includes(c.name) || c.name.includes(county));
      if (matchedCounty) {
        const countyTowns = TOWNSHIP_DATA[matchedCounty.name] ? TOWNSHIP_DATA[matchedCounty.name].split(' ') : [];
        const matchedTown = countyTowns.find(t => town.includes(t) || t.includes(town));
        if (matchedTown) {
          return { county: matchedCounty.name, town: matchedTown };
        }
      }
    }
  } catch (e) {
    console.warn('BigDataCloud reverse geocode failed, trying Nominatim...', e);
  }

  // Layer 2: OpenStreetMap Nominatim (Accurate point-in-polygon matching)
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`, {
      headers: {
        'Accept-Language': 'zh-TW,zh;q=0.9'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        let county = addr.county || addr.city || addr.state || addr.town || '';
        let town = addr.town || addr.suburb || addr.district || addr.city_district || addr.neighbourhood || '';
        
        county = county.replace('台', '臺').trim();
        town = town.replace('台', '臺').trim();
        
        const matchedCounty = TAIWAN_COUNTIES.find(c => county.includes(c.name) || c.name.includes(county));
        if (matchedCounty) {
          const countyTowns = TOWNSHIP_DATA[matchedCounty.name] ? TOWNSHIP_DATA[matchedCounty.name].split(' ') : [];
          const matchedTown = countyTowns.find(t => town.includes(t) || t.includes(town));
          if (matchedTown) {
            return { county: matchedCounty.name, town: matchedTown };
          }
        }
      }
    }
  } catch (e) {
    console.warn('Nominatim reverse geocode failed...', e);
  }

  return null;
}

// ── Sunrise/Sunset Astronomical Calculation Engine ──────────────────────────
// Computes high-fidelity client-side sunrise and sunset times based on 
// latitude, longitude, and day of the year.
function getSunriseSunset(latitude, longitude, date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime() + (start.getTimezoneOffset() - date.getTimezoneOffset()) * 60 * 1000;
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  
  // Declination of the sun (degrees)
  const declination = 23.45 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365);
  
  // Hour Angle (H)
  const latRad = (latitude * Math.PI) / 180;
  const decRad = (declination * Math.PI) / 180;
  const cosH = (Math.sin((-0.83 * Math.PI) / 180) - Math.sin(latRad) * Math.sin(decRad)) / (Math.cos(latRad) * Math.cos(decRad));
  
  let H = 0;
  if (cosH < -1) {
    H = Math.PI; // Polar day
  } else if (cosH > 1) {
    H = 0; // Polar night
  } else {
    H = Math.acos(cosH);
  }
  
  const H_hours = (H * 180) / Math.PI / 15;
  
  // Equation of Time (EqT) in minutes
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const EqT = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  
  // Solar Noon in local Taiwan time (Taiwan Standard Time is UTC+8, longitude 120 E)
  const solarNoonLocal = 12 + (120 - longitude) / 15 - EqT / 60;
  
  const sunriseLocalHours = solarNoonLocal - H_hours;
  const sunsetLocalHours = solarNoonLocal + H_hours;
  
  const sunriseDate = new Date(date);
  sunriseDate.setHours(Math.floor(sunriseLocalHours), Math.floor((sunriseLocalHours % 1) * 60), Math.floor(((sunriseLocalHours % 1) * 60 % 1) * 60), 0);
  
  const sunsetDate = new Date(date);
  sunsetDate.setHours(Math.floor(sunsetLocalHours), Math.floor((sunsetLocalHours % 1) * 60), Math.floor(((sunsetLocalHours % 1) * 60 % 1) * 60), 0);
  
  return {
    sunrise: sunriseDate,
    sunset: sunsetDate,
    sunriseStr: `${String(sunriseDate.getHours()).padStart(2, '0')}:${String(sunriseDate.getMinutes()).padStart(2, '0')}`,
    sunsetStr: `${String(sunsetDate.getHours()).padStart(2, '0')}:${String(sunsetDate.getMinutes()).padStart(2, '0')}`
  };
}

// Get coordinates for any region identifier (county or township)
function getCoordinates(identifier) {
  const parsed = parseIdentifier(identifier);
  const county = TAIWAN_COUNTIES.find(c => c.name === parsed.county);
  if (county) {
    return { lat: county.lat, lon: county.lon };
  }
  return { lat: 25.0329, lon: 121.5654 }; // Default to Taipei City
}

// Determine if a given date is night time for a specific region
function isNightTime(identifier, date) {
  const coords = getCoordinates(identifier);
  const sunTimes = getSunriseSunset(coords.lat, coords.lon, date);
  const timeMs = date.getTime();
  
  // Check against sunrise and sunset times
  const sunrise = new Date(date);
  sunrise.setHours(sunTimes.sunrise.getHours(), sunTimes.sunrise.getMinutes(), sunTimes.sunrise.getSeconds(), 0);
  
  const sunset = new Date(date);
  sunset.setHours(sunTimes.sunset.getHours(), sunTimes.sunset.getMinutes(), sunTimes.sunset.getSeconds(), 0);
  
  return timeMs < sunrise.getTime() || timeMs >= sunset.getTime();
}

// Helper to determine if we should bypass local storage caching (e.g. for development or force refresh)
function shouldBypassCache() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.has('nocache') || urlParams.has('refresh') || urlParams.has('dev');
}

// Clear all CWA weather caches, township caches, and typhoon caches from localStorage
function clearAllWeatherCaches() {
  console.log('Clearing all weather, township, and typhoon caches from localStorage...');
  localStorage.removeItem('cwa_weather_cache_v13');
  localStorage.removeItem('cwa_weather_cache_time_v13');
  localStorage.removeItem('cwa_typhoon_cache_v4');
  localStorage.removeItem('cwa_typhoon_cache_time_v4');
  localStorage.removeItem('cwa_rainfall_cache_v2');
  localStorage.removeItem('cwa_rainfall_cache_time_v2');
  localStorage.removeItem('cwa_cap_wind_cache_v2');
  localStorage.removeItem('cwa_cap_wind_cache_time_v2');
  localStorage.removeItem('cwa_cap_wind_cache_v1');
  localStorage.removeItem('cwa_cap_wind_cache_time_v1');
  
  // Wipe all versions of township and main weather caches to be safe
  localStorage.removeItem('cwa_weather_cache_v12');
  localStorage.removeItem('cwa_weather_cache_time_v12');
  localStorage.removeItem('cwa_weather_cache_v11');
  localStorage.removeItem('cwa_weather_cache_time_v11');
  localStorage.removeItem('cwa_weather_cache_v10');
  localStorage.removeItem('cwa_weather_cache_time_v10');
  localStorage.removeItem('cwa_weather_cache_v9');
  localStorage.removeItem('cwa_weather_cache_time_v9');
  localStorage.removeItem('cwa_weather_cache_v8');
  localStorage.removeItem('cwa_weather_cache_time_v8');
  localStorage.removeItem('cwa_weather_cache_v7');
  localStorage.removeItem('cwa_weather_cache_time_v7');
  localStorage.removeItem('cwa_typhoon_cache_v3');
  localStorage.removeItem('cwa_typhoon_cache_time_v3');
  localStorage.removeItem('cwa_typhoon_cache_v2');
  localStorage.removeItem('cwa_typhoon_cache_time_v2');
  
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && (key.startsWith('cwa_town_cache_') || key.includes('cwa_town_cache_time_'))) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(key => localStorage.removeItem(key));
  
  // Clear alerts cache
  localStorage.removeItem('cwa_alerts_cache_v15');
  localStorage.removeItem('cwa_alerts_cache_time_v15');
  localStorage.removeItem('cwa_alerts_cache_v14');
  localStorage.removeItem('cwa_alerts_cache_time_v14');
  localStorage.removeItem('cwa_alerts_cache_v13');
  localStorage.removeItem('cwa_alerts_cache_time_v13');
  localStorage.removeItem('cwa_alerts_cache_v12');
  localStorage.removeItem('cwa_alerts_cache_time_v12');
  localStorage.removeItem('cwa_alerts_cache_v2');
  localStorage.removeItem('cwa_alerts_cache_time_v2');
  localStorage.removeItem('cwa_alerts_cache');
  localStorage.removeItem('cwa_alerts_cache_time');
}

// Fetch active weather alerts from CWA (W-C0033-002) with 10 minutes cache
async function fetchActiveAlerts() {
  if (AppState.isSimulationActive) return;
  
  const cacheKey = 'cwa_alerts_cache_v15';
  const cacheTimeKey = 'cwa_alerts_cache_time_v15';
  const capCacheKey = 'cwa_cap_wind_cache_v2';
  const capCacheTimeKey = 'cwa_cap_wind_cache_time_v2';
  
  const cachedDataStr = localStorage.getItem(cacheKey);
  const cachedTimeStr = localStorage.getItem(cacheTimeKey);
  const cachedCapStr = localStorage.getItem(capCacheKey);
  const cachedCapTimeStr = localStorage.getItem(capCacheTimeKey);
  const now = new Date().getTime();
  
  // Use cached alerts if younger than 10 minutes (600,000 ms) and not bypassing cache
  if (!shouldBypassCache() && cachedDataStr && cachedTimeStr && (now - parseInt(cachedTimeStr)) < 600000) {
    try {
      AppState.activeAlerts = JSON.parse(cachedDataStr);
      console.log('Retrieved active weather alerts from cache:', AppState.activeAlerts);
      
      if (cachedCapStr) {
        AppState.strongWindCapTowns = JSON.parse(cachedCapStr);
        console.log('Retrieved CAP strong wind townships from cache:', AppState.strongWindCapTowns);
      } else {
        AppState.strongWindCapTowns = [];
      }
      return;
    } catch (e) {
      console.warn('Failed parsing alerts cache. Refreshing CWA API.', e);
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(cacheTimeKey);
      localStorage.removeItem(capCacheKey);
      localStorage.removeItem(capCacheTimeKey);
    }
  }
  
  console.log('Fetching fresh active weather alerts...');
  
  let baseUrl = 'https://opendata.cwa.gov.tw';
  let queryParams = `?format=JSON&_t=${Date.now()}`;
  
  if (CLOUDFLARE_PROXY_URL) {
    baseUrl = CLOUDFLARE_PROXY_URL.trim().replace(/\/$/, '');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }
    if (AppState.apiKey) {
      queryParams += `&Authorization=${AppState.apiKey}`;
    }
  } else if (AppState.apiKey) {
    queryParams += `&Authorization=${AppState.apiKey}`;
  } else {
    AppState.activeAlerts = [];
    return;
  }
  
  const parsedAlerts = [];
  
  // 1. Fetch Standard Weather Alerts (W-C0033-002)
  try {
    const res = await fetch(`${baseUrl}/api/v1/rest/datastore/W-C0033-002${queryParams}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success === 'true' && data.records && data.records.record) {
        const records = Array.isArray(data.records.record) ? data.records.record : [data.records.record];
        const grouped = {};
        
        for (const r of records) {
          const contentText = r.contents?.content?.contentText || r.contentText || '';
          if (!contentText) continue;
          
          const startTime = r.datasetInfo?.validTime?.startTime || r.startTime || '';
          const endTime = r.datasetInfo?.validTime?.endTime || r.endTime || '';
          
          const hazards = r.hazardConditions?.hazards?.hazard;
          const hazardArr = Array.isArray(hazards) ? hazards : (hazards ? [hazards] : []);
          
          if (hazardArr.length > 0) {
            for (const h of hazardArr) {
              const phenomena = h.info?.phenomena || r.phenomena || '';
              const significance = h.info?.significance || r.significance || '特報';
              const title = `${phenomena}${significance}`;
              const key = `${title}_${contentText}_${startTime}_${endTime}`;
              
              if (!grouped[key]) {
                grouped[key] = {
                  title: title || '天氣警特報',
                  phenomena: phenomena,
                  significance: significance,
                  contentText: contentText,
                  startTime: startTime,
                  endTime: endTime,
                  affectedAreas: []
                };
              }
              
              const locations = h.info?.affectedAreas?.location;
              const locationArr = Array.isArray(locations) ? locations : (locations ? [locations] : []);
              locationArr.forEach(loc => {
                const name = loc.locationName || '';
                if (name && !grouped[key].affectedAreas.includes(name.trim())) {
                  grouped[key].affectedAreas.push(name.trim());
                }
              });
            }
          } else {
            // Fallback for flat structure
            const phenomena = r.phenomena || '';
            const significance = r.significance || '特報';
            const title = `${phenomena}${significance}`;
            const key = `${title}_${contentText}_${startTime}_${endTime}`;
            
            if (!grouped[key]) {
              grouped[key] = {
                title: title || '天氣警特報',
                phenomena: phenomena,
                significance: significance,
                contentText: contentText,
                startTime: startTime,
                endTime: endTime,
                affectedAreas: []
              };
            }
            
            if (r.locationName && !grouped[key].affectedAreas.includes(r.locationName.trim())) {
              grouped[key].affectedAreas.push(r.locationName.trim());
            }
          }
        }
        
        for (const key of Object.keys(grouped)) {
          parsedAlerts.push(grouped[key]);
        }
      }
    } else {
      console.warn('CWA Alerts API returned status ' + res.status);
    }
  } catch (err) {
    console.error('Failed to fetch standard weather alerts (W-C0033-002):', err);
  }
  
  // 2. Fetch High Temperature Information (W-C0033-005)
  try {
    const resHeat = await fetch(`${baseUrl}/api/v1/rest/datastore/W-C0033-005${queryParams}`);
    if (resHeat.ok) {
      const heatData = await resHeat.json();
      if (heatData && heatData.success === 'true' && heatData.records && heatData.records.info) {
        const infos = Array.isArray(heatData.records.info) ? heatData.records.info : [heatData.records.info];
        for (const inf of infos) {
          // Check expiration
          const expiresMs = inf.expires ? new Date(inf.expires).getTime() : Infinity;
          if (!isNaN(expiresMs) && now > expiresMs) {
            continue; // Skip expired warnings
          }
          
          // Reconstruct description contentText
          let contentText = '';
          if (inf.description) {
            if (typeof inf.description === 'string') {
              contentText = inf.description;
            } else if (Array.isArray(inf.description.section)) {
              contentText = inf.description.section.map(s => s.value || '').join('\n');
            } else if (inf.description.value) {
              contentText = inf.description.value;
            } else if (typeof inf.description === 'object') {
              contentText = JSON.stringify(inf.description);
            }
          }
          if (!contentText) {
            contentText = inf.headline || '';
          }
          
          // Parse affectedAreas
          const affectedAreas = [];
          if (inf.area) {
            const areas = Array.isArray(inf.area) ? inf.area : [inf.area];
            for (const a of areas) {
              if (a.areaDesc) {
                affectedAreas.push(a.areaDesc.trim());
              }
            }
          }
          
          // Build event title and phenomena
          const phenomena = inf.event || '高溫';
          const title = inf.eventName || inf.headline || `${phenomena}資訊`;
          
          parsedAlerts.push({
            title: title,
            phenomena: phenomena,
            significance: '特報',
            contentText: contentText,
            startTime: inf.onset || inf.effective || '',
            endTime: inf.expires || '',
            affectedAreas: affectedAreas
          });
        }
      }
    } else {
      console.warn('CWA High Temp API returned status ' + resHeat.status);
    }
  } catch (errHeat) {
    console.error('Failed to fetch high temperature alerts (W-C0033-005):', errHeat);
  }
  
  // Group and merge warnings with identical title and time windows to prevent duplicate alerts (e.g. Yellow and Orange heat warnings both showing on a county-level card)
  const alertGroups = {};
  parsedAlerts.forEach(alert => {
    const key = `${alert.title}_${alert.startTime}_${alert.endTime}`;
    if (!alertGroups[key]) {
      alertGroups[key] = {
        title: alert.title,
        phenomena: alert.phenomena,
        significance: alert.significance,
        contentText: alert.contentText,
        startTime: alert.startTime,
        endTime: alert.endTime,
        affectedAreas: [...alert.affectedAreas]
      };
    } else {
      // Merge affected areas
      alert.affectedAreas.forEach(area => {
        if (!alertGroups[key].affectedAreas.includes(area)) {
          alertGroups[key].affectedAreas.push(area);
        }
      });
      // Resolve contentText descriptions (use the longer one if one nests the other, or concatenate)
      if (alertGroups[key].contentText !== alert.contentText) {
        if (alertGroups[key].contentText.includes(alert.contentText)) {
          // Do nothing
        } else if (alert.contentText.includes(alertGroups[key].contentText)) {
          alertGroups[key].contentText = alert.contentText;
        } else {
          alertGroups[key].contentText += '\n' + alert.contentText;
        }
      }
    }
  });
  
  const finalAlerts = Object.values(alertGroups);
  
  AppState.activeAlerts = finalAlerts;
  localStorage.setItem(cacheKey, JSON.stringify(finalAlerts));
  localStorage.setItem(cacheTimeKey, now.toString());
  console.log('Fetched, deduplicated, and cached alerts successfully:', finalAlerts);
  
  // 3. Fetch CAP Strong Wind Warning (W-C0033-006)
  try {
    let capUrl = '';
    if (CLOUDFLARE_PROXY_URL) {
      let proxyBase = CLOUDFLARE_PROXY_URL.trim().replace(/\/$/, '');
      if (!proxyBase.startsWith('http://') && !proxyBase.startsWith('https://')) {
        proxyBase = 'https://' + proxyBase;
      }
      capUrl = `${proxyBase}/fileapi/v1/opendataapi/W-C0033-006?_t=${Date.now()}`;
      if (AppState.apiKey) {
        capUrl += `&Authorization=${AppState.apiKey}`;
      }
    } else {
      capUrl = `https://opendata.cwa.gov.tw/fileapi/v1/opendataapi/W-C0033-006?_t=${Date.now()}`;
      if (AppState.apiKey) {
        capUrl += `&Authorization=${AppState.apiKey}`;
      }
    }
    
    console.log('Fetching CWA CAP strong wind alert (W-C0033-006)...');
    const resCap = await fetch(capUrl);
    if (resCap.ok) {
      const xmlText = await resCap.text();
      if (xmlText && xmlText.includes('<alert')) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Check if message type is Cancel
        const msgTypeEl = xmlDoc.getElementsByTagNameNS ? xmlDoc.getElementsByTagNameNS('*', 'msgType')[0] : xmlDoc.getElementsByTagName('msgType')[0];
        const isCancel = msgTypeEl && msgTypeEl.textContent.trim() === 'Cancel';
        
        if (!isCancel) {
          const areaDescs = xmlDoc.getElementsByTagNameNS ? xmlDoc.getElementsByTagNameNS('*', 'areaDesc') : xmlDoc.getElementsByTagName('areaDesc');
          const towns = [];
          for (let i = 0; i < areaDescs.length; i++) {
            const tName = areaDescs[i].textContent.trim();
            if (tName) {
              towns.push(tName.replace(/台/g, '臺'));
            }
          }
          AppState.strongWindCapTowns = towns;
          localStorage.setItem(capCacheKey, JSON.stringify(towns));
          localStorage.setItem(capCacheTimeKey, now.toString());
          console.log('Successfully loaded CAP strong wind townships:', towns);
        } else {
          AppState.strongWindCapTowns = [];
          localStorage.setItem(capCacheKey, JSON.stringify([]));
          localStorage.setItem(capCacheTimeKey, now.toString());
          console.log('CAP strong wind alert is canceled.');
        }
      } else {
        AppState.strongWindCapTowns = [];
        localStorage.setItem(capCacheKey, JSON.stringify([]));
        localStorage.setItem(capCacheTimeKey, now.toString());
        console.log('CAP strong wind alert response is empty or invalid.');
      }
    } else {
      console.warn('CWA CAP API returned status ' + resCap.status);
      AppState.strongWindCapTowns = null;
    }
  } catch (capErr) {
    console.error('Failed to fetch/parse CAP strong wind warning:', capErr);
    AppState.strongWindCapTowns = null;
  }
}

// Convert ISO time string to localized MM/DD HH:mm format
function formatAlertTime(timeStr) {
  if (!timeStr) return '無期限';
  try {
    const d = new Date(timeStr);
    if (isNaN(d.getTime())) return timeStr;
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${month}/${day} ${hours}:${minutes}`;
  } catch (e) {
    return timeStr;
  }
}

// Filter out redundant precipitation alerts (e.g. hide "大雨特報" if "豪雨特報" is already active)
function filterRedundantAlerts(alerts) {
  if (!alerts || alerts.length <= 1) return alerts;
  
  const rainLevels = ['超大豪雨特報', '大豪雨特報', '豪雨特報', '大雨特報'];
  const activeRainAlerts = alerts.filter(a => rainLevels.includes(a.title));
  
  if (activeRainAlerts.length > 1) {
    let highestRainAlert = null;
    for (const level of rainLevels) {
      const match = activeRainAlerts.find(a => a.title === level);
      if (match) {
        highestRainAlert = match;
        break;
      }
    }
    if (highestRainAlert) {
      return alerts.filter(a => !rainLevels.includes(a.title) || a === highestRainAlert);
    }
  }
  return alerts;
}

// Map of mountainous townships for each county in Taiwan
function isTownInMountainArea(county, town) {
  const c = county.replace(/台/g, '臺');
  const t = town.replace(/台/g, '臺');
  
  const mountainMap = {
    '臺北市': ['士林區', '北投區', '內湖區', '文山區', '南港區'],
    '新北市': ['烏來區', '三峽區', '石碇區', '坪林區', '平溪區', '雙溪區', '貢寮區', '瑞芳區', '萬里區', '金山區'],
    '桃園市': ['復興區'],
    '新竹縣': ['尖石鄉', '五峰鄉', '橫山鄉', '北埔鄉', '峨眉鄉'],
    '苗栗縣': ['泰安鄉', '南庄鄉', '獅潭鄉', '大湖鄉', '卓蘭鎮', '三灣鄉', '公館鄉'],
    '臺中市': ['和平區', '東勢區', '新社區', '石岡區'],
    '南投縣': ['仁愛鄉', '信義鄉', '竹山鎮', '鹿谷鄉', '魚池鄉', '水里鄉', '埔里鎮', '國姓鄉'],
    '雲林縣': ['古坑鄉'],
    '嘉義縣': ['阿里山鄉', '梅山鄉', '竹崎鄉', '番路鄉', '大埔鄉', '中埔鄉'],
    '臺南市': ['南化區', '楠西區', '玉井區', '左鎮區', '東山區', '白河區'],
    '高雄市': ['桃源區', '那瑪夏區', '茂林區', '六龜區', '甲仙區', '杉林區', '美濃區', '內門區'],
    '屏東縣': ['霧臺鄉', '三地門鄉', '瑪家鄉', '泰武鄉', '來義鄉', '春日鄉', '獅子鄉', '牡丹鄉'],
    '宜蘭縣': ['大同鄉', '南澳鄉'],
    '花蓮縣': ['秀林鄉', '萬榮鄉', '卓溪鄉'],
    '臺東縣': ['海端鄉', '延平鄉', '金峰鄉', '達仁鄉']
  };
  
  const list = mountainMap[c];
  if (!list) return false;
  return list.some(m => t.includes(m) || m.includes(t));
}

// Determine if a weather alert applies to the specified location (county/township)
// List of coastal townships for each county in Taiwan for Level 2 strong wind fallback
const TAIWAN_COASTAL_TOWNS = {
  '基隆市': ['中正區', '中山區', '安樂區', '信義區', '仁愛區'],
  '新北市': ['淡水區', '三芝區', '石門區', '金山區', '萬里區', '瑞芳區', '貢寮區', '八里區'],
  '桃園市': ['大園區', '觀音區', '新屋區', '蘆竹區'],
  '新竹縣': ['新豐鄉', '竹北市'],
  '新竹市': ['香山區', '北區'],
  '苗栗縣': ['竹南鎮', '後龍鎮', '通霄鎮', '苑裡鎮'],
  '臺中市': ['大安區', '外埔區', '清水區', '梧棲區', '龍井區'],
  '彰化縣': ['伸港鄉', '線西鄉', '鹿港鎮', '福興鄉', '芳苑鄉', '大城鄉'],
  '雲林縣': ['麥寮鄉', '台西鄉', '四湖鄉', '口湖鄉'],
  '嘉義縣': ['東石鄉', '布袋鎮'],
  '臺南市': ['北門區', '將軍區', '七股區', '安南區', '安平區', '南區'],
  '高雄市': ['茄萣區', '永安區', '彌陀區', '梓官區', '楠梓區', '左營區', '鼓山區', '旗津區', '前鎮區', '小港區', '林園區'],
  '屏東縣': ['新園鄉', '東港鎮', '林邊鄉', '佳冬鄉', '枋寮鄉', '枋山鄉', '車城鄉', '恆春鎮', '滿州鄉', '琉球鄉'],
  '宜蘭縣': ['頭城鎮', '壯圍鄉', '五結鄉', '蘇澳鎮', '南澳鄉'],
  '花蓮縣': ['新城鄉', '花蓮市', '吉安鄉', '壽豐鄉', '豐濱鄉'],
  '臺東縣': ['長濱鄉', '東河鄉', '成功鎮', '卑南鄉', '台東市', '太麻里鄉', '大武鄉', '達仁鄉', '綠島鄉', '蘭嶼鄉']
};

// Map of special meteorological warning regions to their constituent counties/towns
const SPECIAL_REGIONS = {
  '基隆北海岸': {
    counties: ['基隆市', '新北市'],
    towns: {
      '基隆市': ['中正區', '中山區', '安樂區', '信義區', '仁愛區'],
      '新北市': ['石門區', '三芝區', '金山區', '萬里區', '瑞芳區', '貢寮區']
    }
  },
  '恆春半島': {
    counties: ['屏東縣'],
    towns: {
      '屏東縣': ['恆春鎮', '車城鄉', '滿州鄉', '枋山鄉', '獅子鄉', '牡丹鄉']
    }
  },
  '蘭嶼綠島': {
    counties: ['臺東縣'],
    towns: {
      '臺東縣': ['蘭嶼鄉', '綠島鄉']
    }
  }
};

// Determine if a county-level strong wind warning in contentText is restricted to coastal areas
function isCountyCoastalRestricted(countyName, contentText) {
  if (!contentText) return false;
  
  const normText = contentText.replace(/台/g, '臺');
  const normCounty = countyName.replace(/台/g, '臺').replace('市', '').replace('縣', ''); // e.g. "桃園"
  
  let index = normText.indexOf(normCounty);
  if (index === -1) return false;
  
  let hasCoastalSpecifier = false;
  while (index !== -1) {
    const windowText = normText.substring(index, index + 25);
    if (windowText.includes('沿海') || windowText.includes('空曠') || windowText.includes('海面')) {
      hasCoastalSpecifier = true;
      break;
    }
    index = normText.indexOf(normCounty, index + 1);
  }
  return hasCoastalSpecifier;
}

// Determine if a weather alert applies to the specified location (county/township)
function isAlertMatch(alertArea, parsedLocation, alertObj = null) {
  if (!alertArea || !parsedLocation) return false;
  const normArea = alertArea.replace(/台/g, '臺');
  const normCounty = parsedLocation.county.replace(/台/g, '臺');
  const normTown = parsedLocation.town ? parsedLocation.town.replace(/台/g, '臺') : '';
  
  // 1. Handle Special Regions mapping first (e.g. 基隆北海岸, 恆春半島, 蘭嶼綠島)
  if (SPECIAL_REGIONS[normArea]) {
    const region = SPECIAL_REGIONS[normArea];
    if (!region.counties.includes(normCounty)) {
      return false;
    }
    if (parsedLocation.type === 'county') {
      return true;
    }
    if (parsedLocation.type === 'town' && normTown) {
      const allowedTowns = region.towns[normCounty];
      return allowedTowns ? allowedTowns.includes(normTown) : true;
    }
  }

  // 2. If it is a strong wind warning and we have official CAP parsed data
  const isWindAlert = alertObj && (
    (alertObj.phenomena && alertObj.phenomena.includes('強風')) ||
    (alertObj.title && alertObj.title.includes('強風'))
  );
  
  if (isWindAlert && Array.isArray(AppState.strongWindCapTowns) && AppState.strongWindCapTowns.length > 0) {
    if (parsedLocation.type === 'town' && normTown) {
      const fullTownKey = normCounty + normTown;
      return AppState.strongWindCapTowns.includes(fullTownKey);
    }
    if (parsedLocation.type === 'county') {
      return AppState.strongWindCapTowns.some(t => t.startsWith(normCounty));
    }
  }

  // 3. If it's not a special region and no CAP matches, it must start with the county name
  if (!normArea.startsWith(normCounty)) {
    return false;
  }
  
  // 4. For county-level view (no specific town is queried)
  if (parsedLocation.type === 'county') {
    return true; 
  }
  
  // 5. For town-level view (e.g. 竹北市)
  if (parsedLocation.type === 'town' && normTown) {
    // A. Check if the warning is a strong wind warning (level 2 coastal fallback)
    if (isWindAlert) {
      if (normArea === normCounty || normArea === `${normCounty}平地` || normArea === `${normCounty}平地及山區` || normArea === `${normCounty}沿海` || normArea === `${normCounty}沿海地區`) {
        const isCoastalOnly = isCountyCoastalRestricted(normCounty, alertObj.contentText);
        if (isCoastalOnly) {
          const coastalTowns = TAIWAN_COASTAL_TOWNS[normCounty];
          if (coastalTowns) {
            return coastalTowns.includes(normTown);
          }
        }
      }
    }
    
    // B. Check standard mountain/plains or exact matching
    if (normArea.includes(normTown)) {
      return true;
    }
    
    if (normArea === normCounty || normArea === `${normCounty}平地` || normArea === `${normCounty}平地及山區`) {
      const isMountain = isTownInMountainArea(normCounty, normTown);
      if (normArea.includes('平地') && isMountain) {
        return false;
      }
      return true; 
    }
    
    if (normArea === `${normCounty}山區`) {
      return isTownInMountainArea(normCounty, normTown);
    }
    
    if (normArea === `${normCounty}平地`) {
      return !isTownInMountainArea(normCounty, normTown);
    }
  }
  
  return false;
}

// Resolve coordinates for the specified parsed location identifier (uses rain observation coordinate fallback to county)
function getCoordsForLocation(parsed) {
  if (!parsed) return { lat: 23.973875, lon: 120.982024 };
  
  // Try to find matched rain observation station coordinates first
  const rainObs = findRainObservation(parsed.county, parsed.town || '');
  if (rainObs && rainObs.GeoInfo && rainObs.GeoInfo.Coordinates) {
    const wgs84 = rainObs.GeoInfo.Coordinates.find(c => c.CoordinateFormat === 'decimal degrees' || c.CoordinateName === 'WGS84');
    if (wgs84 && wgs84.StationLatitude && wgs84.StationLongitude) {
      return {
        lat: parseFloat(wgs84.StationLatitude),
        lon: parseFloat(wgs84.StationLongitude)
      };
    }
  }
  
  // Fallback to parent county coordinate in TAIWAN_COUNTIES
  const normCounty = parsed.county.replace(/台/g, '臺');
  const county = TAIWAN_COUNTIES.find(c => c.name.replace(/台/g, '臺') === normCounty);
  if (county) {
    return { lat: county.lat, lon: county.lon };
  }
  
  return { lat: 23.973875, lon: 120.982024 }; // Center of Taiwan
}

// Generate an intelligent array of geographical keywords for weather alert filtering
function getCountyKeywords(county) {
  if (!county) return [];
  const base = county.replace('台', '臺'); // Normalise to Traditional
  const alt = county.replace('臺', '台');
  const short1 = base.replace('市', '').replace('縣', '');
  const short2 = alt.replace('市', '').replace('縣', '');
  
  const keywords = [base, alt, short1, short2];
  
  if (base.includes('臺北') || base.includes('新北') || base.includes('基隆')) {
    keywords.push('大臺北', '大台北', '北臺灣', '北台灣', '北部');
  }
  if (base.includes('桃園') || base.includes('新竹') || base.includes('苗栗')) {
    keywords.push('竹苗', '北臺灣', '北台灣', '北部');
  }
  if (base.includes('臺中') || base.includes('彰化') || base.includes('南投') || base.includes('雲林')) {
    keywords.push('中臺灣', '中台灣', '中部');
  }
  if (base.includes('嘉義') || base.includes('臺南') || base.includes('高雄') || base.includes('屏東')) {
    keywords.push('南臺灣', '南台灣', '南部');
  }
  if (base.includes('宜蘭') || base.includes('花蓮') || base.includes('臺東') || base.includes('台東')) {
    keywords.push('東臺灣', '東台灣', '東部');
  }
  
  return Array.from(new Set(keywords));
}

// --------------------------------------------------------------------------
// 5. CWA API Fetching & LocalStorage Caching Client
// --------------------------------------------------------------------------
async function loadWeatherDashboard() {
  updateDataBadge('載入資料中...', 'loading');
  
  try {
    const dataSuccess = await fetchAllWeatherData();
    
    // Fetch active weather warnings/alerts
    await fetchActiveAlerts();
    
    // Also load township data if current location is a township
    const parsed = parseIdentifier(AppState.currentLocationCounty);
    if (parsed.type === 'town') {
      await loadWeatherForRegion(AppState.currentLocationCounty);
    }
    
    if (dataSuccess) {
      AppState.isSimulationActive = false;
      updateDataBadge('即時氣象署資料', 'live');
    } else {
      AppState.isSimulationActive = false;
      updateDataBadge('無法取得即時資料', 'error');
    }
  } catch (err) {
    console.error('Fatal load error:', err);
    AppState.isSimulationActive = false;
    updateDataBadge('連線失敗', 'error');
  }
  
  // Render views from active state
  renderMainLocationWeather();
  renderAddedRegionsList();
}

// Update the top pulse indicator badge
function updateDataBadge(text, state) {
  const badge = document.getElementById('data-status-badge');
  const dot = badge.querySelector('.pulse-dot');
  const label = document.getElementById('data-status-text');
  
  label.textContent = text;
  dot.className = 'pulse-dot'; // Reset
  
  if (state === 'live') {
    // Green dot
  } else if (state === 'simulation') {
    dot.classList.add('simulation-dot');
  } else if (state === 'loading') {
    // Spinning behavior in CSS if desired, or orange pulse
    dot.classList.add('simulation-dot');
  } else {
    dot.classList.add('error-dot');
  }
}

// Main API fetching client with 1-hour caching logic
async function fetchAllWeatherData() {
  if (!AppState.apiKey && !CLOUDFLARE_PROXY_URL) {
    return false; // Requires API key or Cloudflare proxy
  }
  
  const cacheKey = 'cwa_weather_cache_v13';
  const cacheTimeKey = 'cwa_weather_cache_time_v13';
  const cachedDataStr = localStorage.getItem(cacheKey);
  const cachedTimeStr = localStorage.getItem(cacheTimeKey);
  const now = new Date().getTime();
  
  // Use Cache if younger than 10 Minutes (600,000 ms) and fully valid to ensure fresh observations
  if (!shouldBypassCache() && cachedDataStr && cachedTimeStr && (now - parseInt(cachedTimeStr)) < 600000) {
    try {
      const parsedData = JSON.parse(cachedDataStr);
      // Validate county cache integrity
      const counties = Object.values(parsedData);
      const sampleCounty = counties.find(c => c && c.current && !c.error);
      const isCacheValid = sampleCounty && 
                           sampleCounty.current.temp !== undefined && 
                           sampleCounty.current.temp !== null && 
                           !isNaN(sampleCounty.current.temp) && 
                           sampleCounty.current.desc !== undefined;
      
      if (isCacheValid) {
        console.log('Retrieved valid weather data from local storage cache.');
        
        // Load rainfall cache if weather cache is valid
        const rainCacheKey = 'cwa_rainfall_cache_v2';
        const cachedRainStr = localStorage.getItem(rainCacheKey);
        if (cachedRainStr) {
          try {
            AppState.rainfallObservations = JSON.parse(cachedRainStr);
            console.log('Retrieved valid rainfall data from local storage cache.');
          } catch (e) {
            console.warn('Failed parsing rainfall cache.', e);
          }
        }
        
        // Preserve any loaded township data in AppState.allCountiesWeatherData
        const existingTownships = {};
        for (const [key, val] of Object.entries(AppState.allCountiesWeatherData)) {
          if (val && val.isTownship) {
            existingTownships[key] = val;
          }
        }
        AppState.allCountiesWeatherData = Object.assign({}, parsedData, existingTownships);
        
        if (parsedData._observations) {
          AppState.observations = parsedData._observations;
          // Re-apply real-time observation desc/icon overrides to all loaded counties and townships
          for (const [id, data] of Object.entries(AppState.allCountiesWeatherData)) {
            if (id.startsWith('_')) continue;
            if (data && data.current) {
              const parsedId = parseIdentifier(id);
              applyObservationToCurrent(data.current, parsedId.county, parsedId.town);
            }
          }
        }
        return true;
      } else {
        console.warn('Corrupted/incomplete county cache detected. Bypassing and clearing cache.');
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(cacheTimeKey);
      }
    } catch (e) {
      console.warn('Failed parsing cache. Refreshing CWA API.', e);
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(cacheTimeKey);
    }
  }
  
  // Cache missing or expired, fetch fresh from CWA
  console.log('Fetching fresh weather data...');
  
  // Construct URLs dynamically: Route through Cloudflare proxy if configured to bypass browser CORS blocks, otherwise direct CWA connection
  let baseUrl = 'https://opendata.cwa.gov.tw';
  let queryParams = `?format=JSON&_t=${Date.now()}`;
  
  if (CLOUDFLARE_PROXY_URL) {
    baseUrl = CLOUDFLARE_PROXY_URL.trim().replace(/\/$/, ''); // Remove trailing slash
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }
    // Pass personal API Key through the proxy if entered in Settings
    if (AppState.apiKey) {
      queryParams += `&Authorization=${AppState.apiKey}`;
    }
  } else if (AppState.apiKey) {
    queryParams += `&Authorization=${AppState.apiKey}`;
  } else {
    return false; // No key or proxy available
  }
  
  try {
    // 1. Fetch 36h forecast (F-C0032-001) - gives general weather description, rain pop, temp
    const res36h = await fetch(`${baseUrl}/api/v1/rest/datastore/F-C0032-001${queryParams}`);
    if (!res36h.ok) throw new Error('CWA 36h API returned status ' + res36h.status);
    const data36h = await res36h.json();
    
    // We omit the giant F-D0047-089 API request here because it is a massive 10MB+ file
    // that causes severe boot latency and frequent timeouts. Township-level detailed
    // forecasts are instead dynamically fetched on-demand when the user opens them.
    const data72h = null;
    
    // 3. Fetch 7-day forecast (F-D0047-091)
    const res7d = await fetch(`${baseUrl}/api/v1/rest/datastore/F-D0047-091${queryParams}`);
    if (!res7d.ok) throw new Error('CWA 7d API returned status ' + res7d.status);
    const data7d = await res7d.json();
    
    // 4. Fetch real-time weather observations from both manned (O-A0001-001) and automatic (O-A0003-001) stations
    let stations1 = [];
    let stations3 = [];
    
    // Fetch primary manned stations (O-A0001-001)
    try {
      console.log('Fetching CWA real-time manned weather observations (O-A0001-001)...');
      const resObs1 = await fetch(`${baseUrl}/api/v1/rest/datastore/O-A0001-001${queryParams}`);
      if (resObs1.ok) {
        const obsData1 = await resObs1.json();
        stations1 = obsData1.records?.Station || obsData1.records?.station || [];
      }
    } catch (obsErr1) {
      console.warn('Failed to fetch O-A0001-001 manned observations:', obsErr1);
    }
    
    // Fetch automatic weather stations (O-A0003-001)
    try {
      console.log('Fetching CWA real-time automatic weather observations (O-A0003-001)...');
      const resObs3 = await fetch(`${baseUrl}/api/v1/rest/datastore/O-A0003-001${queryParams}`);
      if (resObs3.ok) {
        const obsData3 = await resObs3.json();
        stations3 = obsData3.records?.Station || obsData3.records?.station || [];
      }
    } catch (obsErr3) {
      console.warn('Failed to fetch O-A0003-001 automatic observations:', obsErr3);
    }
    
    // Merge and deduplicate stations by StationId/stationId. 
    // Manned stations (O-A0001-001) typically update hourly, while automatic stations (O-A0003-001) update every 10 minutes.
    // By processing manned stations first and overriding them with automatic ones of the same ID, 
    // we ensure the 10-minute real-time observations always take precedence over the hourly manned ones!
    const stationMap = {};
    
    stations1.forEach(s => {
      const sId = s.StationId || s.stationId;
      if (sId) stationMap[sId] = s;
    });
    
    stations3.forEach(s => {
      const sId = s.StationId || s.stationId;
      if (sId) stationMap[sId] = s;
    });
    
    AppState.observations = Object.values(stationMap);

    // Fetch real-time rainfall observations (O-A0002-001)
    try {
      console.log('Fetching CWA real-time rainfall observations (O-A0002-001)...');
      const resRain = await fetch(`${baseUrl}/api/v1/rest/datastore/O-A0002-001${queryParams}`);
      if (resRain.ok) {
        const rainData = await resRain.json();
        const rainStations = rainData.records?.Station || rainData.records?.station || [];
        if (rainStations.length > 0) {
          AppState.rainfallObservations = rainStations;
          localStorage.setItem('cwa_rainfall_cache_v2', JSON.stringify(rainStations));
          localStorage.setItem('cwa_rainfall_cache_time_v2', String(now));
          console.log(`Fetched and cached ${rainStations.length} rainfall stations.`);
        }
      }
    } catch (rainErr) {
      console.warn('Failed to fetch O-A0002-001 rainfall observations:', rainErr);
    }
    
    // Parse and integrate the three datasets
    const parsedData = integrateCwaDatasets(data36h, data72h, data7d);
    
    if (Object.keys(parsedData).length > 0) {
      parsedData._observations = AppState.observations;
      
      // Preserve any loaded township data in AppState.allCountiesWeatherData
      const existingTownships = {};
      for (const [key, val] of Object.entries(AppState.allCountiesWeatherData)) {
        if (val && val.isTownship) {
          existingTownships[key] = val;
        }
      }
      AppState.allCountiesWeatherData = Object.assign({}, parsedData, existingTownships);
      
      // Re-apply real-time observations to all loaded counties and townships to ensure they are 100% fresh!
      for (const [id, data] of Object.entries(AppState.allCountiesWeatherData)) {
        if (id.startsWith('_')) continue;
        if (data && data.current) {
          const parsedId = parseIdentifier(id);
          applyObservationToCurrent(data.current, parsedId.county, parsedId.town);
        }
      }
      
      localStorage.setItem(cacheKey, JSON.stringify(parsedData));
      localStorage.setItem(cacheTimeKey, String(now));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Weather API Fetch failed:', err);
    return false;
  }
}

// Case-insensitive, robust helper to extract weather elements from station observations
function getObsElementValue(obs, elementName) {
  if (!obs) return null;
  const elements = obs.WeatherElement || obs.weatherElement;
  if (!elements) return null;
  
  // Case 1: elements is an array
  if (Array.isArray(elements)) {
    const el = elements.find(item => {
      const name = (item.ElementName || item.elementName || '').toUpperCase();
      return name === elementName.toUpperCase();
    });
    if (el) {
      const val = el.ElementValue !== undefined ? el.ElementValue : (el.elementValue !== undefined ? el.elementValue : (el.Value !== undefined ? el.Value : el.value));
      if (val !== undefined && val !== null) {
        if (Array.isArray(val) && val[0]) {
          return val[0].value !== undefined ? val[0].value : val[0].Value;
        }
        return val;
      }
    }
  } 
  // Case 2: elements is a flat object
  else if (typeof elements === 'object') {
    const keys = Object.keys(elements);
    const matchedKey = keys.find(k => k.toUpperCase() === elementName.toUpperCase());
    if (matchedKey) {
      const valObj = elements[matchedKey];
      if (valObj && typeof valObj === 'object') {
        if (valObj.value !== undefined) return valObj.value;
        if (valObj.Value !== undefined) return valObj.Value;
        const subKeys = Object.keys(valObj);
        if (subKeys.includes('elementValue') || subKeys.includes('ElementValue')) {
          const arr = valObj.elementValue || valObj.ElementValue;
          if (arr && arr[0]) return arr[0].value !== undefined ? arr[0].value : arr[0].Value;
        }
      }
      return valObj;
    }
  }
  return null;
}

// Helper to find a matching automatic weather station observation
function findObservation(countyName, townName = '') {
  if (!AppState.observations || AppState.observations.length === 0) return null;
  
  const normCounty = countyName.replace('台', '臺');
  const normTown = townName ? townName.replace('台', '臺') : '';
  
  // 1. Try to find exact or fuzzy township station match
  if (normTown) {
    const cleanTown = normTown.replace('區', '').replace('鎮', '').replace('鄉', '').replace('市', '');
    
    // Step A: Prefer a station whose name matches the town name exactly (e.g. station "旗山" for "旗山區")
    let match = AppState.observations.find(obs => {
      const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
      const tempVal = getObsElementValue(obs, 'AirTemperature');
      const hasTemp = tempVal !== undefined && tempVal !== null && parseFloat(tempVal) !== -99 && tempVal !== -99 && tempVal !== '-99';
      
      const sName = (obs.StationName || obs.stationName || '').replace('台', '臺');
      const sNameClean = sName.replace('區', '').replace('鎮', '').replace('鄉', '').replace('市', '');
      const sNameMatches = sName === normTown || sNameClean === cleanTown;
      
      return obsCounty === normCounty && sNameMatches && hasTemp;
    });
    if (match) return match;
    
    // Step B: Fallback to any automatic weather station in the township
    match = AppState.observations.find(obs => {
      const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
      const obsTown = (obs.GeoInfo?.TownName || obs.geoInfo?.townName || '').replace('台', '臺');
      const tempVal = getObsElementValue(obs, 'AirTemperature');
      const hasTemp = tempVal !== undefined && tempVal !== null && parseFloat(tempVal) !== -99 && tempVal !== -99 && tempVal !== '-99';
      
      const matchesTown = obsTown === normTown || 
                          (obsTown.length > 0 && normTown.length > 0 && 
                           (obsTown.includes(normTown) || normTown.includes(obsTown)));
                           
      return obsCounty === normCounty && matchesTown && hasTemp;
    });
    if (match) return match;
    
    // Crucial fix: If we are looking for a specific township and there is no exact local AWS station,
    // return null so it stays with the CWA township-level forecast data
    return null;
  }
  
  // 2. County-level overview match:
  // Step A: Prefer a station whose name matches the county name exactly (e.g. "臺中" station for "臺中市")
  const cleanCounty = normCounty.replace('市', '').replace('縣', '');
  let countyMatch = AppState.observations.find(obs => {
    const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
    const tempVal = getObsElementValue(obs, 'AirTemperature');
    const hasTemp = tempVal !== undefined && tempVal !== null && parseFloat(tempVal) !== -99 && tempVal !== -99 && tempVal !== '-99';
    
    const sName = (obs.StationName || obs.stationName || '').replace('台', '臺');
    const sNameClean = sName.replace('市', '').replace('縣', '');
    const isPrimaryStation = sName === normCounty || sName === cleanCounty || sNameClean === cleanCounty;
    
    return obsCounty === normCounty && isPrimaryStation && hasTemp;
  });
  if (countyMatch) return countyMatch;
  
  // Step B: Fallback to a station located in the county's capital township (e.g. "板橋" for "新北市")
  const capitalTown = COUNTY_CAPITALS[normCounty] || '';
  if (capitalTown) {
    const cleanCapital = capitalTown.replace('區', '').replace('鎮', '').replace('鄉', '').replace('市', '');
    countyMatch = AppState.observations.find(obs => {
      const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
      const tempVal = getObsElementValue(obs, 'AirTemperature');
      const hasTemp = tempVal !== undefined && tempVal !== null && parseFloat(tempVal) !== -99 && tempVal !== -99 && tempVal !== '-99';
      
      const sName = (obs.StationName || obs.stationName || '').replace('台', '臺');
      const sNameClean = sName.replace('區', '').replace('鎮', '').replace('鄉', '').replace('市', '');
      
      return obsCounty === normCounty && (sName === capitalTown || sNameClean === cleanCapital) && hasTemp;
    });
    if (countyMatch) return countyMatch;
  }
  
  // Step C: Fallback to any low-altitude station in the county (avoid stations containing "山" in name)
  countyMatch = AppState.observations.find(obs => {
    const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
    const tempVal = getObsElementValue(obs, 'AirTemperature');
    const hasTemp = tempVal !== undefined && tempVal !== null && parseFloat(tempVal) !== -99 && tempVal !== -99 && tempVal !== '-99';
    
    const sName = (obs.StationName || obs.stationName || '').replace('台', '臺');
    const isMountain = sName.includes('山') && !sName.includes('山區') && sName !== '中山';
    
    return obsCounty === normCounty && !isMountain && hasTemp;
  });
  if (countyMatch) return countyMatch;
  
  // Step D: Ultimate fallback to any station in the county
  countyMatch = AppState.observations.find(obs => {
    const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
    const tempVal = getObsElementValue(obs, 'AirTemperature');
    const hasTemp = tempVal !== undefined && tempVal !== null && parseFloat(tempVal) !== -99 && tempVal !== -99 && tempVal !== '-99';
    return obsCounty === normCounty && hasTemp;
  });
  return countyMatch;
}

// Helper to find a matching automatic rain gauge station observation
function findRainObservation(countyName, townName = '', weatherStationId = null) {
  if (!AppState.rainfallObservations || AppState.rainfallObservations.length === 0) return null;
  
  const normCounty = countyName.replace('台', '臺');
  const normTown = townName ? townName.replace('台', '臺') : '';
  
  // 1. If we have a weather station ID, try to match by station ID first (since many AWS stations measure both)
  if (weatherStationId) {
    const match = AppState.rainfallObservations.find(obs => {
      const rId = obs.StationId || obs.stationId;
      return rId === weatherStationId;
    });
    if (match) return match;
  }
  
  // 2. Try to match by town name exactly
  if (normTown) {
    const cleanTown = normTown.replace('區', '').replace('鎮', '').replace('鄉', '').replace('市', '');
    
    // Step A: Prefer station name matching town name
    let match = AppState.rainfallObservations.find(obs => {
      const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
      const sName = (obs.StationName || obs.stationName || '').replace('台', '臺');
      const sNameClean = sName.replace('區', '').replace('鎮', '').replace('鄉', '').replace('市', '');
      return obsCounty === normCounty && (sName === normTown || sNameClean === cleanTown);
    });
    if (match) return match;
    
    // Step B: Match by GeoInfo town name matching
    match = AppState.rainfallObservations.find(obs => {
      const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
      const obsTown = (obs.GeoInfo?.TownName || obs.geoInfo?.townName || '').replace('台', '臺');
      const matchesTown = obsTown === normTown || 
                          (obsTown.length > 0 && normTown.length > 0 && 
                           (obsTown.includes(normTown) || normTown.includes(obsTown)));
      return obsCounty === normCounty && matchesTown;
    });
    if (match) return match;
  }
  
  // 3. Fallback to County capital town rain station
  const capitalTown = COUNTY_CAPITALS[normCounty] || '';
  if (capitalTown) {
    const cleanCapital = capitalTown.replace('區', '').replace('鎮', '').replace('鄉', '').replace('市', '');
    let countyMatch = AppState.rainfallObservations.find(obs => {
      const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
      const sName = (obs.StationName || obs.stationName || '').replace('台', '臺');
      const sNameClean = sName.replace('區', '').replace('鎮', '').replace('鄉', '').replace('市', '');
      return obsCounty === normCounty && (sName === capitalTown || sNameClean === cleanCapital);
    });
    if (countyMatch) return countyMatch;
  }
  
  // 4. Fallback to any rain station in the county (avoid mountain stations if possible)
  let countyMatch = AppState.rainfallObservations.find(obs => {
    const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
    const sName = (obs.StationName || obs.stationName || '').replace('台', '臺');
    const isMountain = sName.includes('山') && !sName.includes('山區') && sName !== '中山';
    return obsCounty === normCounty && !isMountain;
  });
  if (countyMatch) return countyMatch;
  
  // 5. Ultimate fallback to any rain station in the county
  return AppState.rainfallObservations.find(obs => {
    const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
    return obsCounty === normCounty;
  });
}

// ── Apparent Temperature (體感溫度) Calculation ─────────────────────────────
// Uses NOAA Heat Index when temp >= 27°C & RH >= 40%, Wind Chill when temp <= 10°C,
// otherwise uses Steadman's simple regression.
function calcApparentTemp(tempC, relativeHumidity, windSpeedMs) {
  const T = tempC;
  const RH = relativeHumidity || 70;
  const WS = windSpeedMs || 1.5; // m/s

  // Wind Chill (only valid when T <= 10°C and wind > 1.3 m/s)
  if (T <= 10 && WS >= 1.3) {
    // Australian Bureau of Meteorology Wind Chill
    const windChill = 13.12 + 0.6215 * T - 11.37 * Math.pow(WS * 3.6, 0.16) + 0.3965 * T * Math.pow(WS * 3.6, 0.16);
    return parseFloat(windChill.toFixed(1));
  }

  // Heat Index (NOAA Rothfusz, valid when T >= 27°C)
  if (T >= 27 && RH >= 40) {
    const T_F = T * 9/5 + 32; // Convert to Fahrenheit
    let HI_F = -42.379
      + 2.04901523 * T_F
      + 10.14333127 * RH
      - 0.22475541 * T_F * RH
      - 0.00683783 * T_F * T_F
      - 0.05481717 * RH * RH
      + 0.00122874 * T_F * T_F * RH
      + 0.00085282 * T_F * RH * RH
      - 0.00000199 * T_F * T_F * RH * RH;
    // Adjustment for low humidity
    if (RH < 13 && T_F >= 80 && T_F <= 112) {
      HI_F -= ((13 - RH) / 4) * Math.sqrt((17 - Math.abs(T_F - 95)) / 17);
    }
    // Adjustment for high humidity
    if (RH > 85 && T_F >= 80 && T_F <= 87) {
      HI_F += ((RH - 85) / 10) * ((87 - T_F) / 5);
    }
    const HI_C = (HI_F - 32) * 5/9;
    return parseFloat(HI_C.toFixed(1));
  }

  // Steadman simple apparent temp (mild range)
  const apparent = T + 0.33 * (RH / 100 * 6.105 * Math.exp(17.27 * T / (237.7 + T))) - 0.70 * WS - 4.0;
  return parseFloat(apparent.toFixed(1));
}

// Convert windGrade (Beaufort scale) to approximate m/s
function windGradeToMs(grade) {
  const table = [0.3, 1.5, 3.3, 5.5, 8.0, 11.0];
  return table[Math.min(grade, table.length - 1)] || 1.5;
}

// Map observation station's human-readable Weather string to our icon key
function mapObsWeatherToIcon(obsWeather) {
  const w = obsWeather.trim();
  if (!w || w === '-99') return null;
  // Rain / storm variants first (most specific)
  if (/雷/.test(w)) return 'thunderstorm';
  if (/大雨|暴雨|豪雨|大豪雨/.test(w)) return 'rainy';
  if (/雨|霧雨|毛毛雨|陣雨/.test(w)) return 'rainy';
  // Snow / hail
  if (/雪|冰雹/.test(w)) return 'rainy';
  // Fog / mist / dust
  if (/霧|靄|煙/.test(w)) return 'cloudy';
  // Overcast
  if (/陰/.test(w)) return 'cloudy';
  // Mostly cloudy
  if (/多雲/.test(w)) return 'sunny-cloudy';
  // Partly cloudy / fair
  if (/晴時多雲|多雲時晴/.test(w)) return 'sunny-cloudy';
  // Clear / sunny
  if (/晴/.test(w)) return 'sunny';
  return 'sunny-cloudy'; // safe default
}

// Helper to apply real-time observation values to current weather state
function applyObservationToCurrent(current, countyName, townName = '') {
  const obs = findObservation(countyName, townName);
  const weatherStationId = obs ? (obs.StationId || obs.stationId) : null;
  const rainObs = findRainObservation(countyName, townName, weatherStationId);
  
  if (obs) {
    // Collect all three values first so we can do a proper apparent temp calculation
    let obsTemp = null, obsRh = null, obsWs = null;
    
    const tempVal = getObsElementValue(obs, 'AirTemperature');
    const temp = parseFloat(tempVal);
    if (!isNaN(temp) && temp > -50 && temp < 60 && tempVal !== -99 && tempVal !== '-99') {
      current.temp = parseFloat(temp.toFixed(1));
      obsTemp = temp;
    }
    
    const rhVal = getObsElementValue(obs, 'RelativeHumidity');
    const rh = parseFloat(rhVal);
    if (!isNaN(rh) && rh >= 0 && rh <= 100 && rhVal !== -99 && rhVal !== '-99') {
      current.humidity = Math.round(rh);
      obsRh = rh;
    }
    
    const wsVal = getObsElementValue(obs, 'WindSpeed'); // m/s from observation
    const ws = parseFloat(wsVal);
    if (!isNaN(ws) && ws >= 0 && wsVal !== -99 && wsVal !== '-99') {
      if (ws <= 1) current.windGrade = 0;
      else if (ws <= 3) current.windGrade = 1;
      else if (ws <= 5) current.windGrade = 2;
      else if (ws <= 8) current.windGrade = 3;
      else if (ws <= 11) current.windGrade = 4;
      else current.windGrade = 5;
      obsWs = ws;
    }
    
    // ── Recalculate apparent temperature using real observed values ───────────
    // Use actual observed T + RH + WS for the most accurate Heat Index / Wind Chill.
    if (obsTemp !== null) {
      const apparentT = calcApparentTemp(
        obsTemp,
        obsRh !== null ? obsRh : (current.humidity || 70),
        obsWs !== null ? obsWs : windGradeToMs(current.windGrade || 2)
      );
      current.apparentTemp = apparentT;
    }
    
    // ── Override desc & icon from real-time observed sky condition ────────────
    // The observation station returns a human-readable Weather string (e.g. '晴', '多雲', '陰有雨').
    // Use it to override the *forecast* description so the card shows actual sky conditions.
    const obsWeatherVal = getObsElementValue(obs, 'Weather');
    const obsWeather = obsWeatherVal ? String(obsWeatherVal).trim() : '';
    if (obsWeather && obsWeather !== '-99' && obsWeather.length > 0) {
      let obsIcon = mapObsWeatherToIcon(obsWeather);
      if (obsIcon) {
        const isNight = isNightTime(countyName + townName, new Date());
        if (isNight && obsIcon === 'sunny') {
          obsIcon = 'night';
        }
        current.icon = obsIcon;
        current.desc = obsWeather; // Actual observed text
        current._fromObservation = true;
      }
    }
  }
  
  // Apply rain gauge observation if found
  if (rainObs) {
    const rfEl = rainObs.RainfallElement || rainObs.rainfallElement;
    if (rfEl) {
      const getVal = (item) => {
        const val = item ? (item.Precipitation !== undefined ? item.Precipitation : (item.precipitation !== undefined ? item.precipitation : item.value)) : null;
        const num = parseFloat(val);
        return (!isNaN(num) && num >= 0) ? num : 0.0;
      };
      current.rain10Min = getVal(rfEl.Past10Min);
      current.rain1Hr = getVal(rfEl.Past1hr);
      current.rainDaily = getVal(rfEl.Now);
    }
  } else if (current.rain10Min === undefined) {
    current.rain10Min = 0.0;
    current.rain1Hr = 0.0;
    current.rainDaily = 0.0;
  }
}

// Merge CWA datasets into a clean county-specific map
function integrateCwaDatasets(data36h, data72h, data7d) {
  const merged = {};
  
  // Initialize counties in merged map
  for (const c of TAIWAN_COUNTIES) {
    merged[c.name] = {
      name: c.name,
      current: {},
      hourly: [],
      weekly: []
    };
  }
  
  try {
    // 1. Process 36h data
    const locations36 = (data36h && data36h.records) ? data36h.records.location || [] : [];
    for (const loc of locations36) {
      const cName = normalizeCountyName(loc.locationName);
      if (!merged[cName]) continue;
      
      const elements = loc.weatherElement || [];
      const wxEl = elements.find(el => el.elementName === 'Wx');
      const popEl = elements.find(el => el.elementName === 'PoP');
      const minTEl = elements.find(el => el.elementName === 'MinT');
      const maxTEl = elements.find(el => el.elementName === 'MaxT');
      
      const wx = wxEl?.time?.[0]?.parameter || {};
      const pop = popEl?.time?.[0]?.parameter?.parameterName || '0';
      const minT = minTEl?.time?.[0]?.parameter?.parameterName || '--';
      const maxT = maxTEl?.time?.[0]?.parameter?.parameterName || '--';
      
      let icon = mapWxToIcon(wx.parameterValue || '2');
      if (isNightTime(cName, new Date()) && icon === 'sunny') {
        icon = 'night';
      }
      
      merged[cName].current = {
        temp: Math.round((parseInt(minT) + parseInt(maxT)) / 2) || 26,
        tempMin: parseInt(minT) || 23,
        tempMax: parseInt(maxT) || 29,
        desc: wx.parameterName || '多雲',
        icon: icon,
        rainProb: parseInt(pop) || 0,
        humidity: 75,       // Default fallback
        windGrade: 2,       // Default fallback
        apparentTemp: Math.round((parseInt(minT) + parseInt(maxT)) / 2) || 26
      };
      
      // Override with real-time station observation values if available
      applyObservationToCurrent(merged[cName].current, cName);
    }
    
    // 2. Process 72h detailed data (F-D0047-089)
    let locations72 = [];
    if (data72h && data72h.records) {
      if (data72h.records.locations && data72h.records.locations[0]) {
        locations72 = data72h.records.locations[0].location || data72h.records.locations[0].locations || [];
      } else if (data72h.records.location) {
        locations72 = data72h.records.location;
      }
    }
    for (const loc of locations72) {
      const cName = normalizeCountyName(loc.locationName);
      if (!merged[cName]) continue;
      
      const elements = loc.weatherElement || [];
      const tempEl = elements.find(el => el.elementName === 'T');
      const rhEl = elements.find(el => el.elementName === 'RH');
      const wsEl = elements.find(el => el.elementName === 'WS'); // Wind speed
      const wxEl = elements.find(el => el.elementName === 'Wx');
      const popEl = elements.find(el => el.elementName === 'PoP6h') || elements.find(el => el.elementName === 'PoP12h');
      
      // Build Hourly (up to 24 intervals = 72 hours)
      const hourlyList = [];
      const len = (tempEl && tempEl.time) ? tempEl.time.length : 0;
      
      for (let i = 0; i < len; i++) {
        const timeItem = tempEl.time[i];
        if (!timeItem) continue;
        
        const timeStr = timeItem.dataTime;
        let formattedTimeStr = timeStr;
        if (typeof timeStr === 'string') {
          formattedTimeStr = timeStr.trim().replace(' ', 'T');
          if (!formattedTimeStr.includes('+') && !formattedTimeStr.includes('Z')) {
            formattedTimeStr += '+08:00';
          }
        }
        const timeVal = new Date(formattedTimeStr);
        
        // Filter out past intervals (older than 2.5 hours ago) to keep the timeline aligned with the current hour
        if (timeVal.getTime() < new Date().getTime() - 2.5 * 60 * 60 * 1000) {
          continue;
        }
        
        const temp = timeItem.elementValue?.[0] ? parseInt(timeItem.elementValue[0].value) : NaN;
        if (isNaN(temp)) continue;
        
        let humidity = 70;
        if (rhEl && rhEl.time && rhEl.time[i] && rhEl.time[i].elementValue && rhEl.time[i].elementValue[0]) {
          humidity = parseInt(rhEl.time[i].elementValue[0].value) || 70;
        }
        
        let wind = 2;
        if (wsEl && wsEl.time && wsEl.time[i] && wsEl.time[i].elementValue && wsEl.time[i].elementValue[0]) {
          const wsVal = wsEl.time[i].elementValue[0].value;
          const wsInt = parseInt(wsVal) || 0;
          // Rough convert m/s wind speed to Beaufort scale grade
          if (wsInt <= 1) wind = 0;
          else if (wsInt <= 3) wind = 1;
          else if (wsInt <= 5) wind = 2;
          else if (wsInt <= 8) wind = 3;
          else if (wsInt <= 11) wind = 4;
          else wind = 5;
        }
        
        let wx = '多雲';
        let wxValue = '2';
        if (wxEl && wxEl.time) {
          const wxMatch = wxEl.time.find(item => {
            const startStr = item.startTime || item.dataTime;
            let formattedStartStr = startStr;
            if (typeof startStr === 'string') {
              formattedStartStr = startStr.trim().replace(' ', 'T');
              if (!formattedStartStr.includes('+') && !formattedStartStr.includes('Z')) {
                formattedStartStr += '+08:00';
              }
            }
            const start = new Date(formattedStartStr);
            const endStr = item.endTime;
            let formattedEndStr = endStr;
            if (typeof endStr === 'string') {
              formattedEndStr = endStr.trim().replace(' ', 'T');
              if (!formattedEndStr.includes('+') && !formattedEndStr.includes('Z')) {
                formattedEndStr += '+08:00';
              }
            }
            const end = formattedEndStr ? new Date(formattedEndStr) : new Date(start.getTime() + 3*3600000);
            return timeVal >= start && timeVal < end;
          });
          
          if (wxMatch && wxMatch.elementValue) {
            wx = wxMatch.elementValue[0] ? wxMatch.elementValue[0].value : '多雲';
            wxValue = wxMatch.elementValue[1] ? wxMatch.elementValue[1].value : '2';
          }
        }
        
        // Find rain pop matching this period
        let rainProb = 0;
        if (popEl && popEl.time) {
          // Find the time interval that spans our hour
          const popMatch = popEl.time.find(p => {
            const startStr = p.startTime || p.dataTime;
            let formattedStartStr = startStr;
            if (typeof startStr === 'string') {
              formattedStartStr = startStr.trim().replace(' ', 'T');
              if (!formattedStartStr.includes('+') && !formattedStartStr.includes('Z')) {
                formattedStartStr += '+08:00';
              }
            }
            const start = new Date(formattedStartStr);
            const endStr = p.endTime;
            let formattedEndStr = endStr;
            if (typeof endStr === 'string') {
              formattedEndStr = endStr.trim().replace(' ', 'T');
              if (!formattedEndStr.includes('+') && !formattedEndStr.includes('Z')) {
                formattedEndStr += '+08:00';
              }
            }
            const end = formattedEndStr ? new Date(formattedEndStr) : new Date(start.getTime() + 6*3600000);
            return timeVal >= start && timeVal < end;
          });
          rainProb = (popMatch && popMatch.elementValue && popMatch.elementValue[0]) ? parseInt(popMatch.elementValue[0].value) : 0;
        }
        
        const twHour = getTaiwanHour(timeVal);
        let icon = mapWxToIcon(wxValue);
        if (isNightTime(cName, timeVal) && icon === 'sunny') {
          icon = 'night';
        }
        hourlyList.push({
          time: twHour + ':00',
          displayTime: formatHourlyLabel(timeVal),
          temp: temp,
          humidity: humidity,
          windGrade: wind,
          desc: wx,
          icon: icon,
          rainProb: isNaN(rainProb) ? 0 : rainProb
        });
      }
      
      merged[cName].hourly = hourlyList;
      
      // Update county current details with precise current hourly value if available
      if (hourlyList.length > 0) {
        const curH = hourlyList[0];
        merged[cName].current.humidity = curH.humidity;
        merged[cName].current.windGrade = curH.windGrade;
        // Calculate proper apparent temperature using Heat Index / Wind Chill
        const ws = windGradeToMs(curH.windGrade);
        merged[cName].current.apparentTemp = calcApparentTemp(curH.temp, curH.humidity, ws);
      }
    }
    
    // 3. Process 7-day data (F-D0047-091)
    let locations7d = [];
    if (data7d && data7d.records) {
      if (data7d.records.locations && data7d.records.locations[0]) {
        locations7d = data7d.records.locations[0].location || data7d.records.locations[0].locations || [];
      } else if (data7d.records.location) {
        locations7d = data7d.records.location;
      }
    }
    for (const loc of locations7d) {
      const cName = normalizeCountyName(loc.locationName);
      if (!merged[cName]) continue;
      
      const elements = loc.weatherElement || [];
      const minTEl = elements.find(el => el.elementName === 'MinT');
      const maxTEl = elements.find(el => el.elementName === 'MaxT');
      const wxEl = elements.find(el => el.elementName === 'Wx');
      const popEl = elements.find(el => el.elementName === 'PoP12h');
      
      const weeklyList = [];
      const len = (minTEl && minTEl.time) ? minTEl.time.length : 0;
      
      // Weekly reports has morning/night subdivisions, we aggregate by day
      // time array lists: day 1 morning, day 1 night, day 2 morning, day 2 night...
      // We step by 2 to group days
      for (let i = 0; i < len; i += 2) {
        if (i >= len) break;
        
        const timeItem = minTEl.time[i];
        if (!timeItem) continue;
        
        const dateStr = timeItem.startTime || timeItem.dataTime;
        let formattedDateStr = dateStr;
        if (typeof dateStr === 'string') {
          formattedDateStr = dateStr.trim().replace(' ', 'T');
          if (!formattedDateStr.includes('+') && !formattedDateStr.includes('Z')) {
            formattedDateStr += '+08:00';
          }
        }
        const dateVal = new Date(formattedDateStr);
        
        const minT1 = (timeItem.elementValue && timeItem.elementValue[0]) ? parseInt(timeItem.elementValue[0].value) : NaN;
        if (isNaN(minT1)) continue;
        
        let minT2 = minT1;
        if (i+1 < len && minTEl.time[i+1] && minTEl.time[i+1].elementValue && minTEl.time[i+1].elementValue[0]) {
          minT2 = parseInt(minTEl.time[i+1].elementValue[0].value) || minT1;
        }
        const minT = Math.min(minT1, minT2);
        
        let maxT1 = minT;
        if (maxTEl && maxTEl.time && maxTEl.time[i] && maxTEl.time[i].elementValue && maxTEl.time[i].elementValue[0]) {
          maxT1 = parseInt(maxTEl.time[i].elementValue[0].value) || minT;
        }
        let maxT2 = maxT1;
        if (i+1 < len && maxTEl && maxTEl.time && maxTEl.time[i+1] && maxTEl.time[i+1].elementValue && maxTEl.time[i+1].elementValue[0]) {
          maxT2 = parseInt(maxTEl.time[i+1].elementValue[0].value) || maxT1;
        }
        const maxT = Math.max(maxT1, maxT2);
        
        let wxVal = '多雲';
        let wxIconVal = '2';
        if (wxEl && wxEl.time && wxEl.time[i] && wxEl.time[i].elementValue) {
          wxVal = wxEl.time[i].elementValue[0] ? wxEl.time[i].elementValue[0].value : '多雲';
          wxIconVal = wxEl.time[i].elementValue[1] ? wxEl.time[i].elementValue[1].value : '2';
        }
        
        let pop = 0;
        if (popEl && popEl.time) {
          let pop1 = 0;
          let pop2 = 0;
          if (popEl.time[i] && popEl.time[i].elementValue && popEl.time[i].elementValue[0]) {
            pop1 = parseInt(popEl.time[i].elementValue[0].value) || 0;
          }
          if (i+1 < popEl.time.length && popEl.time[i+1] && popEl.time[i+1].elementValue && popEl.time[i+1].elementValue[0]) {
            pop2 = parseInt(popEl.time[i+1].elementValue[0].value) || 0;
          }
          pop = Math.max(pop1, pop2);
        }
        
        weeklyList.push({
          date: getTaiwanMonthAndDate(dateVal),
          dayOfWeek: formatWeeklyDayLabel(dateVal, i === 0),
          tempMin: minT,
          tempMax: maxT,
          desc: wxVal,
          icon: mapWxToIcon(wxIconVal),
          rainProb: pop
        });
      }
      
      merged[cName].weekly = weeklyList;
    }
    
    return merged;
  } catch (e) {
    console.error('Error integrating CWA datasets:', e);
    return {};
  }
}

// Convert both Traditional formats (臺 vs 台)
function normalizeCountyName(name) {
  if (!name) return '';
  return name.replace('台', '臺');
}

function getTaiwanHour(date) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Taipei',
      hour: 'numeric',
      hour12: false
    });
    return parseInt(formatter.format(date));
  } catch (e) {
    return date.getHours();
  }
}

function getTaiwanMonthAndDate(date) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Taipei',
      month: 'numeric',
      day: 'numeric'
    });
    return formatter.format(date);
  } catch (e) {
    return `${date.getMonth()+1}/${date.getDate()}`;
  }
}

function getTaiwanDayOfWeek(date) {
  try {
    const formatter = new Intl.DateTimeFormat('zh-TW', {
      timeZone: 'Asia/Taipei',
      weekday: 'short'
    });
    return formatter.format(date);
  } catch (e) {
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return days[date.getDay()];
  }
}

function getTaiwanDateTimeParts(date) {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const parts = formatter.formatToParts(date);
    const getVal = (type) => parts.find(p => p.type === type).value;
    return {
      year: getVal('year'),
      month: getVal('month'),
      day: getVal('day'),
      hour: getVal('hour'),
      minute: getVal('minute')
    };
  } catch (e) {
    const pad = (n) => String(n).padStart(2, '0');
    return {
      year: String(date.getFullYear()),
      month: pad(date.getMonth() + 1),
      day: pad(date.getDate()),
      hour: pad(date.getHours()),
      minute: pad(date.getMinutes())
    };
  }
}

function getChartIconSvg(iconName, x, y, size = 20) {
  let innerPaths = '';
  
  if (iconName === 'sunny') {
    innerPaths = `
      <circle cx="32" cy="32" r="10" fill="url(#grad-sun)" />
      <g stroke="url(#grad-sun-rays)" stroke-width="2.8" stroke-linecap="round" class="anim-sun-rays">
        <line x1="32" y1="12" x2="32.01" y2="4" />
        <line x1="32" y1="52" x2="32.01" y2="60" />
        <line x1="12" y1="32" x2="4" y2="32.01" />
        <line x1="52" y1="32" x2="60" y2="32.01" />
        <line x1="49.32" y1="22.00" x2="56.25" y2="18.00" />
        <line x1="42.00" y1="14.68" x2="46.00" y2="7.75" />
        <line x1="22.00" y1="14.68" x2="18.00" y2="7.75" />
        <line x1="14.68" y1="22.00" x2="7.75" y2="18.00" />
        <line x1="14.68" y1="42.00" x2="7.75" y2="46.00" />
        <line x1="22.00" y1="49.32" x2="18.00" y2="56.25" />
        <line x1="42.00" y1="49.32" x2="46.00" y2="56.25" />
        <line x1="49.32" y1="42.00" x2="56.25" y2="46.00" />
      </g>
    `;
  } else if (iconName === 'sunny-cloudy') {
    innerPaths = `
      <!-- Back Cloud -->
      <path d="M24 38c-3.3 0-6-2.7-6-6 0-3 2.2-5.5 5.1-5.9.8-3.4 3.8-6.1 7.4-6.1 3 0 5.6 1.8 6.7 4.4C38 24 39.8 25.5 40 27.5c1.7.5 3 2.1 3 4 0 2.5-2 4.5-4.5 4.5" fill="url(#grad-cloud-back)" class="anim-cloud-drift-back" />
      <!-- Front Cloud -->
      <path d="M18 44c-4.4 0-8-3.6-8-8 0-4 3-7.3 7-7.9 1-4.5 5-8.1 9.8-8.1 4 0 7.5 2.5 9 6C37 26 39.5 28 40 30.7c2.3.7 4 2.8 4 5.3 0 3.3-2.7 6-6 6H18z" fill="url(#grad-cloud-front)" class="anim-cloud-drift-front" />
    `;
  } else if (iconName === 'cloudy') {
    innerPaths = `
      <!-- Back Cloud -->
      <path d="M24 38c-3.3 0-6-2.7-6-6 0-3 2.2-5.5 5.1-5.9.8-3.4 3.8-6.1 7.4-6.1 3 0 5.6 1.8 6.7 4.4C38 24 39.8 25.5 40 27.5c1.7.5 3 2.1 3 4 0 2.5-2 4.5-4.5 4.5" fill="url(#grad-cloud-back)" class="anim-cloud-drift-back" />
      <!-- Front Cloud -->
      <path d="M18 44c-4.4 0-8-3.6-8-8 0-4 3-7.3 7-7.9 1-4.5 5-8.1 9.8-8.1 4 0 7.5 2.5 9 6C37 26 39.5 28 40 30.7c2.3.7 4 2.8 4 5.3 0 3.3-2.7 6-6 6H18z" fill="url(#grad-cloud-front)" class="anim-cloud-drift-front" />
    `;
  } else if (iconName === 'rainy') {
    innerPaths = `
      <!-- Cloud -->
      <path d="M18 36c-4.4 0-8-3.6-8-8 0-4 3-7.3 7-7.9 1-4.5 5-8.1 9.8-8.1 4 0 7.5 2.5 9 6C37 18 39.5 20 40 22.7c2.3.7 4 2.8 4 5.3 0 3.3-2.7 6-6 6H18z" fill="url(#grad-cloud-front)" />
      <!-- Rain Drops -->
      <g stroke="url(#grad-rain)" stroke-width="2.5" stroke-linecap="round" fill="none" class="anim-rain">
        <line x1="20" y1="42" x2="17" y2="49" class="rain-1" />
        <line x1="28" y1="42" x2="25" y2="49" class="rain-2" />
        <line x1="36" y1="42" x2="33" y2="49" class="rain-3" />
      </g>
    `;
  } else if (iconName === 'thunderstorm') {
    innerPaths = `
      <!-- Dark Cloud -->
      <path d="M18 36c-4.4 0-8-3.6-8-8 0-4 3-7.3 7-7.9 1-4.5 5-8.1 9.8-8.1 4 0 7.5 2.5 9 6C37 18 39.5 20 40 22.7c2.3.7 4 2.8 4 5.3 0 3.3-2.7 6-6 6H18z" fill="url(#grad-cloud-dark)" />
      <!-- Lightning Bolt -->
      <polygon points="28,34 22,44 27,44 24,54 34,42 29,42" fill="url(#grad-lightning)" class="anim-lightning" />
    `;
  } else if (iconName === 'windy') {
    innerPaths = `
      <!-- Light clouds with wind lines -->
      <path d="M12 28c-2.2 0-4-1.8-4-4 0-2 1.5-3.7 3.5-3.9A4.9 4.9 0 0 1 20 18c2 0 3.8 1.2 4.5 3 1.2 0 2.2 1 2.5 2.2c1 .3 2 1.2 2 2.3v.5H12z" fill="url(#grad-cloud-back)" class="anim-cloud-drift-back" />
      <g stroke="url(#grad-wind)" stroke-width="2.5" stroke-linecap="round" fill="none" class="anim-wind">
        <path d="M10,34 C18,34 25,32 30,34 C33,35 34,37 32,38 C30,39 28,37 29,35" class="wind-line-1" />
        <path d="M6,42 C16,42 22,40 28,42 C30,43 31,45 29,46 C27,47 25,45 26,43" class="wind-line-2" />
      </g>
    `;
  } else if (iconName === 'night') {
    innerPaths = `
      <path d="M36 40c-9.9 0-18-8.1-18-18 0-4.6 1.7-8.8 4.6-12C14.7 11.2 10 18.1 10 26c0 9.9 8.1 18 18 18 7.9 0 14.8-4.7 16-12.6-3.2 2.9-7.4 4.6-12 4.6z" fill="url(#grad-moon)" />
      <g fill="#FFF" class="anim-stars">
        <polygon points="18,12 19,14 21,14 19,15 20,17 18,16 16,17 17,15 15,14 17,14" class="star-1" />
        <polygon points="36,12 37,13 39,13 37,14 38,16 36,15 34,16 35,14 33,13 35,13" class="star-2" />
        <polygon points="42,24 43,25 45,25 43,26 44,28 42,27 40,28 41,26 39,25 41,25" class="star-3" />
      </g>
    `;
  }
  
  return `
    <g transform="translate(${x - size/2}, ${y - size/2}) scale(${size / 64})">
      ${innerPaths}
    </g>
  `;
}

function formatHourlyLabel(date) {
  const hour = getTaiwanHour(date);
  if (hour === 0) return '半夜';
  if (hour === 12) return '中午';
  return `${hour}:00`;
}

function formatWeeklyDayLabel(date, isToday) {
  if (isToday) return '今天';
  return getTaiwanDayOfWeek(date);
}

// Map Central Weather Administration's "Wx Parameter Value" to our dynamic icons
function mapWxToIcon(wxVal) {
  const code = parseInt(wxVal) || 1;
  // Wx mapping code definitions:
  // 1: Clear, 2-3: Cloudy periods, 4-7: Mostly cloudy/overcast, 8+: Rain showers / thunderstorms
  if (code === 1) return 'sunny';
  if (code <= 3) return 'sunny-cloudy'; // Mix of sun and cloud
  if (code <= 7) return 'cloudy';
  if (code <= 14) return 'rainy';
  if (code <= 18) return 'thunderstorm';
  if (code <= 22) return 'rainy';
  if (code <= 28) return 'windy';
  return 'cloudy';
}

// --------------------------------------------------------------------------
// 6. High-Fidelity Taiwan Climatic Weather Simulation Engine
// --------------------------------------------------------------------------
function triggerSimulationMode(reasonMsg) {
  console.log(`%cSimulation Mode Active: ${reasonMsg}`, 'color: #ff9800; font-weight: bold;');
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMonth = now.getMonth(); // 0-11
  
  // Establish seasonal profiles for Taiwan
  // May/June (Plum rain season, afternoon thunder, warm)
  let seasonTempOffset = 0;
  let seasonRainBias = 10;
  let typicalWx = ['sunny-cloudy', 'cloudy', 'rainy', 'thunderstorm'];
  
  if (currentMonth >= 5 && currentMonth <= 8) { // Summer (Jun-Sep): Hot, thunderstorms
    seasonTempOffset = 6;
    seasonRainBias = 15;
    typicalWx = ['sunny', 'sunny-cloudy', 'cloudy', 'thunderstorm'];
  } else if (currentMonth >= 11 || currentMonth <= 1) { // Winter (Dec-Feb): Cold, dry south, rainy northeast
    seasonTempOffset = -8;
    seasonRainBias = -10;
    typicalWx = ['cloudy', 'rainy', 'windy', 'sunny-cloudy'];
  } else { // Spring/Autumn (Mar-May, Oct-Nov): Pleasant
    seasonTempOffset = -2;
    seasonRainBias = -5;
    typicalWx = ['sunny', 'sunny-cloudy', 'cloudy', 'rainy'];
  }
  
  // Populate simulated weather data for all 22 counties
  const simulated = {};
  
  for (const county of TAIWAN_COUNTIES) {
    const cName = county.name;
    
    // 1. Establish custom climatic profile based on geographic regions
    let baseTemp = 23 + seasonTempOffset;
    let baseHumidity = 72;
    let rainProbBase = 20 + seasonRainBias;
    
    if (county.region === '北部') {
      baseTemp -= 1.5;
      baseHumidity += 6;
      rainProbBase += 15; // Rainy North
    } else if (county.region === '南部') {
      baseTemp += 2;
      baseHumidity -= 4;
      rainProbBase -= 10; // Sunny South
    } else if (county.region === '東部') {
      baseHumidity += 4;
      rainProbBase += 5;
    } else if (county.region === '離島') {
      baseTemp -= 1;
      rainProbBase -= 5;
    }
    
    // diurnal temp oscillation (high at 2 PM, low at 5 AM)
    const diurnalOffset = Math.sin((currentHour - 9) * Math.PI / 12) * 4;
    const curTemp = parseFloat((baseTemp + diurnalOffset + (Math.random() * 0.4 - 0.2)).toFixed(1));
    const apparentTemp = parseFloat((curTemp + (baseHumidity > 80 ? 1.2 : -0.8)).toFixed(1));
    const minT = parseFloat((baseTemp - 4 + (Math.random() * 0.4 - 0.2)).toFixed(1));
    const maxT = parseFloat((baseTemp + 4 + (Math.random() * 0.4 - 0.2)).toFixed(1));
    
    // Determine active weather condition based on region and season
    let activeIcon = 'sunny-cloudy';
    let conditionText = '多雲時晴';
    let finalRainProb = Math.max(0, Math.min(100, Math.round(rainProbBase + (diurnalOffset > 1 ? 20 : 0))));
    
    if (finalRainProb > 70) {
      if (county.region === '南部' && currentMonth < 4) {
        // Winter in south rarely rains heavily
        activeIcon = 'sunny-cloudy';
        conditionText = '晴時多雲';
        finalRainProb = 10;
      } else {
        activeIcon = finalRainProb > 85 ? 'thunderstorm' : 'rainy';
        conditionText = finalRainProb > 85 ? '午後雷陣雨' : '陰有雨';
      }
    } else if (finalRainProb > 40) {
      activeIcon = 'cloudy';
      conditionText = '多雲陰天';
    } else if (finalRainProb < 15) {
      activeIcon = 'sunny';
      conditionText = '晴朗舒適';
    }
    
    if (isNightTime(cName, now)) {
      if (activeIcon === 'sunny' || activeIcon === 'sunny-cloudy') {
        activeIcon = 'night';
      }
    }
    
    // Create Simulated County Profile
    simulated[cName] = {
      name: cName,
      current: {
        temp: curTemp,
        tempMin: minT,
        tempMax: maxT,
        desc: conditionText,
        icon: activeIcon,
        rainProb: finalRainProb,
        humidity: Math.min(100, Math.max(30, Math.round(baseHumidity - diurnalOffset * 3))),
        windGrade: Math.max(1, Math.min(7, Math.round(2 + Math.random() * 2 + (county.region === '離島' ? 2 : 0)))),
        apparentTemp: apparentTemp,
        rain10Min: activeIcon === 'thunderstorm' ? parseFloat((Math.random() * 2.0).toFixed(1)) : (activeIcon === 'rainy' ? parseFloat((Math.random() * 0.5).toFixed(1)) : 0.0),
        rain1Hr: activeIcon === 'thunderstorm' ? parseFloat((5.0 + Math.random() * 5.0).toFixed(1)) : (activeIcon === 'rainy' ? parseFloat((1.0 + Math.random() * 2.0).toFixed(1)) : 0.0),
        rainDaily: activeIcon === 'thunderstorm' ? parseFloat((15.0 + Math.random() * 20.0).toFixed(1)) : (activeIcon === 'rainy' ? parseFloat((3.0 + Math.random() * 5.0).toFixed(1)) : 0.0)
      },
      hourly: [],
      weekly: []
    };
    
    // 2. Generate smooth 72 Hours hourly sequence (spaced by 3h)
    const hourlyList = [];
    for (let h = 0; h < 24; h++) {
      const forecastHour = (currentHour + h * 3) % 24;
      const forecastDate = new Date();
      forecastDate.setHours(currentHour + h * 3);
      
      const forecastDiurnal = Math.sin((forecastHour - 9) * Math.PI / 12) * 4;
      const hTemp = parseFloat((baseTemp + forecastDiurnal + (Math.random() * 0.8 - 0.4)).toFixed(1));
      const hHum = Math.min(100, Math.max(30, Math.round(baseHumidity - forecastDiurnal * 3)));
      
      // Progressive weather change in timeline
      let hIcon = activeIcon;
      let hDesc = conditionText;
      let hRain = finalRainProb;
      
      // Afternoon hours prone to thunder in summer
      if (forecastHour >= 13 && forecastHour <= 17 && currentMonth >= 4 && currentMonth <= 8) {
        hIcon = 'thunderstorm';
        hDesc = '雷陣雨';
        hRain = Math.max(hRain, 80);
      } else if (isNightTime(cName, forecastDate)) {
        if (activeIcon === 'sunny') hIcon = 'night';
        else if (activeIcon === 'sunny-cloudy') hIcon = 'night'; // Starry night with clouds
      }
      
      hourlyList.push({
        time: `${forecastHour}:00`,
        displayTime: formatHourlyLabel(forecastDate),
        temp: hTemp,
        humidity: hHum,
        windGrade: simulated[cName].current.windGrade,
        desc: hDesc,
        icon: hIcon,
        rainProb: hRain
      });
    }
    simulated[cName].hourly = hourlyList;
    
    // 3. Generate natural 7 Days weekly forecast
    const weeklyList = [];
    const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    
    for (let d = 0; d < 7; d++) {
      const dayDate = new Date();
      dayDate.setDate(now.getDate() + d);
      
      const dayName = d === 0 ? '今天' : weekdays[dayDate.getDay()];
      const dayMin = parseFloat((minT + Math.sin(d) * 1.5 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      const dayMax = parseFloat((maxT + Math.cos(d) * 1.5 + (Math.random() * 0.4 - 0.2)).toFixed(1));
      
      let dayIcon = activeIcon;
      let dayDesc = conditionText;
      let dayRain = finalRainProb;
      
      // Add slight variety to week days
      if (d === 2 || d === 5) {
        dayIcon = 'rainy';
        dayDesc = '短暫陣雨';
        dayRain = Math.min(90, dayRain + 30);
      } else if (d === 4) {
        dayIcon = 'sunny';
        dayDesc = '晴朗';
        dayRain = Math.max(5, dayRain - 40);
      }
      
      weeklyList.push({
        date: `${dayDate.getMonth()+1}/${dayDate.getDate()}`,
        dayOfWeek: dayName,
        tempMin: dayMin,
        tempMax: dayMax,
        desc: dayDesc,
        icon: dayIcon,
        rainProb: dayRain
      });
    }
    simulated[cName].weekly = weeklyList;
  }
  
  AppState.allCountiesWeatherData = simulated;
  
  // Inject highly visual simulated weather alerts for demonstration
  AppState.activeAlerts = [
    {
      title: "大雨特報",
      phenomena: "大雨",
      significance: "特報",
      contentText: "對流雲系發展旺盛，易有短延時強降雨，今（１）日新北市、臺北市、基隆市及桃園市地區有局部大雨或豪雨發生的機率，請注意雷擊及強陣風，山區請慎防坍方、落石及溪水暴漲。",
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
      affectedAreas: ["新北市", "臺北市", "基隆市", "桃園市"]
    },
    {
      title: "陸上強風特報",
      phenomena: "強風",
      significance: "特報",
      contentText: "東北風明顯偏強，今（１）日晚起臺中市、彰化縣、雲林縣、嘉義縣、臺南市沿海空曠地區及澎湖縣、金門縣、馬祖地區將有９至１０級強陣風，基隆北海岸、東半部地區及新北市、桃園市、新竹市、新竹縣、苗栗縣沿海空曠地區亦有較強陣風，鄰近海域並有較大風浪，請特別注意。",
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      affectedAreas: ["臺中市", "彰化縣", "雲林縣", "嘉義縣", "臺南市", "澎湖縣", "金門縣", "連江縣", "基隆市", "新北市", "桃園市", "新竹市", "新竹縣", "苗栗縣"]
    },
    {
      title: "高溫資訊",
      phenomena: "高溫",
      significance: "特報",
      contentText: "天氣晴朗炎熱，今（１）日中午前後高雄市地區為黃色燈號，請注意防曬、多補充水分、減少戶外劇烈運動，高溫可能引發熱傷害，請特別注意。",
      startTime: now.toISOString(),
      endTime: new Date(now.getTime() + 8 * 60 * 60 * 1000).toISOString(),
      affectedAreas: ["高雄市"]
    }
  ];
  
  // Set simulated strong wind CAP warning areas to match the mock warning
  AppState.strongWindCapTowns = [
    "新北市三芝區", "新北市石門區", "新北市淡水區",
    "桃園市觀音區", "桃園市新屋區",
    "新竹市北區", "新竹縣新豐鄉",
    "苗栗縣通霄鎮", "苗栗縣後龍鎮",
    "臺中市大甲區",
    "彰化縣線西鄉", "彰化縣鹿港鎮", "彰化縣伸港鄉", "彰化縣芳苑鄉", "彰化縣大城鄉",
    "雲林縣臺西鄉", "雲林縣麥寮鄉",
    "嘉義縣東石鄉",
    "臺南市北門區", "臺南市七股區", "臺南市將軍區", "臺南市安南區",
    "高雄市梓官區", "高雄市永安區", "高雄市彌陀區", "高雄市林園區", "高雄市小港區", "高雄市茄萣區", "高雄市前鎮區", "高雄市旗津區",
    "屏東縣獅子鄉", "屏東縣枋寮鄉", "屏東縣萬巒鄉", "屏東縣林邊鄉", "屏東縣琉球鄉", "屏東縣佳冬鄉", "屏東縣恆春鎮", "屏東縣滿州鄉", "屏東縣車城鄉", "屏東縣牡丹鄉",
    "臺東縣綠島鄉", "臺東縣蘭嶼鄉", "臺東縣臺東市", "臺東縣東河鄉", "臺東縣成功鎮", "臺東縣長濱鄉", "臺東縣太麻里鄉",
    "澎湖縣望安鄉", "澎湖縣湖西鄉", "澎湖縣白沙鄉", "澎湖縣七美鄉", "澎湖縣西嶼鄉", "澎湖縣馬公市",
    "連江縣東引鄉", "連江縣北竿鄉", "連江縣莒光鄉", "連江縣南竿鄉"
  ];
  
  AppState.isSimulationActive = true;
  updateDataBadge('模擬演示模式', 'simulation');
}

// --------------------------------------------------------------------------
// 7. View Rendering Core Components
// --------------------------------------------------------------------------

// Panel A: Main Location Weather Card (Hero)
function renderMainLocationWeather() {
  const activeCountyName = AppState.currentLocationCounty;
  const countyData = AppState.allCountiesWeatherData[activeCountyName];
  
  if (!countyData || countyData.error || !countyData.current || Object.keys(countyData.current).length === 0) {
    console.error('No weather data loaded for location:', activeCountyName);
    document.getElementById('current-location-name').textContent = activeCountyName;
    document.getElementById('current-temp').textContent = '--';
    document.getElementById('current-weather-desc').textContent = '無法取得即時氣象資料';
    document.getElementById('current-temp-range').textContent = '請檢查網路連線或 API 金鑰配置';
    
    document.getElementById('current-apparent-temp').textContent = '--°C';
    document.getElementById('current-humidity').textContent = '--%';
    document.getElementById('current-wind-grade').textContent = '-- 級';
    document.getElementById('current-rain-prob').textContent = '--%';
    document.getElementById('current-rain-recent').textContent = '-- / -- mm';
    document.getElementById('current-rain-daily').textContent = '-- mm';
    
    const iconContainer = document.getElementById('hero-weather-icon');
    iconContainer.innerHTML = `
      <svg class="weather-icon-animated error" viewBox="0 0 64 64" width="128" height="128" style="animation: float 3s infinite ease-in-out;">
        <path d="M32 12 L52 48 L12 48 Z" fill="none" stroke="#ff6b6b" stroke-width="3" stroke-linejoin="round"/>
        <text x="32" y="38" font-size="16" fill="#ff6b6b" text-anchor="middle" font-weight="bold">!</text>
      </svg>
    `;
    return;
  }
  
  document.getElementById('current-location-name').textContent = activeCountyName;
  
  const cur = countyData.current;
  document.getElementById('current-temp').textContent = Number(cur.temp).toFixed(1);
  
  // Render active warning badges if any exist for the current county/township
  const parsedActive = parseIdentifier(activeCountyName);
  const activeAlertsForHero = filterRedundantAlerts(
    (AppState.activeAlerts || []).filter(a => 
      a.affectedAreas && a.affectedAreas.some(area => isAlertMatch(area, parsedActive, a))
    )
  );
  
  const descEl = document.getElementById('current-weather-desc');
  if (activeAlertsForHero.length > 0) {
    const badgeHtml = activeAlertsForHero.map(a => 
      `<span class="card-alert-badge animate-pulse-neon">⚠️ ${a.title}</span>`
    ).join(' ');
    descEl.innerHTML = `${cur.desc} ${badgeHtml}`;
  } else {
    descEl.textContent = cur.desc;
  }
  
  document.getElementById('current-temp-range').textContent = `最高 ${Number(cur.tempMax).toFixed(1)}° | 最低 ${Number(cur.tempMin).toFixed(1)}°`;
  
  document.getElementById('current-apparent-temp').textContent = `${Number(cur.apparentTemp).toFixed(1)}°C`;
  document.getElementById('current-humidity').textContent = `${cur.humidity}%`;
  document.getElementById('current-wind-grade').textContent = `${cur.windGrade} 級`;
  document.getElementById('current-rain-prob').textContent = `${cur.rainProb}%`;
  
  const r10m = cur.rain10Min !== undefined ? Number(cur.rain10Min).toFixed(1) : '0.0';
  const r1h = cur.rain1Hr !== undefined ? Number(cur.rain1Hr).toFixed(1) : '0.0';
  const rDaily = cur.rainDaily !== undefined ? Number(cur.rainDaily).toFixed(1) : '0.0';
  document.getElementById('current-rain-recent').textContent = `${r10m} / ${r1h} mm`;
  document.getElementById('current-rain-daily').textContent = `${rDaily} mm`;
  
  // Render the dressed-person icon based on apparent temperature
  renderApparentTempPerson(cur.apparentTemp);
  
  // Inject Hero weather SVG icon
  const iconContainer = document.getElementById('hero-weather-icon');
  iconContainer.innerHTML = getAnimatedSvgCode(cur.icon, 128, 128);
  
  // Apply dynamic background style
  applyDynamicBackdropTheme(cur.icon);
}

// Render a dressed SVG "person" in the apparent temp stat card based on feels-like temperature
function renderApparentTempPerson(apparentTemp) {
  const container = document.getElementById('apparent-temp-person-icon');
  if (!container) return;
  
  const T = Number(apparentTemp);
  
  // ── Shared anatomy (always drawn) ─────────────────────────────────────────
  // Feet/shoes: two small rounded rects at the bottom, always visible
  const feetSvg = `
    <rect x="8.5"  y="25" width="4" height="1.8" rx="0.9" fill="#333"/>
    <rect x="12.5" y="25" width="4" height="1.8" rx="0.9" fill="#333"/>
  `;

  // ── Outfit layers (body + legs + arms) ────────────────────────────────────
  let skinColor, clothColor, bodyHtml;

  if (T >= 34) {
    skinColor = '#FBBF8C'; clothColor = '#F97316';
    bodyHtml = `
      <!-- Tank top -->
      <path d="M9.5 10 L9 17 L15 17 L14.5 10" fill="${clothColor}"/>
      <!-- Shorts end at y=22 leaving room for feet -->
      <path d="M9 17 L8.5 22 L11.2 22 L12 20 L12.8 22 L15.5 22 L15 17 Z" fill="${clothColor}"/>
      <!-- Bare upper-arms / forearms (skin) -->
      <line x1="9"  y1="11" x2="7"  y2="15" stroke="${skinColor}" stroke-width="2" stroke-linecap="round"/>
      <line x1="15" y1="11" x2="17" y2="15" stroke="${skinColor}" stroke-width="2" stroke-linecap="round"/>
      <!-- Bare legs (skin colour from shorts to feet) -->
      <line x1="10" y1="22" x2="10.5" y2="25" stroke="${skinColor}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="14" y1="22" x2="13.5" y2="25" stroke="${skinColor}" stroke-width="2.2" stroke-linecap="round"/>
    `;
  } else if (T >= 28) {
    skinColor = '#FBBF8C'; clothColor = '#3B82F6';
    bodyHtml = `
      <!-- T-shirt -->
      <path d="M9 10 L8 12.5 L9.5 13 L9.5 17 L14.5 17 L14.5 13 L16 12.5 L15 10 Z" fill="${clothColor}"/>
      <!-- Shorts -->
      <path d="M9.5 17 L9 22 L11.5 22 L12 20 L12.5 22 L15 22 L14.5 17 Z" fill="${clothColor}"/>
      <!-- Short sleeves (cloth) + bare forearms (skin) -->
      <line x1="8"  y1="12" x2="7"  y2="14.5" stroke="${clothColor}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="16" y1="12" x2="17" y2="14.5" stroke="${clothColor}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="7"  y1="14.5" x2="6.5" y2="17" stroke="${skinColor}" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="17" y1="14.5" x2="17.5" y2="17" stroke="${skinColor}" stroke-width="1.8" stroke-linecap="round"/>
      <!-- Bare legs -->
      <line x1="10" y1="22" x2="10.5" y2="25" stroke="${skinColor}" stroke-width="2.2" stroke-linecap="round"/>
      <line x1="14" y1="22" x2="13.5" y2="25" stroke="${skinColor}" stroke-width="2.2" stroke-linecap="round"/>
    `;
  } else if (T >= 22) {
    skinColor = '#FBBF8C'; clothColor = '#10B981';
    bodyHtml = `
      <!-- T-shirt -->
      <path d="M9 10 L8 12.5 L9.5 13 L9.5 17 L14.5 17 L14.5 13 L16 12.5 L15 10 Z" fill="${clothColor}"/>
      <!-- Long pants (dark) -->
      <path d="M9.5 17 L9 25 L11.5 25 L12 21 L12.5 25 L15 25 L14.5 17 Z" fill="#374151"/>
      <!-- Short sleeves + bare forearms -->
      <line x1="8"  y1="12" x2="7"  y2="14.5" stroke="${clothColor}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="16" y1="12" x2="17" y2="14.5" stroke="${clothColor}" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="7"  y1="14.5" x2="6.5" y2="17" stroke="${skinColor}" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="17" y1="14.5" x2="17.5" y2="17" stroke="${skinColor}" stroke-width="1.8" stroke-linecap="round"/>
    `;
  } else if (T >= 16) {
    skinColor = '#FBBF8C'; clothColor = '#8B5CF6';
    bodyHtml = `
      <!-- Long-sleeve shirt -->
      <path d="M9 10 L8 12.5 L9.5 13 L9.5 17 L14.5 17 L14.5 13 L16 12.5 L15 10 Z" fill="${clothColor}"/>
      <!-- Full long sleeves -->
      <line x1="8"   y1="12"  x2="6"   y2="18" stroke="${clothColor}" stroke-width="2.8" stroke-linecap="round"/>
      <line x1="16"  y1="12"  x2="18"  y2="18" stroke="${clothColor}" stroke-width="2.8" stroke-linecap="round"/>
      <!-- Long pants -->
      <path d="M9.5 17 L9 25 L11.5 25 L12 21 L12.5 25 L15 25 L14.5 17 Z" fill="#374151"/>
    `;
  } else if (T >= 8) {
    skinColor = '#FBBF8C'; clothColor = '#6366F1';
    bodyHtml = `
      <!-- Jacket with slight lapels -->
      <path d="M8.5 10 L7.5 12.5 L9.5 13 L9.5 17 L14.5 17 L14.5 13 L16.5 12.5 L15.5 10 Z" fill="${clothColor}"/>
      <path d="M10.5 10 L12 12.5 L13.5 10" fill="rgba(255,255,255,0.35)"/>
      <!-- Thick jacket sleeves -->
      <line x1="7.5"  y1="12"  x2="5.5"  y2="18.5" stroke="${clothColor}" stroke-width="3.2" stroke-linecap="round"/>
      <line x1="16.5" y1="12"  x2="18.5" y2="18.5" stroke="${clothColor}" stroke-width="3.2" stroke-linecap="round"/>
      <!-- Pants -->
      <path d="M9.5 17 L9 25 L11.5 25 L12 21 L12.5 25 L15 25 L14.5 17 Z" fill="#1F2937"/>
    `;
  } else {
    skinColor = '#FBBF8C'; clothColor = '#DC2626';
    bodyHtml = `
      <!-- Heavy coat -->
      <path d="M8 9.5 L7 12.5 L9.5 13 L9.5 17.5 L14.5 17.5 L14.5 13 L17 12.5 L16 9.5 Z" fill="${clothColor}"/>
      <!-- Scarf -->
      <path d="M9.2 8.8 Q12 11 14.8 8.8" stroke="#FCD34D" stroke-width="2.8" stroke-linecap="round" fill="none"/>
      <!-- Very thick sleeves -->
      <line x1="7"   y1="12"  x2="4.5"  y2="19" stroke="${clothColor}" stroke-width="4"   stroke-linecap="round"/>
      <line x1="17"  y1="12"  x2="19.5" y2="19" stroke="${clothColor}" stroke-width="4"   stroke-linecap="round"/>
      <!-- Thick trousers -->
      <path d="M9.5 17.5 L8.5 25 L11.5 25 L12 21 L12.5 25 L15.5 25 L14.5 17.5 Z" fill="#1F2937"/>
    `;
  }

  container.innerHTML = `
    <svg width="24" height="30" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg"
         style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3)); transition: all 0.4s ease;">
      <!-- Head -->
      <circle cx="12" cy="5" r="3" fill="${skinColor}"/>
      <!-- Eyes -->
      <circle cx="10.8" cy="4.5" r="0.45" fill="#333"/>
      <circle cx="13.2" cy="4.5" r="0.45" fill="#333"/>
      <!-- Smile -->
      <path d="M10.8 6.2 Q12 7.4 13.2 6.2" stroke="#333" stroke-width="0.5" stroke-linecap="round" fill="none"/>
      <!-- Outfit (body + arms + legs) -->
      ${bodyHtml}
      <!-- Feet / shoes (always visible) -->
      ${feetSvg}
    </svg>
  `;
}


// Map active icon to background styles and trigger custom screen particles!
function applyDynamicBackdropTheme(iconType) {
  const backdrop = document.getElementById('dynamic-backdrop');
  backdrop.className = ''; // Wipe old classes
  
  let backdropClass = 'backdrop-sunny';
  if (iconType === 'sunny') backdropClass = 'backdrop-sunny';
  else if (iconType === 'sunny-cloudy') backdropClass = 'backdrop-sunny';
  else if (iconType === 'cloudy') backdropClass = 'backdrop-cloudy';
  else if (iconType === 'rainy') backdropClass = 'backdrop-rainy';
  else if (iconType === 'thunderstorm') backdropClass = 'backdrop-thunder';
  else if (iconType === 'windy') backdropClass = 'backdrop-windy';
  else if (iconType === 'night') backdropClass = 'backdrop-night';
  
  backdrop.classList.add(backdropClass);
  
  // Spawn background particle systems (rain or stars!)
  const particlesContainer = document.getElementById('weather-particles');
  particlesContainer.innerHTML = ''; // Wipe
  
  if (iconType === 'rainy' || iconType === 'thunderstorm') {
    // Rain Particles
    const dropCount = 45;
    for (let i = 0; i < dropCount; i++) {
      const drop = document.createElement('div');
      drop.className = 'raindrop';
      drop.style.left = `${Math.random() * 100}%`;
      drop.style.top = `${Math.random() * -50}px`;
      drop.style.height = `${Math.random() * 20 + 20}px`;
      drop.style.animationDuration = `${Math.random() * 0.6 + 0.5}s`;
      drop.style.animationDelay = `${Math.random() * 2}s`;
      particlesContainer.appendChild(drop);
    }
  } else if (iconType === 'night' || (iconType === 'sunny' && isNightTime(AppState.currentLocationCounty, new Date()))) {
    // Starry Stars
    const starCount = 35;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star-twinkle';
      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 70}%`;
      const size = Math.random() * 2.5 + 1;
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      star.style.animationDuration = `${Math.random() * 3 + 2}s`;
      star.style.animationDelay = `${Math.random() * 3}s`;
      particlesContainer.appendChild(star);
    }
  }
}

// Panel B: Custom Added Regions List
function renderAddedRegionsList() {
  const container = document.getElementById('added-regions-list');
  container.innerHTML = '';
  
  if (AppState.addedRegions.length === 0) {
    container.innerHTML = `
      <div class="empty-state-message">
        <p>尚無自選地區，在上方搜尋並新增縣市即可快速追蹤！</p>
      </div>
    `;
    return;
  }
  
  for (const identifier of AppState.addedRegions) {
    const data = AppState.allCountiesWeatherData[identifier];
    
    // If not loaded yet, fetch dynamically!
    if (!data) {
      loadWeatherForRegion(identifier).then(() => {
        renderAddedRegionsList();
      });
      continue; // Skip rendering temporarily until loaded
    }
    
    const parsed = parseIdentifier(identifier);
    const nameLabel = parsed.type === 'town' ? parsed.town : parsed.county;
    const badgeLabel = parsed.type === 'town' ? parsed.county : '縣市總覽';
    
    const card = document.createElement('div');
    card.setAttribute('data-region', identifier);
    
    if (data.error) {
      card.className = 'region-card glass-panel error-card';
      card.innerHTML = `
        <div class="region-card-left">
          <span class="region-card-name">${nameLabel}</span>
          <span class="region-card-meta" style="color: #ff6b6b;">${badgeLabel} &bull; 無法取得資料</span>
        </div>
        <div class="region-card-right">
          <div class="region-card-temp">--°</div>
          <div class="region-card-icon" style="color: #ff6b6b; font-size: 20px;">
            ⚠️
          </div>
          <button class="delete-card-btn" title="刪除" onclick="event.stopPropagation(); deleteCustomRegion('${identifier}')">
            &times;
          </button>
        </div>
      `;
      card.addEventListener('click', () => {
        // Retry
        loadWeatherForRegion(identifier).then(() => {
          renderAddedRegionsList();
        });
      });
      container.appendChild(card);
      continue;
    }
    
    const cur = data.current;
    
    // Check for active alerts in the custom region's parent county or specific township
    const activeAlertsForRegion = filterRedundantAlerts(
      (AppState.activeAlerts || []).filter(a => 
        a.affectedAreas && a.affectedAreas.some(area => isAlertMatch(area, parsed, a))
      )
    );
    let regionAlertBadgeHtml = '';
    if (activeAlertsForRegion.length > 0) {
      regionAlertBadgeHtml = activeAlertsForRegion.map(a => {
        const displayTitle = a.title.replace('特報', '').replace('警報', '');
        return `<span class="card-alert-badge-mini animate-pulse-neon">⚠️ ${displayTitle}</span>`;
      }).join(' ');
    }
    
    const r10m = cur.rain10Min !== undefined ? Number(cur.rain10Min).toFixed(1) : '0.0';
    const r1h = cur.rain1Hr !== undefined ? Number(cur.rain1Hr).toFixed(1) : '0.0';
    const rDaily = cur.rainDaily !== undefined ? Number(cur.rainDaily).toFixed(1) : '0.0';
    const rainText = `🌧️ ${r10m}/${r1h}/${rDaily} mm`;
    
    card.className = 'region-card glass-panel';
    card.innerHTML = `
      <div class="region-card-left">
        <span class="region-card-name">${nameLabel}</span>
        <span class="region-card-meta">${badgeLabel} &bull; ${cur.desc} &bull; 降雨 ${cur.rainProb}% &bull; ${rainText} ${regionAlertBadgeHtml}</span>
      </div>
      <div class="region-card-right">
        <div class="region-card-temp">${Number(cur.temp).toFixed(1)}°</div>
        <div class="region-card-icon">
          ${getAnimatedSvgCode(cur.icon, 40, 40)}
        </div>
        <button class="delete-card-btn" title="刪除" onclick="event.stopPropagation(); deleteCustomRegion('${identifier}')">
          &times;
        </button>
      </div>
    `;
    
    card.addEventListener('click', () => {
      openDrawerForecast(identifier);
    });
    
    container.appendChild(card);
  }
}

// --------------------------------------------------------------------------
// 8. Custom SVG Line Chart & Apple-style Temperature Range Renderers
// --------------------------------------------------------------------------
function drawHourlySvgChart(hourlyData) {
  const container = document.getElementById('svg-chart-container');
  container.innerHTML = ''; // Wipe
  
  if (!hourlyData || hourlyData.length === 0) return;
  
  // Subset to first 12 intervals (36 Hours) for stunning resolution
  const data = hourlyData.slice(0, 12);
  const size = data.length;
  
  // Chart dimensions (adjusted for larger mobile typography and animations)
  const svgWidth = 680;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 40;
  
  // Find min/max temp to map y coordinates
  const temps = data.map(d => d.temp);
  const minTemp = Math.min(...temps) - 1.5;
  const maxTemp = Math.max(...temps) + 1.5;
  const tempDiff = maxTemp - minTemp;
  
  // Map x, y point values
  const points = data.map((d, i) => {
    const x = paddingX + (i * (svgWidth - paddingX * 2) / (size - 1));
    const y = svgHeight - paddingY - ((d.temp - minTemp) / tempDiff) * (svgHeight - paddingY * 2);
    return { x, y, temp: d.temp, time: d.displayTime, icon: d.icon, rainProb: d.rainProb };
  });
  
  // Start building SVG string
  let svgCode = `
    <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- Background Area Gradient -->
        <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="var(--color-accent)" stop-opacity="0.3" />
          <stop offset="100%" stop-color="var(--color-accent)" stop-opacity="0.0" />
        </linearGradient>
        
        <!-- Glowing drop shadow filter -->
        <filter id="glow-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="var(--color-accent-glow)" flood-opacity="0.8" />
        </filter>
        
        <!-- Re-declared Gradients for bulletproof self-contained rendering -->
        <linearGradient id="grad-sun" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFD269" />
          <stop offset="100%" stop-color="#FF9E00" />
        </linearGradient>
        <linearGradient id="grad-sun-rays" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFA800" />
          <stop offset="100%" stop-color="#FF5100" />
        </linearGradient>
        <linearGradient id="grad-cloud-front" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#B0C4DE" />
        </linearGradient>
        <linearGradient id="grad-cloud-back" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#F5F5F5" stop-opacity="0.8" />
          <stop offset="100%" stop-color="#9CB3C9" stop-opacity="0.8" />
        </linearGradient>
        <linearGradient id="grad-cloud-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#697C91" />
          <stop offset="100%" stop-color="#32404F" />
        </linearGradient>
        <linearGradient id="grad-rain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#7EA5F0" />
          <stop offset="100%" stop-color="#3B6FCB" />
        </linearGradient>
        <linearGradient id="grad-lightning" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFE135" />
          <stop offset="100%" stop-color="#FF9900" />
        </linearGradient>
        <linearGradient id="grad-wind" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#EAEAEA" stop-opacity="0.2" />
          <stop offset="50%" stop-color="#D3E0EA" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#EAEAEA" stop-opacity="0.2" />
        </linearGradient>
        <linearGradient id="grad-moon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FDFDED" />
          <stop offset="60%" stop-color="#ECEB9D" />
          <stop offset="100%" stop-color="#C2C056" />
        </linearGradient>
      </defs>
  `;
  
  // Draw Background Grid lines
  svgCode += `
    <line x1="${paddingX}" y1="${paddingY}" x2="${svgWidth - paddingX}" y2="${paddingY}" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
    <line x1="${paddingX}" y1="${svgHeight - paddingY}" x2="${svgWidth - paddingX}" y2="${svgHeight - paddingY}" stroke="rgba(255,255,255,0.03)" stroke-width="1" />
  `;
  
  // Draw Area under the line (polygon)
  let areaPoints = `M ${points[0].x} ${svgHeight - paddingY} `;
  points.forEach(p => {
    areaPoints += `L ${p.x} ${p.y} `;
  });
  areaPoints += `L ${points[size-1].x} ${svgHeight - paddingY} Z`;
  svgCode += `<path d="${areaPoints}" class="chart-gradient-fill" />`;
  
  // Construct polyline path (Smooth curves using bezier approximations)
  let pathD = `M ${points[0].x} ${points[0].y} `;
  for (let i = 0; i < size - 1; i++) {
    const p1 = points[i];
    const p2 = points[i+1];
    // Control points for smooth bezier interpolation
    const cpX1 = p1.x + (p2.x - p1.x) / 3;
    const cpY1 = p1.y;
    const cpX2 = p1.x + 2 * (p2.x - p1.x) / 3;
    const cpY2 = p2.y;
    pathD += `C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p2.x} ${p2.y} `;
  }
  
  svgCode += `<path d="${pathD}" class="chart-line" filter="url(#glow-shadow)" />`;
  
  // Render labels and interaction nodes (enhanced sizes for mobile readability)
  points.forEach(p => {
    // Temperature above coordinate node
    svgCode += `<text x="${p.x}" y="${p.y - 15}" class="chart-label-temp">${Number(p.temp).toFixed(1)}°</text>`;
    
    // Coordinate circle point node (enlarged)
    svgCode += `<circle cx="${p.x}" cy="${p.y}" r="5" class="chart-point" />`;
    
    // Render inlined vector weather icon with animations! (Scaled up to 36px for stunning animation views)
    svgCode += getChartIconSvg(p.icon, p.x, svgHeight - 56, 36);
    
    // Time label below bottom boundary
    svgCode += `<text x="${p.x}" y="${svgHeight - 12}" class="chart-label-time">${p.time}</text>`;
    
    // Rain Pop label if greater than 0%
    if (p.rainProb > 0) {
      svgCode += `<text x="${p.x}" y="${svgHeight - 32}" class="chart-label-rain">${p.rainProb}%</text>`;
    }
  });
  
  svgCode += `</svg>`;
  container.innerHTML = svgCode;
}

// Render Apple Weather Style Range Bar items for 7-day forecast
function renderAppleWeeklyRangeBars(weeklyList) {
  const container = document.getElementById('drawer-weekly-list');
  container.innerHTML = '';
  
  if (!weeklyList || weeklyList.length === 0) return;
  
  // Find absolute min and max temp across the whole week to map boundaries
  const allMins = weeklyList.map(d => d.tempMin);
  const allMaxs = weeklyList.map(d => d.tempMax);
  const absoluteMin = Math.min(...allMins);
  const absoluteMax = Math.max(...allMaxs);
  const absoluteRange = absoluteMax - absoluteMin;
  
  weeklyList.forEach((day, index) => {
    const item = document.createElement('div');
    item.className = 'weekly-item';
    
    // Calculate percentage ratios for the horizontal Apple bar
    const leftPercent = ((day.tempMin - absoluteMin) / absoluteRange) * 100;
    const widthPercent = ((day.tempMax - day.tempMin) / absoluteRange) * 100;
    
    // If "Today", draw an additional absolute dot representing current temperature!
    let dotHtml = '';
    if (index === 0) {
      // Find relative spot of current temp
      const currentTemp = AppState.allCountiesWeatherData[AppState.activeRegionDetailed].current.temp || day.tempMin;
      const dotLeft = ((currentTemp - day.tempMin) / (day.tempMax - day.tempMin)) * 100;
      dotHtml = `<div class="weekly-range-bar-dot" style="left: ${Math.min(95, Math.max(5, dotLeft))}%"></div>`;
    }
    
    item.innerHTML = `
      <span class="weekly-day">${day.dayOfWeek}</span>
      <span class="weekly-pop">${day.rainProb > 0 ? day.rainProb + '%' : ''}</span>
      <div class="weekly-icon-wrapper">
        ${getAnimatedSvgCode(day.icon, 40, 40)}
      </div>
      <div class="weekly-range-bar-container">
        <div class="weekly-range-bar-track">
          <div class="weekly-range-bar-filled" style="left: ${leftPercent}%; width: ${widthPercent}%;">
            ${dotHtml}
          </div>
        </div>
      </div>
      <div class="weekly-temp-labels">
        <span class="weekly-min-temp">${Number(day.tempMin).toFixed(1)}°</span>
        <span class="weekly-max-temp">${Number(day.tempMax).toFixed(1)}°</span>
      </div>
    `;
    
    container.appendChild(item);
  });
}

// --------------------------------------------------------------------------
// 9. Detailed Drawer Controllers & Overlay
// --------------------------------------------------------------------------
function initDetailsDrawer() {
  const overlay = document.getElementById('details-drawer-overlay');
  const drawer = document.getElementById('details-drawer');
  const closeBtn = document.getElementById('btn-close-drawer');
  
  const closeDrawer = () => {
    overlay.classList.remove('active');
    drawer.classList.remove('active');
    
    // Clean up Leaflet map inside details drawer to avoid leaks and binding issues
    if (AppState.drawerMap) {
      AppState.drawerMap.remove();
      AppState.drawerMap = null;
    }
  };
  
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

function openDrawerForecast(identifier) {
  const parsed = parseIdentifier(identifier);
  
  // Dynamic Redirection for County Overview cards:
  // If the user clicks a county (like '新北市', '臺中市'), automatically redirect to its capital/central township 
  // (like '新北市板橋區', '臺中市西區') to display a beautiful, fully populated 72-hour detailed forecast chart.
  if (parsed.type === 'county') {
    const capital = COUNTY_CAPITALS[parsed.county];
    if (capital) {
      const capitalId = parsed.county + capital;
      console.log(`Redirecting county drawer forecast from ${parsed.county} to capital township ${capitalId}`);
      
      const capitalData = AppState.allCountiesWeatherData[capitalId];
      if (capitalData && !capitalData.error && capitalData.hourly && capitalData.hourly.length > 0) {
        // Already loaded successfully, open it directly!
        openDrawerForecast(capitalId);
      } else {
        // Not loaded or error state, show loading spinner in drawer and fetch township details in the background
        const overlay = document.getElementById('details-drawer-overlay');
        const drawer = document.getElementById('details-drawer');
        
        // Render detailed drawer in-progress state
        document.getElementById('drawer-region-title').textContent = `${parsed.county} ${capital}`;
        document.getElementById('drawer-current-desc').textContent = `載入預報資料中...`;
        document.getElementById('drawer-hero-icon').innerHTML = `<div class="loading-spinner" style="margin: 0 auto; width: 40px; height: 40px;"></div>`;
        document.getElementById('svg-chart-container').innerHTML = `<div class="loading-spinner" style="margin: 30px auto;"></div>`;
        document.getElementById('drawer-weekly-list').innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-muted);">正在取得該地區逐時預報...</div>`;
        
        overlay.classList.add('active');
        drawer.classList.add('active');
        
        loadWeatherForRegion(capitalId).then(() => {
          const loadedData = AppState.allCountiesWeatherData[capitalId];
          if (loadedData && !loadedData.error) {
            openDrawerForecast(capitalId);
          } else {
            // Render error fallback in drawer
            document.getElementById('drawer-current-desc').textContent = `連線失敗 • 無法取得該地區天氣預報`;
            document.getElementById('drawer-hero-icon').innerHTML = `<span style="font-size: 32px; color: #ff6b6b">⚠️</span>`;
            document.getElementById('svg-chart-container').innerHTML = `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); gap: 8px;">
                <span style="font-size: 24px;">📡</span>
                <p>無法取得即時 72 小時逐時預報資料</p>
                <button class="primary-ctrl" onclick="retryDrawerLoad('${capitalId}')" style="margin-top: 8px;">重新載入</button>
              </div>
            `;
          }
        });
      }
      return;
    }
  }

  AppState.activeRegionDetailed = identifier;
  const data = AppState.allCountiesWeatherData[identifier];
  const title = parsed.type === 'town' ? `${parsed.county} ${parsed.town}` : parsed.county;
  
  // Set headers
  document.getElementById('drawer-region-title').textContent = title;
  
  // Clear any residual alert boxes
  const alertsContainer = document.getElementById('drawer-alerts-container');
  if (alertsContainer) alertsContainer.innerHTML = '';
  
  const overlay = document.getElementById('details-drawer-overlay');
  const drawer = document.getElementById('details-drawer');
  
  if (!data || data.error || !data.current || Object.keys(data.current).length === 0) {
    document.getElementById('drawer-current-desc').textContent = `連線失敗 • 無法取得該地區天氣預報`;
    document.getElementById('drawer-hero-icon').innerHTML = `
      <span style="font-size: 32px; color: #ff6b6b">⚠️</span>
    `;
    
    // Show error message in chart container
    document.getElementById('svg-chart-container').innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); gap: 8px;">
        <span style="font-size: 24px;">📡</span>
        <p>無法取得即時 72 小時逐時預報資料</p>
        <button class="primary-ctrl" onclick="retryDrawerLoad('${identifier}')" style="margin-top: 8px;">重新載入</button>
      </div>
    `;
    
    // Clear weekly list
    document.getElementById('drawer-weekly-list').innerHTML = `
      <div style="text-align: center; padding: 20px; color: var(--text-muted);">
        請確認您的 API 金鑰已在「設定」中正確設定，且網路連線正常。
      </div>
    `;
    
    overlay.classList.add('active');
    drawer.classList.add('active');
    return;
  }
  
  document.getElementById('drawer-current-desc').textContent = `${data.current.desc} • 現在溫度 ${Number(data.current.temp).toFixed(1)}°C`;
  document.getElementById('drawer-hero-icon').innerHTML = getAnimatedSvgCode(data.current.icon, 64, 64);
  
  // Build and render localized warning summaries if warnings are active for this county
  const countyName = parsed.county;
  const normCounty = countyName.replace(/台/g, '臺');
  const normTown = parsed.town ? parsed.town.replace(/台/g, '臺') : '';
  
  const countyAlerts = filterRedundantAlerts(
    (AppState.activeAlerts || []).filter(alert => 
      alert.affectedAreas && alert.affectedAreas.some(area => isAlertMatch(area, parsed, alert))
    )
  );
  
  if (countyAlerts.length > 0 && alertsContainer) {
    countyAlerts.forEach(alert => {
      const keywords = getCountyKeywords(countyName);
      
      // Split sentences by Chinese punctuation
      const sentences = alert.contentText.split(/[。！]/).filter(s => s.trim().length > 0);
      let relevantSentences = sentences.filter(s => keywords.some(k => s.includes(k)));
      
      // Highlight logic helper
      const highlightText = (text) => {
        let res = text;
        keywords.forEach(k => {
          const regex = new RegExp(k, 'g');
          res = res.replace(regex, `<span class="alert-highlight">${k}</span>`);
        });
        return res;
      };
      
      let summaryHtml = '';
      if (relevantSentences.length > 0) {
        summaryHtml = relevantSentences.map(s => `<li>${highlightText(s)}。</li>`).join('');
      } else {
        // Fallback to first two sentences if no keywords matched
        summaryHtml = sentences.slice(0, 2).map(s => `<li>${highlightText(s)}。</li>`).join('');
      }
      
      const fullTextHighlighted = highlightText(alert.contentText);
      
      const alertBox = document.createElement('div');
      alertBox.className = 'drawer-alert-box glass-panel';
      alertBox.innerHTML = `
        <div class="drawer-alert-header">
          <div class="drawer-alert-title">
            <span class="alert-icon">⚠️</span>
            <h4>${alert.title}</h4>
          </div>
          <span class="drawer-alert-time">${formatAlertTime(alert.startTime)} ～ ${formatAlertTime(alert.endTime)}</span>
        </div>
        <div class="drawer-alert-body">
          <div class="alert-summary-section">
            <span class="alert-section-badge">🎯 ${countyName} 專屬影響摘要</span>
            <ul class="alert-summary-list">
              ${summaryHtml}
            </ul>
          </div>
        </div>
      `;
      alertsContainer.appendChild(alertBox);
    });
  }
  
  // Render details drawer mini warning map if alerts exist for this region
  const mapContainer = document.getElementById('drawer-mini-map');
  if (countyAlerts.length > 0) {
    if (mapContainer) {
      mapContainer.style.display = 'block';
      
      // Clean up previous map instance
      if (AppState.drawerMap) {
        AppState.drawerMap.remove();
        AppState.drawerMap = null;
      }
      
      // Resolve coordinates for map centering
      const coords = getCoordsForLocation(parsed);
      
      // Initialize Leaflet map inside details drawer
      AppState.drawerMap = L.map('drawer-mini-map', {
        center: [coords.lat, coords.lon],
        zoom: 11,
        zoomControl: false,
        attributionControl: false
      });
      
      // Add Dark Matter CartoDB tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 18
      }).addTo(AppState.drawerMap);
      
      // Add a red warning circle of 5km radius to highlight the alert area
      L.circle([coords.lat, coords.lon], {
        color: '#EF4444',
        fillColor: '#EF4444',
        fillOpacity: 0.15,
        radius: 5000
      }).addTo(AppState.drawerMap);
      
      // Add a pulsing-like marker at the center
      L.circleMarker([coords.lat, coords.lon], {
        radius: 6,
        color: '#FF0000',
        fillColor: '#FFFFFF',
        fillOpacity: 0.8,
        weight: 2
      }).addTo(AppState.drawerMap);
      
      // Invalidate Leaflet map size after sliding animation completes to render tiles properly
      setTimeout(() => {
        if (AppState.drawerMap) {
          AppState.drawerMap.invalidateSize();
        }
      }, 300);
    }
  } else {
    if (mapContainer) {
      mapContainer.style.display = 'none';
    }
    if (AppState.drawerMap) {
      AppState.drawerMap.remove();
      AppState.drawerMap = null;
    }
  }
  
  // Set rainfall values in drawer
  const r10m = data.current.rain10Min !== undefined ? Number(data.current.rain10Min).toFixed(1) : '0.0';
  const r1h = data.current.rain1Hr !== undefined ? Number(data.current.rain1Hr).toFixed(1) : '0.0';
  const rDaily = data.current.rainDaily !== undefined ? Number(data.current.rainDaily).toFixed(1) : '0.0';
  
  document.getElementById('drawer-rain-10m').textContent = `${r10m} mm`;
  document.getElementById('drawer-rain-1h').textContent = `${r1h} mm`;
  document.getElementById('drawer-rain-daily').textContent = `${rDaily} mm`;
  
  // Render SVG hourly chart
  drawHourlySvgChart(data.hourly);
  
  // Render Apple style ranges
  renderAppleWeeklyRangeBars(data.weekly);
  
  // Open UI elements
  overlay.classList.add('active');
  drawer.classList.add('active');
}

// --------------------------------------------------------------------------
// 10. Radar Echo Page Interactive Pan/Zoom Controls
// --------------------------------------------------------------------------
function initRadarControls() {
  const radarImg = document.getElementById('radar-img');
  const wrapper = document.getElementById('radar-wrapper');
  const outer = document.getElementById('radar-canvas-outer');
  
  const loader = document.getElementById('radar-loader');
  
  // Loading handler to trigger premium scan animation
  radarImg.addEventListener('load', () => {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 400);
  });
  
  // Zoom Controls
  document.getElementById('btn-radar-zoom-in').addEventListener('click', () => {
    AppState.radarZoom = Math.min(4, AppState.radarZoom + 0.25);
    applyRadarTransform();
  });
  
  document.getElementById('btn-radar-zoom-out').addEventListener('click', () => {
    AppState.radarZoom = Math.max(1, AppState.radarZoom - 0.25);
    applyRadarTransform();
  });
  
  document.getElementById('btn-radar-reset').addEventListener('click', () => {
    AppState.radarZoom = 1;
    AppState.radarPan = { x: 0, y: 0 };
    applyRadarTransform();
  });
  
  document.getElementById('btn-radar-fullscreen').addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.getElementById('tab-content-radar').requestFullscreen().catch(err => {
        alert(`無法切換至全螢幕模式: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  });
  
  // Refresh Button (Bust cache timestamp)
  document.getElementById('btn-radar-refresh').addEventListener('click', () => {
    loadRadarImage(true);
  });
  
  // Play/Pause past 1 hour animation
  document.getElementById('btn-radar-play').addEventListener('click', () => {
    toggleRadarPlay();
  });
  
  // Pan mouse drag listeners
  outer.addEventListener('mousedown', (e) => {
    if (AppState.radarZoom <= 1) return; // Only pan when zoomed
    AppState.isDraggingRadar = true;
    AppState.dragStart = { x: e.clientX - AppState.radarPan.x, y: e.clientY - AppState.radarPan.y };
  });
  
  window.addEventListener('mousemove', (e) => {
    if (!AppState.isDraggingRadar) return;
    AppState.radarPan = { x: e.clientX - AppState.dragStart.x, y: e.clientY - AppState.dragStart.y };
    applyRadarTransform();
  });
  
  window.addEventListener('mouseup', () => {
    AppState.isDraggingRadar = false;
  });

  // Touch drag support for mobile
  outer.addEventListener('touchstart', (e) => {
    if (AppState.radarZoom <= 1) return; // Only pan when zoomed
    if (e.touches.length === 1) {
      AppState.isDraggingRadar = true;
      const touch = e.touches[0];
      AppState.dragStart = { x: touch.clientX - AppState.radarPan.x, y: touch.clientY - AppState.radarPan.y };
      e.preventDefault();
    }
  }, { passive: false });
  
  window.addEventListener('touchmove', (e) => {
    if (!AppState.isDraggingRadar) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      AppState.radarPan = { x: touch.clientX - AppState.dragStart.x, y: touch.clientY - AppState.dragStart.y };
      applyRadarTransform();
      e.preventDefault();
    }
  }, { passive: false });
  
  window.addEventListener('touchend', () => {
    AppState.isDraggingRadar = false;
  });
}

function applyRadarTransform() {
  const wrapper = document.getElementById('radar-wrapper');
  wrapper.style.transform = `scale(${AppState.radarZoom}) translate(${AppState.radarPan.x / AppState.radarZoom}px, ${AppState.radarPan.y / AppState.radarZoom}px)`;
}

function loadRadarImage(force = false) {
  // If we are calling this manually and animation is active, stop it
  if (force && radarPlayInterval) {
    toggleRadarPlay();
  }

  const radarImg = document.getElementById('radar-img');
  const timestampEl = document.getElementById('radar-timestamp');
  const loader = document.getElementById('radar-loader');
  
  loader.style.display = 'flex';
  loader.style.opacity = '1';
  
  const cacheBust = force ? `?t=${new Date().getTime()}` : '';
  radarImg.src = `https://www.cwa.gov.tw/Data/radar/CV1_3600.png${cacheBust}`;
  
  // Format current CWA standard update intervals (typically 10 min) locked to Taiwan timezone
  const now = new Date();
  const twParts = getTaiwanDateTimeParts(now);
  const lastTenMin = Math.floor(parseInt(twParts.minute) / 10) * 10;
  const pad = (n) => String(n).padStart(2, '0');
  timestampEl.textContent = `最後更新時間：${twParts.hour}:${pad(lastTenMin)}`;
}

// State for radar animation play
let radarPlayInterval = null;
let radarHistoryFrames = [];
let radarCurrentFrameIndex = 0;

// Dynamic local time calculator for CWA historical radar images (CWA servers store files in local Taiwan time)
function getRadarHistoryUrls() {
  const urls = [];
  const now = new Date();
  
  // Since CWA images take about 8 minutes to generate, let's offset by 8 minutes to be safe
  const latestLocalMs = now.getTime() - (8 * 60 * 1000);
  
  // We fetch the past 6 intervals (representing 1 hour, each 10 mins apart)
  for (let i = 0; i < 6; i++) {
    const frameMs = latestLocalMs - (i * 10 * 60 * 1000);
    const frameDate = new Date(frameMs);
    
    // Round down to the nearest 10 minutes in Taiwan local time
    const twParts = getTaiwanDateTimeParts(frameDate);
    const roundedMinutes = Math.floor(parseInt(twParts.minute) / 10) * 10;
    
    // Adjust frameDate to match the rounded minute in local Taiwan time
    const minDiff = roundedMinutes - parseInt(twParts.minute);
    frameDate.setMinutes(frameDate.getMinutes() + minDiff);
    frameDate.setSeconds(0);
    frameDate.setMilliseconds(0);
    
    const finalTw = getTaiwanDateTimeParts(frameDate);
    
    const yyyy = finalTw.year;
    const mm = finalTw.month;
    const dd = finalTw.day;
    const hh = finalTw.hour;
    const mi = finalTw.minute;
    
    const timeStr = `${yyyy}${mm}${dd}${hh}${mi}`;
    const url = `https://www.cwa.gov.tw/Data/radar/CV1_3600_${timeStr}.png`;
    
    // The label is directly in local Taiwan time!
    urls.push({ url, label: `${hh}:${mi}` });
  }
  
  // Reverse so they play from oldest to newest!
  return urls.reverse();
}

function toggleRadarPlay() {
  const playBtn = document.getElementById('btn-radar-play');
  const playIcon = document.getElementById('radar-play-icon');
  const radarImg = document.getElementById('radar-img');
  const timestampEl = document.getElementById('radar-timestamp');
  
  if (radarPlayInterval) {
    // Stop Animation
    clearInterval(radarPlayInterval);
    radarPlayInterval = null;
    playIcon.textContent = '▶️';
    playBtn.title = '播放過去 1 小時動畫';
    
    // Restore latest real-time image
    loadRadarImage(true);
  } else {
    // Start Animation
    updateDataBadge('載入動畫中...', 'loading');
    
    // Generate history URLs
    radarHistoryFrames = getRadarHistoryUrls();
    radarCurrentFrameIndex = 0;
    
    if (radarHistoryFrames.length === 0) {
      updateDataBadge('無法取得動畫圖資', 'error');
      return;
    }
    
    playIcon.textContent = '⏸️';
    playBtn.title = '暫停播放';
    
    // Preload images to prevent flickering
    let loadCount = 0;
    
    radarHistoryFrames.forEach((frame) => {
      const img = new Image();
      img.src = frame.url;
      img.onload = () => {
        loadCount++;
        if (loadCount === radarHistoryFrames.length) {
          updateDataBadge('即時氣象署資料', 'live');
          startPlaybackLoop();
        }
      };
      img.onerror = () => {
        loadCount++;
        if (loadCount === radarHistoryFrames.length) {
          updateDataBadge('即時氣象署資料', 'live');
          startPlaybackLoop();
        }
      };
    });
    
    // Fallback trigger if loading takes too long
    setTimeout(() => {
      if (!radarPlayInterval) {
        updateDataBadge('即時氣象署資料', 'live');
        startPlaybackLoop();
      }
    }, 2500);
  }
}

function startPlaybackLoop() {
  if (radarPlayInterval) return;
  
  const radarImg = document.getElementById('radar-img');
  const timestampEl = document.getElementById('radar-timestamp');
  
  const playFrame = () => {
    const frame = radarHistoryFrames[radarCurrentFrameIndex];
    radarImg.src = frame.url;
    
    // Display local Taiwan time directly
    timestampEl.textContent = `播放中：${frame.label}`;
    
    radarCurrentFrameIndex = (radarCurrentFrameIndex + 1) % radarHistoryFrames.length;
  };
  
  playFrame(); // Play first frame immediately
  radarPlayInterval = setInterval(playFrame, 800); // 800ms per frame
}

// --------------------------------------------------------------------------
// 10.5 Taiwan 368 Townships Helpers & Core Loaders
// --------------------------------------------------------------------------
const SearchIndex = [];

function parseIdentifier(id) {
  const county = TAIWAN_COUNTIES.find(c => id.startsWith(c.name));
  if (county && id.length > county.name.length) {
    return {
      type: 'town',
      county: county.name,
      town: id.substring(county.name.length)
    };
  }
  return {
    type: 'county',
    county: id,
    town: ''
  };
}

function formatFriendlyName(id) {
  const parsed = parseIdentifier(id);
  return parsed.type === 'town' ? `${parsed.county} ${parsed.town}` : parsed.county;
}

function initSearchIndex() {
  if (SearchIndex.length > 0) return; // Already built
  
  // Add 22 counties
  for (const c of TAIWAN_COUNTIES) {
    SearchIndex.push({
      type: 'county',
      name: c.name,
      parent: '',
      displayName: `${c.name} (${c.region})`,
      searchTokens: c.name + c.english.toLowerCase() + c.region
    });
  }
  
  // Add 368 townships
  for (const [county, townsStr] of Object.entries(TOWNSHIP_DATA)) {
    const towns = townsStr.split(' ');
    const region = TAIWAN_COUNTIES.find(c => c.name === county)?.region || '臺灣';
    for (const t of towns) {
      SearchIndex.push({
        type: 'town',
        name: t,
        parent: county,
        displayName: `${county} ${t}`,
        searchTokens: county + t + region
      });
    }
  }
}

async function loadWeatherForRegion(id) {
  // Validate that the region has valid weather data loaded in memory (not error, not NaN/undefined temperature)
  const existingData = AppState.allCountiesWeatherData[id];
  const isInMemoryValid = existingData && 
                          !existingData.error && 
                          existingData.current && 
                          existingData.current.temp !== undefined && 
                          existingData.current.temp !== null && 
                          !isNaN(existingData.current.temp) && 
                          existingData.current.desc !== undefined;
  
  if (isInMemoryValid) return; // Already loaded successfully and valid!
  
  const parsed = parseIdentifier(id);
  
  if (parsed.type === 'county') {
    const success = await fetchAllWeatherData();
    if (!success) {
      AppState.allCountiesWeatherData[id] = { error: true, name: parsed.county };
    }
    return;
  }
  
  // Dynamic fetch for township
  updateDataBadge(`載入 ${parsed.town}資料...`, 'loading');
  try {
    const success = await fetchCwaTownshipData(parsed.county);
    if (success) {
      updateDataBadge('即時氣象署資料', 'live');
      if (AppState.allCountiesWeatherData[id] && AppState.allCountiesWeatherData[id].error) {
        delete AppState.allCountiesWeatherData[id];
      }
    } else {
      updateDataBadge('無法取得資料', 'error');
      AppState.allCountiesWeatherData[id] = { error: true, name: parsed.town, parentCounty: parsed.county };
    }
  } catch (e) {
    console.error('Failed loading township data:', e);
    updateDataBadge('連線失敗', 'error');
    AppState.allCountiesWeatherData[id] = { error: true, name: parsed.town, parentCounty: parsed.county };
  }
}

async function fetchCwaTownshipData(countyName) {
  const apis = COUNTY_TOWN_APIS[countyName];
  if (!apis) return false;
  
  const cacheKey = `cwa_town_cache_v12_${countyName}`;
  const cacheTimeKey = `cwa_town_cache_time_v12_${countyName}`;
  const cachedDataStr = localStorage.getItem(cacheKey);
  const cachedTimeStr = localStorage.getItem(cacheTimeKey);
  const now = new Date().getTime();
  
  if (!shouldBypassCache() && cachedDataStr && cachedTimeStr && (now - parseInt(cachedTimeStr)) < 600000) {
    try {
      const parsedTowns = JSON.parse(cachedDataStr);
      
      // Validate township cache integrity
      const towns = Object.values(parsedTowns);
      const sampleTown = towns.find(t => t && t.current && !t.error);
      const isCacheValid = sampleTown && 
                           sampleTown.current.temp !== undefined && 
                           sampleTown.current.temp !== null && 
                           !isNaN(sampleTown.current.temp) && 
                           sampleTown.current.desc !== undefined;
      
      if (isCacheValid) {
        console.log(`Successfully loaded valid township weather cache for ${countyName}`);
        // Re-apply real-time observation overrides even from cached township data
        for (const [fullId, townData] of Object.entries(parsedTowns)) {
          if (townData && townData.current) {
            applyObservationToCurrent(townData.current, countyName, townData.name);
          }
        }
        Object.assign(AppState.allCountiesWeatherData, parsedTowns);
        return true;
      } else {
        console.warn(`Corrupted/incomplete township cache detected for ${countyName}. Bypassing and clearing cache.`);
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(cacheTimeKey);
      }
    } catch (e) {
      console.warn(`Failed parsing township cache for ${countyName}. Clearing corrupted keys.`, e);
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(cacheTimeKey);
    }
  }
  
  console.log(`Fetching township data for ${countyName} from CWA API...`);
  let baseUrl = 'https://opendata.cwa.gov.tw';
  let queryParams = `?format=JSON&_t=${Date.now()}`;
  
  if (CLOUDFLARE_PROXY_URL) {
    baseUrl = CLOUDFLARE_PROXY_URL.trim().replace(/\/$/, '');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }
    if (AppState.apiKey) {
      queryParams += `&Authorization=${AppState.apiKey}`;
    }
  } else if (AppState.apiKey) {
    queryParams += `&Authorization=${AppState.apiKey}`;
  } else {
    return false;
  }
  
  try {
    const res3 = await fetch(`${baseUrl}/api/v1/rest/datastore/${apis[3]}${queryParams}`);
    if (!res3.ok) throw new Error('Township 3d API status ' + res3.status);
    const data3 = await res3.json();
    
    // Add debugging logs for JSON structure
    console.log('data3 keys:', Object.keys(data3));
    if (data3.records) {
      console.log('data3.records keys:', Object.keys(data3.records));
      if (data3.records.locations) {
        console.log('data3 locations length:', data3.records.locations.length);
        if (data3.records.locations[0]) {
          console.log('data3 locations[0] keys:', Object.keys(data3.records.locations[0]));
          console.log('data3 location array length:', data3.records.locations[0].location ? data3.records.locations[0].location.length : (data3.records.locations[0].locations ? data3.records.locations[0].locations.length : 'no location array'));
        }
      } else if (data3.records.location) {
        console.log('data3.records.location length:', data3.records.location.length);
      }
    }
    
    const res7 = await fetch(`${baseUrl}/api/v1/rest/datastore/${apis[7]}${queryParams}`);
    if (!res7.ok) throw new Error('Township 7d API status ' + res7.status);
    const data7 = await res7.json();
    
    const parsedTowns = parseTownshipCwaResponse(countyName, data3, data7);
    console.log('Parsed towns output count:', Object.keys(parsedTowns).length);
    
    if (Object.keys(parsedTowns).length > 0) {
      Object.assign(AppState.allCountiesWeatherData, parsedTowns);
      localStorage.setItem(cacheKey, JSON.stringify(parsedTowns));
      localStorage.setItem(cacheTimeKey, String(now));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed fetching township CWA:', err);
    return false;
  }
}

// Robustly extract CWA data values supporting county and detailed township formats
function getValueFromCwaArray(valArr, propertyName = '') {
  if (!valArr || valArr.length === 0) return '';
  
  const firstObj = valArr[0];
  
  // Case A: Standard county format with 'value' / 'Value' properties
  if (firstObj.value !== undefined || firstObj.Value !== undefined) {
    if (propertyName === 'WeatherCode' && valArr.length > 1) {
      return valArr[1].value !== undefined ? valArr[1].value : valArr[1].Value;
    }
    return firstObj.value !== undefined ? firstObj.value : firstObj.Value;
  }
  
  // Case B: Township detailed format with specific property keys (e.g. Temperature, RelativeHumidity, etc.)
  const keys = Object.keys(firstObj);
  
  if (propertyName === 'WeatherCode') {
    const codeKey = keys.find(k => k.toUpperCase() === 'WEATHERCODE');
    if (codeKey) return firstObj[codeKey];
  }
  if (propertyName === 'Weather') {
    const wxKey = keys.find(k => k.toUpperCase() === 'WEATHER');
    if (wxKey) return firstObj[wxKey];
  }
  
  const excludeKeys = ['MEASURES', 'WEATHERCODE', 'COMFORTINDEXDESCRIPTION', 'BEAUFORTSCALE'];
  const primaryKey = keys.find(k => !excludeKeys.includes(k.toUpperCase()));
  if (primaryKey) return firstObj[primaryKey];
  
  if (keys.length > 0) return firstObj[keys[0]];
  return '';
}

function parseTownshipCwaResponse(countyName, data3, data7) {
  const parsed = {};
  
  // Support both Capitalized and lowercase keys dynamically
  let locations3 = [];
  if (data3 && data3.records) {
    const records = data3.records;
    const locsArray = records.locations || records.Locations;
    if (locsArray && locsArray[0]) {
      locations3 = locsArray[0].location || locsArray[0].Location || locsArray[0].locations || locsArray[0].Locations || [];
    } else {
      locations3 = records.location || records.Location || [];
    }
  }
  
  let locations7 = [];
  if (data7 && data7.records) {
    const records = data7.records;
    const locsArray = records.locations || records.Locations;
    if (locsArray && locsArray[0]) {
      locations7 = locsArray[0].location || locsArray[0].Location || locsArray[0].locations || locsArray[0].Locations || [];
    } else {
      locations7 = records.location || records.Location || [];
    }
  }
  
  for (const loc of locations3) {
    const townName = loc.LocationName || loc.locationName;
    if (!townName) continue;
    const fullId = countyName + townName;
    
    parsed[fullId] = {
      name: townName,
      parentCounty: countyName,
      isTownship: true,
      current: {},
      hourly: [],
      weekly: []
    };
    
    const elements = loc.WeatherElement || loc.weatherElement || [];
    const tempEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'T' || name === '溫度';
    });
    const rhEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'RH' || name === '相對濕度';
    });
    const wsEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'WS' || name === '風速';
    });
    const wxEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'WX' || name === '天氣現象';
    });
    const popEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'POP6H' || name === 'POP12H' || name === '3小時降雨機率' || name === '降雨機率';
    });
    
    const hourlyList = [];
    const tempTime = tempEl ? (tempEl.Time || tempEl.time) : null;
    const len = tempTime ? tempTime.length : 0;
    
    for (let i = 0; i < len; i++) {
      const timeItem = tempTime[i];
      if (!timeItem) continue;
      
      const timeStr = timeItem.DataTime || timeItem.dataTime;
      let formattedTimeStr = timeStr;
      if (typeof timeStr === 'string') {
        formattedTimeStr = timeStr.trim().replace(' ', 'T');
        if (!formattedTimeStr.includes('+') && !formattedTimeStr.includes('Z')) {
          formattedTimeStr += '+08:00';
        }
      }
      const timeVal = new Date(formattedTimeStr);
      
      // Filter out past intervals (older than 2.5 hours ago) to keep the timeline aligned with the current hour
      if (timeVal.getTime() < new Date().getTime() - 2.5 * 60 * 60 * 1000) {
        continue;
      }
      
      const valArr = timeItem.ElementValue || timeItem.elementValue;
      const temp = parseFloat(getValueFromCwaArray(valArr));
      if (isNaN(temp)) continue;
      
      let humidity = 70;
      if (rhEl) {
        const rhTime = rhEl.Time || rhEl.time;
        if (rhTime) {
          const rhItem = rhTime.find(item => {
            const tStr = item.DataTime || item.dataTime || item.StartTime || item.startTime;
            return tStr && new Date(tStr).getTime() === timeVal.getTime();
          });
          const rhValArr = rhItem ? (rhItem.ElementValue || rhItem.elementValue) : null;
          if (rhValArr) {
            humidity = parseInt(getValueFromCwaArray(rhValArr)) || 70;
          }
        }
      }
      
      let wind = 2;
      if (wsEl) {
        const wsTime = wsEl.Time || wsEl.time;
        if (wsTime) {
          const wsItem = wsTime.find(item => {
            const tStr = item.DataTime || item.dataTime || item.StartTime || item.startTime;
            return tStr && new Date(tStr).getTime() === timeVal.getTime();
          });
          const wsValArr = wsItem ? (wsItem.ElementValue || wsItem.elementValue) : null;
          if (wsValArr) {
            const wsVal = getValueFromCwaArray(wsValArr);
            const wsInt = parseInt(wsVal) || 0;
            if (wsInt <= 1) wind = 0;
            else if (wsInt <= 3) wind = 1;
            else if (wsInt <= 5) wind = 2;
            else if (wsInt <= 8) wind = 3;
            else wind = 4;
          }
        }
      }
      
      let wx = '多雲';
      let wxValue = '2';
      if (wxEl) {
        const wxTime = wxEl.Time || wxEl.time;
        if (wxTime) {
          const wxItem = wxTime.find(item => {
            const startStr = item.StartTime || item.startTime || item.DataTime || item.dataTime;
            if (!startStr) return false;
            let formattedStartStr = startStr;
            if (typeof startStr === 'string') {
              formattedStartStr = startStr.trim().replace(' ', 'T');
              if (!formattedStartStr.includes('+') && !formattedStartStr.includes('Z')) {
                formattedStartStr += '+08:00';
              }
            }
            const start = new Date(formattedStartStr);
            const endStr = item.EndTime || item.endTime;
            let formattedEndStr = endStr;
            if (typeof endStr === 'string') {
              formattedEndStr = endStr.trim().replace(' ', 'T');
              if (!formattedEndStr.includes('+') && !formattedEndStr.includes('Z')) {
                formattedEndStr += '+08:00';
              }
            }
            const end = formattedEndStr ? new Date(formattedEndStr) : new Date(start.getTime() + 3 * 3600000);
            return timeVal >= start && timeVal < end;
          });
          const wxValArr = wxItem ? (wxItem.ElementValue || wxItem.elementValue) : null;
          if (wxValArr) {
            wx = getValueFromCwaArray(wxValArr, 'Weather') || '多雲';
            wxValue = getValueFromCwaArray(wxValArr, 'WeatherCode') || '2';
          }
        }
      }
      
      let rainProb = 0;
      if (popEl) {
        const popTime = popEl.Time || popEl.time;
        if (popTime) {
          const popMatch = popTime.find(p => {
            const startStr = p.StartTime || p.startTime || p.DataTime || p.dataTime;
            let formattedStartStr = startStr;
            if (typeof startStr === 'string') {
              formattedStartStr = startStr.trim().replace(' ', 'T');
              if (!formattedStartStr.includes('+') && !formattedStartStr.includes('Z')) {
                formattedStartStr += '+08:00';
              }
            }
            const start = new Date(formattedStartStr);
            const endStr = p.EndTime || p.endTime;
            let formattedEndStr = endStr;
            if (typeof endStr === 'string') {
              formattedEndStr = endStr.trim().replace(' ', 'T');
              if (!formattedEndStr.includes('+') && !formattedEndStr.includes('Z')) {
                formattedEndStr += '+08:00';
              }
            }
            const end = formattedEndStr ? new Date(formattedEndStr) : new Date(start.getTime() + 6 * 3600000);
            return timeVal >= start && timeVal < end;
          });
          const popValArr = popMatch ? (popMatch.ElementValue || popMatch.elementValue) : null;
          if (popValArr) {
            rainProb = parseInt(getValueFromCwaArray(popValArr)) || 0;
          }
        }
      }
      
      const twHour = getTaiwanHour(timeVal);
      let icon = mapWxToIcon(wxValue);
      if (isNightTime(fullId, timeVal) && icon === 'sunny') {
        icon = 'night';
      }
      hourlyList.push({
        time: twHour + ':00',
        displayTime: formatHourlyLabel(timeVal),
        temp: temp,
        humidity: humidity,
        windGrade: wind,
        desc: wx,
        icon: icon,
        rainProb: isNaN(rainProb) ? 0 : rainProb
      });
    }
    
    parsed[fullId].hourly = hourlyList;
    
    if (hourlyList.length > 0) {
      const curH = hourlyList[0];
      parsed[fullId].current = {
        temp: curH.temp,
        tempMin: Math.min(...hourlyList.slice(0, 4).map(h=>h.temp)) || (curH.temp - 3),
        tempMax: Math.max(...hourlyList.slice(0, 4).map(h=>h.temp)) || (curH.temp + 3),
        desc: curH.desc,
        icon: curH.icon,
        rainProb: curH.rainProb,
        humidity: curH.humidity,
        windGrade: curH.windGrade,
        apparentTemp: calcApparentTemp(curH.temp, curH.humidity, windGradeToMs(curH.windGrade))
      };
      
      // Override with real-time local station observation if available
      applyObservationToCurrent(parsed[fullId].current, countyName, townName);
    }
  }
  
  for (const loc of locations7) {
    const townName = loc.LocationName || loc.locationName;
    if (!townName) continue;
    const fullId = countyName + townName;
    
    if (!parsed[fullId]) continue;
    
    const elements = loc.WeatherElement || loc.weatherElement || [];
    const minTEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'MINT' || name === '最低溫度';
    });
    const maxTEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'MAXT' || name === '最高溫度';
    });
    const wxEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'WX' || name === '天氣現象';
    });
    const popEl = elements.find(el => {
      const name = el.ElementName || el.elementName || '';
      return name === 'POP12H' || name === 'POP6H' || name === '12小時降雨機率' || name === '降雨機率';
    });
    
    const weeklyList = [];
    const minTTime = minTEl ? (minTEl.Time || minTEl.time) : null;
    const len = minTTime ? minTTime.length : 0;
    
    for (let i = 0; i < len; i += 2) {
      if (i >= len) break;
      
      const timeItem = minTTime[i];
      if (!timeItem) continue;
      
      const dateStr = timeItem.StartTime || timeItem.startTime || timeItem.DataTime || timeItem.dataTime;
      let formattedDateStr = dateStr;
      if (typeof dateStr === 'string') {
        formattedDateStr = dateStr.trim().replace(' ', 'T');
        if (!formattedDateStr.includes('+') && !formattedDateStr.includes('Z')) {
          formattedDateStr += '+08:00';
        }
      }
      const dateVal = new Date(formattedDateStr);
      
      const valArr = timeItem.ElementValue || timeItem.elementValue;
      const minT1 = parseFloat(getValueFromCwaArray(valArr));
      if (isNaN(minT1)) continue;
      
      let minT2 = minT1;
      if (i+1 < len && minTTime[i+1]) {
        const nextValArr = minTTime[i+1].ElementValue || minTTime[i+1].elementValue;
        if (nextValArr) {
          minT2 = parseFloat(getValueFromCwaArray(nextValArr)) || minT1;
        }
      }
      const minT = Math.min(minT1, minT2);
      
      let maxT1 = minT;
      if (maxTEl) {
        const maxTTime = maxTEl.Time || maxTEl.time;
        const maxTItem = maxTTime?.[i];
        const maxTValArr = maxTItem ? (maxTItem.ElementValue || maxTItem.elementValue) : null;
        if (maxTValArr) {
          maxT1 = parseFloat(getValueFromCwaArray(maxTValArr)) || minT;
        }
      }
      let maxT2 = maxT1;
      if (i+1 < len && maxTEl) {
        const maxTTime = maxTEl.Time || maxTEl.time;
        const nextMaxTItem = maxTTime?.[i+1];
        const nextMaxTValArr = nextMaxTItem ? (nextMaxTItem.ElementValue || nextMaxTItem.elementValue) : null;
        if (nextMaxTValArr) {
          maxT2 = parseFloat(getValueFromCwaArray(nextMaxTValArr)) || maxT1;
        }
      }
      const maxT = Math.max(maxT1, maxT2);
      
      let wxVal = '多雲';
      let wxIconVal = '2';
      if (wxEl) {
        const wxTime = wxEl.Time || wxEl.time;
        const wxItem = wxTime?.[i];
        const wxValArr = wxItem ? (wxItem.ElementValue || wxItem.elementValue) : null;
        if (wxValArr) {
          wxVal = getValueFromCwaArray(wxValArr, 'Weather') || '多雲';
          wxIconVal = getValueFromCwaArray(wxValArr, 'WeatherCode') || '2';
        }
      }
      
      let pop = 0;
      if (popEl) {
        const popTime = popEl.Time || popEl.time;
        const popItem1 = popTime?.[i];
        const popItem2 = popTime?.[i+1];
        let pop1 = 0;
        let pop2 = 0;
        if (popItem1) {
          const popValArr = popItem1.ElementValue || popItem1.elementValue;
          if (popValArr) pop1 = parseInt(getValueFromCwaArray(popValArr)) || 0;
        }
        if (popItem2) {
          const popValArr = popItem2.ElementValue || popItem2.elementValue;
          if (popValArr) pop2 = parseInt(getValueFromCwaArray(popValArr)) || 0;
        }
        pop = Math.max(pop1, pop2);
      }
      
      weeklyList.push({
        date: getTaiwanMonthAndDate(dateVal),
        dayOfWeek: formatWeeklyDayLabel(dateVal, i === 0),
        tempMin: minT,
        tempMax: maxT,
        desc: wxVal,
        icon: mapWxToIcon(wxIconVal),
        rainProb: pop
      });
    }
    
    parsed[fullId].weekly = weeklyList;
    if (weeklyList.length > 0) {
      parsed[fullId].current.tempMin = weeklyList[0].tempMin;
      parsed[fullId].current.tempMax = weeklyList[0].tempMax;
    }
  }
  
  return parsed;
}

function simulateRegionWeather(id) {
  const parsed = parseIdentifier(id);
  const now = new Date();
  const currentHour = now.getHours();
  
  let baseTemp = 23;
  let baseHumidity = 75;
  let rainProbBase = 30;
  
  const parentCountyObj = TAIWAN_COUNTIES.find(c => c.name === parsed.county) || TAIWAN_COUNTIES[0];
  if (parentCountyObj.region === '北部') {
    baseTemp -= 1; baseHumidity += 5; rainProbBase += 15;
  } else if (parentCountyObj.region === '南部') {
    baseTemp += 1.5; baseHumidity -= 5; rainProbBase -= 10;
  }
  
  const diurnalOffset = Math.sin((currentHour - 9) * Math.PI / 12) * 4;
  const curTemp = parseFloat((baseTemp + diurnalOffset + (Math.random() * 0.4 - 0.2)).toFixed(1));
  const minT = parseFloat((baseTemp - 3 + (Math.random() * 0.4 - 0.2)).toFixed(1));
  const maxT = parseFloat((baseTemp + 3 + (Math.random() * 0.4 - 0.2)).toFixed(1));
  
  let activeIcon = rainProbBase > 40 ? 'rainy' : 'sunny-cloudy';
  if (isNightTime(id, now)) {
    if (activeIcon === 'sunny' || activeIcon === 'sunny-cloudy') {
      activeIcon = 'night';
    }
  }

  const simulated = {
    name: parsed.type === 'town' ? parsed.town : parsed.county,
    parentCounty: parsed.type === 'town' ? parsed.county : '',
    isTownship: parsed.type === 'town',
    current: {
      temp: curTemp,
      tempMin: minT,
      tempMax: maxT,
      desc: rainProbBase > 40 ? '多雲短暫雨' : '晴時多雲',
      icon: activeIcon,
      rainProb: rainProbBase,
      humidity: baseHumidity,
      windGrade: 2,
      apparentTemp: curTemp,
      rain10Min: activeIcon === 'rainy' ? parseFloat((Math.random() * 0.5).toFixed(1)) : 0.0,
      rain1Hr: activeIcon === 'rainy' ? parseFloat((1.0 + Math.random() * 2.0).toFixed(1)) : 0.0,
      rainDaily: activeIcon === 'rainy' ? parseFloat((3.0 + Math.random() * 5.0).toFixed(1)) : 0.0
    },
    hourly: [],
    weekly: []
  };
  
  for (let h = 0; h < 24; h++) {
    const forecastHour = (currentHour + h * 3) % 24;
    const forecastDate = new Date();
    forecastDate.setHours(currentHour + h * 3);
    const offset = Math.sin((forecastHour - 9) * Math.PI / 12) * 4;
    
    let hIcon = rainProbBase > 40 ? 'rainy' : 'sunny-cloudy';
    if (isNightTime(id, forecastDate)) {
      if (hIcon === 'sunny' || hIcon === 'sunny-cloudy') {
        hIcon = 'night';
      }
    }
    
    simulated.hourly.push({
      time: `${forecastHour}:00`,
      displayTime: formatHourlyLabel(forecastDate),
      temp: parseFloat((baseTemp + offset + (Math.random() * 0.6 - 0.3)).toFixed(1)),
      humidity: baseHumidity,
      windGrade: 2,
      desc: rainProbBase > 40 ? '短暫雨' : '多雲',
      icon: hIcon,
      rainProb: rainProbBase
    });
  }
  
  const weekdays = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  for (let d = 0; d < 7; d++) {
    const dayDate = new Date();
    dayDate.setDate(now.getDate() + d);
    simulated.weekly.push({
      date: `${dayDate.getMonth()+1}/${dayDate.getDate()}`,
      dayOfWeek: d === 0 ? '今天' : weekdays[dayDate.getDay()],
      tempMin: parseFloat((minT + Math.sin(d) + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      tempMax: parseFloat((maxT + Math.cos(d) + (Math.random() * 0.4 - 0.2)).toFixed(1)),
      desc: '多雲時晴',
      icon: 'sunny-cloudy',
      rainProb: 15
    });
  }
  
  AppState.allCountiesWeatherData[id] = simulated;
}

// --------------------------------------------------------------------------
// 11. Custom Added Regions Search bar & Storage
// --------------------------------------------------------------------------
function initSearch() {
  initSearchIndex();
  const searchInput = document.getElementById('search-input');
  const clearBtn = document.getElementById('btn-search-clear');
  const dropdown = document.getElementById('search-results');
  
  searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim().replace('台', '臺');
    
    if (val === '') {
      clearBtn.style.display = 'none';
      dropdown.style.display = 'none';
      return;
    }
    
    clearBtn.style.display = 'block';
    
    // Filter matching counties & townships from SearchIndex
    const matches = SearchIndex.filter(item => 
      item.searchTokens.includes(val) || 
      item.displayName.includes(val) ||
      item.name.includes(val)
    ).slice(0, 10); // Limit to top 10 results for visual excellence
    
    renderSearchResults(matches);
  });
  
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    dropdown.style.display = 'none';
  });
  
  // Hide dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      dropdown.style.display = 'none';
    }
  });
}

function renderSearchResults(matches) {
  const dropdown = document.getElementById('search-results');
  dropdown.innerHTML = '';
  
  if (matches.length === 0) {
    dropdown.innerHTML = `<div class="search-result-item empty-result">找不到對應的縣市或鄉鎮</div>`;
  } else {
    matches.forEach(item => {
      const el = document.createElement('div');
      el.className = 'search-result-item';
      el.textContent = item.displayName;
      
      el.addEventListener('click', () => {
        const identifier = item.type === 'town' ? `${item.parent}${item.name}` : item.name;
        addCustomRegion(identifier);
        document.getElementById('search-input').value = '';
        document.getElementById('btn-search-clear').style.display = 'none';
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(el);
    });
  }
  
  dropdown.style.display = 'block';
}

function addCustomRegion(identifier) {
  if (AppState.addedRegions.includes(identifier)) {
    const friendlyName = formatFriendlyName(identifier);
    alert(`${friendlyName} 已經在自選追蹤清單中囉！`);
    return;
  }
  
  AppState.addedRegions.push(identifier);
  localStorage.setItem('cwa_added_regions', JSON.stringify(AppState.addedRegions));
  
  // Dynamic fetch and load before render
  loadWeatherForRegion(identifier).then(() => {
    renderAddedRegionsList();
  });
}

// Global scope bindings for inline onclick events in list items
window.deleteCustomRegion = function(countyName) {
  AppState.addedRegions = AppState.addedRegions.filter(name => name !== countyName);
  localStorage.setItem('cwa_added_regions', JSON.stringify(AppState.addedRegions));
  renderAddedRegionsList();
};

// --------------------------------------------------------------------------
// 12. Settings Panel Modal Handler
// --------------------------------------------------------------------------
function initSettings() {
  const modal = document.getElementById('settings-modal-overlay');
  const settingsBtn = document.getElementById('btn-settings');
  const closeBtn = document.getElementById('btn-close-settings');
  const saveBtn = document.getElementById('btn-save-settings');
  const clearBtn = document.getElementById('btn-clear-settings');
  
  const apiKeyInput = document.getElementById('input-api-key');
  const toggleKeyBtn = document.getElementById('btn-toggle-key-visible');
  
  // Fill values from App State
  apiKeyInput.value = AppState.apiKey;
  
  settingsBtn.addEventListener('click', () => {
    modal.classList.add('active');
  });
  
  const closeModal = () => {
    modal.classList.remove('active');
  };
  
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  // Toggle password visibility
  toggleKeyBtn.addEventListener('click', () => {
    if (apiKeyInput.type === 'password') {
      apiKeyInput.type = 'text';
      toggleKeyBtn.textContent = '隱藏';
    } else {
      apiKeyInput.type = 'password';
      toggleKeyBtn.textContent = '顯示';
    }
  });
  
  // Save handler
  saveBtn.addEventListener('click', () => {
    const rawKey = apiKeyInput.value.trim();
    
    AppState.apiKey = rawKey;
    AppState.dataMode = 'live';
    
    localStorage.setItem('cwa_api_key', rawKey);
    localStorage.setItem('cwa_data_mode', 'live');
    
    // Wipe cache to force fresh pull with new settings
    clearAllWeatherCaches();
    
    closeModal();
    
    // Refresh board
    loadWeatherDashboard();
  });
  
  // Clear Key handler
  clearBtn.addEventListener('click', () => {
    apiKeyInput.value = '';
    AppState.apiKey = '';
    localStorage.removeItem('cwa_api_key');
    clearAllWeatherCaches();
    alert('金鑰與所有本地天氣快取已清除，請在「設定」中重新輸入以獲取即時資料。');
  });
}

// --------------------------------------------------------------------------
// 13. Dynamic SVG Injector Library
// --------------------------------------------------------------------------
function getAnimatedSvgCode(iconName, width = 64, height = 64) {
  let innerRef = '#svg-cloudy'; // Fallback
  let viewClass = 'cloudy';
  
  if (iconName === 'sunny') {
    innerRef = '#svg-sunny';
    viewClass = 'sunny';
  } else if (iconName === 'sunny-cloudy') {
    innerRef = '#svg-cloudy'; // Overlapping clouds
    viewClass = 'sunny-cloudy';
  } else if (iconName === 'cloudy') {
    innerRef = '#svg-cloudy';
    viewClass = 'cloudy';
  } else if (iconName === 'rainy') {
    innerRef = '#svg-rainy';
    viewClass = 'rainy';
  } else if (iconName === 'thunderstorm') {
    innerRef = '#svg-thunderstorm';
    viewClass = 'thunderstorm';
  } else if (iconName === 'windy') {
    innerRef = '#svg-windy';
    viewClass = 'windy';
  } else if (iconName === 'night') {
    innerRef = '#svg-night';
    viewClass = 'night';
  }
  
  return `
    <svg class="weather-icon-animated ${viewClass}" viewBox="0 0 64 64" width="${width}" height="${height}">
      <use href="${innerRef}" />
    </svg>
  `;
}

// Global scope bindings for drawer reload retry
window.retryDrawerLoad = function(id) {
  const container = document.getElementById('svg-chart-container');
  container.innerHTML = `<div class="loading-spinner" style="margin: 30px auto;"></div>`;
  
  loadWeatherForRegion(id).then(() => {
    openDrawerForecast(id);
    renderAddedRegionsList();
  });
};

// --------------------------------------------------------------------------
// 14. Typhoon Tracker Feature Logic (Leaflet.js + CWA O-A0041-001)
// --------------------------------------------------------------------------
AppState.typhoonMap = null;
AppState.typhoonMapLayers = [];
AppState.typhoonList = [];
AppState.selectedTyphoonId = null;

// Initialize the Typhoon Tracker tab dashboard
function initTyphoonTracker() {
  if (typeof L === 'undefined') {
    console.error('Leaflet library is missing or failed to load.');
    const mapContainer = document.getElementById('typhoon-map');
    if (mapContainer) {
      mapContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: var(--text-secondary); gap: 12px; padding: 20px;">
          <span style="font-size: 36px;">🗺️</span>
          <p style="font-weight: 600;">Leaflet.js 地圖庫未正確載入</p>
          <p style="font-size: 12px; color: var(--text-muted);">請檢查網路連線或稍後再試。</p>
        </div>
      `;
    }
    const statusText = document.getElementById('typhoon-status-text');
    if (statusText) statusText.textContent = '地圖載入失敗';
    return;
  }

  // Prevent Leaflet error "Map container is already initialized"
  if (AppState.typhoonMap !== null) {
    // Force Leaflet to recalculate container size in case tab switching corrupted dimensions
    setTimeout(() => { AppState.typhoonMap.invalidateSize(); }, 200);
    return; 
  }

  console.log('Initializing Leaflet.js Cyberpunk map...');
  
  // Initialize map centered at Taiwan waters with zoom level 5.5
  AppState.typhoonMap = L.map('typhoon-map', {
    zoomControl: true,
    minZoom: 3,
    maxZoom: 12
  }).setView([22.5, 123.5], 5.5);

  // Load CartoDB Dark Matter tile layer for gorgeous cyberpunk visual excellence
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
  }).addTo(AppState.typhoonMap);

  // Selector dropdown listener
  const selector = document.getElementById('typhoon-selector');
  if (selector) {
    selector.addEventListener('change', (e) => {
      onTyphoonSelected(e.target.value);
    });
  }

  // Map Engine Toggle Buttons Listeners
  const btnLeaflet = document.getElementById('btn-map-leaflet');
  const btnWindy = document.getElementById('btn-map-windy');
  const leafletMapContainer = document.getElementById('typhoon-map');
  const windyMapContainer = document.getElementById('windy-map-container');
  const windyIframe = document.getElementById('windy-iframe');

  if (btnLeaflet && btnWindy && leafletMapContainer && windyMapContainer && windyIframe) {
    btnLeaflet.addEventListener('click', () => {
      btnLeaflet.classList.add('active');
      btnWindy.classList.remove('active');
      leafletMapContainer.style.display = 'block';
      windyMapContainer.style.display = 'none';
      // Force Leaflet to recalculate container size when switching back
      if (AppState.typhoonMap) {
        setTimeout(() => { AppState.typhoonMap.invalidateSize(); }, 50);
      }
    });

    btnWindy.addEventListener('click', () => {
      btnWindy.classList.add('active');
      btnLeaflet.classList.remove('active');
      leafletMapContainer.style.display = 'none';
      windyMapContainer.style.display = 'block';
      
      // Load Windy Embed iframe if it hasn't been loaded yet
      if (!windyIframe.src || windyIframe.src === 'about:blank' || windyIframe.getAttribute('src') === '') {
        console.log('Loading live Windy interactive wind map embed...');
        // Official free Windy embed URL centered around Taiwan waters (lat: 22.5, lon: 123.5) with wind overlay and forecast pressure overlays
        windyIframe.src = 'https://embed.windy.com/embed2.html?lat=22.5&lon=123.5&zoom=5&level=surface&overlay=wind&menu=&message=&marker=&calendar=now&pressure=true&type=map&location=coordinates&metricWind=kt&metricTemp=default&radarRange=-1';
      }
    });
  }

  // Load Typhoon Data
  loadTyphoonDashboardData();
}

// Fetch live typhoon numeric forecast coordinates
// Fetch live typhoon numeric forecast coordinates
async function loadTyphoonDashboardData() {
  const loader = document.getElementById('typhoon-map-loader');
  const pulseDot = document.getElementById('typhoon-pulse-dot');
  const statusText = document.getElementById('typhoon-status-text');

  if (loader) {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }
  if (statusText) statusText.textContent = '載入即時颱風資料...';

  // Apply caching logic to prevent CWA rate-limiting (30 Minutes Cache)
  const cacheKey = 'cwa_typhoon_cache_v4';
  const cacheTimeKey = 'cwa_typhoon_cache_time_v4';
  const cachedDataStr = localStorage.getItem(cacheKey);
  const cachedTimeStr = localStorage.getItem(cacheTimeKey);
  const now = new Date().getTime();

  if (!shouldBypassCache() && cachedDataStr && cachedTimeStr && (now - parseInt(cachedTimeStr)) < 1800000) {
    try {
      const parsedData = JSON.parse(cachedDataStr);
      if (Array.isArray(parsedData)) {
        if (parsedData.length > 0) {
          console.log('Retrieved active typhoons from local storage cache.');
          AppState.typhoonList = parsedData;
          populateTyphoonSelector();
          if (pulseDot) pulseDot.className = 'pulse-dot';
          if (statusText) statusText.textContent = '即時氣象署資料';
          hideTyphoonLoader();
          return;
        } else {
          setupEmptyTyphoonState();
          return;
        }
      }
    } catch (e) {
      console.warn('Failed parsing typhoon cache.', e);
    }
  }

  // Cache expired or missing, pull from CWA
  console.log('Fetching live CWA typhoon numerical path data (W-C0034-005)...');
  
  let baseUrl = 'https://opendata.cwa.gov.tw';
  let queryParams = `?format=JSON&_t=${Date.now()}`;
  
  if (CLOUDFLARE_PROXY_URL) {
    baseUrl = CLOUDFLARE_PROXY_URL.trim().replace(/\/$/, '');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }
    if (AppState.apiKey) {
      queryParams += `&Authorization=${AppState.apiKey}`;
    }
  } else if (AppState.apiKey) {
    queryParams += `&Authorization=${AppState.apiKey}`;
  } else {
    // No credentials, trigger empty state
    console.warn('No API key or Proxy available.');
    setupEmptyTyphoonState();
    return;
  }

  try {
    const res = await fetch(`${baseUrl}/api/v1/rest/datastore/W-C0034-005${queryParams}`);
    if (!res.ok) throw new Error('W-C0034-005 API status: ' + res.status);
    const data = await res.json();
    
    // Parse response
    const parsedList = parseCwaTyphoonResponse(data);
    
    if (parsedList && parsedList.length > 0) {
      AppState.typhoonList = parsedList;
      localStorage.setItem(cacheKey, JSON.stringify(parsedList));
      localStorage.setItem(cacheTimeKey, String(now));
      
      populateTyphoonSelector();
      if (pulseDot) pulseDot.className = 'pulse-dot';
      if (statusText) statusText.textContent = '即時氣象署資料';
    } else {
      // Empty data returned (no active typhoons currently)
      console.log('No active typhoons returned by CWA API.');
      localStorage.setItem(cacheKey, JSON.stringify([]));
      localStorage.setItem(cacheTimeKey, String(now));
      setupEmptyTyphoonState();
    }
  } catch (err) {
    console.error('Failed to fetch W-C0034-005:', err);
    setupEmptyTyphoonState();
  }
  
  hideTyphoonLoader();
}

function hideTyphoonLoader() {
  const loader = document.getElementById('typhoon-map-loader');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 400);
  }
}

// Set up clean empty state when there are no active typhoons (Simulation removed)
function setupEmptyTyphoonState() {
  const pulseDot = document.getElementById('typhoon-pulse-dot');
  const statusText = document.getElementById('typhoon-status-text');

  if (pulseDot) pulseDot.className = 'pulse-dot'; // Standard green pulse
  if (statusText) statusText.textContent = '現在西北太平洋無颱風';

  AppState.typhoonList = [];
  
  const selector = document.getElementById('typhoon-selector');
  if (selector) {
    selector.innerHTML = '<option value="">目前無活躍颱風</option>';
  }
  
  const nameTitle = document.getElementById('typhoon-name-title');
  const classBadge = document.getElementById('typhoon-class-badge');
  const pressureEl = document.getElementById('typhoon-pressure');
  const maxWindEl = document.getElementById('typhoon-max-wind');
  const gustWindEl = document.getElementById('typhoon-gust-wind');
  const radiusEl = document.getElementById('typhoon-storm-radius');
  const radius10El = document.getElementById('typhoon-storm-radius-10');

  if (nameTitle) nameTitle.textContent = "目前無活躍颱風";
  if (classBadge) classBadge.textContent = "目前西北太平洋無活躍的颱風威脅";
  if (pressureEl) pressureEl.textContent = "--";
  if (maxWindEl) maxWindEl.textContent = "-- m/s";
  if (gustWindEl) gustWindEl.textContent = "-- m/s";
  if (radiusEl) radiusEl.textContent = "-- km";
  if (radius10El) radius10El.textContent = "-- km";

  const tbody = document.getElementById('typhoon-forecast-tbody');
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">目前無活躍的颱風資料</td></tr>';
  }

  // Clear map layers
  if (AppState.typhoonMap && AppState.typhoonMapLayers) {
    AppState.typhoonMapLayers.forEach(layer => {
      if (AppState.typhoonMap.hasLayer(layer)) {
        AppState.typhoonMap.removeLayer(layer);
      }
    });
    AppState.typhoonMapLayers = [];
  }

  hideTyphoonLoader();
}

// Populate the select dropdown selector
function populateTyphoonSelector() {
  const selector = document.getElementById('typhoon-selector');
  if (!selector) return;

  selector.innerHTML = '';
  
  AppState.typhoonList.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id;
    opt.textContent = `${t.nameZh} (${t.nameEn})`;
    selector.appendChild(opt);
  });

  // Default to first item
  if (AppState.typhoonList.length > 0) {
    const defaultId = AppState.typhoonList[0].id;
    selector.value = defaultId;
    onTyphoonSelected(defaultId);
  }
}

// Selector change handler
// Selector change handler
// Beaufort Wind Scale Converter (蒲福風級轉換器)
function getBeaufortScale(ws) {
  if (ws < 0.3) return 0;
  if (ws < 1.6) return 1;
  if (ws < 3.4) return 2;
  if (ws < 5.5) return 3;
  if (ws < 8.0) return 4;
  if (ws < 10.8) return 5;
  if (ws < 13.9) return 6;
  if (ws < 17.2) return 7;
  if (ws < 20.8) return 8;
  if (ws < 24.5) return 9;
  if (ws < 28.5) return 10;
  if (ws < 32.7) return 11;
  if (ws < 37.0) return 12;
  if (ws < 41.5) return 13;
  if (ws < 46.2) return 14;
  if (ws < 51.0) return 15;
  if (ws < 56.1) return 16;
  return 17;
}

// Render dynamic 5-day CWA forecast table rows
function renderForecastTable(typhoon) {
  const tbody = document.getElementById('typhoon-forecast-tbody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  const cwaTrack = typhoon.tracks['CWA'];
  if (!cwaTrack || cwaTrack.length <= 1) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 20px; color: var(--text-muted);">暫無未來預估數據</td></tr>';
    return;
  }
  
  // Loop through future forecast points (from index 1 onwards)
  for (let i = 1; i < cwaTrack.length; i++) {
    const pt = cwaTrack[i];
    const tr = document.createElement('tr');
    tr.style.borderBottom = '1px solid rgba(255,255,255,0.05)';
    tr.style.transition = 'background 0.2s';
    
    // Highlight rows slightly on hover
    tr.addEventListener('mouseenter', () => { tr.style.background = 'rgba(255,255,255,0.02)'; });
    tr.addEventListener('mouseleave', () => { tr.style.background = 'transparent'; });
    
    const timeDisplay = pt.time.replace('預測 ', '');
    const ws = pt.windSpeed || 25;
    
    tr.innerHTML = `
      <td style="padding: 10px 4px; font-weight: 600; color: #FFF;">${timeDisplay}</td>
      <td style="padding: 10px 4px;">北緯 ${pt.lat.toFixed(1)}°<br>東經 ${pt.lon.toFixed(1)}°</td>
      <td style="padding: 10px 4px; color: var(--color-accent); font-weight: 500;">${pt.pressure} hPa</td>
      <td style="padding: 10px 4px; font-weight: 500; color: #FFF;">${ws} m/s<br><span style="color: var(--text-muted); font-size: 10px;">(${getBeaufortScale(ws)}級風)</span></td>
      <td style="padding: 10px 4px;">${pt.radius} km</td>
    `;
    tbody.appendChild(tr);
  }
}

function onTyphoonSelected(id) {
  AppState.selectedTyphoonId = id;
  const t = AppState.typhoonList.find(item => item.id === id);
  if (!t) return;

  // Render stats cards
  document.getElementById('typhoon-name-title').textContent = `${t.nameZh} (${t.nameEn})`;
  document.getElementById('typhoon-class-badge').textContent = t.classZh;
  document.getElementById('typhoon-pressure').textContent = t.pressure;
  document.getElementById('typhoon-max-wind').textContent = t.maxWind;
  document.getElementById('typhoon-gust-wind').textContent = t.gustWind;
  document.getElementById('typhoon-storm-radius').textContent = t.stormRadius;
  document.getElementById('typhoon-storm-radius-10').textContent = t.stormRadius10;

  // Render dynamic 5-day CWA forecast table
  renderForecastTable(t);

  // Render paths on Leaflet
  renderSelectedTyphoonTrack();
}

// Multi-agency route divergence calculations were removed to keep the focus solely on the CWA official track.

// Clean old layers and draw glowing polylines, storm circles, and pulsing nodes
function renderSelectedTyphoonTrack() {
  if (!AppState.typhoonMap || !AppState.selectedTyphoonId) return;

  // Clear existing tracks and markers
  AppState.typhoonMapLayers.forEach(layer => {
    if (AppState.typhoonMap.hasLayer(layer)) {
      AppState.typhoonMap.removeLayer(layer);
    }
  });
  AppState.typhoonMapLayers = [];

  const t = AppState.typhoonList.find(item => item.id === AppState.selectedTyphoonId);
  if (!t) return;

  const agencyStyles = {
    'CWA': { color: '#FFC107', name: '臺灣 CWA', visible: true }
  };

  const allLatLngs = [];

  Object.keys(t.tracks).forEach(agency => {
    const style = agencyStyles[agency];
    if (!style || !style.visible) return;

    const points = t.tracks[agency];
    if (!points || points.length === 0) return;

    const latlngs = points.map(pt => [pt.lat, pt.lon]);
    latlngs.forEach(ll => allLatLngs.push(ll));

    // 1. Draw glowing polyline
    const lineGlow = L.polyline(latlngs, {
      color: style.color,
      weight: 8,
      opacity: 0.15,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(AppState.typhoonMap);
    AppState.typhoonMapLayers.push(lineGlow);

    const line = L.polyline(latlngs, {
      color: style.color,
      weight: 3.2,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(AppState.typhoonMap);
    AppState.typhoonMapLayers.push(line);

    // 2. Draw nodes, storm circles (7-class wind radius) & popups
    points.forEach((pt, idx) => {
      // Draw storm circle (7級風暴風半徑, in meters)
      // Dynamic fill opacity based on maximum wind speed (higher wind speed = darker storm radius circle!)
      const ws = pt.windSpeed || 30;
      const fillOpacity = Math.min(0.24, 0.06 + (ws / 60) * 0.14);
      
      const stormCircle = L.circle([pt.lat, pt.lon], {
        radius: pt.radius * 1000, // km to meters
        color: style.color,
        weight: 1,
        opacity: 0.35,
        fillColor: style.color,
        fillOpacity: fillOpacity,
        dashArray: idx === 0 ? null : '4, 4'
      }).addTo(AppState.typhoonMap);
      AppState.typhoonMapLayers.push(stormCircle);

      // Create detailed popup content
      const popupHtml = `
        <div class="popup-container">
          <h4>${t.nameZh} (${t.nameEn}) - ${style.name}</h4>
          <span class="typhoon-badge-type" style="margin-top: 0; margin-bottom: 8px;">預測時段：${pt.time}</span>
          <div class="popup-details-list">
            <div class="popup-detail-row">
              <span class="popup-lbl">座標位置</span>
              <span class="popup-val">北緯 ${pt.lat.toFixed(1)}° / 東經 ${pt.lon.toFixed(1)}°</span>
            </div>
            <div class="popup-detail-row">
              <span class="popup-lbl">中心氣壓</span>
              <span class="popup-val">${pt.pressure} hPa</span>
            </div>
            <div class="popup-detail-row">
              <span class="popup-lbl">最大風速</span>
              <span class="popup-val">${pt.windSpeed} m/s (${getBeaufortScale(pt.windSpeed)}級風)</span>
            </div>
            <div class="popup-detail-row">
              <span class="popup-lbl">7級風暴風半徑</span>
              <span class="popup-val">${pt.radius} km</span>
            </div>
          </div>
        </div>
      `;
      stormCircle.bindPopup(popupHtml);

      // 3. Draw dot markers
      if (idx === 0) {
        // Pulser center marker for current/first coordinate
        const pulseIcon = L.divIcon({
          className: 'leaflet-typhoon-pulse-icon',
          html: `<div class="pulse-ring" style="border-color: ${style.color}"></div><div class="pulse-center" style="border-color: ${style.color}"></div>`,
          iconSize: [24, 24],
          iconAnchor: [0, 0]
        });
        
        const pulser = L.marker([pt.lat, pt.lon], { icon: pulseIcon }).addTo(AppState.typhoonMap);
        pulser.bindPopup(popupHtml);
        AppState.typhoonMapLayers.push(pulser);
      } else {
        // Standard forecast coordinate node
        const dot = L.circleMarker([pt.lat, pt.lon], {
          radius: 4,
          color: '#000',
          weight: 1.5,
          fillColor: style.color,
          fillOpacity: 1,
          opacity: 0.9
        }).addTo(AppState.typhoonMap);
        dot.bindPopup(popupHtml);
        AppState.typhoonMapLayers.push(dot);
      }
    });
  });

  // Auto zoom map to fit all tracks dynamically
  if (allLatLngs.length > 0) {
    const bounds = L.latLngBounds(allLatLngs);
    AppState.typhoonMap.fitBounds(bounds, { padding: [40, 40] });
  }
}

// Dynamic response parser for CWA Numerical Forecast API response
function parseCwaTyphoonResponse(data) {
  const parsed = [];
  try {
    const records = data.records;
    if (!records) return parsed;
    
    // Support 1: W-C0034-005 structure (CWA active tracking and forecasts)
    const tropicalCyclones = records.TropicalCyclones?.TropicalCyclone || records.tropicalCyclones?.tropicalCyclone;
    if (tropicalCyclones) {
      const cyArr = Array.isArray(tropicalCyclones) ? tropicalCyclones : [tropicalCyclones];
      cyArr.forEach(cy => {
        if (!cy) return;
        
        const nameZh = cy.CwaTyphoonName || cy.cwaTyphoonName || cy.typhoonName || cy.TyphoonName || '未命名颱風';
        const nameEn = cy.TyphoonName || cy.englishTyphoonName || cy.EnglishTyphoonName || 'UNKNOWN';
        const id = cy.CwaTyNo || cy.cwaTyNo || cy.typhoonNo || cy.TyphoonNo || String(Math.random());
        
        const item = {
          id: id,
          nameZh: nameZh,
          nameEn: nameEn,
          maxWind: '-- m/s',
          gustWind: '-- m/s',
          pressure: 990,
          stormRadius: '-- km',
          stormRadius10: '-- km',
          classZh: '輕度颱風',
          tracks: {}
        };
        
        // Parse AnalysisData (Historical fixes) and ForecastData (Forecast points)
        const analysisData = cy.AnalysisData || cy.analysisData;
        const forecastData = cy.ForecastData || cy.forecastData;
        
        const fixes = analysisData?.Fix || analysisData?.fix || [];
        const lastFix = fixes[fixes.length - 1];
        const forecastFixes = forecastData?.Fix || forecastData?.fix || [];
        
        if (lastFix) {
          const currentPointTimeStr = lastFix.DateTime || lastFix.dateTime || lastFix.fixTime || lastFix.FixTime;
          const currentPointTimeMs = currentPointTimeStr ? new Date(currentPointTimeStr).getTime() : 0;
          let maxTimeMs = currentPointTimeMs;

          const currentPoint = {
            lat: parseFloat(lastFix.CoordinateLatitude || lastFix.coordinateLatitude || lastFix.latitude || lastFix.Latitude),
            lon: parseFloat(lastFix.CoordinateLongitude || lastFix.coordinateLongitude || lastFix.longitude || lastFix.Longitude),
            time: '過去 (現在)',
            windSpeed: parseFloat(lastFix.MaxWindSpeed || lastFix.maxWindSpeed || 25),
            pressure: parseFloat(lastFix.Pressure || lastFix.pressure || 975),
            radius: parseFloat(lastFix.Circle15ms?.Radius || lastFix.circle15ms?.radius || lastFix.radiusOf7Velocity || 120),
            isHistorical: true
          };
          
          // Construct CWA Track
          const cwaTrack = [currentPoint];
          forecastFixes.forEach(pt => {
            const lat = parseFloat(pt.CoordinateLatitude || pt.coordinateLatitude || pt.latitude || pt.Latitude);
            const lon = parseFloat(pt.CoordinateLongitude || pt.coordinateLongitude || pt.longitude || pt.Longitude);
            if (isNaN(lat) || isNaN(lon)) return;
            
            const fHour = pt.ForecastHour || pt.forecastHour || '24';
            let timeLabel = `預測 +${fHour}h`;
            const initTime = pt.InitialTime || pt.initialTime;
            let targetTimeMs = 0;
            if (initTime) {
              const initDate = new Date(initTime);
              initDate.setHours(initDate.getHours() + parseInt(fHour));
              targetTimeMs = initDate.getTime();
              const m = initDate.getMonth() + 1;
              const d = initDate.getDate();
              const h = String(initDate.getHours()).padStart(2, '0');
              const min = String(initDate.getMinutes()).padStart(2, '0');
              timeLabel = `預測 +${fHour}h (${m}/${d} ${h}:${min})`;
            }
            if (targetTimeMs > maxTimeMs) {
              maxTimeMs = targetTimeMs;
            }
            
            cwaTrack.push({
              lat: lat,
              lon: lon,
              time: timeLabel,
              windSpeed: parseFloat(pt.MaxWindSpeed || pt.maxWindSpeed || 25),
              pressure: parseFloat(pt.Pressure || pt.pressure || 970),
              radius: parseFloat(pt.Circle15ms?.Radius || pt.circle15ms?.radius || pt.radiusOf7Velocity || 120)
            });
          });
          
          item.tracks['CWA'] = cwaTrack;
          
          // Integrate specifications into stats cards
          item.pressure = currentPoint.pressure;
          const wsNum = currentPoint.windSpeed;
          const gustNum = Math.round(wsNum * 1.25);
          item.maxWind = `${wsNum} m/s (${getBeaufortScale(wsNum)}級風)`;
          item.gustWind = `${gustNum} m/s (${getBeaufortScale(gustNum)}級風)`;
          item.stormRadius = `${currentPoint.radius} km`;
          item.stormRadius10 = `${Math.round(currentPoint.radius * 0.35)} km`;
          
          const ws = currentPoint.windSpeed;
          if (ws >= 51) item.classZh = '強烈颱風 (Category 4-5)';
          else if (ws >= 32.7) item.classZh = '中度颱風 (Category 2-3)';
          else item.classZh = '輕度颱風 (Category 1)';
          
          // Check if typhoon is active: has forecast points in the future,
          // OR was updated within the last 12 hours
          const nowMs = Date.now();
          const isActive = (maxTimeMs > nowMs) || (nowMs - currentPointTimeMs < 12 * 60 * 60 * 1000);
          if (isActive) {
            parsed.push(item);
          } else {
            console.log(`Filtering out expired/dissipated typhoon: ${item.nameZh} (${item.nameEn}), last updated at ${currentPointTimeStr}`);
          }
        }
      });
      
      if (parsed.length > 0) return parsed;
    }
    
    // Support 2: Fallback to original O-A0041-001 parser
    const cyclones = records.tropicalCyclones?.tropicalCyclone || records.tropicalCyclone || records.TropicalCyclones?.TropicalCyclone || [];
    const cyArr = Array.isArray(cyclones) ? cyclones : [cyclones];
    
    cyArr.forEach(cy => {
      if (!cy) return;
      
      const nameZh = cy.typhoonName || cy.TyphoonName || '未命名颱風';
      const nameEn = cy.englishTyphoonName || cy.EnglishTyphoonName || 'UNKNOWN';
      const id = cy.typhoonNo || cy.TyphoonNo || String(Math.random());
      
      const item = {
        id: id,
        nameZh: nameZh,
        nameEn: nameEn,
        maxWind: '-- m/s',
        gustWind: '-- m/s',
        pressure: 990,
        stormRadius: '-- km',
        stormRadius10: '-- km',
        classZh: '輕度颱風',
        tracks: {}
      };
      
      const forecastGroups = cy.analysisAndForecasts?.analysisAndForecast || cy.analysisAndForecast || cy.AnalysisAndForecasts?.AnalysisAndForecast || [];
      const fgArr = Array.isArray(forecastGroups) ? forecastGroups : [forecastGroups];
      
      let maxTimeMs = 0;
      let lastFixTimeMs = 0;
      
      fgArr.forEach(fg => {
        const agency = fg.forecastAgency || fg.ForecastAgency || 'CWA';
        const points = fg.forecastPoints?.forecastPoint || fg.forecastPoint || fg.ForecastPoints?.ForecastPoint || [];
        const ptArr = Array.isArray(points) ? points : [points];
        
        const trackPoints = [];
        ptArr.forEach(pt => {
          const lat = parseFloat(pt.latitude || pt.Latitude);
          const lon = parseFloat(pt.longitude || pt.Longitude);
          if (isNaN(lat) || isNaN(lon)) return;
          
          const timeRaw = pt.forecastTime || pt.ForecastTime || '';
          let timeLabel = timeRaw;
          let targetTimeMs = 0;
          if (timeRaw) {
            const dateObj = new Date(timeRaw);
            targetTimeMs = dateObj.getTime();
            if (timeRaw.includes('T')) {
              const hour = dateObj.getHours();
              const min = dateObj.getMinutes();
              timeLabel = `預測 +${hour}h (${dateObj.getMonth()+1}/${dateObj.getDate()} ${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')})`;
            }
          }
          if (targetTimeMs > maxTimeMs) {
            maxTimeMs = targetTimeMs;
          }
          if (trackPoints.length === 0 && targetTimeMs > 0) {
            lastFixTimeMs = targetTimeMs;
          }
          
          const wind = parseFloat(pt.maxWindSpeed || pt.MaxWindSpeed || 25);
          const pres = parseFloat(pt.centralPressure || pt.CentralPressure || 970);
          const radius = parseFloat(pt.radiusOf7Velocity || pt.RadiusOf7Velocity || 120);
          
          trackPoints.push({
            lat: lat,
            lon: lon,
            time: timeLabel,
            windSpeed: wind,
            pressure: pres,
            radius: radius
          });
        });
        
        if (trackPoints.length > 0) {
          item.tracks[agency] = trackPoints;
        }
      });
      
      const cwaTrack = item.tracks['CWA'] || Object.values(item.tracks)[0];
      if (cwaTrack && cwaTrack.length > 0) {
        const first = cwaTrack[0];
        item.pressure = first.pressure;
        const wsNum = first.windSpeed;
        const gustNum = Math.round(wsNum * 1.25);
        item.maxWind = `${wsNum} m/s (${getBeaufortScale(wsNum)}級風)`;
        item.gustWind = `${gustNum} m/s (${getBeaufortScale(gustNum)}級風)`;
        item.stormRadius = `${first.radius} km`;
        item.stormRadius10 = `${Math.round(first.radius * 0.35)} km`;
        
        const ws = first.windSpeed;
        if (ws >= 51) item.classZh = '強烈颱風 (Category 4-5)';
        else if (ws >= 32.7) item.classZh = '中度颱風 (Category 2-3)';
        else item.classZh = '輕度颱風 (Category 1)';
      }
      
      if (Object.keys(item.tracks).length > 0) {
        const nowMs = Date.now();
        const isActive = (maxTimeMs > nowMs) || (lastFixTimeMs > 0 && nowMs - lastFixTimeMs < 12 * 60 * 60 * 1000);
        if (isActive) {
          parsed.push(item);
        } else {
          console.log(`Filtering out expired/dissipated fallback typhoon: ${item.nameZh} (${item.nameEn})`);
        }
      }
    });
  } catch (e) {
    console.error('Failed parsing typhoon dataset response:', e);
  }
  return parsed;
}

// Bind to window to allow DOM elements or event listeners to access
window.initTyphoonTracker = initTyphoonTracker;

