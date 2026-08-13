/* ============================================================
   AfyaGuide – Recommendation engine + UI logic
   Features: real data, EN/SW toggle, voice input, Get Directions
   ============================================================ */

let TAXONOMY = [];
let FACILITIES = [];
let userLocation = null;
let dataReady = false;
let currentLang = localStorage.getItem('afyaguide_lang') || 'en';

const $ = id => document.getElementById(id);

/* ---------- i18n (English / Kiswahili) ---------- */
const I18N = {
  en: {
    badge: 'Data-driven facility discovery',
    heroTitle: 'Find the right healthcare facility near you',
    heroSub: 'Describe what you need in everyday language. We match you using the official facility list and a structured health-need taxonomy.',
    safetyTitle: 'Responsible use',
    safetyText: 'AfyaGuide is a facility-discovery tool, not a diagnostic service. It can make mistakes and facility information may change. Please verify important details with the facility or a qualified healthcare professional. If someone is in immediate danger, seek emergency care immediately (call 999).',
    searchLabel: 'What healthcare service do you need?',
    searchPlaceholder: 'e.g. I need HIV testing near me, or My child has had a high fever for three days…',
    chipHiv: 'HIV testing',
    chipFp: 'Family planning',
    chipAnc: 'ANC / pregnancy',
    chipChild: 'Child immunization',
    chipEmerg: 'Emergency / injury',
    locationNone: 'Location not yet detected',
    locationDetected: 'Location detected',
    locationRequesting: 'Requesting permission…',
    locationDenied: 'Location permission denied. You can still search by county.',
    locationUnavailable: 'Location unavailable. Search by county instead.',
    locationTimeout: 'Location timed out. Try again or search by county.',
    useLocation: 'Use my current location',
    detecting: 'Detecting…',
    countyLabel: 'County (optional)',
    anyCounty: 'Any county',
    distanceLabel: 'Search distance',
    dist10: 'Search within 10 km',
    dist20: 'Search within 20 km',
    dist30: 'Search within 30 km',
    dist50: 'Search within 50 km',
    dist100: 'Search within 100 km',
    findBtn: 'Find suitable facilities',
    loadingData: 'Loading facility data and taxonomy…',
    dataReady: 'Ready',
    facilities: 'facilities',
    healthNeeds: 'health needs',
    matching: 'Matching your request to facilities…',
    matchingSub: 'Using the health-need taxonomy and facility capability data',
    emergencyTitle: 'Emergency situation detected',
    emergencyText: 'If this is a life-threatening emergency, call 999 or go to the nearest hospital immediately. The facilities below may still help, but do not delay emergency care.',
    newSearch: 'New search',
    recommendedFor: 'Recommended for',
    closestMatch: 'Closest match',
    standardized: 'Standardized service',
    matchStrength: 'Facility match strength',
    strong: 'Strong match',
    good: 'Good match',
    possible: 'Possible match',
    recommended: 'Recommended',
    distanceUnavailable: 'Distance unavailable',
    keph: 'KEPH Level',
    relevantService: 'Relevant service',
    mayOffer: 'May offer related services',
    status: 'Status',
    open24: 'Open 24 hours',
    not24: 'Not 24 hours',
    hoursUnknown: 'Hours unknown',
    nhifYes: 'NHIF accredited',
    nhifNo: 'Not NHIF',
    nhifUnknown: 'NHIF status unknown',
    viewOnMap: 'View on map',
    getDirections: 'Get directions',
    officialPage: 'Official KMFL page',
    mapTitle: 'Nearby facilities on map',
    yourLocation: 'Your approximate location',
    noResultsTitle: 'No suitable facilities found',
    noResultsText: 'We couldn’t find matching facilities within the selected area. Try increasing the search distance or choosing a different county.',
    adjustSearch: 'Adjust search',
    errorTitle: 'Something went wrong',
    errorText: 'We couldn’t complete the search right now. Please try again.',
    tryAgain: 'Try again',
    footer: 'AfyaGuide uses the cleaned Kenya Master Health Facility List and a structured health-need taxonomy.\nNot a diagnostic service · Always verify details with the facility · Data may change',
    dataError: 'Could not load facility data. Ensure taxonomy.json and facilities.json are in the same folder.',
    stillLoading: 'Data is still loading. Please wait a moment.',
    voiceListen: 'Listening… speak now',
    voiceTap: 'Tap the mic to speak',
    voiceUnsupported: 'Voice input is not supported in this browser',
    voiceDenied: 'Microphone permission denied',
    voiceError: 'Could not capture speech. Try again or type.',
    voiceDone: 'Got it — review and search when ready'
  },
  sw: {
    badge: 'Utafutaji wa vituo unaoongozwa na data',
    heroTitle: 'Pata kituo cha afya kinachokufaa karibu nawe',
    heroSub: 'Eleza unachohitaji kwa lugha ya kawaida. Tunakutafutia kwa kutumia orodha rasmi ya vituo na uainishaji wa mahitaji ya afya.',
    safetyTitle: 'Matumizi yanayowajibika',
    safetyText: 'AfyaGuide ni zana ya kutafuta vituo, si huduma ya uchunguzi. Inaweza kukosea na taarifa za vituo zinaweza kubadilika. Thibitisha maelezo muhimu na kituo au mtaalamu wa afya. Ikiwa mtu yuko hatarini mara moja, tafuta huduma ya dharura (piga 999).',
    searchLabel: 'Unahitaji huduma gani ya afya?',
    searchPlaceholder: 'mf. Nahitaji kupima HIV karibu nami, au Mtoto wangu ana homa kali kwa siku tatu…',
    chipHiv: 'Kupima HIV',
    chipFp: 'Uzazi wa mpango',
    chipAnc: 'Huduma za ujauzito',
    chipChild: 'Chanjo za watoto',
    chipEmerg: 'Dharura / majeraha',
    locationNone: 'Eneo bado halijatambuliwa',
    locationDetected: 'Eneo limetambuliwa',
    locationRequesting: 'Inaomba ruhusa…',
    locationDenied: 'Ruhusa ya eneo imekataliwa. Bado unaweza kutafuta kwa kaunti.',
    locationUnavailable: 'Eneo halipatikani. Tafuta kwa kaunti.',
    locationTimeout: 'Muda wa eneo umeisha. Jaribu tena au tafuta kwa kaunti.',
    useLocation: 'Tumia eneo langu la sasa',
    detecting: 'Inatambua…',
    countyLabel: 'Kaunti (si lazima)',
    anyCounty: 'Kaunti yoyote',
    distanceLabel: 'Umbali wa utafutaji',
    dist10: 'Tafuta ndani ya km 10',
    dist20: 'Tafuta ndani ya km 20',
    dist30: 'Tafuta ndani ya km 30',
    dist50: 'Tafuta ndani ya km 50',
    dist100: 'Tafuta ndani ya km 100',
    findBtn: 'Tafuta vituo vinavyofaa',
    loadingData: 'Inapakia data ya vituo na uainishaji…',
    dataReady: 'Tayari',
    facilities: 'vituo',
    healthNeeds: 'mahitaji ya afya',
    matching: 'Inalinganisha ombi lako na vituo…',
    matchingSub: 'Inatumia uainishaji wa mahitaji na uwezo wa vituo',
    emergencyTitle: 'Hali ya dharura imetambuliwa',
    emergencyText: 'Ikiwa hii ni dharura inayohatarisha maisha, piga 999 au nenda hospitali ya karibu mara moja. Vituo vilivyo chini vinaweza kusaidia, lakini usicheleweshe huduma ya dharura.',
    newSearch: 'Utafutaji mpya',
    recommendedFor: 'Inapendekezwa kwa',
    closestMatch: 'Ulinganifu wa karibu',
    standardized: 'Huduma sanifu',
    matchStrength: 'Nguvu ya ulinganifu wa kituo',
    strong: 'Ulinganifu thabiti',
    good: 'Ulinganifu mzuri',
    possible: 'Ulinganifu unaowezekana',
    recommended: 'Inapendekezwa',
    distanceUnavailable: 'Umbali haupatikani',
    keph: 'Kiwango cha KEPH',
    relevantService: 'Huduma husika',
    mayOffer: 'Inaweza kutoa huduma zinazohusiana',
    status: 'Hali',
    open24: 'Fungua masaa 24',
    not24: 'Sio masaa 24',
    hoursUnknown: 'Saa hazijulikani',
    nhifYes: 'Imethibitishwa na NHIF',
    nhifNo: 'Sio NHIF',
    nhifUnknown: 'Hali ya NHIF haijulikani',
    viewOnMap: 'Angalia kwenye ramani',
    getDirections: 'Pata maelekezo',
    officialPage: 'Ukurasa rasmi wa KMFL',
    mapTitle: 'Vituo vya karibu kwenye ramani',
    yourLocation: 'Eneo lako takribani',
    noResultsTitle: 'Hakuna vituo vinavyofaa vilivyopatikana',
    noResultsText: 'Hatukuweza kupata vituo vinavyolingana ndani ya eneo ulilochagua. Jaribu kuongeza umbali au uchague kaunti nyingine.',
    adjustSearch: 'Rekebisha utafutaji',
    errorTitle: 'Kuna hitilafu',
    errorText: 'Hatukuweza kukamilisha utafutaji sasa. Tafadhali jaribu tena.',
    tryAgain: 'Jaribu tena',
    footer: 'AfyaGuide inatumia Orodha Safi ya Vituo vya Afya vya Kenya na uainishaji wa mahitaji ya afya.\nSi huduma ya uchunguzi · Thibitisha maelezo na kituo · Data inaweza kubadilika',
    dataError: 'Imeshindwa kupakia data ya vituo. Hakikisha taxonomy.json na facilities.json ziko kwenye folda moja.',
    stillLoading: 'Data bado inapakia. Tafadhali subiri kidogo.',
    voiceListen: 'Inasikiliza… sema sasa',
    voiceTap: 'Gusa maikrofoni ili kuzungumza',
    voiceUnsupported: 'Kuingiza kwa sauti hakutumiki kwenye kivinjari hiki',
    voiceDenied: 'Ruhusa ya maikrofoni imekataliwa',
    voiceError: 'Imeshindwa kunasa sauti. Jaribu tena au andika.',
    voiceDone: 'Imepokelewa — hakiki kisha utafute'
  }
};

