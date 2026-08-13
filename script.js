// =============================================
// QuickVert - All-in-One Unit Converter
// DATA SATUAN & FAKTOR KONVERSI (ENGLISH)
// =============================================

const unitData = {
    length: {
        label: 'Length',
        units: [
            { name: 'Meter', symbol: 'm', factor: 1 },
            { name: 'Kilometer', symbol: 'km', factor: 1000 },
            { name: 'Centimeter', symbol: 'cm', factor: 0.01 },
            { name: 'Millimeter', symbol: 'mm', factor: 0.001 },
            { name: 'Inch', symbol: 'in', factor: 0.0254 },
            { name: 'Foot', symbol: 'ft', factor: 0.3048 },
            { name: 'Yard', symbol: 'yd', factor: 0.9144 },
            { name: 'Mile', symbol: 'mi', factor: 1609.344 },
        ],
        info: '📏 Use this converter for distance, height, screen size, or object dimensions.'
    },
    weight: {
        label: 'Weight',
        units: [
            { name: 'Kilogram', symbol: 'kg', factor: 1 },
            { name: 'Gram', symbol: 'g', factor: 0.001 },
            { name: 'Milligram', symbol: 'mg', factor: 0.000001 },
            { name: 'Metric Ton', symbol: 't', factor: 1000 },
            { name: 'Pound', symbol: 'lb', factor: 0.453592 },
            { name: 'Ounce', symbol: 'oz', factor: 0.0283495 },
            { name: 'Stone', symbol: 'st', factor: 6.35029 },
        ],
        info: '⚖️ Perfect for body weight, cooking ingredients, or shipping package weight.'
    },
    temperature: {
        label: 'Temperature',
        units: [
            { name: 'Celsius', symbol: '°C', factor: 'celsius' },
            { name: 'Fahrenheit', symbol: '°F', factor: 'fahrenheit' },
            { name: 'Kelvin', symbol: 'K', factor: 'kelvin' },
        ],
        info: '🌡️ Convert temperature for cooking, weather, or science. Special formulas are used because temperature scales are not linear from zero.'
    },
    volume: {
        label: 'Volume',
        units: [
            { name: 'Liter', symbol: 'L', factor: 1 },
            { name: 'Milliliter', symbol: 'mL', factor: 0.001 },
            { name: 'Cubic Meter', symbol: 'm³', factor: 1000 },
            { name: 'Gallon (US)', symbol: 'gal', factor: 3.78541 },
            { name: 'Quart (US)', symbol: 'qt', factor: 0.946353 },
            { name: 'Pint (US)', symbol: 'pt', factor: 0.473176 },
            { name: 'Cup (US)', symbol: 'cup', factor: 0.236588 },
            { name: 'Fluid Ounce (US)', symbol: 'fl oz', factor: 0.0295735 },
        ],
        info: '🧪 Essential for international recipes, fuel tank capacity, or liquid measurements.'
    },
    currency: {
        label: 'Currency',
        units: [
            { name: 'US Dollar', symbol: 'USD', factor: 1 },
            { name: 'Euro', symbol: 'EUR', factor: 0.92 },
            { name: 'Indonesian Rupiah', symbol: 'IDR', factor: 15600 },
            { name: 'British Pound', symbol: 'GBP', factor: 0.79 },
            { name: 'Japanese Yen', symbol: 'JPY', factor: 149 },
            { name: 'Singapore Dollar', symbol: 'SGD', factor: 1.35 },
            { name: 'Malaysian Ringgit', symbol: 'MYR', factor: 4.65 },
            { name: 'Thai Baht', symbol: 'THB', factor: 35.8 },
            { name: 'Australian Dollar', symbol: 'AUD', factor: 1.52 },
            { name: 'Canadian Dollar', symbol: 'CAD', factor: 1.36 },
            { name: 'Chinese Yuan', symbol: 'CNY', factor: 7.25 },
            { name: 'Indian Rupee', symbol: 'INR', factor: 83.5 },
            { name: 'South Korean Won', symbol: 'KRW', factor: 1320 },
            { name: 'Swiss Franc', symbol: 'CHF', factor: 0.88 },
            { name: 'Saudi Riyal', symbol: 'SAR', factor: 3.75 },
        ],
        info: '💱 Exchange rates are estimates as of August 2026. Updated automatically from API when available. For accurate transactions, please use your bank or Google.'
    }
};

