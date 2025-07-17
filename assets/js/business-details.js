/**
 * Business Details Page JavaScript
 * Handles loading and displaying comprehensive business information
 */

class BusinessDetailsManager {
    constructor() {
        this.businessData = null;
        this.businessId = null;
        this.charts = {};
        
        this.init();
    }
    
    init() {
        // Get business ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.businessId = urlParams.get('id');
        
        if (!this.businessId) {
            this.showError('No business ID provided');
            return;
        }
        
        // Try to load business data from sessionStorage first
        this.loadBusinessData();
    }
    
    loadBusinessData() {
        try {
            // First try sessionStorage (from featured listings)
            const storedData = sessionStorage.getItem('selectedBusiness');
            if (storedData) {
                const parsed = JSON.parse(storedData);
                if (parsed.id === this.businessId) {
                    this.businessData = parsed.data;
                    this.displayBusinessDetails();
                    return;
                }
            }
            
            // If not in sessionStorage, try to load from featured listings data
            this.loadFromFeaturedListings();
            
        } catch (error) {
            console.error('Error loading business data:', error);
            this.showError('Error loading business details');
        }
    }
    
    loadFromFeaturedListings() {
        // This would typically make an API call, but for now we'll use static data
        const featuredBusinesses = {
            'premium-auto-service': {
                displayName: 'Established Auto Repair Shop',
                location: 'Plano, TX',
                businessType: 'Auto Repair & Service',
                businessStructure: 'LLC',
                yearEstablished: 2015,
                employees: 8,
                askingPrice: '$485,000',
                annualRevenue: '$750,000',
                netProfit: '$185,000',
                grossMargin: '65%',
                description: 'Premium full-service auto repair facility in prime Plano location. Established customer base with 500+ active clients and modern equipment.',
                reasonForSelling: 'Owner retiring after successful 9-year operation. Well-established business with strong customer loyalty and consistent profitability.',
                keyHighlights: [
                    '8-bay service facility with modern equipment',
                    'Loyal customer base (500+ active clients)',
                    'Prime Plano location with high visibility',
                    'Established vendor relationships and contracts',
                    'Trained technician team with low turnover',
                    'Strong reputation in local community'
                ],
                assetsIncluded: [
                    'Complete diagnostic equipment suite',
                    '8 hydraulic lifts and service bays',
                    'Air compressor and pneumatic tools',
                    'Tire mounting and balancing equipment',
                    'Parts inventory (estimated $45,000 value)',
                    'Office furniture and computer systems',
                    'Customer database and management software'
                ],
                customerBase: {
                    totalActiveCustomers: 500,
                    averageTicket: '$285',
                    repeatCustomerRate: '78%',
                    customerAcquisitionCost: '$45',
                    demographics: 'Mix of individual consumers and small fleet accounts'
                },
                historicalRevenue: [
                    { year: 2020, revenue: 580000 },
                    { year: 2021, revenue: 650000 },
                    { year: 2022, revenue: 720000 },
                    { year: 2023, revenue: 750000 },
                    { year: 2024, revenue: 775000 }
                ],
                historicalProfit: [
                    { year: 2020, profit: 145000 },
                    { year: 2021, profit: 162000 },
                    { year: 2022, profit: 175000 },
                    { year: 2023, profit: 185000 },
                    { year: 2024, profit: 195000 }
                ],
                monthlyTrends: [
                    { month: 'Jan', revenue: 58000 },
                    { month: 'Feb', revenue: 62000 },
                    { month: 'Mar', revenue: 68000 },
                    { month: 'Apr', revenue: 65000 },
                    { month: 'May', revenue: 72000 },
                    { month: 'Jun', revenue: 75000 },
                    { month: 'Jul', revenue: 78000 },
                    { month: 'Aug', revenue: 74000 },
                    { month: 'Sep', revenue: 69000 },
                    { month: 'Oct', revenue: 71000 },
                    { month: 'Nov', revenue: 66000 },
                    { month: 'Dec', revenue: 63000 }
                ],
                expenseBreakdown: [
                    { category: 'Labor', amount: 285000, percentage: 38 },
                    { category: 'Parts & Materials', amount: 180000, percentage: 24 },
                    { category: 'Rent & Utilities', amount: 72000, percentage: 10 },
                    { category: 'Insurance', amount: 36000, percentage: 5 },
                    { category: 'Equipment & Maintenance', amount: 27000, percentage: 4 },
                    { category: 'Marketing', amount: 18000, percentage: 2 },
                    { category: 'Other Operating', amount: 127000, percentage: 17 }
                ],
                propertyInfo: {
                    ownershipStatus: 'lease',
                    squareFootage: '6,500 sq ft',
                    serviceArea: '5,200 sq ft',
                    officeSpace: '800 sq ft',
                    storageArea: '500 sq ft',
                    parkingSpaces: 15,

                    // Lease Information
                    monthlyLeaseAmount: '$8,500',
                    leaseDuration: '7 years remaining',
                    leaseType: 'Triple Net Lease',
                    leaseTerms: 'Transferable 10-year lease with renewal options, 3% annual escalation',
                    transferability: 'Fully transferable to qualified buyer',
                    securityDeposit: '$25,500',
                    leaseExpiration: '2031-12-31'
                }
            },
            'family-auto-repair': {
                displayName: 'Family-Owned Service Center',
                location: 'Frisco, TX',
                businessType: 'Auto Repair & Service',
                businessStructure: 'S-Corporation',
                yearEstablished: 2008,
                employees: 6,
                askingPrice: '$325,000',
                annualRevenue: '$520,000',
                netProfit: '$145,000',
                grossMargin: '62%',
                description: 'Well-established family-owned auto repair shop in growing Frisco market. Strong community reputation and consistent customer base built over 16 years.',
                reasonForSelling: 'Family relocating out of state. Excellent opportunity for new owner to continue successful operation with established customer relationships.',
                keyHighlights: [
                    '6-bay service center with quality equipment',
                    'Strong community reputation and trust',
                    'Growing Frisco market with expanding population',
                    'Established customer relationships spanning decades',
                    'Consistent revenue stream with seasonal stability',
                    'Experienced staff willing to stay with new ownership'
                ],
                assetsIncluded: [
                    'Complete automotive diagnostic systems',
                    '6 hydraulic lifts in excellent condition',
                    'Comprehensive tool inventory',
                    'Tire service equipment and balancer',
                    'Parts inventory (estimated $28,000 value)',
                    'Customer management software and records',
                    'Office equipment and furniture'
                ],
                customerBase: {
                    totalActiveCustomers: 380,
                    averageTicket: '$245',
                    repeatCustomerRate: '85%',
                    customerAcquisitionCost: '$35',
                    demographics: 'Primarily local families and long-term residents'
                },
                historicalRevenue: [
                    { year: 2020, revenue: 445000 },
                    { year: 2021, revenue: 475000 },
                    { year: 2022, revenue: 495000 },
                    { year: 2023, revenue: 520000 },
                    { year: 2024, revenue: 535000 }
                ],
                historicalProfit: [
                    { year: 2020, profit: 125000 },
                    { year: 2021, profit: 135000 },
                    { year: 2022, profit: 140000 },
                    { year: 2023, profit: 145000 },
                    { year: 2024, profit: 152000 }
                ],
                monthlyTrends: [
                    { month: 'Jan', revenue: 41000 },
                    { month: 'Feb', revenue: 43000 },
                    { month: 'Mar', revenue: 47000 },
                    { month: 'Apr', revenue: 45000 },
                    { month: 'May', revenue: 48000 },
                    { month: 'Jun', revenue: 46000 },
                    { month: 'Jul', revenue: 44000 },
                    { month: 'Aug', revenue: 42000 },
                    { month: 'Sep', revenue: 45000 },
                    { month: 'Oct', revenue: 47000 },
                    { month: 'Nov', revenue: 44000 },
                    { month: 'Dec', revenue: 43000 }
                ],
                expenseBreakdown: [
                    { category: 'Labor', amount: 195000, percentage: 37 },
                    { category: 'Parts & Materials', amount: 130000, percentage: 25 },
                    { category: 'Rent & Utilities', amount: 48000, percentage: 9 },
                    { category: 'Insurance', amount: 26000, percentage: 5 },
                    { category: 'Equipment & Maintenance', amount: 18000, percentage: 3 },
                    { category: 'Marketing', amount: 12000, percentage: 2 },
                    { category: 'Other Operating', amount: 91000, percentage: 19 }
                ],
                propertyInfo: {
                    ownershipStatus: 'owned',
                    squareFootage: '4,800 sq ft',
                    serviceArea: '3,800 sq ft',
                    officeSpace: '600 sq ft',
                    storageArea: '400 sq ft',
                    parkingSpaces: 12,

                    // Ownership Information
                    purchasePrice: '$650,000',
                    purchasePriceNumeric: 650000,
                    propertyTaxes: '$12,800',
                    propertyInsurance: '$4,200',
                    mortgageDetails: {
                        downPaymentPercent: 20,
                        loanTermYears: 20,
                        interestRate: 8.0
                        // Calculated values will be computed dynamically
                    }
                }
            },
            'express-auto-care': {
                displayName: 'Express Service Center',
                location: 'Allen, TX',
                businessType: 'Quick Service Auto Care',
                businessStructure: 'LLC',
                yearEstablished: 2012,
                employees: 5,
                askingPrice: '$275,000',
                annualRevenue: '$420,000',
                netProfit: '$125,000',
                grossMargin: '58%',
                description: 'Modern express auto care facility specializing in quick service. High-traffic location with excellent visibility and significant growth potential.',
                reasonForSelling: 'Owner expanding to multiple locations and seeking partner for this profitable operation. Excellent growth opportunity for hands-on operator.',
                keyHighlights: [
                    'Express service model with quick turnaround',
                    'Modern equipment and efficient workflow',
                    'High-traffic location with excellent visibility',
                    'Strong growth potential in expanding market',
                    'Streamlined operations and proven systems',
                    'Loyal customer base with repeat business'
                ],
                assetsIncluded: [
                    'State-of-the-art quick service equipment',
                    '4 service bays optimized for efficiency',
                    'Express oil change system',
                    'Quick tire service equipment',
                    'Point-of-sale and scheduling systems',
                    'Parts inventory (estimated $22,000 value)',
                    'Customer database and loyalty program'
                ],
                customerBase: {
                    totalActiveCustomers: 320,
                    averageTicket: '$185',
                    repeatCustomerRate: '72%',
                    customerAcquisitionCost: '$28',
                    demographics: 'Busy professionals and families seeking quick service'
                },
                historicalRevenue: [
                    { year: 2020, revenue: 325000 },
                    { year: 2021, revenue: 365000 },
                    { year: 2022, revenue: 390000 },
                    { year: 2023, revenue: 420000 },
                    { year: 2024, revenue: 445000 }
                ],
                historicalProfit: [
                    { year: 2020, profit: 95000 },
                    { year: 2021, profit: 108000 },
                    { year: 2022, profit: 118000 },
                    { year: 2023, profit: 125000 },
                    { year: 2024, profit: 135000 }
                ],
                monthlyTrends: [
                    { month: 'Jan', revenue: 32000 },
                    { month: 'Feb', revenue: 34000 },
                    { month: 'Mar', revenue: 38000 },
                    { month: 'Apr', revenue: 36000 },
                    { month: 'May', revenue: 39000 },
                    { month: 'Jun', revenue: 37000 },
                    { month: 'Jul', revenue: 35000 },
                    { month: 'Aug', revenue: 33000 },
                    { month: 'Sep', revenue: 36000 },
                    { month: 'Oct', revenue: 38000 },
                    { month: 'Nov', revenue: 35000 },
                    { month: 'Dec', revenue: 34000 }
                ],
                expenseBreakdown: [
                    { category: 'Labor', amount: 147000, percentage: 35 },
                    { category: 'Parts & Materials', amount: 105000, percentage: 25 },
                    { category: 'Rent & Utilities', amount: 42000, percentage: 10 },
                    { category: 'Insurance', amount: 21000, percentage: 5 },
                    { category: 'Equipment & Maintenance', amount: 16800, percentage: 4 },
                    { category: 'Marketing', amount: 12600, percentage: 3 },
                    { category: 'Other Operating', amount: 75600, percentage: 18 }
                ],
                propertyInfo: {
                    ownershipStatus: 'lease',
                    squareFootage: '3,200 sq ft',
                    serviceArea: '2,400 sq ft',
                    officeSpace: '400 sq ft',
                    storageArea: '400 sq ft',
                    parkingSpaces: 10,

                    // Lease Information
                    monthlyLeaseAmount: '$6,200',
                    leaseDuration: '5 years remaining',
                    leaseType: 'Modified Gross Lease',
                    leaseTerms: 'Transferable 7-year lease with expansion options, 2.5% annual escalation',
                    transferability: 'Transferable with landlord approval',
                    securityDeposit: '$18,600',
                    leaseExpiration: '2029-08-31'
                }
            }
        };
        
        if (featuredBusinesses[this.businessId]) {
            this.businessData = featuredBusinesses[this.businessId];
            this.displayBusinessDetails();
        } else {
            this.showError('Business not found');
        }
    }
    
