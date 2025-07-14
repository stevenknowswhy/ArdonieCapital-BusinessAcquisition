/**
 * Supabase Service - Authentication Feature Compatibility Layer
 * This file provides backward compatibility for the authentication feature
 * by re-exporting the main Supabase service
 */

// Re-export the main Supabase service for backward compatibility
export { SupabaseService, supabaseService } from '../../../shared/services/supabase/supabase.service.js';

// Make it globally available for non-module scripts
import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

// Initialize and make globally available
(async () => {
    try {
        await supabaseService.init();
        window.supabaseService = supabaseService;
        console.log('✅ Supabase service initialized and made globally available');
    } catch (error) {
        console.error('❌ Failed to initialize Supabase service:', error);
    }
})();

export default supabaseService;
