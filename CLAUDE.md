# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an auto repair shop financial projection tool - a single-page web application that calculates P&L (Profit & Loss) projections for an auto repair business with dynamic bay scaling capabilities.

## Architecture

The application is a standalone HTML file (`auto-repair-pl-spreadsheet.html`) containing:
- Embedded CSS for styling including collapsible sections
- Comprehensive configuration object with 50+ business parameters
- JavaScript business logic for financial calculations
- Interactive UI controls organized in 7 collapsible sections for configuring all parameters
- Dynamic table generation for monthly P&L statements
- CSV export functionality
- Configuration save/load functionality (JSON format)

## Business Model Specifications

### Service Bay Revenue Model
- **21 working days per month**
- **Labor rate: $125/hour**
- **1.6 hours average per ticket**
- **Efficiency scaling:**
  - 100% efficiency = $20,000/month per bay
  - Starting at 40% efficiency first month
  - 20% monthly growth rate (configurable)
- **Bay scaling rules:**
  - Start with 2 bays (configurable)
  - Maximum of 6 bays (configurable limit)
  - Growth is applied first (e.g., 20% monthly growth)
  - When total demand exceeds current capacity (bays × 100%), overflow goes to new bay
  - Existing bays cap at 100% efficiency
  - New bay receives only the overflow demand (e.g., if growing from 100% to 120%, new bay gets 20%)
  - Add new tech ($45,000/year) with each new bay
  - Bay addition stops when max bays limit is reached

### Revenue Streams
1. **Service Labor**: Based on bay efficiency (see above)
2. **Parts Revenue**: 70% of service sales generate parts with 40% markup
3. **Detail Department**: $20,000/month at 100% efficiency
4. **Used Car Sales**: Starting at $15,000 (5 cars × $3,000 profit), 15% monthly growth
5. **Extended Warranties**: 1 first month, then 4/month @ $1,000 each
6. **Shop Charges**: 7% of labor, capped at $60 per work order
7. **Disposal Fees**: Oil ($150), General ($200), Battery ($825) monthly

### Expense Structure
1. **Labor Costs**:
   - 1 Senior Tech: $60,000/year
   - Additional Techs: $45,000/year each (scales with bays)
   - Service Advisor (Nick): $70,000/year
   - Manager (Josh): $100,000/year + $10,000 bonus

2. **Operating Expenses**:
   - Advertising: $1,500/month
   - ShopKey Software: $300/month
   - Payment Processing: 2.29% + $0.09 per transaction (PayPal Zettle)
   - Utilities: $1,200/month
   - Fuel Card: $400/month
   - Insurance: Surety bond ($20), General liability ($200)

3. **Inventory & Equipment**:
   - Tire inventory: $10,000 initial, $15,000/month rotating
   - Oil costs: $2,500/month per lift/bay
   - Detail supplies: $500/month
   - Shop supplies: $1,000/month
   - Tech laptops: $1,500 each (scales with techs)
   - Scan tool: $2,500 (one-time)
   - Waste disposal: $300 every 6 months (oil filters & coolant)

## Development Commands

Since this is a standalone HTML file, no build or compilation steps are required:

```bash
# Open the file directly in a browser
open auto-repair-pl-spreadsheet.html  # macOS
start auto-repair-pl-spreadsheet.html  # Windows
xdg-open auto-repair-pl-spreadsheet.html  # Linux

# Or serve locally for development
python -m http.server 8000  # Python 3
# Then navigate to http://localhost:8000/auto-repair-pl-spreadsheet.html
```

## Key Functions and Data Flow

1. **`calculateMonthlyData()`**: Core calculation engine using 50+ config variables for 12-month projections
2. **`generateProjections()`**: Reads all input values, updates config, and regenerates all displays
3. **`generateTable()`**: Creates the detailed P&L table
4. **`exportToCSV()`**: Generates downloadable CSV file
5. **`toggleSection()`**: Handles collapsible section UI interactions
6. **`resetToDefaults()`**: Resets all configuration to specification defaults
7. **`saveConfiguration()`**: Exports current config as JSON file
8. **`loadConfiguration()`**: Imports config from JSON file

## Critical Business Logic

### Bay Scaling Algorithm
- When average efficiency reaches 100% (configurable trigger), add a new bay
- Existing bays maintain their efficiency (stay at 100%)
- New bay starts at 50% efficiency (configurable)
- Each new bay requires hiring an additional technician
- Individual bays grow efficiency independently

### Revenue Calculations
- **Service Revenue**: `bays × ($20,000 × efficiency/100)`
- **Parts Cost**: `serviceRevenue × 0.7 / 1.4` (backing out cost from markup)
- **Parts Revenue**: `partsCost × (1 + markup/100)`
- **Work Orders**: `serviceRevenue / (hoursPerTicket × laborRate)`
- **Shop Charge**: `MIN(workOrders × 60, serviceRevenue × 0.07)`

### Operational Metrics
- **Target**: 5 cars per day per lift at 100% efficiency
- **Operating hours**: 8 hours per day
- **Monthly target**: 105 cars per bay at 100% efficiency (5 cars × 21 days)
- **Average ticket**: $200 ($125/hr × 1.6 hours)

## Important Notes

1. **Efficiency Growth**: Configurable monthly growth rate (default 15%) until reaching 100%
2. **Bay Addition**: Overflow demand triggers new bay addition, NOT a reset of existing bay efficiency
3. **Tech Scaling**: Automatically adds $45,000/year technician with each new bay
4. **Payment Processing**: Calculate based on actual transaction count and total revenue
5. **Consistent Growth**: Used car sales grow at a steady 15% monthly rate
6. **Manager Bonus**: $10,000 bonus included in December (month 12)