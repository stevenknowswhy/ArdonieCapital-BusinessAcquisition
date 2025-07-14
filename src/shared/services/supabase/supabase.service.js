// Use global Supabase from CDN if available, otherwise import
const getCreateClient = async () => {
    if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
        return window.supabase.createClient;
    }

    // Fallback to dynamic import
    try {
        const { getCreateClient: getClient } = await import('./supabase-client.js');
        return await getClient();
    } catch (error) {
        console.error('Failed to load Supabase client:', error);
        throw error;
    }
};

/**
 * Dual-Compatible Supabase Service
 * Works in both browser and Node.js environments
 */
export class SupabaseService {
    constructor() {
        this.client = null;
        this.isInitialized = false;
        this.config = this.loadConfig();
        // Initialization is deferred to avoid any potential issues
    }

    /**
     * Load configuration - completely browser compatible
     */
    loadConfig() {
        // Hardcoded configuration for browser environment
        return {
            url: 'https://pbydepsqcypwqbicnsco.supabase.co',
            anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0',
            serviceRoleKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkyMDE5NCwiZXhwIjoyMDY3NDk2MTk0fQ.0I9WjlCedZQ_RkXx8KRXkcVW7blG7EvmHgc-ClLPRLs'
        };
    }

    /**
     * Initialize Supabase client (async for dual compatibility)
     */
    async init() {
        try {
            if (!this.config.url || !this.config.anonKey) {
                throw new Error('Supabase configuration is missing.');
            }

            // Get the createClient function based on environment
            const createClient = await getCreateClient();

            this.client = createClient(this.config.url, this.config.anonKey, {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            });

            this.isInitialized = true;
            console.log('Dual-compatible Supabase client initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Supabase client:', error);
            throw error;
        }
    }

    /**
     * Get the Supabase client instance (async for dual compatibility)
     */
    async getClient() {
        if (!this.isInitialized) {
            await this.init();
        }
        return this.client;
    }

    /**
     * Get the Supabase client instance synchronously (only if already initialized)
     */
    getClientSync() {
        if (!this.isInitialized) {
            throw new Error('Supabase client not initialized. Call init() or getClient() first.');
        }
        return this.client;
    }

