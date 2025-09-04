// Auto Repair Shop P&L Projections - Bundled JavaScript
// This is a bundled version that works without module imports for direct file:// access

(function() {
    'use strict';

    // ============= CONFIG MODULE =============
    const defaultConfig = {
        // Bay & Efficiency Configuration
        startingBays: 2,
        maxBays: 6,
        startingEfficiency: 40,
        growthRate: 20,
        bayTrigger: 100,
        newBayResetEfficiency: 50,
        maxRevenuePerBay: 20000,
        
        // Service Configuration
        laborRate: 125,
        workingDays: 21,
        hoursPerTicket: 1.6,
        operatingHoursPerDay: 8,
        carsPerDayPerLift: 5,
        shopChargePercent: 7,
        shopChargeCap: 60,
        
        // Parts & Inventory Configuration
        partsRevenuePercent: 70,  // Parts dept makes 70% of service revenue
        initialTireInventory: 10000,
        monthlyTireInventory: 15000,
        
        // Revenue Stream Configuration
        detailMaxRevenue: 20000,
        initialUsedCars: 5,
        profitPerUsedCar: 3000,
        usedCarGrowthPercent: 5,
        warrantyPrice: 1000,
        oilDisposalFee: 150,
        generalDisposalFee: 200,
        batteryDisposalFee: 825,
        
        // Staff Salaries Configuration
        seniorTechAnnualSalary: 60000,
        juniorTechAnnualSalary: 45000,
        techAnnualBonus: 3000,
        serviceAdvisorAnnualSalary: 70000,
        managerAnnualSalary: 100000,
        
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
        newBayEfficiencySource: 'fixed',
        newBayEfficiencyPercent: 80,
        
        // Growth Calculation Rules
        usedCarGrowthFormula: 'fixed',
        usedCarFixedGrowth: 5,
        usedCarExponentialBase: 1.15,
        efficiencyGrowthFormula: 'linear',
        efficiencyExponentialRate: 1.1,
        efficiencySCurveMidpoint: 6
    };

    let config = { ...defaultConfig };

    function getConfig() {
        return { ...config };
    }

    function updateConfig(updates) {
        config = { ...config, ...updates };
        return config;
    }

    function resetConfig() {
        config = { ...defaultConfig };
        return config;
    }

    function updateConfigFromInputs() {
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

    function updateInputsFromConfig() {
        Object.keys(config).forEach(key => {
            const input = document.getElementById(key);
            if (input) {
                input.value = config[key];
            }
        });
    }

    function validateConfig(testConfig = config) {
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

    function exportConfig() {
        return JSON.stringify(config, null, 2);
    }

    function importConfig(jsonString) {
        try {
            const importedConfig = JSON.parse(jsonString);
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

    // ============= CALCULATIONS MODULE =============
    function calculateMonthlyData() {
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
            
            // Calculate parts revenue - parts department makes X% of what service makes
            let partsRevenue = serviceRevenue * (config.partsRevenuePercent / 100);
            
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
            
            // Warranty revenue - starts at 1, grows with efficiency (rounded down)
            const baseWarranties = 1;
            const warrantyCount = Math.floor(baseWarranties * (1 + (currentEfficiency - config.startingEfficiency) / config.startingEfficiency));
            const warrantyRevenue = warrantyCount * config.warrantyPrice;
            
            // Used car sales
            const initialUsedCarRevenue = config.initialUsedCars * config.profitPerUsedCar;
            const carSalesBase = month === 0 ? initialUsedCarRevenue : months[month - 1].usedCarSales;
            let usedCarSales;
            if (config.usedCarGrowthFormula === 'randomRange' || config.usedCarGrowthFormula === 'fixed') {
                usedCarSales = carSalesBase * (1 + config.usedCarGrowthPercent / 100);
            } else if (config.usedCarGrowthFormula === 'exponential') {
                usedCarSales = initialUsedCarRevenue * Math.pow(config.usedCarExponentialBase, month);
            }
            
            // Detail department efficiency and revenue - grows at same rate as service
            let detailEfficiency = Math.min(config.startingEfficiency * Math.pow(1 + config.growthRate / 100, month), 100);
            const detailRevenue = config.detailMaxRevenue * (detailEfficiency / 100);
            
            // Calculate tech salaries including bonuses
            // Always 1 senior tech, rest are juniors
            let techSalaries;
            const techBonus = techCount * (config.techAnnualBonus / 12); // Spread evenly across all months
            techSalaries = (config.seniorTechAnnualSalary / 12) + ((techCount - 1) * config.juniorTechAnnualSalary / 12) + techBonus;
            const advisorSalary = config.serviceAdvisorAnnualSalary / 12;
            const managerSalary = config.managerAnnualSalary / 12;
            
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

    // ============= DATA EXPORT MODULE =============
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    function exportToCSV(data) {
        let csv = 'Month,Bays,Efficiency,Tech Count,Service Revenue,Parts Revenue,Shop Charge,';
        csv += 'Warranty Revenue,Oil Disposal,Disposal Fees,Battery Disposal,Used Car Sales,';
        csv += 'Detail Revenue,Total Revenue,Tech Salaries,Advisor Salary,';
        csv += 'Manager Salary,Advertising,Shop Key,AAA Signup,Fuel Card,Utilities,';
        csv += 'Scan Tool,Waste Oil Filters,Coolant Disposal,Tire Inventory,Oil Costs,';
        csv += 'Detail Supplies,Shop Supplies,Surety Bond,Liability,Payment Processing,';
        csv += 'Laptops,Desktops,Total Expenses,Net Income\n';
        
        data.forEach(m => {
            const totalRevenue = m.serviceRevenue + m.partsRevenue + m.shopCharge + 
                               m.warrantyRevenue + m.oilDisposal + m.disposalFees + 
                               m.batteryDisposal + m.usedCarSales + m.detailRevenue;
            
            const totalExpenses = m.techSalaries + m.advisorSalary + 
                                m.managerSalary + m.advertising + m.shopKey + 
                                m.aaaSignup + m.fuelCard + m.utilities + m.scanTool + 
                                m.wasteOilFilters + m.coolantDisposal + m.tireInventory + 
                                m.oilCosts + m.detailSupplies + m.shopSupplies + 
                                m.suretyBond + m.liability + m.paymentProcessing + 
                                m.laptops + m.desktops;
            
            const netIncome = totalRevenue - totalExpenses;
            
            csv += `${m.month},${m.bays},${m.efficiency.toFixed(1)},${m.techCount},`;
            csv += `${m.serviceRevenue.toFixed(0)},${m.partsRevenue.toFixed(0)},${m.shopCharge.toFixed(0)},`;
            csv += `${m.warrantyRevenue.toFixed(0)},${m.oilDisposal.toFixed(0)},`;
            csv += `${m.disposalFees.toFixed(0)},${m.batteryDisposal.toFixed(0)},`;
            csv += `${m.usedCarSales.toFixed(0)},${m.detailRevenue.toFixed(0)},`;
            csv += `${totalRevenue.toFixed(0)},`;
            csv += `${m.techSalaries.toFixed(0)},${m.advisorSalary.toFixed(0)},`;
            csv += `${m.managerSalary.toFixed(0)},${m.advertising.toFixed(0)},`;
            csv += `${m.shopKey.toFixed(0)},${m.aaaSignup.toFixed(0)},`;
            csv += `${m.fuelCard.toFixed(0)},${m.utilities.toFixed(0)},`;
            csv += `${m.scanTool.toFixed(0)},${m.wasteOilFilters.toFixed(0)},`;
            csv += `${m.coolantDisposal.toFixed(0)},${m.tireInventory.toFixed(0)},`;
            csv += `${m.oilCosts.toFixed(0)},${m.detailSupplies.toFixed(0)},`;
            csv += `${m.shopSupplies.toFixed(0)},${m.suretyBond.toFixed(0)},`;
            csv += `${m.liability.toFixed(0)},${m.paymentProcessing.toFixed(0)},`;
            csv += `${m.laptops.toFixed(0)},${m.desktops.toFixed(0)},`;
            csv += `${totalExpenses.toFixed(0)},${netIncome.toFixed(0)}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'auto-repair-pl-projection.csv';
        a.click();
    }

    function saveConfiguration() {
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'auto-repair-config.json';
        a.click();
    }

    function loadConfiguration(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);
                    resolve(config);
                } catch (error) {
                    reject(new Error('Invalid configuration file'));
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    // ============= UI COMPONENTS MODULE =============
    function updateMetrics(data) {
        const metricsGrid = document.getElementById('metricsGrid');
        const lastMonth = data[11];
        const config = getConfig();
        
        metricsGrid.innerHTML = `
            <div class="metric-card">
                <h4>Active Bays (Month 12)</h4>
                <div class="value">${lastMonth.bays}</div>
            </div>
            <div class="metric-card">
                <h4>Efficiency (Month 12)</h4>
                <div class="value">${lastMonth.efficiency.toFixed(1)}%</div>
                <div class="efficiency-bar">
                    <div class="efficiency-fill" style="width: ${lastMonth.efficiency}%">
                        ${lastMonth.efficiency.toFixed(0)}%
                    </div>
                </div>
            </div>
            <div class="metric-card">
                <h4>Tech Count (Month 12)</h4>
                <div class="value">${lastMonth.techCount}</div>
            </div>
            <div class="metric-card">
                <h4>Monthly Work Orders</h4>
                <div class="value">${lastMonth.workOrders}</div>
            </div>
            <div class="metric-card">
                <h4>Avg Ticket Value</h4>
                <div class="value">${formatCurrency(config.hoursPerTicket * config.laborRate)}</div>
            </div>
            <div class="metric-card">
                <h4>Cars per Day (Month 12)</h4>
                <div class="value">${(lastMonth.workOrders / config.workingDays).toFixed(1)}</div>
            </div>
        `;
    }

    function updateBayInfo(data) {
        const bayInfo = document.getElementById('bayInfo');
        const config = getConfig();
        let bayChanges = [];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i].bays > data[i-1].bays) {
                // Calculate what the growth would have been
                const prevBays = data[i-1].bays;
                const prevAvgEfficiency = data[i-1].efficiency;
                
                // For linear growth (most common case)
                let expectedDemand;
                if (config.efficiencyGrowthFormula === 'linear') {
                    // Each bay would have grown by growthRate
                    expectedDemand = prevAvgEfficiency * (1 + config.growthRate / 100) * prevBays;
                } else {
                    // For other formulas, approximate based on the month
                    expectedDemand = prevAvgEfficiency * 1.2 * prevBays; // fallback approximation
                }
                
                const maxCapacity = prevBays * 100;
                const overflow = Math.max(0, expectedDemand - maxCapacity).toFixed(1);
                bayChanges.push(`Month ${i + 1}: Added Bay #${data[i].bays} (Overflow: ${overflow}% efficiency goes to new bay)`);
            }
        }
        
        if (bayChanges.length > 0) {
            bayInfo.innerHTML = `<strong>Bay Scaling Events:</strong> ${bayChanges.join(' | ')}`;
            if (data[11].bays >= config.maxBays) {
                bayInfo.innerHTML += ` | <strong>Max capacity reached (${config.maxBays} bays)</strong>`;
            }
        } else {
            bayInfo.innerHTML = `<strong>Note:</strong> No additional bays added during projection period. Final average efficiency: ${data[11].efficiency.toFixed(1)}% with ${data[11].bays} bay(s) (Max: ${config.maxBays}).`;
        }
    }

    function generateTable(data) {
        const table = document.getElementById('plTable');
        table.innerHTML = '';
        
        // Header
        let headerRow = '<tr><th>Category</th>';
        for (let i = 0; i < 12; i++) {
            headerRow += `<th>Month ${i + 1}</th>`;
        }
        headerRow += '<th>Total</th></tr>';
        table.innerHTML = headerRow;
        
        // REVENUE SECTION
        table.innerHTML += '<tr class="category-header"><td colspan="14">REVENUE</td></tr>';
        
        // Revenue items
        const revenueItems = [
            { key: 'serviceRevenue', label: 'Service Labor Revenue' },
            { key: 'partsRevenue', label: 'Parts Department Revenue' },
            { key: 'detailRevenue', label: 'Detail Department' },
            { key: 'usedCarSales', label: 'Used Car Sales' },
            { key: 'shopCharge', label: 'Shop Charge (7% capped $60)' },
            { key: 'warrantyRevenue', label: 'Extended Warranties' },
            { key: 'oilDisposal', label: 'Oil Disposal' },
            { key: 'disposalFees', label: 'Disposal Fees' },
            { key: 'batteryDisposal', label: 'Battery Disposal' }
        ];
        
        revenueItems.forEach(item => {
            let row = `<tr class="subcategory"><td>${item.label}</td>`;
            let total = 0;
            data.forEach(m => {
                row += `<td>${formatCurrency(m[item.key])}</td>`;
                total += m[item.key];
            });
            row += `<td>${formatCurrency(total)}</td></tr>`;
            table.innerHTML += row;
        });
        
        // Total Revenue
        let row = '<tr class="total-row"><td>Total Revenue</td>';
        let grandTotalRevenue = 0;
        data.forEach(m => {
            const monthTotal = m.serviceRevenue + m.partsRevenue + m.detailRevenue + m.usedCarSales + 
                             m.shopCharge + m.warrantyRevenue + m.oilDisposal + m.disposalFees + m.batteryDisposal;
            row += `<td>${formatCurrency(monthTotal)}</td>`;
            grandTotalRevenue += monthTotal;
        });
        row += `<td>${formatCurrency(grandTotalRevenue)}</td></tr>`;
        table.innerHTML += row;
        
        // EXPENSES SECTION
        table.innerHTML += '<tr class="category-header"><td colspan="14">EXPENSES</td></tr>';
        
        // Cost of Goods Sold
        table.innerHTML += '<tr class="subcategory"><td><strong>Cost of Goods Sold</strong></td><td colspan="13"></td></tr>';
        
        const cogsItems = [
            { key: 'tireInventory', label: 'Tire Inventory' },
            { key: 'oilCosts', label: 'Oil Costs (Per Bay)' }
        ];
        
        cogsItems.forEach(item => {
            let row = `<tr class="subcategory"><td>${item.label}</td>`;
            let total = 0;
            data.forEach(m => {
                row += `<td>${formatCurrency(m[item.key])}</td>`;
                total += m[item.key];
            });
            row += `<td>${formatCurrency(total)}</td></tr>`;
            table.innerHTML += row;
        });
        
        // Labor Costs
        table.innerHTML += '<tr class="subcategory"><td><strong>Labor Costs</strong></td><td colspan="13"></td></tr>';
        
        const laborItems = [
            { key: 'techSalaries', label: 'Technician Salaries + Bonuses' },
            { key: 'advisorSalary', label: 'Service Advisor (Nick)' },
            { key: 'managerSalary', label: 'Manager (Josh)' }
        ];
        
        laborItems.forEach(item => {
            let row = `<tr class="subcategory"><td>${item.label}</td>`;
            let total = 0;
            data.forEach(m => {
                row += `<td>${formatCurrency(m[item.key])}</td>`;
                total += m[item.key];
            });
            row += `<td>${formatCurrency(total)}</td></tr>`;
            table.innerHTML += row;
        });
        
        // Operating Expenses
        table.innerHTML += '<tr class="subcategory"><td><strong>Operating Expenses</strong></td><td colspan="13"></td></tr>';
        
        const operatingExpenses = [
            { key: 'advertising', label: 'Advertising' },
            { key: 'utilities', label: 'Utilities' },
            { key: 'shopKey', label: 'ShopKey Software' },
            { key: 'paymentProcessing', label: 'Payment Processing (2.29%)' },
            { key: 'fuelCard', label: 'Fuel Card' },
            { key: 'detailSupplies', label: 'Detail Supplies' },
            { key: 'shopSupplies', label: 'Shop Supplies/Misc' },
            { key: 'suretyBond', label: 'Surety Bond' },
            { key: 'liability', label: 'General Liability Insurance' },
            { key: 'aaaSignup', label: 'AAA Signup (Annual)' }
        ];
        
        operatingExpenses.forEach(expense => {
            let row = `<tr class="subcategory"><td>${expense.label}</td>`;
            let total = 0;
            data.forEach(m => {
                row += `<td>${formatCurrency(m[expense.key])}</td>`;
                total += m[expense.key];
            });
            row += `<td>${formatCurrency(total)}</td></tr>`;
            table.innerHTML += row;
        });
        
        // Equipment & Periodic Expenses
        table.innerHTML += '<tr class="subcategory"><td><strong>Equipment & Periodic</strong></td><td colspan="13"></td></tr>';
        
        const equipmentItems = [
            { key: 'scanTool', label: 'Scan Tool (One-time)' },
            { key: 'laptops', label: 'Tech Laptops' },
            { key: 'desktops', label: 'Desktop Computers' },
            { key: 'wasteOilFilters', label: 'Waste Oil Filters (6mo)' },
            { key: 'coolantDisposal', label: 'Coolant Disposal (6mo)' }
        ];
        
        equipmentItems.forEach(item => {
            let row = `<tr class="subcategory"><td>${item.label}</td>`;
            let total = 0;
            data.forEach(m => {
                row += `<td>${formatCurrency(m[item.key])}</td>`;
                total += m[item.key];
            });
            row += `<td>${formatCurrency(total)}</td></tr>`;
            table.innerHTML += row;
        });
        
        // Total Expenses
        row = '<tr class="expense-total"><td>Total Expenses</td>';
        let grandTotalExpenses = 0;
        data.forEach(m => {
            const monthExpenses = m.tireInventory + m.oilCosts + m.techSalaries + m.advisorSalary + 
                                m.managerSalary + m.advertising + m.utilities + m.shopKey + 
                                m.paymentProcessing + m.fuelCard + m.detailSupplies + m.shopSupplies + 
                                m.suretyBond + m.liability + m.aaaSignup + m.scanTool + m.laptops + 
                                m.desktops + m.wasteOilFilters + m.coolantDisposal;
            row += `<td>${formatCurrency(monthExpenses)}</td>`;
            grandTotalExpenses += monthExpenses;
        });
        row += `<td>${formatCurrency(grandTotalExpenses)}</td></tr>`;
        table.innerHTML += row;
        
        // Net Income
        row = '<tr class="net-income"><td>NET INCOME</td>';
        let totalNetIncome = 0;
        data.forEach(m => {
            const monthRevenue = m.serviceRevenue + m.partsRevenue + m.detailRevenue + m.usedCarSales + 
                               m.shopCharge + m.warrantyRevenue + m.oilDisposal + m.disposalFees + m.batteryDisposal;
            const monthExpenses = m.tireInventory + m.oilCosts + m.techSalaries + m.advisorSalary + 
                                m.managerSalary + m.advertising + m.utilities + m.shopKey + 
                                m.paymentProcessing + m.fuelCard + m.detailSupplies + m.shopSupplies + 
                                m.suretyBond + m.liability + m.aaaSignup + m.scanTool + m.laptops + 
                                m.desktops + m.wasteOilFilters + m.coolantDisposal;
            const netIncome = monthRevenue - monthExpenses;
            totalNetIncome += netIncome;
            const className = netIncome >= 0 ? 'positive' : 'negative';
            row += `<td class="${className}">${formatCurrency(netIncome)}</td>`;
        });
        const totalClassName = totalNetIncome >= 0 ? 'positive' : 'negative';
        row += `<td class="${totalClassName}">${formatCurrency(totalNetIncome)}</td></tr>`;
        table.innerHTML += row;
        
        // Update summary cards
        updateSummaryCards(grandTotalRevenue, grandTotalExpenses, totalNetIncome);
    }

    function updateSummaryCards(revenue, expenses, netIncome) {
        const summaryCards = document.getElementById('summaryCards');
        const margin = revenue > 0 ? (netIncome / revenue * 100).toFixed(1) : 0;
        const avgMonthlyIncome = netIncome / 12;
        
        summaryCards.innerHTML = `
            <div class="summary-card">
                <h3>Total Revenue</h3>
                <div class="value">${formatCurrency(revenue)}</div>
            </div>
            <div class="summary-card">
                <h3>Total Expenses</h3>
                <div class="value">${formatCurrency(expenses)}</div>
            </div>
            <div class="summary-card ${netIncome >= 0 ? 'profit' : 'loss'}">
                <h3>Net Income</h3>
                <div class="value">${formatCurrency(netIncome)}</div>
            </div>
            <div class="summary-card">
                <h3>Profit Margin</h3>
                <div class="value">${margin}%</div>
            </div>
            <div class="summary-card">
                <h3>Avg Monthly Income</h3>
                <div class="value">${formatCurrency(avgMonthlyIncome)}</div>
            </div>
        `;
    }

    // ============= FORMULAS MODULE =============
    function updateFormulaPreview() {
        const config = getConfig();
        const previews = document.querySelectorAll('.formula-preview');
        
        previews.forEach(preview => {
            const formula = preview.getAttribute('data-formula');
            if (formula && config[formula]) {
                preview.textContent = `Current: ${config[formula]}`;
            }
        });
    }

    function validateFormulas() {
        const config = getConfig();
        const warnings = [];
        
        if (config.partsGenerationFormula === 'percentOfService' && config.serviceToPartsPercent <= 0) {
            warnings.push('Parts generation is set to percent of service but percentage is 0 or negative');
        }
        
        if (config.workOrderFormula === 'fixed' && config.workOrdersFixed <= 0) {
            warnings.push('Work order formula is set to fixed but fixed amount is 0 or negative');
        }
        
        if (config.techSalaryFormula === 'perBay' && config.techSalaryPerBay <= 0) {
            warnings.push('Tech salary is set to per bay but salary per bay is 0 or negative');
        }
        
        if (config.oilCostFormula === 'percentOfRevenue' && config.oilCostPercent <= 0) {
            warnings.push('Oil cost is set to percent of revenue but percentage is 0 or negative');
        }
        
        if (config.oilCostFormula === 'perWorkOrder' && config.oilCostPerOrder <= 0) {
            warnings.push('Oil cost is set to per work order but cost per order is 0 or negative');
        }
        
        if (config.paymentProcessFormula === 'flatRate' && config.paymentProcessFlatRate <= 0) {
            warnings.push('Payment processing is set to flat rate but rate is 0 or negative');
        }
        
        
        if (config.efficiencyGrowthFormula === 'exponential' && config.efficiencyExponentialRate <= 1) {
            warnings.push('Efficiency growth is exponential but rate is not greater than 1');
        }
        
        if (config.efficiencyGrowthFormula === 'sCurve' && config.efficiencySCurveMidpoint <= 0) {
            warnings.push('Efficiency growth is S-curve but midpoint is 0 or negative');
        }
        
        if (config.usedCarGrowthFormula === 'exponential' && config.usedCarExponentialBase <= 1) {
            warnings.push('Used car growth is exponential but base is not greater than 1');
        }
        
        return warnings;
    }

    // ============= MAIN APPLICATION =============
    let monthlyData = [];

    function generateProjections() {
        updateConfigFromInputs();
        
        const errors = validateConfig();
        if (errors.length > 0) {
            alert('Configuration errors:\n' + errors.join('\n'));
            return;
        }
        
        const warnings = validateFormulas();
        if (warnings.length > 0) {
            console.warn('Formula warnings:', warnings);
        }
        
        monthlyData = calculateMonthlyData();
        
        updateMetrics(monthlyData);
        updateBayInfo(monthlyData);
        generateTable(monthlyData);
        updateFormulaPreview();
    }

    function handleReset() {
        if (confirm('Reset all values to defaults?')) {
            resetConfig();
            updateInputsFromConfig();
            generateProjections();
        }
    }

    function handleExportCSV() {
        if (monthlyData.length === 0) {
            alert('Please generate projections first');
            return;
        }
        exportToCSV(monthlyData);
    }

    function handleSaveConfig() {
        saveConfiguration();
    }

    async function handleLoadConfig(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const loadedConfig = await loadConfiguration(file);
            const errors = validateConfig(loadedConfig);
            
            if (errors.length > 0) {
                alert('Invalid configuration:\n' + errors.join('\n'));
                return;
            }
            
            updateConfig(loadedConfig);
            updateInputsFromConfig();
            generateProjections();
            alert('Configuration loaded successfully');
        } catch (error) {
            alert('Failed to load configuration: ' + error.message);
        }
        
        event.target.value = '';
    }

    function toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.toggle('collapsed');
        }
    }

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

    function initializeInputListeners() {
        const inputs = document.querySelectorAll('.control-group input, .control-group select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.id === 'startingBays' || input.id === 'maxBays' || 
                    input.id === 'startingEfficiency' || input.id === 'growthRate') {
                    generateProjections();
                }
            });
        });
    }

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

    function initializeFormulaPreviews() {
        const formulaSelects = document.querySelectorAll('select[id$="Formula"]');
        formulaSelects.forEach(select => {
            select.addEventListener('change', () => {
                updateFormulaPreview();
                generateProjections();
            });
        });
    }

    function initialize() {
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
        
        initializeCollapsibleSections();
        initializeInputListeners();
        initializeFileInput();
        initializeFormulaPreviews();
        
        updateInputsFromConfig();
        generateProjections();
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();