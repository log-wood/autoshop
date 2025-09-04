// UI Components Module - Generate and update UI elements

import { getConfig } from './config.js';
import { formatCurrency } from './data-export.js';

// Update metrics display
export function updateMetrics(data) {
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

// Update bay information display
export function updateBayInfo(data) {
    const bayInfo = document.getElementById('bayInfo');
    const config = getConfig();
    let bayChanges = [];
    
    for (let i = 1; i < data.length; i++) {
        if (data[i].bays > data[i-1].bays) {
            const prevAvgEfficiency = data[i-1].efficiency.toFixed(1);
            const newBayEfficiency = ((data[i].efficiency * data[i].bays) - (100 * (data[i].bays - 1))).toFixed(1);
            bayChanges.push(`Month ${i + 1}: Added Bay #${data[i].bays} (Overflow demand: ${newBayEfficiency}% goes to new bay)`);
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

// Generate P&L table
export function generateTable(data) {
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
        { key: 'partsRevenue', label: 'Parts Revenue (40% markup)' },
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
        { key: 'partsCost', label: 'Parts Cost (70% of service)' },
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
        { key: 'techSalaries', label: 'Technician Salaries' },
        { key: 'advisorSalary', label: 'Service Advisor (Nick)' },
        { key: 'managerSalary', label: 'Manager (Josh) + Bonus' }
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
        const monthExpenses = m.partsCost + m.tireInventory + m.oilCosts + m.techSalaries + m.advisorSalary + 
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
        const monthExpenses = m.partsCost + m.tireInventory + m.oilCosts + m.techSalaries + m.advisorSalary + 
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

// Update summary cards
export function updateSummaryCards(revenue, expenses, netIncome) {
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