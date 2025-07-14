/**
 * Shared Services Module
 * Public API for all shared services
 */

// Supabase service
export {
    SupabaseService,
    supabaseService,
    supabaseConfig,
    getEnvironmentConfig,
    tableSchemas,
    supabaseCapabilities,
    isSupabaseConfigured,
    getSupabaseStatus
} from './supabase/index.js';

// Theme service
export { ThemeLoaderService } from './theme/theme-loader.service.js';
export { baseThemeConfig } from './theme/base-theme.config.js';

// Module metadata
export const SHARED_SERVICES_MODULE_NAME = 'shared-services';
export const SHARED_SERVICES_MODULE_VERSION = '1.0.0';
export const SHARED_SERVICES_MODULE_DESCRIPTION = 'Shared services for the Ardonie Capital platform';

// Available services
export const availableServices = {
    supabase: 'Database and authentication service',
    theme: 'Theme management and customization service'
};
