/**
 * Service Worker Registration
 * Registers the service worker and handles updates
 */

class ServiceWorkerManager {
    constructor() {
        this.swRegistration = null;
        this.isUpdateAvailable = false;
    }

    /**
     * Initialize service worker
     */
    async init() {
        if ('serviceWorker' in navigator) {
            try {
                console.log('🔧 Registering Service Worker...');
                
                this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                });

                console.log('✅ Service Worker registered successfully');

                // Handle updates
                this.handleUpdates();

                // Handle installation
                this.handleInstallation();

                // Handle messages from service worker
                this.handleMessages();

                return this.swRegistration;
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error);
            }
        } else {
            console.log('ℹ️ Service Worker not supported in this browser');
        }
    }

    /**
     * Handle service worker updates
     */
    handleUpdates() {
        if (!this.swRegistration) return;

        this.swRegistration.addEventListener('updatefound', () => {
            const newWorker = this.swRegistration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    this.isUpdateAvailable = true;
                    this.showUpdateNotification();
                }
            });
        });

        // Listen for controlling service worker changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            window.location.reload();
        });
    }

    /**
     * Handle service worker installation
     */
    handleInstallation() {
        // Show install prompt for PWA
        let deferredPrompt;

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            this.showInstallPrompt(deferredPrompt);
        });

        window.addEventListener('appinstalled', () => {
            console.log('✅ PWA installed successfully');
            this.hideInstallPrompt();
        });
    }

    /**
     * Handle messages from service worker
     */
    handleMessages() {
        navigator.serviceWorker.addEventListener('message', (event) => {
            const { type, payload } = event.data;

            switch (type) {
                case 'CACHE_UPDATED':
                    console.log('📦 Cache updated:', payload);
                    break;
                case 'OFFLINE_READY':
                    this.showOfflineReadyNotification();
                    break;
                case 'BACKGROUND_SYNC':
                    console.log('🔄 Background sync completed');
                    break;
            }
        });
    }

    /**
     * Show update notification
     */
    showUpdateNotification() {
        const notification = document.createElement('div');
        notification.id = 'sw-update-notification';
        notification.className = 'fixed top-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center justify-between">
                <div>
                    <h4 class="font-semibold">Update Available</h4>
                    <p class="text-sm opacity-90">A new version is ready to install.</p>
                </div>
                <button id="sw-update-btn" class="ml-4 bg-white text-blue-600 px-3 py-1 rounded text-sm font-medium hover:bg-gray-100">
                    Update
                </button>
            </div>
            <button id="sw-dismiss-btn" class="absolute top-2 right-2 text-white opacity-70 hover:opacity-100">
                ×
            </button>
        `;

        document.body.appendChild(notification);

        // Handle update button click
        document.getElementById('sw-update-btn').addEventListener('click', () => {
            this.applyUpdate();
        });

        // Handle dismiss button click
        document.getElementById('sw-dismiss-btn').addEventListener('click', () => {
            notification.remove();
        });

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    /**
     * Show offline ready notification
     */
    showOfflineReadyNotification() {
        const notification = document.createElement('div');
        notification.className = 'fixed bottom-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
        notification.innerHTML = `
            <div class="flex items-center">
                <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                <div>
                    <h4 class="font-semibold">Ready for Offline</h4>
                    <p class="text-sm opacity-90">App cached and ready to work offline.</p>
                </div>
            </div>
        `;

        document.body.appendChild(notification);

        // Auto-dismiss after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Show install prompt for PWA
     */
    showInstallPrompt(deferredPrompt) {
        const installBanner = document.createElement('div');
        installBanner.id = 'pwa-install-banner';
        installBanner.className = 'fixed bottom-0 left-0 right-0 bg-primary text-white p-4 z-50 transform translate-y-full transition-transform duration-300';
        installBanner.innerHTML = `
            <div class="container mx-auto flex items-center justify-between">
                <div class="flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                    <div>
                        <h4 class="font-semibold">Install Ardonie Capital</h4>
                        <p class="text-sm opacity-90">Get the app for faster access and offline features.</p>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button id="pwa-install-btn" class="bg-white text-primary px-4 py-2 rounded font-medium hover:bg-gray-100">
                        Install
                    </button>
                    <button id="pwa-dismiss-btn" class="text-white opacity-70 hover:opacity-100 px-2">
                        ×
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(installBanner);

        // Show banner with animation
        setTimeout(() => {
            installBanner.classList.remove('translate-y-full');
        }, 100);

        // Handle install button click
        document.getElementById('pwa-install-btn').addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log('PWA install outcome:', outcome);
                deferredPrompt = null;
                this.hideInstallPrompt();
            }
        });

        // Handle dismiss button click
        document.getElementById('pwa-dismiss-btn').addEventListener('click', () => {
            this.hideInstallPrompt();
        });
    }

    /**
     * Hide install prompt
     */
    hideInstallPrompt() {
        const banner = document.getElementById('pwa-install-banner');
        if (banner) {
            banner.classList.add('translate-y-full');
            setTimeout(() => {
                banner.remove();
            }, 300);
        }
    }

    /**
     * Apply service worker update
     */
    applyUpdate() {
        if (this.swRegistration && this.swRegistration.waiting) {
            this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    /**
     * Check for updates manually
     */
    async checkForUpdates() {
        if (this.swRegistration) {
            try {
                await this.swRegistration.update();
                console.log('🔄 Checked for service worker updates');
            } catch (error) {
                console.error('❌ Failed to check for updates:', error);
            }
        }
    }

    /**
     * Get cache status
     */
    async getCacheStatus() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            const cacheStatus = {};

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                cacheStatus[cacheName] = keys.length;
            }

            return cacheStatus;
        }
        return {};
    }

    /**
     * Clear all caches
     */
    async clearCaches() {
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
            console.log('🗑️ All caches cleared');
        }
    }
}

// Initialize service worker manager
const swManager = new ServiceWorkerManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => swManager.init());
} else {
    swManager.init();
}

// Make available globally
window.swManager = swManager;

// Check for updates every 30 minutes
setInterval(() => {
    swManager.checkForUpdates();
}, 30 * 60 * 1000);

export default ServiceWorkerManager;
