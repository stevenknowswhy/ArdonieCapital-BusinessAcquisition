/**
 * Subscription and Badge Management Feature Module
 * Handles premium subscriptions, badge verification, and feature access control
 * Provides recurring revenue management and premium feature gating
 */

// Services
export { subscriptionManagementService } from './services/subscription-management.service.js';
export { badgeManagementService } from './services/badge-management.service.js';

// Components (to be created)
// export { SubscriptionPlans } from './components/subscription-plans.component.js';
// export { SubscriptionDashboard } from './components/subscription-dashboard.component.js';
// export { BadgeApplication } from './components/badge-application.component.js';
// export { BadgeVerification } from './components/badge-verification.component.js';
// export { UsageTracker } from './components/usage-tracker.component.js';
// export { BillingHistory } from './components/billing-history.component.js';

// Hooks (to be created)
// export { useSubscription } from './hooks/use-subscription.hook.js';
// export { useBadges } from './hooks/use-badges.hook.js';
// export { useFeatureAccess } from './hooks/use-feature-access.hook.js';
// export { useUsageTracking } from './hooks/use-usage-tracking.hook.js';

// Utils (to be created)
// export { subscriptionUtils } from './utils/subscription.utils.js';
// export { badgeUtils } from './utils/badge.utils.js';
// export { billingUtils } from './utils/billing.utils.js';

// Constants
export const SUBSCRIPTION_PLANS = {
    FREE: 'free',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise'
};

export const SUBSCRIPTION_STATUSES = {
    ACTIVE: 'active',
    TRIALING: 'trialing',
    PAST_DUE: 'past_due',
    CANCELED: 'canceled',
    CANCEL_AT_PERIOD_END: 'cancel_at_period_end',
    UNPAID: 'unpaid',
    INCOMPLETE: 'incomplete',
    INCOMPLETE_EXPIRED: 'incomplete_expired'
};

export const BADGE_TYPES = {
    EXPRESS_SELLER_BASIC: 'express_seller_basic',
    EXPRESS_SELLER_PREMIUM: 'express_seller_premium',
    EXPRESS_SELLER_ELITE: 'express_seller_elite',
    EXPRESS_BUYER_BASIC: 'express_buyer_basic',
    EXPRESS_BUYER_PREMIUM: 'express_buyer_premium',
    EXPRESS_BUYER_ELITE: 'express_buyer_elite'
};

export const BADGE_STATUSES = {
    PENDING_PAYMENT: 'pending_payment',
    PENDING_VERIFICATION: 'pending_verification',
    UNDER_REVIEW: 'under_review',
    ACTIVE: 'active',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
    SUSPENDED: 'suspended'
};

export const BADGE_ORDER_STATUSES = {
    PENDING_PAYMENT: 'pending_payment',
    PAID: 'paid',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded'
};

// Plan configurations
export const PLAN_CONFIGS = {
    [SUBSCRIPTION_PLANS.FREE]: {
        name: 'Free',
        price: 0,
        billing_interval: 'month',
        features: {
            listings: 1,
            inquiries_per_month: 5,
            basic_search: true,
            email_support: true,
            listing_duration_days: 30,
            photos_per_listing: 5,
            basic_analytics: true
        },
        limits: {
            max_listings: 1,
            max_inquiries_per_month: 5,
            max_photos_per_listing: 5
        },
        popular: false
    },
    [SUBSCRIPTION_PLANS.BASIC]: {
        name: 'Basic',
        price: 2900, // $29.00/month
        billing_interval: 'month',
        features: {
            listings: 5,
            inquiries_per_month: 25,
            advanced_search: true,
            email_support: true,
            listing_duration_days: 60,
            photos_per_listing: 10,
            basic_analytics: true
        },
        limits: {
            max_listings: 5,
            max_inquiries_per_month: 25,
            max_photos_per_listing: 10
        },
        popular: false
    },
    [SUBSCRIPTION_PLANS.PROFESSIONAL]: {
        name: 'Professional',
        price: 7900, // $79.00/month
        billing_interval: 'month',
        features: {
            listings: 15,
            inquiries_per_month: 100,
            advanced_search: true,
            priority_support: true,
            listing_duration_days: 90,
            photos_per_listing: 20,
            advanced_analytics: true,
            featured_listings: 3,
            custom_branding: true
        },
        limits: {
            max_listings: 15,
            max_inquiries_per_month: 100,
            max_photos_per_listing: 20,
            max_featured_listings: 3
        },
        popular: true
    },
    [SUBSCRIPTION_PLANS.ENTERPRISE]: {
        name: 'Enterprise',
        price: 19900, // $199.00/month
        billing_interval: 'month',
        features: {
            listings: 'unlimited',
            inquiries_per_month: 'unlimited',
            advanced_search: true,
            priority_support: true,
            dedicated_manager: true,
            listing_duration_days: 120,
            photos_per_listing: 50,
            advanced_analytics: true,
            featured_listings: 10,
            custom_branding: true,
            api_access: true,
            white_label: true
        },
        limits: {
            max_listings: -1, // unlimited
            max_inquiries_per_month: -1, // unlimited
            max_photos_per_listing: 50,
            max_featured_listings: 10
        },
        popular: false
    }
};

