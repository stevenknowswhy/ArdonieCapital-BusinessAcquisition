/**
 * Financial Charts Module for Ardonie Capital
 * Reusable Plotly.js chart components for financial projections
 */

// Financial data from projections - Updated with realistic Express Badge pricing
const FINANCIAL_DATA = {
    dfwPilot: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        newSellers: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        newBuyers: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        dealsClosedMonthly: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 2], // Total: 20 deals
        transactionRevenue: [0, 0, 15000, 15000, 15000, 30000, 30000, 30000, 45000, 45000, 45000, 30000],
        // Updated badge revenue: 50% opt-in rate, Founding Member pricing: $997.50 seller, $747.50 buyer (50% discount)
        badgeRevenue: [8737, 8737, 8737, 8737, 8737, 8737, 8737, 8737, 8737, 8737, 8737, 8737], // Monthly badge fees
        fixedCosts: [1619, 1619, 1619, 1619, 1619, 1619, 1619, 1619, 1619, 1619, 1619, 1619],
        // Updated vendor costs: $650 per seller badge, $375 per buyer badge (50% opt-in)
        vendorCosts: [2437, 2437, 2437, 2437, 2437, 2437, 2437, 2437, 2437, 2437, 2437, 2437]
    },
    lasfExpansion: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        newSellers: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        newBuyers: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
        dealsClosedMonthly: [0, 1, 2, 3, 3, 4, 4, 4, 5, 5, 5, 4], // Total: 40 deals
        transactionRevenue: [0, 25000, 50000, 75000, 75000, 100000, 100000, 100000, 125000, 125000, 125000, 100000],
        // Full pricing: $1995 seller, $1495 buyer (50% opt-in)
        badgeRevenue: [17450, 17450, 17450, 17450, 17450, 17450, 17450, 17450, 17450, 17450, 17450, 17450],
        fixedCosts: [2119, 2119, 2119, 2119, 2119, 2119, 2119, 2119, 2119, 2119, 2119, 2119],
        // Full vendor costs: $1000 per seller badge, $500 per buyer badge (50% opt-in)
        vendorCosts: [7500, 7500, 7500, 7500, 7500, 7500, 7500, 7500, 7500, 7500, 7500, 7500]
    }
};

// Chart configuration defaults
const CHART_CONFIG = {
    responsive: true,
    displayModeBar: false,
    toImageButtonOptions: {
        format: 'png',
        filename: 'financial_chart',
        height: 500,
        width: 800,
        scale: 1
    }
};

// Common layout settings
function getBaseLayout(title = '') {
    const isDark = document.documentElement.classList.contains('dark');
    return {
        title: {
            text: title,
            font: {
                family: 'Inter, sans-serif',
                size: 16,
                color: isDark ? '#e2e8f0' : '#1e293b'
            }
        },
        autosize: true,
        margin: { t: 50, b: 60, l: 80, r: 40 },
        paper_bgcolor: 'rgba(0,0,0,0)',
        plot_bgcolor: 'rgba(0,0,0,0)',
        font: {
            family: 'Inter, sans-serif',
            color: isDark ? '#e2e8f0' : '#64748b'
        },
        legend: {
            orientation: 'h',
            y: -0.2,
            bgcolor: 'rgba(0,0,0,0)'
        },
        xaxis: {
            gridcolor: isDark ? '#374151' : '#e2e8f0',
            zerolinecolor: isDark ? '#4b5563' : '#cbd5e1'
        },
        yaxis: {
            gridcolor: isDark ? '#374151' : '#e2e8f0',
            zerolinecolor: isDark ? '#4b5563' : '#cbd5e1'
        }
    };
}

// Color schemes
const COLORS = {
    primary: '#3b82f6',
    accent: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    success: '#22c55e',
    purple: '#8b5cf6',
    orange: '#f97316'
};

/**
 * Create Revenue Growth Comparison Chart
 */