function t(key) {
  return (I18N[currentLang] && I18N[currentLang][key]) || I18N.en[key] || key;
}

function applyLanguage() {
  // Header badges stay mostly as-is; update dynamic bits via data-i18n where present
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (key && t(key)) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t(key);
      } else {
        el.textContent = t(key);
      }
    }
  });

  // Specific elements
  const set = (id, key, prop = 'textContent') => {
    const el = $(id);
    if (el && t(key)) el[prop] = t(key);
  };

  set('heroBadgeText', 'badge');
  set('heroTitle', 'heroTitle');
  set('heroSub', 'heroSub');
  set('safetyTitle', 'safetyTitle');
  set('safetyText', 'safetyText');
  set('searchLabel', 'searchLabel');
  if ($('userQuery')) $('userQuery').placeholder = t('searchPlaceholder');

  // Chips
  const chips = document.querySelectorAll('.example-chip');
  const chipKeys = ['chipHiv', 'chipFp', 'chipAnc', 'chipChild', 'chipEmerg'];
  chips.forEach((chip, i) => {
    if (chipKeys[i]) chip.textContent = t(chipKeys[i]);
  });

  if (!userLocation) {
    const span = locationStatus && locationStatus.querySelector('span');
    if (span) span.textContent = t('locationNone');
  }

  set('btnLocationText', 'useLocation');
  // Keep icon + text structure
  if ($('btnLocation') && !$('btnLocation').classList.contains('active')) {
    $('btnLocation').innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${t('useLocation')}`;
  }

  const countyLabel = document.querySelector('label[for="countySelect"]');
  if (countyLabel) countyLabel.textContent = t('countyLabel');
  const distLabel = document.querySelector('label[for="distanceSelect"]');
  if (distLabel) distLabel.textContent = t('distanceLabel');

  // County first option
  if (countySelect && countySelect.options[0]) countySelect.options[0].textContent = t('anyCounty');

  // Distance options
  const distOpts = [
    { v: '10', k: 'dist10' },
    { v: '20', k: 'dist20' },
    { v: '30', k: 'dist30' },
    { v: '50', k: 'dist50' },
    { v: '100', k: 'dist100' }
  ];
  if (distanceSelect) {
    distOpts.forEach((d, i) => {
      if (distanceSelect.options[i]) distanceSelect.options[i].textContent = t(d.k);
    });
  }

  if ($('btnSearchText')) $('btnSearchText').textContent = t('findBtn');
  else if ($('btnSearch')) {
    const icon = $('btnSearch').querySelector('svg');
    $('btnSearch').innerHTML = '';
    if (icon) $('btnSearch').appendChild(icon);
    $('btnSearch').appendChild(document.createTextNode(' ' + t('findBtn')));
  }

  if (!dataReady) {
    if (dataStatus) dataStatus.textContent = t('loadingData');
  } else {
    dataStatus.textContent = `${t('dataReady')} · ${FACILITIES.length.toLocaleString()} ${t('facilities')} · ${TAXONOMY.length} ${t('healthNeeds')}`;
  }

  if ($('loadingText')) $('loadingText').textContent = t('matching');
  if ($('loadingSub')) $('loadingSub').textContent = t('matchingSub');
  if ($('emergencyTitle')) $('emergencyTitle').textContent = t('emergencyTitle');
  if ($('emergencyText')) $('emergencyText').textContent = t('emergencyText');
  if ($('newSearchText')) $('newSearchText').textContent = t('newSearch');
  if ($('noResultsTitle')) $('noResultsTitle').textContent = t('noResultsTitle');
  if ($('noResultsText')) $('noResultsText').textContent = t('noResultsText');
  if ($('adjustSearchBtn')) $('adjustSearchBtn').textContent = t('adjustSearch');
  if ($('errorTitle')) $('errorTitle').textContent = t('errorTitle');
  if ($('errorText')) $('errorText').textContent = t('errorText');
  if ($('btnRetry')) $('btnRetry').textContent = t('tryAgain');

  const footer = document.querySelector('.footer');
  if (footer) footer.innerHTML = t('footer').replace('\n', '<br>');

  // Lang buttons state
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === currentLang);
  });

  localStorage.setItem('afyaguide_lang', currentLang);
  const vh = document.getElementById('voiceHint');
  const bv = document.getElementById('btnVoice');
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (vh && !(window.__afyaListening)) {
    vh.textContent = SR ? t('voiceTap') : t('voiceUnsupported');
    vh.className = 'voice-hint';
  }
  if (bv && !SR) {
    bv.disabled = true;
    bv.title = t('voiceUnsupported');
  }
}

function setLanguage(lang) {
  currentLang = lang;
  applyLanguage();
}

/* ---------- DOM refs (after DOM ready conceptually) ---------- */
const userQuery = $('userQuery');
const btnLocation = $('btnLocation');
const locationStatus = $('locationStatus');
const countySelect = $('countySelect');
const distanceSelect = $('distanceSelect');
const btnSearch = $('btnSearch');
const loadingState = $('loadingState');
const resultsSection = $('resultsSection');
const facilityList = $('facilityList');
const recommendationSummary = $('recommendationSummary');
const emptyState = $('emptyState');
const errorState = $('errorState');
const emergencyNotice = $('emergencyNotice');
const searchSection = $('searchSection');
const dataStatus = $('dataStatus');
const dataBadge = $('dataBadge');

/* ---------- Load data ---------- */
async function loadData() {
  try {
    const [taxRes, facRes] = await Promise.all([
      fetch('taxonomy.json'),
      fetch('facilities.json')
    ]);
    if (!taxRes.ok || !facRes.ok) throw new Error('Failed to load data');
    TAXONOMY = await taxRes.json();
    FACILITIES = await facRes.json();

    const counties = [...new Set(FACILITIES.map(f => f.county).filter(Boolean))].sort();
    counties.forEach(c => {
      const o = document.createElement('option');
      o.value = c;
      o.textContent = c;
      countySelect.appendChild(o);
    });

    dataReady = true;
    dataBadge.textContent = `${FACILITIES.length.toLocaleString()} ${t('facilities')}`;
    dataStatus.textContent = `${t('dataReady')} · ${FACILITIES.length.toLocaleString()} ${t('facilities')} · ${TAXONOMY.length} ${t('healthNeeds')}`;
    dataStatus.classList.add('ready');
    btnSearch.disabled = false;
  } catch (err) {
    console.error(err);
    dataBadge.textContent = 'Error';
    const isFile = location.protocol === 'file:';
    dataStatus.innerHTML = isFile
      ? (currentLang === 'sw'
          ? 'Data haipaki kwenye file://. Fungua tovuti kupitia GitHub Pages au server (http://), si faili moja kwa moja.'
          : 'Data cannot load from file://. Open the site via GitHub Pages or a local server (http://), not by opening the HTML file directly.')
      : t('dataError');
    dataStatus.style.color = 'var(--danger)';
    dataStatus.style.maxWidth = '340px';
    dataStatus.style.margin = '0.7rem auto 0';
    dataStatus.style.lineHeight = '1.45';
  }
}

loadData();
applyLanguage();

/* ---------- Language toggle ---------- */
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLanguage(btn.dataset.lang));
});


/* ---------- Voice input (Web Speech API) ---------- */
const btnVoice = $('btnVoice');
const voiceHint = $('voiceHint');
let recognition = null;
let isListening = false; window.__afyaListening = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function initVoice() {
  if (!btnVoice) return;
  if (!SpeechRecognition) {
    btnVoice.disabled = true;
    btnVoice.title = t('voiceUnsupported');
    if (voiceHint) voiceHint.textContent = t('voiceUnsupported');
    return;
  }
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => {
    isListening = true; window.__afyaListening = true;
    btnVoice.classList.add('listening');
    if (voiceHint) {
      voiceHint.textContent = t('voiceListen');
      voiceHint.className = 'voice-hint listening';
    }
  };

  recognition.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript;
      if (event.results[i].isFinal) final += transcript;
      else interim += transcript;
    }
    if (final) {
      userQuery.value = (userQuery.value ? userQuery.value.trim() + ' ' : '') + final.trim();
    } else if (interim) {
      // show interim in placeholder-like way via value if empty
      if (!userQuery.dataset.base) userQuery.dataset.base = userQuery.value;
      userQuery.value = (userQuery.dataset.base || '') + interim;
    }
  };

  recognition.onerror = (event) => {
    isListening = false; window.__afyaListening = false;
    btnVoice.classList.remove('listening');
    delete userQuery.dataset.base;
    let msg = t('voiceError');
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') msg = t('voiceDenied');
    if (event.error === 'no-speech') msg = t('voiceError');
    if (voiceHint) {
      voiceHint.textContent = msg;
      voiceHint.className = 'voice-hint error';
    }
  };

  recognition.onend = () => {
    isListening = false; window.__afyaListening = false;
    btnVoice.classList.remove('listening');
    delete userQuery.dataset.base;
    if (voiceHint && userQuery.value.trim()) {
      voiceHint.textContent = t('voiceDone');
      voiceHint.className = 'voice-hint';
    } else if (voiceHint && !voiceHint.classList.contains('error')) {
      voiceHint.textContent = t('voiceTap');
      voiceHint.className = 'voice-hint';
    }
  };

  btnVoice.addEventListener('click', () => {
    if (!recognition) return;
    if (isListening) {
      recognition.stop();
      return;
    }
    // Language: prefer Swahili when SW selected, else English (Kenya)
    recognition.lang = currentLang === 'sw' ? 'sw-KE' : 'en-KE';
    try {
      recognition.start();
    } catch (e) {
      // already started
      console.warn(e);
    }
  });

  if (voiceHint) {
    voiceHint.textContent = t('voiceTap');
    voiceHint.className = 'voice-hint';
  }
}

// Re-apply voice hint when language changes
const _origApply = typeof applyLanguage === 'function' ? null : null;

initVoice();


/* ---------- Example chips ---------- */
document.querySelectorAll('.example-chip').forEach(chip => {
  chip.addEventListener('click', () => {
    userQuery.value = chip.dataset.q;
    userQuery.focus();
  });
});

/* ---------- Geolocation ---------- */
btnLocation.addEventListener('click', () => {
  if (!navigator.geolocation) {
    locationStatus.innerHTML = `<span>Geolocation not supported</span>`;
    return;
  }
  btnLocation.disabled = true;
  btnLocation.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ${t('detecting')}`;
  locationStatus.innerHTML = `<span>${t('locationRequesting')}</span>`;

  navigator.geolocation.getCurrentPosition(
    pos => {
      userLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      locationStatus.classList.add('detected');
      locationStatus.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>${t('locationDetected')}</span>`;
      btnLocation.classList.add('active');
      btnLocation.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> ${t('locationDetected')}`;
      btnLocation.disabled = false;
    },
    err => {
      userLocation = null;
      locationStatus.classList.remove('detected');
      let msg = t('locationDenied');
      if (err.code === 2) msg = t('locationUnavailable');
      if (err.code === 3) msg = t('locationTimeout');
      locationStatus.innerHTML = `<span>${msg}</span>`;
      btnLocation.disabled = false;
      btnLocation.innerHTML = `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ${t('useLocation')}`;
    },
    { enableHighAccuracy: false, timeout: 20000, maximumAge: 120000 }
  );
});

