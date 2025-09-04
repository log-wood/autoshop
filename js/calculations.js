// Calculations Module - Core business logic for P&L projections

import { getConfig } from './config.js';

// Calculate monthly projections for 12 months
export function calculateMonthlyData() {
    const config = getConfig();
    const months = [];
    let currentBays = config.startingBays;
    let currentEfficiency = config.startingEfficiency;
    let techCount = config.startingBays;
    let bayEfficiencies = [];
    
    // Initialize bay efficiencies
    for (let i = 0; i < currentBays; i++) {
        bayEfficiencies.push(currentEfficiency);
    }
    
    for (let month = 0; month < 12; month++) {
        // First, apply growth to existing bays for the month
        if (month > 0) {
            let totalDemand = 0;
            let newEfficiencies = [];
            
            // Calculate what the new efficiency would be for each bay
            for (let i = 0; i < bayEfficiencies.length; i++) {
                let newEfficiency = bayEfficiencies[i];
                if (config.efficiencyGrowthFormula === 'linear') {
                    newEfficiency = bayEfficiencies[i] * (1 + config.growthRate / 100);
                } else if (config.efficiencyGrowthFormula === 'exponential') {
                    const baseEfficiency = config.startingEfficiency;
                    newEfficiency = baseEfficiency * Math.pow(config.efficiencyExponentialRate, month);
                } else if (config.efficiencyGrowthFormula === 'sCurve') {
                    const maxEfficiency = 100;
                    const midpoint = config.efficiencySCurveMidpoint;
                    const steepness = 0.8;
                    newEfficiency = maxEfficiency / (1 + Math.exp(-steepness * (month - midpoint)));
                }
                newEfficiencies.push(newEfficiency);
                totalDemand += newEfficiency;
            }
            
            // Check if total demand exceeds capacity (100% per bay)
            const maxCapacity = bayEfficiencies.length * 100;
            if (totalDemand > maxCapacity && currentBays < config.maxBays) {
                // Add a new bay to handle overflow
                currentBays++;
                techCount++;
                const overflow = totalDemand - maxCapacity;
                
                // Existing bays stay at 100%
                for (let i = 0; i < bayEfficiencies.length; i++) {
                    bayEfficiencies[i] = Math.min(newEfficiencies[i], 100);
                }
                
                // New bay gets the overflow demand
                bayEfficiencies.push(overflow);
            } else {
                // No new bay needed, just update efficiencies (capped at 100%)
                for (let i = 0; i < bayEfficiencies.length; i++) {
                    bayEfficiencies[i] = Math.min(newEfficiencies[i], 100);
                }
            }
        }
        
        // Calculate service revenue based on individual bay efficiencies
        let serviceRevenue = 0;
        bayEfficiencies.forEach(efficiency => {
            serviceRevenue += config.maxRevenuePerBay * (efficiency / 100);
        });
        currentEfficiency = bayEfficiencies.reduce((sum, eff) => sum + eff, 0) / bayEfficiencies.length;
        
        // Calculate parts revenue
        let partsCost, partsRevenue;
        if (config.partsGenerationFormula === 'percentOfService') {
            partsCost = serviceRevenue * (config.serviceToPartsPercent / 100) / (1 + config.partsMarkup / 100);
            partsRevenue = partsCost * (1 + config.partsMarkup / 100) * config.partsGenerationModifier;
        } else if (config.partsGenerationFormula === 'fixedAmount') {
            partsCost = 5000 * currentBays * config.partsGenerationModifier;
            partsRevenue = partsCost * (1 + config.partsMarkup / 100);
        } else if (config.partsGenerationFormula === 'perWorkOrder') {
            const tempWorkOrders = Math.floor(serviceRevenue / (config.hoursPerTicket * config.laborRate));
            partsCost = tempWorkOrders * 200 * config.partsGenerationModifier;
            partsRevenue = partsCost * (1 + config.partsMarkup / 100);
        }
        
        // Calculate work orders
        const avgTicketValue = (config.hoursPerTicket * config.laborRate);
        let workOrders;
        if (config.workOrderFormula === 'revenuePerTicket') {
            workOrders = Math.floor(serviceRevenue / avgTicketValue);
        } else if (config.workOrderFormula === 'carsTimesEfficiency') {
            workOrders = Math.floor(config.carsPerDayPerLift * config.workingDays * currentBays * (currentEfficiency / 100));
        } else if (config.workOrderFormula === 'fixed') {
            workOrders = config.workOrdersFixed;
        }
        
        // Calculate shop charge
        let shopCharge;
        if (config.shopChargeFormula === 'minOfPercentOrCap') {
            shopCharge = Math.min(workOrders * config.shopChargeCap, serviceRevenue * (config.shopChargePercent / 100));
        } else if (config.shopChargeFormula === 'percentOnly') {
            shopCharge = serviceRevenue * (config.shopChargePercent / 100);
        } else if (config.shopChargeFormula === 'perOrderOnly') {
            shopCharge = workOrders * config.shopChargeCap;
        }
        
        // Warranty revenue
        const warrantyRevenue = month === 0 ? 
            config.firstMonthWarranties * config.warrantyPrice : 
            config.monthlyWarrantiesAfter * config.warrantyPrice;
        
        // Used car sales
        const initialUsedCarRevenue = config.initialUsedCars * config.profitPerUsedCar;
        const carSalesBase = month === 0 ? initialUsedCarRevenue : months[month - 1].usedCarSales;
        let usedCarSales;
        if (config.usedCarGrowthFormula === 'randomRange' || config.usedCarGrowthFormula === 'fixed') {
            usedCarSales = carSalesBase * (1 + config.usedCarGrowthPercent / 100);
        } else if (config.usedCarGrowthFormula === 'exponential') {
            usedCarSales = initialUsedCarRevenue * Math.pow(config.usedCarExponentialBase, month);
        }
        
        // Detail department efficiency and revenue
        let detailEfficiency;
        if (config.detailEfficiencyLink === 'serviceEfficiency') {
            if (config.detailEfficiencyFormula === 'multiplier') {
                detailEfficiency = Math.min(currentEfficiency * config.detailEfficiencyMultiplier, 100);
            } else if (config.detailEfficiencyFormula === 'addition') {
                detailEfficiency = Math.min(currentEfficiency + config.detailEfficiencyAddition, 100);
            } else if (config.detailEfficiencyFormula === 'direct') {
                detailEfficiency = currentEfficiency;
            }
        } else if (config.detailEfficiencyLink === 'independent') {
            detailEfficiency = Math.min(40 * (1 + month * 0.1), 100);
        } else if (config.detailEfficiencyLink === 'fixed') {
            detailEfficiency = config.detailEfficiencyFixed;
        }
        const detailRevenue = config.detailMaxRevenue * (detailEfficiency / 100);
        
        // Calculate tech salaries
        let techSalaries;
        if (config.techSalaryFormula === 'seniorPlusJuniors') {
            techSalaries = (config.seniorTechAnnualSalary / 12) + ((techCount - 1) * config.juniorTechAnnualSalary / 12);
        } else if (config.techSalaryFormula === 'allEqual') {
            techSalaries = techCount * (config.juniorTechAnnualSalary / 12);
        } else if (config.techSalaryFormula === 'perBay') {
            techSalaries = currentBays * (config.techSalaryPerBay / 12);
        }
        const advisorSalary = config.serviceAdvisorAnnualSalary / 12;
        const managerSalary = config.managerAnnualSalary / 12 + (month === 11 ? config.managerAnnualBonus : 0);
        
        // Calculate oil costs
        let oilCosts;
        if (config.oilCostFormula === 'perBay') {
            oilCosts = currentBays * config.monthlyOilCostPerLift;
        } else if (config.oilCostFormula === 'percentOfRevenue') {
            oilCosts = serviceRevenue * (config.oilCostPercent / 100);
        } else if (config.oilCostFormula === 'perWorkOrder') {
            oilCosts = workOrders * config.oilCostPerOrder;
        }
        
        // Payment processing
        const totalRevenue = serviceRevenue + partsRevenue + shopCharge + warrantyRevenue + 
                           usedCarSales + detailRevenue + config.oilDisposalFee + 
                           config.generalDisposalFee + config.batteryDisposalFee;
        let paymentProcessing;
        if (config.paymentProcessFormula === 'percentPlusTransaction') {
            paymentProcessing = (totalRevenue * config.paymentProcessingPercent / 100) + 
                               (workOrders * config.paymentProcessingPerTransaction);
        } else if (config.paymentProcessFormula === 'percentOnly') {
            paymentProcessing = totalRevenue * config.paymentProcessingPercent / 100;
        } else if (config.paymentProcessFormula === 'flatRate') {
            paymentProcessing = config.paymentProcessFlatRate;
        }
        
        months.push({
            month: month + 1,
            bays: currentBays,
            efficiency: currentEfficiency,
            techCount: techCount,
            // Revenue
            serviceRevenue: serviceRevenue,
            partsRevenue: partsRevenue,
            shopCharge: shopCharge,
            warrantyRevenue: warrantyRevenue,
            oilDisposal: config.oilDisposalFee,
            disposalFees: config.generalDisposalFee,
            batteryDisposal: config.batteryDisposalFee,
            usedCarSales: usedCarSales,
            detailRevenue: detailRevenue,
            // Expenses
            partsCost: partsCost,
            techSalaries: techSalaries,
            advisorSalary: advisorSalary,
            managerSalary: managerSalary,
            advertising: config.monthlyAdvertising,
            shopKey: config.shopKeySoftwareMonthly,
            aaaSignup: config.aaaAnnualMembership / 12,
            fuelCard: config.monthlyFuelCard,
            utilities: config.monthlyUtilities,
            scanTool: month === 0 ? config.scanToolCost : 0,
            wasteOilFilters: month % config.wasteDisposalFrequencyMonths === 0 ? config.wasteOilFiltersCost : 0,
            coolantDisposal: month % config.wasteDisposalFrequencyMonths === 0 ? config.coolantDisposalCost : 0,
            tireInventory: month === 0 ? config.initialTireInventory : config.monthlyTireInventory,
            oilCosts: oilCosts,
            detailSupplies: config.monthlyDetailSupplies,
            shopSupplies: config.monthlyShopSupplies,
            suretyBond: config.monthlySuretyBond,
            liability: config.monthlyGeneralLiability,
            paymentProcessing: paymentProcessing,
            laptops: month === 0 ? techCount * config.laptopCostEach : 
                    (currentBays > months[month-1].bays ? config.laptopCostEach : 0),
            desktops: month === 0 ? config.desktopCostEach * config.numberOfDesktops : 0,
            workOrders: workOrders
        });
    }
    
    return months;
}