function createRevenueGrowthChart(containerId) {
    const dfwData = FINANCIAL_DATA.dfwPilot;
    const lasfData = FINANCIAL_DATA.lasfExpansion;

    // Calculate cumulative revenue
    const dfwCumulative = dfwData.transactionRevenue.map((val, idx) =>
        dfwData.transactionRevenue.slice(0, idx + 1).reduce((sum, curr) => sum + curr, 0) +
        dfwData.badgeRevenue.slice(0, idx + 1).reduce((sum, curr) => sum + curr, 0)
    );

    const lasfCumulative = lasfData.transactionRevenue.map((val, idx) =>
        lasfData.transactionRevenue.slice(0, idx + 1).reduce((sum, curr) => sum + curr, 0) +
        lasfData.badgeRevenue.slice(0, idx + 1).reduce((sum, curr) => sum + curr, 0)
    );

    const data = [
        {
            type: 'scatter',
            mode: 'lines+markers',
            x: dfwData.months,
            y: dfwCumulative,
            name: 'DFW Pilot (Year 1)',
            line: { color: COLORS.primary, width: 3 },
            marker: { size: 8, color: COLORS.primary },
            hovertemplate: '<b>%{x}</b><br>Revenue: $%{y:,.0f}<extra></extra>'
        },
        {
            type: 'scatter',
            mode: 'lines+markers',
            x: lasfData.months,
            y: lasfCumulative,
            name: 'LA/SF Expansion (Year 1)',
            line: { color: COLORS.accent, width: 3 },
            marker: { size: 8, color: COLORS.accent },
            hovertemplate: '<b>%{x}</b><br>Revenue: $%{y:,.0f}<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout('Cumulative Revenue Growth Comparison'),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'Cumulative Revenue ($)',
            tickformat: '$,.0f'
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Month'
        }
    };

    Plotly.newPlot(containerId, data, layout, CHART_CONFIG);
}

/**
 * Create Monthly Cash Flow Chart
 */
function createCashFlowChart(containerId, market = 'dfw') {
    const data = market === 'dfw' ? FINANCIAL_DATA.dfwPilot : FINANCIAL_DATA.lasfExpansion;

    // Calculate monthly cash flow
    const monthlyCashFlow = data.months.map((month, idx) => {
        const revenue = data.transactionRevenue[idx] + data.badgeRevenue[idx];
        const costs = data.fixedCosts[idx] + data.vendorCosts[idx];
        return revenue - costs;
    });

    // Calculate cumulative cash flow
    const cumulativeCashFlow = monthlyCashFlow.map((val, idx) =>
        monthlyCashFlow.slice(0, idx + 1).reduce((sum, curr) => sum + curr, 0)
    );

    const chartData = [
        {
            type: 'bar',
            x: data.months,
            y: monthlyCashFlow,
            name: 'Monthly Cash Flow',
            marker: {
                color: monthlyCashFlow.map(val => val >= 0 ? COLORS.success : COLORS.danger)
            },
            hovertemplate: '<b>%{x}</b><br>Cash Flow: $%{y:,.0f}<extra></extra>'
        },
        {
            type: 'scatter',
            mode: 'lines+markers',
            x: data.months,
            y: cumulativeCashFlow,
            name: 'Cumulative Cash Flow',
            yaxis: 'y2',
            line: { color: COLORS.purple, width: 3 },
            marker: { size: 8, color: COLORS.purple },
            hovertemplate: '<b>%{x}</b><br>Cumulative: $%{y:,.0f}<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout(`${market.toUpperCase()} Monthly Cash Flow Analysis`),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'Monthly Cash Flow ($)',
            tickformat: '$,.0f'
        },
        yaxis2: {
            title: 'Cumulative Cash Flow ($)',
            overlaying: 'y',
            side: 'right',
            tickformat: '$,.0f',
            gridcolor: 'rgba(0,0,0,0)'
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Month'
        }
    };

    Plotly.newPlot(containerId, chartData, layout, CHART_CONFIG);
}

/**
 * Create Deal Volume Comparison Chart
 */
