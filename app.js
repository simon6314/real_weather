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
  { name: '台中市', english: 'Taichung', lat: 24.1477, lon: 120.6736, region: '中部' },
  { name: '台南市', english: 'Tainan', lat: 22.9997, lon: 120.2270, region: '南部' },
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
  { name: '台東縣', english: 'Taitung', lat: 22.7972, lon: 121.0772, region: '東部' },
  { name: '澎湖縣', english: 'Penghu', lat: 23.5711, lon: 119.5793, region: '離島' },
  { name: '金門縣', english: 'Kinmen', lat: 24.4482, lon: 118.3764, region: '離島' },
  { name: '連江縣', english: 'Matsu', lat: 26.1519, lon: 119.9392, region: '離島' }
];

// Pre-configured default key (Left empty for GitHub security - user can input in Settings modal)
const DEFAULT_API_KEY = '';

// Cloudflare Worker Proxy URL (Optional)
// If you deploy a Cloudflare Worker to proxy CWA API and hide your API key, paste its URL here.
// Example: 'https://taiwan-weather-proxy.yourname.workers.dev'
const CLOUDFLARE_PROXY_URL = 'https://wearther-proxy.simon6314.workers.dev';

// --------------------------------------------------------------------------
// 2. Application State Management
// --------------------------------------------------------------------------
const AppState = {
  apiKey: localStorage.getItem('cwa_api_key') || DEFAULT_API_KEY,
  dataMode: localStorage.getItem('cwa_data_mode') || 'auto', // 'auto' or 'simulation'
  isSimulationActive: false,
  
  currentLocationCounty: '臺北市', // Default fallback
  currentWeather: {},            // Cached current weather for main display
  addedRegions: JSON.parse(localStorage.getItem('cwa_added_regions')) || ['新北市', '台中市', '高雄市'],
  allCountiesWeatherData: {},    // Map of countyName -> parsed weather profile
  
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
function startupSequence() {
  updateDataBadge('定位中...', 'loading');
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const matchedCounty = getClosestTaiwanCounty(latitude, longitude);
        console.log(`GPS Location: (${latitude}, ${longitude}) matched to ${matchedCounty.name}`);
        AppState.currentLocationCounty = matchedCounty.name;
        
        // Load data for the matched location
        loadWeatherDashboard();
      },
      (error) => {
        console.warn('Geolocation failed or denied. Defaulting to Taipei City. Code:', error.code);
        AppState.currentLocationCounty = '臺北市';
        loadWeatherDashboard();
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  } else {
    AppState.currentLocationCounty = '臺北市';
    loadWeatherDashboard();
  }
}

// Find closest Taiwan county using basic 2D Euclidean distance
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