    displayBusinessDetails() {
        if (!this.businessData) {
            this.showError('No business data available');
            return;
        }
        
        // Hide loading state and show content
        document.getElementById('loading-state').classList.add('hidden');
        document.getElementById('business-content').classList.remove('hidden');
        
        // Populate basic information
        this.populateBasicInfo();
        
        // Populate detailed sections
        this.populateBusinessOverview();
        this.populateFinancialCharts();
        this.populateAssets();
        this.populateSidebarInfo();
        
        console.log('Business details displayed successfully');
    }
    
    populateBasicInfo() {
        const data = this.businessData;
        
        // Header information
        document.getElementById('business-title').textContent = data.displayName;
        document.getElementById('breadcrumb-business-name').textContent = data.displayName;
        document.getElementById('business-location').innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            ${data.location}
        `;
        document.getElementById('business-type').innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
            </svg>
            ${data.businessType}
        `;
        document.getElementById('business-established').innerHTML = `
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            ${data.yearEstablished}
        `;
        
        // Key metrics
        document.getElementById('asking-price').textContent = data.askingPrice;
        document.getElementById('annual-revenue').textContent = data.annualRevenue;
        document.getElementById('net-profit').textContent = data.netProfit;
        document.getElementById('employee-count').textContent = data.employees;
        document.getElementById('gross-margin').textContent = data.grossMargin;
    }
    
