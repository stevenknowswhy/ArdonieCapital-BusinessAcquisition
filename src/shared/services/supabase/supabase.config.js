/**
 * Supabase Configuration
 * Centralized configuration for Supabase integration
 */

export const supabaseConfig = {
    // Project settings
    project: {
        name: 'Ardonie Project',
        id: 'pbydepsqcypwqbicnsco',
        url: 'https://pbydepsqcypwqbicnsco.supabase.co'
    },

    // Authentication settings
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        redirectTo: (typeof window !== 'undefined' ? window?.location?.origin : null) || 'http://localhost:8000',
        providers: {
            email: true,
            google: true, // Enabled for seller authentication
            github: false, // Future enhancement
        }
    },

    // Database settings
    database: {
        schema: 'public',
        tables: {
            users: 'users',
            profiles: 'profiles',
            listings: 'listings',
            matches: 'matches',
            messages: 'messages',
            notifications: 'notifications',
            saved_listings: 'saved_listings',
            saved_searches: 'saved_searches',
            search_history: 'search_history',
            analytics_events: 'analytics_events',
            content_pages: 'content_pages',
            blog_categories: 'blog_categories',
            documents: 'documents',
            deals: 'deals',
            vendors: 'vendors',
            vendor_reviews: 'vendor_reviews',
            // Multi-role system tables
            roles: 'roles',
            user_roles: 'user_roles',
            role_hierarchies: 'role_hierarchies',
            user_sessions: 'user_sessions',
            companies: 'companies',
            subscription_tiers: 'subscription_tiers',
            user_subscriptions: 'user_subscriptions',
            vendor_categories: 'vendor_categories',
            vendor_profiles: 'vendor_profiles',
            dashboard_preferences: 'dashboard_preferences',
            usage_analytics: 'usage_analytics',
            content_workflow: 'content_workflow',
            audit_log: 'audit_log'
        }
    },

    // Real-time settings
    realtime: {
        enabled: true,
        params: {
            eventsPerSecond: 10
        },
        channels: {
            listings: 'listings_changes',
            matches: 'matches_changes',
            messages: 'messages_changes'
        }
    },

    // Storage settings
    storage: {
        buckets: {
            avatars: 'avatars',
            documents: 'documents',
            listings: 'listing-images',
            assets: 'public-assets'
        },
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: {
            images: ['image/jpeg', 'image/png', 'image/webp'],
            documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        }
    },

    // Security settings
    security: {
        rls: {
            enabled: true,
            policies: {
                users: 'Users can only access their own data',
                listings: 'Users can view all listings, but only modify their own',
                matches: 'Users can only see matches involving them',
                messages: 'Users can only see messages they sent or received'
            }
        },
        rateLimiting: {
            enabled: true,
            requests: {
                perMinute: 60,
                perHour: 1000
            }
        }
    },

    // Feature flags
    features: {
        realTimeUpdates: true,
        fileUploads: true,
        notifications: true,
        analytics: true,
        caching: true
    },

    // Error handling
    errorHandling: {
        retryAttempts: 3,
        retryDelay: 1000,
        logErrors: true,
        showUserFriendlyMessages: true
    },

    // Performance settings
    performance: {
        cacheTimeout: 5 * 60 * 1000, // 5 minutes
        batchSize: 100,
        pagination: {
            defaultLimit: 20,
            maxLimit: 100
        }
    }
};

// Environment-specific overrides
export const getEnvironmentConfig = () => {
    // Browser environment - default to development since process.env is not available
    const env = 'development';
    
    const envConfigs = {
        development: {
            auth: {
                redirectTo: 'http://localhost:8000'
            },
            errorHandling: {
                logErrors: true,
                showUserFriendlyMessages: false // Show detailed errors in dev
            },
            performance: {
                cacheTimeout: 1 * 60 * 1000 // 1 minute in dev
            }
        },
        production: {
            auth: {
                redirectTo: 'https://ardoniecapital.com'
            },
            errorHandling: {
                logErrors: false,
                showUserFriendlyMessages: true
            },
            performance: {
                cacheTimeout: 10 * 60 * 1000 // 10 minutes in prod
            }
        }
    };

    return {
        ...supabaseConfig,
        ...envConfigs[env]
    };
};

