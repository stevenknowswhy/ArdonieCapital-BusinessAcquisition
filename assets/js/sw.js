/**
 * Service Worker for Ardonie Capital
 * Implements advanced caching strategies for optimal performance
 */

const CACHE_NAME = 'ardonie-capital-v1.0.0';
const STATIC_CACHE = 'ardonie-static-v1.0.0';
const DYNAMIC_CACHE = 'ardonie-dynamic-v1.0.0';
const API_CACHE = 'ardonie-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/marketplace/listings.html',
    '/dashboard/buyer-dashboard.html',
    '/dashboard/seller-dashboard.html',
    '/auth/login.html',
    '/auth/register.html',
    '/about.html',
    '/contact.html',
    '/how-it-works.html',
    
    // Critical CSS and JS
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    
    // Core modular features
    '/src/features/authentication/index.js',
    '/src/features/marketplace/index.js',
    '/src/features/dashboard/index.js',
    '/src/shared/index.js',
    
    // Critical images
    '/assets/images/logo.png',
    '/assets/images/favicon.ico'
];

// API endpoints to cache
const API_ENDPOINTS = [
    '/api/marketplace/listings',
    '/api/dashboard/stats',
    '/api/auth/profile'
];

// Install event - cache static assets
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        Promise.all([
            // Cache static assets
            caches.open(STATIC_CACHE).then(cache => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            }),
            
            // Skip waiting to activate immediately
            self.skipWaiting()
        ])
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        Promise.all([
            // Clean up old caches
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== API_CACHE) {
                            console.log('Service Worker: Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            
            // Take control of all clients
            self.clients.claim()
        ])
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Handle different types of requests
    if (url.pathname.startsWith('/api/')) {
        // API requests - Network First with cache fallback
        event.respondWith(handleApiRequest(request));
    } else if (isStaticAsset(request)) {
        // Static assets - Cache First
        event.respondWith(handleStaticAsset(request));
    } else if (isNavigationRequest(request)) {
        // Navigation requests - Network First with offline fallback
        event.respondWith(handleNavigationRequest(request));
    } else {
        // Other requests - Stale While Revalidate
        event.respondWith(handleDynamicRequest(request));
    }
});

/**
 * Handle API requests with Network First strategy
 */
async function handleApiRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful responses
            const cache = await caches.open(API_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('Service Worker: Serving API from cache:', request.url);
            return cachedResponse;
        }
        
        // Return error response
        return new Response(
            JSON.stringify({ error: 'Network unavailable', offline: true }),
            { 
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

/**
 * Handle static assets with Cache First strategy
 */
async function handleStaticAsset(request) {
    // Check cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        // Fetch from network and cache
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Service Worker: Failed to fetch static asset:', request.url);
        return new Response('Asset not available offline', { status: 404 });
    }
}

/**
 * Handle navigation requests with Network First strategy
 */
async function handleNavigationRequest(request) {
    try {
        // Try network first
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Cache successful navigation responses
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
            return networkResponse;
        }
        
        throw new Error('Network response not ok');
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('Service Worker: Serving navigation from cache:', request.url);
            return cachedResponse;
        }
        
        // Fallback to offline page
        const offlinePage = await caches.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
        
        // Last resort - basic offline response
        return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Offline - Ardonie Capital</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                    .offline-message { max-width: 400px; margin: 0 auto; }
                    .retry-btn { 
                        background: #3b82f6; color: white; padding: 10px 20px; 
                        border: none; border-radius: 5px; cursor: pointer; margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="offline-message">
                    <h1>You're Offline</h1>
                    <p>Please check your internet connection and try again.</p>
                    <button class="retry-btn" onclick="window.location.reload()">Retry</button>
                </div>
            </body>
            </html>
        `, {
            status: 200,
            headers: { 'Content-Type': 'text/html' }
        });
    }
}

/**
 * Handle dynamic requests with Stale While Revalidate strategy
 */
async function handleDynamicRequest(request) {
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    // Fetch from network in background
    const networkPromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => null);
    
    // Return cached version immediately if available
    if (cachedResponse) {
        // Update cache in background
        networkPromise;
        return cachedResponse;
    }
    
    // Wait for network if no cache
    return networkPromise || new Response('Resource not available', { status: 404 });
}

/**
 * Check if request is for a static asset
 */
function isStaticAsset(request) {
    const url = new URL(request.url);
    return url.pathname.includes('/assets/') ||
           url.pathname.includes('/src/') ||
           url.pathname.endsWith('.js') ||
           url.pathname.endsWith('.css') ||
           url.pathname.endsWith('.png') ||
           url.pathname.endsWith('.jpg') ||
           url.pathname.endsWith('.jpeg') ||
           url.pathname.endsWith('.gif') ||
           url.pathname.endsWith('.svg') ||
           url.pathname.endsWith('.webp') ||
           url.hostname === 'cdn.tailwindcss.com' ||
           url.hostname === 'fonts.googleapis.com';
}

/**
 * Check if request is a navigation request
 */
function isNavigationRequest(request) {
    return request.mode === 'navigate' || 
           (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        console.log('Service Worker: Background sync triggered');
        event.waitUntil(handleBackgroundSync());
    }
});

/**
 * Handle background sync for offline actions
 */
async function handleBackgroundSync() {
    // Handle any queued offline actions
    const offlineActions = await getOfflineActions();
    
    for (const action of offlineActions) {
        try {
            await fetch(action.url, action.options);
            await removeOfflineAction(action.id);
            console.log('Service Worker: Synced offline action:', action.id);
        } catch (error) {
            console.log('Service Worker: Failed to sync action:', action.id, error);
        }
    }
}

/**
 * Get offline actions from IndexedDB (placeholder)
 */
async function getOfflineActions() {
    // In a real implementation, this would read from IndexedDB
    return [];
}

/**
 * Remove offline action from IndexedDB (placeholder)
 */
async function removeOfflineAction(id) {
    // In a real implementation, this would remove from IndexedDB
    console.log('Removing offline action:', id);
}

// Push notification handling
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/images/icon-192.png',
            badge: '/assets/images/badge-72.png',
            data: data.data,
            actions: [
                {
                    action: 'view',
                    title: 'View',
                    icon: '/assets/images/view-icon.png'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss',
                    icon: '/assets/images/dismiss-icon.png'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Notification click handling
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url || '/')
        );
    }
});

console.log('Service Worker: Loaded successfully');
