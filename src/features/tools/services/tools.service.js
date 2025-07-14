
// GDPR Compliance utilities
const GDPRCompliance = {
    requestConsent: (purpose) => {
        return new Promise((resolve) => {
            // Implementation for consent request
            const consent = confirm(`Do you consent to data processing for ${purpose}?`);
            resolve(consent);
        });
    },
    
    deleteUserData: (userId) => {
        // Implementation for right to erasure
        console.log(`Deleting data for user ${userId}`);
    },
    
    exportUserData: (userId) => {
        // Implementation for data portability
        console.log(`Exporting data for user ${userId}`);
    }
};

/**
 * Tools Service
 * Handles business valuation calculations, due diligence tools, and analysis
 */

export class ToolsService {
    constructor() {
        this.cache = new Map();
        this.industryData = null;
        this.isInitialized = false;
        this.baseUrl = '/api/tools';
    }

    /**
     * Initialize the tools service
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            console.log('Initializing Tools Service...');
            await this.loadIndustryData();
            this.isInitialized = true;
            console.log('✅ Tools Service initialized successfully');
        } catch (error) {
            console.error('❌ Tools Service initialization failed:', error);
            throw error;
        }
    }

    /**
     * Load industry benchmark data
     */
    async loadIndustryData() {
        try {
            const response = await fetch(`${this.baseUrl}/industry-data`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                this.industryData = await response.json();
            } else {
                // Use default data if API is not available
                this.industryData = this.getDefaultIndustryData();
            }
        } catch (error) {
            console.warn('Using default industry data:', error);
            this.industryData = this.getDefaultIndustryData();
        }
    }