    populateBusinessOverview() {
        const data = this.businessData;
        
        document.getElementById('business-description').textContent = data.description;
        document.getElementById('reason-for-selling').textContent = data.reasonForSelling;
        
        // Key highlights
        const highlightsList = document.getElementById('key-highlights');
        highlightsList.innerHTML = data.keyHighlights.map(highlight => `
            <li class="flex items-start">
                <svg class="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">${highlight}</span>
            </li>
        `).join('');
    }
    
    populateAssets() {
        const data = this.businessData;
        
        const assetsList = document.getElementById('assets-list');
        assetsList.innerHTML = data.assetsIncluded.map(asset => `
            <li class="flex items-start">
                <svg class="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="text-gray-700 dark:text-gray-300">${asset}</span>
            </li>
        `).join('');
    }
    
    populateSidebarInfo() {
        const data = this.businessData;

        // Basic Information
        document.getElementById('business-structure').textContent = data.businessStructure;
        document.getElementById('year-established').textContent = data.yearEstablished;
        document.getElementById('num-employees').textContent = data.employees;
        document.getElementById('square-footage').textContent = data.propertyInfo.squareFootage;

        // Customer Base
        document.getElementById('active-customers').textContent = data.customerBase.totalActiveCustomers;
        document.getElementById('average-ticket').textContent = data.customerBase.averageTicket;
        document.getElementById('repeat-rate').textContent = data.customerBase.repeatCustomerRate;

        // Enhanced Property Details
        this.populatePropertyDetails(data.propertyInfo);
    }

