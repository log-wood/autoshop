# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is a standalone HTML/CSS/JavaScript application for Auto Repair Shop P&L Projections. It's a single-page financial forecasting tool that calculates 3-year projections with dynamic bay scaling.

### Key Components

- **index.html**: Main HTML structure with collapsible configuration sections and data display
- **js/bundle.js**: All JavaScript bundled into one file for direct file:// access (no module system)
- **css/styles.css**: Complete styling including responsive design and visual states
- **authshop updates.txt**: Business requirements and specifications document

### Application Structure

The JavaScript is organized into logical modules within a single IIFE:
- **Config Module**: Handles all configuration parameters and validation
- **Calculations Module**: Complex financial calculations with bay scaling logic
- **Data Export Module**: CSV export and configuration save/load
- **UI Components Module**: Dynamic table generation and metrics display
- **Formulas Module**: Advanced calculation formulas and previews

### Core Business Logic

The application models an auto repair shop with:
- **Dynamic Bay Scaling**: Starts with 2 bays, adds bays when efficiency overflow occurs
- **Efficiency Growth**: Multiple growth formulas (linear, exponential, S-curve)
- **Revenue Streams**: Service labor, parts, detail department, used car sales, warranties, disposal fees
- **Complex Cost Structure**: Labor scaling with bay additions, tiered tech salaries, operating expenses
- **3-Year Projections**: Monthly calculations for 36 months with yearly summaries

## Development Commands

This is a static application - no build process required. Open `index.html` directly in a browser or serve from a local web server.

### Testing
No automated tests. Manual testing involves:
- Load page and verify calculations generate correctly
- Test all configuration sections expand/collapse
- Verify CSV export functionality
- Test configuration save/load
- Check year tab switching
- Validate input validation and error handling

### Configuration Management
- Configuration is stored in JavaScript object with extensive default values
- Save/Load functionality exports/imports JSON configuration files
- All inputs have validation with user-friendly error messages

## Key Features

### Bay Scaling Algorithm
The core differentiator is the intelligent bay scaling:
- When total demand exceeds 100% per existing bay, a new bay is added
- Existing bays maintain their efficiency (don't reset)
- New bay gets the overflow demand
- Each new bay adds a technician to payroll

### Financial Calculations
- Service revenue based on bay efficiency and capacity
- Parts revenue as percentage of service revenue  
- Complex labor cost calculations with senior/junior tech ratios
- Payment processing fees calculated per transaction
- Equipment costs scale with bay additions

### Export Capabilities
- Full CSV export of all 36 months of data
- Configuration export/import as JSON
- Multiple viewing modes (monthly by year, 3-year summary)