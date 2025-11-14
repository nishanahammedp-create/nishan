// ==================== STATE MANAGEMENT ====================
const appState = {
    userLocation: 'Global',
    userCoords: null,
    alerts: [],
    events: [],
    settings: {
        notificationsEnabled: true,
        soundAlert: true,
        vibrationAlert: true,
        weatherAlerts: true,
        earthquakeAlerts: true,
        floodWarnings: true,
        accidentAlerts: true,
        sensorAlerts: true,
        satelliteAlerts: true,
        aiPredictions: true
    },
    alertSourceFilter: 'all',
    subscribedLocations: [],
    darkMode: true,
    offlineComm: {
        isActive: false,
        userId: generateUniqueId(),
        peers: [],
        messages: []
    }
    ,
    // Auto alert controls: when enabled, system will auto-trigger alarm on danger
    autoAlert: false,
    autoAlarmActive: false,
    autoAlarmCtx: null
};

// Generate unique ID for this device
function generateUniqueId() {
    let id = localStorage.getItem('deviceId');
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', id);
    }
    return id;
}

// transient suggestion cache and last suggestions
appState.geoCache = {};
appState.lastSuggestions = [];

// ==================== WORLDWIDE LOCATIONS DATABASE ====================
// A curated list of major world cities and capitals for search suggestions.
const worldLocations = [
    // ==================== KERALA - DISTRICT HEADQUARTERS ====================
    'Thiruvananthapuram, Kerala', 'Kollam, Kerala', 'Pathanamthitta, Kerala', 'Alappuzha, Kerala',
    'Kottayam, Kerala', 'Idukki, Kerala', 'Ernakulam, Kerala', 'Thrissur, Kerala', 'Palakkad, Kerala',
    'Malappuram, Kerala', 'Kozhikode, Kerala', 'Wayanad, Kerala', 'Kannur, Kerala', 'Kasaragod, Kerala',

    // ==================== THIRUVANANTHAPURAM DISTRICT ====================
    'Kochi, Kerala', 'Trivandrum, Kerala', 'Nedumangad, Kerala', 'Varkala, Kerala', 'Attingal, Kerala',
    'Neyyattinkara, Kerala', 'Chirayinkeezhu, Kerala', 'Kazhakuttom, Kerala', 'Technopark, Kerala',
    
    // ==================== KOLLAM DISTRICT ====================
    'Ashtamudi, Kerala', 'Kayamkulam, Kerala', 'Kundara, Kerala', 'Chadayamangalam, Kerala',
    'Eravipuram, Kerala', 'Thekkumbhagom, Kerala', 'Munroe Island, Kerala', 'Pathiramanal, Kerala',
    
    // ==================== PATHANAMTHITTA DISTRICT ====================
    'Ranni, Kerala', 'Adoor, Kerala', 'Pandalam, Kerala', 'Vadaserry, Kerala', 'Mallappally, Kerala',
    'Konni, Kerala', 'Neriyamangalam, Kerala', 'Perunad, Kerala',
    
    // ==================== ALAPPUZHA DISTRICT ====================
    'Alappuzha, Kerala', 'Changanassery, Kerala', 'Ambalappuzha, Kerala', 'Mavelikkara, Kerala',
    'Tiruvanvandrum, Kerala', 'Harippad, Kerala', 'Cherthala, Kerala', 'Veliyanad, Kerala',
    'Kayamkulam, Kerala', 'Mararikulam, Kerala', 'Kumarakom, Kerala', 'Punnamada, Kerala',
    'Nedumudi, Kerala', 'Pallipppad, Kerala',
    
    // ==================== KOTTAYAM DISTRICT ====================
    'Kottayam, Kerala', 'Pampady, Kerala', 'Ettumanoor, Kerala', 'Vazhapally, Kerala',
    'Piravom, Kerala', 'Paravoor, Kerala', 'Erumapetty, Kerala', 'Kozhuvanal, Kerala',
    'Mundakayam, Kerala', 'Changanassery, Kerala', 'Pala, Kerala', 'Vaikom, Kerala',
    
    // ==================== IDUKKI DISTRICT ====================
    'Idukki, Kerala', 'Munnar, Kerala', 'Thekkady, Kerala', 'Thodupuzha, Kerala',
    'Udumbanchola, Kerala', 'Devikulam, Kerala', 'Kumily, Kerala', 'Mannavanur, Kerala',
    'Nedumbassery, Kerala', 'Painavu, Kerala', 'Aluva, Kerala', 'Cheruthoni, Kerala',
    'Mattupetty, Kerala', 'Pallivasal, Kerala', 'Vattavada, Kerala',
    
    // ==================== ERNAKULAM DISTRICT ====================
    'Kochi, Kerala', 'Perumbavoor, Kerala', 'Angamaly, Kerala', 'Fort Kochi, Kerala',
    'Mattancherry, Kerala', 'Vypin, Kerala', 'Aluva, Kerala', 'Kalamassery, Kerala',
    'Kakkanad, Kerala', 'Cheranelloor, Kerala', 'Kadavanthara, Kerala', 'Infopark, Kerala',
    'Thrikkakara, Kerala', 'Kumbalangi, Kerala', 'Maradu, Kerala', 'Edappalli, Kerala',
    'Kongorpilly, Kerala', 'Kothamangalam, Kerala', 'North Paravur, Kerala', 'Parur, Kerala',
    'Piravom, Kerala', 'Muvattupuzha, Kerala',
    
    // ==================== THRISSUR DISTRICT ====================
    'Thrissur, Kerala', 'Irinjalakuda, Kerala', 'Ollur, Kerala', 'Kunnamkulam, Kerala',
    'Kodungalloor, Kerala', 'Chalakudy, Kerala', 'Guruvayur, Kerala', 'Shoranur, Kerala',
    'Vellarpad, Kerala', 'Aluva, Kerala', 'Puthencruz, Kerala', 'Pariyaram, Kerala',
    'Sangara, Kerala', 'Wadakkanchery, Kerala', 'Thodupuzha, Kerala',
    
    // ==================== PALAKKAD DISTRICT ====================
    'Palakkad, Kerala', 'Ottapalam, Kerala', 'Chittur, Kerala', 'Attappadi, Kerala',
    'Mannarkkad, Kerala', 'Nemmara, Kerala', 'Vadakkanchery, Kerala', 'Kottaparamb, Kerala',
    'Muthalamada, Kerala', 'Shornur, Kerala', 'Kodur, Kerala', 'Pattambi, Kerala',
    'Cherpulasseri, Kerala', 'Meenakshipuram, Kerala', 'Thrithala, Kerala', 'Elappully, Kerala',
    'Kongad, Kerala', 'Malampuzha, Kerala',
    
    // ==================== MALAPPURAM DISTRICT ====================
    'Malappuram, Kerala', 'Nilambur, Kerala', 'Kottakkal, Kerala', 'Tirur, Kerala',
    'Perinthalmanna, Kerala', 'Ponnani, Kerala', 'Edappal, Kerala', 'Harippad, Kerala',
    'Parappanangadi, Kerala', 'Kondotty, Kerala', 'Tanur, Kerala', 'Valanchery, Kerala',
    'Manjeri, Kerala', 'Eranad, Kerala', 'Aroor, Kerala', 'Vengara, Kerala',
    'Thalippli, Kerala', 'Kalikavu, Kerala', 'Ottapalam, Kerala',
    
    // ==================== KOZHIKODE DISTRICT ====================
    'Kozhikode, Kerala', 'Calicut, Kerala', 'Kappad, Kerala', 'Vadakara, Kerala',
    'Mukkam, Kerala', 'Koyilandi, Kerala', 'Quilandy, Kerala', 'Kunnamangalam, Kerala',
    'Nadapuram, Kerala', 'Unangad, Kerala', 'Balussery, Kerala', 'Okkur, Kerala',
    'Cheruvannur, Kerala', 'Kadalundi, Kerala', 'Kodiyeri, Kerala', 'Chelari, Kerala',
    'Thalassery, Kerala', 'Arikamedi, Kerala',
    
    // ==================== WAYANAD DISTRICT ====================
    'Kalpetta, Kerala', 'Sulthan\'s Battery, Kerala', 'Mananthavady, Kerala', 'Vythiri, Kerala',
    'Panamaram, Kerala', 'Meppadi, Kerala', 'Noolpuzha, Kerala', 'Poothadi, Kerala',
    'Palloor, Kerala', 'Ambalavayal, Kerala', 'Pulpally, Kerala', 'Karapuzha, Kerala',
    'Lakkidi, Kerala', 'Vellamunda, Kerala',
    
    // ==================== KANNUR DISTRICT ====================
    'Kannur, Kerala', 'Cannanore, Kerala', 'Thalassery, Kerala', 'Mahe, Kerala',
    'Kasaragod, Kerala', 'Kottayam, Kerala', 'Payyanur, Kerala', 'Mattannur, Kerala',
    'Iritty, Kerala', 'Panur, Kerala', 'Kuthuparamba, Kerala', 'Peravoor, Kerala',
    'Cherupotta, Kerala', 'Ezhimala, Kerala', 'Narikotta, Kerala', 'Talassery, Kerala',
    'Chirakkal, Kerala', 'Cheruvathur, Kerala', 'Koothuparamba, Kerala',
    
    // ==================== KASARAGOD DISTRICT ====================
    'Kasaragod, Kerala', 'Kanhangad, Kerala', 'Pareeksha, Kerala', 'Nileshwar, Kerala',
    'Hosdurg, Kerala', 'Pookode, Kerala', 'Valiyaparamba, Kerala', 'Manjeshwar, Kerala',
    'Nileswaram, Kerala', 'Kanichukulangara, Kerala', 'Kundapura, Kerala', 'Cherupotta, Kerala',
    'Kumble, Kerala', 'Puttur, Kerala', 'Adhur, Kerala', 'Cheruvathur, Kerala',
    
    // ==================== OTHER MAJOR CITIES IN INDIA ====================
    'Mumbai, India', 'Delhi, India', 'Bangalore, India', 'Hyderabad, India', 'Chennai, India',
    'Kolkata, India', 'Pune, India', 'Jaipur, India', 'Ahmedabad, India', 'Surat, India',
    'Lucknow, India', 'Kanpur, India', 'Nagpur, India', 'Indore, India', 'Kochi, India',
    'Chandigarh, India', 'Gurugram, India', 'Noida, India'
];