// Badge configurations
export const BADGE_CONFIGS = {
    [BADGE_TYPES.EXPRESS_SELLER_BASIC]: {
        name: 'Express Seller Basic',
        price: 29900, // $299.00
        duration_months: 12,
        category: 'seller',
        level: 'basic',
        features: [
            'Verified seller status',
            'Basic listing promotion',
            'Email support',
            'Seller badge display'
        ],
        verification_required: ['business_license', 'identity']
    },
    [BADGE_TYPES.EXPRESS_SELLER_PREMIUM]: {
        name: 'Express Seller Premium',
        price: 79900, // $799.00
        duration_months: 12,
        category: 'seller',
        level: 'premium',
        features: [
            'All Basic features',
            'Featured listing placement',
            'Priority support',
            'Advanced analytics',
            'Premium badge display'
        ],
        verification_required: ['business_license', 'identity', 'financial_statements']
    },
    [BADGE_TYPES.EXPRESS_SELLER_ELITE]: {
        name: 'Express Seller Elite',
        price: 149900, // $1,499.00
        duration_months: 12,
        category: 'seller',
        level: 'elite',
        features: [
            'All Premium features',
            'Top listing placement',
            'Dedicated account manager',
            'Custom marketing support',
            'Elite badge display'
        ],
        verification_required: ['business_license', 'identity', 'financial_statements', 'references']
    },
    [BADGE_TYPES.EXPRESS_BUYER_BASIC]: {
        name: 'Express Buyer Basic',
        price: 19900, // $199.00
        duration_months: 12,
        category: 'buyer',
        level: 'basic',
        features: [
            'Verified buyer status',
            'Access to seller contact info',
            'Email support',
            'Buyer badge display'
        ],
        verification_required: ['identity', 'financial_capability']
    },
    [BADGE_TYPES.EXPRESS_BUYER_PREMIUM]: {
        name: 'Express Buyer Premium',
        price: 49900, // $499.00
        duration_months: 12,
        category: 'buyer',
        level: 'premium',
        features: [
            'All Basic features',
            'Priority access to new listings',
            'Advanced search filters',
            'Priority support',
            'Premium buyer badge'
        ],
        verification_required: ['identity', 'financial_capability', 'proof_of_funds']
    },
    [BADGE_TYPES.EXPRESS_BUYER_ELITE]: {
        name: 'Express Buyer Elite',
        price: 99900, // $999.00
        duration_months: 12,
        category: 'buyer',
        level: 'elite',
        features: [
            'All Premium features',
            'Exclusive deal access',
            'Dedicated account manager',
            'Custom deal sourcing',
            'Elite buyer badge'
        ],
        verification_required: ['identity', 'financial_capability', 'proof_of_funds', 'references']
    }
};

// Feature access levels
export const FEATURE_ACCESS = {
    FREE: 'free',
    BASIC: 'basic',
    PROFESSIONAL: 'professional',
    ENTERPRISE: 'enterprise',
    BADGE_REQUIRED: 'badge_required'
};

// Usage tracking features
export const TRACKABLE_FEATURES = {
    LISTINGS: 'listings',
    INQUIRIES: 'inquiries',
    PHOTOS: 'photos',
    FEATURED_LISTINGS: 'featured_listings',
    SEARCHES: 'searches',
    DOWNLOADS: 'downloads'
};

// Utility functions
export const formatPrice = (priceInCents) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(priceInCents / 100);
};

export const formatSubscriptionStatus = (status) => {
    const statusLabels = {
        active: 'Active',
        trialing: 'Trial',
        past_due: 'Past Due',
        canceled: 'Canceled',
        cancel_at_period_end: 'Canceling',
        unpaid: 'Unpaid',
        incomplete: 'Incomplete',
        incomplete_expired: 'Expired'
    };
    return statusLabels[status] || status;
};

export const getSubscriptionStatusColor = (status) => {
    const statusColors = {
        active: 'green',
        trialing: 'blue',
        past_due: 'yellow',
        canceled: 'red',
        cancel_at_period_end: 'orange',
        unpaid: 'red',
        incomplete: 'gray',
        incomplete_expired: 'gray'
    };
    return statusColors[status] || 'gray';
};