function createDealVolumeChart(containerId) {
    const dfwData = FINANCIAL_DATA.dfwPilot;
    const lasfData = FINANCIAL_DATA.lasfExpansion;

    const data = [
        {
            type: 'bar',
            x: dfwData.months,
            y: dfwData.dealsClosedMonthly,
            name: 'DFW Pilot',
            marker: { color: COLORS.primary },
            hovertemplate: '<b>%{x}</b><br>Deals: %{y}<extra></extra>'
        },
        {
            type: 'bar',
            x: lasfData.months,
            y: lasfData.dealsClosedMonthly,
            name: 'LA/SF Expansion',
            marker: { color: COLORS.accent },
            hovertemplate: '<b>%{x}</b><br>Deals: %{y}<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout('Monthly Deal Volume Comparison'),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'Deals Closed',
            dtick: 1
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Month'
        },
        barmode: 'group'
    };

    Plotly.newPlot(containerId, data, layout, CHART_CONFIG);
}

/**
 * Create Revenue Breakdown Pie Chart
 */
function createRevenueBreakdownChart(containerId, market = 'dfw') {
    const data = market === 'dfw' ? FINANCIAL_DATA.dfwPilot : FINANCIAL_DATA.lasfExpansion;

    const totalTransactionRevenue = data.transactionRevenue.reduce((sum, val) => sum + val, 0);
    const totalBadgeRevenue = data.badgeRevenue.reduce((sum, val) => sum + val, 0);

    const chartData = [{
        type: 'pie',
        labels: ['Transaction Fees (5%)', 'Express Badge Fees'],
        values: [totalTransactionRevenue, totalBadgeRevenue],
        marker: {
            colors: [COLORS.primary, COLORS.accent]
        },
        textinfo: 'label+percent+value',
        texttemplate: '%{label}<br>%{percent}<br>$%{value:,.0f}',
        hovertemplate: '<b>%{label}</b><br>Revenue: $%{value:,.0f}<br>Percentage: %{percent}<extra></extra>'
    }];

    const layout = {
        ...getBaseLayout(`${market.toUpperCase()} Revenue Breakdown`),
        showlegend: false
    };

    Plotly.newPlot(containerId, chartData, layout, CHART_CONFIG);
}

/**
 * Create Cost Structure Chart
 */
function createCostStructureChart(containerId, market = 'dfw') {
    const data = market === 'dfw' ? FINANCIAL_DATA.dfwPilot : FINANCIAL_DATA.lasfExpansion;

    const totalFixedCosts = data.fixedCosts.reduce((sum, val) => sum + val, 0);
    const totalVendorCosts = data.vendorCosts.reduce((sum, val) => sum + val, 0);

    const chartData = [{
        type: 'pie',
        labels: ['Fixed Costs', 'Vendor Costs'],
        values: [totalFixedCosts, totalVendorCosts],
        marker: {
            colors: [COLORS.warning, COLORS.danger]
        },
        textinfo: 'label+percent+value',
        texttemplate: '%{label}<br>%{percent}<br>$%{value:,.0f}',
        hovertemplate: '<b>%{label}</b><br>Cost: $%{value:,.0f}<br>Percentage: %{percent}<extra></extra>'
    }];

    const layout = {
        ...getBaseLayout(`${market.toUpperCase()} Cost Structure`),
        showlegend: false
    };

    Plotly.newPlot(containerId, chartData, layout, CHART_CONFIG);
}

/**
 * Create Market Size Comparison Chart
 */
function createMarketSizeChart(containerId) {
    const marketData = [
        {
            market: 'DFW Auto Repair',
            totalShops: 2500,
            marketValue: 2.1,
            avgDealSize: 300,
            annualTransactions: 375
        },
        {
            market: 'LA/SF Healthcare',
            totalShops: 5500,
            marketValue: 4.2,
            avgDealSize: 500,
            annualTransactions: 550
        }
    ];

    const data = [
        {
            type: 'bar',
            x: marketData.map(m => m.market),
            y: marketData.map(m => m.marketValue),
            name: 'Market Value ($B)',
            marker: { color: COLORS.primary },
            hovertemplate: '<b>%{x}</b><br>Market Value: $%{y}B<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout('Market Size Comparison'),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'Market Value (Billions $)',
            tickformat: '$,.1f'
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Market'
        }
    };

    Plotly.newPlot(containerId, data, layout, CHART_CONFIG);
}

