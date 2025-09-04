// Data Export Module - CSV export and configuration save/load functionality

// Format currency values
export function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
}

// Export data to CSV
export function exportToCSV(data) {
    const config = data[0]?.config || {};
    let csv = 'Month,Bays,Efficiency,Tech Count,Service Revenue,Parts Revenue,Shop Charge,';
    csv += 'Warranty Revenue,Oil Disposal,Disposal Fees,Battery Disposal,Used Car Sales,';
    csv += 'Detail Revenue,Total Revenue,Parts Cost,Tech Salaries,Advisor Salary,';
    csv += 'Manager Salary,Advertising,Shop Key,AAA Signup,Fuel Card,Utilities,';
    csv += 'Scan Tool,Waste Oil Filters,Coolant Disposal,Tire Inventory,Oil Costs,';
    csv += 'Detail Supplies,Shop Supplies,Surety Bond,Liability,Payment Processing,';
    csv += 'Laptops,Desktops,Total Expenses,Net Income\n';
    
    data.forEach(m => {
        const totalRevenue = m.serviceRevenue + m.partsRevenue + m.shopCharge + 
                           m.warrantyRevenue + m.oilDisposal + m.disposalFees + 
                           m.batteryDisposal + m.usedCarSales + m.detailRevenue;
        
        const totalExpenses = m.partsCost + m.techSalaries + m.advisorSalary + 
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
        csv += `${totalRevenue.toFixed(0)},${m.partsCost.toFixed(0)},`;
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
    
    // Add summary row
    let totalServiceRevenue = 0, totalPartsRevenue = 0, totalShopCharge = 0;
    let totalWarrantyRevenue = 0, totalOilDisposal = 0, totalDisposalFees = 0;
    let totalBatteryDisposal = 0, totalUsedCarSales = 0, totalDetailRevenue = 0;
    let totalPartsCost = 0, totalTechSalaries = 0, totalAdvisorSalary = 0;
    let totalManagerSalary = 0, totalAdvertising = 0, totalShopKey = 0;
    let totalAAASignup = 0, totalFuelCard = 0, totalUtilities = 0;
    let totalScanTool = 0, totalWasteOilFilters = 0, totalCoolantDisposal = 0;
    let totalTireInventory = 0, totalOilCosts = 0, totalDetailSupplies = 0;
    let totalShopSupplies = 0, totalSuretyBond = 0, totalLiability = 0;
    let totalPaymentProcessing = 0, totalLaptops = 0, totalDesktops = 0;
    
    data.forEach(m => {
        totalServiceRevenue += m.serviceRevenue;
        totalPartsRevenue += m.partsRevenue;
        totalShopCharge += m.shopCharge;
        totalWarrantyRevenue += m.warrantyRevenue;
        totalOilDisposal += m.oilDisposal;
        totalDisposalFees += m.disposalFees;
        totalBatteryDisposal += m.batteryDisposal;
        totalUsedCarSales += m.usedCarSales;
        totalDetailRevenue += m.detailRevenue;
        totalPartsCost += m.partsCost;
        totalTechSalaries += m.techSalaries;
        totalAdvisorSalary += m.advisorSalary;
        totalManagerSalary += m.managerSalary;
        totalAdvertising += m.advertising;
        totalShopKey += m.shopKey;
        totalAAASignup += m.aaaSignup;
        totalFuelCard += m.fuelCard;
        totalUtilities += m.utilities;
        totalScanTool += m.scanTool;
        totalWasteOilFilters += m.wasteOilFilters;
        totalCoolantDisposal += m.coolantDisposal;
        totalTireInventory += m.tireInventory;
        totalOilCosts += m.oilCosts;
        totalDetailSupplies += m.detailSupplies;
        totalShopSupplies += m.shopSupplies;
        totalSuretyBond += m.suretyBond;
        totalLiability += m.liability;
        totalPaymentProcessing += m.paymentProcessing;
        totalLaptops += m.laptops;
        totalDesktops += m.desktops;
    });
    
    const grandTotalRevenue = totalServiceRevenue + totalPartsRevenue + totalShopCharge +
                            totalWarrantyRevenue + totalOilDisposal + totalDisposalFees +
                            totalBatteryDisposal + totalUsedCarSales + totalDetailRevenue;
    
    const grandTotalExpenses = totalPartsCost + totalTechSalaries + totalAdvisorSalary +
                             totalManagerSalary + totalAdvertising + totalShopKey +
                             totalAAASignup + totalFuelCard + totalUtilities +
                             totalScanTool + totalWasteOilFilters + totalCoolantDisposal +
                             totalTireInventory + totalOilCosts + totalDetailSupplies +
                             totalShopSupplies + totalSuretyBond + totalLiability +
                             totalPaymentProcessing + totalLaptops + totalDesktops;
    
    const grandNetIncome = grandTotalRevenue - grandTotalExpenses;
    
    csv += `Total,,,${totalServiceRevenue.toFixed(0)},${totalPartsRevenue.toFixed(0)},`;
    csv += `${totalShopCharge.toFixed(0)},${totalWarrantyRevenue.toFixed(0)},`;
    csv += `${totalOilDisposal.toFixed(0)},${totalDisposalFees.toFixed(0)},`;
    csv += `${totalBatteryDisposal.toFixed(0)},${totalUsedCarSales.toFixed(0)},`;
    csv += `${totalDetailRevenue.toFixed(0)},${grandTotalRevenue.toFixed(0)},`;
    csv += `${totalPartsCost.toFixed(0)},${totalTechSalaries.toFixed(0)},`;
    csv += `${totalAdvisorSalary.toFixed(0)},${totalManagerSalary.toFixed(0)},`;
    csv += `${totalAdvertising.toFixed(0)},${totalShopKey.toFixed(0)},`;
    csv += `${totalAAASignup.toFixed(0)},${totalFuelCard.toFixed(0)},`;
    csv += `${totalUtilities.toFixed(0)},${totalScanTool.toFixed(0)},`;
    csv += `${totalWasteOilFilters.toFixed(0)},${totalCoolantDisposal.toFixed(0)},`;
    csv += `${totalTireInventory.toFixed(0)},${totalOilCosts.toFixed(0)},`;
    csv += `${totalDetailSupplies.toFixed(0)},${totalShopSupplies.toFixed(0)},`;
    csv += `${totalSuretyBond.toFixed(0)},${totalLiability.toFixed(0)},`;
    csv += `${totalPaymentProcessing.toFixed(0)},${totalLaptops.toFixed(0)},`;
    csv += `${totalDesktops.toFixed(0)},${grandTotalExpenses.toFixed(0)},`;
    csv += `${grandNetIncome.toFixed(0)}`;
    
    // Download the CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auto-repair-pl-projection.csv';
    a.click();
}

// Save configuration to JSON file
export function saveConfiguration(config) {
    const json = JSON.stringify(config, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'auto-repair-config.json';
    a.click();
}

// Load configuration from JSON file
export function loadConfiguration(file) {
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