export const formatBadgeStatus = (status) => {
    const statusLabels = {
        pending_payment: 'Pending Payment',
        pending_verification: 'Pending Verification',
        under_review: 'Under Review',
        active: 'Active',
        rejected: 'Rejected',
        expired: 'Expired',
        suspended: 'Suspended'
    };
    return statusLabels[status] || status;
};

export const getBadgeStatusColor = (status) => {
    const statusColors = {
        pending_payment: 'yellow',
        pending_verification: 'blue',
        under_review: 'orange',
        active: 'green',
        rejected: 'red',
        expired: 'gray',
        suspended: 'red'
    };
    return statusColors[status] || 'gray';
};

export const getBadgeLevel = (badgeType) => {
    return BADGE_CONFIGS[badgeType]?.level || 'basic';
};

export const getBadgeCategory = (badgeType) => {
    return BADGE_CONFIGS[badgeType]?.category || 'general';
};

export const isFeatureUnlimited = (featureValue) => {
    return featureValue === 'unlimited' || featureValue === -1;
};

export const calculateUsagePercentage = (used, limit) => {
    if (isFeatureUnlimited(limit)) return 0;
    if (limit <= 0) return 100;
    return Math.min((used / limit) * 100, 100);
};

export const isUsageLimitReached = (used, limit) => {
    if (isFeatureUnlimited(limit)) return false;
    return used >= limit;
};

export const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isSubscriptionActive = (subscription) => {
    if (!subscription) return false;
    
    const now = new Date();
    const periodEnd = new Date(subscription.current_period_end);
    
    return subscription.status === 'active' && periodEnd > now;
};

export const isBadgeActive = (badge) => {
    if (!badge) return false;
    
    const now = new Date();
    const expiryDate = new Date(badge.expires_at);
    
    return badge.status === 'active' && expiryDate > now;
};

export const getRecommendedPlan = (currentUsage) => {
    // Simple recommendation logic based on usage
    if (currentUsage.listings > 5 || currentUsage.inquiries > 25) {
        return SUBSCRIPTION_PLANS.PROFESSIONAL;
    } else if (currentUsage.listings > 1 || currentUsage.inquiries > 5) {
        return SUBSCRIPTION_PLANS.BASIC;
    }
    return SUBSCRIPTION_PLANS.FREE;
};

export const getRecommendedBadge = (userRole, businessSize) => {
    if (userRole === 'seller') {
        if (businessSize === 'large') {
            return BADGE_TYPES.EXPRESS_SELLER_ELITE;
        } else if (businessSize === 'medium') {
            return BADGE_TYPES.EXPRESS_SELLER_PREMIUM;
        }
        return BADGE_TYPES.EXPRESS_SELLER_BASIC;
    } else if (userRole === 'buyer') {
        if (businessSize === 'large') {
            return BADGE_TYPES.EXPRESS_BUYER_ELITE;
        } else if (businessSize === 'medium') {
            return BADGE_TYPES.EXPRESS_BUYER_PREMIUM;
        }
        return BADGE_TYPES.EXPRESS_BUYER_BASIC;
    }
    return null;
};

export const calculateAnnualSavings = (monthlyPrice) => {
    const annualPrice = monthlyPrice * 10; // 2 months free
    const monthlyCost = monthlyPrice * 12;
    return monthlyCost - annualPrice;
};

export const formatBillingInterval = (interval) => {
    const intervals = {
        month: 'Monthly',
        year: 'Annually',
        week: 'Weekly',
        day: 'Daily'
    };
    return intervals[interval] || interval;
};

export const getNextBillingDate = (subscription) => {
    if (!subscription || !subscription.current_period_end) return null;
    return new Date(subscription.current_period_end);
};

export const canUpgradePlan = (currentPlan, targetPlan) => {
    const planOrder = [SUBSCRIPTION_PLANS.FREE, SUBSCRIPTION_PLANS.BASIC, SUBSCRIPTION_PLANS.PROFESSIONAL, SUBSCRIPTION_PLANS.ENTERPRISE];
    return planOrder.indexOf(targetPlan) > planOrder.indexOf(currentPlan);
};

export const canDowngradePlan = (currentPlan, targetPlan) => {
    const planOrder = [SUBSCRIPTION_PLANS.FREE, SUBSCRIPTION_PLANS.BASIC, SUBSCRIPTION_PLANS.PROFESSIONAL, SUBSCRIPTION_PLANS.ENTERPRISE];
    return planOrder.indexOf(targetPlan) < planOrder.indexOf(currentPlan);
};