    populatePropertyDetails(propertyInfo) {
        // Basic property information (always shown)
        document.getElementById('total-square-footage').textContent = propertyInfo.squareFootage;
        document.getElementById('service-area').textContent = propertyInfo.serviceArea;
        document.getElementById('office-space').textContent = propertyInfo.officeSpace;
        document.getElementById('parking-spaces').textContent = propertyInfo.parkingSpaces;

        // Set property icon and title based on ownership status
        const propertyIcon = document.getElementById('property-icon');
        const propertyTitle = document.getElementById('property-title');

        if (propertyInfo.ownershipStatus === 'lease') {
            // Show lease information
            this.showLeaseInformation(propertyInfo);

            // Set lease icon
            propertyIcon.className = 'p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg mr-3';
            propertyIcon.innerHTML = `
                <svg class="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
            `;
            propertyTitle.textContent = 'Property Details (Leased)';

        } else if (propertyInfo.ownershipStatus === 'owned') {
            // Show ownership information
            this.showOwnershipInformation(propertyInfo);

            // Set ownership icon
            propertyIcon.className = 'p-2 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3';
            propertyIcon.innerHTML = `
                <svg class="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
                </svg>
            `;
            propertyTitle.textContent = 'Property Details (Owned)';
        }
    }

    showLeaseInformation(propertyInfo) {
        // Hide ownership section and show lease section
        document.getElementById('ownership-information').classList.add('hidden');
        document.getElementById('lease-information').classList.remove('hidden');

        // Populate lease information
        document.getElementById('monthly-lease').textContent = propertyInfo.monthlyLeaseAmount;
        document.getElementById('lease-duration').textContent = propertyInfo.leaseDuration;
        document.getElementById('lease-type').textContent = propertyInfo.leaseType;
        document.getElementById('security-deposit').textContent = propertyInfo.securityDeposit;
        document.getElementById('transferability').textContent = propertyInfo.transferability;
        document.getElementById('lease-terms').textContent = propertyInfo.leaseTerms;
    }