// =============================================
// STATE APLIKASI
// =============================================

let currentCategory = 'length';
let currencyRatesCache = null;
let currencyRatesLastFetch = null;
const CURRENCY_CACHE_DURATION = 3600000; // 1 jam dalam milidetik

// =============================================
// DOM ELEMENTS
// =============================================

const categoryTabs = document.getElementById('categoryTabs');
const inputValue = document.getElementById('inputValue');
const fromUnitSelect = document.getElementById('fromUnit');
const toUnitSelect = document.getElementById('toUnit');
const swapBtn = document.getElementById('swapBtn');
const resultValue = document.getElementById('resultValue');
const resultUnit = document.getElementById('resultUnit');
const copyBtn = document.getElementById('copyBtn');
const infoBox = document.getElementById('infoBox');
const toast = document.getElementById('toast');

// Footer converter links
const footerLinks = document.querySelectorAll('.footer-link');

// =============================================
// FUNGSI UTILITY
// =============================================

/**
 * Format angka dengan pemisah ribuan dan desimal yang rapi
 */
function formatNumber(num) {
    if (Math.abs(num) < 0.000001 && num !== 0) {
        return num.toExponential(4);
    }
    if (Number.isInteger(num)) {
        return num.toLocaleString('en-US');
    }
    // Hapus trailing zeros
    return parseFloat(num.toFixed(6)).toString();
}

/**
 * Validasi input (hanya angka non-negatif)
 */
function isValidInput(value) {
    return !isNaN(value) && value >= 0;
}

/**
 * Tampilkan toast notification
 */
function showToast(message, duration = 2000) {
    // Hentikan timer sebelumnya jika ada
    if (showToast.timer) {
        clearTimeout(showToast.timer);
        toast.classList.remove('show');
    }
    
    toast.textContent = message;
    toast.classList.add('show');
    
    showToast.timer = setTimeout(() => {
        toast.classList.remove('show');
        showToast.timer = null;
    }, duration);
}

// =============================================
// FUNGSI POPULATE UNIT
// =============================================

/**
 * Isi dropdown satuan berdasarkan kategori
 */
function populateUnits(category) {
    const data = unitData[category];
    
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';

    data.units.forEach(unit => {
        const optionFrom = document.createElement('option');
        optionFrom.value = unit.symbol;
        optionFrom.textContent = `${unit.name} (${unit.symbol})`;
        fromUnitSelect.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = unit.symbol;
        optionTo.textContent = `${unit.name} (${unit.symbol})`;
        toUnitSelect.appendChild(optionTo);
    });

    // Set default: From = index 0, To = index 1 (jika tersedia)
    if (data.units.length > 1) {
        toUnitSelect.selectedIndex = 1;
    } else {
        toUnitSelect.selectedIndex = 0;
    }

    // Update info box dengan ikon
    infoBox.textContent = data.info;
    infoBox.style.display = 'block';
}

// =============================================
// FUNGSI KONVERSI
// =============================================

/**
 * Konversi suhu (rumus khusus, bukan linear)
 */
function convertTemperature(value, fromSymbol, toSymbol) {
    // Step 1: Konversi ke Celsius
    let celsius;
    switch (fromSymbol) {
        case '°C': celsius = value; break;
        case '°F': celsius = (value - 32) * 5/9; break;
        case 'K':  celsius = value - 273.15; break;
        default:   celsius = value;
    }

    // Step 2: Konversi dari Celsius ke target
    switch (toSymbol) {
        case '°C': return celsius;
        case '°F': return (celsius * 9/5) + 32;
        case 'K':  return celsius + 273.15;
        default:   return celsius;
    }
}

/**
 * Konversi umum (panjang, berat, volume, mata uang)
 */
function convertGeneral(value, fromSymbol, toSymbol, units) {
    const fromUnit = units.find(u => u.symbol === fromSymbol);
    const toUnit = units.find(u => u.symbol === toSymbol);
    
    if (!fromUnit || !toUnit) {
        console.error('Unit not found:', fromSymbol, toSymbol);
        return 0;
    }
    
    // Rumus: (nilai × faktor asal) ÷ faktor tujuan
    return (value * fromUnit.factor) / toUnit.factor;
}

