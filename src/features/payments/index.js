/**
 * Payments Feature Module
 * Barrel export for payment processing functionality
 * Provides comprehensive payment, escrow, and fee management
 */

// Services
export { stripePaymentService } from './services/stripe-payment.service.js';
export { escrowIntegrationService } from './services/escrow-integration.service.js';
export { feeCalculationService } from './services/fee-calculation.service.js';

// Components (to be created)
// export { PaymentForm } from './components/payment-form.component.js';
// export { SubscriptionManager } from './components/subscription-manager.component.js';
// export { EscrowDashboard } from './components/escrow-dashboard.component.js';
// export { FeeCalculator } from './components/fee-calculator.component.js';

// Hooks (to be created)
// export { usePayment } from './hooks/use-payment.hook.js';
// export { useSubscription } from './hooks/use-subscription.hook.js';
// export { useEscrow } from './hooks/use-escrow.hook.js';
// export { useFees } from './hooks/use-fees.hook.js';

// Utils (to be created)
// export { paymentUtils } from './utils/payment.utils.js';
// export { escrowUtils } from './utils/escrow.utils.js';

// Constants
export const PAYMENT_STATUSES = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    SUCCEEDED: 'succeeded',
    FAILED: 'failed',
    CANCELLED: 'cancelled',
    REFUNDED: 'refunded'
};

export const PAYMENT_TYPES = {
    BADGE: 'badge',
    SUBSCRIPTION: 'subscription',
    TRANSACTION_FEE: 'transaction_fee',
    VENDOR_REFERRAL: 'vendor_referral',
    ESCROW_FUNDING: 'escrow_funding',
    OTHER: 'other'
};

export const SUBSCRIPTION_STATUSES = {
    ACTIVE: 'active',
    PAST_DUE: 'past_due',
    CANCELLED: 'cancelled',
    UNPAID: 'unpaid',
    INCOMPLETE: 'incomplete',
    INCOMPLETE_EXPIRED: 'incomplete_expired',
    TRIALING: 'trialing'
};

export const ESCROW_STATUSES = {
    CREATED: 'created',
    FUNDED: 'funded',
    IN_PROGRESS: 'in_progress',
    RELEASED: 'released',
    CANCELLED: 'cancelled',
    DISPUTED: 'disputed'
};

export const BADGE_TYPES = {
    EXPRESS_SELLER_BASIC: 'express_seller_basic',
    EXPRESS_SELLER_PREMIUM: 'express_seller_premium',
    EXPRESS_SELLER_ELITE: 'express_seller_elite',
    EXPRESS_BUYER_BASIC: 'express_buyer_basic',
    EXPRESS_BUYER_PREMIUM: 'express_buyer_premium',
    EXPRESS_BUYER_ELITE: 'express_buyer_elite'
};

export const SUBSCRIPTION_PLANS = {
    BUYER_PRO: 'buyer_pro',
    SELLER_PRO: 'seller_pro',
    VENDOR_PRO: 'vendor_pro'
};

export const BILLING_CYCLES = {
    MONTHLY: 'monthly',
    QUARTERLY: 'quarterly',
    ANNUALLY: 'annually'
};

// Badge pricing configuration
export const BADGE_PRICING = {
    [BADGE_TYPES.EXPRESS_SELLER_BASIC]: {
        amount: 29900, // $299.00
        name: 'Express Seller Basic',
        description: 'Basic seller verification and badge',
        features: [
            'Verified seller status',
            'Basic listing promotion',
            'Email support'
        ]
    },
    [BADGE_TYPES.EXPRESS_SELLER_PREMIUM]: {
        amount: 79900, // $799.00
        name: 'Express Seller Premium',
        description: 'Premium seller verification with enhanced features',
        features: [
            'All Basic features',
            'Featured listing placement',
            'Priority support',
            'Advanced analytics'
        ]
    },
    [BADGE_TYPES.EXPRESS_SELLER_ELITE]: {
        amount: 149900, // $1,499.00
        name: 'Express Seller Elite',
        description: 'Elite seller verification with maximum visibility',
        features: [
            'All Premium features',
            'Top listing placement',
            'Dedicated account manager',
            'Custom marketing support'
        ]
    },
    [BADGE_TYPES.EXPRESS_BUYER_BASIC]: {
        amount: 19900, // $199.00
        name: 'Express Buyer Basic',
        description: 'Basic buyer verification and access',
        features: [
            'Verified buyer status',
            'Access to seller contact info',
            'Email support'
        ]
    },
    [BADGE_TYPES.EXPRESS_BUYER_PREMIUM]: {
        amount: 49900, // $499.00
        name: 'Express Buyer Premium',
        description: 'Premium buyer verification with enhanced access',
        features: [
            'All Basic features',
            'Priority access to new listings',
            'Advanced search filters',
            'Priority support'
        ]
    },
    [BADGE_TYPES.EXPRESS_BUYER_ELITE]: {
        amount: 99900, // $999.00
        name: 'Express Buyer Elite',
        description: 'Elite buyer verification with maximum access',
        features: [
            'All Premium features',
            'Exclusive deal access',
            'Dedicated account manager',
            'Custom deal sourcing'
        ]
    }
};