// --------------------------------------------------------------------------
// 5. CWA API Fetching & LocalStorage Caching Client
// --------------------------------------------------------------------------
async function loadWeatherDashboard() {
  updateDataBadge('載入資料中...', 'loading');
  
  try {
    const dataSuccess = await fetchAllWeatherData();
    
    if (dataSuccess) {
      AppState.isSimulationActive = false;
      updateDataBadge('即時氣象署資料', 'live');
    } else {
      AppState.isSimulationActive = true;
      triggerSimulationMode('CWA API 金鑰失效或連線中斷，已啟動高擬真模擬展示模式');
    }
  } catch (err) {
    console.error('Fatal load error:', err);
    AppState.isSimulationActive = true;
    triggerSimulationMode('系統連線錯誤，已自動啟動展示模擬模式');
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
  if (AppState.dataMode === 'simulation' || (!AppState.apiKey && !CLOUDFLARE_PROXY_URL)) {
    return false; // Force simulation
  }
  
  const cacheKey = 'cwa_weather_cache_v1';
  const cacheTimeKey = 'cwa_weather_cache_time';
  const cachedDataStr = localStorage.getItem(cacheKey);
  const cachedTimeStr = localStorage.getItem(cacheTimeKey);
  const now = new Date().getTime();
  
  // Use Cache if younger than 1 Hour (3,600,000 ms)
  if (cachedDataStr && cachedTimeStr && (now - parseInt(cachedTimeStr)) < 3600000) {
    try {
      console.log('Retrieved weather data from local storage cache.');
      AppState.allCountiesWeatherData = JSON.parse(cachedDataStr);
      return true;
    } catch (e) {
      console.warn('Failed parsing cache. Refreshing CWA API.');
    }
  }
  
  // Cache missing or expired, fetch fresh from CWA
  console.log('Fetching fresh weather data...');
  
  // Construct URLs dynamically to support Cloudflare Proxy
  let baseUrl = 'https://opendata.cwa.gov.tw';
  let queryParams = '?format=JSON';
  
  if (CLOUDFLARE_PROXY_URL) {
    baseUrl = CLOUDFLARE_PROXY_URL.trim().replace(/\/$/, ''); // Remove trailing slash
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl;
    }
  } else {
    queryParams += `&Authorization=${AppState.apiKey}`;
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
    
    // Parse and integrate the three datasets
    const parsedData = integrateCwaDatasets(data36h, data72h, data7d);
    
    if (Object.keys(parsedData).length > 0) {
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
    const locations36 = data36h.records.location || [];
    for (const loc of locations36) {
      const cName = normalizeCountyName(loc.locationName);
      if (!merged[cName]) continue;
      
      const elements = loc.weatherElement;
      const wx = elements.find(el => el.elementName === 'Wx')?.time[0]?.parameter || {};
      const pop = elements.find(el => el.elementName === 'PoP')?.time[0]?.parameter?.parameterName || '0';
      const minT = elements.find(el => el.elementName === 'MinT')?.time[0]?.parameter?.parameterName || '--';
      const maxT = elements.find(el => el.elementName === 'MaxT')?.time[0]?.parameter?.parameterName || '--';
      
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
    }
    
    // 2. Process 72h detailed data (F-D0047-089)
    const locations72 = data72h.records.locations[0].location || [];
    for (const loc of locations72) {
      const cName = normalizeCountyName(loc.locationName);
      if (!merged[cName]) continue;
      
      const elements = loc.weatherElement;
      const tempEl = elements.find(el => el.elementName === 'T');
      const rhEl = elements.find(el => el.elementName === 'RH');
      const wsEl = elements.find(el => el.elementName === 'WS'); // Wind speed
      const wxEl = elements.find(el => el.elementName === 'Wx');
      const popEl = elements.find(el => el.elementName === 'PoP6h') || elements.find(el => el.elementName === 'PoP12h');
      
      // Build Hourly (up to 24 intervals = 72 hours)
      const hourlyList = [];
      const len = tempEl ? tempEl.time.length : 0;
      
      for (let i = 0; i < len; i++) {
        const timeStr = tempEl.time[i].dataTime;
        const timeVal = new Date(timeStr);
        const temp = parseInt(tempEl.time[i].elementValue[0].value);
        const humidity = rhEl ? parseInt(rhEl.time[i].elementValue[0].value) : 70;
        
        let wind = 2;
        if (wsEl) {
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
        
        const wx = wxEl ? wxEl.time[i].elementValue[0].value : '多雲';
        const wxValue = wxEl ? wxEl.time[i].elementValue[1].value : '2';
        
        // Find rain pop matching this period
        let rainProb = 0;
        if (popEl) {
          // Find the time interval that spans our hour
          const popMatch = popEl.time.find(p => {
            const start = new Date(p.startTime || p.dataTime);
            const end = p.endTime ? new Date(p.endTime) : new Date(start.getTime() + 6*3600000);
            return timeVal >= start && timeVal <= end;
          });
          rainProb = popMatch ? parseInt(popMatch.elementValue[0].value) : 0;
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
        merged[cName].current.apparentTemp = curH.temp;
      }
    }
    
    // 3. Process 7-day data (F-D0047-091)
    const locations7d = data7d.records.locations[0].location || [];
    for (const loc of locations7d) {
      const cName = normalizeCountyName(loc.locationName);
      if (!merged[cName]) continue;
      
      const elements = loc.weatherElement;
      const minTEl = elements.find(el => el.elementName === 'MinT');
      const maxTEl = elements.find(el => el.elementName === 'MaxT');
      const wxEl = elements.find(el => el.elementName === 'Wx');
      const popEl = elements.find(el => el.elementName === 'PoP12h');
      
      const weeklyList = [];
      const len = minTEl ? minTEl.time.length : 0;
      
      // Weekly reports has morning/night subdivisions, we aggregate by day
      // time array lists: day 1 morning, day 1 night, day 2 morning, day 2 night...
      // We step by 2 to group days
      for (let i = 0; i < len; i += 2) {
        if (i >= len) break;
        
        const dateStr = minTEl.time[i].startTime;
        const dateVal = new Date(dateStr);
        
        const minT1 = parseInt(minTEl.time[i].elementValue[0].value);
        const minT2 = (i+1 < len) ? parseInt(minTEl.time[i+1].elementValue[0].value) : minT1;
        const minT = Math.min(minT1, minT2);
        
        const maxT1 = parseInt(maxTEl.time[i].elementValue[0].value);
        const maxT2 = (i+1 < len) ? parseInt(maxTEl.time[i+1].elementValue[0].value) : maxT1;
        const maxT = Math.max(maxT1, maxT2);
        
        const wxVal = wxEl ? wxEl.time[i].elementValue[0].value : '多雲';
        const wxIconVal = wxEl ? wxEl.time[i].elementValue[1].value : '2';
        
        let pop = 0;
        if (popEl) {
          const pop1 = popEl.time[i] ? parseInt(popEl.time[i].elementValue[0].value) : 0;
          const pop2 = (i+1 < len && popEl.time[i+1]) ? parseInt(popEl.time[i+1].elementValue[0].value) : pop1;
          pop = Math.max(isNaN(pop1)?0:pop1, isNaN(pop2)?0:pop2);
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
    const curTemp = Math.round(baseTemp + diurnalOffset);
    const apparentTemp = Math.round(curTemp + (baseHumidity > 80 ? 1.5 : -1));
    const minT = Math.round(baseTemp - 4);
    const maxT = Math.round(baseTemp + 4);
    
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
      const hTemp = Math.round(baseTemp + forecastDiurnal + (Math.random() * 1 - 0.5));
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
      const dayMin = minT + Math.round(Math.sin(d) * 1.5);
      const dayMax = maxT + Math.round(Math.cos(d) * 1.5);
      
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
  
  if (!countyData) {
    console.error('No weather data loaded for location:', activeCountyName);
    return;
  }
  
  document.getElementById('current-location-name').textContent = activeCountyName;
  
  const cur = countyData.current;
  document.getElementById('current-temp').textContent = cur.temp;
  document.getElementById('current-weather-desc').textContent = cur.desc;
  document.getElementById('current-temp-range').textContent = `最高 ${cur.tempMax}° | 最低 ${cur.tempMin}°`;
  
  document.getElementById('current-apparent-temp').textContent = `${cur.apparentTemp}°C`;
  document.getElementById('current-humidity').textContent = `${cur.humidity}%`;
  document.getElementById('current-wind-grade').textContent = `${cur.windGrade} 級`;
  document.getElementById('current-rain-prob').textContent = `${cur.rainProb}%`;
  
  // Inject Hero weather SVG icon
  const iconContainer = document.getElementById('hero-weather-icon');
  iconContainer.innerHTML = getAnimatedSvgCode(cur.icon, 128, 128);
  
  // Apply dynamic background style
  applyDynamicBackdropTheme(cur.icon);
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
  
  for (const rName of AppState.addedRegions) {
    const data = AppState.allCountiesWeatherData[rName];
    if (!data) continue;
    
    const cur = data.current;
    const card = document.createElement('div');
    card.className = 'region-card glass-panel';
    card.setAttribute('data-region', rName);
    
    card.innerHTML = `
      <div class="region-card-left">
        <span class="region-card-name">${rName}</span>
        <span class="region-card-meta">${cur.desc} &bull; 降雨 ${cur.rainProb}%</span>
      </div>
      <div class="region-card-right">
        <div class="region-card-temp">${cur.temp}°</div>
        <div class="region-card-icon">
          ${getAnimatedSvgCode(cur.icon, 40, 40)}
        </div>
        <button class="delete-card-btn" title="刪除" onclick="event.stopPropagation(); deleteCustomRegion('${rName}')">
          &times;
        </button>
      </div>
    `;
    
    // Card click opens the details drawer
    card.addEventListener('click', () => {
      openDrawerForecast(rName);
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
    svgCode += `<text x="${p.x}" y="${p.y - 12}" class="chart-label-temp">${p.temp}°</text>`;
    
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
        <span class="weekly-min-temp">${day.tempMin}°</span>
        <span class="weekly-max-temp">${day.tempMax}°</span>
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

function openDrawerForecast(regionName) {
  AppState.activeRegionDetailed = regionName;
  const data = AppState.allCountiesWeatherData[regionName];
  if (!data) return;
  
  // Set headers
  document.getElementById('drawer-region-title').textContent = regionName;
  document.getElementById('drawer-current-desc').textContent = `${data.current.desc} • 現在溫度 ${data.current.temp}°C`;
  document.getElementById('drawer-hero-icon').innerHTML = getAnimatedSvgCode(data.current.icon, 64, 64);
  
  // Render SVG hourly chart
  drawHourlySvgChart(data.hourly);
  
  // Render Apple style ranges
  renderAppleWeeklyRangeBars(data.weekly);
  
  // Open UI elements
  document.getElementById('details-drawer-overlay').classList.add('active');
  document.getElementById('details-drawer').classList.add('active');
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
  const radarImg = document.getElementById('radar-img');
  const timestampEl = document.getElementById('radar-timestamp');
  const loader = document.getElementById('radar-loader');
  
  loader.style.display = 'flex';
  loader.style.opacity = '1';
  
  const cacheBust = force ? `?t=${new Date().getTime()}` : '';
  radarImg.src = `https://www.cwa.gov.tw/Data/radar/CV1_3600.png${cacheBust}`;
  
  // Format current CWA standard update intervals (typically 10 min)
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const lastTenMin = Math.floor(now.getMinutes() / 10) * 10;
  timestampEl.textContent = `最後更新時間：${now.getHours()}:${pad(lastTenMin)}`;
}

// --------------------------------------------------------------------------
// 11. Custom Added Regions Search bar & Storage
// --------------------------------------------------------------------------
function initSearch() {
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
    
    // Filter matching counties
    const matches = TAIWAN_COUNTIES.filter(c => 
      c.name.includes(val) || 
      c.english.toLowerCase().includes(val.toLowerCase()) ||
      c.region.includes(val)
    );
    
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
    dropdown.innerHTML = `<div class="search-result-item empty-result">找不到對應的縣市</div>`;
  } else {
    matches.forEach(county => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.textContent = `${county.name} (${county.region})`;
      
      item.addEventListener('click', () => {
        addCustomRegion(county.name);
        document.getElementById('search-input').value = '';
        document.getElementById('btn-search-clear').style.display = 'none';
        dropdown.style.display = 'none';
      });
      dropdown.appendChild(item);
    });
  }
  
  dropdown.style.display = 'block';
}

function addCustomRegion(countyName) {
  if (AppState.addedRegions.includes(countyName)) {
    alert(`${countyName} 已經在自選追蹤清單中囉！`);
    return;
  }
  
  AppState.addedRegions.push(countyName);
  localStorage.setItem('cwa_added_regions', JSON.stringify(AppState.addedRegions));
  renderAddedRegionsList();
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
  const activeModeRadio = document.querySelector(`input[name="data-mode"][value="${AppState.dataMode}"]`);
  if (activeModeRadio) activeModeRadio.checked = true;
  
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
    const dataMode = document.querySelector('input[name="data-mode"]:checked').value;
    
    AppState.apiKey = rawKey;
    AppState.dataMode = dataMode;
    
    localStorage.setItem('cwa_api_key', rawKey);
    localStorage.setItem('cwa_data_mode', dataMode);
    
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
    alert('金鑰已清除，系統將自動啟動展示模擬模式。');
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
