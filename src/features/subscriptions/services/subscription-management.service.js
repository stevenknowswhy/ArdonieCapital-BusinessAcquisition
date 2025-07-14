/**
 * Subscription Management Service
 * Handles premium subscription plans, billing, and feature access control
 * Provides recurring revenue management and subscription lifecycle
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';
import { stripePaymentService } from '../../payments/services/stripe-payment.service.js';

class SubscriptionManagementService {
    constructor() {
        this.subscriptionsTable = 'subscriptions';
        this.subscriptionPlansTable = 'subscription_plans';
        this.subscriptionUsageTable = 'subscription_usage';
        this.invoicesTable = 'invoices';
        this.notificationsTable = 'notifications';
        
        // Subscription plans configuration
        this.subscriptionPlans = {
            free: {
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
                }
            },
            basic: {
                name: 'Basic',
                price: 2900, // $29.00/month
                billing_interval: 'month',
                stripe_price_id: 'price_basic_monthly',
                features: {
                    listings: 5,
                    inquiries_per_month: 25,
                    advanced_search: true,
                    email_support: true,
                    listing_duration_days: 60,
                    photos_per_listing: 10,
                    basic_analytics: true,
                    priority_support: false
                },
                limits: {
                    max_listings: 5,
                    max_inquiries_per_month: 25,
                    max_photos_per_listing: 10
                }
            },
            professional: {
                name: 'Professional',
                price: 7900, // $79.00/month
                billing_interval: 'month',
                stripe_price_id: 'price_professional_monthly',
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
                }
            },
            enterprise: {
                name: 'Enterprise',
                price: 19900, // $199.00/month
                billing_interval: 'month',
                stripe_price_id: 'price_enterprise_monthly',
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
                }
            }
        };
    }

    /**
     * Create subscription
     */
    async createSubscription(planId, paymentData) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to create subscription');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Validate plan
            if (!this.subscriptionPlans[planId]) {
                throw new Error('Invalid subscription plan');
            }

            const plan = this.subscriptionPlans[planId];

            // Check for existing active subscription
            const existingSubscription = await supabaseService.select(this.subscriptionsTable, {
                eq: { 
                    user_id: userProfile.data.id,
                    status: 'active'
                },
                single: true
            });

            if (existingSubscription.success && existingSubscription.data) {
                throw new Error('User already has an active subscription');
            }

            // Create Stripe subscription if not free plan
            let stripeSubscription = null;
            if (planId !== 'free') {
                const stripeResult = await stripePaymentService.createSubscription({
                    customer_info: paymentData.customer_info,
                    price_id: plan.stripe_price_id,
                    payment_method: paymentData.payment_method
                });

                if (!stripeResult.success) {
                    throw new Error('Failed to create Stripe subscription: ' + stripeResult.error);
                }

                stripeSubscription = stripeResult.data;
            }

            // Create subscription record
            const subscriptionData = {
                user_id: userProfile.data.id,
                plan_id: planId,
                status: planId === 'free' ? 'active' : 'pending',
                stripe_subscription_id: stripeSubscription?.id || null,
                stripe_customer_id: stripeSubscription?.customer || null,
                current_period_start: new Date().toISOString(),
                current_period_end: this.calculatePeriodEnd(plan.billing_interval),
                trial_end: paymentData.trial_days ? this.calculateTrialEnd(paymentData.trial_days) : null,
                metadata: {
                    plan_features: plan.features,
                    plan_limits: plan.limits,
                    created_via: 'web'
                }
            };

            const result = await supabaseService.insert(this.subscriptionsTable, subscriptionData);

            if (result.success) {
                // Initialize usage tracking
                await this.initializeUsageTracking(result.data.id);

                // Send welcome notification
                await this.sendSubscriptionNotification(userProfile.data.user_id, 'subscription_created', {
                    plan_name: plan.name,
                    subscription_id: result.data.id
                });

                return {
                    success: true,
                    data: {
                        subscription_id: result.data.id,
                        plan_id: planId,
                        status: result.data.status,
                        features: plan.features,
                        limits: plan.limits
                    }
                };
            }

            return result;
        } catch (error) {
            console.error('Create subscription error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update subscription plan
     */
    async updateSubscriptionPlan(subscriptionId, newPlanId) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Get subscription
            const subscriptionResult = await supabaseService.select(this.subscriptionsTable, {
                eq: { 
                    id: subscriptionId,
                    user_id: userProfile.data.id
                },
                single: true
            });

            if (!subscriptionResult.success || !subscriptionResult.data) {
                throw new Error('Subscription not found');
            }

            const subscription = subscriptionResult.data;
            const newPlan = this.subscriptionPlans[newPlanId];

            if (!newPlan) {
                throw new Error('Invalid new plan');
            }

            // Update Stripe subscription if applicable
            if (subscription.stripe_subscription_id && newPlanId !== 'free') {
                const stripeResult = await stripePaymentService.updateSubscription(
                    subscription.stripe_subscription_id,
                    { price_id: newPlan.stripe_price_id }
                );

                if (!stripeResult.success) {
                    throw new Error('Failed to update Stripe subscription: ' + stripeResult.error);
                }
            }

            // Update subscription record
            const updateData = {
                plan_id: newPlanId,
                updated_at: new Date().toISOString(),
                metadata: {
                    ...subscription.metadata,
                    plan_features: newPlan.features,
                    plan_limits: newPlan.limits,
                    previous_plan: subscription.plan_id,
                    upgraded_at: new Date().toISOString()
                }
            };

            const result = await supabaseService.update(this.subscriptionsTable, updateData, { id: subscriptionId });

            if (result.success) {
                // Reset usage if upgrading
                if (this.isPlanUpgrade(subscription.plan_id, newPlanId)) {
                    await this.resetUsageTracking(subscriptionId);
                }

                // Send notification
                await this.sendSubscriptionNotification(userProfile.data.user_id, 'subscription_updated', {
                    old_plan: this.subscriptionPlans[subscription.plan_id].name,
                    new_plan: newPlan.name,
                    subscription_id: subscriptionId
                });

                return {
                    success: true,
                    data: {
                        subscription_id: subscriptionId,
                        plan_id: newPlanId,
                        features: newPlan.features,
                        limits: newPlan.limits
                    }
                };
            }

            return result;
        } catch (error) {
            console.error('Update subscription plan error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Cancel subscription
     */
    async cancelSubscription(subscriptionId, cancelData = {}) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Get subscription
            const subscriptionResult = await supabaseService.select(this.subscriptionsTable, {
                eq: { 
                    id: subscriptionId,
                    user_id: userProfile.data.id
                },
                single: true
            });

            if (!subscriptionResult.success || !subscriptionResult.data) {
                throw new Error('Subscription not found');
            }

            const subscription = subscriptionResult.data;

            // Cancel Stripe subscription if applicable
            if (subscription.stripe_subscription_id) {
                const stripeResult = await stripePaymentService.cancelSubscription(
                    subscription.stripe_subscription_id,
                    { at_period_end: cancelData.at_period_end !== false }
                );

                if (!stripeResult.success) {
                    throw new Error('Failed to cancel Stripe subscription: ' + stripeResult.error);
                }
            }

            // Update subscription record
            const updateData = {
                status: cancelData.at_period_end !== false ? 'cancel_at_period_end' : 'canceled',
                canceled_at: new Date().toISOString(),
                cancellation_reason: cancelData.reason || null,
                cancellation_feedback: cancelData.feedback || null,
                updated_at: new Date().toISOString()
            };

            if (cancelData.at_period_end === false) {
                updateData.ended_at = new Date().toISOString();
            }

            const result = await supabaseService.update(this.subscriptionsTable, updateData, { id: subscriptionId });

            if (result.success) {
                // Send cancellation notification
                await this.sendSubscriptionNotification(userProfile.data.user_id, 'subscription_canceled', {
                    plan_name: this.subscriptionPlans[subscription.plan_id].name,
                    subscription_id: subscriptionId,
                    immediate: cancelData.at_period_end === false
                });

                return {
                    success: true,
                    data: {
                        subscription_id: subscriptionId,
                        status: updateData.status,
                        canceled_at: updateData.canceled_at,
                        ends_at: cancelData.at_period_end !== false ? subscription.current_period_end : updateData.ended_at
                    }
                };
            }

            return result;
        } catch (error) {
            console.error('Cancel subscription error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user subscription
     */
    async getUserSubscription(userId) {
        try {
            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: userId },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            const result = await supabaseService.select(this.subscriptionsTable, {
                select: `
                    *,
                    usage:subscription_usage (*)
                `,
                eq: { user_id: userProfile.data.id },
                order: { column: 'created_at', ascending: false },
                limit: 1,
                single: true
            });

            if (result.success && result.data) {
                const subscription = result.data;
                const plan = this.subscriptionPlans[subscription.plan_id];
                
                return {
                    success: true,
                    data: {
                        ...subscription,
                        plan_details: plan,
                        is_active: this.isSubscriptionActive(subscription),
                        days_until_renewal: this.calculateDaysUntilRenewal(subscription.current_period_end),
                        usage_summary: this.calculateUsageSummary(subscription.usage, plan.limits)
                    }
                };
            }

            // Return free plan if no subscription found
            return {
                success: true,
                data: {
                    plan_id: 'free',
                    status: 'active',
                    plan_details: this.subscriptionPlans.free,
                    is_active: true,
                    usage_summary: {}
                }
            };
        } catch (error) {
            console.error('Get user subscription error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Check feature access
     */
    async checkFeatureAccess(userId, feature) {
        try {
            const subscriptionResult = await this.getUserSubscription(userId);
            
            if (!subscriptionResult.success) {
                return { success: false, error: subscriptionResult.error };
            }

            const subscription = subscriptionResult.data;
            const plan = subscription.plan_details;
            
            const hasAccess = plan.features[feature] === true || 
                             plan.features[feature] === 'unlimited' ||
                             (typeof plan.features[feature] === 'number' && plan.features[feature] > 0);

            return {
                success: true,
                data: {
                    has_access: hasAccess,
                    feature_value: plan.features[feature],
                    plan_id: subscription.plan_id,
                    plan_name: plan.name
                }
            };
        } catch (error) {
            console.error('Check feature access error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Track feature usage
     */
    async trackUsage(userId, feature, amount = 1) {
        try {
            const subscriptionResult = await this.getUserSubscription(userId);
            
            if (!subscriptionResult.success) {
                return subscriptionResult;
            }

            const subscription = subscriptionResult.data;
            
            if (!subscription.id) {
                // Free plan, no tracking needed
                return { success: true, data: { tracked: false } };
            }

            // Get or create usage record for current period
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
            
            let usageRecord = await supabaseService.select(this.subscriptionUsageTable, {
                eq: { 
                    subscription_id: subscription.id,
                    feature: feature,
                    period: currentMonth
                },
                single: true
            });

            if (usageRecord.success && usageRecord.data) {
                // Update existing usage
                const newUsage = usageRecord.data.usage_count + amount;
                await supabaseService.update(this.subscriptionUsageTable, {
                    usage_count: newUsage,
                    last_used_at: new Date().toISOString()
                }, { id: usageRecord.data.id });
            } else {
                // Create new usage record
                await supabaseService.insert(this.subscriptionUsageTable, {
                    subscription_id: subscription.id,
                    feature: feature,
                    period: currentMonth,
                    usage_count: amount,
                    last_used_at: new Date().toISOString()
                });
            }

            return { success: true, data: { tracked: true, amount: amount } };
        } catch (error) {
            console.error('Track usage error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Utility methods
     */
    calculatePeriodEnd(billingInterval) {
        const now = new Date();
        if (billingInterval === 'month') {
            now.setMonth(now.getMonth() + 1);
        } else if (billingInterval === 'year') {
            now.setFullYear(now.getFullYear() + 1);
        }
        return now.toISOString();
    }

    calculateTrialEnd(trialDays) {
        const now = new Date();
        now.setDate(now.getDate() + trialDays);
        return now.toISOString();
    }

    calculateDaysUntilRenewal(periodEnd) {
        const now = new Date();
        const end = new Date(periodEnd);
        const diffTime = end - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    isSubscriptionActive(subscription) {
        if (!subscription) return false;
        
        const now = new Date();
        const periodEnd = new Date(subscription.current_period_end);
        
        return subscription.status === 'active' && periodEnd > now;
    }

    isPlanUpgrade(oldPlanId, newPlanId) {
        const planOrder = ['free', 'basic', 'professional', 'enterprise'];
        return planOrder.indexOf(newPlanId) > planOrder.indexOf(oldPlanId);
    }

    calculateUsageSummary(usageRecords, limits) {
        const summary = {};
        const currentMonth = new Date().toISOString().slice(0, 7);
        
        if (usageRecords) {
            usageRecords
                .filter(record => record.period === currentMonth)
                .forEach(record => {
                    const limit = limits[`max_${record.feature}`] || -1;
                    summary[record.feature] = {
                        used: record.usage_count,
                        limit: limit,
                        percentage: limit > 0 ? (record.usage_count / limit) * 100 : 0
                    };
                });
        }
        
        return summary;
    }

    async initializeUsageTracking(subscriptionId) {
        try {
            // Initialize usage tracking for the subscription
            console.log(`Initializing usage tracking for subscription ${subscriptionId}`);
        } catch (error) {
            console.error('Initialize usage tracking error:', error);
        }
    }

    async resetUsageTracking(subscriptionId) {
        try {
            // Reset usage counters for plan upgrade
            const currentMonth = new Date().toISOString().slice(0, 7);
            await supabaseService.delete(this.subscriptionUsageTable, {
                subscription_id: subscriptionId,
                period: currentMonth
            });
        } catch (error) {
            console.error('Reset usage tracking error:', error);
        }
    }

    async sendSubscriptionNotification(userId, type, data) {
        try {
            const messages = {
                subscription_created: `Welcome to ${data.plan_name}! Your subscription is now active.`,
                subscription_updated: `Your subscription has been updated from ${data.old_plan} to ${data.new_plan}.`,
                subscription_canceled: `Your ${data.plan_name} subscription has been ${data.immediate ? 'canceled immediately' : 'scheduled for cancellation'}.`
            };

            await supabaseService.insert(this.notificationsTable, {
                user_id: userId,
                type: type,
                title: 'Subscription Update',
                message: messages[type],
                data: data
            });
        } catch (error) {
            console.error('Send subscription notification error:', error);
        }
    }
}

// Export singleton instance
export const subscriptionManagementService = new SubscriptionManagementService();
