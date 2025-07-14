/**
 * Supabase Client Factory
 * Dual-compatibility system for CDN (browser) vs npm (Node.js) imports
 */

let createClient;
let supabaseClientModule;

/**
 * Environment detection
 */
const isNodeEnvironment = () => {
    return typeof process !== 'undefined' && 
           process.versions && 
           process.versions.node;
};

const isBrowserEnvironment = () => {
    return typeof window !== 'undefined' && 
           typeof document !== 'undefined';
};

const isTestEnvironment = () => {
    return isNodeEnvironment() && 
           (process.env.NODE_ENV === 'test' || 
            process.env.JEST_WORKER_ID !== undefined ||
            typeof jest !== 'undefined');
};

/**
 * Dynamic import strategy based on environment
 */
const loadSupabaseClient = async () => {
    if (supabaseClientModule) {
        return supabaseClientModule;
    }

    try {
        if (isTestEnvironment() || isNodeEnvironment()) {
            // Node.js environment - use npm package
            console.log('Loading Supabase client for Node.js environment');
            const supabase = await import('@supabase/supabase-js');
            createClient = supabase.createClient;
            supabaseClientModule = supabase;
        } else if (isBrowserEnvironment()) {
            // Browser environment - use CDN
            console.log('Loading Supabase client for browser environment');
            const supabase = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
            createClient = supabase.createClient;
            supabaseClientModule = supabase;
        } else {
            // Fallback - try npm first, then CDN
            console.log('Unknown environment, trying npm package first');
            try {
                const supabase = await import('@supabase/supabase-js');
                createClient = supabase.createClient;
                supabaseClientModule = supabase;
            } catch (npmError) {
                console.log('npm package failed, falling back to CDN');
                const supabase = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
                createClient = supabase.createClient;
                supabaseClientModule = supabase;
            }
        }

        console.log('Supabase client loaded successfully');
        return supabaseClientModule;
    } catch (error) {
        console.error('Failed to load Supabase client:', error);
        throw new Error(`Failed to load Supabase client: ${error.message}`);
    }
};

/**
 * Get createClient function with automatic loading
 */
export const getCreateClient = async () => {
    if (!createClient) {
        await loadSupabaseClient();
    }
    return createClient;
};

/**
 * Get full Supabase module with automatic loading
 */
export const getSupabaseModule = async () => {
    if (!supabaseClientModule) {
        await loadSupabaseClient();
    }
    return supabaseClientModule;
};

/**
 * Synchronous access (only works if already loaded)
 */
export const getCreateClientSync = () => {
    if (!createClient) {
        throw new Error('Supabase client not loaded. Call getCreateClient() first.');
    }
    return createClient;
};

/**
 * Environment info for debugging
 */
export const getEnvironmentInfo = () => {
    return {
        isNode: isNodeEnvironment(),
        isBrowser: isBrowserEnvironment(),
        isTest: isTestEnvironment(),
        hasProcess: typeof process !== 'undefined',
        hasWindow: typeof window !== 'undefined',
        hasDocument: typeof document !== 'undefined',
        nodeEnv: typeof process !== 'undefined' ? process.env.NODE_ENV : 'unknown',
        jestWorker: typeof process !== 'undefined' ? process.env.JEST_WORKER_ID : 'undefined'
    };
};

/**
 * Initialize client factory (call this early in your app)
 */
export const initializeSupabaseClientFactory = async () => {
    try {
        console.log('Initializing Supabase client factory...');
        console.log('Environment info:', getEnvironmentInfo());
        
        await loadSupabaseClient();
        
        console.log('Supabase client factory initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase client factory:', error);
        return false;
    }
};

// Auto-initialize in browser environment
if (isBrowserEnvironment()) {
    // Use setTimeout to avoid blocking the main thread
    setTimeout(() => {
        initializeSupabaseClientFactory().catch(error => {
            console.warn('Auto-initialization failed:', error);
        });
    }, 0);
}

export default {
    getCreateClient,
    getSupabaseModule,
    getCreateClientSync,
    getEnvironmentInfo,
    initializeSupabaseClientFactory
};
