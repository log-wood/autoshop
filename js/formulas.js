// Formulas Module - Formula validation and preview functionality

import { getConfig } from './config.js';

// Update formula preview display
export function updateFormulaPreview() {
    const config = getConfig();
    const previews = document.querySelectorAll('.formula-preview');
    
    previews.forEach(preview => {
        const formula = preview.getAttribute('data-formula');
        if (formula && config[formula]) {
            preview.textContent = `Current: ${config[formula]}`;
        }
    });
}

// Validate formula selections
export function validateFormulas() {
    const config = getConfig();
    const warnings = [];
    
    // Check parts generation formula
    if (config.partsGenerationFormula === 'percentOfService' && config.serviceToPartsPercent <= 0) {
        warnings.push('Parts generation is set to percent of service but percentage is 0 or negative');
    }
    
    // Check work order formula
    if (config.workOrderFormula === 'fixed' && config.workOrdersFixed <= 0) {
        warnings.push('Work order formula is set to fixed but fixed amount is 0 or negative');
    }
    
    // Check tech salary formula
    if (config.techSalaryFormula === 'perBay' && config.techSalaryPerBay <= 0) {
        warnings.push('Tech salary is set to per bay but salary per bay is 0 or negative');
    }
    
    // Check oil cost formula
    if (config.oilCostFormula === 'percentOfRevenue' && config.oilCostPercent <= 0) {
        warnings.push('Oil cost is set to percent of revenue but percentage is 0 or negative');
    }
    
    if (config.oilCostFormula === 'perWorkOrder' && config.oilCostPerOrder <= 0) {
        warnings.push('Oil cost is set to per work order but cost per order is 0 or negative');
    }
    
    // Check payment processing formula
    if (config.paymentProcessFormula === 'flatRate' && config.paymentProcessFlatRate <= 0) {
        warnings.push('Payment processing is set to flat rate but rate is 0 or negative');
    }
    
    // Check detail efficiency formula
    if (config.detailEfficiencyLink === 'fixed' && config.detailEfficiencyFixed <= 0) {
        warnings.push('Detail efficiency is set to fixed but fixed efficiency is 0 or negative');
    }
    
    // Check efficiency growth formula
    if (config.efficiencyGrowthFormula === 'exponential' && config.efficiencyExponentialRate <= 1) {
        warnings.push('Efficiency growth is exponential but rate is not greater than 1');
    }
    
    if (config.efficiencyGrowthFormula === 'sCurve' && config.efficiencySCurveMidpoint <= 0) {
        warnings.push('Efficiency growth is S-curve but midpoint is 0 or negative');
    }
    
    // Check used car growth formula
    if (config.usedCarGrowthFormula === 'exponential' && config.usedCarExponentialBase <= 1) {
        warnings.push('Used car growth is exponential but base is not greater than 1');
    }
    
    return warnings;
}

// Get formula description
export function getFormulaDescription(formulaType, value) {
    const descriptions = {
        partsGenerationFormula: {
            percentOfService: 'Parts cost calculated as percentage of service revenue',
            fixedAmount: 'Fixed parts cost per bay',
            perWorkOrder: 'Parts cost calculated per work order'
        },
        shopChargeFormula: {
            minOfPercentOrCap: 'Lesser of percentage or per-order cap',
            percentOnly: 'Percentage of service revenue only',
            perOrderOnly: 'Fixed amount per order only'
        },
        workOrderFormula: {
            revenuePerTicket: 'Work orders based on revenue divided by average ticket',
            carsTimesEfficiency: 'Based on cars per day and efficiency',
            fixed: 'Fixed number of work orders'
        },
        techSalaryFormula: {
            seniorPlusJuniors: 'One senior tech plus juniors for additional bays',
            allEqual: 'All techs paid equally',
            perBay: 'Fixed salary per bay'
        },
        oilCostFormula: {
            perBay: 'Fixed cost per bay',
            percentOfRevenue: 'Percentage of service revenue',
            perWorkOrder: 'Cost per work order'
        },
        paymentProcessFormula: {
            percentPlusTransaction: 'Percentage plus per-transaction fee',
            percentOnly: 'Percentage of revenue only',
            flatRate: 'Fixed monthly rate'
        },
        detailEfficiencyLink: {
            serviceEfficiency: 'Linked to service bay efficiency',
            independent: 'Independent growth pattern',
            fixed: 'Fixed efficiency percentage'
        },
        detailEfficiencyFormula: {
            multiplier: 'Service efficiency multiplied by factor',
            addition: 'Service efficiency plus fixed amount',
            direct: 'Same as service efficiency'
        },
        newBayEfficiencySource: {
            fixed: 'New bays start at fixed efficiency',
            percentOfCurrent: 'New bays start at percentage of current average',
            overflow: 'New bays handle only overflow demand'
        },
        usedCarGrowthFormula: {
            fixed: 'Fixed percentage growth',
            randomRange: 'Random growth within range',
            exponential: 'Exponential growth pattern'
        },
        efficiencyGrowthFormula: {
            linear: 'Linear growth rate',
            exponential: 'Exponential growth curve',
            sCurve: 'S-curve growth pattern'
        }
    };
    
    return descriptions[formulaType]?.[value] || 'Custom formula';
}

