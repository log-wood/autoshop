// Main Module - Application orchestration and event handling

import { getConfig, updateConfig, resetConfig, updateConfigFromInputs, updateInputsFromConfig, validateConfig, exportConfig, importConfig } from './config.js';
import { calculateMonthlyData } from './calculations.js';
import { updateMetrics, updateBayInfo, generateTable } from './ui-components.js';
import { exportToCSV, saveConfiguration, loadConfiguration } from './data-export.js';
import { updateFormulaPreview, validateFormulas } from './formulas.js';

// Store for monthly data
let monthlyData = [];

// Generate projections
function generateProjections() {
    // Update configuration from inputs
    updateConfigFromInputs();
    
    // Validate configuration
    const errors = validateConfig();
    if (errors.length > 0) {
        alert('Configuration errors:\n' + errors.join('\n'));
        return;
    }
    
    // Validate formulas
    const warnings = validateFormulas();
    if (warnings.length > 0) {
        console.warn('Formula warnings:', warnings);
    }
    
    // Calculate monthly data
    monthlyData = calculateMonthlyData();
    
    // Update all UI components
    updateMetrics(monthlyData);
    updateBayInfo(monthlyData);
    generateTable(monthlyData);
    updateFormulaPreview();
}

// Reset to defaults
function handleReset() {
    if (confirm('Reset all values to defaults?')) {
        resetConfig();
        updateInputsFromConfig();
        generateProjections();
    }
}

// Export to CSV
function handleExportCSV() {
    if (monthlyData.length === 0) {
        alert('Please generate projections first');
        return;
    }
    exportToCSV(monthlyData);
}

// Save configuration
function handleSaveConfig() {
    const config = getConfig();
    saveConfiguration(config);
}

// Load configuration
async function handleLoadConfig(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const config = await loadConfiguration(file);
        const errors = validateConfig(config);
        
        if (errors.length > 0) {
            alert('Invalid configuration:\n' + errors.join('\n'));
            return;
        }
        
        updateConfig(config);
        updateInputsFromConfig();
        generateProjections();
        alert('Configuration loaded successfully');
    } catch (error) {
        alert('Failed to load configuration: ' + error.message);
    }
    
    // Reset file input
    event.target.value = '';
}

// Toggle configuration section
function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.classList.toggle('collapsed');
    }
}

// Initialize collapsible sections
function initializeCollapsibleSections() {
    const headers = document.querySelectorAll('.config-section-header');
    headers.forEach(header => {
        header.addEventListener('click', (e) => {
            const section = e.target.closest('.config-section');
            if (section) {
                toggleSection(section.id);
            }
        });
    });
}

// Initialize input change listeners
function initializeInputListeners() {
    const inputs = document.querySelectorAll('.control-group input, .control-group select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            // Auto-generate on significant changes
            if (input.id === 'startingBays' || input.id === 'maxBays' || 
                input.id === 'startingEfficiency' || input.id === 'growthRate') {
                generateProjections();
            }
        });
    });
}

// Initialize file input
function initializeFileInput() {
    const loadConfigBtn = document.getElementById('loadConfigBtn');
    if (loadConfigBtn) {
        loadConfigBtn.addEventListener('click', () => {
            const fileInput = document.getElementById('configFileInput');
            if (fileInput) {
                fileInput.click();
            }
        });
    }
    
    const fileInput = document.getElementById('configFileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleLoadConfig);
    }
}

// Initialize formula previews
function initializeFormulaPreviews() {
    const formulaSelects = document.querySelectorAll('select[id$="Formula"]');
    formulaSelects.forEach(select => {
        select.addEventListener('change', () => {
            updateFormulaPreview();
            // Some formula changes require recalculation
            generateProjections();
        });
    });
}

// Initialize tooltips
function initializeTooltips() {
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.setAttribute('title', element.getAttribute('data-tooltip'));
    });
}

// Main initialization
function initialize() {
    // Set up event listeners
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateProjections);
    }
    
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExportCSV);
    }
    
    const saveConfigBtn = document.getElementById('saveConfigBtn');
    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', handleSaveConfig);
    }
    
    // Initialize UI components
    initializeCollapsibleSections();
    initializeInputListeners();
    initializeFileInput();
    initializeFormulaPreviews();
    initializeTooltips();
    
    // Load initial values
    updateInputsFromConfig();
    
    // Generate initial projections
    generateProjections();
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}

// Export functions for potential external use
export {
    generateProjections,
    handleReset,
    handleExportCSV,
    handleSaveConfig,
    toggleSection,
    monthlyData
};