// ==================== MOCK DISASTER DATA ====================
const mockAlerts = [
    // ===== DANGER ZONE: Kochi (Multiple danger alerts) =====
    {
        id: 1,
        title: 'Heavy Rainfall Alert',
        type: 'weather',
        severity: 'danger',
        message: 'Extreme rainfall expected in the next 6 hours. Immediate evacuation recommended from low-lying areas.',
        location: 'Kochi, Kerala',
        source: 'satellite',
        timestamp: new Date(Date.now() - 15 * 60000),
        emoji: '🌧️',
        radius: 15
    },
    {
        id: 2,
        title: 'Flood Warning',
        type: 'flood',
        severity: 'danger',
        message: 'River levels rising rapidly. Residents in flood-prone areas should evacuate immediately.',
        location: 'Kochi, Kerala',
        source: 'official',
        timestamp: new Date(Date.now() - 20 * 60000),
        emoji: '🌊',
        radius: 15
    },
    {
        id: 3,
        title: 'Landslide Alert',
        type: 'accident',
        severity: 'danger',
        message: 'Heavy rains may trigger landslides. Stay away from slopes and hilly terrain.',
        location: 'Kochi, Kerala',
        source: 'ai',
        timestamp: new Date(Date.now() - 10 * 60000),
        emoji: '⛰️',
        radius: 15
    },

    // ===== DANGER ZONE: Thiruvananthapuram (Multiple danger alerts) =====
    {
        id: 4,
        title: 'Severe Thunderstorm Warning',
        type: 'weather',
        severity: 'danger',
        message: 'Severe thunderstorms with strong winds expected. Secure loose objects and stay safe indoors.',
        location: 'Thiruvananthapuram, Kerala',
        source: 'sensor',
        timestamp: new Date(Date.now() - 30 * 60000),
        emoji: '⛈️',
        radius: 20
    },
    {
        id: 5,
        title: 'Wind Warning',
        type: 'weather',
        severity: 'danger',
        message: 'Extreme wind speeds expected. Keep children and elderly indoors.',
        location: 'Thiruvananthapuram, Kerala',
        source: 'satellite',
        timestamp: new Date(Date.now() - 25 * 60000),
        emoji: '💨',
        radius: 20
    },

    // ===== DANGER ZONE: Alappuzha (Multiple danger alerts) =====
    {
        id: 6,
        title: 'High Tide Warning',
        type: 'flood',
        severity: 'danger',
        message: 'High tide combined with heavy rains may cause severe flooding in coastal areas.',
        location: 'Alappuzha, Kerala',
        source: 'official',
        timestamp: new Date(Date.now() - 45 * 60000),
        emoji: '🌊',
        radius: 25
    },
    {
        id: 7,
        title: 'Storm Surge Alert',
        type: 'weather',
        severity: 'danger',
        message: 'Dangerous storm surge expected. Evacuate coastal communities immediately.',
        location: 'Alappuzha, Kerala',
        source: 'satellite',
        timestamp: new Date(Date.now() - 35 * 60000),
        emoji: '🌪️',
        radius: 25
    },

    // ===== DANGER ZONE: Ernakulam (Multiple danger alerts) =====
    {
        id: 8,
        title: 'Cyclone Warning',
        type: 'weather',
        severity: 'danger',
        message: 'Cyclone approaching. All residents must evacuate to safe shelters.',
        location: 'Ernakulam, Kerala',
        source: 'official',
        timestamp: new Date(Date.now() - 60 * 60000),
        emoji: '🌀',
        radius: 30
    },
    {
        id: 9,
        title: 'Power Outage Risk',
        type: 'accident',
        severity: 'danger',
        message: 'High winds may cause widespread power failures. Stock up on essentials.',
        location: 'Ernakulam, Kerala',
        source: 'ai',
        timestamp: new Date(Date.now() - 50 * 60000),
        emoji: '⚡',
        radius: 25
    },

    // ===== SAFE ZONE: Kozhikode (No danger alerts) =====
    {
        id: 10,
        title: 'All Clear - Safe Zone',
        type: 'weather',
        severity: 'info',
        message: 'Weather conditions are normal. No active weather alerts in this region.',
        location: 'Kozhikode, Kerala',
        source: 'official',
        timestamp: new Date(Date.now() - 5 * 60000),
        emoji: '✅',
        radius: 30
    },

    // ===== SAFE ZONE: Kannur (No danger alerts) =====
    {
        id: 11,
        title: 'All Clear - Safe Zone',
        type: 'weather',
        severity: 'info',
        message: 'Safe conditions prevailing. No immediate threats reported.',
        location: 'Kannur, Kerala',
        source: 'sensor',
        timestamp: new Date(Date.now() - 10 * 60000),
        emoji: '✅',
        radius: 25
    },

    // ===== SAFE ZONE: Kasaragod (No danger alerts) =====
    {
        id: 12,
        title: 'All Clear - Safe Zone',
        type: 'weather',
        severity: 'info',
        message: 'Conditions are favorable. All systems normal.',
        location: 'Kasaragod, Kerala',
        source: 'official',
        timestamp: new Date(Date.now() - 8 * 60000),
        emoji: '✅',
        radius: 20
    },

    // ===== SAFE ZONE: Palakkad (No danger alerts) =====
    {
        id: 13,
        title: 'All Clear - Safe Zone',
        type: 'weather',
        severity: 'info',
        message: 'All weather conditions are stable and safe. Continue normal activities.',
        location: 'Palakkad, Kerala',
        source: 'sensor',
        timestamp: new Date(Date.now() - 12 * 60000),
        emoji: '✅',
        radius: 22
    }
];

const mockEvents = [
    {
        id: 1,
        title: 'Flood Risk in Coastal Areas',
        type: 'flood',
        message: 'Heavy seas expected. Residents in low-lying areas should be prepared for potential flooding.',
        location: 'Kochi, Kerala',
        source: 'satellite',
        emoji: '🌊',
        timestamp: new Date(Date.now() - 2 * 60 * 60000)
    },
    {
        id: 2,
        title: 'Heat Wave Advisory',
        type: 'weather',
        message: 'Temperature expected to rise. Stay hydrated and limit outdoor activities.',
        location: 'Thiruvananthapuram, Kerala',
        source: 'ai',
        emoji: '🌡️',
        timestamp: new Date(Date.now() - 4 * 60 * 60000)
    },
    {
        id: 3,
        title: 'Landslide Risk Alert',
        type: 'accident',
        message: 'Heavy rainfall may trigger landslides in hilly areas. Exercise caution in Western Ghats region.',
        location: 'Idukki, Kerala',
        source: 'official',
        emoji: '⛰️',
        timestamp: new Date(Date.now() - 3 * 60 * 60000)
    },
    {
        id: 4,
        title: 'Normal Weather Conditions',
        type: 'weather',
        message: 'Weather is favorable. No significant weather events expected.',
        location: 'Palakkad, Kerala',
        source: 'sensor',
        emoji: '☀️',
        timestamp: new Date(Date.now() - 1 * 60 * 60000)
    }
];

const emergencyContacts = [
    { name: 'Police', emoji: '🚔', number: '100 / 911', type: 'police' },
    { name: 'Ambulance', emoji: '🚑', number: '102 / 911', type: 'ambulance' },
    { name: 'Fire Brigade', emoji: '🚒', number: '101 / 911', type: 'fire' },
    { name: 'Disaster Mgmt', emoji: '⚠️', number: '108 / 911', type: 'disaster' },
    { name: 'Traffic Police', emoji: '🚨', number: '1095', type: 'traffic' },
    { name: 'Tsunami Alert', emoji: '🌊', number: '1092', type: 'tsunami' }
];

const safetyTips = [
    {
        emoji: '🏚️',
        title: 'During Earthquake',
        description: 'Drop, Cover, and Hold On. Move away from windows and heavy objects that might fall.'
    },
    {
        emoji: '🌊',
        title: 'During Flood',
        description: 'Move to higher ground immediately. Never try to cross flooded roads or waterways.'
    },
    {
        emoji: '⛈️',
        title: 'During Thunderstorm',
        description: 'Stay indoors away from windows. Avoid using electrical devices during the storm.'
    },
    {
        emoji: '🔥',
        title: 'During Wildfire',
        description: 'Evacuate immediately if ordered. Close windows and doors. Use designated routes only.'
    },
    {
        emoji: '💨',
        title: 'During Cyclone',
        description: 'Seek shelter in designated safe zones. Keep emergency supplies ready. Stay updated.'
    },
    {
        emoji: '🚗',
        title: 'Road Safety',
        description: 'Avoid accident areas. Use alternate routes. Keep distance from emergency vehicles.'
    }
];

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    loadSettings();
    setupEventListeners();
    renderAlerts();
    renderEvents();
    renderEmergencyContacts();
    renderSafetyTips();
    updateStats();
    updateLocationInfo();
    checkAlertLevel();
    
    // Simulate real-time updates
    setInterval(updateAlerts, 30000); // Update every 30 seconds
    setInterval(updateStats, 10000); // Update stats every 10 seconds

    // Update alert icon from database on init and periodically
    try { updateAlertIconFromDB(); } catch (e) {}
    setInterval(() => { try { updateAlertIconFromDB(); } catch (e) {} }, 15000); // Update every 15s for real-time status
}

// ==================== ALERT BUTTON SOUND & EFFECT ====================
function playAlertClickSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = 720; // bright click tone
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
        o.start(now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
        o.stop(now + 0.2);
        // close audio context after short delay where supported
        setTimeout(() => { try { ctx.close(); } catch (e) {} }, 400);
    } catch (e) {
        // silently fail if audio not supported or blocked
        console.warn('Audio API not available', e);
    }
}