    /**
     * Authentication methods
     */
    async signUp(email, password, userData = {}) {
        try {
            const client = await this.getClient();
            const { data, error } = await client.auth.signUp({
                email,
                password,
                options: {
                    data: userData
                }
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign up error:', error);
            return { success: false, error: error.message };
        }
    }

    async signIn(email, password) {
        try {
            const client = await this.getClient();
            const { data, error } = await client.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Sign in error:', error);
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            const client = await this.getClient();
            const { error } = await client.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Sign out error:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentUser() {
        try {
            const client = await this.getClient();
            const { data: { user }, error } = await client.auth.getUser();
            if (error) throw error;
            return { success: true, user };
        } catch (error) {
            console.error('Get current user error:', error);
            return { success: false, error: error.message };
        }
    }

    async getCurrentSession() {
        try {
            const client = await this.getClient();
            const { data: { session }, error } = await client.auth.getSession();
            if (error) throw error;
            return { success: true, session };
        } catch (error) {
            console.error('Get current session error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Database operations
     */
    async select(table, options = {}) {
        try {
            const client = await this.getClient();
            let query = client.from(table).select(options.select || '*');

            if (options.eq) {
                Object.entries(options.eq).forEach(([key, value]) => {
                    query = query.eq(key, value);
                });
            }

            if (options.order) {
                query = query.order(options.order.column, { ascending: options.order.ascending });
            }

            if (options.limit) {
                query = query.limit(options.limit);
            }

            if (options.range) {
                query = query.range(options.range.from, options.range.to);
            }

            const { data, error } = await query;
            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error(`Select from ${table} error:`, error);
            return { success: false, error: error.message };
        }
    }

    async insert(table, data) {
        try {
            const client = await this.getClient();
            const { data: result, error } = await client
                .from(table)
                .insert(data)
                .select();

            if (error) throw error;
            return { success: true, data: result };
        } catch (error) {
            console.error(`Insert into ${table} error:`, error);
            return { success: false, error: error.message };
        }
    }

    async update(table, data, conditions) {
        try {
            const client = await this.getClient();
            let query = client.from(table).update(data);

            Object.entries(conditions).forEach(([key, value]) => {
                query = query.eq(key, value);
            });

            const { data: result, error } = await query.select();
            if (error) throw error;
            return { success: true, data: result };
        } catch (error) {
            console.error(`Update ${table} error:`, error);
            return { success: false, error: error.message };
        }
    }

    async delete(table, conditions) {
        try {
            const client = await this.getClient();
            let query = client.from(table).delete();

            Object.entries(conditions).forEach(([key, value]) => {
                query = query.eq(key, value);
            });

            const { error } = await query;
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error(`Delete from ${table} error:`, error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Real-time subscriptions
     */
    async subscribe(table, callback, options = {}) {
        try {
            const client = await this.getClient();
            const channel = client
                .channel(`${table}_changes`)
                .on('postgres_changes',
                    {
                        event: options.event || '*',
                        schema: 'public',
                        table: table
                    },
                    callback
                )
                .subscribe();

            return channel;
        } catch (error) {
            console.error(`Subscribe to ${table} error:`, error);
            return null;
        }
    }

    /**
     * Storage operations
     */
    async uploadFile(bucket, path, file) {
        try {
            const client = await this.getClient();
            const { data, error } = await client.storage
                .from(bucket)
                .upload(path, file);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('File upload error:', error);
            return { success: false, error: error.message };
        }
    }

    async getPublicUrl(bucket, path) {
        try {
            const client = await this.getClient();
            const { data } = client.storage
                .from(bucket)
                .getPublicUrl(path);

            return { success: true, url: data.publicUrl };
        } catch (error) {
            console.error('Get public URL error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Health check - uses profiles table to verify database connectivity
     */
    async healthCheck() {
        try {
            const client = await this.getClient();
            // Use profiles table for health check since it's a core table that should always exist
            const { data, error } = await client
                .from('profiles')
                .select('id')
                .limit(1);

            return {
                success: !error,
                status: error ? 'unhealthy' : 'healthy',
                error: error?.message,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                success: false,
                status: 'unhealthy',
                error: error.message,
                timestamp: new Date().toISOString()
            };
        }
    }
}

// Clean singleton instance with lazy initialization
let _supabaseServiceInstance = null;

export const supabaseService = {
    get instance() {
        if (!_supabaseServiceInstance) {
            _supabaseServiceInstance = new SupabaseService();
        }
        return _supabaseServiceInstance;
    },

    // Proxy methods for backward compatibility
    getClient() { return this.instance.getClient(); },
    init() { return this.instance.init(); },
    get isInitialized() { return this.instance.isInitialized; },

    // Authentication methods
    signUp(email, password, options) { return this.instance.signUp(email, password, options); },
    signIn(email, password) { return this.instance.signIn(email, password); },
    signOut() { return this.instance.signOut(); },
    getCurrentUser() { return this.instance.getCurrentUser(); },
    onAuthStateChange(callback) { return this.instance.onAuthStateChange(callback); },

    // Database operation methods
    select(table, options) { return this.instance.select(table, options); },
    insert(table, data) { return this.instance.insert(table, data); },
    update(table, data, conditions) { return this.instance.update(table, data, conditions); },
    delete(table, conditions) { return this.instance.delete(table, conditions); },

    // Real-time and utility methods
    subscribe(table, callback, options) { return this.instance.subscribe(table, callback, options); },
    unsubscribe(channel) { return this.instance.unsubscribe(channel); },
    healthCheck() { return this.instance.healthCheck(); }
};

// Export the class for testing
export default SupabaseService;
