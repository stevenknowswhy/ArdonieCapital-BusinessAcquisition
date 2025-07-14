/**
 * Stripe Payment Service
 * Handles all Stripe payment processing for badges, subscriptions, and transaction fees
 * Provides secure payment collection and subscription management
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class StripePaymentService {
    constructor() {
        this.stripe = null;
        this.publishableKey = null;
        this.isInitialized = false;
        this.paymentsTable = 'payments';
        this.subscriptionsTable = 'subscriptions';
        this.badgeOrdersTable = 'badge_orders';
    }

    /**
     * Initialize Stripe with publishable key
     */
    async initialize() {
        try {
            if (this.isInitialized) return { success: true };

            // Get Stripe publishable key from environment or config
            this.publishableKey = await this.getStripePublishableKey();
            
            if (!this.publishableKey) {
                throw new Error('Stripe publishable key not configured');
            }

            // Load Stripe.js if not already loaded
            if (!window.Stripe) {
                await this.loadStripeJS();
            }

            this.stripe = window.Stripe(this.publishableKey);
            this.isInitialized = true;

            return { success: true };
        } catch (error) {
            console.error('Stripe initialization error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process badge payment
     */
    async processBadgePayment(badgeType, userProfile, paymentMethodId = null) {
        try {
            await this.ensureInitialized();

            const badgePricing = this.getBadgePricing(badgeType);
            if (!badgePricing) {
                throw new Error('Invalid badge type');
            }

            // Create payment intent on backend
            const paymentIntentResult = await this.createPaymentIntent({
                amount: badgePricing.amount,
                currency: 'usd',
                payment_type: 'badge',
                badge_type: badgeType,
                customer_id: userProfile.id,
                metadata: {
                    badge_type: badgeType,
                    user_id: userProfile.id,
                    user_email: userProfile.email
                }
            });

            if (!paymentIntentResult.success) {
                return paymentIntentResult;
            }

            const { client_secret, payment_intent_id } = paymentIntentResult.data;

            // Create badge order record
            const orderResult = await this.createBadgeOrder({
                user_id: userProfile.id,
                badge_type: badgeType,
                amount: badgePricing.amount,
                payment_intent_id: payment_intent_id,
                status: 'pending'
            });

            if (!orderResult.success) {
                return orderResult;
            }

            return {
                success: true,
                data: {
                    client_secret: client_secret,
                    payment_intent_id: payment_intent_id,
                    order_id: orderResult.data.id,
                    amount: badgePricing.amount,
                    badge_type: badgeType
                }
            };
        } catch (error) {
            console.error('Badge payment error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Confirm payment with Stripe Elements
     */
    async confirmPayment(clientSecret, paymentElement, returnUrl = null) {
        try {
            await this.ensureInitialized();

            const confirmResult = await this.stripe.confirmPayment({
                elements: paymentElement,
                clientSecret: clientSecret,
                confirmParams: {
                    return_url: returnUrl || window.location.origin + '/payment-success'
                }
            });

            if (confirmResult.error) {
                return { success: false, error: confirmResult.error.message };
            }

            return { success: true, data: confirmResult.paymentIntent };
        } catch (error) {
            console.error('Payment confirmation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Create subscription for premium features
     */
    async createSubscription(planType, userProfile, paymentMethodId) {
        try {
            await this.ensureInitialized();

            const planPricing = this.getSubscriptionPricing(planType);
            if (!planPricing) {
                throw new Error('Invalid subscription plan');
            }

            // Create subscription on backend
            const subscriptionResult = await this.createStripeSubscription({
                customer_id: userProfile.id,
                price_id: planPricing.stripe_price_id,
                payment_method_id: paymentMethodId,
                plan_type: planType,
                metadata: {
                    user_id: userProfile.id,
                    user_email: userProfile.email,
                    plan_type: planType
                }
            });

            if (!subscriptionResult.success) {
                return subscriptionResult;
            }

            // Create local subscription record
            const localSubscriptionResult = await this.createLocalSubscription({
                user_id: userProfile.id,
                stripe_subscription_id: subscriptionResult.data.id,
                plan_type: planType,
                status: subscriptionResult.data.status,
                current_period_start: new Date(subscriptionResult.data.current_period_start * 1000),
                current_period_end: new Date(subscriptionResult.data.current_period_end * 1000),
                amount: planPricing.amount
            });

            return {
                success: true,
                data: {
                    subscription_id: subscriptionResult.data.id,
                    local_id: localSubscriptionResult.data?.id,
                    status: subscriptionResult.data.status,
                    plan_type: planType
                }
            };
        } catch (error) {
            console.error('Subscription creation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate transaction fee for deal
     */
    calculateTransactionFee(dealValue, feePercentage = 0.05) {
        const fee = dealValue * feePercentage;
        const minimumFee = 500; // $5 minimum
        const maximumFee = 50000; // $500 maximum
        
        return Math.max(minimumFee, Math.min(fee, maximumFee));
    }

    /**
     * Process transaction fee payment
     */
    async processTransactionFee(dealId, dealValue, feePercentage = 0.05) {
        try {
            await this.ensureInitialized();

            const feeAmount = this.calculateTransactionFee(dealValue, feePercentage);

            // Create payment intent for transaction fee
            const paymentIntentResult = await this.createPaymentIntent({
                amount: feeAmount,
                currency: 'usd',
                payment_type: 'transaction_fee',
                deal_id: dealId,
                metadata: {
                    deal_id: dealId,
                    deal_value: dealValue,
                    fee_percentage: feePercentage
                }
            });

            if (!paymentIntentResult.success) {
                return paymentIntentResult;
            }

            // Record transaction fee payment
            const paymentResult = await this.recordPayment({
                deal_id: dealId,
                payment_type: 'transaction_fee',
                amount: feeAmount,
                payment_intent_id: paymentIntentResult.data.payment_intent_id,
                status: 'pending'
            });

            return {
                success: true,
                data: {
                    client_secret: paymentIntentResult.data.client_secret,
                    fee_amount: feeAmount,
                    payment_id: paymentResult.data?.id
                }
            };
        } catch (error) {
            console.error('Transaction fee error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get badge pricing configuration
     */
    getBadgePricing(badgeType) {
        const pricing = {
            'express_seller_basic': { amount: 29900, name: 'Express Seller Basic' }, // $299
            'express_seller_premium': { amount: 79900, name: 'Express Seller Premium' }, // $799
            'express_seller_elite': { amount: 149900, name: 'Express Seller Elite' }, // $1,499
            'express_buyer_basic': { amount: 19900, name: 'Express Buyer Basic' }, // $199
            'express_buyer_premium': { amount: 49900, name: 'Express Buyer Premium' }, // $499
            'express_buyer_elite': { amount: 99900, name: 'Express Buyer Elite' } // $999
        };

        return pricing[badgeType] || null;
    }

    /**
     * Get subscription pricing configuration
     */
    getSubscriptionPricing(planType) {
        const pricing = {
            'buyer_pro': { 
                amount: 4900, // $49/month
                stripe_price_id: 'price_buyer_pro_monthly',
                name: 'Buyer Pro'
            },
            'seller_pro': { 
                amount: 14900, // $149/month
                stripe_price_id: 'price_seller_pro_monthly',
                name: 'Seller Pro'
            },
            'vendor_pro': { 
                amount: 9900, // $99/month
                stripe_price_id: 'price_vendor_pro_monthly',
                name: 'Vendor Pro'
            }
        };

        return pricing[planType] || null;
    }

    /**
     * Backend API calls (these would typically go to your server)
     */
    async createPaymentIntent(paymentData) {
        try {
            // This would typically call your backend API
            // For now, we'll simulate the response
            const response = await fetch('/api/payments/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Failed to create payment intent');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Create payment intent error:', error);
            return { success: false, error: error.message };
        }
    }

    async createStripeSubscription(subscriptionData) {
        try {
            const response = await fetch('/api/subscriptions/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${await this.getAuthToken()}`
                },
                body: JSON.stringify(subscriptionData)
            });

            if (!response.ok) {
                throw new Error('Failed to create subscription');
            }

            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('Create subscription error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Local database operations
     */
    async createBadgeOrder(orderData) {
        try {
            return await supabaseService.insert(this.badgeOrdersTable, orderData);
        } catch (error) {
            console.error('Create badge order error:', error);
            return { success: false, error: error.message };
        }
    }

    async createLocalSubscription(subscriptionData) {
        try {
            return await supabaseService.insert(this.subscriptionsTable, subscriptionData);
        } catch (error) {
            console.error('Create local subscription error:', error);
            return { success: false, error: error.message };
        }
    }

    async recordPayment(paymentData) {
        try {
            return await supabaseService.insert(this.paymentsTable, paymentData);
        } catch (error) {
            console.error('Record payment error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Utility methods
     */
    async ensureInitialized() {
        if (!this.isInitialized) {
            const result = await this.initialize();
            if (!result.success) {
                throw new Error('Failed to initialize Stripe');
            }
        }
    }

    async loadStripeJS() {
        return new Promise((resolve, reject) => {
            if (window.Stripe) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://js.stripe.com/v3/';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    async getStripePublishableKey() {
        // This would typically come from environment variables or config
        // For development, you can set this in your .env file
        return process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_51234567890abcdef';
    }

    async getAuthToken() {
        const user = await supabaseService.getCurrentUser();
        return user?.access_token || '';
    }

    formatAmount(amountInCents) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amountInCents / 100);
    }
}

// Export singleton instance
export const stripePaymentService = new StripePaymentService();