function animateAlertButton(btn) {
    if (!btn) return;
    btn.classList.add('alert-click-animate');
    setTimeout(() => btn.classList.remove('alert-click-animate'), 700);
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // About
    document.getElementById('aboutBtn').addEventListener('click', () => openModal('aboutModal'));
    
    // Settings
    document.getElementById('settingsBtn').addEventListener('click', () => openModal('settingsModal'));
    
    // Refresh
    document.getElementById('refreshBtn').addEventListener('click', () => {
        showToast('Refreshing alerts...');
        appState.locationFilter = null;  // Clear location filter on refresh
        updateAlerts();
    });

    // Clear alerts
    document.getElementById('clearAlertsBtn').addEventListener('click', () => {
        appState.alerts = [];
        appState.locationFilter = null;  // Clear location filter when clearing alerts
        renderAlerts();
        updateStats();
        checkAlertLevel();
        showToast('All alerts cleared and filters reset');
    });

    // Stat buttons - scroll to sections on click
    document.getElementById('alertsStatBtn')?.addEventListener('click', (e) => {
        const btn = document.getElementById('alertsStatBtn');
        // Play short click tone and animate the button for feedback
        try { if (typeof playAlertClickSound === 'function') playAlertClickSound(); } catch(e){}
        animateAlertButton(btn);
        // Confirm and send emergency alert to nearby disaster management offices
        setTimeout(() => sendEmergencyAlert(), 120);
    });
    document.getElementById('eventsStatBtn')?.addEventListener('click', () => {
        scrollToSection('eventsSection');
    });
    document.getElementById('contactsStatBtn')?.addEventListener('click', () => {
        scrollToSection('contactsSection');
    });
    document.getElementById('warningsStatBtn')?.addEventListener('click', () => {
        scrollToSection('warningsSection');
    });

    // Search location input
    const searchInput = document.getElementById('searchLocation');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            showSuggestions();
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchLocation();
            }
        });
        
        searchInput.addEventListener('blur', function(e) {
            setTimeout(hideSuggestions, 200);
        });
    }

    // Bottom navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.dataset.tab;
            handleNavigation(tab);
        });
    });

    // Disaster section controls
    const runBtn = document.getElementById('runForecastBtn');
    if (runBtn) runBtn.addEventListener('click', () => fetchDisasterForecast(appState.userLocation));
    const clearBtn = document.getElementById('clearForecastBtn');
    if (clearBtn) clearBtn.addEventListener('click', () => {
        const container = document.getElementById('disasterContainer');
        if (container) container.innerHTML = `<div class="empty-state"><p>No predictions yet. Toggle data sources and click "Run Prediction" to analyze upcoming disaster risk in your area.</p></div>`;
    });

    // Inline disaster toggles (keep in sync with settings modal toggles)
    const dsSensor = document.getElementById('dsSensorToggle');
    const dsSatellite = document.getElementById('dsSatelliteToggle');
    const dsAi = document.getElementById('dsAiToggle');
    if (dsSensor) {
        dsSensor.checked = !!appState.settings.sensorAlerts;
        dsSensor.addEventListener('change', (e) => {
            appState.settings.sensorAlerts = e.target.checked;
            const settingsCheckbox = document.getElementById('sensorToggle');
            if (settingsCheckbox) settingsCheckbox.checked = e.target.checked;
            saveSettings();
        });
    }
    if (dsSatellite) {
        dsSatellite.checked = !!appState.settings.satelliteAlerts;
        dsSatellite.addEventListener('change', (e) => {
            appState.settings.satelliteAlerts = e.target.checked;
            const settingsCheckbox = document.getElementById('satelliteToggle');
            if (settingsCheckbox) settingsCheckbox.checked = e.target.checked;
            saveSettings();
        });
    }
    if (dsAi) {
        dsAi.checked = !!appState.settings.aiPredictions;
        dsAi.addEventListener('change', (e) => {
            appState.settings.aiPredictions = e.target.checked;
            const settingsCheckbox = document.getElementById('aiToggle');
            if (settingsCheckbox) settingsCheckbox.checked = e.target.checked;
            saveSettings();
        });
    }

    // Quick emergency button in location bar
    const quickBtn = document.getElementById('quickEmergencyBtn');
    if (quickBtn) {
        quickBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // immediate visual feedback + alarm
            try { playAlarmSound(); } catch (err) { /* ignore */ }
            // animate and provide tactile feedback
            animateAlertButton(quickBtn);
            // call the existing emergency send flow (it will show overlay and success)
            sendEmergencyAlert();
        });
    }

    // Auto Alert toggle button
    const autoBtn = document.getElementById('autoAlertToggle');
    if (autoBtn) {
        // restore saved preference
        const saved = localStorage.getItem('autoAlertEnabled');
        if (saved === 'true') {
            appState.autoAlert = true;
            autoBtn.classList.add('active');
        }

        autoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            appState.autoAlert = !appState.autoAlert;
            localStorage.setItem('autoAlertEnabled', appState.autoAlert ? 'true' : 'false');
            autoBtn.classList.toggle('active', appState.autoAlert);
            showToast(`Auto Alert ${appState.autoAlert ? 'enabled' : 'disabled'}`);

            // Determine if current filtered view has danger alerts
            let alertsToCheck = appState.alerts;
            if (appState.locationFilter) {
                alertsToCheck = appState.alerts.filter(alert =>
                    alert.location.toLowerCase().includes(appState.locationFilter.toLowerCase())
                );
            }
            const hasDangerAlerts = alertsToCheck.some(alert => alert.severity === 'danger');

            if (appState.autoAlert) {
                // If enabling and danger already present, start alarm immediately
                if (hasDangerAlerts) {
                    try { startAutoAlarm(); } catch (err) {}
                    autoBtn.classList.add('blink');
                    showToast('Auto Alert enabled — alarm started');
                }
            } else {
                // If disabling, always stop any running auto alarm
                try { stopAutoAlarm(); } catch (err) {}
                autoBtn.classList.remove('blink');
                showToast('Auto Alert disabled');
            }
        });
    }

    // Also update alerts when location changes or settings change
    const customLocInput = document.getElementById('customLocation');
    if (customLocInput) {
        customLocInput.addEventListener('input', () => {
            // trigger update after user finishes typing
            clearTimeout(window.locationUpdateTimeout);
            window.locationUpdateTimeout = setTimeout(() => updateAlertIconFromDB(), 1500);
        });
    }

    // Close modals on background click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });

    // Settings form
    document.getElementById('clearAlertsBtn')?.addEventListener('click', clearAllData);

    // Second page navigation (scroll down or press 'M' for map)
    document.addEventListener('keypress', (e) => {
        // Don't trigger if user is typing in search input
        const activeId = document.activeElement && document.activeElement.id;
        if (activeId === 'searchLocation' || activeId === 'chatInput') return;
        if (e.key.toLowerCase() === 'm') {
            toggleSecondPage();
        }
    });

    // Long press or swipe down to show second page (optional scroll gesture)
    let touchStart = 0;
    document.addEventListener('touchstart', (e) => {
        touchStart = e.touches[0].clientY;
    });
    document.addEventListener('touchend', (e) => {
        const touchEnd = e.changedTouches[0].clientY;
        if (touchStart - touchEnd > 100 && !document.getElementById('secondPage').classList.contains('visible')) {
            toggleSecondPage();
        }
    });
}

// ==================== SECOND PAGE NAVIGATION ====================
function toggleSecondPage() {
    const secondPage = document.getElementById('secondPage');
    if (!secondPage) return;
    
    const appContainer = document.querySelector('.app-container');
    
    if (secondPage.classList.contains('visible')) {
        // Hide second page
        secondPage.classList.remove('visible');
        if (appContainer) appContainer.style.display = 'flex';
    } else {
        // Show second page
        secondPage.classList.add('visible');
        if (appContainer) appContainer.style.display = 'none';
        // Initialize district panel on first load
        if (!document.querySelector('.district-item')) {
            initializeDistrictPanel();
        }
    }
}

// ==================== KERALA DISTRICTS PANEL ====================
const keralaDistricts = [
    { name: 'Thiruvananthapuram', lat: 8.7426, lon: 77.0094, alert: 'danger' },
    { name: 'Kollam', lat: 8.8932, lon: 76.5844, alert: 'warning' },
    { name: 'Pathanamthitta', lat: 9.2671, lon: 76.7856, alert: 'info' },
    { name: 'Alappuzha', lat: 9.4982, lon: 76.3388, alert: 'safe' },
    { name: 'Kottayam', lat: 9.5942, lon: 76.5206, alert: 'warning' },
    { name: 'Idukki', lat: 10.3369, lon: 76.7114, alert: 'danger' },
    { name: 'Ernakulam', lat: 10.2381, lon: 76.6922, alert: 'info' },
    { name: 'Kochi', lat: 9.9312, lon: 76.2673, alert: 'safe' },
    { name: 'Thrissur', lat: 10.5276, lon: 76.2144, alert: 'warning' },
    { name: 'Palakkad', lat: 10.7867, lon: 76.6413, alert: 'safe' },
    { name: 'Malappuram', lat: 11.0076, lon: 76.0739, alert: 'warning' },
    { name: 'Kozhikode', lat: 11.2588, lon: 75.7804, alert: 'info' },
    { name: 'Wayanad', lat: 11.5989, lon: 75.7848, alert: 'safe' },
    { name: 'Kannur', lat: 12.0170, lon: 75.3704, alert: 'danger' },
    { name: 'Kasaragod', lat: 12.4804, lon: 75.0449, alert: 'warning' }
];

function getAlertColor(alertLevel) {
    const colors = {
        danger: '#ff6b6b',      // Red
        warning: '#ffa94d',     // Orange
        info: '#ffd43b',        // Yellow
        safe: '#51cf66'         // Green
    };
    return colors[alertLevel] || '#999';
}

function getAlertLabel(alertLevel) {
    const labels = {
        danger: '🔴 Danger',
        warning: '🟠 Warning',
        info: '🟡 Caution',
        safe: '🟢 Safe'
    };
    return labels[alertLevel] || 'Unknown';
}

function initializeDistrictPanel() {
    const districtList = document.getElementById('districtList');
    if (!districtList) return;
    
    districtList.innerHTML = keralaDistricts.map((district, idx) => 
        `<div class="district-item" onclick="selectDistrict(${idx})" data-district="${district.name.toLowerCase()}" style="border-left-color: ${getAlertColor(district.alert)}; background-color: rgba(${hexToRgb(getAlertColor(district.alert))}, 0.05);">
            📍 ${district.name}
            <span class="district-alert-badge" style="color: ${getAlertColor(district.alert)};">${getAlertLabel(district.alert)}</span>
        </div>`
    ).join('');
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : '0, 0, 0';
}

function toggleDistrictPanel() {
    const panel = document.getElementById('districtPanel');
    const toggle = document.getElementById('districtToggle');
    if (!panel) return;
    
    panel.classList.toggle('collapsed');
    toggle.classList.toggle('collapsed');
}

function filterDistricts() {
    const searchTerm = document.getElementById('districtSearch').value.toLowerCase();
    const items = document.querySelectorAll('.district-item');
    items.forEach(item => {
        const districtName = item.dataset.district;
        item.style.display = districtName.includes(searchTerm) ? 'block' : 'none';
    });
}

function selectDistrict(index) {
    const district = keralaDistricts[index];
    
    // Update active state
    document.querySelectorAll('.district-item').forEach((item, idx) => {
        item.classList.toggle('active', idx === index);
    });
    
    // Show notification
    showToast(`📍 Selected: ${district.name}`);
}

function goToBlankPage() {
    window.location.href = 'blank.html';
}

function goToHero() {
    // Hide app container and show hero
    const hero = document.getElementById('hero');
    const appContainer = document.querySelector('.app-container');
    const secondPage = document.getElementById('secondPage');
    
    // Recreate hero if it was removed
    if (!hero) {
        location.reload();
        return;
    }
    
    // Show hero with animation
    hero.style.opacity = '1';
    hero.style.transform = 'translateY(0)';
    hero.style.visibility = 'visible';
    
    // Hide app container and second page
    if (appContainer) appContainer.style.visibility = 'hidden';
    if (secondPage) secondPage.classList.remove('visible');
}

// ==================== DISASTER PREDICTION SIMULATION ====================
function playProcessingSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.value = 320; // low processing hum
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        g.gain.linearRampToValueAtTime(0.04, now + 0.05);
        o.start(now);
        // ramp down gradually
        g.gain.linearRampToValueAtTime(0.0001, now + 1.6);
        o.stop(now + 1.7);
        setTimeout(() => { try { ctx.close(); } catch (e) {} }, 2000);
    } catch (e) {
        console.warn('Audio API not available for processing sound', e);
    }
}

// Short alarm sound for emergency button
function playAlarmSound() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sawtooth';
        o.frequency.value = 880;
        g.gain.value = 0.0001;
        o.connect(g);
        g.connect(ctx.destination);
        const now = ctx.currentTime;
        // quick rising burst
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.2, now + 0.03);
        o.start(now);
        // create a descending siren effect with 3 short pulses
        const pulseTimes = [0.0, 0.22, 0.44];
        pulseTimes.forEach((p, i) => {
            const t = now + p;
            o.frequency.setValueAtTime(880 - i * 80, t);
            g.gain.exponentialRampToValueAtTime(0.12 - i*0.03, t + 0.06);
        });
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
        o.stop(now + 1.05);
        setTimeout(() => { try { ctx.close(); } catch (e) {} }, 1500);
    } catch (e) {
        console.warn('Alarm sound unavailable', e);
    }
}

// ==================== AUTO ALARM (LOOPING SIREN) ====================
function startAutoAlarm() {
    if (appState.autoAlarmActive) return;
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        const ctx = new AudioCtx();

        // Two oscillators to create a fuller siren + an LFO to modulate frequency
        const o1 = ctx.createOscillator();
        const o2 = ctx.createOscillator();
        const gain = ctx.createGain();
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();

        o1.type = 'sawtooth';
        o2.type = 'sine';
        o1.frequency.value = 720;
        o2.frequency.value = 360;

        // LFO modulates the frequency of the main oscillators for a wailing siren
        lfo.type = 'sine';
        lfo.frequency.value = 1.6; // cycles per second
        // lower modulation depth for less aggressive pitch swings
        lfoGain.gain.value = 90;
        lfo.connect(lfoGain);
        lfoGain.connect(o1.frequency);
        lfoGain.connect(o2.frequency);

        gain.gain.value = 0.0001; // start quiet

        o1.connect(gain);
        o2.connect(gain);
        gain.connect(ctx.destination);

        const now = ctx.currentTime;
        // ramp to a moderate volume quickly (reduced per user request)
        gain.gain.exponentialRampToValueAtTime(0.12, now + 0.06);

        o1.start(now);
        o2.start(now);
        lfo.start(now);

        appState.autoAlarmCtx = { ctx, o1, o2, lfo, lfoGain, gain };
        appState.autoAlarmActive = true;
    } catch (e) {
        console.warn('Auto alarm failed to start', e);
    }
}

