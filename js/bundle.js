// Auto Repair Shop P&L Projections - Bundled JavaScript
// This is a bundled version that works without module imports for direct file:// access

(function() {
    'use strict';

    // ============= CONFIG MODULE =============
    const defaultConfig = {
        // Initial Startup Costs
        initialCashPosition: 20000,
        scanToolCost: 2500,
        vehicleLiftsQty: 4,
        vehicleLiftUnitCost: 2500,
        tireBalanceMountingMachine: 3000,
        airCompressorSystem: 1500,
        workbenchesShelvingFixtures: 2000,
        oilCoolantManagementSystems: 2000,
        initialLaptopsQty: 2,
        laptopUnitCost: 500,
        initialDesktopsQty: 2,
        desktopUnitCost: 1000,
        mobileDetailVan: 5000,
        detailEquipment: 1500,
        initialMarketingSignage: 3000,
        initialLicensesPermits: 1000,
        initialInsuranceDeposit: 1000,
        
        // Bay & Efficiency Configuration
        startingBays: 2,
        maxBays: 6,
        startingEfficiency: 40,
        growthRate: 20,
        startingMonth: 0,  // 0=January, 1=February, ..., 11=December
        
        // Service Configuration
        laborRate: 125,
        workingDays: 21,
        hoursPerTicket: 1.6,
        operatingHoursPerDay: 8,
        shopChargePercent: 7,
        shopChargeCap: 60,
        
        // Parts & Inventory Configuration
        partsRevenuePercent: 70,  // Parts dept makes 70% of service revenue
        
        // Detail Department Configuration
        startingDetailWorkers: 1,
        maxDetailWorkers: 3,
        detailStartingEfficiency: 40,
        detailGrowthRate: 30,
        detailHourlyWage: 15,  // What we pay detail workers per hour
        detailChargeRate: 50,  // What we charge customers per hour for detailing
        detailCommissionPercent: 40,  // Commission paid on detail profit
        
        // Revenue Stream Configuration
        initialUsedCars: 2,
        profitPerUsedCar: 3000,
        usedCarGrowthPercent: 5,
        warrantyPercent: 1,
        warrantyPrice: 1000,
        oilDisposalFee: 150,
        generalDisposalFee: 200,
        batteryDisposalFee: 100,
        
        // Staff Salaries Configuration
        seniorTechAnnualSalary: 60000,
        juniorTechAnnualSalary: 45000,
        techAnnualBonus: 3000,
        serviceAdvisorAnnualSalary: 70000,
        managerAnnualSalary: 100000,
        
        // Operating Expenses Configuration
        advertisingPercent: 2.5,
        shopKeySoftwareMonthly: 300,
        paymentProcessingPercent: 2.29,
        paymentProcessingPerTransaction: 0.09,
        aaaAnnualMembership: 400,
        monthlyFuelCard: 400,
        monthlyUtilities: 1200,
        monthlyRent: 5000,
        monthlySuretyBond: 20,
        monthlyGeneralLiability: 200,
        
        // Equipment Configuration  (removed - now all in initial startup costs)
        
        // Supplies & Disposal Configuration
        monthlyDetailSupplies: 500,
        monthlyShopSuppliesPerLift: 250,
        monthlyOilCostPerLift: 2500,
        wasteOilFiltersCost: 300,
        coolantDisposalCost: 300,
        wasteDisposalFrequencyMonths: 6,
        
        // Payroll Tax Configuration
        workersCompRate: 0.69, // $0.69 per $100 of payroll
        socialSecurityRate: 6.2, // 6.2% on wages up to $160,200 per employee
        socialSecurityWageCap: 160200, // Annual cap per employee
        medicareRate: 1.45, // 1.45% on all wages
        futaRate: 0.6, // 0.6% on first $7,000 per employee
        futaWageCap: 7000, // Annual cap per employee
        
        // Income Tax Configuration
        federalIncomeTaxRate: 21, // 21% federal corporate tax rate
        wvStateTaxRate: 6.5, // 6.5% WV corporate tax rate
        
        // Essential Calculation Formulas
        paymentProcessFormula: 'percentPlusTransaction',
        
        // Monthly Efficiency Multipliers (12 months, repeats each year)
        monthlyEfficiencyMultipliers: [
            100, 100, 100, 100, 100, 100,  // Months 1-6
            100, 100, 100, 100, 100, 100   // Months 7-12
        ]
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
        
        // Handle monthly multipliers separately
        const multipliers = [];
        for (let i = 0; i < 12; i++) {
            const multiplierInput = document.getElementById(`monthMultiplier${i}`);
            if (multiplierInput) {
                multipliers.push(parseInt(multiplierInput.value) || 100);
            }
        }
        if (multipliers.length === 12) {
            updates.monthlyEfficiencyMultipliers = multipliers;
        }
        
        inputs.forEach(input => {
            const key = input.id;
            // Skip monthly multiplier inputs as they're handled above
            if (key.startsWith('monthMultiplier')) return;
            
            if (config.hasOwnProperty(key)) {
                if (input.tagName === 'SELECT') {
                    // Convert select values to numbers if they're numeric
                    updates[key] = isNaN(input.value) ? input.value : parseInt(input.value);
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
            // Handle monthly multipliers separately
            if (key === 'monthlyEfficiencyMultipliers') {
                config.monthlyEfficiencyMultipliers.forEach((value, index) => {
                    const input = document.getElementById(`monthMultiplier${index}`);
                    if (input) {
                        input.value = value;
                    }
                });
            } else {
                const input = document.getElementById(key);
                if (input) {
                    input.value = config[key];
                }
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
        
        // Validate monthly efficiency multipliers
        if (testConfig.monthlyEfficiencyMultipliers) {
            testConfig.monthlyEfficiencyMultipliers.forEach((multiplier, index) => {
                if (multiplier < 0 || multiplier > 200) {
                    errors.push(`Month ${index + 1} multiplier must be between 0 and 200%`);
                }
            });
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
    function calculatePayrollTaxes(month, totalPayroll, techCount, currentDetailWorkers, advisorSalary, managerSalary, config, techHireDates, detailHireDates) {
        const year = Math.floor(month / 12) + 1;
        const monthInYear = month % 12;
        
        // Calculate individual monthly salaries for employee tracking
        const seniorTechMonthlySalary = config.seniorTechAnnualSalary / 12;
        const juniorTechMonthlySalary = config.juniorTechAnnualSalary / 12;
        const techBonus = config.techAnnualBonus / 12;
        const detailAnnualSalary = config.detailHourlyWage * 8 * 21 * 12;
        const detailMonthlySalary = detailAnnualSalary / 12;
        
        // Calculate year-to-date wages for each employee (for caps)
        // monthInYear is 0-based (0-11), representing months completed in current year
        const monthsInCurrentYear = monthInYear;  // Months already completed (excluding current month)
        
        // For consistent employees (present all year)
        const seniorTechYTD = (seniorTechMonthlySalary + techBonus) * monthsInCurrentYear;
        const advisorYTD = advisorSalary * monthsInCurrentYear;
        const managerYTD = managerSalary * monthsInCurrentYear;
        
        // For employees that may be added during the year
        // Track when each position was filled
        const juniorTechMonthlyPay = juniorTechMonthlySalary + techBonus;
        const detailWorkerMonthlyPay = detailMonthlySalary;
        
        // Workers' Compensation: $0.69 per $100 of total payroll
        const workersComp = totalPayroll * (config.workersCompRate / 100);
        
        // Social Security: 6.2% on wages up to $160,200 per employee
        let socialSecurity = 0;
        
        // Helper function to calculate Social Security for an employee
        const calculateSocialSecurity = (monthlyPay, ytdPay) => {
            if (ytdPay >= config.socialSecurityWageCap) {
                return 0; // Already hit the cap
            }
            const taxableAmount = Math.min(monthlyPay, config.socialSecurityWageCap - ytdPay);
            return taxableAmount * (config.socialSecurityRate / 100);
        };
        
        // Senior tech
        const seniorTechThisMonth = seniorTechMonthlySalary + techBonus;
        socialSecurity += calculateSocialSecurity(seniorTechThisMonth, seniorTechYTD);
        
        // Junior techs (techCount - 1)
        for (let i = 0; i < techCount - 1; i++) {
            // Calculate YTD based on when this tech was hired
            const techIndex = i + 1; // Skip senior tech (index 0)
            const hireMonth = techHireDates[techIndex] || 0;
            const hireYear = Math.floor(hireMonth / 12);
            const currentYear = Math.floor(month / 12);
            
            // Only count months worked in the current year
            let monthsEmployedThisYear = 0;
            if (hireYear === currentYear) {
                // Hired this year - count months since hire
                monthsEmployedThisYear = Math.max(0, monthInYear - (hireMonth % 12));
            } else if (hireYear < currentYear) {
                // Hired in previous year - count all months this year
                monthsEmployedThisYear = monthInYear;
            }
            
            const juniorYTD = juniorTechMonthlyPay * monthsEmployedThisYear;
            socialSecurity += calculateSocialSecurity(juniorTechMonthlyPay, juniorYTD);
        }
        
        // Detail workers
        for (let i = 0; i < currentDetailWorkers; i++) {
            // Calculate YTD based on when this worker was hired
            const hireMonth = detailHireDates[i] || 0;
            const hireYear = Math.floor(hireMonth / 12);
            const currentYear = Math.floor(month / 12);
            
            // Only count months worked in the current year
            let monthsEmployedThisYear = 0;
            if (hireYear === currentYear) {
                // Hired this year - count months since hire
                monthsEmployedThisYear = Math.max(0, monthInYear - (hireMonth % 12));
            } else if (hireYear < currentYear) {
                // Hired in previous year - count all months this year
                monthsEmployedThisYear = monthInYear;
            }
            
            const detailYTD = detailWorkerMonthlyPay * monthsEmployedThisYear;
            socialSecurity += calculateSocialSecurity(detailWorkerMonthlyPay, detailYTD);
        }
        
        // Service advisor
        socialSecurity += calculateSocialSecurity(advisorSalary, advisorYTD);
        
        // Manager
        socialSecurity += calculateSocialSecurity(managerSalary, managerYTD);
        
        // Medicare: 1.45% on all wages (no cap)
        const medicare = totalPayroll * (config.medicareRate / 100);
        
        // FUTA: 0.6% on first $7,000 per employee per year
        // Each employee owes max $42 per year ($7,000 * 0.6%)
        let futa = 0;
        
        // Helper function to calculate FUTA for an employee
        const calculateFUTA = (monthlyPay, ytdPay) => {
            if (ytdPay >= config.futaWageCap) {
                return 0; // Already hit the cap
            }
            const taxableAmount = Math.min(monthlyPay, config.futaWageCap - ytdPay);
            return taxableAmount * (config.futaRate / 100);
        };
        
        // Senior tech (always present from month 1)
        futa += calculateFUTA(seniorTechThisMonth, seniorTechYTD);
        
        // Junior techs - track each based on actual hire date
        for (let i = 0; i < techCount - 1; i++) {
            // Calculate YTD based on when this tech was hired
            const techIndex = i + 1; // Skip senior tech (index 0)
            const hireMonth = techHireDates[techIndex] || 0;
            const hireYear = Math.floor(hireMonth / 12);
            const currentYear = Math.floor(month / 12);
            
            // Only count months worked in the current year
            let monthsEmployedThisYear = 0;
            if (hireYear === currentYear) {
                // Hired this year - count months since hire
                monthsEmployedThisYear = Math.max(0, monthInYear - (hireMonth % 12));
            } else if (hireYear < currentYear) {
                // Hired in previous year - count all months this year
                monthsEmployedThisYear = monthInYear;
            }
            
            const juniorYTD = juniorTechMonthlyPay * monthsEmployedThisYear;
            futa += calculateFUTA(juniorTechMonthlyPay, juniorYTD);
        }
        
        // Detail workers - track each based on actual hire date
        for (let i = 0; i < currentDetailWorkers; i++) {
            // Calculate YTD based on when this worker was hired
            const hireMonth = detailHireDates[i] || 0;
            const hireYear = Math.floor(hireMonth / 12);
            const currentYear = Math.floor(month / 12);
            
            // Only count months worked in the current year
            let monthsEmployedThisYear = 0;
            if (hireYear === currentYear) {
                // Hired this year - count months since hire
                monthsEmployedThisYear = Math.max(0, monthInYear - (hireMonth % 12));
            } else if (hireYear < currentYear) {
                // Hired in previous year - count all months this year
                monthsEmployedThisYear = monthInYear;
            }
            
            const detailYTD = detailWorkerMonthlyPay * monthsEmployedThisYear;
            futa += calculateFUTA(detailWorkerMonthlyPay, detailYTD);
        }
        
        // Service advisor (always present from month 1)
        futa += calculateFUTA(advisorSalary, advisorYTD);
        
        // Manager (always present from month 1)
        futa += calculateFUTA(managerSalary, managerYTD);
        
        return {
            workersComp,
            socialSecurity,
            medicare,
            futa,
            total: workersComp + socialSecurity + medicare + futa
        };
    }
    
    function calculateMonthlyData() {
        const config = getConfig();
        const months = [];
        let currentBays = config.startingBays;
        // Start with total efficiency: startingBays × startingEfficiency (e.g., 2 × 40% = 80%)
        let totalEfficiency = config.startingBays * config.startingEfficiency;
        let techCount = config.startingBays;
        
        // Track when each tech is hired (month number)
        // Start with initial techs (1 senior + initial juniors)
        let techHireDates = [];
        for (let i = 0; i < config.startingBays; i++) {
            techHireDates.push(0); // All initial techs start at month 0
        }
        
        // Detail department tracking
        let currentDetailWorkers = config.startingDetailWorkers;
        let totalDetailEfficiency = config.startingDetailWorkers * config.detailStartingEfficiency;
        
        // Track when each detail worker is hired
        let detailHireDates = [];
        for (let i = 0; i < config.startingDetailWorkers; i++) {
            detailHireDates.push(0); // Initial detail workers start at month 0
        }
        
        // Calculate total initial investment
        const laptopsTotalCost = config.initialLaptopsQty * config.laptopUnitCost;
        const desktopsTotalCost = config.initialDesktopsQty * config.desktopUnitCost;
        const vehicleLiftsTotalCost = config.vehicleLiftsQty * config.vehicleLiftUnitCost;
        const totalInitialInvestment = config.initialCashPosition + config.scanToolCost +
                                      vehicleLiftsTotalCost + config.tireBalanceMountingMachine +
                                      config.airCompressorSystem + config.workbenchesShelvingFixtures +
                                      config.oilCoolantManagementSystems + laptopsTotalCost + desktopsTotalCost +
                                      config.mobileDetailVan + config.detailEquipment + config.initialMarketingSignage + 
                                      config.initialLicensesPermits + config.initialInsuranceDeposit;
        
        // Starting cash position after initial investment (negative = debt from startup costs)
        let runningCashPosition = -totalInitialInvestment;
        
        for (let month = 0; month < 36; month++) {
            // Apply growth to total efficiency after first month
            if (month > 0) {
                // Service department growth
                totalEfficiency = totalEfficiency * (1 + config.growthRate / 100);
                
                // Cap total efficiency at maxBays × 100%
                const maxTotalEfficiency = config.maxBays * 100;
                totalEfficiency = Math.min(totalEfficiency, maxTotalEfficiency);
                
                // Check if total efficiency >= current capacity (current bays × 100%)
                let currentCapacity = currentBays * 100;
                while (totalEfficiency >= currentCapacity && currentBays < config.maxBays) {
                    // Add a new bay and tech
                    currentBays++;
                    techCount++;
                    techHireDates.push(month); // Track when this tech was hired
                    // Update current capacity for next iteration
                    currentCapacity = currentBays * 100;
                }
                
                // Detail department growth
                totalDetailEfficiency = totalDetailEfficiency * (1 + config.detailGrowthRate / 100);
                
                // Cap detail efficiency at maxDetailWorkers × 100%
                const maxDetailEfficiency = config.maxDetailWorkers * 100;
                totalDetailEfficiency = Math.min(totalDetailEfficiency, maxDetailEfficiency);
                
                // Check if detail efficiency >= current capacity (current workers × 100%)
                let currentDetailCapacity = currentDetailWorkers * 100;
                while (totalDetailEfficiency >= currentDetailCapacity && currentDetailWorkers < config.maxDetailWorkers) {
                    // Add a new detail worker
                    currentDetailWorkers++;
                    detailHireDates.push(month); // Track when this detail worker was hired
                    // Update current capacity for next iteration
                    currentDetailCapacity = currentDetailWorkers * 100;
                }
            }
            
            // Get the monthly efficiency multiplier based on calendar month
            // The multipliers are indexed by calendar month (0=Jan, 1=Feb, etc.)
            // We need to map the projection month to the actual calendar month
            const calendarMonthIndex = (config.startingMonth + month) % 12;
            const monthlyMultiplier = (config.monthlyEfficiencyMultipliers[calendarMonthIndex] || 100) / 100;
            
            // Calculate service revenue based on total efficiency
            // Each 100% efficiency = 1 tech working full time = laborRate × 8 hours × working days
            const maxRevenuePerFullTech = config.laborRate * config.operatingHoursPerDay * config.workingDays;
            let serviceRevenue = maxRevenuePerFullTech * (totalEfficiency / 100) * monthlyMultiplier;
            
            // Calculate average efficiency per bay for display purposes
            let currentEfficiency = totalEfficiency / currentBays;
            
            // Calculate parts revenue - parts department makes X% of what service makes
            let partsRevenue = serviceRevenue * (config.partsRevenuePercent / 100);
            
            // Calculate parts cost (COGS) - typically 50% markup on parts
            let partsCost = partsRevenue * 0.50;
            
            // Calculate work orders (derived from service revenue)
            const avgTicketValue = config.laborRate * config.hoursPerTicket;
            const workOrders = Math.floor(serviceRevenue / avgTicketValue);
            
            // Calculate shop charge (7% of service revenue, capped at $60 per work order)
            const shopCharge = Math.min(workOrders * config.shopChargeCap, serviceRevenue * (config.shopChargePercent / 100));
            
            // Warranty revenue - percentage of work orders
            const warrantyCount = Math.floor(workOrders * (config.warrantyPercent / 100));
            const warrantyRevenue = warrantyCount * config.warrantyPrice;
            
            // Used car sales
            const initialUsedCarRevenue = config.initialUsedCars * config.profitPerUsedCar;
            // Used car sales with fixed growth rate
            let usedCarSalesBase;
            if (month === 0) {
                usedCarSalesBase = initialUsedCarRevenue;
            } else {
                // Get the base value from previous month (before multiplier was applied)
                usedCarSalesBase = months[month - 1].usedCarSalesBase || months[month - 1].usedCarSales;
            }
            const usedCarSalesGrowth = usedCarSalesBase * (1 + config.usedCarGrowthPercent / 100);
            const usedCarSales = usedCarSalesGrowth * monthlyMultiplier;
            
            // Calculate detail revenue based on detail worker efficiency
            // Each detail worker at 100% = charge rate × 8 hours × working days
            const maxDetailRevenuePerWorker = config.detailChargeRate * config.operatingHoursPerDay * config.workingDays;
            const detailRevenue = maxDetailRevenuePerWorker * (totalDetailEfficiency / 100) * monthlyMultiplier;
            
            // Calculate average detail efficiency for display
            let currentDetailEfficiency = totalDetailEfficiency / currentDetailWorkers;
            
            // Calculate tech salaries including bonuses
            // Always 1 senior tech, rest are juniors
            let techSalaries;
            const techBonus = techCount * (config.techAnnualBonus / 12); // Spread evenly across all months
            techSalaries = (config.seniorTechAnnualSalary / 12) + ((techCount - 1) * config.juniorTechAnnualSalary / 12) + techBonus;
            
            // Calculate detail worker salaries (annual salary = hourly wage × 8 × 21 × 12)
            const detailAnnualSalary = config.detailHourlyWage * 8 * 21 * 12;
            const detailSalaries = currentDetailWorkers * (detailAnnualSalary / 12);
            
            const advisorSalary = config.serviceAdvisorAnnualSalary / 12;
            const managerSalary = config.managerAnnualSalary / 12;
            
            // Detail commission expense (percentage of detail department net profit)
            // Calculate detail department profit first (revenue - salaries - supplies)
            const detailProfit = detailRevenue - detailSalaries - config.monthlyDetailSupplies;
            const detailCommission = detailProfit > 0 ? detailProfit * (config.detailCommissionPercent / 100) : 0;
            
            // Calculate total payroll for payroll tax calculations (does not include commission as it's profit-based)
            const totalPayroll = techSalaries + detailSalaries + advisorSalary + managerSalary;
            
            // Calculate payroll taxes
            const payrollTaxes = calculatePayrollTaxes(month, totalPayroll, techCount, currentDetailWorkers, 
                                                     advisorSalary, managerSalary, config, techHireDates, detailHireDates);
            
            // Calculate oil costs - scales with total efficiency and monthly multiplier
            // This is the cost of oil we purchase to put in customer vehicles
            let oilCosts = config.monthlyOilCostPerLift * (totalEfficiency / 100) * monthlyMultiplier;
            
            // Calculate shop supplies - scales with total efficiency and monthly multiplier ($250 per lift)
            let shopSupplies = config.monthlyShopSuppliesPerLift * (totalEfficiency / 100) * monthlyMultiplier;
            
            // Calculate disposal fee revenue - scale with total efficiency and monthly multiplier
            // These are fees we charge customers for disposing of waste materials
            // We also sell the waste oil, generating additional revenue
            let oilDisposal = config.oilDisposalFee * (totalEfficiency / 100) * monthlyMultiplier;
            let generalDisposal = config.generalDisposalFee * (totalEfficiency / 100) * monthlyMultiplier;
            let batteryDisposal = config.batteryDisposalFee * currentBays * monthlyMultiplier;

            // Calculate total revenue
            const totalRevenue = serviceRevenue + partsRevenue + shopCharge + warrantyRevenue + 
                               usedCarSales + detailRevenue + oilDisposal + 
                               generalDisposal + batteryDisposal;
            
            // Calculate advertising as percentage of total revenue
            const advertising = totalRevenue * (config.advertisingPercent / 100);
            
            // Payment processing based on selected formula
            let paymentProcessing;
            if (config.paymentProcessFormula === 'percentPlusTransaction') {
                paymentProcessing = (totalRevenue * config.paymentProcessingPercent / 100) + 
                                   (workOrders * config.paymentProcessingPerTransaction);
            } else if (config.paymentProcessFormula === 'percentOnly') {
                paymentProcessing = totalRevenue * config.paymentProcessingPercent / 100;
            } else if (config.paymentProcessFormula === 'flatRate') {
                paymentProcessing = workOrders * config.paymentProcessingPerTransaction;
            } else {
                // Default to percent plus transaction
                paymentProcessing = (totalRevenue * config.paymentProcessingPercent / 100) + 
                                   (workOrders * config.paymentProcessingPerTransaction);
            }
            
            // Calculate net income for this month
            const totalExpenses = techSalaries + detailSalaries + detailCommission + advisorSalary + managerSalary + payrollTaxes.total +
                                advertising + config.shopKeySoftwareMonthly + (config.aaaAnnualMembership / 12) + 
                                config.monthlyFuelCard + config.monthlyUtilities + config.monthlyRent +
                                (month % config.wasteDisposalFrequencyMonths === 0 ? config.wasteOilFiltersCost : 0) +
                                (month % config.wasteDisposalFrequencyMonths === 0 ? config.coolantDisposalCost : 0) +
                                oilCosts + partsCost + config.monthlyDetailSupplies + 
                                shopSupplies + config.monthlySuretyBond + config.monthlyGeneralLiability +
                                paymentProcessing;
            
            const netIncomeBeforeTax = totalRevenue - totalExpenses;
            
            // Calculate income taxes (only on positive income)
            let federalIncomeTax = 0;
            let wvStateTax = 0;
            if (netIncomeBeforeTax > 0) {
                federalIncomeTax = netIncomeBeforeTax * (config.federalIncomeTaxRate / 100);
                wvStateTax = netIncomeBeforeTax * (config.wvStateTaxRate / 100);
            }
            const totalIncomeTax = federalIncomeTax + wvStateTax;
            const netIncomeAfterTax = netIncomeBeforeTax - totalIncomeTax;
            
            runningCashPosition += netIncomeAfterTax;
            
            months.push({
                month: month + 1,
                bays: currentBays,
                efficiency: currentEfficiency,
                techCount: techCount,
                detailWorkers: currentDetailWorkers,
                detailEfficiency: currentDetailEfficiency,
                // Revenue
                serviceRevenue: serviceRevenue,
                partsRevenue: partsRevenue,
                shopCharge: shopCharge,
                warrantyRevenue: warrantyRevenue,
                oilDisposal: oilDisposal,
                disposalFees: generalDisposal,
                batteryDisposal: batteryDisposal,
                usedCarSales: usedCarSales,
                usedCarSalesBase: usedCarSalesGrowth,  // Store base value before multiplier for next month's growth calc
                detailRevenue: detailRevenue,
                // Expenses
                techSalaries: techSalaries,
                detailSalaries: detailSalaries,
                advisorSalary: advisorSalary,
                managerSalary: managerSalary,
                totalPayroll: totalPayroll,  // Total payroll before taxes
                partsCost: partsCost,
                // Payroll Taxes
                workersComp: payrollTaxes.workersComp,
                socialSecurity: payrollTaxes.socialSecurity,
                medicare: payrollTaxes.medicare,
                futa: payrollTaxes.futa,
                totalPayrollTaxes: payrollTaxes.total,
                advertising: advertising,
                shopKey: config.shopKeySoftwareMonthly,
                aaaSignup: config.aaaAnnualMembership / 12,
                fuelCard: config.monthlyFuelCard,
                utilities: config.monthlyUtilities,
                rent: config.monthlyRent,
                // Equipment costs moved to initial investment
                wasteOilFilters: month % config.wasteDisposalFrequencyMonths === 0 ? config.wasteOilFiltersCost : 0,
                coolantDisposal: month % config.wasteDisposalFrequencyMonths === 0 ? config.coolantDisposalCost : 0,
                tireInventory: 0,  // Removed from tracking
                oilCosts: oilCosts,
                detailSupplies: config.monthlyDetailSupplies,
                shopSupplies: shopSupplies,
                suretyBond: config.monthlySuretyBond,
                liability: config.monthlyGeneralLiability,
                paymentProcessing: paymentProcessing,
                detailCommission: detailCommission,
                // Equipment costs handled in initial investment only
                workOrders: workOrders,
                // Income taxes
                federalIncomeTax: federalIncomeTax,
                wvStateTax: wvStateTax,
                totalIncomeTax: totalIncomeTax,
                // Financial tracking
                netIncomeBeforeTax: netIncomeBeforeTax,
                netIncome: netIncomeAfterTax,  // This is now after-tax
                cashPosition: runningCashPosition,
                initialInvestment: month === 0 ? totalInitialInvestment : 0
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
        let csv = 'Month,Year,Bays,Efficiency,Tech Count,Detail Workers,Detail Efficiency,Service Revenue,Parts Revenue,Shop Charge,';
        csv += 'Warranty Revenue,Oil Disposal,Disposal Fees,Battery Disposal,Used Car Sales,';
        csv += 'Detail Revenue,Total Revenue,Tech Salaries,Detail Salaries,Advisor Salary,';
        csv += 'Manager Salary,Total Payroll,Parts Cost,Workers Comp,Social Security,Medicare,FUTA,Total Payroll Taxes,';
        csv += 'Advertising,Shop Key,AAA Signup,Fuel Card,Utilities,Rent,';
        csv += 'Waste Oil Filters,Waste Coolant Disposal,Oil Costs,';
        csv += 'Detail Supplies,Shop Supplies,Surety Bond,Liability,Payment Processing,';
        csv += 'Detail Commission,Total Expenses,Income Before Tax,Federal Income Tax,WV State Tax,Total Income Tax,Net Income After Tax\n';
        
        data.forEach((m, index) => {
            const year = Math.floor(index / 12) + 1;
            const monthInYear = (index % 12) + 1;
            
            const totalRevenue = m.serviceRevenue + m.partsRevenue + m.shopCharge + 
                               m.warrantyRevenue + m.oilDisposal + m.disposalFees + 
                               m.batteryDisposal + m.usedCarSales + m.detailRevenue;
            
            const totalExpenses = m.techSalaries + m.detailSalaries + m.advisorSalary + 
                                m.managerSalary + m.partsCost + m.totalPayrollTaxes + m.advertising + m.shopKey + 
                                m.aaaSignup + m.fuelCard + m.utilities + m.rent +
                                m.wasteOilFilters + m.coolantDisposal + 
                                m.oilCosts + m.detailSupplies + m.shopSupplies + 
                                m.suretyBond + m.liability + m.paymentProcessing + 
                                m.detailCommission;
            
            csv += `${monthInYear},${year},${m.bays},${m.efficiency.toFixed(1)},${m.techCount},`;
            csv += `${m.detailWorkers},${m.detailEfficiency.toFixed(1)},`;
            csv += `${m.serviceRevenue.toFixed(0)},${m.partsRevenue.toFixed(0)},${m.shopCharge.toFixed(0)},`;
            csv += `${m.warrantyRevenue.toFixed(0)},${m.oilDisposal.toFixed(0)},`;
            csv += `${m.disposalFees.toFixed(0)},${m.batteryDisposal.toFixed(0)},`;
            csv += `${m.usedCarSales.toFixed(0)},${m.detailRevenue.toFixed(0)},`;
            csv += `${totalRevenue.toFixed(0)},`;
            csv += `${m.techSalaries.toFixed(0)},${m.detailSalaries.toFixed(0)},${m.advisorSalary.toFixed(0)},`;
            csv += `${m.managerSalary.toFixed(0)},${m.totalPayroll.toFixed(0)},${m.partsCost.toFixed(0)},${m.workersComp.toFixed(0)},${m.socialSecurity.toFixed(0)},`;
            csv += `${m.medicare.toFixed(0)},${m.futa.toFixed(0)},${m.totalPayrollTaxes.toFixed(0)},`;
            csv += `${m.advertising.toFixed(0)},`;
            csv += `${m.shopKey.toFixed(0)},${m.aaaSignup.toFixed(0)},`;
            csv += `${m.fuelCard.toFixed(0)},${m.utilities.toFixed(0)},${m.rent.toFixed(0)},`;
            csv += `${m.wasteOilFilters.toFixed(0)},`;
            csv += `${m.coolantDisposal.toFixed(0)},`;
            csv += `${m.oilCosts.toFixed(0)},${m.detailSupplies.toFixed(0)},`;
            csv += `${m.shopSupplies.toFixed(0)},${m.suretyBond.toFixed(0)},`;
            csv += `${m.liability.toFixed(0)},${m.paymentProcessing.toFixed(0)},`;
            csv += `${m.detailCommission.toFixed(0)},`;
            csv += `${totalExpenses.toFixed(0)},${m.netIncomeBeforeTax.toFixed(0)},`;
            csv += `${m.federalIncomeTax.toFixed(0)},${m.wvStateTax.toFixed(0)},`;
            csv += `${m.totalIncomeTax.toFixed(0)},${m.netIncome.toFixed(0)}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'auto-repair-3year-projection.csv';
        a.click();
        
        // Clean up the URL after download to prevent memory leak
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }

    function saveConfiguration() {
        const json = JSON.stringify(config, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'auto-repair-config.json';
        a.click();
        
        // Clean up the URL after download to prevent memory leak
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 100);
    }

    function loadConfiguration(file) {
        return new Promise((resolve, reject) => {
            // Validate file type
            if (!file.name.endsWith('.json')) {
                reject(new Error('Please select a JSON configuration file'));
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const config = JSON.parse(event.target.result);
                    // Basic validation that it's a config object
                    if (typeof config !== 'object' || config === null) {
                        reject(new Error('Invalid configuration format'));
                        return;
                    }
                    resolve(config);
                } catch (error) {
                    if (error instanceof SyntaxError) {
                        reject(new Error('Invalid JSON format in configuration file'));
                    } else {
                        reject(new Error('Failed to parse configuration file'));
                    }
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file. Please try again.'));
            reader.readAsText(file);
        });
    }

    // ============= UI COMPONENTS MODULE =============
    function updateMetrics(data, year = 1) {
        const metricsGrid = document.getElementById('metricsGrid');
        // Get last month of selected year (or year 3 for summary)
        const yearToShow = year === 'summary' ? 3 : year;
        const lastMonthIndex = (yearToShow * 12) - 1;
        const lastMonth = data[Math.min(lastMonthIndex, data.length - 1)];
        const config = getConfig();
        
        const yearLabel = year === 'summary' ? 'Year 3 End' : `Year ${year} End`;
        
        const totalEfficiency = lastMonth.efficiency * lastMonth.bays;
        const maxPossibleEfficiency = config.maxBays * 100;
        
        // Calculate initial investment total
        const laptopsTotalCost = config.initialLaptopsQty * config.laptopUnitCost;
        const desktopsTotalCost = config.initialDesktopsQty * config.desktopUnitCost;
        const vehicleLiftsTotalCost = config.vehicleLiftsQty * config.vehicleLiftUnitCost;
        const totalInitialInvestment = config.initialCashPosition + config.scanToolCost +
                                      vehicleLiftsTotalCost + config.tireBalanceMountingMachine +
                                      config.airCompressorSystem + config.workbenchesShelvingFixtures +
                                      config.oilCoolantManagementSystems + laptopsTotalCost + desktopsTotalCost +
                                      config.mobileDetailVan + config.detailEquipment + config.initialMarketingSignage + 
                                      config.initialLicensesPermits + config.initialInsuranceDeposit;
        
        // Find break-even month
        let breakEvenMonth = -1;
        for (let i = 0; i < data.length; i++) {
            if (data[i].cashPosition > 0) {
                breakEvenMonth = i + 1;
                break;
            }
        }
        
        const totalDetailEfficiency = lastMonth.detailEfficiency * lastMonth.detailWorkers;
        const maxDetailEfficiency = config.maxDetailWorkers * 100;
        
        metricsGrid.innerHTML = `
            <div class="metric-card">
                <h4>Initial Investment</h4>
                <div class="value">${formatCurrency(totalInitialInvestment)}</div>
            </div>
            <div class="metric-card">
                <h4>Cash Position (${yearLabel})</h4>
                <div class="value ${lastMonth.cashPosition >= 0 ? 'positive' : 'negative'}">${formatCurrency(lastMonth.cashPosition)}</div>
            </div>
            <div class="metric-card">
                <h4>Break-Even Month</h4>
                <div class="value">${breakEvenMonth > 0 ? `Month ${breakEvenMonth}` : 'Not Yet'}</div>
            </div>
            <div class="metric-card">
                <h4>Service Bays / Techs</h4>
                <div class="value">${lastMonth.bays} / ${lastMonth.techCount}</div>
            </div>
            <div class="metric-card">
                <h4>Service Efficiency</h4>
                <div class="value">${totalEfficiency.toFixed(0)}%</div>
                <div class="efficiency-bar">
                    <div class="efficiency-fill" style="width: ${(totalEfficiency / maxPossibleEfficiency * 100)}%">
                        ${totalEfficiency.toFixed(0)}% / ${maxPossibleEfficiency}%
                    </div>
                </div>
            </div>
            <div class="metric-card">
                <h4>Detail Workers</h4>
                <div class="value">${lastMonth.detailWorkers}</div>
            </div>
            <div class="metric-card">
                <h4>Detail Efficiency</h4>
                <div class="value">${totalDetailEfficiency.toFixed(0)}%</div>
                <div class="efficiency-bar">
                    <div class="efficiency-fill" style="width: ${(totalDetailEfficiency / maxDetailEfficiency * 100)}%">
                        ${totalDetailEfficiency.toFixed(0)}% / ${maxDetailEfficiency}%
                    </div>
                </div>
            </div>
            <div class="metric-card">
                <h4>Work Orders / Month</h4>
                <div class="value">${lastMonth.workOrders}</div>
            </div>
        `;
    }

    function updateBayInfo(data) {
        const bayInfo = document.getElementById('bayInfo');
        const config = getConfig();
        let bayChanges = [];
        let detailChanges = [];
        
        for (let i = 1; i < data.length; i++) {
            if (data[i].bays > data[i-1].bays) {
                // Calculate the total efficiency that triggered the bay addition
                const prevTotalEfficiency = data[i-1].efficiency * data[i-1].bays;
                const currentTotalEfficiency = data[i].efficiency * data[i].bays;
                
                bayChanges.push(`Month ${i + 1}: Added Tech #${data[i].bays} (Total efficiency: ${currentTotalEfficiency.toFixed(0)}%)`);
            }
            if (data[i].detailWorkers > data[i-1].detailWorkers) {
                const currentDetailEfficiency = data[i].detailEfficiency * data[i].detailWorkers;
                detailChanges.push(`Month ${i + 1}: Added Detail Worker #${data[i].detailWorkers} (Total efficiency: ${currentDetailEfficiency.toFixed(0)}%)`);
            }
        }
        
        const finalMonth = data[data.length - 1];
        const finalTotalEfficiency = finalMonth.efficiency * finalMonth.bays;
        const maxPossibleEfficiency = config.maxBays * 100;
        const finalDetailEfficiency = finalMonth.detailEfficiency * finalMonth.detailWorkers;
        const maxDetailEfficiency = config.maxDetailWorkers * 100;
        
        let infoHTML = '';
        
        if (bayChanges.length > 0) {
            infoHTML += `<strong>Service Dept Events:</strong> ${bayChanges.join(' | ')}`;
            if (finalMonth.bays >= config.maxBays) {
                infoHTML += ` | <strong>Max Techs Reached</strong>`;
            }
        } else {
            infoHTML += `<strong>Service:</strong> No bay additions. Final: ${finalTotalEfficiency.toFixed(0)}% with ${finalMonth.bays} bay(s)`;
        }
        
        infoHTML += '<br>';
        
        if (detailChanges.length > 0) {
            infoHTML += `<strong>Detail Dept Events:</strong> ${detailChanges.join(' | ')}`;
            if (finalMonth.detailWorkers >= config.maxDetailWorkers) {
                infoHTML += ` | <strong>Max Workers Reached</strong>`;
            }
        } else {
            infoHTML += `<strong>Detail:</strong> No worker additions. Final: ${finalDetailEfficiency.toFixed(0)}% with ${finalMonth.detailWorkers} worker(s)`;
        }
        
        bayInfo.innerHTML = infoHTML;
    }

    function calculateYearlyTotals(data, year) {
        const startMonth = (year - 1) * 12;
        const endMonth = year * 12;
        const yearData = data.slice(startMonth, endMonth);
        
        const totals = {};
        const keys = ['serviceRevenue', 'partsRevenue', 'detailRevenue', 'usedCarSales', 'shopCharge', 
                     'warrantyRevenue', 'oilDisposal', 'disposalFees', 'batteryDisposal',
                     'oilCosts', 'partsCost', 'techSalaries', 'detailSalaries', 'advisorSalary', 'managerSalary',
                     'totalPayroll', 'workersComp', 'socialSecurity', 'medicare', 'futa', 'totalPayrollTaxes',
                     'advertising', 'rent', 'utilities', 'shopKey', 'paymentProcessing', 'detailCommission', 'fuelCard', 'detailSupplies', 'shopSupplies',
                     'suretyBond', 'liability', 'aaaSignup', 'wasteOilFilters', 'coolantDisposal',
                     'federalIncomeTax', 'wvStateTax', 'totalIncomeTax', 'netIncomeBeforeTax', 'netIncome'];
                     
        keys.forEach(key => {
            totals[key] = yearData.reduce((sum, month) => sum + month[key], 0);
        });
        
        return totals;
    }

    function generateTableSection(items, displayData, year, formatCurrency) {
        let html = '';
        items.forEach(item => {
            let row = `<tr class="subcategory"><td>${item.label}</td>`;
            let total = 0;
            
            displayData.forEach(dataPoint => {
                const value = dataPoint[item.key] || 0;
                row += `<td>${formatCurrency(value)}</td>`;
                total += value;
            });
            row += `<td>${formatCurrency(total)}</td></tr>`;
            html += row;
        });
        return html;
    }

    function generateTable(data, year = 1) {
        const tableHead = document.getElementById('plTableHead');
        const tableBody = document.getElementById('plTable');
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        
        let startMonth, endMonth, displayData;
        
        // Month name arrays
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        if (year === 'summary') {
            // Show yearly totals for 3-year summary
            displayData = [
                calculateYearlyTotals(data, 1),
                calculateYearlyTotals(data, 2), 
                calculateYearlyTotals(data, 3)
            ];
            let headerRow = '<tr><th>Category</th><th>Year 1</th><th>Year 2</th><th>Year 3</th><th>3-Year Total</th></tr>';
            tableHead.innerHTML = headerRow;
        } else {
            // Show monthly data for specific year
            startMonth = (year - 1) * 12;
            endMonth = year * 12;
            displayData = data.slice(startMonth, endMonth);
            
            let headerRow = '<tr><th>Category</th>';
            const startingMonth = config.startingMonth || 0;
            for (let i = 0; i < 12; i++) {
                const monthIndex = (startingMonth + startMonth + i) % 12;
                headerRow += `<th>${monthNames[monthIndex]}</th>`;
            }
            headerRow += '<th>Year Total</th></tr>';
            tableHead.innerHTML = headerRow;
        }
        
        // INITIAL INVESTMENT SECTION (only for month view, not summary)
        if (year !== 'summary') {
            tableBody.innerHTML += '<tr class="category-header"><td>INITIAL INVESTMENT</td><td colspan="13"></td></tr>';
            
            // Initial Investment row
            let investmentRow = '<tr class="subcategory"><td>Initial Startup Investment</td>';
            displayData.forEach(m => {
                investmentRow += `<td>${m.initialInvestment > 0 ? formatCurrency(m.initialInvestment) : '-'}</td>`;
            });
            investmentRow += `<td>${formatCurrency(displayData[0].initialInvestment || 0)}</td></tr>`;
            tableBody.innerHTML += investmentRow;
        }
        
        // REVENUE SECTION
        tableBody.innerHTML += '<tr class="category-header"><td>REVENUE</td><td colspan="13"></td></tr>';
        
        // Revenue items
        const revenueItems = [
            { key: 'serviceRevenue', label: 'Service Labor Revenue' },
            { key: 'partsRevenue', label: 'Parts Department Revenue' },
            { key: 'detailRevenue', label: 'Detail Department' },
            { key: 'usedCarSales', label: 'Used Car Sales' },
            { key: 'shopCharge', label: 'Shop Charge' },
            { key: 'warrantyRevenue', label: 'Extended Warranties' },
            { key: 'oilDisposal', label: 'Oil Disposal' },
            { key: 'disposalFees', label: 'Disposal Fees' },
            { key: 'batteryDisposal', label: 'Battery Disposal' }
        ];
        
        tableBody.innerHTML += generateTableSection(revenueItems, displayData, year, formatCurrency);
        
        // Total Revenue
        let row = '<tr class="total-row"><td>Total Revenue</td>';
        let grandTotalRevenue = 0;
        
        if (year === 'summary') {
            displayData.forEach(yearData => {
                const yearTotal = yearData.serviceRevenue + yearData.partsRevenue + yearData.detailRevenue + 
                                yearData.usedCarSales + yearData.shopCharge + yearData.warrantyRevenue + 
                                yearData.oilDisposal + yearData.disposalFees + yearData.batteryDisposal;
                row += `<td>${formatCurrency(yearTotal)}</td>`;
                grandTotalRevenue += yearTotal;
            });
        } else {
            displayData.forEach(m => {
                const monthTotal = m.serviceRevenue + m.partsRevenue + m.detailRevenue + m.usedCarSales + 
                                 m.shopCharge + m.warrantyRevenue + m.oilDisposal + m.disposalFees + m.batteryDisposal;
                row += `<td>${formatCurrency(monthTotal)}</td>`;
                grandTotalRevenue += monthTotal;
            });
        }
        row += `<td>${formatCurrency(grandTotalRevenue)}</td></tr>`;
        tableBody.innerHTML += row;
        
        // EXPENSES SECTION
        tableBody.innerHTML += '<tr class="category-header"><td>EXPENSES</td><td colspan="13"></td></tr>';
        
        // Labor Costs
        tableBody.innerHTML += '<tr class="subcategory"><td><strong>Labor Costs</strong></td><td colspan="13"></td></tr>';
        
        const laborItems = [
            { key: 'techSalaries', label: 'Technician Salaries + Bonuses' },
            { key: 'detailSalaries', label: 'Detail Worker Salaries' },
            { key: 'advisorSalary', label: 'Service Advisor' },
            { key: 'managerSalary', label: 'Manager' }
        ];
        
        tableBody.innerHTML += generateTableSection(laborItems, displayData, year, formatCurrency);
        
        // Add Total Payroll row
        let totalPayrollRow = '<tr class="payroll-total-row"><td>Total Payroll</td>';
        if (year === 'summary') {
            displayData.forEach(yearData => {
                const yearTotal = yearData.totalPayroll || (yearData.techSalaries + yearData.detailSalaries + yearData.advisorSalary + yearData.managerSalary);
                totalPayrollRow += `<td>${formatCurrency(yearTotal)}</td>`;
            });
        } else {
            displayData.forEach(m => {
                const monthTotal = m.totalPayroll || (m.techSalaries + m.detailSalaries + m.advisorSalary + m.managerSalary);
                totalPayrollRow += `<td>${formatCurrency(monthTotal)}</td>`;
            });
        }
        totalPayrollRow += '<td>' + formatCurrency(displayData.reduce((sum, item) => {
            return sum + (item.totalPayroll || (item.techSalaries + item.detailSalaries + item.advisorSalary + item.managerSalary));
        }, 0)) + '</td></tr>';
        tableBody.innerHTML += totalPayrollRow;
        
        // Cost of Goods Sold
        tableBody.innerHTML += '<tr class="subcategory"><td><strong>Cost of Goods Sold</strong></td><td colspan="13"></td></tr>';
        
        const cogsItems = [
            { key: 'oilCosts', label: 'Oil Costs' },
            { key: 'partsCost', label: 'Parts Cost' }
        ];
        
        tableBody.innerHTML += generateTableSection(cogsItems, displayData, year, formatCurrency);
        
        // Payroll Taxes
        tableBody.innerHTML += '<tr class="subcategory"><td><strong>Payroll Taxes</strong></td><td colspan="13"></td></tr>';
        
        const payrollTaxItems = [
            { key: 'workersComp', label: 'Workers\' Compensation' },
            { key: 'socialSecurity', label: 'Social Security' },
            { key: 'medicare', label: 'Medicare' },
            { key: 'futa', label: 'Federal Unemployment' }
        ];
        
        tableBody.innerHTML += generateTableSection(payrollTaxItems, displayData, year, formatCurrency);
        
        // Operating Expenses
        tableBody.innerHTML += '<tr class="subcategory"><td><strong>Operating Expenses</strong></td><td colspan="13"></td></tr>';
        
        const operatingExpenses = [
            { key: 'advertising', label: 'Advertising' },
            { key: 'rent', label: 'Rent' },
            { key: 'utilities', label: 'Utilities' },
            { key: 'shopKey', label: 'ShopKey Software' },
            { key: 'paymentProcessing', label: 'Payment Processing' },
            { key: 'detailCommission', label: 'Detail Commission' },
            { key: 'fuelCard', label: 'Fuel Card' },
            { key: 'detailSupplies', label: 'Detail Supplies' },
            { key: 'shopSupplies', label: 'Shop Supplies/Misc' },
            { key: 'suretyBond', label: 'Surety Bond' },
            { key: 'liability', label: 'General Liability Insurance' },
            { key: 'aaaSignup', label: 'AAA Signup (Annual)' }
        ];
        
        tableBody.innerHTML += generateTableSection(operatingExpenses, displayData, year, formatCurrency);
        
        // Periodic Expenses
        tableBody.innerHTML += '<tr class="subcategory"><td><strong>Periodic Expenses</strong></td><td colspan="13"></td></tr>';
        
        const equipmentItems = [
            { key: 'wasteOilFilters', label: 'Waste Oil Filters (6mo)' },
            { key: 'coolantDisposal', label: 'Waste Coolant Disposal (6mo)' }
        ];
        
        tableBody.innerHTML += generateTableSection(equipmentItems, displayData, year, formatCurrency);
        
        // Total Expenses
        row = '<tr class="expense-total"><td>Total Expenses</td>';
        let grandTotalExpenses = 0;
        
        if (year === 'summary') {
            displayData.forEach(yearData => {
                const yearTotal = yearData.oilCosts + yearData.partsCost + yearData.techSalaries + yearData.detailSalaries + yearData.advisorSalary + 
                                yearData.managerSalary + yearData.totalPayrollTaxes + yearData.advertising + yearData.rent + yearData.utilities + yearData.shopKey + 
                                yearData.paymentProcessing + yearData.detailCommission + yearData.fuelCard + yearData.detailSupplies + yearData.shopSupplies + 
                                yearData.suretyBond + yearData.liability + yearData.aaaSignup + yearData.wasteOilFilters + yearData.coolantDisposal;
                row += `<td>${formatCurrency(yearTotal)}</td>`;
                grandTotalExpenses += yearTotal;
            });
        } else {
            displayData.forEach(m => {
                const monthExpenses = m.oilCosts + m.partsCost + m.techSalaries + m.detailSalaries + m.advisorSalary + 
                                    m.managerSalary + m.totalPayrollTaxes + m.advertising + m.rent + m.utilities + m.shopKey + 
                                    m.paymentProcessing + m.detailCommission + m.fuelCard + m.detailSupplies + m.shopSupplies + 
                                    m.suretyBond + m.liability + m.aaaSignup + m.wasteOilFilters + m.coolantDisposal;
                row += `<td>${formatCurrency(monthExpenses)}</td>`;
                grandTotalExpenses += monthExpenses;
            });
        }
        row += `<td>${formatCurrency(grandTotalExpenses)}</td></tr>`;
        tableBody.innerHTML += row;
        
        // Income Before Tax
        row = '<tr class="net-income"><td>INCOME BEFORE TAX</td>';
        let totalIncomeBeforeTax = 0;
        
        if (year === 'summary') {
            displayData.forEach(yearData => {
                const incomeBeforeTax = yearData.netIncomeBeforeTax || 0;
                totalIncomeBeforeTax += incomeBeforeTax;
                const className = incomeBeforeTax >= 0 ? 'positive' : 'negative';
                row += `<td class="${className}">${formatCurrency(incomeBeforeTax)}</td>`;
            });
        } else {
            displayData.forEach(m => {
                const incomeBeforeTax = m.netIncomeBeforeTax || 0;
                totalIncomeBeforeTax += incomeBeforeTax;
                const className = incomeBeforeTax >= 0 ? 'positive' : 'negative';
                row += `<td class="${className}">${formatCurrency(incomeBeforeTax)}</td>`;
            });
        }
        const totalClassName = totalIncomeBeforeTax >= 0 ? 'positive' : 'negative';
        row += `<td class="${totalClassName}">${formatCurrency(totalIncomeBeforeTax)}</td></tr>`;
        tableBody.innerHTML += row;
        
        // Federal Income Tax
        row = '<tr class="subcategory"><td>Federal Income Tax (21%)</td>';
        let totalFederalTax = 0;
        
        if (year === 'summary') {
            displayData.forEach(yearData => {
                const federalTax = yearData.federalIncomeTax || 0;
                totalFederalTax += federalTax;
                row += `<td>${formatCurrency(federalTax)}</td>`;
            });
        } else {
            displayData.forEach(m => {
                const federalTax = m.federalIncomeTax || 0;
                totalFederalTax += federalTax;
                row += `<td>${formatCurrency(federalTax)}</td>`;
            });
        }
        row += `<td>${formatCurrency(totalFederalTax)}</td></tr>`;
        tableBody.innerHTML += row;
        
        // WV State Tax
        row = '<tr class="subcategory"><td>WV State Tax (6.5%)</td>';
        let totalStateTax = 0;
        
        if (year === 'summary') {
            displayData.forEach(yearData => {
                const stateTax = yearData.wvStateTax || 0;
                totalStateTax += stateTax;
                row += `<td>${formatCurrency(stateTax)}</td>`;
            });
        } else {
            displayData.forEach(m => {
                const stateTax = m.wvStateTax || 0;
                totalStateTax += stateTax;
                row += `<td>${formatCurrency(stateTax)}</td>`;
            });
        }
        row += `<td>${formatCurrency(totalStateTax)}</td></tr>`;
        tableBody.innerHTML += row;
        
        // Net Income After Tax
        row = '<tr class="net-income"><td>NET INCOME AFTER TAX</td>';
        let totalNetIncome = 0;
        
        if (year === 'summary') {
            displayData.forEach(yearData => {
                const netIncome = yearData.netIncome || 0;
                totalNetIncome += netIncome;
                const className = netIncome >= 0 ? 'positive' : 'negative';
                row += `<td class="${className}">${formatCurrency(netIncome)}</td>`;
            });
        } else {
            displayData.forEach(m => {
                const netIncome = m.netIncome || 0;
                totalNetIncome += netIncome;
                const className = netIncome >= 0 ? 'positive' : 'negative';
                row += `<td class="${className}">${formatCurrency(netIncome)}</td>`;
            });
        }
        const netIncomeClassName = totalNetIncome >= 0 ? 'positive' : 'negative';
        row += `<td class="${netIncomeClassName}">${formatCurrency(totalNetIncome)}</td></tr>`;
        tableBody.innerHTML += row;
        
        // Cash Position (only for monthly view, not summary)
        if (year !== 'summary') {
            row = '<tr class="cash-position"><td>CASH POSITION</td>';
            displayData.forEach(m => {
                const className = m.cashPosition >= 0 ? 'positive' : 'negative';
                row += `<td class="${className}">${formatCurrency(m.cashPosition)}</td>`;
            });
            const finalCash = displayData[displayData.length - 1].cashPosition;
            const finalClassName = finalCash >= 0 ? 'positive' : 'negative';
            row += `<td class="${finalClassName}">${formatCurrency(finalCash)}</td></tr>`;
            tableBody.innerHTML += row;
        }
        
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

    // ============= MAIN APPLICATION =============
    let monthlyData = [];

    function generateProjections() {
        updateConfigFromInputs();
        
        const errors = validateConfig();
        if (errors.length > 0) {
            alert('Configuration errors:\n' + errors.join('\n'));
            return;
        }
        
        monthlyData = calculateMonthlyData();
        
        // Reset to Year 1 tab
        const tabs = document.querySelectorAll('.tab-button');
        tabs.forEach(t => t.classList.remove('active'));
        const year1Tab = document.querySelector('.tab-button[data-year="1"]');
        if (year1Tab) year1Tab.classList.add('active');
        
        // Default to showing Year 1
        updateMetrics(monthlyData, 1);
        updateBayInfo(monthlyData);
        generateTable(monthlyData, 1);
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
        
        // Initialize toggle all sections button
        const toggleAllBtn = document.getElementById('toggleAllSections');
        if (toggleAllBtn) {
            toggleAllBtn.addEventListener('click', () => {
                const sections = document.querySelectorAll('.config-section');
                const allCollapsed = Array.from(sections).every(section => section.classList.contains('collapsed'));
                
                sections.forEach(section => {
                    if (allCollapsed) {
                        section.classList.remove('collapsed');
                    } else {
                        section.classList.add('collapsed');
                    }
                });
                
                // Update button text
                toggleAllBtn.textContent = allCollapsed ? 'Collapse All Sections' : 'Expand All Sections';
            });
        }
    }

    function initializeYearTabs() {
        const tabs = document.querySelectorAll('.tab-button');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                e.target.classList.add('active');
                
                // Get year from data attribute
                const year = e.target.getAttribute('data-year');
                
                // Clean up sticky header before regenerating table
                cleanupStickyHeader();
                
                // Regenerate table and metrics for selected year
                if (monthlyData.length > 0) {
                    const yearValue = year === 'summary' ? 'summary' : parseInt(year);
                    generateTable(monthlyData, yearValue);
                    updateMetrics(monthlyData, yearValue);
                    
                    // Re-setup sticky header after table is regenerated
                    setTimeout(() => {
                        setupStickyHeader();
                    }, 100);
                }
            });
        });
    }

    function initializeInputListeners() {
        const inputs = document.querySelectorAll('.control-group input, .control-group select');
        inputs.forEach(input => {
            input.addEventListener('change', () => {
                if (input.id === 'startingBays' || input.id === 'maxBays' || 
                    input.id === 'startingEfficiency' || input.id === 'growthRate' ||
                    input.id === 'detailCommissionPercent') {
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
        
        // Initialize controls section toggle
        const toggleControlsBtn = document.getElementById('toggleControlsSection');
        const controlsSection = document.getElementById('controlsSection');
        if (toggleControlsBtn && controlsSection) {
            // Set initial button text based on collapsed state
            toggleControlsBtn.textContent = controlsSection.classList.contains('collapsed') 
                ? 'Show Configuration' 
                : 'Hide Configuration';
                
            toggleControlsBtn.addEventListener('click', () => {
                controlsSection.classList.toggle('collapsed');
                toggleControlsBtn.textContent = controlsSection.classList.contains('collapsed') 
                    ? 'Show Configuration' 
                    : 'Hide Configuration';
            });
        }
        
        initializeCollapsibleSections();
        initializeInputListeners();
        initializeFileInput();
        initializeYearTabs();
        
        updateInputsFromConfig();
        generateProjections();
        
        // Setup sticky header after table is generated
        setTimeout(() => {
            setupStickyHeader();
        }, 100);
    }
    
    // Store event listeners globally to clean them up
    let stickyHeaderListeners = {
        scroll: null,
        resize: null,
        tableScroll: null,
        tabClickHandlers: []
    };
    
    function cleanupStickyHeader() {
        // Remove existing event listeners
        if (stickyHeaderListeners.scroll) {
            window.removeEventListener('scroll', stickyHeaderListeners.scroll);
            stickyHeaderListeners.scroll = null;
        }
        if (stickyHeaderListeners.resize) {
            window.removeEventListener('resize', stickyHeaderListeners.resize);
            stickyHeaderListeners.resize = null;
        }
        if (stickyHeaderListeners.tableScroll) {
            const tableWrapper = document.querySelector('.table-wrapper');
            if (tableWrapper) {
                tableWrapper.removeEventListener('scroll', stickyHeaderListeners.tableScroll);
            }
            stickyHeaderListeners.tableScroll = null;
        }
        
        // Remove existing sticky header element
        const existingStickyHeader = document.querySelector('.sticky-header-container');
        if (existingStickyHeader) {
            existingStickyHeader.remove();
        }
    }
    
    function setupStickyHeader() {
        // Clean up any existing sticky header and listeners first
        cleanupStickyHeader();
        
        const tableWrapper = document.querySelector('.table-wrapper');
        const table = document.querySelector('table');
        const thead = document.querySelector('thead');
        
        if (!thead || !tableWrapper) return;
        
        let stickyHeader = null;
        
        // Create sticky header container
        function createStickyHeader() {
            if (stickyHeader) return stickyHeader;
            
            // Deep clone the thead with all its content
            const headerClone = thead.cloneNode(true);
            
            // Remove the sticky positioning from cloned headers to prevent conflicts
            const clonedThs = headerClone.querySelectorAll('th');
            clonedThs.forEach((th, index) => {
                if (index === 0) {
                    // First th (Category) needs sticky left positioning
                    th.style.position = 'sticky';
                    th.style.left = '0';
                    th.style.top = '0';
                    th.style.zIndex = '5000';
                    th.style.background = '#f8f9fa';
                } else {
                    th.style.position = 'sticky';
                    th.style.top = '0';
                }
            });
            
            stickyHeader = document.createElement('div');
            stickyHeader.className = 'sticky-header-container';
            
            const wrapperRect = tableWrapper.getBoundingClientRect();
            
            stickyHeader.style.cssText = `
                position: fixed;
                top: 0;
                left: ${wrapperRect.left}px;
                width: ${wrapperRect.width}px;
                z-index: 2000;
                background: #f8f9fa;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                display: none;
                overflow-x: visible;
                overflow-y: hidden;
            `;
            
            const innerWrapper = document.createElement('div');
            innerWrapper.style.cssText = `
                overflow-x: auto;
                overflow-y: hidden;
                width: 100%;
            `;
            
            const innerTable = document.createElement('table');
            innerTable.style.cssText = `
                width: ${table.offsetWidth}px;
                border-collapse: collapse;
                font-size: 0.95em;
            `;
            
            // Copy computed styles and column widths from original table
            const originalThs = thead.querySelectorAll('th');
            const originalTr = thead.querySelector('tr');
            
            // Set the height of the cloned header row to match original
            const clonedTr = headerClone.querySelector('tr');
            if (clonedTr && originalTr) {
                const originalHeight = originalTr.getBoundingClientRect().height;
                clonedTr.style.height = `${originalHeight}px`;
            }
            
            clonedThs.forEach((th, index) => {
                if (originalThs[index]) {
                    const originalRect = originalThs[index].getBoundingClientRect();
                    const originalStyles = window.getComputedStyle(originalThs[index]);
                    
                    th.style.width = `${originalRect.width}px`;
                    th.style.minWidth = `${originalRect.width}px`;
                    th.style.maxWidth = `${originalRect.width}px`;
                    th.style.height = `${originalRect.height}px`;
                    th.style.padding = originalStyles.padding;
                    th.style.textAlign = originalStyles.textAlign;
                    th.style.fontSize = originalStyles.fontSize;
                    th.style.lineHeight = originalStyles.lineHeight;
                    th.style.background = '#f8f9fa';
                    th.style.borderBottom = '2px solid #dee2e6';
                    th.style.fontWeight = '600';
                    th.style.color = '#495057';
                    th.style.boxSizing = 'border-box';
                    
                    // Special styling for first column
                    if (index === 0) {
                        th.style.position = 'sticky';
                        th.style.left = '0';
                        th.style.zIndex = '5000';
                        th.style.textAlign = 'left';
                    }
                }
            });
            
            innerTable.appendChild(headerClone);
            innerWrapper.appendChild(innerTable);
            stickyHeader.appendChild(innerWrapper);
            document.body.appendChild(stickyHeader);
            
            return stickyHeader;
        }
        
        // Update sticky header visibility and position  
        function updateStickyHeader() {
            const rect = tableWrapper.getBoundingClientRect();
            const theadRect = thead.getBoundingClientRect();
            
            if (rect.top < 0 && rect.bottom > theadRect.height) {
                // Show sticky header
                if (!stickyHeader) {
                    stickyHeader = createStickyHeader();
                }
                
                stickyHeader.style.display = 'block';
                
                // Update container position and width
                stickyHeader.style.left = `${rect.left}px`;
                stickyHeader.style.width = `${rect.width}px`;
                
                // Sync column widths to ensure alignment
                const originalThs = thead.querySelectorAll('th');
                const clonedThs = stickyHeader.querySelectorAll('th');
                originalThs.forEach((th, index) => {
                    if (clonedThs[index]) {
                        clonedThs[index].style.width = `${th.offsetWidth}px`;
                        clonedThs[index].style.minWidth = `${th.offsetWidth}px`;
                        clonedThs[index].style.maxWidth = `${th.offsetWidth}px`;
                    }
                });
                
                // Sync horizontal scroll
                const innerTable = stickyHeader.querySelector('table');
                innerTable.style.transform = `translateX(-${tableWrapper.scrollLeft}px)`;
                innerTable.style.width = `${table.offsetWidth}px`;
                
                // Counter-translate the category header to keep it fixed
                const firstTh = innerTable.querySelector('th:first-child');
                if (firstTh) {
                    firstTh.style.transform = `translateX(${tableWrapper.scrollLeft}px)`;
                    firstTh.style.position = 'relative';
                    firstTh.style.zIndex = '5001';
                    firstTh.style.background = '#f8f9fa';
                }
            } else {
                // Hide sticky header
                if (stickyHeader) {
                    stickyHeader.style.display = 'none';
                }
            }
        }
        
        // Store event listener functions for cleanup
        stickyHeaderListeners.scroll = updateStickyHeader;
        stickyHeaderListeners.resize = updateStickyHeader;
        stickyHeaderListeners.tableScroll = () => {
            if (stickyHeader && stickyHeader.style.display === 'block') {
                const innerTable = stickyHeader.querySelector('table');
                innerTable.style.transform = `translateX(-${tableWrapper.scrollLeft}px)`;
                
                // Counter-translate the category header to keep it fixed
                const firstTh = innerTable.querySelector('th:first-child');
                if (firstTh) {
                    firstTh.style.transform = `translateX(${tableWrapper.scrollLeft}px)`;
                }
            }
        };
        
        // Add event listeners
        window.addEventListener('scroll', stickyHeaderListeners.scroll);
        window.addEventListener('resize', stickyHeaderListeners.resize);
        tableWrapper.addEventListener('scroll', stickyHeaderListeners.tableScroll);
    }

    // Start the application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }

})();