/**
 * Fungsi utama konversi
 */
function doConversion() {
    const value = parseFloat(inputValue.value);
    
    // Validasi input
    if (!isValidInput(value)) {
        resultValue.textContent = '--';
        resultUnit.textContent = '';
        return;
    }

    const category = unitData[currentCategory];
    const fromSymbol = fromUnitSelect.value;
    const toSymbol = toUnitSelect.value;
    
    if (!fromSymbol || !toSymbol) return;

    let result;
    if (currentCategory === 'temperature') {
        result = convertTemperature(value, fromSymbol, toSymbol);
    } else {
        result = convertGeneral(value, fromSymbol, toSymbol, category.units);
    }

    // Tampilkan hasil
    resultValue.textContent = formatNumber(result);
    resultUnit.textContent = toSymbol;
    
    // Animasi halus pada hasil
    resultValue.style.transform = 'scale(1.05)';
    setTimeout(() => {
        resultValue.style.transform = 'scale(1)';
    }, 150);
}

// =============================================
// CURRENCY API (REAL-TIME EXCHANGE RATES)
// =============================================

/**
 * Fetch currency rates dari API gratis
 * Fallback ke data statis jika API gagal
 */
async function fetchCurrencyRates() {
    const now = Date.now();
    
    // Return cache jika masih valid
    if (currencyRatesCache && currencyRatesLastFetch && 
        (now - currencyRatesLastFetch) < CURRENCY_CACHE_DURATION) {
        return currencyRatesCache;
    }

    infoBox.textContent = '🔄 Fetching live exchange rates...';
    infoBox.style.display = 'block';

    try {
        // Gunakan ExchangeRate-API (gratis, no API key untuk basic tier)
        const response = await fetch('https://open.er-api.com/v6/latest/USD');
        
        if (!response.ok) throw new Error('API request failed');
        
        const data = await response.json();
        
        if (data && data.rates) {
            currencyRatesCache = data.rates;
            currencyRatesLastFetch = now;
            
            // Update unitData dengan rates terbaru
            updateCurrencyUnits(data.rates);
            
            infoBox.textContent = '✅ Live exchange rates loaded. ' + unitData.currency.info.replace('⚠️ Exchange rates are estimates as of August 2026. ', '');
            console.log('Currency rates updated:', new Date().toLocaleTimeString());
            
            return data.rates;
        }
    } catch (error) {
        console.warn('Failed to fetch live rates, using fallback data:', error.message);
        infoBox.textContent = '⚠️ Using estimated exchange rates (offline). ' + unitData.currency.info.split('. ').slice(1).join('. ');
    }
    
    return null;
}

/**
 * Update faktor currency dengan rates dari API
 */
function updateCurrencyUnits(rates) {
    if (!rates) return;
    
    const currencyUnits = unitData.currency.units;
    const updatedUnits = [];
    
    // Daftar kode currency yang kita dukung
    const supportedCurrencies = [
        'USD', 'EUR', 'IDR', 'GBP', 'JPY', 'SGD', 
        'MYR', 'THB', 'AUD', 'CAD', 'CNY', 'INR', 
        'KRW', 'CHF', 'SAR'
    ];
    
    supportedCurrencies.forEach(code => {
        if (rates[code]) {
            updatedUnits.push({
                name: getCurrencyName(code),
                symbol: code,
                factor: rates[code]
            });
        }
    });
    
    if (updatedUnits.length > 0) {
        unitData.currency.units = updatedUnits;
    }
}

/**
 * Dapatkan nama lengkap currency dari kode
 */
function getCurrencyName(code) {
    const names = {
        'USD': 'US Dollar',
        'EUR': 'Euro',
        'IDR': 'Indonesian Rupiah',
        'GBP': 'British Pound',
        'JPY': 'Japanese Yen',
        'SGD': 'Singapore Dollar',
        'MYR': 'Malaysian Ringgit',
        'THB': 'Thai Baht',
        'AUD': 'Australian Dollar',
        'CAD': 'Canadian Dollar',
        'CNY': 'Chinese Yuan',
        'INR': 'Indian Rupee',
        'KRW': 'South Korean Won',
        'CHF': 'Swiss Franc',
        'SAR': 'Saudi Riyal'
    };
    return names[code] || code;
}

// =============================================
// FUNGSI NAVIGASI
// =============================================