/* ---------- Distance ---------- */
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/* ---------- Taxonomy match ---------- */
function matchTaxonomy(query) {
  const q = query.toLowerCase().trim();
  if (!q) return null;
  let best = null;
  let bestScore = 0;

  for (const item of TAXONOMY) {
    let score = 0;
    const need = (item.need || '').toLowerCase();
    const keywords = (item.keywords || '').toLowerCase().split(/[,|]/).map(s => s.trim()).filter(Boolean);
    const examples = (item.examples || '').toLowerCase();
    const service = (item.service || '').toLowerCase();

    for (const kw of keywords) {
      if (kw.length > 2 && q.includes(kw)) score += 12;
    }
    const needWords = need.split(/\s+/).filter(w => w.length > 3);
    for (const w of needWords) {
      if (q.includes(w)) score += 6;
    }
    if (examples && examples.split('|').some(ex => {
      const words = ex.trim().split(/\s+/).filter(w => w.length > 3);
      return words.filter(w => q.includes(w)).length >= 2;
    })) score += 8;

    if (service && q.includes(service.split(' ')[0])) score += 4;
    if (item.emergency && /emergency|accident|bleeding|unconscious|breathing|chest pain|seizure|stroke|poison|burn|snake|dharura|ajali|kutokwa na damu/.test(q)) {
      score += 15;
    }
    if (score > bestScore) {
      bestScore = score;
      best = item;
    }
  }

  if (!best || bestScore < 4) {
    const fallback = TAXONOMY.find(x => (x.service || '').toLowerCase().includes('general outpatient')) || TAXONOMY[0];
    return { taxonomy: fallback, score: bestScore, weak: true };
  }
  return { taxonomy: best, score: bestScore, weak: false };
}