// Apply formula modifier
export function applyFormulaModifier(baseValue, modifier, modifierType) {
    switch (modifierType) {
        case 'multiply':
            return baseValue * modifier;
        case 'add':
            return baseValue + modifier;
        case 'percent':
            return baseValue * (1 + modifier / 100);
        default:
            return baseValue;
    }
}

// Calculate formula result
export function calculateFormulaResult(formula, params) {
    const config = getConfig();
    
    switch (formula) {
        case 'serviceRevenue':
            return params.bays * config.maxRevenuePerBay * (params.efficiency / 100);
            
        case 'partsRevenue':
            if (config.partsGenerationFormula === 'percentOfService') {
                const partsCost = params.serviceRevenue * (config.serviceToPartsPercent / 100) / (1 + config.partsMarkup / 100);
                return partsCost * (1 + config.partsMarkup / 100) * config.partsGenerationModifier;
            } else if (config.partsGenerationFormula === 'fixedAmount') {
                const partsCost = 5000 * params.bays * config.partsGenerationModifier;
                return partsCost * (1 + config.partsMarkup / 100);
            } else {
                const partsCost = params.workOrders * 200 * config.partsGenerationModifier;
                return partsCost * (1 + config.partsMarkup / 100);
            }
            
        case 'workOrders':
            if (config.workOrderFormula === 'revenuePerTicket') {
                return Math.floor(params.serviceRevenue / (config.hoursPerTicket * config.laborRate));
            } else if (config.workOrderFormula === 'carsTimesEfficiency') {
                return Math.floor(config.carsPerDayPerLift * config.workingDays * params.bays * (params.efficiency / 100));
            } else {
                return config.workOrdersFixed;
            }
            
        case 'shopCharge':
            if (config.shopChargeFormula === 'minOfPercentOrCap') {
                return Math.min(params.workOrders * config.shopChargeCap, params.serviceRevenue * (config.shopChargePercent / 100));
            } else if (config.shopChargeFormula === 'percentOnly') {
                return params.serviceRevenue * (config.shopChargePercent / 100);
            } else {
                return params.workOrders * config.shopChargeCap;
            }
            
        default:
            return 0;
    }
}

// Get formula dependencies
export function getFormulaDependencies(formula) {
    const dependencies = {
        partsRevenue: ['serviceRevenue', 'workOrders'],
        shopCharge: ['serviceRevenue', 'workOrders'],
        paymentProcessing: ['totalRevenue', 'workOrders'],
        techSalaries: ['bays', 'techCount'],
        oilCosts: ['bays', 'serviceRevenue', 'workOrders'],
        detailRevenue: ['efficiency']
    };
    
    return dependencies[formula] || [];
}

// Validate formula configuration
export function validateFormulaConfiguration() {
    const config = getConfig();
    const errors = [];
    
    // Check for circular dependencies
    const formulaKeys = Object.keys(config).filter(key => key.includes('Formula'));
    formulaKeys.forEach(key => {
        const value = config[key];
        if (value === 'circular') {
            errors.push(`${key} has a circular dependency`);
        }
    });
    
    // Check for missing required modifiers
    if (config.partsGenerationFormula === 'percentOfService' && !config.partsGenerationModifier) {
        errors.push('Parts generation modifier is required when using percent of service');
    }
    
    return errors;
}