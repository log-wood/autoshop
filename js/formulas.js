// Formulas Page JavaScript
// This file populates the live calculation examples on the formulas page

(function() {
    'use strict';

    // Access the global config from bundle.js
    function getGlobalConfig() {
        // This requires bundle.js to be loaded and config to be available
        if (typeof getConfig === 'function') {
            return getConfig();
        }
        // Fail if bundle.js isn't properly loaded
        throw new Error('Bundle.js configuration not available. Make sure bundle.js loads before formulas.js');
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    function formatPercent(value) {
        return value.toFixed(1) + '%';
    }

    function populateFormulas() {
        const config = getGlobalConfig();
        
        // Initial Investment Examples
        populateInitialInvestmentExample(config);
        populateStartingCashExample(config);
        
        // Service Department Examples
        populateServiceRevenueExample(config);
        populateEfficiencyGrowthExample(config);
        populateBayTriggerExample(config);
        populateWorkOrdersExample(config);
        
        // Parts Department Examples  
        populatePartsRevenueExample(config);
        
        // Detail Department Examples
        populateDetailRevenueExample(config);
        populateDetailEfficiencyGrowthExample(config);
        populateDetailWorkerTriggerExample(config);
        
        // Other Revenue Examples
        populateShopChargeExample(config);
        populateWarrantyRevenueExample(config);
        populateUsedCarSalesExample(config);
        populateDisposalFeesExample(config);
        
        // Labor Costs Examples
        populateTechSalariesExample(config);
        populateDetailSalariesExample(config);
        populateOtherSalariesExample(config);
        populateDetailCommissionExample(config);
        
        // Operating Expenses Examples
        populateVariableCostsExample(config);
        populateRevenueBasedExpensesExample(config);
        populateFixedExpensesExample(config);
        populatePeriodicExpensesExample(config);
        
        // Financial Summary Examples
        populateTotalRevenueExample(config);
        populateTotalExpensesExample(config);
        populateNetIncomeExample(config);
    }

    function populateInitialInvestmentExample(config) {
        const laptopsTotalCost = config.initialLaptopsQty * config.laptopUnitCost;
        const desktopsTotalCost = config.initialDesktopsQty * config.desktopUnitCost;
        const vehicleLiftsTotalCost = config.vehicleLiftsQty * config.vehicleLiftUnitCost;
        
        const totalInitialInvestment = config.initialCashPosition + config.scanToolCost +
                                      vehicleLiftsTotalCost + config.tireBalanceMountingMachine +
                                      config.airCompressorSystem + config.workbenchesShelvingFixtures +
                                      config.oilCoolantManagementSystems + laptopsTotalCost + desktopsTotalCost +
                                      config.mobileDetailVan + config.detailEquipment + config.initialMarketingSignage + 
                                      config.initialLicensesPermits + config.initialInsuranceDeposit;
        
        const element = document.getElementById('initialInvestmentExample');
        if (element) {
            element.innerHTML = `
                <strong>Example with current configuration:</strong><br>
                ${formatCurrency(config.initialCashPosition)} + ${formatCurrency(config.scanToolCost)} + (${config.vehicleLiftsQty} × ${formatCurrency(config.vehicleLiftUnitCost)}) + ${formatCurrency(config.tireBalanceMountingMachine)} + 
                ${formatCurrency(config.airCompressorSystem)} + ${formatCurrency(config.workbenchesShelvingFixtures)} + ${formatCurrency(config.oilCoolantManagementSystems)} + 
                (${config.initialLaptopsQty} × ${formatCurrency(config.laptopUnitCost)}) + (${config.initialDesktopsQty} × ${formatCurrency(config.desktopUnitCost)}) + 
                ${formatCurrency(config.mobileDetailVan)} + ${formatCurrency(config.detailEquipment)} + 
                ${formatCurrency(config.initialMarketingSignage)} + ${formatCurrency(config.initialLicensesPermits)} + ${formatCurrency(config.initialInsuranceDeposit)}<br>
                = <strong>${formatCurrency(totalInitialInvestment)}</strong>
            `;
        }
    }

    function populateStartingCashExample(config) {
        const laptopsTotalCost = config.initialLaptopsQty * config.laptopUnitCost;
        const desktopsTotalCost = config.initialDesktopsQty * config.desktopUnitCost;
        const vehicleLiftsTotalCost = config.vehicleLiftsQty * config.vehicleLiftUnitCost;
        
        const totalInitialInvestment = config.initialCashPosition + config.scanToolCost +
                                      vehicleLiftsTotalCost + config.tireBalanceMountingMachine +
                                      config.airCompressorSystem + config.workbenchesShelvingFixtures +
                                      config.oilCoolantManagementSystems + laptopsTotalCost + desktopsTotalCost +
                                      config.mobileDetailVan + config.detailEquipment + config.initialMarketingSignage + 
                                      config.initialLicensesPermits + config.initialInsuranceDeposit;
        
        const startingCashPosition = -totalInitialInvestment;
        
        const element = document.getElementById('startingCashExample');
        if (element) {
            element.innerHTML = `
                <strong>Example with current configuration:</strong><br>
                Total Initial Investment: ${formatCurrency(totalInitialInvestment)}<br>
                Starting Cash Position: <strong>${formatCurrency(startingCashPosition)}</strong><br><br>
                <em>Business starts ${formatCurrency(Math.abs(startingCashPosition))} in debt from all startup costs including ${formatCurrency(config.initialCashPosition)} for misc fees and inventory.</em>
            `;
        }
    }

    function populateServiceRevenueExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const maxRevenuePerFullTech = config.laborRate * config.operatingHoursPerDay * config.workingDays;
        const serviceRevenue = maxRevenuePerFullTech * (totalEfficiency / 100);
        
        const element = document.getElementById('serviceRevenueExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Total Efficiency = ${config.startingBays} bays × ${formatPercent(config.startingEfficiency)} = ${formatPercent(totalEfficiency)}<br>
                Service Revenue = ${formatCurrency(config.laborRate)} × ${config.operatingHoursPerDay} hrs × ${config.workingDays} days × (${formatPercent(totalEfficiency)} ÷ 100)<br>
                = ${formatCurrency(config.laborRate)} × ${config.operatingHoursPerDay} × ${config.workingDays} × ${(totalEfficiency/100).toFixed(2)}<br>
                = <strong>${formatCurrency(serviceRevenue)}</strong>
            `;
        }
    }

    function populateEfficiencyGrowthExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const newEfficiency = totalEfficiency * (1 + config.growthRate / 100);
        const cappedEfficiency = Math.min(newEfficiency, config.maxBays * 100);
        
        const element = document.getElementById('efficiencyGrowthExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 2:</strong><br>
                Previous Total Efficiency = ${formatPercent(totalEfficiency)}<br>
                New Total Efficiency = ${formatPercent(totalEfficiency)} × (1 + ${formatPercent(config.growthRate)} ÷ 100)<br>
                = ${formatPercent(totalEfficiency)} × ${(1 + config.growthRate / 100).toFixed(3)}<br>
                = ${formatPercent(newEfficiency)}<br>
                ${newEfficiency > config.maxBays * 100 ? `<span class="cap-note">Capped at: ${formatPercent(cappedEfficiency)}</span>` : ''}
            `;
        }
    }

    function populateBayTriggerExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const currentCapacity = config.startingBays * 100;
        const growthNeeded = Math.ceil((currentCapacity - totalEfficiency) / (config.growthRate / 100 * totalEfficiency));
        
        const element = document.getElementById('bayTriggerExample');
        if (element) {
            element.innerHTML = `
                <strong>Example with current configuration:</strong><br>
                Starting Total Efficiency = ${formatPercent(totalEfficiency)}<br>
                Current Capacity = ${config.startingBays} bays × 100% = ${formatPercent(currentCapacity)}<br>
                <strong>Bay addition occurs when Total Efficiency ≥ ${formatPercent(currentCapacity)}</strong><br>
                <span class="growth-note">At ${formatPercent(config.growthRate)} growth rate, this takes approximately ${growthNeeded} months</span>
            `;
        }
    }

    function populateWorkOrdersExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const maxRevenuePerFullTech = config.laborRate * config.operatingHoursPerDay * config.workingDays;
        const serviceRevenue = maxRevenuePerFullTech * (totalEfficiency / 100);
        const avgTicketValue = config.laborRate * config.hoursPerTicket;
        const workOrders = Math.floor(serviceRevenue / avgTicketValue);
        
        const element = document.getElementById('workOrdersExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Service Revenue = ${formatCurrency(serviceRevenue)}<br>
                Average Ticket = ${formatCurrency(config.laborRate)} × ${config.hoursPerTicket} hrs = ${formatCurrency(avgTicketValue)}<br>
                Work Orders = ${formatCurrency(serviceRevenue)} ÷ ${formatCurrency(avgTicketValue)} = ${(serviceRevenue/avgTicketValue).toFixed(1)}<br>
                Rounded down = <strong>${workOrders}</strong>
            `;
        }
    }

    function populatePartsRevenueExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const maxRevenuePerFullTech = config.laborRate * config.operatingHoursPerDay * config.workingDays;
        const serviceRevenue = maxRevenuePerFullTech * (totalEfficiency / 100);
        const partsRevenue = serviceRevenue * (config.partsRevenuePercent / 100);
        
        const element = document.getElementById('partsRevenueExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Service Revenue = ${formatCurrency(serviceRevenue)}<br>
                Parts Revenue = ${formatCurrency(serviceRevenue)} × (${formatPercent(config.partsRevenuePercent)} ÷ 100)<br>
                = <strong>${formatCurrency(partsRevenue)}</strong>
            `;
        }
    }

    function populateDetailRevenueExample(config) {
        const totalDetailEfficiency = config.startingDetailWorkers * config.detailStartingEfficiency;
        const maxDetailRevenuePerWorker = config.detailHourlyRate * config.operatingHoursPerDay * config.workingDays;
        const detailRevenue = maxDetailRevenuePerWorker * (totalDetailEfficiency / 100);
        
        const element = document.getElementById('detailRevenueExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Total Detail Efficiency = ${config.startingDetailWorkers} workers × ${formatPercent(config.detailStartingEfficiency)} = ${formatPercent(totalDetailEfficiency)}<br>
                Detail Revenue = ${formatCurrency(config.detailHourlyRate)} × ${config.operatingHoursPerDay} hrs × ${config.workingDays} days × (${formatPercent(totalDetailEfficiency)} ÷ 100)<br>
                = ${formatCurrency(config.detailHourlyRate)} × ${config.operatingHoursPerDay} × ${config.workingDays} × ${(totalDetailEfficiency/100).toFixed(2)}<br>
                = <strong>${formatCurrency(detailRevenue)}</strong>
            `;
        }
    }

    function populateDetailEfficiencyGrowthExample(config) {
        const totalDetailEfficiency = config.startingDetailWorkers * config.detailStartingEfficiency;
        const newDetailEfficiency = totalDetailEfficiency * (1 + config.detailGrowthRate / 100);
        
        const element = document.getElementById('detailEfficiencyGrowthExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 2:</strong><br>
                Previous Total Detail Efficiency = ${formatPercent(totalDetailEfficiency)}<br>
                New Total Detail Efficiency = ${formatPercent(totalDetailEfficiency)} × (1 + ${formatPercent(config.detailGrowthRate)} ÷ 100)<br>
                = ${formatPercent(totalDetailEfficiency)} × ${(1 + config.detailGrowthRate / 100).toFixed(3)}<br>
                = <strong>${formatPercent(newDetailEfficiency)}</strong>
            `;
        }
    }

    function populateDetailWorkerTriggerExample(config) {
        const totalDetailEfficiency = config.startingDetailWorkers * config.detailStartingEfficiency;
        const currentDetailCapacity = config.startingDetailWorkers * 100;
        
        const element = document.getElementById('detailWorkerTriggerExample');
        if (element) {
            element.innerHTML = `
                <strong>Example with current configuration:</strong><br>
                Starting Total Detail Efficiency = ${formatPercent(totalDetailEfficiency)}<br>
                Current Capacity = ${config.startingDetailWorkers} workers × 100% = ${formatPercent(currentDetailCapacity)}<br>
                <strong>Worker addition occurs when Total Detail Efficiency ≥ ${formatPercent(currentDetailCapacity)}</strong>
            `;
        }
    }

    function populateShopChargeExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const maxRevenuePerFullTech = config.laborRate * config.operatingHoursPerDay * config.workingDays;
        const serviceRevenue = maxRevenuePerFullTech * (totalEfficiency / 100);
        const avgTicketValue = config.laborRate * config.hoursPerTicket;
        const workOrders = Math.floor(serviceRevenue / avgTicketValue);
        
        const capAmount = workOrders * config.shopChargeCap;
        const percentAmount = serviceRevenue * (config.shopChargePercent / 100);
        const shopCharge = Math.min(capAmount, percentAmount);
        
        const element = document.getElementById('shopChargeExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Work Orders = ${workOrders}<br>
                Cap Amount = ${workOrders} × ${formatCurrency(config.shopChargeCap)} = ${formatCurrency(capAmount)}<br>
                Percent Amount = ${formatCurrency(serviceRevenue)} × ${formatPercent(config.shopChargePercent)} = ${formatCurrency(percentAmount)}<br>
                Shop Charge = MIN(${formatCurrency(capAmount)}, ${formatCurrency(percentAmount)}) = <strong>${formatCurrency(shopCharge)}</strong>
            `;
        }
    }

    function populateWarrantyRevenueExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const maxRevenuePerFullTech = config.laborRate * config.operatingHoursPerDay * config.workingDays;
        const serviceRevenue = maxRevenuePerFullTech * (totalEfficiency / 100);
        const avgTicketValue = config.laborRate * config.hoursPerTicket;
        const workOrders = Math.floor(serviceRevenue / avgTicketValue);
        
        const warrantyCount = Math.floor(workOrders * (config.warrantyPercent / 100));
        const warrantyRevenue = warrantyCount * config.warrantyPrice;
        
        const element = document.getElementById('warrantyRevenueExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Work Orders = ${workOrders}<br>
                Warranty Count = FLOOR(${workOrders} × ${formatPercent(config.warrantyPercent)}) = ${warrantyCount}<br>
                Warranty Revenue = ${warrantyCount} × ${formatCurrency(config.warrantyPrice)} = <strong>${formatCurrency(warrantyRevenue)}</strong>
            `;
        }
    }

    function populateUsedCarSalesExample(config) {
        const initialUsedCarRevenue = config.initialUsedCars * config.profitPerUsedCar;
        const month2Revenue = initialUsedCarRevenue * (1 + config.usedCarGrowthPercent / 100);
        
        const element = document.getElementById('usedCarSalesExample');
        if (element) {
            element.innerHTML = `
                <strong>Example:</strong><br>
                Month 1: ${config.initialUsedCars} cars × ${formatCurrency(config.profitPerUsedCar)} = ${formatCurrency(initialUsedCarRevenue)}<br>
                Month 2: ${formatCurrency(initialUsedCarRevenue)} × (1 + ${formatPercent(config.usedCarGrowthPercent)} ÷ 100) = <strong>${formatCurrency(month2Revenue)}</strong>
            `;
        }
    }

    function populateDisposalFeesExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const oilDisposal = config.oilDisposalFee * (totalEfficiency / 100);
        const generalDisposal = config.generalDisposalFee * (totalEfficiency / 100);
        const batteryDisposal = config.batteryDisposalFee * (totalEfficiency / 100);
        
        const element = document.getElementById('disposalFeesExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Total Efficiency = ${formatPercent(totalEfficiency)}<br>
                Oil Disposal = ${formatCurrency(config.oilDisposalFee)} × (${formatPercent(totalEfficiency)} ÷ 100) = ${formatCurrency(oilDisposal)}<br>
                General Disposal = ${formatCurrency(config.generalDisposalFee)} × (${formatPercent(totalEfficiency)} ÷ 100) = ${formatCurrency(generalDisposal)}<br>
                Battery Disposal = ${formatCurrency(config.batteryDisposalFee)} × (${formatPercent(totalEfficiency)} ÷ 100) = <strong>${formatCurrency(batteryDisposal)}</strong>
            `;
        }
    }

    function populateTechSalariesExample(config) {
        const techCount = config.startingBays; // Starting tech count equals starting bays
        const techBonus = techCount * (config.techAnnualBonus / 12);
        const techSalaries = (config.seniorTechAnnualSalary / 12) + ((techCount - 1) * config.juniorTechAnnualSalary / 12) + techBonus;
        
        const element = document.getElementById('techSalariesExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Tech Count = ${techCount} (1 senior, ${techCount - 1} junior)<br>
                Senior Tech = ${formatCurrency(config.seniorTechAnnualSalary)} ÷ 12 = ${formatCurrency(config.seniorTechAnnualSalary / 12)}<br>
                Junior Techs = (${techCount - 1}) × ${formatCurrency(config.juniorTechAnnualSalary / 12)} = ${formatCurrency((techCount - 1) * config.juniorTechAnnualSalary / 12)}<br>
                Bonuses = ${techCount} × ${formatCurrency(config.techAnnualBonus / 12)} = ${formatCurrency(techBonus)}<br>
                Total Tech Salaries = <strong>${formatCurrency(techSalaries)}</strong>
            `;
        }
    }

    function populateDetailSalariesExample(config) {
        const detailAnnualSalary = config.detailHourlyRate * 8 * 21 * 12;
        const detailSalaries = config.startingDetailWorkers * (detailAnnualSalary / 12);
        
        const element = document.getElementById('detailSalariesExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Detail Annual Salary = ${formatCurrency(config.detailHourlyRate)} × 8 hrs × 21 days × 12 months = ${formatCurrency(detailAnnualSalary)}<br>
                Detail Salaries = ${config.startingDetailWorkers} workers × (${formatCurrency(detailAnnualSalary)} ÷ 12) = <strong>${formatCurrency(detailSalaries)}</strong>
            `;
        }
    }

    function populateOtherSalariesExample(config) {
        const advisorSalary = config.serviceAdvisorAnnualSalary / 12;
        const managerSalary = config.managerAnnualSalary / 12;
        
        const element = document.getElementById('otherSalariesExample');
        if (element) {
            element.innerHTML = `
                <strong>Example:</strong><br>
                Service Advisor = ${formatCurrency(config.serviceAdvisorAnnualSalary)} ÷ 12 = ${formatCurrency(advisorSalary)}<br>
                Manager = ${formatCurrency(config.managerAnnualSalary)} ÷ 12 = <strong>${formatCurrency(managerSalary)}</strong>
            `;
        }
    }

    function populateDetailCommissionExample(config) {
        const totalDetailEfficiency = config.startingDetailWorkers * config.detailStartingEfficiency;
        const maxDetailRevenuePerWorker = config.detailHourlyRate * config.operatingHoursPerDay * config.workingDays;
        const detailRevenue = maxDetailRevenuePerWorker * (totalDetailEfficiency / 100);
        const detailCommission = detailRevenue * (config.detailCommissionPercent / 100);
        
        const element = document.getElementById('detailCommissionExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Detail Revenue = ${formatCurrency(maxDetailRevenuePerWorker)} × (${formatPercent(totalDetailEfficiency)} ÷ 100) = ${formatCurrency(detailRevenue)}<br>
                Detail Commission = ${formatCurrency(detailRevenue)} × (${formatPercent(config.detailCommissionPercent)} ÷ 100) = <strong>${formatCurrency(detailCommission)}</strong>
            `;
        }
    }

    function populateVariableCostsExample(config) {
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const oilCosts = config.monthlyOilCostPerLift * (totalEfficiency / 100);
        const shopSupplies = config.monthlyShopSuppliesPerLift * (totalEfficiency / 100);
        
        const element = document.getElementById('variableCostsExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Total Efficiency = ${formatPercent(totalEfficiency)}<br>
                Oil Costs = ${formatCurrency(config.monthlyOilCostPerLift)} × (${formatPercent(totalEfficiency)} ÷ 100) = ${formatCurrency(oilCosts)}<br>
                Shop Supplies = ${formatCurrency(config.monthlyShopSuppliesPerLift)} × (${formatPercent(totalEfficiency)} ÷ 100) = <strong>${formatCurrency(shopSupplies)}</strong>
            `;
        }
    }

    function populateRevenueBasedExpensesExample(config) {
        // Calculate sample total revenue for Month 1
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const maxRevenuePerFullTech = config.laborRate * config.operatingHoursPerDay * config.workingDays;
        const serviceRevenue = maxRevenuePerFullTech * (totalEfficiency / 100);
        const partsRevenue = serviceRevenue * (config.partsRevenuePercent / 100);
        const avgTicketValue = config.laborRate * config.hoursPerTicket;
        const workOrders = Math.floor(serviceRevenue / avgTicketValue);
        const shopCharge = Math.min(workOrders * config.shopChargeCap, serviceRevenue * (config.shopChargePercent / 100));
        
        // Simplified total revenue calculation
        const sampleTotalRevenue = serviceRevenue + partsRevenue + shopCharge;
        
        const advertising = sampleTotalRevenue * (config.advertisingPercent / 100);
        const paymentProcessing = (sampleTotalRevenue * config.paymentProcessingPercent / 100) + 
                                 (workOrders * config.paymentProcessingPerTransaction);
        
        const element = document.getElementById('revenueBasedExpensesExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Sample Total Revenue ≈ ${formatCurrency(sampleTotalRevenue)}<br>
                Advertising = ${formatCurrency(sampleTotalRevenue)} × ${formatPercent(config.advertisingPercent)} = ${formatCurrency(advertising)}<br>
                Payment Processing = (${formatCurrency(sampleTotalRevenue)} × ${formatPercent(config.paymentProcessingPercent)}) + (${workOrders} × ${formatCurrency(config.paymentProcessingPerTransaction)})<br>
                = ${formatCurrency(sampleTotalRevenue * config.paymentProcessingPercent / 100)} + ${formatCurrency(workOrders * config.paymentProcessingPerTransaction)} = <strong>${formatCurrency(paymentProcessing)}</strong>
            `;
        }
    }

    function populateFixedExpensesExample(config) {
        const element = document.getElementById('fixedExpensesExample');
        if (element) {
            element.innerHTML = `
                <strong>Monthly amounts:</strong><br>
                ShopKey Software: ${formatCurrency(config.shopKeySoftwareMonthly)}<br>
                Fuel Card: ${formatCurrency(config.monthlyFuelCard)}<br>
                Utilities: ${formatCurrency(config.monthlyUtilities)}<br>
                Detail Supplies: ${formatCurrency(config.monthlyDetailSupplies)}<br>
                Surety Bond: ${formatCurrency(config.monthlySuretyBond)}<br>
                General Liability: ${formatCurrency(config.monthlyGeneralLiability)}<br>
                AAA Membership: ${formatCurrency(config.aaaAnnualMembership)} ÷ 12 = <strong>${formatCurrency(config.aaaAnnualMembership / 12)}</strong>
            `;
        }
    }

    function populatePeriodicExpensesExample(config) {
        const element = document.getElementById('periodicExpensesExample');
        if (element) {
            element.innerHTML = `
                <strong>Every 6 months (months 6, 12, 18, 24, 30, 36):</strong><br>
                Waste Oil Filters: ${formatCurrency(config.wasteOilFiltersCost)}<br>
                Coolant Disposal: <strong>${formatCurrency(config.coolantDisposalCost)}</strong><br>
                <span class="frequency-note">These expenses occur when: month % 6 = 0</span>
            `;
        }
    }

    function populateTotalRevenueExample(config) {
        // Calculate sample values for Month 1
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const maxRevenuePerFullTech = config.laborRate * config.operatingHoursPerDay * config.workingDays;
        const serviceRevenue = maxRevenuePerFullTech * (totalEfficiency / 100);
        const partsRevenue = serviceRevenue * (config.partsRevenuePercent / 100);
        
        const totalDetailEfficiency = config.startingDetailWorkers * config.detailStartingEfficiency;
        const maxDetailRevenuePerWorker = config.detailHourlyRate * config.operatingHoursPerDay * config.workingDays;
        const detailRevenue = maxDetailRevenuePerWorker * (totalDetailEfficiency / 100);
        
        const usedCarSales = config.initialUsedCars * config.profitPerUsedCar;
        const avgTicketValue = config.laborRate * config.hoursPerTicket;
        const workOrders = Math.floor(serviceRevenue / avgTicketValue);
        const shopCharge = Math.min(workOrders * config.shopChargeCap, serviceRevenue * (config.shopChargePercent / 100));
        const warrantyRevenue = Math.floor(workOrders * (config.warrantyPercent / 100)) * config.warrantyPrice;
        const oilDisposal = config.oilDisposalFee * (totalEfficiency / 100);
        const generalDisposal = config.generalDisposalFee * (totalEfficiency / 100);
        const batteryDisposal = config.batteryDisposalFee * (totalEfficiency / 100);
        
        const totalRevenue = serviceRevenue + partsRevenue + detailRevenue + usedCarSales + 
                           shopCharge + warrantyRevenue + oilDisposal + generalDisposal + batteryDisposal;
        
        const element = document.getElementById('totalRevenueExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1:</strong><br>
                Service: ${formatCurrency(serviceRevenue)} + Parts: ${formatCurrency(partsRevenue)} + Detail: ${formatCurrency(detailRevenue)} + <br>
                Used Cars: ${formatCurrency(usedCarSales)} + Shop Charge: ${formatCurrency(shopCharge)} + Warranty: ${formatCurrency(warrantyRevenue)} + <br>
                Oil Disposal: ${formatCurrency(oilDisposal)} + General: ${formatCurrency(generalDisposal)} + Battery: ${formatCurrency(batteryDisposal)}<br>
                = <strong>${formatCurrency(totalRevenue)}</strong>
            `;
        }
    }

    function populateTotalExpensesExample(config) {
        // Sample calculation for Month 1
        const totalEfficiency = config.startingBays * config.startingEfficiency;
        const techCount = config.startingBays;
        const techBonus = techCount * (config.techAnnualBonus / 12);
        const techSalaries = (config.seniorTechAnnualSalary / 12) + ((techCount - 1) * config.juniorTechAnnualSalary / 12) + techBonus;
        
        const detailAnnualSalary = config.detailHourlyRate * 8 * 21 * 12;
        const detailSalaries = config.startingDetailWorkers * (detailAnnualSalary / 12);
        const advisorSalary = config.serviceAdvisorAnnualSalary / 12;
        const managerSalary = config.managerAnnualSalary / 12;
        
        const oilCosts = config.monthlyOilCostPerLift * (totalEfficiency / 100);
        const shopSupplies = config.monthlyShopSuppliesPerLift * (totalEfficiency / 100);
        
        // Calculate detail commission
        const totalDetailEfficiency = config.startingDetailWorkers * config.detailStartingEfficiency;
        const maxDetailRevenuePerWorker = config.detailHourlyRate * config.operatingHoursPerDay * config.workingDays;
        const detailRevenue = maxDetailRevenuePerWorker * (totalDetailEfficiency / 100);
        const detailCommission = detailRevenue * (config.detailCommissionPercent / 100);
        
        // Approximate other expenses
        const sampleTotalExpenses = techSalaries + detailSalaries + advisorSalary + managerSalary + 
                                   detailCommission + oilCosts + config.shopKeySoftwareMonthly + (config.aaaAnnualMembership / 12) + 
                                   config.monthlyFuelCard + config.monthlyUtilities + config.monthlyDetailSupplies + 
                                   shopSupplies + config.monthlySuretyBond + config.monthlyGeneralLiability;
        
        const element = document.getElementById('totalExpensesExample');
        if (element) {
            element.innerHTML = `
                <strong>Example - Month 1 (major components):</strong><br>
                Labor: ${formatCurrency(techSalaries + detailSalaries + advisorSalary + managerSalary)}<br>
                Detail Commission: ${formatCurrency(detailCommission)}<br>
                Oil Costs: ${formatCurrency(oilCosts)}<br>
                Fixed Monthly: ${formatCurrency(config.shopKeySoftwareMonthly + config.monthlyFuelCard + config.monthlyUtilities + config.monthlyDetailSupplies + config.monthlySuretyBond + config.monthlyGeneralLiability)}<br>
                Supplies: ${formatCurrency(shopSupplies)}<br>
                Plus advertising, payment processing, etc.<br>
                ≈ <strong>${formatCurrency(sampleTotalExpenses)}</strong>
            `;
        }
    }

    function populateNetIncomeExample(config) {
        const element = document.getElementById('netIncomeExample');
        if (element) {
            element.innerHTML = `
                <strong>Formula:</strong><br>
                Net Income = Total Revenue - Total Expenses<br>
                Cash Position = Previous Cash Position + Net Income<br><br>
                <strong>Month 1 Special Case:</strong><br>
                Starting Cash = Initial Cash - Initial Investment<br>
                Month 1 Cash Position = Starting Cash + Month 1 Net Income
            `;
        }
    }

    // Initialize when DOM is ready
    function initialize() {
        // Wait a bit to ensure bundle.js has loaded
        setTimeout(populateFormulas, 100);
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();