    showOwnershipInformation(propertyInfo) {
        // Hide lease section and show ownership section
        document.getElementById('lease-information').classList.add('hidden');
        document.getElementById('ownership-information').classList.remove('hidden');

        // Populate ownership information
        document.getElementById('property-value').textContent = propertyInfo.purchasePrice;
        document.getElementById('property-taxes').textContent = propertyInfo.propertyTaxes;
        document.getElementById('property-insurance').textContent = propertyInfo.propertyInsurance;

        // Calculate and populate mortgage details
        const mortgage = propertyInfo.mortgageDetails;
        if (mortgage && propertyInfo.purchasePriceNumeric) {
            const calculatedMortgage = BusinessDetailsManager.calculateMortgage(
                propertyInfo.purchasePriceNumeric,
                mortgage.downPaymentPercent,
                mortgage.interestRate,
                mortgage.loanTermYears
            );

            document.getElementById('down-payment').textContent = calculatedMortgage.downPayment;
            document.getElementById('loan-amount').textContent = calculatedMortgage.loanAmount;
            document.getElementById('monthly-payment').textContent = calculatedMortgage.monthlyPayment;
            document.getElementById('total-interest').textContent = calculatedMortgage.totalInterest;
        }
    }
    
    populateFinancialCharts() {
        const data = this.businessData;

        // Revenue Chart
        this.createRevenueChart(data.historicalRevenue);

        // Profit Chart
        this.createProfitChart(data.historicalProfit);

        // Monthly Trends Chart
        this.createMonthlyChart(data.monthlyTrends);

        // Expense Breakdown Chart
        this.createExpenseChart(data.expenseBreakdown);
    }