function kephNum(level) {
  const m = String(level || '2').match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 2;
}

/* ---------- Ranking ---------- */
function rankFacilities(query, maxDistance, countyFilter) {
  const match = matchTaxonomy(query);
  if (!match) return { facilities: [], match: null };

  const tax = match.taxonomy;
  const targetService = (tax.service || '').toLowerCase();
  const minKeph = kephNum(tax.min_keph);
  const isEmergency = tax.emergency;
  const results = [];

  for (const f of FACILITIES) {
    if (countyFilter && f.county !== countyFilter) continue;

    let serviceScore = 0;
    const svcLower = (f.services || []).map(s => String(s).toLowerCase());
    const hasDirect = svcLower.some(s =>
      s.includes(targetService.split(' ')[0]) ||
      targetService.split(/\s+/).filter(w => w.length > 3).some(w => s.includes(w))
    );
    if (hasDirect) serviceScore = 0.55;
    else if (svcLower.some(s => /outpatient|general|clinic|emergency|hiv|family planning|antenatal|immunization|maternity/.test(s))) {
      serviceScore = 0.25;
    } else if (f.svc_count > 0) {
      serviceScore = 0.1;
    }

    const fKeph = f.keph_n || 2;
    let capabilityScore = 0;
    if (fKeph >= minKeph) capabilityScore = 0.25;
    else if (fKeph >= minKeph - 1) capabilityScore = 0.12;
    else capabilityScore = 0.03;

    let dist = null;
    let distanceScore = 0;
    if (userLocation && f.lat && f.lng) {
      dist = distanceKm(userLocation.lat, userLocation.lng, f.lat, f.lng);
      if (dist > maxDistance) continue;
      distanceScore = Math.max(0, 0.2 * (1 - dist / maxDistance));
    } else if (!userLocation && !countyFilter) {
      distanceScore = 0.05;
    }

    let emergencyBoost = 0;
    if (isEmergency && fKeph >= 4) emergencyBoost = 0.08;

    const total = serviceScore + capabilityScore + distanceScore + emergencyBoost;

    results.push({
      ...f,
      distance: dist,
      matchScore: total,
      serviceMatched: tax.service,
      hasServiceMatch: hasDirect,
      taxonomyNeed: tax.need,
      isEmergency
    });
  }

  results.sort((a, b) => {
    if (Math.abs(b.matchScore - a.matchScore) > 0.04) return b.matchScore - a.matchScore;
    if (a.distance != null && b.distance != null) return a.distance - b.distance;
    return (b.keph_n || 0) - (a.keph_n || 0);
  });

  return {
    facilities: results.slice(0, 10),
    match,
    detectedService: tax.service,
    detectedNeed: tax.need,
    isEmergency
  };
}

