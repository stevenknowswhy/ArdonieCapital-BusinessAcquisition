/**
 * Global Avatar Manager
 * Manages avatar display and updates across all pages in BuyMartV1
 */

class GlobalAvatarManager {
    constructor() {
        this.supabaseClient = null;
        this.currentUser = null;
        this.avatarCache = new Map();
        this.isInitialized = false;
    }

    /**
     * Initialize the global avatar manager
     */
    async init() {
        if (this.isInitialized) return;

        console.log('🖼️ Global Avatar Manager: Initializing...');

        try {
            // Initialize Supabase if available
            if (typeof window.supabase !== 'undefined') {
                const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
                const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';
                
                this.supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);
                console.log('✅ Global Avatar Manager: Supabase client initialized');
            }

            // Set up event listeners
            this.setupEventListeners();

            // Load current user
            this.loadCurrentUser();

            this.isInitialized = true;
            console.log('✅ Global Avatar Manager: Initialization complete');

        } catch (error) {
            console.error('❌ Global Avatar Manager: Initialization failed:', error);
        }
    }

    /**
     * Set up event listeners for avatar updates
     */
    setupEventListeners() {
        // Listen for avatar update events
        document.addEventListener('avatarUpdated', (event) => {
            console.log('📡 Global Avatar Manager: Received avatarUpdated event');
            this.handleAvatarUpdate(event.detail);
        });

        // Listen for profile update events
        document.addEventListener('profileUpdated', (event) => {
            console.log('📡 Global Avatar Manager: Received profileUpdated event');
            if (event.detail.type === 'avatar') {
                this.handleAvatarUpdate(event.detail);
            }
        });

        // Listen for auth state changes
        document.addEventListener('authStateChanged', (event) => {
            console.log('📡 Global Avatar Manager: Auth state changed');
            this.loadCurrentUser();
        });
    }

    /**
     * Load current user from session storage
     */
    loadCurrentUser() {
        try {
            const user = localStorage.getItem('ardonie_user_session') || sessionStorage.getItem('ardonie_current_user');
            if (user) {
                this.currentUser = JSON.parse(user);
                console.log('👤 Global Avatar Manager: Current user loaded:', this.currentUser.id);
            } else {
                this.currentUser = null;
                console.log('👤 Global Avatar Manager: No current user');
            }
        } catch (error) {
            console.error('❌ Global Avatar Manager: Failed to load current user:', error);
            this.currentUser = null;
        }
    }

    /**
     * Handle avatar update events
     */
    handleAvatarUpdate(detail) {
        const { avatarUrl, userId } = detail;
        
        if (userId) {
            // Update cache
            this.avatarCache.set(userId, avatarUrl);
            console.log(`🔄 Global Avatar Manager: Updated cache for user ${userId}`);
        }

        // Update navigation if it exists
        if (window.ArdonieNavigation && typeof window.ArdonieNavigation.refreshUserAvatar === 'function') {
            console.log('🔄 Global Avatar Manager: Updating navigation avatar');
            window.ArdonieNavigation.refreshUserAvatar();
        } else {
            console.log('⚠️ Global Avatar Manager: Navigation not available for avatar update');
        }

        // Update any other avatar displays on the page
        this.updatePageAvatars(avatarUrl);
    }

    /**
     * Update avatar displays on the current page
     */
    updatePageAvatars(avatarUrl) {
        // Update any elements with class 'user-avatar-display'
        const avatarElements = document.querySelectorAll('.user-avatar-display');
        
        avatarElements.forEach(element => {
            if (element.tagName === 'IMG') {
                if (avatarUrl) {
                    element.src = `${avatarUrl}?t=${Date.now()}`;
                    element.style.display = 'block';
                } else {
                    element.style.display = 'none';
                }
            }
        });

        // Update any fallback elements
        const fallbackElements = document.querySelectorAll('.user-avatar-fallback');
        
        fallbackElements.forEach(element => {
            if (avatarUrl) {
                element.style.display = 'none';
            } else {
                element.style.display = 'flex';
            }
        });
    }

    /**
     * Get avatar URL for a user
     */
    async getAvatarUrl(userId) {
        if (!userId) return null;

        // Check cache first
        if (this.avatarCache.has(userId)) {
            return this.avatarCache.get(userId);
        }

        // Fetch from database
        if (this.supabaseClient) {
            try {
                const { data: profile, error } = await this.supabaseClient
                    .from('profiles')
                    .select('avatar_url')
                    .eq('user_id', userId)
                    .single();

                if (!error && profile) {
                    const avatarUrl = profile.avatar_url;
                    this.avatarCache.set(userId, avatarUrl);
                    return avatarUrl;
                }
            } catch (error) {
                console.error('❌ Global Avatar Manager: Failed to fetch avatar:', error);
            }
        }

        return null;
    }

    /**
     * Clear avatar cache for a user
     */
    clearCache(userId) {
        if (userId) {
            this.avatarCache.delete(userId);
            console.log(`🧹 Global Avatar Manager: Cleared cache for user ${userId}`);
        } else {
            this.avatarCache.clear();
            console.log('🧹 Global Avatar Manager: Cleared all avatar cache');
        }
    }

    /**
     * Refresh avatar for current user
     */
    async refreshCurrentUserAvatar() {
        if (!this.currentUser) {
            console.log('⚠️ Global Avatar Manager: No current user to refresh avatar for');
            return;
        }

        console.log('🔄 Global Avatar Manager: Refreshing current user avatar...');
        
        // Clear cache for current user
        this.clearCache(this.currentUser.id);
        
        // Fetch fresh avatar URL
        const avatarUrl = await this.getAvatarUrl(this.currentUser.id);
        
        // Trigger update
        this.handleAvatarUpdate({
            avatarUrl: avatarUrl,
            userId: this.currentUser.id
        });
    }

    /**
     * Set up avatar display for an element
     */
    setupAvatarDisplay(imageElement, fallbackElement, userId) {
        if (!imageElement || !userId) return;

        // Add classes for automatic updates
        imageElement.classList.add('user-avatar-display');
        if (fallbackElement) {
            fallbackElement.classList.add('user-avatar-fallback');
        }

        // Load avatar
        this.getAvatarUrl(userId).then(avatarUrl => {
            if (avatarUrl) {
                imageElement.src = `${avatarUrl}?t=${Date.now()}`;
                imageElement.style.display = 'block';
                if (fallbackElement) fallbackElement.style.display = 'none';
            } else {
                imageElement.style.display = 'none';
                if (fallbackElement) fallbackElement.style.display = 'flex';
            }
        });
    }
}

// Create global instance
window.GlobalAvatarManager = new GlobalAvatarManager();

// Auto-initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.GlobalAvatarManager.init();
    }, 100);
});

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GlobalAvatarManager;
}
