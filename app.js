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
  
  currentLocationCounty: '臺北市中正區', // Default fallback
  currentWeather: {},            // Cached current weather for main display
  addedRegions: JSON.parse(localStorage.getItem('cwa_added_regions')) || ['新北市', '臺中市', '高雄市'],
  allCountiesWeatherData: {},    // Map of countyName -> parsed weather profile
  observations: [],              // Real-time automatic weather station observations
  
  activeTab: 'weather',          // 'weather' or 'radar'
  radarZoom: 1,
  radarPan: { x: 0, y: 0 },
  isDraggingRadar: false,
  dragStart: { x: 0, y: 0 }
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
  const weatherPane = document.getElementById('tab-content-weather');
  const radarPane = document.getElementById('tab-content-radar');
  
  const switchTab = (tab) => {
    AppState.activeTab = tab;
    if (tab === 'weather') {
      // Stop radar animation if playing
      if (typeof toggleRadarPlay === 'function' && radarPlayInterval) {
        toggleRadarPlay();
      }
      weatherTabBtn.classList.add('active');
      radarTabBtn.classList.remove('active');
      weatherPane.classList.add('active');
      radarPane.classList.remove('active');
    } else {
      weatherTabBtn.classList.remove('active');
      radarTabBtn.classList.add('active');
      weatherPane.classList.remove('active');
      radarPane.classList.add('active');
      loadRadarImage();
    }
  };
  
  weatherTabBtn.addEventListener('click', () => switchTab('weather'));
  radarTabBtn.addEventListener('click', () => switchTab('radar'));
}