/**
 * Create ROI Timeline Chart
 */
function createROIChart(containerId) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const investment = 10000; // Initial $10K investment

    // Calculate cumulative profit for both markets
    const dfwProfit = FINANCIAL_DATA.dfwPilot.months.map((month, idx) => {
        const revenue = FINANCIAL_DATA.dfwPilot.transactionRevenue[idx] + FINANCIAL_DATA.dfwPilot.badgeRevenue[idx];
        const costs = FINANCIAL_DATA.dfwPilot.fixedCosts[idx] + FINANCIAL_DATA.dfwPilot.vendorCosts[idx];
        return revenue - costs;
    });

    const cumulativeProfit = dfwProfit.map((val, idx) =>
        dfwProfit.slice(0, idx + 1).reduce((sum, curr) => sum + curr, 0) - investment
    );

    const roi = cumulativeProfit.map(profit => (profit / investment) * 100);

    const data = [
        {
            type: 'scatter',
            mode: 'lines+markers',
            x: months,
            y: roi,
            name: 'ROI %',
            line: { color: COLORS.success, width: 3 },
            marker: { size: 8, color: COLORS.success },
            hovertemplate: '<b>%{x}</b><br>ROI: %{y:.1f}%<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout('Return on Investment Timeline'),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'ROI (%)',
            tickformat: '.1f',
            zeroline: true,
            zerolinecolor: '#ef4444',
            zerolinewidth: 2
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Month'
        },
        shapes: [{
            type: 'line',
            x0: 0,
            x1: 1,
            xref: 'paper',
            y0: 0,
            y1: 0,
            line: {
                color: '#ef4444',
                width: 2,
                dash: 'dash'
            }
        }]
    };

    Plotly.newPlot(containerId, data, layout, CHART_CONFIG);
}

/**
 * Create Loan Volume Projection Line Chart
 */
function createLoanVolumeLineChart(containerId) {
    const years = ['Year 1', 'Year 2', 'Year 3'];
    const loanVolumes = [15, 35, 60]; // in millions
    const dealCounts = [50, 117, 200]; // estimated deals per year

    const data = [
        {
            type: 'scatter',
            mode: 'lines+markers',
            x: years,
            y: loanVolumes,
            name: 'Loan Volume ($M)',
            line: { color: COLORS.primary, width: 4 },
            marker: {
                size: 12,
                color: COLORS.primary,
                line: { color: '#ffffff', width: 2 }
            },
            fill: 'tozeroy',
            fillcolor: 'rgba(59, 130, 246, 0.1)',
            hovertemplate: '<b>%{x}</b><br>Loan Volume: $%{y}M<extra></extra>'
        },
        {
            type: 'scatter',
            mode: 'lines+markers',
            x: years,
            y: dealCounts,
            name: 'Deal Count',
            yaxis: 'y2',
            line: { color: COLORS.accent, width: 3 },
            marker: {
                size: 10,
                color: COLORS.accent,
                line: { color: '#ffffff', width: 2 }
            },
            hovertemplate: '<b>%{x}</b><br>Deals: %{y}<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout('Projected Loan Volume Growth'),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'Loan Volume (Millions $)',
            tickformat: '$,.0f'
        },
        yaxis2: {
            title: 'Number of Deals',
            overlaying: 'y',
            side: 'right',
            gridcolor: 'rgba(0,0,0,0)'
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Timeline'
        }
    };

    Plotly.newPlot(containerId, data, layout, CHART_CONFIG);
}

/**
 * Create Vendor Revenue Opportunity Charts for Partner Pages
 */

