/**
 * Role-Based Homepage Segmentation System
 * Complete homepage redesign with role selection as primary interface
 * Includes trust elements, urgency messaging, and ecosystem benefits
 */

class RoleSegmentation {
    constructor() {
        this.currentRole = this.getSavedRole();
        this.roleContent = this.initializeRoleContent();
        this.init();
    }

    init() {
        this.setupEventListeners();

        // Check if user has a saved role preference
        if (this.currentRole) {
            this.showRoleContent(this.currentRole);
        } else {
            this.showRoleSelection();
        }
    }

    setupEventListeners() {
        // Role selection cards
        const roleCards = document.querySelectorAll('.role-selection-card');
        roleCards.forEach(card => {
            card.addEventListener('click', (e) => {
                const role = e.currentTarget.dataset.role;
                if (role) {
                    this.selectRole(role);
                }
            });
        });

        // Back to selection button
        const backButton = document.getElementById('back-to-selection');
        if (backButton) {
            backButton.addEventListener('click', () => {
                this.showRoleSelection();
                this.clearSavedRole();
            });
        }

        // Escape key to go back to selection
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !document.getElementById('role-selection-screen').classList.contains('hidden')) {
                this.showRoleSelection();
            }
        });
    }

    showRoleSelection() {
        const selectionScreen = document.getElementById('role-selection-screen');
        const contentScreen = document.getElementById('role-specific-content');

        if (selectionScreen) {
            selectionScreen.classList.remove('hidden');
        }
        if (contentScreen) {
            contentScreen.classList.add('hidden');
        }

        // Hide navigation for clean role selection experience
        const navigation = document.querySelector('nav');
        if (navigation) {
            navigation.style.display = 'none';
        }
    }

    showRoleContent(role) {
        const selectionScreen = document.getElementById('role-selection-screen');
        const contentScreen = document.getElementById('role-specific-content');

        if (selectionScreen) {
            selectionScreen.classList.add('hidden');
        }
        if (contentScreen) {
            contentScreen.classList.remove('hidden');
        }

        // Show navigation
        const navigation = document.querySelector('nav');
        if (navigation) {
            navigation.style.display = 'block';
        }

        this.applyRoleContent(role);
    }

    initializeRoleContent() {
        return {
            buyer: {
                headline: "Discover Profitable DFW Auto Shops – Matched to Your Criteria in Minutes",
                description: "Tired of sifting through unqualified listings? Our AI connects you with verified sellers, plus free valuation tools to ensure you're getting a great deal.",
                ctaButtons: [
                    {
                        text: "Browse Listings Now",
                        href: "marketplace/listings.html",
                        primary: true
                    },
                    {
                        text: "Get Personalized Matches",
                        href: "auth/register.html",
                        primary: false
                    }
                ],
                dashboardIntro: {
                    subtitle: "Your personalized buyer dashboard",
                    title: "Smart Investment Tools & Deal Flow",
                    description: "Access AI-matched opportunities, financial analysis tools, and direct communication with verified sellers. Track your acquisition pipeline with real-time market insights."
                },
                features: [
                    {
                        icon: "search",
                        title: "AI-Powered Matching",
                        description: "Get connected with businesses that align with your investment goals, budget, and experience level."
                    },
                    {
                        icon: "shield",
                        title: "Verified Opportunities",
                        description: "All listings are pre-screened with financial verification, seller background checks, and due diligence support."
                    },
                    {
                        icon: "clock",
                        title: "34-Day Express Deals",
                        description: "Fast-track acquisitions with motivated sellers ready to close quickly through our Express Deal program."
                    },
                    {
                        icon: "users",
                        title: "Professional Network Access",
                        description: "Connect with vetted lenders, attorneys, and advisors who specialize in auto repair acquisitions."
                    }
                ]
            },
            seller: {
                headline: "Sell Your DFW Auto Shop Fast – Reach Qualified Buyers and Close in 34 Days",
                description: "Overwhelmed by the selling process? List securely, get AI-matched buyers, and access free marketing plans to boost your asking price.",
                ctaButtons: [
                    {
                        text: "List Your Shop Today",
                        href: "express-deal.html",
                        primary: true
                    },
                    {
                        text: "Get a Free Valuation",
                        href: "for-sellers.html",
                        primary: false
                    }
                ],
                dashboardIntro: {
                    subtitle: "Your seller command center",
                    title: "Maximize Your Business Value",
                    description: "Showcase your business to pre-qualified buyers, track inquiries in real-time, and manage the entire sale process. Our platform helps you achieve maximum value with minimum hassle."
                },
                features: [
                    {
                        icon: "trending-up",
                        title: "Maximum Valuation Tools",
                        description: "Our AI-powered valuation system and market insights help you price competitively for quick sale at top dollar."
                    },
                    {
                        icon: "shield",
                        title: "Pre-Qualified Buyers Only",
                        description: "All buyers are financially verified and background-checked for serious intent and capability to purchase."
                    },
                    {
                        icon: "clock",
                        title: "34-Day Express Program",
                        description: "Join our Express Seller program and connect with motivated buyers ready to close in just 34 days."
                    },
                    {
                        icon: "users",
                        title: "Full-Service Support Team",
                        description: "Access our network of legal, financial, and transaction professionals throughout the entire sale process."
                    }
                ]
            },
            financial: {
                headline: "Expand Your Practice – Connect with DFW Auto Deals and Clients Ready for Your Expertise",
                description: "Struggling to find qualified leads? Join our vendor network to access real-time transactions, share valuations, and earn referrals from buyers/sellers.",
                ctaButtons: [
                    {
                        text: "Become a Financial Partner",
                        href: "partner-with-us.html",
                        primary: true
                    },
                    {
                        text: "Access Deal Pipeline",
                        href: "vendor-portal/financial-institutions.html",
                        primary: false
                    }
                ],
                dashboardIntro: {
                    subtitle: "Your professional command center",
                    title: "Grow Your Financial Practice",
                    description: "Access 50+ active deals needing valuation, connect with 200+ buyers/sellers, and showcase your expertise to qualified transaction participants."
                },
                features: [
                    {
                        icon: "trending-up",
                        title: "Quality Lead Generation",
                        description: "Get matched with pre-qualified buyers and sellers who need CPA, broker, or financial advisory services."
                    },
                    {
                        icon: "shield",
                        title: "Verified Professional Network",
                        description: "Join a trusted network of licensed professionals with verified credentials and proven track records."
                    },
                    {
                        icon: "clock",
                        title: "Fast-Moving Express Deals",
                        description: "Work on 34-day Express Deals with accelerated timelines and motivated, serious participants."
                    },
                    {
                        icon: "users",
                        title: "Collaborative Deal Support",
                        description: "Co-broker deals, split commissions, and integrate your tools with our secure transaction platform."
                    }
                ]
            },
            legal: {
                headline: "Support Seamless DFW Acquisitions – Provide Legal/Consulting Expertise to Our Growing Network",
                description: "Looking to advise on more deals? Access our platform's secure document hub, match with clients needing NDAs or tax strategies, and build your referral base.",
                ctaButtons: [
                    {
                        text: "Join as a Legal Partner",
                        href: "partner-with-us.html",
                        primary: true
                    },
                    {
                        text: "Explore Vendor Opportunities",
                        href: "vendor-portal/legal-services.html",
                        primary: false
                    }
                ],
                dashboardIntro: {
                    subtitle: "Legal professional portal",
                    title: "Expand Your Legal Practice",
                    description: "Access secure deal rooms with encrypted NDAs, connect with clients needing legal expertise, and build relationships with serious transaction participants."
                },
                features: [
                    {
                        icon: "briefcase",
                        title: "Specialized Legal Referrals",
                        description: "Get connected with buyers and sellers who need business attorneys, tax professionals, or industry consultants."
                    },
                    {
                        icon: "shield",
                        title: "Secure Document Platform",
                        description: "Access bank-level encrypted deal rooms with NDA templates and real-time collaboration tools."
                    },
                    {
                        icon: "clock",
                        title: "Express Deal Support",
                        description: "Provide legal support for 34-day Express Deals with streamlined documentation and accelerated closings."
                    },
                    {
                        icon: "users",
                        title: "Professional Networking",
                        description: "Attend virtual mixers, integrate your calendar for consultations, and collaborate with other professionals."
                    }
                ]
            },
            general: {
                selectorText: "I'm exploring options",
                headline: "Time is money.",
                description: "Connect, negotiate, and close securely with serious Business Buyers and Sellers on one platform.",
                ctaButtons: [
                    {
                        text: "How We Do It",
                        href: "how-it-works.html",
                        primary: false
                    },
                    {
                        text: "Start Your Deal",
                        href: "express-deal.html",
                        primary: true
                    }
                ],
                dashboardIntro: {
                    subtitle: "See how our platform works",
                    title: "Professional Dashboard Experience",
                    description: "Get instant access to market insights, buyer connections, and deal management tools designed specifically for DFW auto repair shop transactions."
                },
                features: [
                    {
                        icon: "zap",
                        title: "Intelligent Matchmaking",
                        description: "Our AI-powered algorithm connects you with the perfect business opportunities based on your criteria."
                    },
                    {
                        icon: "clipboard",
                        title: "Integrated Tools",
                        description: "Access legal, financial, and due diligence tools all in one platform to streamline your acquisition process."
                    },
                    {
                        icon: "shield",
                        title: "Secure Transactions",
                        description: "Bank-level security with encrypted communications and verified user profiles for peace of mind."
                    },
                    {
                        icon: "users",
                        title: "Expert Support",
                        description: "Get guidance from industry professionals who understand the auto repair business inside and out."
                    }
                ]
            }
        };
    }

    selectRole(role) {
        this.currentRole = role;
        this.saveRole(role);
        this.showRoleContent(role);

        // Smooth transition effect
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Add entrance animation
        setTimeout(() => {
            const contentScreen = document.getElementById('role-specific-content');
            if (contentScreen) {
                contentScreen.style.opacity = '0';
                contentScreen.style.transform = 'translateY(20px)';
                contentScreen.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

                setTimeout(() => {
                    contentScreen.style.opacity = '1';
                    contentScreen.style.transform = 'translateY(0)';
                }, 100);
            }
        }, 100);
    }

    applyRoleContent(role) {
        const content = this.roleContent[role];
        if (!content) return;

        // Add smooth transition class
        document.body.classList.add('role-transitioning');

        // Update headline with fade effect
        const headline = document.getElementById('hero-headline');
        if (headline) {
            headline.style.opacity = '0';
            setTimeout(() => {
                headline.textContent = content.headline;
                headline.style.opacity = '1';
            }, 150);
        }

        // Update description with fade effect
        const description = document.getElementById('hero-description');
        if (description) {
            description.style.opacity = '0';
            setTimeout(() => {
                description.textContent = content.description;
                description.style.opacity = '1';
            }, 200);
        }

        // Update CTA buttons
        setTimeout(() => this.updateCTAButtons(content.ctaButtons), 100);

        // Update dashboard intro
        setTimeout(() => this.updateDashboardIntro(content.dashboardIntro), 150);

        // Update features section
        setTimeout(() => this.updateFeaturesSection(content.features), 200);

        // Remove transition class after animations complete
        setTimeout(() => {
            document.body.classList.remove('role-transitioning');
        }, 500);
    }

    updateCTAButtons(buttons) {
        const container = document.getElementById('hero-cta-buttons');
        if (!container || !buttons) return;

        container.innerHTML = buttons.map(button => `
            <button type="button" onclick="window.location.href='${button.href}'" 
                    class="inline-flex items-center px-8 py-4 ${button.primary 
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg hover:shadow-xl' 
                        : 'border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm'
                    } font-semibold rounded-full transition-all duration-300">
                ${button.text}
                ${button.primary ? '' : `
                    <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                `}
            </button>
        `).join('');
    }

    updateDashboardIntro(intro) {
        const container = document.getElementById('dashboard-intro');
        if (!container || !intro) return;

        container.innerHTML = `
            <p class="text-lg text-slate-300 mb-4">${intro.subtitle}</p>
            <h3 class="text-2xl md:text-3xl font-bold text-white mb-2">${intro.title}</h3>
            <p class="text-slate-400 max-w-2xl mx-auto">${intro.description}</p>
        `;
    }

    updateFeaturesSection(features) {
        const grid = document.getElementById('features-grid');
        const title = document.getElementById('features-title');
        const subtitle = document.getElementById('features-subtitle');

        if (!grid || !features) return;

        // Update section title and subtitle based on role
        const roleTitles = {
            buyer: "Why Buyers Choose Ardonie Capital",
            seller: "Why Sellers Trust Ardonie Capital",
            vendor: "Why Professionals Partner With Us",
            general: "Why Ardonie Capital?"
        };

        const roleSubtitles = {
            buyer: "We provide the tools, connections, and support you need to find and acquire the perfect auto repair business.",
            seller: "Our platform maximizes your business value while ensuring a smooth, secure transaction process.",
            vendor: "Join our trusted network of professionals and grow your practice with quality referrals.",
            general: "We're revolutionizing auto repair shop transactions in DFW with industry expertise, technology, and a commitment to your success."
        };

        if (title) title.textContent = roleTitles[this.currentRole] || roleTitles.general;
        if (subtitle) subtitle.textContent = roleSubtitles[this.currentRole] || roleSubtitles.general;

        // Generate feature cards
        grid.innerHTML = features.map(feature => `
            <div class="bg-secondary-light dark:bg-slate-800 rounded-lg p-6 text-center">
                <div class="inline-flex items-center justify-center w-16 h-16 bg-primary-dark dark:bg-primary rounded-full text-white mb-4">
                    ${this.getFeatureIcon(feature.icon)}
                </div>
                <h3 class="text-xl font-semibold mb-2 text-slate-900 dark:text-white">${feature.title}</h3>
                <p class="text-slate-600 dark:text-slate-300">${feature.description}</p>
            </div>
        `).join('');
    }

    getFeatureIcon(iconName) {
        const icons = {
            search: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>',
            shield: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>',
            clock: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
            users: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>',
            'trending-up': '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>',
            briefcase: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v6a2 2 0 01-2 2H10a2 2 0 01-2-2V6m8 0H8" /></svg>',
            zap: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>',
            clipboard: '<svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>'
        };
        return icons[iconName] || icons.zap;
    }



    saveRole(role) {
        try {
            localStorage.setItem('ardonie_user_role', role);
            // Also set a cookie for server-side detection if needed
            document.cookie = `ardonie_role=${role}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
        } catch (error) {
            console.warn('Could not save role preference:', error);
        }
    }

    getSavedRole() {
        try {
            return localStorage.getItem('ardonie_user_role');
        } catch (error) {
            console.warn('Could not retrieve saved role:', error);
            return null;
        }
    }

    clearSavedRole() {
        try {
            localStorage.removeItem('ardonie_user_role');
            document.cookie = 'ardonie_role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            this.currentRole = null;
        } catch (error) {
            console.warn('Could not clear role preference:', error);
        }
    }
}

// Initialize role segmentation when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.roleSegmentation = new RoleSegmentation();
});