/**
 * Ganti kategori & update UI
 */
function switchCategory(category, updateUrl = false) {
    if (!unitData[category]) {
        console.error('Invalid category:', category);
        return;
    }
    
    currentCategory = category;
    populateUnits(category);
    
    // Jika pindah ke currency, fetch live rates
    if (category === 'currency') {
        fetchCurrencyRates().then(() => {
            populateUnits(category);
            doConversion();
        });
    } else {
        doConversion();
    }

    // Update tab active
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
    });
    
    const activeTab = document.querySelector(`[data-category="${category}"]`);
    if (activeTab) {
        activeTab.classList.add('active');
        activeTab.setAttribute('aria-selected', 'true');
    }
    
    // Scroll tab active ke view (mobile)
    if (activeTab) {
        activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
    
    // Update URL hash tanpa reload (opsional)
    if (updateUrl && window.history) {
        const url = new URL(window.location);
        url.hash = category;
        window.history.replaceState({}, '', url);
    }
}

// =============================================
// FUNGSI COPY
// =============================================

/**
 * Salin hasil konversi ke clipboard
 */
function copyResult() {
    const value = resultValue.textContent;
    const unit = resultUnit.textContent;
    
    if (value === '--' || !unit) {
        showToast('⚠️ No result to copy');
        return;
    }
    
    const textToCopy = `${value} ${unit}`;
    
    // Gunakan Clipboard API dengan fallback
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('✅ Result copied!');
        }).catch(() => {
            fallbackCopy(textToCopy);
        });
    } else {
        fallbackCopy(textToCopy);
    }
}

/**
 * Fallback copy untuk browser lama
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('✅ Result copied!');
    } catch (err) {
        showToast('❌ Copy failed. Please copy manually.');
    }
    
    document.body.removeChild(textarea);
}

// =============================================
// EVENT LISTENERS
// =============================================

// Klik tab kategori
categoryTabs.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn');
    if (!tabBtn) return;
    
    const category = tabBtn.dataset.category;
    if (category && category !== currentCategory) {
        switchCategory(category, true);
    }
});

// Input nilai berubah
inputValue.addEventListener('input', doConversion);

// Ganti satuan
fromUnitSelect.addEventListener('change', doConversion);
toUnitSelect.addEventListener('change', doConversion);

// Tombol swap
swapBtn.addEventListener('click', () => {
    const tempFrom = fromUnitSelect.value;
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = tempFrom;
    doConversion();
    
    // Animasi tombol swap
    swapBtn.style.transform = 'rotate(360deg)';
    setTimeout(() => {
        swapBtn.style.transform = 'rotate(0deg)';
    }, 300);
});

// Tombol copy
copyBtn.addEventListener('click', copyResult);

// Keyboard shortcut: Enter untuk copy
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        const activeEl = document.activeElement;
        // Hanya copy hasil jika tidak ada input/textarea yang fokus
        if (activeEl !== inputValue && 
            activeEl !== fromUnitSelect && 
            activeEl !== toUnitSelect) {
            e.preventDefault();
            copyResult();
        }
    }
});

// Footer converter links
footerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const category = link.dataset.category;
        if (category) {
            switchCategory(category, true);
            // Smooth scroll ke converter
            document.querySelector('.converter-card').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    });
});

// Handle hash URL saat halaman dimuat
function handleHashUrl() {
    const hash = window.location.hash.replace('#', '');
    if (hash && unitData[hash]) {
        switchCategory(hash, false);
    }
}

// =============================================
// INIT
// =============================================

function init() {
    // Muat kategori dari URL hash atau default 'length'
    handleHashUrl();
    
    // Jika tidak ada hash valid, gunakan default
    if (!window.location.hash || !unitData[window.location.hash.replace('#', '')]) {
        populateUnits(currentCategory);
        doConversion();
    }
    
    // Pre-fetch currency rates di background
    if (currentCategory === 'currency') {
        fetchCurrencyRates();
    }
    
    // Tambahkan transition style untuk animasi hasil
    resultValue.style.transition = 'transform 0.15s ease-out';
    
    console.log('🚀 QuickVert initialized!');
    console.log('📂 Current category:', currentCategory);
    console.log('💡 Tip: Click footer links or use tabs to switch converters.');
}

// Jalankan!
init();
