/**
 * Fee Calculation Service
 * Handles all fee calculations for the BuyMartV1 platform
 * Supports transaction fees, badge fees, subscription fees, and vendor referrals
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class FeeCalculationService {
    constructor() {
        this.feeConfigTable = 'fee_configurations';
        this.feeTransactionsTable = 'fee_transactions';
        
        // Default fee structure
        this.defaultFees = {
            transaction: {
                percentage: 0.05, // 5%
                minimum: 500, // $5.00
                maximum: 50000 // $500.00
            },
            badges: {
                express_seller_basic: 29900, // $299.00
                express_seller_premium: 79900, // $799.00
                express_seller_elite: 149900, // $1,499.00
                express_buyer_basic: 19900, // $199.00
                express_buyer_premium: 49900, // $499.00
                express_buyer_elite: 99900 // $999.00
            },
            subscriptions: {
                buyer_pro: 4900, // $49.00/month
                seller_pro: 14900, // $149.00/month
                vendor_pro: 9900 // $99.00/month
            },
            vendor_referrals: {
                legal: 0.15, // 15%
                accounting: 0.20, // 20%
                financial: 0.25, // 25%
                consulting: 0.10, // 10%
                default: 0.15 // 15%
            }
        };
    }

    /**
     * Calculate transaction fee for a deal
     */
    async calculateTransactionFee(dealValue, customPercentage = null) {
        try {
            const feeConfig = await this.getFeeConfiguration('transaction');
            const percentage = customPercentage || feeConfig.percentage || this.defaultFees.transaction.percentage;
            const minimum = feeConfig.minimum || this.defaultFees.transaction.minimum;
            const maximum = feeConfig.maximum || this.defaultFees.transaction.maximum;

            const calculatedFee = dealValue * percentage;
            const finalFee = Math.max(minimum, Math.min(calculatedFee, maximum));

            return {
                success: true,
                data: {
                    deal_value: dealValue,
                    fee_percentage: percentage,
                    calculated_fee: calculatedFee,
                    final_fee: finalFee,
                    minimum_fee: minimum,
                    maximum_fee: maximum,
                    fee_applied: finalFee === calculatedFee ? 'calculated' : 
                                finalFee === minimum ? 'minimum' : 'maximum'
                }
            };
        } catch (error) {
            console.error('Calculate transaction fee error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate badge fee
     */
    async calculateBadgeFee(badgeType, discountCode = null) {
        try {
            const baseFee = this.defaultFees.badges[badgeType];
            if (!baseFee) {
                throw new Error('Invalid badge type');
            }

            let finalFee = baseFee;
            let discount = 0;
            let discountDetails = null;

            // Apply discount if provided
            if (discountCode) {
                const discountResult = await this.applyDiscount(baseFee, discountCode, 'badge');
                if (discountResult.success) {
                    finalFee = discountResult.data.discounted_amount;
                    discount = discountResult.data.discount_amount;
                    discountDetails = discountResult.data;
                }
            }

            return {
                success: true,
                data: {
                    badge_type: badgeType,
                    base_fee: baseFee,
                    discount_amount: discount,
                    final_fee: finalFee,
                    discount_details: discountDetails,
                    formatted_fee: this.formatAmount(finalFee)
                }
            };
        } catch (error) {
            console.error('Calculate badge fee error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate subscription fee
     */
    async calculateSubscriptionFee(planType, billingCycle = 'monthly', discountCode = null) {
        try {
            const monthlyFee = this.defaultFees.subscriptions[planType];
            if (!monthlyFee) {
                throw new Error('Invalid subscription plan');
            }

            let baseFee = monthlyFee;
            
            // Apply billing cycle multiplier
            const cycleMultipliers = {
                monthly: 1,
                quarterly: 3 * 0.95, // 5% discount for quarterly
                annually: 12 * 0.85 // 15% discount for annual
            };

            baseFee = monthlyFee * (cycleMultipliers[billingCycle] || 1);

            let finalFee = baseFee;
            let discount = 0;
            let discountDetails = null;

            // Apply discount if provided
            if (discountCode) {
                const discountResult = await this.applyDiscount(baseFee, discountCode, 'subscription');
                if (discountResult.success) {
                    finalFee = discountResult.data.discounted_amount;
                    discount = discountResult.data.discount_amount;
                    discountDetails = discountResult.data;
                }
            }

            return {
                success: true,
                data: {
                    plan_type: planType,
                    billing_cycle: billingCycle,
                    monthly_fee: monthlyFee,
                    base_fee: baseFee,
                    discount_amount: discount,
                    final_fee: finalFee,
                    discount_details: discountDetails,
                    formatted_fee: this.formatAmount(finalFee)
                }
            };
        } catch (error) {
            console.error('Calculate subscription fee error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate vendor referral fee
     */
    async calculateVendorReferralFee(serviceAmount, vendorCategory, customPercentage = null) {
        try {
            const percentage = customPercentage || 
                             this.defaultFees.vendor_referrals[vendorCategory] || 
                             this.defaultFees.vendor_referrals.default;

            const referralFee = serviceAmount * percentage;

            return {
                success: true,
                data: {
                    service_amount: serviceAmount,
                    vendor_category: vendorCategory,
                    referral_percentage: percentage,
                    referral_fee: referralFee,
                    vendor_receives: serviceAmount - referralFee,
                    formatted_fee: this.formatAmount(referralFee),
                    formatted_vendor_amount: this.formatAmount(serviceAmount - referralFee)
                }
            };
        } catch (error) {
            console.error('Calculate vendor referral fee error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Apply discount code
     */
    async applyDiscount(baseAmount, discountCode, feeType) {
        try {
            // Get discount configuration from database
            const discountResult = await supabaseService.select('discount_codes', {
                eq: { 
                    code: discountCode.toUpperCase(),
                    is_active: true
                },
                single: true
            });

            if (!discountResult.success || !discountResult.data) {
                return { success: false, error: 'Invalid or expired discount code' };
            }

            const discount = discountResult.data;

            // Check if discount applies to this fee type
            if (discount.applicable_to && !discount.applicable_to.includes(feeType)) {
                return { success: false, error: 'Discount code not applicable to this fee type' };
            }

            // Check expiration date
            if (discount.expires_at && new Date(discount.expires_at) < new Date()) {
                return { success: false, error: 'Discount code has expired' };
            }

            // Check usage limits
            if (discount.max_uses && discount.times_used >= discount.max_uses) {
                return { success: false, error: 'Discount code usage limit reached' };
            }

            // Calculate discount amount
            let discountAmount = 0;
            if (discount.discount_type === 'percentage') {
                discountAmount = baseAmount * (discount.discount_value / 100);
            } else if (discount.discount_type === 'fixed') {
                discountAmount = discount.discount_value * 100; // Convert to cents
            }

            // Apply maximum discount limit if set
            if (discount.max_discount_amount) {
                discountAmount = Math.min(discountAmount, discount.max_discount_amount * 100);
            }

            const discountedAmount = Math.max(0, baseAmount - discountAmount);

            return {
                success: true,
                data: {
                    discount_code: discountCode,
                    discount_type: discount.discount_type,
                    discount_value: discount.discount_value,
                    discount_amount: discountAmount,
                    discounted_amount: discountedAmount,
                    savings_percentage: baseAmount > 0 ? (discountAmount / baseAmount) * 100 : 0
                }
            };
        } catch (error) {
            console.error('Apply discount error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Record fee transaction
     */
    async recordFeeTransaction(feeData) {
        try {
            const transactionData = {
                fee_type: feeData.fee_type,
                amount: feeData.amount,
                deal_id: feeData.deal_id || null,
                user_id: feeData.user_id || null,
                vendor_id: feeData.vendor_id || null,
                payment_intent_id: feeData.payment_intent_id || null,
                status: feeData.status || 'pending',
                metadata: feeData.metadata || {},
                created_at: new Date().toISOString()
            };

            return await supabaseService.insert(this.feeTransactionsTable, transactionData);
        } catch (error) {
            console.error('Record fee transaction error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get fee configuration from database
     */
    async getFeeConfiguration(feeType) {
        try {
            const result = await supabaseService.select(this.feeConfigTable, {
                eq: { fee_type: feeType, is_active: true },
                single: true
            });

            if (result.success && result.data) {
                return result.data;
            }

            // Return default configuration if not found in database
            return this.defaultFees[feeType] || {};
        } catch (error) {
            console.error('Get fee configuration error:', error);
            return this.defaultFees[feeType] || {};
        }
    }

    /**
     * Update fee configuration
     */
    async updateFeeConfiguration(feeType, newConfig) {
        try {
            // Check if configuration exists
            const existingResult = await supabaseService.select(this.feeConfigTable, {
                eq: { fee_type: feeType },
                single: true
            });

            const configData = {
                fee_type: feeType,
                ...newConfig,
                updated_at: new Date().toISOString()
            };

            if (existingResult.success && existingResult.data) {
                // Update existing configuration
                return await supabaseService.update(this.feeConfigTable, configData, {
                    id: existingResult.data.id
                });
            } else {
                // Create new configuration
                configData.created_at = new Date().toISOString();
                return await supabaseService.insert(this.feeConfigTable, configData);
            }
        } catch (error) {
            console.error('Update fee configuration error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get fee summary for a user
     */
    async getUserFeeSummary(userId, dateRange = null) {
        try {
            let query = {
                eq: { user_id: userId },
                order: { column: 'created_at', ascending: false }
            };

            if (dateRange) {
                query.gte = { created_at: dateRange.start };
                query.lte = { created_at: dateRange.end };
            }

            const result = await supabaseService.select(this.feeTransactionsTable, query);

            if (result.success) {
                const transactions = result.data;
                const summary = {
                    total_fees_paid: 0,
                    transaction_fees: 0,
                    badge_fees: 0,
                    subscription_fees: 0,
                    transaction_count: transactions.length,
                    by_type: {}
                };

                transactions.forEach(transaction => {
                    summary.total_fees_paid += transaction.amount;
                    
                    if (transaction.fee_type === 'transaction') {
                        summary.transaction_fees += transaction.amount;
                    } else if (transaction.fee_type === 'badge') {
                        summary.badge_fees += transaction.amount;
                    } else if (transaction.fee_type === 'subscription') {
                        summary.subscription_fees += transaction.amount;
                    }

                    if (!summary.by_type[transaction.fee_type]) {
                        summary.by_type[transaction.fee_type] = 0;
                    }
                    summary.by_type[transaction.fee_type] += transaction.amount;
                });

                return { success: true, data: { summary, transactions } };
            }

            return result;
        } catch (error) {
            console.error('Get user fee summary error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Format amount for display
     */
    formatAmount(amountInCents) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amountInCents / 100);
    }

    /**
     * Get all fee types and their current rates
     */
    getFeeStructure() {
        return {
            transaction_fees: {
                description: 'Success-based fees on completed deals',
                percentage: this.defaultFees.transaction.percentage * 100,
                minimum: this.formatAmount(this.defaultFees.transaction.minimum),
                maximum: this.formatAmount(this.defaultFees.transaction.maximum)
            },
            badge_fees: {
                description: 'One-time verification and certification fees',
                options: Object.keys(this.defaultFees.badges).map(type => ({
                    type: type,
                    name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    price: this.formatAmount(this.defaultFees.badges[type])
                }))
            },
            subscription_fees: {
                description: 'Monthly premium feature access',
                plans: Object.keys(this.defaultFees.subscriptions).map(type => ({
                    type: type,
                    name: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                    monthly_price: this.formatAmount(this.defaultFees.subscriptions[type])
                }))
            },
            vendor_referral_fees: {
                description: 'Commission on vendor service referrals',
                categories: Object.keys(this.defaultFees.vendor_referrals).map(category => ({
                    category: category,
                    percentage: this.defaultFees.vendor_referrals[category] * 100
                }))
            }
        };
    }
}

// Export singleton instance
export const feeCalculationService = new FeeCalculationService();