function stopAutoAlarm() {
    if (!appState.autoAlarmActive || !appState.autoAlarmCtx) return;
    try {
        const { ctx, o1, o2, lfo, gain } = appState.autoAlarmCtx;
        const now = ctx.currentTime;
        // Ramp down smoothly then stop
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        setTimeout(() => {
            try { o1.stop(); } catch (e) {}
            try { o2.stop(); } catch (e) {}
            try { lfo.stop(); } catch (e) {}
            try { ctx.close(); } catch (e) {}
            appState.autoAlarmCtx = null;
            appState.autoAlarmActive = false;
        }, 400);
    } catch (e) {
        console.warn('Auto alarm failed to stop', e);
        appState.autoAlarmCtx = null;
        appState.autoAlarmActive = false;
    }
}

function fetchDisasterForecast(location) {
    const container = document.getElementById('disasterContainer');
    if (!container) return showToast('Prediction UI not found');
    const sensors = !!appState.settings.sensorAlerts;
    const satellite = !!appState.settings.satelliteAlerts;
    const ai = !!appState.settings.aiPredictions;

    // show loading state with spinner and message
    container.innerHTML = `<div class="disaster-loading"><div class="disaster-spinner"></div><div>Analyzing data from selected sources... This may take a moment.</div></div>`;
    showToast('Running disaster prediction — this may take a few seconds');
    playProcessingSound();
    // Simulate processing time depending on selected sources
    let delay = 1200; // base
    if (sensors) delay += 800;
    if (satellite) delay += 1000;
    if (ai) delay += 1600; // AI adds computation time

    setTimeout(() => {
        const predictions = generatePredictions(location, { sensors, satellite, ai });
        displayDisasterData(predictions, location);
        showToast('Prediction complete');
    }, delay);
}