/* ---------- Directions (Google Maps / Apple Maps) ---------- */
function openDirections(lat, lng, name) {
  const dest = `${lat},${lng}`;
  const label = encodeURIComponent(name || 'Facility');
  // Universal approach: Google Maps works on most devices; falls back well
  const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&destination_place_id=&travelmode=driving`;
  // Alternative that also works well on iOS:
  // const url = `https://maps.apple.com/?daddr=${dest}&dirflg=d`;
  window.open(url, '_blank', 'noopener');
}

/* ---------- Render results ---------- */
function renderResults(data) {
  facilityList.innerHTML = '';
  if (!data.facilities.length) {
    resultsSection.classList.remove('active');
    emptyState.classList.add('active');
    return;
  }
  emptyState.classList.remove('active');
  resultsSection.classList.add('active');

  const top = data.facilities[0];
  const strength = top.matchScore >= 0.7 ? t('strong') : top.matchScore >= 0.45 ? t('good') : t('possible');
  const recLabel = data.match?.weak ? t('closestMatch') : t('recommendedFor');

  recommendationSummary.innerHTML = `
    <h2>${recLabel}: ${data.detectedNeed || data.detectedService}</h2>
    <div class="match-meta">${t('standardized')}: ${data.detectedService || '—'}</div>
    <div class="match-strength"><span class="dot"></span> ${t('matchStrength')} · ${strength}</div>
  `;

  data.facilities.forEach((f, idx) => {
    const isTop = idx === 0;
    const distText = f.distance != null ? `${f.distance.toFixed(1)} km` : t('distanceUnavailable');
    const hours = f.open24 === 'Yes' ? t('open24') : (f.open24 === 'No' ? t('not24') : t('hoursUnknown'));
    const nhif = f.nhif === 'Yes' ? t('nhifYes') : (f.nhif === 'No' ? t('nhifNo') : t('nhifUnknown'));

    const card = document.createElement('article');
    card.className = 'facility-card' + (isTop ? ' recommended' : '');
    card.innerHTML = `
      <div class="facility-header">
        <div class="facility-name">${f.name}</div>
        ${isTop ? `<span class="badge badge-recommended">${t('recommended')}</span>` : ''}
      </div>
      <div class="facility-meta">
        <span class="meta-item">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${distText}
        </span>
        <span class="meta-item">${f.county || '—'}</span>
        <span class="meta-item">${f.type || '—'}</span>
      </div>
      <div class="facility-details">
        <div>
          <div class="detail-label">${t('keph')}</div>
          <div class="detail-value">${f.keph || '<span class="unavailable">—</span>'}</div>
        </div>
        <div>
          <div class="detail-label">${t('relevantService')}</div>
          <div class="detail-value">${f.hasServiceMatch ? (f.serviceMatched || '—') : t('mayOffer')}</div>
        </div>
        <div>
          <div class="detail-label">${t('status')}</div>
          <div class="detail-value">${hours} · ${nhif}</div>
        </div>
      </div>
      <div class="card-actions">
        <button type="button" class="btn btn-directions btn-sm get-directions" data-lat="${f.lat}" data-lng="${f.lng}" data-name="${(f.name || '').replace(/"/g, '&quot;')}">
          ${t('getDirections')}
        </button>
        ${f.url ? `<a class="btn btn-secondary btn-sm" href="${f.url}" target="_blank" rel="noopener">${t('officialPage')}</a>` : ''}
      </div>
    `;
    facilityList.appendChild(card);
  });
      }
    });
  });

  document.querySelectorAll('.get-directions').forEach(btn => {
    btn.addEventListener('click', () => {
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);
      const name = btn.dataset.name || 'Facility';
      if (!isNaN(lat) && !isNaN(lng)) openDirections(lat, lng, name);
    });
  });
}

