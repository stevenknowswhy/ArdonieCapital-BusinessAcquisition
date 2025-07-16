/**
 * Homepage UI/UX Enhancements
 * Adds interactive behaviors and animations to improve user experience
 */

class HomepageEnhancements {
    constructor() {
        this.init();
    }

    init() {
        this.addScrollAnimations();
        this.addHoverEffects();
        this.addCounterAnimations();
        this.addParallaxEffects();
        this.addLoadingStates();
    }

    // Add scroll-triggered animations (excluding hero section to prevent conflicts)
    addScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                // CRITICAL FIX: Skip hero section to prevent conflicts
                if (entry.target.id === 'hero-section' || entry.target.closest('#hero-section')) {
                    return;
                }

                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');

                    // Add staggered animation for child elements
                    const children = entry.target.querySelectorAll('.role-card-enhanced, .feature-card-enhanced, .testimonial-enhanced');
                    children.forEach((child, index) => {
                        setTimeout(() => {
                            child.classList.add('slide-up');
                        }, index * 100);
                    });
                }
            });
        }, observerOptions);

        // Observe elements for animation
        const animatedElements = document.querySelectorAll('.role-selection-card, .feature-card-enhanced, .testimonial-enhanced, .stat-enhanced');
        animatedElements.forEach(el => observer.observe(el));
    }

    // Add enhanced hover effects
    addHoverEffects() {
        // Role cards enhanced interactions
        const roleCards = document.querySelectorAll('.role-selection-card');
        roleCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.addRippleEffect(card);
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Feature cards interactions
        const featureCards = document.querySelectorAll('.feature-card-enhanced');
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                const icon = card.querySelector('.feature-icon-enhanced');
                if (icon) {
                    icon.style.transform = 'scale(1.1) rotate(5deg)';
                }
            });

            card.addEventListener('mouseleave', () => {
                const icon = card.querySelector('.feature-icon-enhanced');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });
    }

    // Add ripple effect to buttons and cards
    addRippleEffect(element) {
        const ripple = document.createElement('div');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.pointerEvents = 'none';

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.marginLeft = -size / 2 + 'px';
        ripple.style.marginTop = -size / 2 + 'px';

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Animate counters when they come into view
    addCounterAnimations() {
        const counters = document.querySelectorAll('.stat-number-enhanced');
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                    counterObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    animateCounter(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/[^0-9]/g, ''));
        const suffix = text.replace(/[0-9]/g, '');
        
        let current = 0;
        const increment = number / 50;
        const timer = setInterval(() => {
            current += increment;
            if (current >= number) {
                element.textContent = text;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + suffix;
            }
        }, 30);
    }

    // Add subtle parallax effects
    addParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.hero-title-enhanced, .hero-subtitle-enhanced');
            
            parallaxElements.forEach(element => {
                const speed = 0.5;
                element.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });
    }

    // Add loading states and skeleton screens
    addLoadingStates() {
        // Add loading shimmer to images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (!img.complete) {
                img.style.background = 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)';
                img.style.backgroundSize = '200% 100%';
                img.style.animation = 'shimmer 1.5s infinite';
                
                img.addEventListener('load', () => {
                    img.style.background = 'none';
                    img.style.animation = 'none';
                });
            }
        });
    }

    // Add smooth scrolling to anchor links
    addSmoothScrolling() {
        const links = document.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Add keyboard navigation enhancements
    addKeyboardNavigation() {
        const roleCards = document.querySelectorAll('.role-selection-card');
        roleCards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    card.click();
                }
                
                // Arrow key navigation
                if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                    e.preventDefault();
                    const nextCard = roleCards[index + 1] || roleCards[0];
                    nextCard.focus();
                }
                
                if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                    e.preventDefault();
                    const prevCard = roleCards[index - 1] || roleCards[roleCards.length - 1];
                    prevCard.focus();
                }
            });
        });
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes shimmer {
        0% {
            background-position: -200% 0;
        }
        100% {
            background-position: 200% 0;
        }
    }
    
    .fade-in {
        animation: fadeIn 0.6s ease-out forwards;
    }
    
    .slide-up {
        animation: slideUp 0.6s ease-out forwards;
    }
`;
document.head.appendChild(style);

// Initialize enhancements when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HomepageEnhancements();
});

// Add performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`Homepage loaded in ${loadTime}ms`);
    });
}