// Vendor-specific data
const VENDOR_DATA = {
    financial: {
        years: ['Year 1', 'Year 2', 'Year 3'],
        loanVolume: [15, 35, 60], // millions
        dealCount: [50, 117, 200],
        originationFees: [450, 1050, 1800], // thousands
        interestIncome: [1050, 2450, 4200] // thousands (5-year projection)
    },
    accounting: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dfwBadges: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5], // monthly seller badges
        lasfBadges: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], // monthly seller badges
        revenuePerBadge: [650, 1000], // DFW vs LA/SF
        totalRevenue: [19500, 60000] // annual revenue DFW vs LA/SF
    },
    legal: {
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        dfwSellerBadges: [2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5, 2.5],
        dfwBuyerBadges: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        lasfSellerBadges: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5],
        lasfBuyerBadges: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        sellerRevenue: [400, 500], // DFW vs LA/SF
        buyerRevenue: [200, 300] // DFW vs LA/SF
    }
};

/**
 * Create Financial Institution Loan Volume Chart
 */
function createFinancialPartnerChart(containerId) {
    const data = VENDOR_DATA.financial;

    const chartData = [
        {
            type: 'scatter',
            mode: 'lines+markers',
            x: data.years,
            y: data.loanVolume,
            name: 'Loan Volume ($M)',
            line: { color: COLORS.primary, width: 4 },
            marker: {
                size: 12,
                color: COLORS.primary,
                line: { color: '#ffffff', width: 2 }
            },
            fill: 'tozeroy',
            fillcolor: 'rgba(59, 130, 246, 0.1)',
            hovertemplate: '<b>%{x}</b><br>Loan Volume: $%{y}M<extra></extra>'
        },
        {
            type: 'scatter',
            mode: 'lines+markers',
            x: data.years,
            y: data.originationFees,
            name: 'Origination Fees ($K)',
            yaxis: 'y2',
            line: { color: COLORS.accent, width: 3 },
            marker: {
                size: 10,
                color: COLORS.accent,
                line: { color: '#ffffff', width: 2 }
            },
            hovertemplate: '<b>%{x}</b><br>Origination Fees: $%{y}K<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout('Financial Partner Revenue Opportunity'),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'Loan Volume (Millions $)',
            tickformat: '$,.0f'
        },
        yaxis2: {
            title: 'Origination Fees (Thousands $)',
            overlaying: 'y',
            side: 'right',
            tickformat: '$,.0f',
            gridcolor: 'rgba(0,0,0,0)'
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Timeline'
        }
    };

    Plotly.newPlot(containerId, chartData, layout, CHART_CONFIG);
}

/**
 * Create CPA Partner Badge Volume Chart
 */
function createAccountingPartnerChart(containerId) {
    const data = VENDOR_DATA.accounting;

    const chartData = [
        {
            type: 'bar',
            x: data.months,
            y: data.dfwBadges,
            name: 'DFW Pilot Badges',
            marker: { color: COLORS.primary },
            hovertemplate: '<b>%{x}</b><br>Badges: %{y}<br>Revenue: $' + (data.revenuePerBadge[0] * 2.5).toLocaleString() + '<extra></extra>'
        },
        {
            type: 'bar',
            x: data.months,
            y: data.lasfBadges,
            name: 'LA/SF Expansion Badges',
            marker: { color: COLORS.accent },
            hovertemplate: '<b>%{x}</b><br>Badges: %{y}<br>Revenue: $' + (data.revenuePerBadge[1] * 5).toLocaleString() + '<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout('CPA Partner Monthly Badge Volume'),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'Express Seller Badges',
            dtick: 1
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Month'
        },
        barmode: 'group'
    };

    Plotly.newPlot(containerId, chartData, layout, CHART_CONFIG);
}

/**
 * Create Legal Partner Combined Badge Chart
 */