// Subscription pricing configuration
export const SUBSCRIPTION_PRICING = {
    [SUBSCRIPTION_PLANS.BUYER_PRO]: {
        monthly: 4900, // $49.00/month
        quarterly: 13500, // $45.00/month (5% discount)
        annually: 49900, // $41.58/month (15% discount)
        name: 'Buyer Pro',
        description: 'Advanced buyer features and analytics',
        features: [
            'Advanced search and filters',
            'Deal analytics and insights',
            'Priority customer support',
            'Saved searches and alerts',
            'Market trend reports'
        ]
    },
    [SUBSCRIPTION_PLANS.SELLER_PRO]: {
        monthly: 14900, // $149.00/month
        quarterly: 41055, // $136.85/month (5% discount)
        annually: 152150, // $126.79/month (15% discount)
        name: 'Seller Pro',
        description: 'Professional seller tools and promotion',
        features: [
            'Featured listing placement',
            'Advanced listing analytics',
            'Lead management tools',
            'Priority customer support',
            'Marketing automation',
            'Performance reporting'
        ]
    },
    [SUBSCRIPTION_PLANS.VENDOR_PRO]: {
        monthly: 9900, // $99.00/month
        quarterly: 27225, // $90.75/month (5% discount)
        annually: 100980, // $84.15/month (15% discount)
        name: 'Vendor Pro',
        description: 'Professional vendor directory and referral tools',
        features: [
            'Enhanced vendor profile',
            'Referral tracking and analytics',
            'Lead management system',
            'Priority customer support',
            'Performance metrics',
            'Marketing tools'
        ]
    }
};

// Transaction fee configuration
export const TRANSACTION_FEE_CONFIG = {
    percentage: 0.05, // 5%
    minimum: 500, // $5.00
    maximum: 50000, // $500.00
    description: 'Success-based fee on completed deals'
};

// Vendor referral fee configuration
export const VENDOR_REFERRAL_FEES = {
    legal: 0.15, // 15%
    accounting: 0.20, // 20%
    financial: 0.25, // 25%
    consulting: 0.10, // 10%
    insurance: 0.12, // 12%
    real_estate: 0.18, // 18%
    default: 0.15 // 15%
};

// Escrow configuration
export const ESCROW_CONFIG = {
    default_provider: 'escrow.com',
    inspection_period_days: 14,
    supported_payment_methods: [
        {
            type: 'wire_transfer',
            name: 'Wire Transfer',
            processing_time: '1-2 business days',
            fees: 'No additional fees'
        },
        {
            type: 'ach',
            name: 'ACH Transfer',
            processing_time: '3-5 business days',
            fees: 'Low fees'
        },
        {
            type: 'credit_card',
            name: 'Credit Card',
            processing_time: 'Instant',
            fees: '2.9% + $0.30'
        }
    ]
};

// Payment method types
export const PAYMENT_METHOD_TYPES = {
    CARD: 'card',
    BANK_TRANSFER: 'bank_transfer',
    ACH: 'ach',
    WIRE_TRANSFER: 'wire_transfer',
    CREDIT_CARD: 'credit_card'
};

// Discount types
export const DISCOUNT_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED: 'fixed'
};

// Fee types for calculations
export const FEE_TYPES = {
    TRANSACTION: 'transaction',
    BADGE: 'badge',
    SUBSCRIPTION: 'subscription',
    VENDOR_REFERRAL: 'vendor_referral'
};

// Utility functions
export const formatCurrency = (amountInCents) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amountInCents / 100);
};

export const formatPercentage = (decimal) => {
    return `${(decimal * 100).toFixed(1)}%`;
};

export const calculateSavings = (originalAmount, discountedAmount) => {
    if (originalAmount <= 0) return 0;
    return ((originalAmount - discountedAmount) / originalAmount) * 100;
};

export const getBadgeDisplayName = (badgeType) => {
    return BADGE_PRICING[badgeType]?.name || badgeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const getSubscriptionDisplayName = (planType) => {
    return SUBSCRIPTION_PRICING[planType]?.name || planType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