    /**
     * Calculate business valuation using multiple methods
     */
    calculateValuation(businessData) {
        const {
            revenue,
            netIncome,
            assets,
            liabilities,
            industry,
            location,
            yearsInBusiness,
            employeeCount,
            marketConditions = 'normal'
        } = businessData;

        // Validate input data
        const validation = this.validateBusinessData(businessData);
        if (!validation.isValid) {
            return { success: false, errors: validation.errors };
        }

        try {
            const results = {
                assetBased: this.calculateAssetBasedValuation(assets, liabilities),
                incomeBased: this.calculateIncomeBasedValuation(netIncome, industry),
                marketBased: this.calculateMarketBasedValuation(revenue, industry),
                adjustments: this.calculateAdjustments(businessData),
                summary: null
            };

            // Calculate weighted average
            results.summary = this.calculateWeightedValuation(results, businessData);

            // Add confidence score
            results.confidence = this.calculateConfidenceScore(businessData);

            // Add recommendations
            results.recommendations = this.generateRecommendations(results, businessData);

            return {
                success: true,
                data: results,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error calculating valuation:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Asset-based valuation method
     */
    calculateAssetBasedValuation(assets, liabilities) {
        const netAssets = assets - liabilities;
        const liquidationValue = netAssets * 0.7; // Assume 70% liquidation value
        const goingConcernValue = netAssets * 1.2; // Going concern premium

        return {
            method: 'Asset-Based',
            netAssets,
            liquidationValue,
            goingConcernValue,
            recommendedValue: goingConcernValue,
            description: 'Based on the net value of business assets'
        };
    }

    /**
     * Income-based valuation method
     */
    calculateIncomeBasedValuation(netIncome, industry) {
        const industryMultiple = this.getIndustryMultiple(industry);
        const riskAdjustment = this.getRiskAdjustment(industry);
        
        const baseValue = netIncome * industryMultiple;
        const adjustedValue = baseValue * riskAdjustment;

        return {
            method: 'Income-Based',
            annualIncome: netIncome,
            industryMultiple,
            riskAdjustment,
            baseValue,
            recommendedValue: adjustedValue,
            description: 'Based on income-generating capacity'
        };
    }

    /**
     * Market-based valuation method
     */
    calculateMarketBasedValuation(revenue, industry) {
        const revenueMultiple = this.getRevenueMultiple(industry);
        const marketAdjustment = this.getMarketAdjustment();
        
        const baseValue = revenue * revenueMultiple;
        const adjustedValue = baseValue * marketAdjustment;

        return {
            method: 'Market-Based',
            annualRevenue: revenue,
            revenueMultiple,
            marketAdjustment,
            baseValue,
            recommendedValue: adjustedValue,
            description: 'Based on comparable market transactions'
        };
    }

    /**
     * Calculate valuation adjustments
     */
    calculateAdjustments(businessData) {
        const adjustments = [];
        let totalAdjustment = 1.0;

        // Years in business adjustment
        if (businessData.yearsInBusiness < 3) {
            adjustments.push({ factor: 'New Business Risk', adjustment: -0.15 });
            totalAdjustment *= 0.85;
        } else if (businessData.yearsInBusiness > 10) {
            adjustments.push({ factor: 'Established Business', adjustment: 0.10 });
            totalAdjustment *= 1.10;
        }

        // Employee count adjustment
        if (businessData.employeeCount > 50) {
            adjustments.push({ factor: 'Large Workforce', adjustment: 0.05 });
            totalAdjustment *= 1.05;
        }

        // Location adjustment
        if (businessData.location && this.isHighValueLocation(businessData.location)) {
            adjustments.push({ factor: 'Prime Location', adjustment: 0.08 });
            totalAdjustment *= 1.08;
        }

        // Market conditions adjustment
        const marketAdjustment = this.getMarketConditionsAdjustment(businessData.marketConditions);
        if (marketAdjustment !== 1.0) {
            adjustments.push({ 
                factor: 'Market Conditions', 
                adjustment: marketAdjustment - 1.0 
            });
            totalAdjustment *= marketAdjustment;
        }

        return {
            factors: adjustments,
            totalAdjustment,
            description: 'Adjustments based on business-specific factors'
        };
    }

    /**
     * Calculate weighted average valuation
     */
    calculateWeightedValuation(results, businessData) {
        // Default weights
        let weights = {
            assetBased: 0.25,
            incomeBased: 0.45,
            marketBased: 0.30
        };

        // Adjust weights based on business characteristics
        if (businessData.assets > businessData.revenue * 2) {
            // Asset-heavy business
            weights = { assetBased: 0.40, incomeBased: 0.35, marketBased: 0.25 };
        } else if (businessData.netIncome > businessData.revenue * 0.2) {
            // High-profit business
            weights = { assetBased: 0.20, incomeBased: 0.50, marketBased: 0.30 };
        }

        const weightedValue = 
            (results.assetBased.recommendedValue * weights.assetBased) +
            (results.incomeBased.recommendedValue * weights.incomeBased) +
            (results.marketBased.recommendedValue * weights.marketBased);

        const adjustedValue = weightedValue * results.adjustments.totalAdjustment;

        return {
            weightedValue,
            adjustedValue,
            finalValue: Math.round(adjustedValue),
            weights,
            range: {
                low: Math.round(adjustedValue * 0.85),
                high: Math.round(adjustedValue * 1.15)
            },
            description: 'Weighted average of all valuation methods with adjustments'
        };
    }

    /**
     * Calculate confidence score
     */
    calculateConfidenceScore(businessData) {
        let score = 100;

        // Reduce confidence for missing data
        if (!businessData.revenue) score -= 20;
        if (!businessData.netIncome) score -= 15;
        if (!businessData.assets) score -= 10;
        if (!businessData.industry) score -= 10;
        if (!businessData.yearsInBusiness) score -= 5;

        // Reduce confidence for unusual ratios
        if (businessData.netIncome && businessData.revenue) {
            const profitMargin = businessData.netIncome / businessData.revenue;
            if (profitMargin < 0 || profitMargin > 0.5) score -= 15;
        }

        return Math.max(score, 0);
    }

    /**
     * Generate recommendations
     */
    generateRecommendations(results, businessData) {
        const recommendations = [];

        // Valuation range recommendation
        recommendations.push({
            type: 'valuation',
            title: 'Valuation Range',
            message: `Based on our analysis, the business value ranges from $${results.summary.range.low.toLocaleString()} to $${results.summary.range.high.toLocaleString()}.`
        });

        // Improvement recommendations
        if (businessData.netIncome / businessData.revenue < 0.1) {
            recommendations.push({
                type: 'improvement',
                title: 'Profit Margin',
                message: 'Consider strategies to improve profit margins to increase business value.'
            });
        }

        if (businessData.yearsInBusiness < 3) {
            recommendations.push({
                type: 'timing',
                title: 'Business Maturity',
                message: 'Waiting until the business is more established may result in higher valuation.'
            });
        }

        // Market timing
        if (businessData.marketConditions === 'declining') {
            recommendations.push({
                type: 'timing',
                title: 'Market Conditions',
                message: 'Current market conditions may negatively impact valuation. Consider waiting for market improvement.'
            });
        }

        return recommendations;
    }

    /**
     * Due diligence checklist generation
     */
    generateDueDiligenceChecklist(businessType = 'general') {
        const baseChecklist = [
            {
                category: 'Financial Records',
                items: [
                    'Tax returns (last 3 years)',
                    'Profit & loss statements',
                    'Balance sheets',
                    'Cash flow statements',
                    'Accounts receivable aging',
                    'Accounts payable summary'
                ]
            },
            {
                category: 'Legal Documents',
                items: [
                    'Business licenses and permits',
                    'Articles of incorporation',
                    'Operating agreements',
                    'Material contracts',
                    'Lease agreements',
                    'Insurance policies'
                ]
            },
            {
                category: 'Operations',
                items: [
                    'Employee handbook',
                    'Organizational chart',
                    'Key processes documentation',
                    'Supplier agreements',
                    'Customer contracts',
                    'Inventory records'
                ]
            },
            {
                category: 'Assets & Liabilities',
                items: [
                    'Equipment list and condition',
                    'Real estate appraisals',
                    'Intellectual property',
                    'Outstanding debts',
                    'Contingent liabilities',
                    'Environmental assessments'
                ]
            }
        ];

        // Add industry-specific items
        if (businessType === 'automotive') {
            baseChecklist.push({
                category: 'Automotive Specific',
                items: [
                    'EPA compliance records',
                    'Hazardous waste disposal records',
                    'Equipment maintenance logs',
                    'Technician certifications',
                    'Parts inventory valuation',
                    'Customer database'
                ]
            });
        }

        return {
            checklist: baseChecklist,
            estimatedTime: '2-4 weeks',
            criticalItems: this.getCriticalDueDiligenceItems(),
            tips: this.getDueDiligenceTips()
        };
    }

    /**
     * ROI calculation
     */
    calculateROI(investment, returns, timeframe) {
        const totalReturn = returns.reduce((sum, value) => sum + value, 0);
        const roi = ((totalReturn - investment) / investment) * 100;
        const annualizedROI = Math.pow((totalReturn / investment), (1 / timeframe)) - 1;

        return {
            totalROI: roi,
            annualizedROI: annualizedROI * 100,
            totalReturn,
            netProfit: totalReturn - investment,
            paybackPeriod: this.calculatePaybackPeriod(investment, returns)
        };
    }

    /**
     * Helper methods
     */
    validateBusinessData(data) {
        const errors = [];
        
        if (!data.revenue || data.revenue <= 0) {
            errors.push('Revenue must be a positive number');
        }
        
        if (data.netIncome && data.revenue && data.netIncome > data.revenue) {
            errors.push('Net income cannot exceed revenue');
        }
        
        if (data.assets && data.assets < 0) {
            errors.push('Assets cannot be negative');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    getIndustryMultiple(industry) {
        const multiples = this.industryData?.multiples || {
            automotive: 3.2,
            retail: 2.8,
            technology: 4.5,
            manufacturing: 3.0,
            services: 2.5,
            default: 3.0
        };
        
        return multiples[industry] || multiples.default;
    }

    getRevenueMultiple(industry) {
        const multiples = this.industryData?.revenueMultiples || {
            automotive: 1.2,
            retail: 0.8,
            technology: 2.0,
            manufacturing: 1.0,
            services: 1.5,
            default: 1.0
        };
        
        return multiples[industry] || multiples.default;
    }

    getRiskAdjustment(industry) {
        const adjustments = {
            automotive: 0.95,
            retail: 0.90,
            technology: 1.05,
            manufacturing: 0.98,
            services: 1.02,
            default: 1.0
        };
        
        return adjustments[industry] || adjustments.default;
    }

    getMarketAdjustment() {
        // This could be dynamic based on current market conditions
        return 1.0;
    }

    getMarketConditionsAdjustment(conditions) {
        const adjustments = {
            excellent: 1.15,
            good: 1.05,
            normal: 1.0,
            declining: 0.90,
            poor: 0.80
        };
        
        return adjustments[conditions] || 1.0;
    }

    isHighValueLocation(location) {
        const highValueAreas = ['california', 'new york', 'texas', 'florida'];
        return highValueAreas.some(area => 
            location.toLowerCase().includes(area)
        );
    }

    calculatePaybackPeriod(investment, returns) {
        let cumulative = 0;
        for (let i = 0; i < returns.length; i++) {
            cumulative += returns[i];
            if (cumulative >= investment) {
                return i + 1;
            }
        }
        return returns.length;
    }

    getCriticalDueDiligenceItems() {
        return [
            'Financial statements verification',
            'Tax compliance check',
            'Legal entity status',
            'Major contract review',
            'Asset verification'
        ];
    }

    getDueDiligenceTips() {
        return [
            'Hire qualified professionals for complex areas',
            'Verify all financial information independently',
            'Check for any pending litigation',
            'Review all material contracts carefully',
            'Assess key employee retention risk'
        ];
    }

    getDefaultIndustryData() {
        return {
            multiples: {
                automotive: 3.2,
                retail: 2.8,
                technology: 4.5,
                manufacturing: 3.0,
                services: 2.5,
                default: 3.0
            },
            revenueMultiples: {
                automotive: 1.2,
                retail: 0.8,
                technology: 2.0,
                manufacturing: 1.0,
                services: 1.5,
                default: 1.0
            }
        };
    }
}