// Table schemas for reference
export const tableSchemas = {
    users: {
        id: 'uuid',
        email: 'text',
        created_at: 'timestamp',
        updated_at: 'timestamp',
        last_sign_in_at: 'timestamp',
        email_confirmed_at: 'timestamp'
    },

    profiles: {
        id: 'uuid',
        user_id: 'uuid',
        first_name: 'text',
        last_name: 'text',
        role: 'text', // Legacy: 'buyer', 'seller', 'admin'
        company: 'text',
        phone: 'text',
        avatar_url: 'text',
        bio: 'text',
        location: 'text',
        company_id: 'uuid', // New: Company relationship
        legacy_role: 'text', // Backup of original role
        migration_status: 'text', // Migration tracking
        subscription_tier_id: 'uuid', // Subscription tier
        subscription_status: 'text', // Subscription status
        trial_ends_at: 'timestamp', // Trial expiration
        onboarding_completed: 'boolean', // Onboarding status
        onboarding_step: 'integer', // Current onboarding step
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    
    listings: {
        id: 'uuid',
        seller_id: 'uuid',
        title: 'text',
        description: 'text',
        price: 'numeric',
        business_type: 'text',
        location: 'text',
        revenue: 'numeric',
        profit: 'numeric',
        employees: 'integer',
        established_year: 'integer',
        images: 'json',
        status: 'text', // 'active', 'pending', 'sold', 'withdrawn'
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },
    
    matches: {
        id: 'uuid',
        buyer_id: 'uuid',
        seller_id: 'uuid',
        listing_id: 'uuid',
        compatibility_score: 'numeric',
        status: 'text', // 'pending', 'accepted', 'rejected'
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },

    // Multi-role system tables
    roles: {
        id: 'uuid',
        name: 'text',
        slug: 'text',
        description: 'text',
        category: 'text', // 'primary', 'blog', 'system'
        permissions: 'json',
        is_active: 'boolean',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },

    user_roles: {
        id: 'uuid',
        user_id: 'uuid',
        role_id: 'uuid',
        company_id: 'uuid',
        assigned_by: 'uuid',
        assigned_at: 'timestamp',
        expires_at: 'timestamp',
        is_active: 'boolean',
        metadata: 'json',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },

    subscription_tiers: {
        id: 'uuid',
        name: 'text',
        slug: 'text',
        description: 'text',
        price_monthly: 'numeric',
        price_yearly: 'numeric',
        features: 'json',
        limits: 'json',
        is_active: 'boolean',
        sort_order: 'integer',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },

    user_subscriptions: {
        id: 'uuid',
        user_id: 'uuid',
        tier_id: 'uuid',
        status: 'text', // 'active', 'cancelled', 'expired', 'trial'
        started_at: 'timestamp',
        expires_at: 'timestamp',
        cancelled_at: 'timestamp',
        payment_method: 'json',
        billing_cycle: 'text', // 'monthly', 'yearly', 'lifetime'
        auto_renew: 'boolean',
        metadata: 'json',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },

    vendor_categories: {
        id: 'uuid',
        name: 'text',
        slug: 'text',
        description: 'text',
        parent_category_id: 'uuid',
        icon: 'text',
        color: 'text',
        required_credentials: 'json',
        features: 'json',
        is_active: 'boolean',
        sort_order: 'integer',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },

    vendor_profiles: {
        id: 'uuid',
        user_id: 'uuid',
        category_id: 'uuid',
        business_name: 'text',
        license_number: 'text',
        license_state: 'text',
        certifications: 'json',
        specializations: 'json',
        service_areas: 'json',
        hourly_rate: 'numeric',
        minimum_engagement: 'numeric',
        availability_status: 'text',
        bio: 'text',
        years_experience: 'integer',
        verification_status: 'text',
        verified_at: 'timestamp',
        verified_by: 'uuid',
        is_featured: 'boolean',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },

    dashboard_preferences: {
        id: 'uuid',
        user_id: 'uuid',
        role_slug: 'text',
        layout_config: 'json',
        widget_preferences: 'json',
        notification_settings: 'json',
        theme_settings: 'json',
        quick_actions: 'json',
        default_filters: 'json',
        created_at: 'timestamp',
        updated_at: 'timestamp'
    },

    usage_analytics: {
        id: 'uuid',
        user_id: 'uuid',
        feature_name: 'text',
        role_context: 'text',
        usage_count: 'integer',
        usage_date: 'date',
        metadata: 'json',
        created_at: 'timestamp'
    }
};

export default supabaseConfig;
