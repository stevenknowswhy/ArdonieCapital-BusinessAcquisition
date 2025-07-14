/**
 * Conversion Optimization System
 * Implements exit-intent popups, urgency timers, and behavioral tracking
 */

class ConversionOptimization {
    constructor() {
        this.hasShownExitIntent = false;
        this.userEngagement = {
            timeOnPage: 0,
            scrollDepth: 0,
            ctaClicks: 0,
            pageViews: 1
        };
        this.init();
    }

    init() {
        this.trackUserEngagement();
        this.setupExitIntentDetection();
        this.setupScrollTracking();
        this.setupCTATracking();
        this.setupUrgencyTimers();
        this.setupSocialProofUpdates();
    }

    trackUserEngagement() {
        // Track time on page
        this.startTime = Date.now();
        setInterval(() => {
            this.userEngagement.timeOnPage = Math.floor((Date.now() - this.startTime) / 1000);
        }, 1000);

        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseEngagementTracking();
            } else {
                this.resumeEngagementTracking();
            }
        });
    }

    setupExitIntentDetection() {
        let exitIntentTriggered = false;
        
        document.addEventListener('mouseleave', (e) => {
            // Only trigger if mouse leaves from the top of the page
            if (e.clientY <= 0 && !exitIntentTriggered && !this.hasShownExitIntent) {
                exitIntentTriggered = true;
                
                // Delay to avoid false positives
                setTimeout(() => {
                    if (!this.hasShownExitIntent && this.shouldShowExitIntent()) {
                        this.showExitIntentPopup();
                    }
                    exitIntentTriggered = false;
                }, 100);
            }
        });

        // Mobile exit intent (scroll to top quickly)
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY < lastScrollY - 100 && currentScrollY < 100 && !this.hasShownExitIntent) {
                if (this.shouldShowExitIntent()) {
                    this.showExitIntentPopup();
                }
            }
            lastScrollY = currentScrollY;
        });
    }

    shouldShowExitIntent() {
        // Show exit intent if user has been on page for at least 30 seconds
        // and hasn't clicked any CTAs
        return this.userEngagement.timeOnPage >= 30 && 
               this.userEngagement.ctaClicks === 0 &&
               this.userEngagement.scrollDepth >= 25;
    }

    showExitIntentPopup() {
        this.hasShownExitIntent = true;
        
        const popup = document.createElement('div');
        popup.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 exit-intent-popup';
        popup.innerHTML = `
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 max-w-lg w-full transform scale-95 opacity-0 transition-all duration-300">
                <div class="text-center">
                    <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <h3 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Wait! Don't Miss Out</h3>
                    <p class="text-lg text-slate-600 dark:text-slate-300 mb-6">
                        Before you go, grab our <strong>FREE Auto Shop Buyer's Guide</strong> - the same resource that helped 500+ buyers find their perfect match.
                    </p>
                    
                    <!-- Special Offer -->
                    <div class="bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 rounded-xl p-6 mb-6 border border-emerald-200 dark:border-emerald-800">
                        <h4 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">🎁 Exclusive Bonus</h4>
                        <p class="text-slate-700 dark:text-slate-300 text-sm">
                            Plus get instant access to our private DFW Auto Shop Market Report (normally $97)
                        </p>
                    </div>
                    
                    <form id="exit-intent-form" class="space-y-4 mb-6">
                        <input type="email" placeholder="Enter your email for instant access" required 
                               class="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white">
                        <button type="submit" class="w-full bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-600 hover:to-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200">
                            Get My Free Guide + Bonus Report
                        </button>
                    </form>
                    
                    <div class="flex justify-center space-x-4 text-sm">
                        <button type="button" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200" onclick="this.closest('.exit-intent-popup').remove()">
                            No thanks, I'll figure it out myself
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        // Animate in
        setTimeout(() => {
            const content = popup.querySelector('div > div');
            content.classList.remove('scale-95', 'opacity-0');
            content.classList.add('scale-100', 'opacity-100');
        }, 50);
        
        // Handle form submission
        popup.querySelector('#exit-intent-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const email = e.target.querySelector('input[type="email"]').value;
            this.handleExitIntentSignup(email);
            popup.remove();
        });
        
        // Close on backdrop click
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                popup.remove();
            }
        });
        
        // Track exit intent popup shown
        this.trackEvent('exit_intent_popup_shown');
    }

    handleExitIntentSignup(email) {
        // Show success message
        this.showToast('Success! Check your email for the free guide and bonus report.', 'success');
        
        // Track conversion
        this.trackEvent('exit_intent_conversion', { email });
        
        // TODO: Integrate with email service
        console.log('Exit intent signup:', email);
    }

    setupScrollTracking() {
        let maxScroll = 0;
        
        window.addEventListener('scroll', () => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                this.userEngagement.scrollDepth = maxScroll;
                
                // Track milestone scrolls
                if (maxScroll >= 25 && !this.scrollMilestones?.quarter) {
                    this.trackEvent('scroll_25_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, quarter: true };
                }
                if (maxScroll >= 50 && !this.scrollMilestones?.half) {
                    this.trackEvent('scroll_50_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, half: true };
                }
                if (maxScroll >= 75 && !this.scrollMilestones?.threeQuarter) {
                    this.trackEvent('scroll_75_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, threeQuarter: true };
                }
                if (maxScroll >= 90 && !this.scrollMilestones?.near_complete) {
                    this.trackEvent('scroll_90_percent');
                    this.scrollMilestones = { ...this.scrollMilestones, near_complete: true };
                }
            }
        });
    }

    setupCTATracking() {
        // Track all CTA clicks
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (!target) return;
            
            const href = target.href || target.getAttribute('data-href');
            const text = target.textContent.trim();
            
            // Identify CTAs by common patterns
            if (this.isCTA(target, text, href)) {
                this.userEngagement.ctaClicks++;
                this.trackEvent('cta_click', {
                    text,
                    href,
                    position: this.getCTAPosition(target)
                });
            }
        });
    }

    isCTA(element, text, href) {
        const ctaPatterns = [
            /get started/i,
            /sign up/i,
            /register/i,
            /join/i,
            /try/i,
            /demo/i,
            /contact/i,
            /schedule/i,
            /download/i,
            /free/i
        ];
        
        const ctaClasses = ['btn', 'cta', 'button'];
        const hasCtaClass = ctaClasses.some(cls => element.className.includes(cls));
        const hasCtaText = ctaPatterns.some(pattern => pattern.test(text));
        const hasCtaHref = href && (href.includes('register') || href.includes('contact') || href.includes('demo'));
        
        return hasCtaClass || hasCtaText || hasCtaHref;
    }

    getCTAPosition(element) {
        const rect = element.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        if (rect.top < viewportHeight * 0.33) return 'above_fold';
        if (rect.top < viewportHeight * 0.66) return 'middle_fold';
        return 'below_fold';
    }

    setupUrgencyTimers() {
        // Add countdown timers to urgency elements
        const urgencyElements = document.querySelectorAll('[data-urgency-timer]');
        
        urgencyElements.forEach(element => {
            const duration = parseInt(element.dataset.urgencyTimer) || 3600; // Default 1 hour
            this.startCountdown(element, duration);
        });
    }

    startCountdown(element, seconds) {
        const endTime = Date.now() + (seconds * 1000);
        
        const updateTimer = () => {
            const remaining = Math.max(0, endTime - Date.now());
            const minutes = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            
            element.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;
            
            if (remaining > 0) {
                setTimeout(updateTimer, 1000);
            } else {
                element.textContent = 'Expired';
                element.classList.add('text-red-500');
            }
        };
        
        updateTimer();
    }

    setupSocialProofUpdates() {
        // Periodically update social proof numbers
        setInterval(() => {
            this.updateSocialProofNumbers();
        }, 30000); // Every 30 seconds
    }

    updateSocialProofNumbers() {
        const socialProofElements = document.querySelectorAll('[data-social-proof]');
        
        socialProofElements.forEach(element => {
            const type = element.dataset.socialProof;
            const currentValue = parseInt(element.textContent.replace(/\D/g, ''));
            
            if (type === 'users' && Math.random() < 0.3) {
                // Occasionally increment user count
                element.textContent = element.textContent.replace(currentValue, currentValue + 1);
            }
        });
    }

    trackEvent(eventName, data = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', eventName, {
                ...data,
                time_on_page: this.userEngagement.timeOnPage,
                scroll_depth: this.userEngagement.scrollDepth,
                cta_clicks: this.userEngagement.ctaClicks
            });
        }
        
        // Console logging for development
        console.log('Conversion Event:', eventName, data);
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        toast.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Remove after 4 seconds
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    pauseEngagementTracking() {
        this.pausedTime = Date.now();
    }

    resumeEngagementTracking() {
        if (this.pausedTime) {
            const pauseDuration = Date.now() - this.pausedTime;
            this.startTime += pauseDuration;
            this.pausedTime = null;
        }
    }
}

// Initialize conversion optimization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ConversionOptimization();
});

// Add urgency timer data attributes to elements that need them
document.addEventListener('DOMContentLoaded', () => {
    // Add timer to limited time offers
    const limitedTimeElements = document.querySelectorAll('.limited-time-offer');
    limitedTimeElements.forEach(element => {
        if (!element.dataset.urgencyTimer) {
            element.dataset.urgencyTimer = '3600'; // 1 hour
        }
    });
});