function createLegalPartnerChart(containerId) {
    const data = VENDOR_DATA.legal;

    // Calculate total monthly badges for each market
    const dfwTotal = data.dfwSellerBadges.map((seller, idx) => seller + data.dfwBuyerBadges[idx]);
    const lasfTotal = data.lasfSellerBadges.map((seller, idx) => seller + data.lasfBuyerBadges[idx]);

    const chartData = [
        {
            type: 'bar',
            x: data.months,
            y: dfwTotal,
            name: 'DFW Total Badges',
            marker: { color: COLORS.primary },
            hovertemplate: '<b>%{x}</b><br>Total Badges: %{y}<br>Est. Revenue: $' + ((data.sellerRevenue[0] * 2.5) + (data.buyerRevenue[0] * 5)).toLocaleString() + '<extra></extra>'
        },
        {
            type: 'bar',
            x: data.months,
            y: lasfTotal,
            name: 'LA/SF Total Badges',
            marker: { color: COLORS.accent },
            hovertemplate: '<b>%{x}</b><br>Total Badges: %{y}<br>Est. Revenue: $' + ((data.sellerRevenue[1] * 5) + (data.buyerRevenue[1] * 10)).toLocaleString() + '<extra></extra>'
        }
    ];

    const layout = {
        ...getBaseLayout('Legal Partner Monthly Badge Volume (Seller + Buyer)'),
        yaxis: {
            ...getBaseLayout().yaxis,
            title: 'Total Express Badges',
            dtick: 2
        },
        xaxis: {
            ...getBaseLayout().xaxis,
            title: 'Month'
        },
        barmode: 'group'
    };

    Plotly.newPlot(containerId, chartData, layout, CHART_CONFIG);
}

/**
 * Create Revenue Sharing Breakdown Chart
 */
function createRevenueShareChart(containerId, partnerType = 'financial') {
    let data, title;

    if (partnerType === 'financial') {
        data = [
            {
                type: 'pie',
                labels: ['Origination Fees', '5-Year Interest Income', 'Cross-Selling Opportunities'],
                values: [1800, 4200, 800], // Year 3 projections in thousands
                marker: {
                    colors: [COLORS.primary, COLORS.accent, COLORS.warning]
                },
                textinfo: 'label+percent+value',
                texttemplate: '%{label}<br>%{percent}<br>$%{value}K',
                hovertemplate: '<b>%{label}</b><br>Revenue: $%{value}K<br>Percentage: %{percent}<extra></extra>'
            }
        ];
        title = 'Financial Partner Revenue Breakdown (Year 3)';
    } else if (partnerType === 'accounting') {
        data = [
            {
                type: 'pie',
                labels: ['DFW Pilot Revenue', 'LA/SF Expansion Revenue'],
                values: [19.5, 60], // Annual revenue in thousands
                marker: {
                    colors: [COLORS.primary, COLORS.accent]
                },
                textinfo: 'label+percent+value',
                texttemplate: '%{label}<br>%{percent}<br>$%{value}K',
                hovertemplate: '<b>%{label}</b><br>Revenue: $%{value}K<br>Percentage: %{percent}<extra></extra>'
            }
        ];
        title = 'CPA Partner Revenue Breakdown (Annual)';
    } else {
        data = [
            {
                type: 'pie',
                labels: ['Seller Badge Revenue', 'Buyer Badge Revenue'],
                values: [27, 18], // Annual revenue in thousands (combined markets)
                marker: {
                    colors: [COLORS.primary, COLORS.accent]
                },
                textinfo: 'label+percent+value',
                texttemplate: '%{label}<br>%{percent}<br>$%{value}K',
                hovertemplate: '<b>%{label}</b><br>Revenue: $%{value}K<br>Percentage: %{percent}<extra></extra>'
            }
        ];
        title = 'Legal Partner Revenue Breakdown (Annual)';
    }

    const layout = {
        ...getBaseLayout(title),
        showlegend: false
    };

    Plotly.newPlot(containerId, data, layout, CHART_CONFIG);
}

// Export functions for use in other files
window.FinancialCharts = {
    createRevenueGrowthChart,
    createCashFlowChart,
    createDealVolumeChart,
    createRevenueBreakdownChart,
    createCostStructureChart,
    createMarketSizeChart,
    createROIChart,
    createLoanVolumeLineChart,
    createFinancialPartnerChart,
    createAccountingPartnerChart,
    createLegalPartnerChart,
    createRevenueShareChart,
    FINANCIAL_DATA,
    VENDOR_DATA,
    COLORS
};
