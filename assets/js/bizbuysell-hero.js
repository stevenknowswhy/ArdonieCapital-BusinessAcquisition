/**
 * BizBuySell-Style Hero Section Functionality
 * Handles search interface, tab switching, and business discovery
 */

class BizBuySellHero {
    constructor() {
        this.currentTab = 'businesses';
        this.searchData = {
            location: '',
            industry: '',
            type: 'businesses'
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupTabSwitching();
        this.addCustomStyles();
        this.verifyBackgroundImage();
        this.hideHomeNavigation();
    }
    
    bindEvents() {
        // Tab switching
        const businessesTab = document.getElementById('businesses-tab');
        const franchisesTab = document.getElementById('franchises-tab');
        
        if (businessesTab) {
            businessesTab.addEventListener('click', () => this.switchTab('businesses'));
        }
        
        if (franchisesTab) {
            franchisesTab.addEventListener('click', () => this.switchTab('franchises'));
        }
        
        // Search functionality
        const searchBtn = document.getElementById('hero-search-btn');
        const locationInput = document.getElementById('location-search');
        const industrySelect = document.getElementById('industry-select');
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.performSearch());
        }
        
        if (locationInput) {
            locationInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.performSearch();
                }
            });
        }
        
        if (industrySelect) {
            industrySelect.addEventListener('change', (e) => {
                this.searchData.industry = e.target.value;
            });
        }
        
        // Quick action buttons
        const browseBtn = document.getElementById('browse-businesses-btn');
        const sellBtn = document.getElementById('sell-business-btn');
        
        if (browseBtn) {
            browseBtn.addEventListener('click', () => this.browseAllBusinesses());
        }
        
        if (sellBtn) {
            sellBtn.addEventListener('click', () => this.sellBusiness());
        }
    }
    
    setupTabSwitching() {
        // Initialize with businesses tab active
        this.switchTab('businesses');
    }
    
    switchTab(tabType) {
        this.currentTab = tabType;
        this.searchData.type = tabType;
        
        // Update tab appearance
        const businessesTab = document.getElementById('businesses-tab');
        const franchisesTab = document.getElementById('franchises-tab');
        
        if (businessesTab && franchisesTab) {
            // Reset both tabs
            businessesTab.className = 'tab-button px-6 py-3 text-white/70 font-medium rounded-md transition-all duration-300 hover:text-white hover:bg-white/10';
            franchisesTab.className = 'tab-button px-6 py-3 text-white/70 font-medium rounded-md transition-all duration-300 hover:text-white hover:bg-white/10';
            
            // Activate selected tab
            if (tabType === 'businesses') {
                businessesTab.className = 'tab-button active px-6 py-3 text-white font-medium rounded-md transition-all duration-300 bg-white/20';
            } else {
                franchisesTab.className = 'tab-button active px-6 py-3 text-white font-medium rounded-md transition-all duration-300 bg-white/20';
            }
        }
        
        // Update industry options based on tab
        this.updateIndustryOptions(tabType);
    }
    
    updateIndustryOptions(tabType) {
        const industrySelect = document.getElementById('industry-select');
        if (!industrySelect) return;
        
        // Clear existing options
        industrySelect.innerHTML = '';
        
        // Add default option
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = `All ${tabType === 'businesses' ? 'Industries' : 'Franchise Categories'}`;
        industrySelect.appendChild(defaultOption);
        
        // Add specific options based on tab type
        const options = tabType === 'businesses' ? this.getBusinessIndustries() : this.getFranchiseCategories();
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            industrySelect.appendChild(optionElement);
        });
    }
    
    getBusinessIndustries() {
        return [
            { value: 'automotive', label: 'Automotive & Auto Repair' },
            { value: 'restaurant', label: 'Restaurant & Food Service' },
            { value: 'retail', label: 'Retail & E-commerce' },
            { value: 'healthcare', label: 'Healthcare & Medical' },
            { value: 'manufacturing', label: 'Manufacturing' },
            { value: 'technology', label: 'Technology & Software' },
            { value: 'construction', label: 'Construction & Real Estate' },
            { value: 'services', label: 'Professional Services' },
            { value: 'beauty', label: 'Beauty & Personal Care' },
            { value: 'fitness', label: 'Fitness & Recreation' }
        ];
    }
    
    getFranchiseCategories() {
        return [
            { value: 'food', label: 'Food & Restaurant Franchises' },
            { value: 'retail', label: 'Retail Franchises' },
            { value: 'services', label: 'Service-Based Franchises' },
            { value: 'automotive', label: 'Automotive Franchises' },
            { value: 'fitness', label: 'Fitness & Health Franchises' },
            { value: 'education', label: 'Education & Training Franchises' },
            { value: 'cleaning', label: 'Cleaning & Maintenance Franchises' },
            { value: 'childcare', label: 'Childcare & Senior Care Franchises' }
        ];
    }
    
    performSearch() {
        // Get current search values
        const locationInput = document.getElementById('location-search');
        const industrySelect = document.getElementById('industry-select');
        
        this.searchData.location = locationInput ? locationInput.value.trim() : '';
        this.searchData.industry = industrySelect ? industrySelect.value : '';
        
        console.log('🔍 Performing search:', this.searchData);
        
        // Show loading state
        this.showSearchLoading();
        
        // Simulate search delay and redirect to results
        setTimeout(() => {
            this.redirectToResults();
        }, 1000);
    }
    
    showSearchLoading() {
        const searchBtn = document.getElementById('hero-search-btn');
        if (searchBtn) {
            const originalText = searchBtn.textContent;
            searchBtn.textContent = 'Searching...';
            searchBtn.disabled = true;
            
            // Reset after delay
            setTimeout(() => {
                searchBtn.textContent = originalText;
                searchBtn.disabled = false;
            }, 1000);
        }
    }
    
    redirectToResults() {
        // Build search URL with parameters
        const params = new URLSearchParams();
        
        if (this.searchData.location) {
            params.append('location', this.searchData.location);
        }
        
        if (this.searchData.industry) {
            params.append('industry', this.searchData.industry);
        }
        
        params.append('type', this.searchData.type);
        
        // Redirect to search results page
        const resultsUrl = this.searchData.type === 'businesses' 
            ? `/marketplace/businesses.html?${params.toString()}`
            : `/marketplace/franchises.html?${params.toString()}`;
            
        console.log('🔄 Redirecting to:', resultsUrl);
        
        // For now, show alert (replace with actual navigation)
        alert(`Searching for ${this.searchData.type} in "${this.searchData.location || 'all locations'}" ${this.searchData.industry ? `in ${this.searchData.industry}` : ''}`);
    }
    
    browseAllBusinesses() {
        console.log('🏢 Browse all businesses clicked');
        // Redirect to business marketplace
        window.location.href = '/marketplace/businesses.html';
    }
    
    sellBusiness() {
        console.log('💼 Sell business clicked');
        // Redirect to sell business page
        window.location.href = '/sell/list-business.html';
    }
    
    addCustomStyles() {
        // CRITICAL FIX: Remove all CSS injection to prevent conflicts
        // All styles now handled in homepage-enhancements.css
        console.log('✅ BizBuySell Hero: CSS injection disabled to prevent conflicts');

        // Note: All hero section styles are now managed in:
        // - assets/css/homepage-enhancements.css
        // This prevents CSS injection conflicts and timing issues

        // All CSS styles moved to homepage-enhancements.css to prevent conflicts
    }



    hideHomeNavigation() {
        // Hide the Home link in navigation when on homepage
        setTimeout(() => {
            const homeLinks = document.querySelectorAll('a[href*="index.html"], a[href="/"], a[href="./"]');
            homeLinks.forEach(link => {
                if (link.textContent.trim().toLowerCase() === 'home') {
                    link.style.display = 'none';
                    console.log('✅ Home navigation link hidden on homepage');
                }
            });
        }, 1000); // Wait for navigation to load
    }

    verifyBackgroundImage() {
        // Test if the primary background image loads
        const primaryImageUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
        const fallbackImageUrl = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';

        const testImage = new Image();

        testImage.onload = () => {
            console.log('✅ Primary background image loaded successfully');
            // Ensure the hero background element has the correct class
            const heroBackground = document.querySelector('#hero-section .hero-bg-image');
            if (heroBackground) {
                heroBackground.classList.add('hero-bg-image');
                console.log('✅ Background image class applied');
            }
        };

        testImage.onerror = () => {
            console.warn('⚠️ Primary background image failed to load, trying fallback');
            this.useFallbackImage(fallbackImageUrl);
        };

        testImage.src = primaryImageUrl;

        // Also verify the background is applied after a short delay
        setTimeout(() => {
            this.checkBackgroundApplication();
        }, 2000);
    }

    useFallbackImage(fallbackUrl) {
        const heroBackground = document.querySelector('#hero-section .hero-bg-image');
        if (heroBackground) {
            // Remove primary class and add fallback
            heroBackground.classList.remove('hero-bg-image');
            heroBackground.classList.add('hero-bg-image-alt1');
            console.log('🔄 Applied fallback background image');

            // Test fallback image
            const fallbackTest = new Image();
            fallbackTest.onload = () => {
                console.log('✅ Fallback background image loaded successfully');
            };
            fallbackTest.onerror = () => {
                console.error('❌ Fallback background image also failed, using gradient only');
                heroBackground.classList.remove('hero-bg-image-alt1');
            };
            fallbackTest.src = fallbackUrl;
        }
    }

    checkBackgroundApplication() {
        const heroBackground = document.querySelector('#hero-section .hero-bg-image, #hero-section .hero-bg-image-alt1');
        if (heroBackground) {
            const computedStyle = window.getComputedStyle(heroBackground);
            const backgroundImage = computedStyle.backgroundImage;

            if (backgroundImage && backgroundImage !== 'none') {
                console.log('✅ Background image successfully applied:', backgroundImage.substring(0, 50) + '...');
            } else {
                console.warn('⚠️ Background image not applied, checking for issues...');
                this.debugBackgroundIssues();
            }
        }
    }

    debugBackgroundIssues() {
        const heroSection = document.getElementById('hero-section');
        const heroBackground = document.querySelector('#hero-section .hero-bg-image, #hero-section .hero-bg-image-alt1');

        console.log('🔍 Debug Info:');
        console.log('- Hero section exists:', !!heroSection);
        console.log('- Background element exists:', !!heroBackground);

        if (heroBackground) {
            console.log('- Background element classes:', heroBackground.className);
            console.log('- Computed background-image:', window.getComputedStyle(heroBackground).backgroundImage);
        }

        // Try applying inline style as last resort
        if (heroBackground && window.getComputedStyle(heroBackground).backgroundImage === 'none') {
            console.log('🚨 Applying inline style as last resort');
            heroBackground.style.backgroundImage = "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')";
            heroBackground.style.backgroundSize = 'cover';
            heroBackground.style.backgroundPosition = 'center';
            heroBackground.style.backgroundRepeat = 'no-repeat';
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing BizBuySell-style hero section');
    new BizBuySellHero();
});

// Export for potential external use
window.BizBuySellHero = BizBuySellHero;
