/**
 * Supabase Service Module
 * Public API for Supabase integration
 */

// Core service
export { SupabaseService, supabaseService } from './supabase.service.js';

// Configuration
export { 
    supabaseConfig, 
    getEnvironmentConfig, 
    tableSchemas 
} from './supabase.config.js';

// Re-export dual-compatible Supabase client factory
export {
    getCreateClient,
    getSupabaseModule,
    getCreateClientSync,
    getEnvironmentInfo,
    initializeSupabaseClientFactory
} from './supabase-client.js';

// Module metadata
export const SUPABASE_MODULE_NAME = 'supabase';
export const SUPABASE_MODULE_VERSION = '1.0.0';
export const SUPABASE_MODULE_DESCRIPTION = 'Centralized Supabase integration service';

// Module capabilities
export const supabaseCapabilities = {
    authentication: true,
    database: true,
    realtime: true,
    storage: true,
    functions: false, // Future enhancement
    analytics: false  // Future enhancement
};

// Helper functions
export const isSupabaseConfigured = () => {
    try {
        // Browser environment - use direct configuration values
        const url = 'https://pbydepsqcypwqbicnsco.supabase.co';
        const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';
        return !!(url && key);
    } catch {
        return false;
    }
};

export const getSupabaseStatus = async () => {
    try {
        const { supabaseService } = await import('./supabase.service.js');
        const healthCheck = await supabaseService.healthCheck();
        return {
            configured: isSupabaseConfigured(),
            connected: healthCheck.success,
            status: healthCheck.status,
            error: healthCheck.error
        };
    } catch (error) {
        return {
            configured: isSupabaseConfigured(),
            connected: false,
            status: 'error',
            error: error.message
        };
    }
};