    createRevenueChart(revenueData) {
        const ctx = document.getElementById('revenueChart').getContext('2d');

        this.charts.revenue = new Chart(ctx, {
            type: 'line',
            data: {
                labels: revenueData.map(item => item.year),
                datasets: [{
                    label: 'Annual Revenue',
                    data: revenueData.map(item => item.revenue),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    createProfitChart(profitData) {
        const ctx = document.getElementById('profitChart').getContext('2d');

        this.charts.profit = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: profitData.map(item => item.year),
                datasets: [{
                    label: 'Net Profit',
                    data: profitData.map(item => item.profit),
                    backgroundColor: '#10b981',
                    borderColor: '#059669',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    createMonthlyChart(monthlyData) {
        const ctx = document.getElementById('monthlyChart').getContext('2d');

        this.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: monthlyData.map(item => item.month),
                datasets: [{
                    label: 'Monthly Revenue',
                    data: monthlyData.map(item => item.revenue),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + (value / 1000) + 'K';
                            }
                        }
                    }
                }
            }
        });
    }

    createExpenseChart(expenseData) {
        const ctx = document.getElementById('expenseChart').getContext('2d');

        const colors = [
            '#ef4444', '#f97316', '#eab308', '#22c55e',
            '#06b6d4', '#3b82f6', '#8b5cf6'
        ];

        this.charts.expense = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: expenseData.map(item => item.category),
                datasets: [{
                    data: expenseData.map(item => item.percentage),
                    backgroundColor: colors.slice(0, expenseData.length),
                    borderWidth: 2,
                    borderColor: '#ffffff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const item = expenseData[context.dataIndex];
                                return `${item.category}: ${item.percentage}% ($${(item.amount / 1000).toFixed(0)}K)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    showError(message) {
        document.getElementById('loading-state').innerHTML = `
            <div class="text-center py-12">
                <svg class="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-red-600 dark:text-red-400 font-medium">${message}</p>
                <button onclick="history.back()" class="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
                    Go Back
                </button>
            </div>
        `;
    }

    // Mortgage Calculator Function
    static calculateMortgage(purchasePrice, downPaymentPercent, interestRate, loanTermYears) {
        const principal = purchasePrice * (1 - downPaymentPercent / 100);
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTermYears * 12;

        // Monthly payment formula: M = P[r(1+r)^n]/[(1+r)^n-1]
        const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                              (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

        const totalPayments = monthlyPayment * numberOfPayments;
        const totalInterest = totalPayments - principal;
        const downPayment = purchasePrice * (downPaymentPercent / 100);

        return {
            downPayment: this.formatCurrency(downPayment),
            loanAmount: this.formatCurrency(principal),
            monthlyPayment: this.formatCurrency(monthlyPayment),
            totalInterest: this.formatCurrency(totalInterest),
            totalPayments: this.formatCurrency(totalPayments)
        };
    }

    // Currency formatting helper
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }
}

// Action button functions
function performDealAnalysis() {
    alert('Deal Analysis tool will be implemented. This will open a comprehensive financial analysis calculator.');
}

function messageSeller() {
    alert('Secure messaging system will be implemented. This will open a private communication channel with the seller.');
}

function makeOffer() {
    alert('Offer submission form will be implemented. This will open a structured offer submission interface.');
}

function saveToFavorites() {
    alert('Favorites system will be implemented. This business will be saved to your favorites list.');
}

function scheduleViewing() {
    alert('Viewing scheduler will be implemented. This will open a calendar interface to schedule a physical inspection.');
}

function printBusinessDetails() {
    window.print();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new BusinessDetailsManager();
});
