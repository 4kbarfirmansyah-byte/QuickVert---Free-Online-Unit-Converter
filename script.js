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
        info: 'Use this converter for distance, height, screen size, or object dimensions.'
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
        info: 'Perfect for body weight, cooking ingredients, or shipping package weight.'
    },
    temperature: {
        label: 'Temperature',
        units: [
            { name: 'Celsius', symbol: '°C', factor: 'celsius' },
            { name: 'Fahrenheit', symbol: '°F', factor: 'fahrenheit' },
            { name: 'Kelvin', symbol: 'K', factor: 'kelvin' },
        ],
        info: 'Convert temperature for cooking, weather, or science. Special formulas are used because temperature scales are not linear from zero.'
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
        info: 'Essential for international recipes, fuel tank capacity, or liquid measurements.'
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
        ],
        info: '⚠️ Exchange rates are estimates as of August 2026. For accurate transactions, please use your bank or Google.'
    }
};

// =============================================
// STATE APLIKASI
// =============================================

let currentCategory = 'length';

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

// =============================================
// FUNGSI
// =============================================

// Populate dropdown satuan berdasarkan kategori
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

    // Set default: From = index 0, To = index 1
    if (data.units.length > 1) {
        toUnitSelect.selectedIndex = 1;
    }

    // Update info box
    infoBox.textContent = data.info;
}

// Konversi suhu (karena rumusnya berbeda)
function convertTemperature(value, fromSymbol, toSymbol) {
    // Konversi dulu ke Celsius
    let celsius;
    switch (fromSymbol) {
        case '°C': celsius = value; break;
        case '°F': celsius = (value - 32) * 5/9; break;
        case 'K': celsius = value - 273.15; break;
        default: celsius = value;
    }

    // Konversi dari Celsius ke target
    switch (toSymbol) {
        case '°C': return celsius;
        case '°F': return (celsius * 9/5) + 32;
        case 'K': return celsius + 273.15;
        default: return celsius;
    }
}

// Konversi umum (panjang, berat, volume, mata uang)
function convertGeneral(value, fromSymbol, toSymbol, units) {
    const fromUnit = units.find(u => u.symbol === fromSymbol);
    const toUnit = units.find(u => u.symbol === toSymbol);
    
    if (!fromUnit || !toUnit) return 0;
    
    // (nilai × faktor asal) ÷ faktor tujuan
    return (value * fromUnit.factor) / toUnit.factor;
}

// Fungsi utama konversi
function doConversion() {
    const value = parseFloat(inputValue.value);
    
    if (isNaN(value) || value < 0) {
        resultValue.textContent = '--';
        resultUnit.textContent = '';
        return;
    }

    const category = unitData[currentCategory];
    const fromSymbol = fromUnitSelect.value;
    const toSymbol = toUnitSelect.value;

    let result;
    if (currentCategory === 'temperature') {
        result = convertTemperature(value, fromSymbol, toSymbol);
    } else {
        result = convertGeneral(value, fromSymbol, toSymbol, category.units);
    }

    // Format hasil
    if (Math.abs(result) < 0.000001 && result !== 0) {
        resultValue.textContent = result.toExponential(4);
    } else if (Number.isInteger(result)) {
        resultValue.textContent = result.toLocaleString();
    } else {
        resultValue.textContent = parseFloat(result.toFixed(6)).toString();
    }

    resultUnit.textContent = toSymbol;
}

// Ganti kategori
function switchCategory(category) {
    currentCategory = category;
    populateUnits(category);
    doConversion();

    // Update tab active
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-category="${category}"]`).classList.add('active');
}

// Tampilkan toast
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

// Salin hasil
function copyResult() {
    const value = resultValue.textContent;
    const unit = resultUnit.textContent;
    if (value === '--' || !unit) {
        showToast('No result to copy');
        return;
    }
    const textToCopy = `${value} ${unit}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        showToast('✅ Result copied!');
    }).catch(() => {
        showToast('❌ Copy failed');
    });
}

// =============================================
// EVENT LISTENERS
// =============================================

categoryTabs.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('.tab-btn');
    if (!tabBtn) return;
    const category = tabBtn.dataset.category;
    if (category) {
        switchCategory(category);
    }
});

inputValue.addEventListener('input', doConversion);
fromUnitSelect.addEventListener('change', doConversion);
toUnitSelect.addEventListener('change', doConversion);

swapBtn.addEventListener('click', () => {
    const temp = fromUnitSelect.value;
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = temp;
    doConversion();
});

copyBtn.addEventListener('click', copyResult);

// =============================================
// INIT
// =============================================

populateUnits(currentCategory);
doConversion();