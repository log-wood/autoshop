// Configuration Module - Auto Repair Shop P&L Projections

// Default configuration object with all business parameters
export const defaultConfig = {
    // Bay & Efficiency Configuration
    startingBays: 2,
    maxBays: 6,
    startingEfficiency: 40,
    growthRate: 20,
    bayTrigger: 100,
    newBayResetEfficiency: 50,
    maxRevenuePerBay: 20000,
    detailEfficiencyMultiplier: 1.2,
    
    // Service Configuration
    laborRate: 125,
    workingDays: 21,
    hoursPerTicket: 1.6,
    operatingHoursPerDay: 8,
    carsPerDayPerLift: 5,
    shopChargePercent: 7,
    shopChargeCap: 60,
    
    // Parts & Inventory Configuration
    partsMarkup: 40,
    serviceToPartsPercent: 70,
    initialTireInventory: 10000,
    monthlyTireInventory: 15000,
    
    // Revenue Stream Configuration
    detailMaxRevenue: 20000,
    initialUsedCars: 5,
    profitPerUsedCar: 3000,
    usedCarGrowthPercent: 15,
    firstMonthWarranties: 1,
    monthlyWarrantiesAfter: 4,
    warrantyPrice: 1000,
    oilDisposalFee: 150,
    generalDisposalFee: 200,
    batteryDisposalFee: 825,
    
    // Staff Salaries Configuration
    seniorTechAnnualSalary: 60000,
    juniorTechAnnualSalary: 45000,
    serviceAdvisorAnnualSalary: 70000,
    managerAnnualSalary: 100000,
    managerAnnualBonus: 10000,
    
    // Operating Expenses Configuration
    monthlyAdvertising: 1500,
    shopKeySoftwareMonthly: 300,
    paymentProcessingPercent: 2.29,
    paymentProcessingPerTransaction: 0.09,
    aaaAnnualMembership: 400,
    monthlyFuelCard: 400,
    monthlyUtilities: 1200,
    monthlySuretyBond: 20,
    monthlyGeneralLiability: 200,
    
    // Equipment Configuration
    laptopCostEach: 1500,
    desktopCostEach: 2000,
    numberOfDesktops: 2,
    scanToolCost: 2500,
    
    // Supplies & Disposal Configuration
    monthlyDetailSupplies: 500,
    monthlyShopSupplies: 1000,
    monthlyOilCostPerLift: 2500,
    wasteOilFiltersCost: 300,
    coolantDisposalCost: 300,
    wasteDisposalFrequencyMonths: 6,
    
    // Calculation Rules & Formulas Configuration
    // Revenue Calculation Rules
    partsGenerationFormula: 'percentOfService',
    partsGenerationModifier: 1.0,
    shopChargeFormula: 'minOfPercentOrCap',
    workOrderFormula: 'revenuePerTicket',
    workOrdersFixed: 100,
    
    // Cost Calculation Rules
    techSalaryFormula: 'seniorPlusJuniors',
    techSalaryPerBay: 50000,
    oilCostFormula: 'perBay',
    oilCostPercent: 5,
    oilCostPerOrder: 50,
    paymentProcessFormula: 'percentPlusTransaction',
    paymentProcessFlatRate: 1000,
    
    // Efficiency Calculation Rules
    detailEfficiencyLink: 'serviceEfficiency',
    detailEfficiencyFormula: 'multiplier',
    detailEfficiencyAddition: 20,
    detailEfficiencyFixed: 80,
    newBayEfficiencySource: 'fixed',
    newBayEfficiencyPercent: 80,
    
    // Growth Calculation Rules
    usedCarGrowthFormula: 'fixed',
    usedCarFixedGrowth: 15,
    usedCarExponentialBase: 1.15,
    efficiencyGrowthFormula: 'linear',
    efficiencyExponentialRate: 1.1,
    efficiencySCurveMidpoint: 6
};

// Create a working copy of the configuration
let config = { ...defaultConfig };

// Get current configuration
export function getConfig() {
    return { ...config };
}

// Update configuration
export function updateConfig(updates) {
    config = { ...config, ...updates };
    return config;
}

// Reset configuration to defaults
export function resetConfig() {
    config = { ...defaultConfig };
    return config;
}

// Update configuration from all input elements
export function updateConfigFromInputs() {
    const inputs = document.querySelectorAll('.control-group input, .control-group select');
    const updates = {};
    
    inputs.forEach(input => {
        const key = input.id;
        if (config.hasOwnProperty(key)) {
            if (input.tagName === 'SELECT') {
                updates[key] = input.value;
            } else if (input.type === 'number') {
                const value = input.step && input.step.includes('.') ? 
                    parseFloat(input.value) : 
                    parseInt(input.value);
                updates[key] = value;
            } else {
                updates[key] = input.value;
            }
        }
    });
    
    return updateConfig(updates);
}

// Update input elements from configuration
export function updateInputsFromConfig() {
    Object.keys(config).forEach(key => {
        const input = document.getElementById(key);
        if (input) {
            input.value = config[key];
        }
    });
}

// Validate configuration
export function validateConfig(testConfig = config) {
    const errors = [];
    
    if (testConfig.startingBays < 1 || testConfig.startingBays > testConfig.maxBays) {
        errors.push('Starting bays must be between 1 and max bays');
    }
    
    if (testConfig.startingEfficiency < 0 || testConfig.startingEfficiency > 100) {
        errors.push('Starting efficiency must be between 0 and 100');
    }
    
    if (testConfig.growthRate < 0 || testConfig.growthRate > 100) {
        errors.push('Growth rate must be between 0 and 100');
    }
    
    if (testConfig.laborRate <= 0) {
        errors.push('Labor rate must be positive');
    }
    
    if (testConfig.workingDays < 1 || testConfig.workingDays > 31) {
        errors.push('Working days must be between 1 and 31');
    }
    
    return errors;
}

// Export configuration as JSON
export function exportConfig() {
    return JSON.stringify(config, null, 2);
}

// Import configuration from JSON
export function importConfig(jsonString) {
    try {
        const importedConfig = JSON.parse(jsonString);
        // Validate imported config has required fields
        const requiredFields = ['startingBays', 'startingEfficiency', 'growthRate'];
        const hasRequiredFields = requiredFields.every(field => field in importedConfig);
        
        if (!hasRequiredFields) {
            throw new Error('Invalid configuration format');
        }
        
        config = { ...defaultConfig, ...importedConfig };
        updateInputsFromConfig();
        return config;
    } catch (error) {
        throw new Error('Failed to import configuration: ' + error.message);
    }
}