// ==================== SEND EMERGENCY ALERT (FRONTEND) ====================
async function sendEmergencyAlert() {
    const confirmSend = confirm('Send an immediate emergency alert to nearby disaster management offices?');
    if (!confirmSend) return;

    // Build payload: use user coords if available
    let lat = null, lon = null;
    if (appState.userCoords && Array.isArray(appState.userCoords)) {
        lat = appState.userCoords[0];
        lon = appState.userCoords[1];
    }

    const payload = {
        title: 'Emergency Alert from ALERT 360',
        message: 'Immediate assistance required at the reported location. Please respond.',
        type: 'emergency',
        severity: 'danger',
        latitude: lat,
        longitude: lon,
        radius: 50,
        locationName: appState.userLocation || 'Unknown'
    };

    try {
        showToast('Dispatching emergency alert...');
        // show immediate visual effect to indicate action
        try { showEmergencyEffect('Sending...'); } catch (e) {}
        const res = await fetch('/api/v1/alerts/emergency', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Failed to dispatch emergency alert');

        // show success message and stronger effect
        showToast('Message sent successfully');
        try { showEmergencyEffect('Message sent successfully', true); } catch (e) {}
        // Refresh alert status immediately after sending emergency
        setTimeout(() => { try { updateAlertIconFromDB(); } catch (e) {} }, 500);
    } catch (err) {
        console.error('Emergency send error', err);
        showToast('Failed to send emergency alert');
    }
}

// Create a temporary full-screen effect with optional success state
function showEmergencyEffect(message = 'Sending...', success = false) {
    const existing = document.querySelector('.emergency-effect');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'emergency-effect';
    el.innerHTML = `<div class="card"><div class="icon">${success ? '✅' : '📡'}</div><div class="msg">${message}</div></div>`;
    document.body.appendChild(el);
    // auto-remove slightly earlier if success to show toast
    setTimeout(() => { el.remove(); }, success ? 900 : 1200);
}

// ==================== UPDATE ALERT ICON FROM DATABASE & WEATHER ====================
async function updateAlertIconFromDB() {
    const iconEl = document.querySelector('.alert-icon');
    const textEl = document.querySelector('.alert-text');
    const countEl = document.getElementById('activeAlerts');
    let highestSeverity = 'safe'; // default

    try {
        // Step 1: Geocode location to lat/lon
        let lat = null, lon = null;
        if (appState.userCoords && Array.isArray(appState.userCoords) && appState.userCoords.length >= 2) {
            lat = appState.userCoords[0];
            lon = appState.userCoords[1];
        } else if (appState.userLocation) {
            const apiKey = localStorage.getItem('owmApiKey') || appState.owmApiKey;
            if (apiKey) {
                try {
                    const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(appState.userLocation)}&limit=1&appid=${apiKey}`);
                    if (geoRes.ok) {
                        const geoJson = await geoRes.json();
                        if (Array.isArray(geoJson) && geoJson.length > 0) {
                            lat = geoJson[0].lat;
                            lon = geoJson[0].lon;
                            appState.userCoords = [lat, lon];
                        }
                    }
                } catch (e) { console.warn('Geocode failed', e); }
            }
        }

        // Step 2: Fetch disaster alerts from backend
        let alerts = [];
        if (typeof lat === 'number' && typeof lon === 'number') {
            const res = await fetch(`/api/v1/alerts/location?latitude=${lat}&longitude=${lon}&radius=50`);
            if (res.ok) {
                const json = await res.json();
                alerts = Array.isArray(json.data) ? json.data : [];
            }
        } else {
            const res = await fetch('/api/v1/alerts');
            if (res.ok) {
                const json = await res.json();
                alerts = Array.isArray(json.data) ? json.data : [];
            }
        }

        // Check alert severity from database
        for (const a of alerts) {
            if (a.severity === 'danger') { highestSeverity = 'danger'; break; }
            if (a.severity === 'warning' && highestSeverity !== 'danger') highestSeverity = 'warning';
        }
        if (countEl) countEl.textContent = alerts.length;

        // Step 3: Check weather severity if API key available
        const apiKey = localStorage.getItem('owmApiKey') || appState.owmApiKey;
        if (apiKey && typeof lat === 'number' && typeof lon === 'number' && highestSeverity !== 'danger') {
            try {
                const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
                if (weatherRes.ok) {
                    const weather = await weatherRes.json();
                    // Map weather conditions to severity
                    if (weather.weather && weather.weather[0]) {
                        const condition = weather.weather[0].main.toLowerCase();
                        // Severe conditions = danger (red light)
                        if (['thunderstorm', 'tornado'].some(c => condition.includes(c))) {
                            highestSeverity = 'danger';
                        }
                        // Warning conditions (orange light)
                        else if (['rain', 'snow', 'sleet', 'hail', 'squall', 'dust', 'sand', 'ash', 'fog', 'mist'].some(c => condition.includes(c))) {
                            if (highestSeverity === 'safe') highestSeverity = 'warning';
                        }
                        // Check wind speed for strong conditions
                        if (weather.wind && weather.wind.speed > 10 && highestSeverity === 'safe') highestSeverity = 'warning';
                    }
                }
            } catch (e) { console.warn('Weather check failed', e); }
        }

        // Step 4: Update DOM with severity status (red/green/orange lights)
        if (iconEl && textEl) {
            const alertLevel = document.getElementById('alertLevel');
            if (highestSeverity === 'danger') {
                iconEl.textContent = '🔴';
                textEl.textContent = 'Danger';
                if (alertLevel) alertLevel.className = 'alert-level danger';
                // Add blinking animation for danger
                iconEl.classList.add('blink-danger');
            } else if (highestSeverity === 'warning') {
                iconEl.textContent = '🟠';
                textEl.textContent = 'Warning';
                if (alertLevel) alertLevel.className = 'alert-level warning';
                // Remove blinking for warning
                iconEl.classList.remove('blink-danger');
            } else {
                iconEl.textContent = '🟢';
                textEl.textContent = 'Safe';
                if (alertLevel) alertLevel.className = 'alert-level';
                // Remove blinking for safe
                iconEl.classList.remove('blink-danger');
            }
        }
    } catch (err) {
        console.error('updateAlertIconFromDB error', err);
    }
}

function generatePredictions(location, sources) {
    // Basic simulated model that creates 2-3 predictions with probabilities influenced by sources
    const baseEvents = ['Flood', 'Earthquake', 'Wildfire', 'Storm', 'Landslide', 'Tsunami'];
    // pick 2-3 events
    const count = Math.random() < 0.45 ? 3 : 2;
    const chosen = [];
    while (chosen.length < count) {
        const pick = baseEvents[Math.floor(Math.random() * baseEvents.length)];
        if (!chosen.includes(pick)) chosen.push(pick);
    }

    return chosen.map((ev, idx) => {
        // base probability
        let prob = 10 + Math.floor(Math.random() * 40);
        if (sources.sensors) prob += 12;
        if (sources.satellite && (ev === 'Flood' || ev === 'Wildfire' || ev === 'Storm')) prob += 18;
        if (sources.ai) prob = Math.min(98, prob + 20 + Math.floor(Math.random() * 10));
        const etaHours = Math.max(1, Math.floor(Math.random() * 72));
        const confidence = Math.min(99, Math.round(prob));
        return {
            id: `${Date.now()}-${idx}`,
            type: ev,
            probability: confidence,
            etaHours,
            sources: Object.keys(sources).filter(k => sources[k])
        };
    });
}

function displayDisasterData(predictions, locationLabel) {
    const container = document.getElementById('disasterContainer');
    if (!container) return;
    if (!predictions || predictions.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>No imminent threats detected for ${locationLabel || 'your area'}.</p></div>`;
        return;
    }

    const html = `
        <div class="disaster-grid">
            ${predictions.map(p => `
                <div class="disaster-card">
                    <div class="disaster-title">${p.type} <span style="float:right; font-size:0.9rem; color:var(--text-secondary);">ETA: ${p.etaHours}h</span></div>
                    <div style="margin-bottom:0.5rem;">Probability: <span class="disaster-prob">${p.probability}%</span></div>
                    <div style="font-size:0.9rem; color:var(--text-secondary); margin-bottom:0.6rem;">Sources: ${p.sources.length ? p.sources.join(', ') : 'Basic model'}</div>
                    <div style="font-size:0.9rem; color:var(--text-secondary);">Recommended Actions:</div>
                    <ul style="margin-top:0.4rem; color:var(--text-secondary);">
                        <li>${generateAdviceForEvent(p.type)}</li>
                        <li>Monitor local channels and official alerts</li>
                    </ul>
                </div>
            `).join('')}
        </div>
    `;

    container.innerHTML = html;
}

function generateAdviceForEvent(ev) {
    switch (ev.toLowerCase()) {
        case 'flood': return 'Move to higher ground; avoid driving through floodwater.';
        case 'earthquake': return 'Drop, cover and hold on; secure heavy objects.';
        case 'wildfire': return 'Prepare to evacuate; keep emergency kit ready.';
        case 'storm': return 'Secure outdoor objects; stay indoors and away from windows.';
        case 'landslide': return 'Avoid slopes and river valleys; move uphill.';
        case 'tsunami': return 'Move inland and to higher ground immediately.';
        default: return 'Follow official guidance and be prepared to act quickly.';
    }
}

// ==================== SECTION TOGGLE ====================
function toggleSection(sectionName) {
    const section = document.querySelector(`[data-section="${sectionName}"]`);
    if (!section) return;
    
    const content = section.querySelector('.section-content');
    const btn = section.querySelector('.expand-btn');
    
    if (section.classList.contains('collapsed')) {
        // Expand
        section.classList.remove('collapsed');
        content.classList.remove('hidden');
        // If opening chatbot, focus the input so user can type immediately
        if (sectionName === 'chatbot') {
            setTimeout(() => {
                const chatInput = document.getElementById('chatInput');
                if (chatInput) chatInput.focus();
            }, 140);
        }
    } else {
        // Collapse
        section.classList.add('collapsed');
        content.classList.add('hidden');
    }
}

// ==================== SCROLL TO SECTION ====================
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        // Auto-expand the section
        const sectionName = section.dataset.section;
        if (sectionName && section.classList.contains('collapsed')) {
            toggleSection(sectionName);
        }
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// ==================== MODAL MANAGEMENT ====================
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

// ==================== DETAIL MODAL ====================
function showDetailModal(type, id) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    let item = null;
    let html = '';
    
    if (type === 'alert') {
        item = appState.alerts.find(a => a.id === id);
        if (item) {
            html = `
                <div class="detail-header">
                    <div class="detail-icon-large">${item.emoji}</div>
                    <h2>${item.title}</h2>
                    <span class="detail-severity ${item.severity}">${item.severity.toUpperCase()}</span>
                </div>
                <div class="detail-body">
                    <div class="detail-section">
                        <h3>📍 Location</h3>
                        <p>${item.location}</p>
                        <p class="detail-sub">Radius: ${item.radius} km</p>
                    </div>
                    <div class="detail-section">
                        <h3>⏰ Time</h3>
                        <p>${formatTime(item.timestamp)}</p>
                    </div>
                    <div class="detail-section">
                        <h3>📝 Details</h3>
                        <p>${item.message}</p>
                    </div>
                    <div class="detail-section">
                        <h3>🏷️ Type</h3>
                        <p>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                    </div>
                </div>
            `;
        }
    } else if (type === 'event') {
        item = appState.events.find(e => e.id === id);
        if (item) {
            html = `
                <div class="detail-header">
                    <div class="detail-icon-large">${item.emoji}</div>
                    <h2>${item.title}</h2>
                </div>
                <div class="detail-body">
                    <div class="detail-section">
                        <h3>📍 Location</h3>
                        <p>${item.location}</p>
                    </div>
                    <div class="detail-section">
                        <h3>⏰ Time</h3>
                        <p>${formatTime(item.timestamp)}</p>
                    </div>
                    <div class="detail-section">
                        <h3>📝 Details</h3>
                        <p>${item.message}</p>
                    </div>
                    <div class="detail-section">
                        <h3>🏷️ Type</h3>
                        <p>${item.type.charAt(0).toUpperCase() + item.type.slice(1)}</p>
                    </div>
                </div>
            `;
        }
    } else if (type === 'tip') {
        item = safetyTips[id];
        if (item) {
            html = `
                <div class="detail-header">
                    <div class="detail-icon-large">${item.emoji}</div>
                    <h2>${item.title}</h2>
                </div>
                <div class="detail-body">
                    <div class="detail-section">
                        <h3>💡 Safety Tip</h3>
                        <p>${item.description}</p>
                    </div>
                </div>
            `;
        }
    }
    
    if (html) {
        content.innerHTML = html;
        openModal('detailModal');
    }
}

// ==================== ALERTS RENDERING ====================
function renderAlerts() {
    const container = document.getElementById('alertsContainer');
    
    if (appState.alerts.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>✅ No active alerts in your area</p></div>';
        return;
    }
    // apply source filter AND location filter
    const filtered = appState.alerts.filter(alert => {
        // Check source filter
        if (!appState.alertSourceFilter || appState.alertSourceFilter === 'all') {
            const sourceOk = true;
        } else {
            const sourceOk = (alert.source || 'official') === appState.alertSourceFilter;
        }
        
        // Check location filter (if active)
        let locationOk = true;
        if (appState.locationFilter) {
            locationOk = (alert.location || '').toLowerCase().includes(appState.locationFilter);
        }
        
        return sourceOk && locationOk;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>✅ No alerts found for this location</p></div>';
        return;
    }

    container.innerHTML = filtered.map(alert => `
        <div class="alert-card ${alert.severity}">
            <div class="alert-header">
                <button class="alert-title-icon" onclick="showDetailModal('alert', ${alert.id})" title="${alert.title}">
                    <span class="alert-title-emoji">${alert.emoji}</span>
                </button>
                <span class="alert-severity ${alert.severity}">${alert.severity.toUpperCase()}</span>
            </div>
            <div class="icon-row">
                <div class="icon-item" title="Type">${getTypeEmoji(alert.type)} <span class="icon-label">${alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}</span></div>
                <div class="icon-item" title="Location">📍 <span class="icon-label">${alert.location}</span></div>
                <div class="icon-item" title="Time">⏱️ <span class="icon-label">${formatTime(alert.timestamp)}</span></div>
                <div class="icon-item" title="Radius">📏 <span class="icon-label">${alert.radius} km</span></div>
            </div>
            <div class="alert-message">${alert.message}</div>
            <div class="source-badge source-${alert.source || 'official'}">${getSourceIcon(alert.source)} ${getSourceLabel(alert.source)}</div>
        </div>
    `).join('');
}

// ==================== EVENTS RENDERING ====================
function renderEvents() {
    const container = document.getElementById('eventsContainer');
    
    if (appState.events.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No nearby events</p></div>';
        return;
    }

    // Filter by location if search filter is active
    const filtered = appState.events.filter(event => {
        if (appState.locationFilter) {
            return (event.location || '').toLowerCase().includes(appState.locationFilter);
        }
        return true;
    });

    if (filtered.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No events found for this location</p></div>';
        return;
    }

    container.innerHTML = filtered.map(event => `
        <div class="event-card">
            <div class="alert-header">
                <button class="alert-title-icon" onclick="showDetailModal('event', ${event.id})" title="${event.title}">
                    <span class="alert-title-emoji">${event.emoji}</span>
                </button>
            </div>
            <div class="icon-row">
                <div class="icon-item" title="Type">${getTypeEmoji(event.type)} <span class="icon-label">${event.type.charAt(0).toUpperCase() + event.type.slice(1)}</span></div>
                <div class="icon-item" title="Location">📍 <span class="icon-label">${event.location}</span></div>
                <div class="icon-item" title="Time">⏱️ <span class="icon-label">${formatTime(event.timestamp)}</span></div>
            </div>
            <div class="alert-message">${event.message}</div>
        </div>
    `).join('');
}

// ==================== EMERGENCY CONTACTS ====================
function renderEmergencyContacts() {
    const container = document.getElementById('contactsGrid');
    
    container.innerHTML = emergencyContacts.map(contact => `
        <div class="contact-card" onclick="triggerEmergency('${contact.type}')">
            <div class="contact-icon">${contact.emoji}</div>
            <div class="contact-name">${contact.name}</div>
            <div class="contact-number">${contact.number}</div>
        </div>
    `).join('');
}

// ==================== SAFETY TIPS ====================
function renderSafetyTips() {
    const container = document.getElementById('tipsContainer');
    
    container.innerHTML = safetyTips.map((tip, index) => `
        <div class="tip-card">
            <button class="tip-icon-btn" onclick="showDetailModal('tip', ${index})" title="${tip.title}">
                <span class="tip-icon">${tip.emoji}</span>
            </button>
            <div class="icon-row tip-icons">
                <div class="icon-item" title="Category">💡 <span class="icon-label">Safety</span></div>
            </div>
            <div class="tip-description">${tip.description}</div>
        </div>
    `).join('');
}

// ==================== STATISTICS ====================
function updateStats() {
    document.getElementById('activeAlerts').textContent = appState.alerts.length;
    
    const nearbyEvents = appState.events.filter(e => {
        const eLoc = (e.location || '').toLowerCase();
        const uLoc = (appState.userLocation || '').toLowerCase();
        // Match if either string contains the other (handles 'Kerala' vs 'Kerala, India', 'Kochi, Kerala' etc.)
        return eLoc.includes(uLoc) || uLoc.includes(eLoc) || eLoc.includes(uLoc.split(',')[0]);
    }).length;
    document.getElementById('nearbyCount').textContent = nearbyEvents;
    
    const warnings = appState.alerts.filter(a => a.severity === 'warning').length;
    document.getElementById('warningCount').textContent = warnings;
}

// ==================== LOCATION MANAGEMENT ====================
function updateLocationInfo() {
    document.getElementById('locationName').textContent = appState.userLocation;
}

function updateLocation() {
    const newLocation = document.getElementById('customLocation').value.trim();
    if (newLocation) {
        appState.userLocation = newLocation;
        updateLocationInfo();
        renderAlerts();
        renderEvents();
        updateStats();
        checkAlertLevel();
        closeModal('settingsModal');
        showToast(`Location updated to ${newLocation}`);
    }
}

// ==================== SEARCH LOCATION ====================
function searchLocation() {
    const searchInput = document.getElementById('searchLocation');
    const location = searchInput.value.trim();
    
    if (location) {
        appState.userLocation = location;
        appState.locationFilter = location.toLowerCase();  // Store filter for filtered display
        updateLocationInfo();
        renderAlerts();
        renderEvents();
        updateStats();
        checkAlertLevel();
        showToast(`Showing details for: ${location}`);
        searchInput.value = '';
        hideSuggestions();
    }
}

// ==================== LOCATION SUGGESTIONS ====================
function showSuggestions() {
    const searchInput = document.getElementById('searchLocation');
    const suggestionsDropdown = document.getElementById('suggestionsDropdown');
    const query = searchInput.value.trim().toLowerCase();
    
    if (query.length === 0) {
        hideSuggestions();
        return;
    }
    
    // If OpenWeatherMap API key is available, use its geocoding endpoint for worldwide, up-to-date suggestions.
    let filteredLocations = [];
    const apiKey = appState.owmApiKey || localStorage.getItem('owmApiKey');

    if (apiKey && query.length >= 3) {
        // Check cache first
        if (appState.geoCache[query]) {
            appState.lastSuggestions = appState.geoCache[query];
        } else {
            // fetch suggestions (do not await here — we'll await synchronously to keep UI predictable)
            try {
                const resp = fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=8&appid=${apiKey}`);
                // store a promise first so repeated keystrokes don't duplicate
                appState.geoCache[query] = [];
                resp.then(r => r.json()).then(json => {
                    const items = (Array.isArray(json) ? json : []).map(loc => {
                        const label = loc.state ? `${loc.name}, ${loc.state}, ${loc.country}` : `${loc.name}, ${loc.country}`;
                        return { label, lat: loc.lat, lon: loc.lon };
                    });
                    appState.geoCache[query] = items;
                    appState.lastSuggestions = items;
                    // render UI if still relevant
                    if (document.getElementById('searchLocation') && document.getElementById('searchLocation').value.trim().toLowerCase() === query) {
                        suggestionsDropdown.innerHTML = appState.lastSuggestions.map((s, i) => `
                            <div class="suggestion-item" onclick="selectSuggestionIndex(${i})">${s.label}</div>
                        `).join('');
                        suggestionsDropdown.classList.add('active');
                    }
                }).catch(err => {
                    console.error('Geocode fetch error', err);
                    appState.geoCache[query] = [];
                });
            } catch (err) {
                console.error('Geocode immediate error', err);
            }
        }

        // If cache already had results, render them immediately
        if (appState.lastSuggestions && appState.lastSuggestions.length > 0) {
            suggestionsDropdown.innerHTML = appState.lastSuggestions.map((s, i) => `
                <div class="suggestion-item" onclick="selectSuggestionIndex(${i})">${s.label}</div>
            `).join('');
        } else {
            // show a loading placeholder
            suggestionsDropdown.innerHTML = `<div class="suggestion-item">Searching ${query}...</div>`;
        }

        suggestionsDropdown.classList.add('active');
        return;
    }

    // Fallback to the static `worldLocations` list for offline suggestions
    const starts = worldLocations.filter(location => location.toLowerCase().startsWith(query));
    const includes = worldLocations.filter(location => !location.toLowerCase().startsWith(query) && location.toLowerCase().includes(query));
    filteredLocations = [...starts, ...includes].slice(0, 12); // limit suggestions

    if (filteredLocations.length === 0) {
        hideSuggestions();
        return;
    }

    // store lastSuggestions as simple labels for selection
    appState.lastSuggestions = filteredLocations.map(l => ({ label: l }));

    // Create suggestion items
    suggestionsDropdown.innerHTML = filteredLocations.map((location, index) => `
        <div class="suggestion-item" onclick="selectSuggestionIndex(${index})">
            ${location}
        </div>
    `).join('');
    
    // Position dropdown below search container
    const searchContainer = searchInput.parentElement;
    const rect = searchContainer.getBoundingClientRect();
    suggestionsDropdown.style.position = 'fixed';
    suggestionsDropdown.style.top = (rect.bottom + 8) + 'px';
    suggestionsDropdown.style.left = rect.left + 'px';
    suggestionsDropdown.style.width = rect.width + 'px';
    
    suggestionsDropdown.classList.add('active');
}

function hideSuggestions() {
    const suggestionsDropdown = document.getElementById('suggestionsDropdown');
    suggestionsDropdown.classList.remove('active');
    suggestionsDropdown.innerHTML = '';
}

function selectSuggestion(location) {
    const searchInput = document.getElementById('searchLocation');
    searchInput.value = location;
    appState.userLocation = location;
    updateLocationInfo();
    renderAlerts();
    renderEvents();
    updateStats();
    checkAlertLevel();
    showToast(`Location changed to: ${location}`);
    hideSuggestions();
}

function selectSuggestionIndex(index) {
    const item = appState.lastSuggestions[index];
    if (!item) return;
    const label = item.label || item;
    // if lat/lon is present, store userCoords for future API usage
    if (item.lat && item.lon) {
        appState.userCoords = { lat: item.lat, lng: item.lon };
    }
    appState.userLocation = label;
    const searchInput = document.getElementById('searchLocation');
    if (searchInput) searchInput.value = label;
    updateLocationInfo();
    renderAlerts();
    renderEvents();
    updateStats();
    checkAlertLevel();
    showToast(`Location changed to: ${label}`);
    hideSuggestions();
}

// ==================== ALERT LEVEL CHECK ====================
function checkAlertLevel() {
    const levelElement = document.querySelector('.alert-level');
    
    // Filter alerts based on current location search
    let alertsToCheck = appState.alerts;
    if (appState.locationFilter) {
        alertsToCheck = appState.alerts.filter(alert => 
            alert.location.toLowerCase().includes(appState.locationFilter.toLowerCase())
        );
    }
    
    // Check if any alerts have 'danger' severity
    const hasDangerAlerts = alertsToCheck.some(alert => alert.severity === 'danger');

    if (hasDangerAlerts) {
        levelElement.innerHTML = '<span class="alert-icon">🔴</span><span class="alert-text">Danger</span>';
        levelElement.className = 'alert-level danger';
        triggerNotification('DANGER ALERT', 'Danger alerts detected in your area!');
        // If autoAlert is enabled, start the auto alarm and show blink on button
        const autoBtn = document.getElementById('autoAlertToggle');
        if (appState.autoAlert) {
            try { startAutoAlarm(); } catch (e) {}
            if (autoBtn) autoBtn.classList.add('blink');
        }
    } else {
        levelElement.innerHTML = '<span class="alert-icon">🟢</span><span class="alert-text">Safe</span>';
        levelElement.className = 'alert-level safe';
        // Stop auto alarm and remove blink
        const autoBtnOff = document.getElementById('autoAlertToggle');
        try { stopAutoAlarm(); } catch (e) {}
        if (autoBtnOff) autoBtnOff.classList.remove('blink');
    }
}

// ==================== EMERGENCY TRIGGERS ====================
function triggerEmergency(type) {
    const emergencyMap = {
        police: { name: 'Police', number: '100' },
        ambulance: { name: 'Ambulance', number: '102' },
        fire: { name: 'Fire Brigade', number: '101' },
        disaster: { name: 'Disaster Management', number: '108' },
        traffic: { name: 'Traffic Police', number: '1095' },
        tsunami: { name: 'Tsunami Alert', number: '1092' }
    };

    const emergency = emergencyMap[type];
    if (emergency) {
        showToast(`Calling ${emergency.name} (${emergency.number})`);
        
        // Trigger vibration if available
        if (appState.settings.vibrationAlert && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }

        // Play sound alert if available
        if (appState.settings.soundAlert) {
            playEmergencySound();
        }

        console.log(`Emergency: ${emergency.name} at ${emergency.number}`);
    }
}

function showAlertDetail(alertId) {
    const alert = appState.alerts.find(a => a.id === alertId);
    if (alert) {
        const detailContent = `
            <div style="padding-top: 1rem;">
                <h3 style="margin-bottom: 1rem; color: var(--info-color);">
                    ${alert.emoji} ${alert.title}
                </h3>
                <div style="margin-bottom: 1.5rem;">
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        SEVERITY: <span style="color: var(--primary-color); font-weight: 600;">${alert.severity.toUpperCase()}</span>
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        TYPE: <span style="color: var(--text-primary);">${alert.type.toUpperCase()}</span>
                    </p>
                    <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        TIME: <span style="color: var(--text-primary);">${new Date(alert.timestamp).toLocaleString()}</span>
                    </p>
                </div>
                <div style="background: rgba(77, 171, 247, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="line-height: 1.6; color: var(--text-primary);">${alert.message}</p>
                </div>
                <div style="margin-bottom: 1rem;">
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        <strong>📍 Affected Area:</strong> ${alert.location}
                    </p>
                    <p style="font-size: 0.9rem; color: var(--text-secondary);">
                        <strong>📏 Radius:</strong> ${alert.radius} km
                    </p>
                </div>
                <button class="btn-primary" onclick="closeModal('alertDetailModal'); showToast('Alert saved to your watch list')">
                    ⭐ Save for Later
                </button>
            </div>
        `;
        
        document.getElementById('alertDetailContent').innerHTML = detailContent;
        openModal('alertDetailModal');
    }
}

function showEventDetail(eventId) {
    const event = appState.events.find(e => e.id === eventId);
    if (event) {
        const detailContent = `
            <div style="padding-top: 1rem;">
                <h3 style="margin-bottom: 1rem; color: var(--info-color);">
                    ${event.emoji} ${event.title}
                </h3>
                <div style="background: rgba(77, 171, 247, 0.1); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="line-height: 1.6; color: var(--text-primary);">${event.message}</p>
                </div>
                <div style="margin-bottom: 1.5rem;">
                    <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
                        <strong>📍 Location:</strong> ${event.location}
                    </p>
                    <p style="font-size: 0.9rem; color: var(--text-secondary);">
                        <strong>⏰ Time:</strong> ${new Date(event.timestamp).toLocaleString()}
                    </p>
                </div>
                <button class="btn-primary" onclick="closeModal('alertDetailModal');">
                    Got it, thanks!
                </button>
            </div>
        `;
        
        document.getElementById('alertDetailContent').innerHTML = detailContent;
        openModal('alertDetailModal');
    }
}

// ==================== SOS MODAL ====================
function handleNavigation(tab) {
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

    switch(tab) {
        case 'alerts':
            document.querySelector('.main-content').scrollTop = 0;
            break;
        case 'emergency':
            openModal('sosModal');
            break;
        case 'settings':
            openModal('settingsModal');
            break;
        case 'map':
            showToast('Map feature coming soon!');
            break;
    }
}

// ==================== SETTINGS ====================
function loadSettings() {
    const settingsForm = [
        { id: 'notifToggle', key: 'notificationsEnabled' },
        { id: 'soundToggle', key: 'soundAlert' },
        { id: 'vibrationToggle', key: 'vibrationAlert' },
        { id: 'weatherToggle', key: 'weatherAlerts' },
        { id: 'earthquakeToggle', key: 'earthquakeAlerts' },
        { id: 'floodToggle', key: 'floodWarnings' },
        { id: 'accidentToggle', key: 'accidentAlerts' },
        { id: 'sensorToggle', key: 'sensorAlerts' },
        { id: 'satelliteToggle', key: 'satelliteAlerts' },
        { id: 'aiToggle', key: 'aiPredictions' }
    ];

    settingsForm.forEach(item => {
        const element = document.getElementById(item.id);
        if (element) {
            element.checked = appState.settings[item.key];
            element.addEventListener('change', (e) => {
                appState.settings[item.key] = e.target.checked;
                saveSettings();
            });
        }
    });

    // Load saved OpenWeatherMap API key into input if present
    const owmKey = localStorage.getItem('owmApiKey');
    if (owmKey) {
        appState.owmApiKey = owmKey;
        const input = document.getElementById('owmApiKeyInput');
        if (input) input.value = owmKey;
    }
}

function saveApiKey() {
    const input = document.getElementById('owmApiKeyInput');
    if (!input) return showToast('API key input not found');
    const key = input.value.trim();
    if (!key) return showToast('Please enter a valid OpenWeatherMap API key');
    localStorage.setItem('owmApiKey', key);
    appState.owmApiKey = key;
    showToast('OpenWeatherMap API key saved');
}

async function fetchWeatherForLocation(location) {
    if (!location) return showToast('Set a location first');
    const apiKey = appState.owmApiKey || localStorage.getItem('owmApiKey');
    if (!apiKey) return showToast('OpenWeatherMap API key missing. Add it in Settings.');

    try {
        showToast(`Fetching weather for ${location}...`);
        // Step 1: Geocode the location to lat/lon using OpenWeatherMap geocoding
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`);
        if (!geoRes.ok) throw new Error('Geocoding failed');
        const geoJson = await geoRes.json();
        if (!Array.isArray(geoJson) || geoJson.length === 0) throw new Error('Location not found');
        const { lat, lon, name, country, state } = geoJson[0];
        const prettyName = state ? `${name}, ${state}, ${country}` : `${name}, ${country}`;

        // Step 2: Fetch weather (One Call API)
        const onecallUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely&units=metric&appid=${apiKey}`;
        const weatherRes = await fetch(onecallUrl);
        if (!weatherRes.ok) throw new Error('Weather fetch failed');
        const weatherJson = await weatherRes.json();

        displayWeatherData(weatherJson, prettyName);
        showToast(`Weather updated for ${prettyName}`);
    } catch (err) {
        console.error(err);
        showToast('Unable to fetch weather. Check API key and network.');
    }
}

function displayWeatherData(data, locationLabel) {
    const container = document.getElementById('weatherContainer');
    if (!container) return;
    // Build a concise yet detailed weather overview
    const current = data.current || {};
    const daily = data.daily ? data.daily.slice(0, 5) : [];
    const hourly = data.hourly ? data.hourly.slice(0, 12) : [];

    const currentHtml = `
        <div class="detail-header">
            <div class="detail-icon-large">${getWeatherEmoji(current.weather && current.weather[0] && current.weather[0].main)}</div>
            <h2>${locationLabel}</h2>
            <p class="modal-description">Now • ${Math.round(current.temp || 0)}°C • ${current.weather && current.weather[0] ? current.weather[0].description : ''}</p>
        </div>
        <div class="detail-body">
            <div class="detail-section">
                <h3>Current Conditions</h3>
                <p>Temperature: <strong>${Math.round(current.temp || 0)}°C</strong></p>
                <p>Feels like: <strong>${Math.round(current.feels_like || 0)}°C</strong></p>
                <p>Humidity: <strong>${current.humidity || 0}%</strong></p>
                <p>Wind: <strong>${current.wind_speed || 0} m/s</strong></p>
                <p>Pressure: <strong>${current.pressure || 0} hPa</strong></p>
            </div>
            <div class="detail-section">
                <h3>Forecast (Next Days)</h3>
                ${daily.map(d => `
                    <div style="margin-bottom:0.5rem;">
                        <strong>${new Date(d.dt * 1000).toLocaleDateString()}</strong>: ${getWeatherEmoji(d.weather[0] && d.weather[0].main)} ${d.weather[0] ? d.weather[0].description : ''} • ${Math.round(d.temp.min)}°C / ${Math.round(d.temp.max)}°C
                    </div>
                `).join('')}
            </div>
            <div class="detail-section">
                <h3>Hourly (Next 12h)</h3>
                <div style="display:flex; gap:0.5rem; overflow:auto; padding-top:0.5rem;">
                    ${hourly.map(h => `
                        <div style="min-width:84px; text-align:center; padding:0.5rem; background: rgba(255,255,255,0.02); border-radius:8px; border:1px solid rgba(255,255,255,0.03);">
                            <div style="font-weight:700;">${new Date(h.dt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                            <div style="font-size:1.25rem;">${Math.round(h.temp)}°C</div>
                            <div style="opacity:0.9;">${getWeatherEmoji(h.weather && h.weather[0] && h.weather[0].main)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = currentHtml;
}

function getWeatherEmoji(main) {
    if (!main) return '❓';
    main = main.toLowerCase();
    if (main.includes('cloud')) return '☁️';
    if (main.includes('rain')) return '🌧️';
    if (main.includes('thunder')) return '⛈️';
    if (main.includes('snow')) return '❄️';
    if (main.includes('clear')) return '☀️';
    if (main.includes('mist') || main.includes('fog')) return '🌫️';
    return '🌡️';
}

function saveSettings() {
    localStorage.setItem('disasterAlertSettings', JSON.stringify(appState.settings));
}

function clearAllData() {
    if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
        appState.alerts = [];
        appState.events = [];
        localStorage.clear();
        renderAlerts();
        renderEvents();
        updateStats();
        closeModal('settingsModal');
        showToast('All data cleared successfully');
    }
}

// ==================== WEATHER FUNCTIONS ====================
function saveApiKey() {
    const key = document.getElementById('owmApiKeyInput').value.trim();
    if (key) {
        localStorage.setItem('owmApiKey', key);
        appState.owmApiKey = key;
        showToast('OpenWeatherMap API key saved!');
    } else {
        showToast('Please enter a valid API key');
    }
}

async function fetchWeatherForLocation(location) {
    const apiKey = localStorage.getItem('owmApiKey') || appState.owmApiKey;
    if (!apiKey) {
        showToast('Please add your OpenWeatherMap API key in Settings');
        return;
    }

    try {
        // First, geocode the location
        const geoResponse = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`);
        const geoData = await geoResponse.json();
        
        if (!geoData || geoData.length === 0) {
            showToast('Location not found');
            return;
        }

        const { lat, lon } = geoData[0];

        // Fetch current weather
        const weatherResponse = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const weatherData = await weatherResponse.json();

        // Fetch forecast
        const forecastResponse = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
        const forecastData = await forecastResponse.json();

        displayWeatherData(weatherData, forecastData);
        showToast(`Weather loaded for ${location}`);
    } catch (error) {
        console.error('Weather fetch error:', error);
        showToast('Failed to fetch weather data');
    }
}

function displayWeatherData(weather, forecast) {
    const container = document.getElementById('weatherContainer');
    const w = weather;
    const main = w.main;
    const wind = w.wind;
    const clouds = w.clouds;
    const visibility = w.visibility / 1000; // convert to km

    // Next 24 hours forecast (8 * 3-hour intervals = 24 hours)
    const nextDay = forecast.list.slice(0, 8);

    const weatherHTML = `
        <div class="weather-card">
            <div class="weather-header">
                <div class="weather-location">📍 ${w.name}, ${w.sys.country}</div>
                <div class="weather-last-updated">Updated: ${new Date(w.dt * 1000).toLocaleTimeString()}</div>
            </div>

            <div class="weather-current">
                <div class="weather-temp-section">
                    <div class="weather-icon">${getWeatherEmoji(w.weather[0].main)}</div>
                    <div class="weather-temps">
                        <div class="weather-temp">${Math.round(main.temp)}°C</div>
                        <div class="weather-feels-like">Feels like ${Math.round(main.feels_like)}°C</div>
                        <div class="weather-description">${w.weather[0].description}</div>
                    </div>
                </div>

                <div class="weather-grid">
                    <div class="weather-item">
                        <span class="weather-label">💧 Humidity</span>
                        <span class="weather-value">${main.humidity}%</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">💨 Wind Speed</span>
                        <span class="weather-value">${Math.round(wind.speed * 3.6)} km/h</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">🌪️ Wind Gust</span>
                        <span class="weather-value">${wind.gust ? Math.round(wind.gust * 3.6) + ' km/h' : 'N/A'}</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">☁️ Cloud Coverage</span>
                        <span class="weather-value">${clouds.all}%</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">🌡️ Pressure</span>
                        <span class="weather-value">${main.pressure} mb</span>
                    </div>
                    <div class="weather-item">
                        <span class="weather-label">👁️ Visibility</span>
                        <span class="weather-value">${visibility.toFixed(1)} km</span>
                    </div>
                </div>
            </div>

            <div class="weather-forecast">
                <h3 class="forecast-title">24-Hour Forecast</h3>
                <div class="forecast-grid">
                    ${nextDay.map(item => {
                        const time = new Date(item.dt * 1000);
                        return `
                            <div class="forecast-item">
                                <div class="forecast-time">${time.getHours()}:00</div>
                                <div class="forecast-icon">${getWeatherEmoji(item.weather[0].main)}</div>
                                <div class="forecast-temp">${Math.round(item.main.temp)}°C</div>
                                <div class="forecast-rain">${item.rain?.['3h'] ? Math.round(item.rain['3h']) + 'mm' : '0mm'}</div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>
    `;

    container.innerHTML = weatherHTML;
}

function getWeatherEmoji(weatherType) {
    const emojis = {
        'Clear': '☀️',
        'Clouds': '☁️',
        'Rain': '🌧️',
        'Drizzle': '🌦️',
        'Thunderstorm': '⛈️',
        'Snow': '❄️',
        'Mist': '🌫️',
        'Smoke': '💨',
        'Haze': '🌫️',
        'Dust': '🌪️',
        'Fog': '🌫️',
        'Sand': '🌪️',
        'Ash': '🌪️',
        'Squall': '💨',
        'Tornado': '🌪️'
    };
    return emojis[weatherType] || '🌤️';
}

// ==================== UTILITIES ====================
function formatTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
}

// ==================== HELPER ICON FUNCTIONS ====================
function getTypeEmoji(type) {
    const map = {
        weather: '🌤️',
        earthquake: '🏚️',
        flood: '🌊',
        accident: '🚗',
        fire: '🔥',
        tsunami: '🌊'
    };
    return map[type] || '⚠️';
}

function getSourceIcon(source) {
    switch((source || '').toLowerCase()) {
        case 'sensor': return '📡';
        case 'satellite': return '🛰️';
        case 'ai': return '🤖';
        case 'official':
        default: return '🏛️';
    }
}

function getSourceLabel(source) {
    switch((source || '').toLowerCase()) {
        case 'sensor': return 'Sensors';
        case 'satellite': return 'Satellite';
        case 'ai': return 'AI';
        case 'official':
        default: return 'Official';
    }
}

function setAlertSourceFilter(filter) {
    appState.alertSourceFilter = filter;
    // update active chip UI
    document.querySelectorAll('.filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.dataset.filter === filter);
    });
    renderAlerts();
}


function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function triggerNotification(title, message) {
    if (appState.settings.notificationsEnabled && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification(title, { body: message, icon: '⚠️' });
        } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    new Notification(title, { body: message, icon: '⚠️' });
                }
            });
        }
    }
}

function playEmergencySound() {
    // Create a simple beep using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 1000;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}

function updateAlerts() {
    // Simulate receiving new alerts randomly
    if (Math.random() > 0.7) {
        const newAlert = {
            id: appState.alerts.length + 1,
            title: 'Updated Alert',
            type: 'weather',
            severity: 'info',
            message: 'Weather conditions are improving. Stay safe!',
            location: appState.userLocation,
            timestamp: new Date(),
            emoji: '☀️',
            radius: 10
        };
        appState.alerts.push(newAlert);
        renderAlerts();
        updateStats();
    }
}

// ==================== INITIALIZATION WITH MOCK DATA ====================
function initializeWithMockData() {
    appState.alerts = [...mockAlerts];
    appState.events = [...mockEvents];
    renderAlerts();
    renderEvents();
    updateStats();
    checkAlertLevel();
}

// Load mock data on first load
setTimeout(() => {
    if (appState.alerts.length === 0) {
        initializeWithMockData();
    }
}, 500);

// ==================== OFFLINE COMMUNICATION ====================
function startOfflineBroadcast() {
    appState.offlineComm.isActive = true;
    const startBtn = document.getElementById('startOfflineBtn');
    const stopBtn = document.getElementById('stopOfflineBtn');
    const statusEl = document.getElementById('offlineStatus');
    
    if (startBtn) startBtn.style.display = 'none';
    if (stopBtn) stopBtn.style.display = 'inline-block';
    if (statusEl) {
        statusEl.parentElement.classList.add('active');
        statusEl.textContent = `Status: Broadcasting as ${appState.offlineComm.userId} - Scanning for nearby users...`;
    }
    
    showToast('📡 Offline broadcast started');
    scanForNearbyPeers();
    
    // Periodically scan for peers
    window.offlineScanInterval = setInterval(scanForNearbyPeers, 5000);
}

function stopOfflineBroadcast() {
    appState.offlineComm.isActive = false;
    const startBtn = document.getElementById('startOfflineBtn');
    const stopBtn = document.getElementById('stopOfflineBtn');
    const statusEl = document.getElementById('offlineStatus');
    
    if (startBtn) startBtn.style.display = 'inline-block';
    if (stopBtn) stopBtn.style.display = 'none';
    if (statusEl) {
        statusEl.parentElement.classList.remove('active');
        statusEl.textContent = 'Status: Offline communication inactive';
    }
    
    clearInterval(window.offlineScanInterval);
    showToast('📡 Offline broadcast stopped');
}

function scanForNearbyPeers() {
    // Simulate discovering nearby peers via local network broadcast
    // In production, this would use mDNS, Bonjour, or similar
    const recentMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
    
    // Check for any nearby device activity in the last 30 seconds
    const now = Date.now();
    const nearby = recentMessages.filter(msg => (now - msg.timestamp) < 30000 && msg.userId !== appState.offlineComm.userId);
    
    const uniquePeers = [...new Set(nearby.map(m => m.userId))];
    appState.offlineComm.peers = uniquePeers;
    
    renderNearbyPeers();
}

function renderNearbyPeers() {
    const peersList = document.getElementById('peersList');
    if (!peersList) return;
    
    if (appState.offlineComm.peers.length === 0) {
        peersList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; grid-column: 1/-1;">No nearby users detected</p>';
        return;
    }
    
    let html = '';
    appState.offlineComm.peers.forEach(peerId => {
        const peerName = peerId.substring(0, 12);
        html += `<div class="peer-item" onclick="selectPeer('${peerId}')"><strong>${peerName}</strong><small>Online</small></div>`;
    });
    
    peersList.innerHTML = html;
}

function selectPeer(peerId) {
    showToast(`Selected: ${peerId.substring(0, 12)}`);
    // Can implement direct messaging here
}

function sendOfflineMessage() {
    const input = document.getElementById('offlineMessage');
    if (!input || !input.value.trim()) {
        showToast('Message cannot be empty');
        return;
    }
    
    const message = {
        id: appState.offlineComm.userId + '_' + Date.now(),
        userId: appState.offlineComm.userId,
        text: input.value,
        timestamp: Date.now(),
        type: 'emergency'
    };
    
    appState.offlineComm.messages.push(message);
    
    // Save to localStorage for persistence across offline sessions
    const allMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
    allMessages.push(message);
    localStorage.setItem('offlineMessages', JSON.stringify(allMessages));
    
    // Save to backend when online
    if (navigator.onLine) {
        fetch('/api/v1/alerts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'Offline Emergency Message',
                type: 'emergency',
                severity: 'danger',
                description: message.text,
                location: appState.userLocation
            })
        }).catch(err => console.warn('Message queued for later', err));
    }
    
    renderOfflineMessages();
    input.value = '';
    showToast('✓ Message sent (queued if offline)');
}

function renderOfflineMessages() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    const allMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
    const recentMessages = allMessages.slice(-10); // Last 10 messages
    
    if (recentMessages.length === 0) {
        messagesList.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No messages yet</p>';
        return;
    }
    
    let html = '';
    recentMessages.forEach(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const isOwn = msg.userId === appState.offlineComm.userId ? 'Own message' : 'Received from ' + msg.userId.substring(0, 8);
        html += `<div class="message-item"><strong>${isOwn} - ${time}</strong>${msg.text}</div>`;
    });
    
    messagesList.innerHTML = html;
    messagesList.scrollTop = messagesList.scrollHeight; // Auto-scroll to bottom
}

// Load messages on page load
document.addEventListener('DOMContentLoaded', () => {
    renderOfflineMessages();
}, { once: true });

// Monitor network status
window.addEventListener('online', () => {
    showToast('🌐 Back online - syncing messages...');
    // Sync offline messages with server
    const allMessages = JSON.parse(localStorage.getItem('offlineMessages') || '[]');
    allMessages.forEach(msg => {
        if (!msg.synced) {
            fetch('/api/v1/alerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'Offline Message (Synced)',
                    type: 'emergency',
                    severity: 'danger',
                    description: msg.text,
                    location: appState.userLocation
                })
            }).then(() => {
                msg.synced = true;
                localStorage.setItem('offlineMessages', JSON.stringify(allMessages));
            }).catch(err => console.warn('Sync failed', err));
        }
    });
});

window.addEventListener('offline', () => {
    showToast('📡 Network disconnected - offline mode active');
});

// ==================== ADMIN DASHBOARD ====================
function openAdminDashboard(e) {
    if (e) e.preventDefault();
    
    // Show toast notification
    showToast('🛡️ Loading Admin Dashboard...');
    
    // Initialize admin data
    updateAdminStats();
    refreshAlertsList();
    loadUsersData();
    loadSystemSettings();
    
    // Open modal
    openModal('adminModal');
    
    // Activate stats tab by default
    const statsTab = document.getElementById('adminStatsTab');
    const statsBtnList = document.querySelectorAll('.admin-tab-btn');
    if (statsTab && statsBtnList.length > 0) {
        document.querySelectorAll('.admin-tab-content').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        statsTab.classList.add('active');
        statsBtnList[0].classList.add('active');
    }
}

function switchAdminTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.admin-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    const tabMapping = {
        'stats': 'adminStatsTab',
        'alerts': 'adminAlertsTab',
        'users': 'adminUsersTab',
        'settings': 'adminSettingsTab'
    };
    
    const selectedTab = document.getElementById(tabMapping[tabName]);
    if (selectedTab) {
        selectedTab.classList.add('active');
    }
    
    // Highlight active button
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // Load tab-specific data
    if (tabName === 'alerts') {
        refreshAlertsList();
    } else if (tabName === 'users') {
        loadUsersData();
    } else if (tabName === 'settings') {
        loadSystemSettings();
    } else if (tabName === 'stats') {
        updateAdminStats();
    }
}

function updateAdminStats() {
    // Get active alerts count
    const activeAlertsCount = appState.alerts ? appState.alerts.filter(a => a.status === 'active').length : 0;
    document.getElementById('adminActiveAlerts').textContent = activeAlertsCount;
    
    // Estimate user count (mock data)
    const usersCount = localStorage.getItem('totalUsers') || '127';
    document.getElementById('adminTotalUsers').textContent = usersCount;
    
    // Estimate monitored locations
    const locations = new Set(appState.alerts ? appState.alerts.map(a => a.location?.name) : []).size;
    document.getElementById('adminLocations').textContent = locations || '0';
    
    // Update last check time
    const now = new Date();
    document.getElementById('lastCheck').textContent = now.toLocaleTimeString();
}

function refreshAlertsList() {
    const container = document.getElementById('adminAlertsList');
    if (!container) return;
    
    if (!appState.alerts || appState.alerts.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center;">No active alerts</p>';
        return;
    }
    
    container.innerHTML = appState.alerts.map((alert, idx) => `
        <div class="alert-item">
            <div class="alert-item-info">
                <div class="alert-item-title">${alert.title || 'Untitled Alert'}</div>
                <div class="alert-item-meta">
                    Type: <strong>${alert.type}</strong> | 
                    Severity: <strong>${alert.severity}</strong> | 
                    Location: <strong>${alert.location?.name || 'Unknown'}</strong>
                </div>
            </div>
            <div class="alert-actions">
                <button class="alert-edit" onclick="editAlert(${idx})">Edit</button>
                <button class="alert-delete" onclick="deleteAlert(${idx})">Delete</button>
            </div>
        </div>
    `).join('');
}

function createNewAlert() {
    const title = prompt('Alert Title:');
    if (!title) return;
    
    const type = prompt('Alert Type (weather/earthquake/flood/fire/tsunami/accident):');
    const severity = prompt('Severity (info/warning/danger):');
    const description = prompt('Description:');
    
    const newAlert = {
        id: Date.now(),
        title: title,
        type: type || 'weather',
        severity: severity || 'warning',
        description: description || '',
        location: appState.userLocation,
        status: 'active',
        timestamp: new Date().toISOString()
    };
    
    if (!appState.alerts) appState.alerts = [];
    appState.alerts.push(newAlert);
    
    showToast('✅ Alert created successfully');
    refreshAlertsList();
    updateAdminStats();
}

function editAlert(idx) {
    if (!appState.alerts || !appState.alerts[idx]) return;
    
    const alert = appState.alerts[idx];
    const newTitle = prompt('Edit Title:', alert.title);
    
    if (newTitle !== null) {
        alert.title = newTitle;
        showToast('✅ Alert updated');
        refreshAlertsList();
        updateAdminStats();
    }
}

function deleteAlert(idx) {
    if (!appState.alerts || !appState.alerts[idx]) return;
    
    if (confirm('Are you sure you want to delete this alert?')) {
        appState.alerts.splice(idx, 1);
        showToast('✅ Alert deleted');
        refreshAlertsList();
        updateAdminStats();
    }
}

function loadUsersData() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    // Mock user data (in production, fetch from backend)
    const mockUsers = [
        { id: 'U001', name: 'John Doe', email: 'john@example.com', location: 'Kochi', status: 'Active' },
        { id: 'U002', name: 'Jane Smith', email: 'jane@example.com', location: 'Thiruvananthapuram', status: 'Active' },
        { id: 'U003', name: 'Admin User', email: 'admin@alert360.com', location: 'Ernakulam', status: 'Active' }
    ];
    
    tbody.innerHTML = mockUsers.map(user => `
        <tr>
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.location}</td>
            <td><span class="status-badge online">● ${user.status}</span></td>
            <td>
                <button onclick="editUser('${user.id}')" style="padding:0.4rem 0.8rem; background:var(--info-color); border:none; color:#fff; border-radius:4px; cursor:pointer;">Edit</button>
            </td>
        </tr>
    `).join('');
}

function searchUsers() {
    const searchTerm = document.getElementById('userSearchInput')?.value || '';
    showToast('🔍 Searching for users...');
    // In production, filter users based on search term
    loadUsersData();
}

function editUser(userId) {
    showToast(`✏️ Editing user ${userId}`);
    // In production, open edit dialog
}

function loadSystemSettings() {
    // Load saved settings from localStorage
    const alertTimeout = localStorage.getItem('alertTimeout') || '300';
    const maxAlerts = localStorage.getItem('maxAlerts') || '50';
    const defaultRadius = localStorage.getItem('defaultRadius') || '50';
    const autoDispatch = localStorage.getItem('autoDispatch') !== 'false';
    const offlineComm = localStorage.getItem('offlineComm') !== 'false';
    
    // Set form values
    const timeoutInput = document.getElementById('alertTimeout');
    const maxAlertsInput = document.getElementById('maxAlerts');
    const radiusInput = document.getElementById('defaultRadius');
    const autoBtn = document.getElementById('autoDispatchToggle');
    const offlineBtn = document.getElementById('offlineCommToggle');
    
    if (timeoutInput) timeoutInput.value = alertTimeout;
    if (maxAlertsInput) maxAlertsInput.value = maxAlerts;
    if (radiusInput) radiusInput.value = defaultRadius;
    if (autoBtn) autoBtn.checked = autoDispatch;
    if (offlineBtn) offlineBtn.checked = offlineComm;
}

function saveSystemSettings() {
    const alertTimeout = document.getElementById('alertTimeout')?.value;
    const maxAlerts = document.getElementById('maxAlerts')?.value;
    const defaultRadius = document.getElementById('defaultRadius')?.value;
    const autoDispatch = document.getElementById('autoDispatchToggle')?.checked;
    const offlineComm = document.getElementById('offlineCommToggle')?.checked;
    
    // Save to localStorage
    localStorage.setItem('alertTimeout', alertTimeout);
    localStorage.setItem('maxAlerts', maxAlerts);
    localStorage.setItem('defaultRadius', defaultRadius);
    localStorage.setItem('autoDispatch', autoDispatch);
    localStorage.setItem('offlineComm', offlineComm);
    
    showToast('✅ System settings saved successfully');
}

function resetSystemSettings() {
    if (confirm('Reset all system settings to defaults?')) {
        document.getElementById('alertTimeout').value = '300';
        document.getElementById('maxAlerts').value = '50';
        document.getElementById('defaultRadius').value = '50';
        document.getElementById('autoDispatchToggle').checked = true;
        document.getElementById('offlineCommToggle').checked = true;
        
        localStorage.removeItem('alertTimeout');
        localStorage.removeItem('maxAlerts');
        localStorage.removeItem('defaultRadius');
        localStorage.removeItem('autoDispatch');
        localStorage.removeItem('offlineComm');
        
        showToast('✅ Settings reset to defaults');
    }
}
