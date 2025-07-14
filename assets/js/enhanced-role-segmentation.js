/**
 * Enhanced Role-Based Content Segmentation System
 * Dynamically adapts homepage content based on user role selection
 * Integrates with enhanced features while maintaining personalization
 */

class EnhancedRoleSegmentation {
    constructor() {
        this.currentRole = null;
        this.roleData = this.initializeRoleData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkUrlParams();
        this.addCustomStyles();
    }

    setupEventListeners() {
        // Role selection cards
        document.querySelectorAll('.role-selection-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const role = e.currentTarget.dataset.role;
                this.selectRole(role);
            });
        });

        // Change role button
        const changeRoleBtn = document.getElementById('change-role-btn');
        if (changeRoleBtn) {
            changeRoleBtn.addEventListener('click', () => {
                this.resetToRoleSelection();
            });
        }
    }

    checkUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const role = urlParams.get('role');
        if (role && this.roleData[role]) {
            this.selectRole(role);
        }
    }

    selectRole(role) {
        if (!this.roleData[role]) {
            console.warn(`Role "${role}" not found in role data`);
            return;
        }

        this.currentRole = role;
        this.updateURL(role);
        this.showRoleSpecificContent();
        this.updatePageContent();
        this.trackRoleSelection(role);
        
        // Trigger custom event for other components
        window.dispatchEvent(new CustomEvent('roleSelected', { 
            detail: { role, data: this.roleData[role] } 
        }));
    }

    showRoleSpecificContent() {
        // Hide role selection screen with animation
        const roleSelectionScreen = document.getElementById('role-selection-screen');
        const roleSpecificScreen = document.getElementById('role-specific-screen');
        
        if (roleSelectionScreen && roleSpecificScreen) {
            // Fade out role selection
            roleSelectionScreen.style.opacity = '0';
            roleSelectionScreen.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                roleSelectionScreen.style.display = 'none';
                roleSpecificScreen.style.display = 'block';
                roleSpecificScreen.classList.remove('hidden');
                
                // Fade in role-specific content
                setTimeout(() => {
                    roleSpecificScreen.style.opacity = '1';
                    roleSpecificScreen.style.transform = 'translateY(0)';
                }, 50);
            }, 300);
        }
    }

    resetToRoleSelection() {
        // Show role selection screen with animation
        const roleSelectionScreen = document.getElementById('role-selection-screen');
        const roleSpecificScreen = document.getElementById('role-specific-screen');
        
        if (roleSelectionScreen && roleSpecificScreen) {
            // Fade out role-specific content
            roleSpecificScreen.style.opacity = '0';
            roleSpecificScreen.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                roleSpecificScreen.style.display = 'none';
                roleSpecificScreen.classList.add('hidden');
                roleSelectionScreen.style.display = 'block';
                
                // Fade in role selection
                setTimeout(() => {
                    roleSelectionScreen.style.opacity = '1';
                    roleSelectionScreen.style.transform = 'translateY(0)';
                }, 50);
            }, 300);
        }

        this.currentRole = null;
        this.updateURL();
        
        // Trigger custom event
        window.dispatchEvent(new CustomEvent('roleReset'));
    }

    updatePageContent() {
        if (!this.currentRole || !this.roleData[this.currentRole]) return;

        const data = this.roleData[this.currentRole];

        // Update hero content
        this.updateHeroContent(data);
        
        // Update How It Works section
        this.updateHowItWorksContent(data);
        
        // Update Why Choose section
        this.updateWhyChooseContent(data);
        
        // Update Featured Listings section
        this.updateFeaturedListingsContent(data);
        
        // Update navigation if needed
        this.updateNavigationForRole(data);
    }

    updateHeroContent(data) {
        const dynamicContent = document.getElementById('dynamic-hero-content');
        if (!dynamicContent) return;

        dynamicContent.innerHTML = `
            <div class="mb-8 fade-in">
                <div class="inline-flex items-center bg-emerald-500/20 border border-emerald-500/30 rounded-full px-6 py-3 mb-6 hover-glow">
                    <span class="bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full mr-3">NEW</span>
                    <span class="text-emerald-400 text-base font-medium">34-Day Express Deal Program</span>
                </div>
            </div>

            <div class="mb-12 slide-up">
                <h1 class="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                    ${data.hero.headline}
                </h1>
                <p class="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto leading-relaxed mb-8">
                    ${data.hero.subtitle}
                </p>
                <p class="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
                    ${data.hero.description}
                </p>
            </div>

            <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                ${data.hero.ctas.map(cta => `
                    <a href="${cta.link}" class="inline-flex items-center px-8 py-4 ${cta.style} text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${cta.icon}"></path>
                        </svg>
                        ${cta.text}
                    </a>
                `).join('')}
            </div>

            ${this.generateTrustBadges()}
        `;

        // Add animation classes
        setTimeout(() => {
            dynamicContent.querySelectorAll('.fade-in').forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            });
        }, 100);
    }

    generateTrustBadges() {
        return `
            <div class="flex flex-wrap justify-center items-center gap-6 mb-12">
                <div class="trust-badge-enhanced">
                    <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                    </svg>
                    <span class="text-white font-medium">Bank-Level Security</span>
                </div>
                <div class="trust-badge-enhanced">
                    <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-white font-medium">Verified Profiles</span>
                </div>
                <div class="trust-badge-enhanced">
                    <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span class="text-white font-medium">34-Day Express Deals</span>
                </div>
                <div class="trust-badge-enhanced">
                    <svg class="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <span class="text-white font-medium">Professional Network</span>
                </div>
            </div>
        `;
    }

    updateHowItWorksContent(data) {
        const title = document.getElementById('how-it-works-title');
        const subtitle = document.getElementById('how-it-works-subtitle');
        
        if (title) title.textContent = data.howItWorks.title;
        if (subtitle) subtitle.textContent = data.howItWorks.subtitle;
    }

    updateWhyChooseContent(data) {
        const title = document.getElementById('why-choose-title');
        const subtitle = document.getElementById('why-choose-subtitle');
        
        if (title) title.textContent = data.whyChoose.title;
        if (subtitle) subtitle.textContent = data.whyChoose.subtitle;
    }

    updateFeaturedListingsContent(data) {
        const title = document.getElementById('featured-listings-title');
        const subtitle = document.getElementById('featured-listings-subtitle');
        
        if (title) title.textContent = data.featuredListings.title;
        if (subtitle) subtitle.textContent = data.featuredListings.subtitle;
        
        // Update Quick Match Quiz text for role-specific context
        const quizBtn = document.getElementById('start-quiz-btn');
        if (quizBtn && data.featuredListings.quizText) {
            const quizText = quizBtn.querySelector('span:last-child');
            if (quizText) quizText.textContent = data.featuredListings.quizText;
        }
    }

    updateNavigationForRole(data) {
        // Update navigation CTAs based on role
        const registerBtn = document.getElementById('register-btn');
        const mobileRegisterBtn = document.getElementById('mobile-register-btn');
        
        if (registerBtn && data.navigation?.ctaText) {
            registerBtn.innerHTML = registerBtn.innerHTML.replace('Get Started Free', data.navigation.ctaText);
        }
        
        if (mobileRegisterBtn && data.navigation?.ctaText) {
            mobileRegisterBtn.innerHTML = mobileRegisterBtn.innerHTML.replace('Get Started Free', data.navigation.ctaText);
        }
    }

    addCustomStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .trust-badge-enhanced {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.75rem 1rem;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 9999px;
                backdrop-filter: blur(8px);
                transition: all 0.3s ease;
            }
            
            .trust-badge-enhanced:hover {
                background: rgba(255, 255, 255, 0.15);
                transform: translateY(-2px);
            }
            
            .fade-in {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.6s ease;
            }
            
            .slide-up {
                opacity: 0;
                transform: translateY(30px);
                transition: all 0.8s ease;
            }
            
            .hover-glow {
                transition: all 0.3s ease;
            }
            
            .hover-glow:hover {
                box-shadow: 0 0 30px rgba(16, 185, 129, 0.3);
            }
            
            #role-specific-screen {
                opacity: 0;
                transform: translateY(20px);
                transition: all 0.3s ease;
            }
            
            #role-selection-screen {
                transition: all 0.3s ease;
            }
        `;
        document.head.appendChild(style);
    }

    updateURL(role = null) {
        const url = new URL(window.location);
        if (role) {
            url.searchParams.set('role', role);
        } else {
            url.searchParams.delete('role');
        }
        window.history.replaceState({}, '', url);
    }

    trackRoleSelection(role) {
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'role_selection', {
                'role': role,
                'page_title': document.title
            });
        }

        console.log(`Role selected: ${role}`);
    }

    initializeRoleData() {
        return {
            buyer: {
                hero: {
                    headline: "Discover Profitable DFW Auto Shops – <span class='text-emerald-400'>Matched to Your Criteria in Minutes</span>",
                    subtitle: "Tired of sifting through unqualified listings? Our AI connects you with verified sellers, plus free valuation tools to ensure you're getting a great deal.",
                    description: "Access exclusive buyer tools, financial analysis, and direct communication with pre-screened sellers ready to close fast.",
                    ctas: [
                        {
                            text: "Browse Verified Listings",
                            link: "/marketplace/listings.html?role=buyer",
                            style: "bg-blue-600 hover:bg-blue-700",
                            icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        },
                        {
                            text: "Get AI Matches",
                            link: "/auth/register.html?role=buyer",
                            style: "bg-emerald-600 hover:bg-emerald-700",
                            icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        }
                    ]
                },
                howItWorks: {
                    title: "How Buyers Find & Acquire Shops",
                    subtitle: "Our streamlined buyer process connects you with verified opportunities and guides you through every step of the acquisition."
                },
                whyChoose: {
                    title: "Why Buyers Choose Ardonie Capital",
                    subtitle: "We provide the tools, insights, and network you need to find and acquire profitable auto repair businesses with confidence."
                },
                featuredListings: {
                    title: "Featured Opportunities for Buyers",
                    subtitle: "Discover verified auto shops with detailed financials, seller motivation, and acquisition potential. Take our Buyer Quiz for personalized matches.",
                    quizText: "Buyer Match Quiz"
                },
                navigation: {
                    ctaText: "Start Buying"
                }
            },
            seller: {
                hero: {
                    headline: "Sell Your DFW Auto Shop Fast – <span class='text-emerald-400'>Reach Qualified Buyers in 34 Days</span>",
                    subtitle: "Overwhelmed by the selling process? List securely, get AI-matched buyers, and access free marketing plans to boost your asking price.",
                    description: "Connect with pre-qualified buyers, maximize your business value, and close deals faster with our Express Seller program.",
                    ctas: [
                        {
                            text: "List Your Shop Today",
                            link: "/marketplace/list-business.html?role=seller",
                            style: "bg-emerald-600 hover:bg-emerald-700",
                            icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        },
                        {
                            text: "Get Free Valuation",
                            link: "/tools/valuation-tool.html?role=seller",
                            style: "bg-blue-600 hover:bg-blue-700",
                            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        }
                    ]
                },
                howItWorks: {
                    title: "How Sellers Maximize Value & Close Fast",
                    subtitle: "Our proven seller process helps you prepare, market, and sell your auto repair business for maximum value in minimum time."
                },
                whyChoose: {
                    title: "Why Sellers Choose Ardonie Capital",
                    subtitle: "We connect you with serious, qualified buyers and provide the tools and support to maximize your business value and close quickly."
                },
                featuredListings: {
                    title: "Success Stories from Sellers",
                    subtitle: "See how other auto shop owners successfully sold their businesses through our platform. Join our Express Seller program for fast results.",
                    quizText: "Seller Readiness Quiz"
                },
                navigation: {
                    ctaText: "Start Selling"
                }
            },
            vendor: {
                hero: {
                    headline: "Grow Your Practice with DFW Auto Repair Deals – <span class='text-emerald-400'>Access Active Transactions</span>",
                    subtitle: "Looking to expand your client base? Partner with us to reach active buyers and sellers in the thriving DFW auto repair market.",
                    description: "Join our professional network of CPAs, attorneys, lenders, and consultants serving the auto repair acquisition market.",
                    ctas: [
                        {
                            text: "Join Partner Network",
                            link: "/vendor-portal/partner-application.html?role=vendor",
                            style: "bg-purple-600 hover:bg-purple-700",
                            icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        },
                        {
                            text: "View Active Deals",
                            link: "/vendor-portal/deal-pipeline.html?role=vendor",
                            style: "bg-blue-600 hover:bg-blue-700",
                            icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                        }
                    ]
                },
                howItWorks: {
                    title: "How Vendors Grow Through Our Network",
                    subtitle: "Our partner program connects professional service providers with active auto repair transactions and qualified referrals."
                },
                whyChoose: {
                    title: "Why Vendors Partner with Ardonie Capital",
                    subtitle: "Access a steady pipeline of qualified referrals and grow your practice by serving the thriving DFW auto repair market."
                },
                featuredListings: {
                    title: "Active Deal Pipeline for Vendors",
                    subtitle: "View current transactions seeking professional services. Connect with buyers and sellers who need your expertise.",
                    quizText: "Partner Match Quiz"
                },
                navigation: {
                    ctaText: "Join Network"
                }
            },
            general: {
                hero: {
                    headline: "Accelerate Your DFW Auto Repair Business Goals – <span class='text-emerald-400'>Close in as Little as 34 Days</span>",
                    subtitle: "The one-stop platform connecting serious buyers, sellers, and vendors. Find matches, access tools, and seal deals securely—all in one place.",
                    description: "Save time, reduce risks, and unlock opportunities with AI matchmaking, expert support, and integrated resources.",
                    ctas: [
                        {
                            text: "Browse All Opportunities",
                            link: "/marketplace/listings.html",
                            style: "bg-blue-600 hover:bg-blue-700",
                            icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        },
                        {
                            text: "Get Started Free",
                            link: "/auth/register.html",
                            style: "bg-emerald-600 hover:bg-emerald-700",
                            icon: "M13 7l5 5m0 0l-5 5m5-5H6"
                        }
                    ]
                },
                howItWorks: {
                    title: "How It Works",
                    subtitle: "Our streamlined process makes auto repair shop transactions faster, safer, and more efficient than ever before."
                },
                whyChoose: {
                    title: "Why Choose Ardonie Capital?",
                    subtitle: "We're revolutionizing auto repair shop transactions in DFW with industry expertise, technology, and a commitment to your success."
                },
                featuredListings: {
                    title: "Featured DFW Auto Shops",
                    subtitle: "Discover Express Seller listings ready for 34-day acquisition. Filter by your preferences or take our Quick Match Quiz for personalized recommendations.",
                    quizText: "Quick Match Quiz"
                },
                navigation: {
                    ctaText: "Get Started Free"
                }
            }
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedRoleSegmentation();
});