// --------------------------------------------------------------------------
// 4. Geolocation Positioning & Mapping
// --------------------------------------------------------------------------
// Proactive Cache Validation to scan and remove any corrupted caches containing NaN/undefined/null
function validateAndCleanAllCaches() {
  console.log('Validating cache integrity in localStorage...');
  
  // 1. Validate county cache
  const countyCacheKey = 'cwa_weather_cache_v1';
  const countyTimeKey = 'cwa_weather_cache_time';
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
    if (key && key.startsWith('cwa_town_cache_') && !key.includes('_time_')) {
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
    const timeKey = key.replace('cwa_town_cache_', 'cwa_town_cache_time_');
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

// --------------------------------------------------------------------------
// 5. CWA API Fetching & LocalStorage Caching Client
// --------------------------------------------------------------------------
async function loadWeatherDashboard() {
  updateDataBadge('載入資料中...', 'loading');
  
  try {
    const dataSuccess = await fetchAllWeatherData();
    
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
  
  const cacheKey = 'cwa_weather_cache_v1';
  const cacheTimeKey = 'cwa_weather_cache_time';
  const cachedDataStr = localStorage.getItem(cacheKey);
  const cachedTimeStr = localStorage.getItem(cacheTimeKey);
  const now = new Date().getTime();
  
  // Use Cache if younger than 1 Hour (3,600,000 ms) and fully valid
  if (cachedDataStr && cachedTimeStr && (now - parseInt(cachedTimeStr)) < 3600000) {
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
        AppState.allCountiesWeatherData = parsedData;
        if (parsedData._observations) {
          AppState.observations = parsedData._observations;
          // Re-apply real-time observation desc/icon overrides even from cached data
          // (the cached forecast desc may not match actual sky conditions)
          for (const countyName of Object.keys(parsedData)) {
            if (countyName.startsWith('_')) continue;
            const countyData = parsedData[countyName];
            if (countyData && countyData.current) {
              applyObservationToCurrent(countyData.current, countyName);
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
  let queryParams = '?format=JSON';
  
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
    
    // 2. Fetch 72h forecast (F-D0047-089) - township level but we parse county summaries
    const res72h = await fetch(`${baseUrl}/api/v1/rest/datastore/F-D0047-089${queryParams}`);
    if (!res72h.ok) throw new Error('CWA 72h API returned status ' + res72h.status);
    const data72h = await res72h.json();
    
    // 3. Fetch 7-day forecast (F-D0047-091)
    const res7d = await fetch(`${baseUrl}/api/v1/rest/datastore/F-D0047-091${queryParams}`);
    if (!res7d.ok) throw new Error('CWA 7d API returned status ' + res7d.status);
    const data7d = await res7d.json();
    
    // 4. Fetch real-time automatic weather station observations (O-A0003-001)
    let observationData = null;
    try {
      console.log('Fetching CWA real-time weather observations (O-A0003-001)...');
      const resObs = await fetch(`${baseUrl}/api/v1/rest/datastore/O-A0003-001${queryParams}`);
      if (resObs.ok) {
        observationData = await resObs.json();
      }
    } catch (obsErr) {
      console.warn('Failed to fetch real-time observations, falling back to forecast values.', obsErr);
    }
    
    if (observationData && observationData.records) {
      AppState.observations = observationData.records.Station || observationData.records.station || [];
    }
    
    // Parse and integrate the three datasets
    const parsedData = integrateCwaDatasets(data36h, data72h, data7d);
    
    if (Object.keys(parsedData).length > 0) {
      parsedData._observations = AppState.observations;
      AppState.allCountiesWeatherData = parsedData;
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

// Helper to find a matching automatic weather station observation
function findObservation(countyName, townName = '') {
  if (!AppState.observations || AppState.observations.length === 0) return null;
  
  const normCounty = countyName.replace('台', '臺');
  const normTown = townName ? townName.replace('台', '臺') : '';
  
  // 1. Try to find exact township station match
  if (normTown) {
    const match = AppState.observations.find(obs => {
      const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
      const obsTown = (obs.GeoInfo?.TownName || obs.geoInfo?.townName || '').replace('台', '臺');
      const tempVal = obs.WeatherElement?.AirTemperature;
      const hasTemp = tempVal !== undefined && tempVal !== null && parseFloat(tempVal) !== -99 && tempVal !== -99 && tempVal !== '-99';
      return obsCounty === normCounty && obsTown === normTown && hasTemp;
    });
    if (match) return match;
  }
  
  // 2. Fallback: Find the first station in the county with a valid temperature
  const countyMatch = AppState.observations.find(obs => {
    const obsCounty = (obs.GeoInfo?.CountyName || obs.geoInfo?.countyName || '').replace('台', '臺');
    const tempVal = obs.WeatherElement?.AirTemperature;
    const hasTemp = tempVal !== undefined && tempVal !== null && parseFloat(tempVal) !== -99 && tempVal !== -99 && tempVal !== '-99';
    return obsCounty === normCounty && hasTemp;
  });
  return countyMatch;
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
  if (!obs || !obs.WeatherElement) return;
  
  // Collect all three values first so we can do a proper apparent temp calculation
  let obsTemp = null, obsRh = null, obsWs = null;
  
  const tempVal = obs.WeatherElement.AirTemperature;
  const temp = parseFloat(tempVal);
  if (!isNaN(temp) && temp > -50 && temp < 60 && tempVal !== -99 && tempVal !== '-99') {
    current.temp = parseFloat(temp.toFixed(1));
    obsTemp = temp;
  }
  
  const rhVal = obs.WeatherElement.RelativeHumidity;
  const rh = parseFloat(rhVal);
  if (!isNaN(rh) && rh >= 0 && rh <= 100 && rhVal !== -99 && rhVal !== '-99') {
    current.humidity = Math.round(rh);
    obsRh = rh;
  }
  
  const wsVal = obs.WeatherElement.WindSpeed; // m/s from observation
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
  const obsWeather = (obs.WeatherElement.Weather || '').trim();
  if (obsWeather && obsWeather !== '-99' && obsWeather.length > 0) {
    const obsIcon = mapObsWeatherToIcon(obsWeather);
    if (obsIcon) {
      current.icon = obsIcon;
      current.desc = obsWeather; // Actual observed text
      current._fromObservation = true;
    }
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
      
      merged[cName].current = {
        temp: Math.round((parseInt(minT) + parseInt(maxT)) / 2) || 26,
        tempMin: parseInt(minT) || 23,
        tempMax: parseInt(maxT) || 29,
        desc: wx.parameterName || '多雲',
        icon: mapWxToIcon(wx.parameterValue || '2'),
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
        const timeVal = new Date(timeStr);
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
        if (wxEl && wxEl.time && wxEl.time[i] && wxEl.time[i].elementValue) {
          wx = wxEl.time[i].elementValue[0] ? wxEl.time[i].elementValue[0].value : '多雲';
          wxValue = wxEl.time[i].elementValue[1] ? wxEl.time[i].elementValue[1].value : '2';
        }
        
        // Find rain pop matching this period
        let rainProb = 0;
        if (popEl && popEl.time) {
          // Find the time interval that spans our hour
          const popMatch = popEl.time.find(p => {
            const start = new Date(p.startTime || p.dataTime);
            const end = p.endTime ? new Date(p.endTime) : new Date(start.getTime() + 6*3600000);
            return timeVal >= start && timeVal <= end;
          });
          rainProb = (popMatch && popMatch.elementValue && popMatch.elementValue[0]) ? parseInt(popMatch.elementValue[0].value) : 0;
        }
        
        hourlyList.push({
          time: timeVal.getHours() + ':00',
          displayTime: formatHourlyLabel(timeVal),
          temp: temp,
          humidity: humidity,
          windGrade: wind,
          desc: wx,
          icon: mapWxToIcon(wxValue),
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
        const dateVal = new Date(dateStr);
        
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
        if (popEl && popEl.time && popEl.time[i] && popEl.time[i].elementValue && popEl.time[i].elementValue[0]) {
          pop = parseInt(popEl.time[i].elementValue[0].value) || 0;
        }
        
        weeklyList.push({
          date: `${dateVal.getMonth()+1}/${dateVal.getDate()}`,
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

function formatHourlyLabel(date) {
  const hour = date.getHours();
  if (hour === 0) return '半夜';
  if (hour === 12) return '中午';
  return `${hour}:00`;
}

function formatWeeklyDayLabel(date, isToday) {
  if (isToday) return '今天';
  const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
  return days[date.getDay()];
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
        apparentTemp: apparentTemp
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
      } else if (forecastHour >= 22 || forecastHour <= 5) {
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
  document.getElementById('current-weather-desc').textContent = cur.desc;
  document.getElementById('current-temp-range').textContent = `最高 ${Number(cur.tempMax).toFixed(1)}° | 最低 ${Number(cur.tempMin).toFixed(1)}°`;
  
  document.getElementById('current-apparent-temp').textContent = `${Number(cur.apparentTemp).toFixed(1)}°C`;
  document.getElementById('current-humidity').textContent = `${cur.humidity}%`;
  document.getElementById('current-wind-grade').textContent = `${cur.windGrade} 級`;
  document.getElementById('current-rain-prob').textContent = `${cur.rainProb}%`;
  
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
  } else if (iconType === 'night' || (iconType === 'sunny' && new Date().getHours() >= 18)) {
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
    card.className = 'region-card glass-panel';
    card.innerHTML = `
      <div class="region-card-left">
        <span class="region-card-name">${nameLabel}</span>
        <span class="region-card-meta">${badgeLabel} &bull; ${cur.desc} &bull; 降雨 ${cur.rainProb}%</span>
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
  
  // Chart dimensions
  const svgWidth = 680;
  const svgHeight = 160;
  const paddingX = 40;
  const paddingY = 30;
  
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
  
  // Render labels and interaction nodes
  points.forEach(p => {
    // Temperature above coordinate node
    svgCode += `<text x="${p.x}" y="${p.y - 12}" class="chart-label-temp">${Number(p.temp).toFixed(1)}°</text>`;
    
    // Coordinate circle point node
    svgCode += `<circle cx="${p.x}" cy="${p.y}" r="4" class="chart-point" />`;
    
    // Time label below bottom boundary
    svgCode += `<text x="${p.x}" y="${svgHeight - 10}" class="chart-label-time">${p.time}</text>`;
    
    // Rain Pop label if greater than 0%
    if (p.rainProb > 0) {
      svgCode += `<text x="${p.x}" y="${svgHeight - 24}" class="chart-label-rain">${p.rainProb}%</text>`;
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
        ${getAnimatedSvgCode(day.icon, 32, 32)}
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
  };
  
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

function openDrawerForecast(identifier) {
  AppState.activeRegionDetailed = identifier;
  const data = AppState.allCountiesWeatherData[identifier];
  
  const parsed = parseIdentifier(identifier);
  const title = parsed.type === 'town' ? `${parsed.county} ${parsed.town}` : parsed.county;
  
  // Set headers
  document.getElementById('drawer-region-title').textContent = title;
  
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
  radarImg.src = `https://www.cwa.gov.tw/Data/radar/CV1_TW_1000_forPreview.png${cacheBust}`;
  
  // Format current CWA standard update intervals (typically 10 min)
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const lastTenMin = Math.floor(now.getMinutes() / 10) * 10;
  timestampEl.textContent = `最後更新時間：${now.getHours()}:${pad(lastTenMin)}`;
}

// State for radar animation play
let radarPlayInterval = null;
let radarHistoryFrames = [];
let radarCurrentFrameIndex = 0;

// Dynamic UTC calculator for CWA historical radar images
function getRadarHistoryUrls() {
  const urls = [];
  const now = new Date();
  
  // Since CWA images take about 8 minutes to generate, let's offset by 8 minutes to be safe
  // now.getTime() is already UTC epoch milliseconds!
  const latestUtcMs = now.getTime() - (8 * 60 * 1000);
  
  // We fetch the past 6 intervals (representing 1 hour, each 10 mins apart)
  for (let i = 0; i < 6; i++) {
    const frameMs = latestUtcMs - (i * 10 * 60 * 1000);
    const frameDate = new Date(frameMs);
    
    // Round down to the nearest 10 minutes in UTC!
    const roundedMinutes = Math.floor(frameDate.getUTCMinutes() / 10) * 10;
    frameDate.setUTCMinutes(roundedMinutes);
    frameDate.setUTCSeconds(0);
    frameDate.setUTCMilliseconds(0);
    
    // Format YYYYMMDDHHMM in UTC
    const yyyy = frameDate.getUTCFullYear();
    const mm = String(frameDate.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(frameDate.getUTCDate()).padStart(2, '0');
    const hh = String(frameDate.getUTCHours()).padStart(2, '0');
    const mi = String(frameDate.getUTCMinutes()).padStart(2, '0');
    
    const timeStr = `${yyyy}${mm}${dd}${hh}${mi}`;
    const url = `https://www.cwa.gov.tw/Data/radar/CV1_3600_${timeStr}.png`;
    urls.push({ url, label: `${hh}:${mi} (UTC)` });
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
    
    // Display local time for user convenience (convert UTC frame label back to local +8)
    const [hh, mi] = frame.label.split(' ')[0].split(':');
    let localHour = (parseInt(hh) + 8) % 24;
    const formattedLocalTime = `${String(localHour).padStart(2, '0')}:${mi}`;
    
    timestampEl.textContent = `播放中：${formattedLocalTime}`;
    
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
  
  const cacheKey = `cwa_town_cache_${countyName}`;
  const cacheTimeKey = `cwa_town_cache_time_${countyName}`;
  const cachedDataStr = localStorage.getItem(cacheKey);
  const cachedTimeStr = localStorage.getItem(cacheTimeKey);
  const now = new Date().getTime();
  
  if (cachedDataStr && cachedTimeStr && (now - parseInt(cachedTimeStr)) < 3600000) {
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
  let queryParams = '?format=JSON';
  
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
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'T' || name.includes('溫度');
    });
    const rhEl = elements.find(el => {
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'RH' || name.includes('濕度');
    });
    const wsEl = elements.find(el => {
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'WS' || name.includes('風速');
    });
    const wxEl = elements.find(el => {
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'WX' || name.includes('天氣現象');
    });
    const popEl = elements.find(el => {
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'POP6H' || name === 'POP12H' || name.includes('降雨機率');
    });
    
    const hourlyList = [];
    const tempTime = tempEl ? (tempEl.Time || tempEl.time) : null;
    const len = tempTime ? tempTime.length : 0;
    
    for (let i = 0; i < len; i++) {
      const timeItem = tempTime[i];
      if (!timeItem) continue;
      
      const timeStr = timeItem.DataTime || timeItem.dataTime;
      const timeVal = new Date(timeStr);
      
      const valArr = timeItem.ElementValue || timeItem.elementValue;
      const temp = parseFloat(getValueFromCwaArray(valArr));
      if (isNaN(temp)) continue;
      
      let humidity = 70;
      if (rhEl) {
        const rhTime = rhEl.Time || rhEl.time;
        const rhItem = rhTime?.[i];
        const rhValArr = rhItem ? (rhItem.ElementValue || rhItem.elementValue) : null;
        if (rhValArr) {
          humidity = parseInt(getValueFromCwaArray(rhValArr)) || 70;
        }
      }
      
      let wind = 2;
      if (wsEl) {
        const wsTime = wsEl.Time || wsEl.time;
        const wsItem = wsTime?.[i];
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
      
      let wx = '多雲';
      let wxValue = '2';
      if (wxEl) {
        const wxTime = wxEl.Time || wxEl.time;
        const wxItem = wxTime?.[i];
        const wxValArr = wxItem ? (wxItem.ElementValue || wxItem.elementValue) : null;
        if (wxValArr) {
          wx = getValueFromCwaArray(wxValArr, 'Weather') || '多雲';
          wxValue = getValueFromCwaArray(wxValArr, 'WeatherCode') || '2';
        }
      }
      
      let rainProb = 0;
      if (popEl) {
        const popTime = popEl.Time || popEl.time;
        if (popTime) {
          const popMatch = popTime.find(p => {
            const start = new Date(p.StartTime || p.startTime || p.DataTime || p.dataTime);
            return timeVal >= start;
          });
          const popValArr = popMatch ? (popMatch.ElementValue || popMatch.elementValue) : null;
          if (popValArr) {
            rainProb = parseInt(getValueFromCwaArray(popValArr)) || 0;
          }
        }
      }
      
      hourlyList.push({
        time: timeVal.getHours() + ':00',
        displayTime: formatHourlyLabel(timeVal),
        temp: temp,
        humidity: humidity,
        windGrade: wind,
        desc: wx,
        icon: mapWxToIcon(wxValue),
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
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'MINT' || name.includes('最低溫度');
    });
    const maxTEl = elements.find(el => {
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'MAXT' || name.includes('最高溫度');
    });
    const wxEl = elements.find(el => {
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'WX' || name.includes('天氣現象');
    });
    const popEl = elements.find(el => {
      const name = (el.ElementName || el.elementName || '').toUpperCase();
      return name === 'POP12H' || name === 'POP6H' || name.includes('降雨機率');
    });
    
    const weeklyList = [];
    const minTTime = minTEl ? (minTEl.Time || minTEl.time) : null;
    const len = minTTime ? minTTime.length : 0;
    
    for (let i = 0; i < len; i += 2) {
      if (i >= len) break;
      
      const timeItem = minTTime[i];
      if (!timeItem) continue;
      
      const dateStr = timeItem.StartTime || timeItem.startTime || timeItem.DataTime || timeItem.dataTime;
      const dateVal = new Date(dateStr);
      
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
        const popItem = popTime?.[i];
        const popValArr = popItem ? (popItem.ElementValue || popItem.elementValue) : null;
        if (popValArr) {
          pop = parseInt(getValueFromCwaArray(popValArr)) || 0;
        }
      }
      
      weeklyList.push({
        date: `${dateVal.getMonth()+1}/${dateVal.getDate()}`,
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
  
  const simulated = {
    name: parsed.type === 'town' ? parsed.town : parsed.county,
    parentCounty: parsed.type === 'town' ? parsed.county : '',
    isTownship: parsed.type === 'town',
    current: {
      temp: curTemp,
      tempMin: minT,
      tempMax: maxT,
      desc: rainProbBase > 40 ? '多雲短暫雨' : '晴時多雲',
      icon: rainProbBase > 40 ? 'rainy' : 'sunny-cloudy',
      rainProb: rainProbBase,
      humidity: baseHumidity,
      windGrade: 2,
      apparentTemp: curTemp
    },
    hourly: [],
    weekly: []
  };
  
  for (let h = 0; h < 24; h++) {
    const forecastHour = (currentHour + h * 3) % 24;
    const forecastDate = new Date();
    forecastDate.setHours(currentHour + h * 3);
    const offset = Math.sin((forecastHour - 9) * Math.PI / 12) * 4;
    
    simulated.hourly.push({
      time: `${forecastHour}:00`,
      displayTime: formatHourlyLabel(forecastDate),
      temp: parseFloat((baseTemp + offset + (Math.random() * 0.6 - 0.3)).toFixed(1)),
      humidity: baseHumidity,
      windGrade: 2,
      desc: rainProbBase > 40 ? '短暫雨' : '多雲',
      icon: rainProbBase > 40 ? 'rainy' : 'sunny-cloudy',
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
    localStorage.removeItem('cwa_weather_cache_v1');
    localStorage.removeItem('cwa_weather_cache_time');
    
    closeModal();
    
    // Refresh board
    loadWeatherDashboard();
  });
  
  // Clear Key handler
  clearBtn.addEventListener('click', () => {
    apiKeyInput.value = '';
    AppState.apiKey = '';
    localStorage.removeItem('cwa_api_key');
    alert('金鑰已清除，請在「設定」中重新輸入以獲取即時資料。');
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