/* ---------- Search ---------- */
function performSearch() {
  if (!dataReady) {
    alert(t('stillLoading'));
    return;
  }
  const query = userQuery.value.trim();
  if (!query) {
    userQuery.focus();
    userQuery.style.borderColor = 'var(--danger)';
    setTimeout(() => { userQuery.style.borderColor = ''; }, 1600);
    return;
  }

  resultsSection.classList.remove('active');
  emptyState.classList.remove('active');
  errorState.classList.remove('active');
  emergencyNotice.classList.remove('active');
  loadingState.classList.add('active');
  searchSection.style.display = 'none';

  setTimeout(() => {
    try {
      const maxDist = parseInt(distanceSelect.value, 10) || 20;
      const county = countySelect.value || null;
      const data = rankFacilities(query, maxDist, county);
      if (data.isEmergency) emergencyNotice.classList.add('active');
      loadingState.classList.remove('active');
      renderResults(data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      console.error(e);
      loadingState.classList.remove('active');
      errorState.classList.add('active');
      searchSection.style.display = 'block';
    }
  }, 80);
}

btnSearch.addEventListener('click', performSearch);
$('btnRetry').addEventListener('click', () => {
  errorState.classList.remove('active');
  searchSection.style.display = 'block';
  performSearch();
});
userQuery.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    performSearch();
  }
});

function resetApp() {
  searchSection.style.display = 'block';
  resultsSection.classList.remove('active');
  emptyState.classList.remove('active');
  errorState.classList.remove('active');
  emergencyNotice.classList.remove('active');
  loadingState.classList.remove('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
