/**
 * Badge Management Service
 * Handles badge application, verification, and management workflows
 * Provides premium badge features and verification processes
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';
import { stripePaymentService } from '../../payments/services/stripe-payment.service.js';

class BadgeManagementService {
    constructor() {
        this.badgeOrdersTable = 'badge_orders';
        this.userBadgesTable = 'user_badges';
        this.badgeVerificationTable = 'badge_verification';
        this.badgeDocumentsTable = 'badge_documents';
        this.notificationsTable = 'notifications';
        
        // Badge types and pricing
        this.badgeTypes = {
            express_seller_basic: {
                name: 'Express Seller Basic',
                price: 29900, // $299.00
                duration_months: 12,
                features: [
                    'Verified seller status',
                    'Basic listing promotion',
                    'Email support',
                    'Seller badge display'
                ],
                verification_required: ['business_license', 'identity']
            },
            express_seller_premium: {
                name: 'Express Seller Premium',
                price: 79900, // $799.00
                duration_months: 12,
                features: [
                    'All Basic features',
                    'Featured listing placement',
                    'Priority support',
                    'Advanced analytics',
                    'Premium badge display'
                ],
                verification_required: ['business_license', 'identity', 'financial_statements']
            },
            express_seller_elite: {
                name: 'Express Seller Elite',
                price: 149900, // $1,499.00
                duration_months: 12,
                features: [
                    'All Premium features',
                    'Top listing placement',
                    'Dedicated account manager',
                    'Custom marketing support',
                    'Elite badge display'
                ],
                verification_required: ['business_license', 'identity', 'financial_statements', 'references']
            },
            express_buyer_basic: {
                name: 'Express Buyer Basic',
                price: 19900, // $199.00
                duration_months: 12,
                features: [
                    'Verified buyer status',
                    'Access to seller contact info',
                    'Email support',
                    'Buyer badge display'
                ],
                verification_required: ['identity', 'financial_capability']
            },
            express_buyer_premium: {
                name: 'Express Buyer Premium',
                price: 49900, // $499.00
                duration_months: 12,
                features: [
                    'All Basic features',
                    'Priority access to new listings',
                    'Advanced search filters',
                    'Priority support',
                    'Premium buyer badge'
                ],
                verification_required: ['identity', 'financial_capability', 'proof_of_funds']
            },
            express_buyer_elite: {
                name: 'Express Buyer Elite',
                price: 99900, // $999.00
                duration_months: 12,
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
    }

    /**
     * Apply for a badge
     */
    async applyForBadge(badgeType, applicationData) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to apply for badges');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Validate badge type
            if (!this.badgeTypes[badgeType]) {
                throw new Error('Invalid badge type');
            }

            const badgeConfig = this.badgeTypes[badgeType];

            // Check if user already has this badge or pending application
            const existingBadge = await supabaseService.select(this.userBadgesTable, {
                eq: { 
                    user_id: userProfile.data.id,
                    badge_type: badgeType
                },
                single: true
            });

            if (existingBadge.success && existingBadge.data) {
                if (existingBadge.data.status === 'active') {
                    throw new Error('You already have this badge');
                } else if (existingBadge.data.status === 'pending') {
                    throw new Error('You already have a pending application for this badge');
                }
            }

            // Validate application data
            const validation = this.validateApplicationData(badgeType, applicationData);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Create badge order for payment
            const orderData = {
                user_id: userProfile.data.id,
                badge_type: badgeType,
                amount: badgeConfig.price,
                status: 'pending_payment',
                application_data: applicationData,
                metadata: {
                    badge_config: badgeConfig,
                    applied_at: new Date().toISOString()
                }
            };

            const orderResult = await supabaseService.insert(this.badgeOrdersTable, orderData);

            if (orderResult.success) {
                return {
                    success: true,
                    data: {
                        order_id: orderResult.data.id,
                        badge_type: badgeType,
                        amount: badgeConfig.price,
                        next_step: 'payment',
                        verification_required: badgeConfig.verification_required
                    }
                };
            }

            return orderResult;
        } catch (error) {
            console.error('Apply for badge error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Process badge payment
     */
    async processBadgePayment(orderId, paymentData) {
        try {
            // Get badge order
            const orderResult = await supabaseService.select(this.badgeOrdersTable, {
                eq: { id: orderId },
                single: true
            });

            if (!orderResult.success || !orderResult.data) {
                throw new Error('Badge order not found');
            }

            const order = orderResult.data;

            if (order.status !== 'pending_payment') {
                throw new Error('Order is not in pending payment status');
            }

            // Process payment through Stripe
            const paymentResult = await stripePaymentService.processBadgePayment({
                order_id: orderId,
                badge_type: order.badge_type,
                amount: order.amount,
                payment_method: paymentData.payment_method,
                customer_info: paymentData.customer_info
            });

            if (paymentResult.success) {
                // Update order status
                await supabaseService.update(this.badgeOrdersTable, {
                    status: 'paid',
                    payment_intent_id: paymentResult.data.payment_intent_id,
                    paid_at: new Date().toISOString()
                }, { id: orderId });

                // Create user badge record
                const badgeRecord = {
                    user_id: order.user_id,
                    badge_type: order.badge_type,
                    order_id: orderId,
                    status: 'pending_verification',
                    expires_at: this.calculateExpiryDate(order.badge_type),
                    application_data: order.application_data
                };

                const badgeResult = await supabaseService.insert(this.userBadgesTable, badgeRecord);

                if (badgeResult.success) {
                    // Start verification process
                    await this.initiateVerificationProcess(badgeResult.data.id);

                    return {
                        success: true,
                        data: {
                            badge_id: badgeResult.data.id,
                            status: 'pending_verification',
                            next_step: 'verification'
                        }
                    };
                }
            }

            return paymentResult;
        } catch (error) {
            console.error('Process badge payment error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Submit verification documents
     */
    async submitVerificationDocuments(badgeId, documents) {
        try {
            // Get badge record
            const badgeResult = await supabaseService.select(this.userBadgesTable, {
                eq: { id: badgeId },
                single: true
            });

            if (!badgeResult.success || !badgeResult.data) {
                throw new Error('Badge not found');
            }

            const badge = badgeResult.data;
            const badgeConfig = this.badgeTypes[badge.badge_type];

            // Validate required documents
            const validation = this.validateVerificationDocuments(badge.badge_type, documents);
            if (!validation.valid) {
                throw new Error(validation.error);
            }

            // Store documents
            const documentRecords = [];
            for (const doc of documents) {
                const docRecord = {
                    badge_id: badgeId,
                    document_type: doc.type,
                    file_url: doc.file_url,
                    file_name: doc.file_name,
                    file_size: doc.file_size,
                    uploaded_at: new Date().toISOString(),
                    metadata: doc.metadata || {}
                };

                const docResult = await supabaseService.insert(this.badgeDocumentsTable, docRecord);
                if (docResult.success) {
                    documentRecords.push(docResult.data);
                }
            }

            // Update badge status
            await supabaseService.update(this.userBadgesTable, {
                status: 'under_review',
                documents_submitted_at: new Date().toISOString()
            }, { id: badgeId });

            // Create verification record
            await this.createVerificationRecord(badgeId, {
                status: 'documents_submitted',
                documents: documentRecords,
                submitted_at: new Date().toISOString()
            });

            // Notify verification team
            await this.notifyVerificationTeam(badgeId);

            return {
                success: true,
                data: {
                    badge_id: badgeId,
                    status: 'under_review',
                    documents_submitted: documentRecords.length,
                    estimated_review_time: '3-5 business days'
                }
            };
        } catch (error) {
            console.error('Submit verification documents error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Review and approve/reject badge verification
     */
    async reviewBadgeVerification(badgeId, reviewData) {
        try {
            // Get current user (must be admin/reviewer)
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success || !['admin', 'reviewer'].includes(userProfile.data.role)) {
                throw new Error('Insufficient permissions to review badges');
            }

            // Get badge record
            const badgeResult = await supabaseService.select(this.userBadgesTable, {
                select: `
                    *,
                    user:profiles!user_id (
                        id, first_name, last_name, email, user_id
                    )
                `,
                eq: { id: badgeId },
                single: true
            });

            if (!badgeResult.success || !badgeResult.data) {
                throw new Error('Badge not found');
            }

            const badge = badgeResult.data;

            // Update badge status based on review decision
            const updateData = {
                status: reviewData.approved ? 'active' : 'rejected',
                reviewed_by: userProfile.data.id,
                reviewed_at: new Date().toISOString(),
                review_notes: reviewData.notes || null
            };

            if (reviewData.approved) {
                updateData.activated_at = new Date().toISOString();
            }

            const updateResult = await supabaseService.update(this.userBadgesTable, updateData, { id: badgeId });

            if (updateResult.success) {
                // Update verification record
                await this.updateVerificationRecord(badgeId, {
                    status: reviewData.approved ? 'approved' : 'rejected',
                    reviewer_id: userProfile.data.id,
                    review_notes: reviewData.notes,
                    reviewed_at: new Date().toISOString()
                });

                // Send notification to user
                await this.notifyBadgeDecision(badge.user.user_id, {
                    badge_type: badge.badge_type,
                    approved: reviewData.approved,
                    notes: reviewData.notes
                });

                // If approved, grant badge features
                if (reviewData.approved) {
                    await this.activateBadgeFeatures(badgeId);
                }

                return {
                    success: true,
                    data: {
                        badge_id: badgeId,
                        status: updateData.status,
                        decision: reviewData.approved ? 'approved' : 'rejected'
                    }
                };
            }

            return updateResult;
        } catch (error) {
            console.error('Review badge verification error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get user badges
     */
    async getUserBadges(userId) {
        try {
            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: userId },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            const result = await supabaseService.select(this.userBadgesTable, {
                select: `
                    *,
                    verification:badge_verification (*)
                `,
                eq: { user_id: userProfile.data.id },
                order: { column: 'created_at', ascending: false }
            });

            if (result.success) {
                // Add badge configuration details
                result.data = result.data.map(badge => ({
                    ...badge,
                    config: this.badgeTypes[badge.badge_type],
                    is_active: badge.status === 'active' && new Date(badge.expires_at) > new Date(),
                    days_until_expiry: this.calculateDaysUntilExpiry(badge.expires_at)
                }));
            }

            return result;
        } catch (error) {
            console.error('Get user badges error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get badge verification status
     */
    async getBadgeVerificationStatus(badgeId) {
        try {
            const result = await supabaseService.select(this.userBadgesTable, {
                select: `
                    *,
                    verification:badge_verification (*),
                    documents:badge_documents (*)
                `,
                eq: { id: badgeId },
                single: true
            });

            if (result.success && result.data) {
                result.data.config = this.badgeTypes[result.data.badge_type];
                result.data.required_documents = this.badgeTypes[result.data.badge_type].verification_required;
                result.data.submitted_documents = result.data.documents?.map(d => d.document_type) || [];
                result.data.missing_documents = result.data.required_documents.filter(
                    req => !result.data.submitted_documents.includes(req)
                );
            }

            return result;
        } catch (error) {
            console.error('Get badge verification status error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Renew badge
     */
    async renewBadge(badgeId) {
        try {
            // Get badge record
            const badgeResult = await supabaseService.select(this.userBadgesTable, {
                eq: { id: badgeId },
                single: true
            });

            if (!badgeResult.success || !badgeResult.data) {
                throw new Error('Badge not found');
            }

            const badge = badgeResult.data;
            const badgeConfig = this.badgeTypes[badge.badge_type];

            // Check if badge is eligible for renewal (within 30 days of expiry)
            const daysUntilExpiry = this.calculateDaysUntilExpiry(badge.expires_at);
            if (daysUntilExpiry > 30) {
                throw new Error('Badge can only be renewed within 30 days of expiry');
            }

            // Create renewal order
            const renewalData = {
                user_id: badge.user_id,
                badge_type: badge.badge_type,
                amount: badgeConfig.price,
                status: 'pending_payment',
                is_renewal: true,
                original_badge_id: badgeId,
                metadata: {
                    renewal_for: badgeId,
                    original_expires_at: badge.expires_at
                }
            };

            const orderResult = await supabaseService.insert(this.badgeOrdersTable, renewalData);

            if (orderResult.success) {
                return {
                    success: true,
                    data: {
                        renewal_order_id: orderResult.data.id,
                        amount: badgeConfig.price,
                        next_step: 'payment'
                    }
                };
            }

            return orderResult;
        } catch (error) {
            console.error('Renew badge error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validation and utility methods
     */
    validateApplicationData(badgeType, data) {
        const badgeConfig = this.badgeTypes[badgeType];
        
        if (!data.business_name && badgeType.includes('seller')) {
            return { valid: false, error: 'Business name is required for seller badges' };
        }

        if (!data.experience_years || data.experience_years < 0) {
            return { valid: false, error: 'Experience years must be provided' };
        }

        if (badgeType.includes('buyer') && (!data.investment_range || !data.investment_range.min)) {
            return { valid: false, error: 'Investment range is required for buyer badges' };
        }

        return { valid: true };
    }

    validateVerificationDocuments(badgeType, documents) {
        const required = this.badgeTypes[badgeType].verification_required;
        const submitted = documents.map(d => d.type);
        const missing = required.filter(req => !submitted.includes(req));

        if (missing.length > 0) {
            return { 
                valid: false, 
                error: `Missing required documents: ${missing.join(', ')}` 
            };
        }

        return { valid: true };
    }

    calculateExpiryDate(badgeType) {
        const months = this.badgeTypes[badgeType].duration_months;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + months);
        return expiryDate.toISOString();
    }

    calculateDaysUntilExpiry(expiryDate) {
        const now = new Date();
        const expiry = new Date(expiryDate);
        const diffTime = expiry - now;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    async initiateVerificationProcess(badgeId) {
        try {
            await supabaseService.insert(this.badgeVerificationTable, {
                badge_id: badgeId,
                status: 'initiated',
                initiated_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Initiate verification process error:', error);
        }
    }

    async createVerificationRecord(badgeId, data) {
        try {
            await supabaseService.update(this.badgeVerificationTable, {
                ...data,
                updated_at: new Date().toISOString()
            }, { badge_id: badgeId });
        } catch (error) {
            console.error('Create verification record error:', error);
        }
    }

    async updateVerificationRecord(badgeId, data) {
        try {
            await supabaseService.update(this.badgeVerificationTable, {
                ...data,
                updated_at: new Date().toISOString()
            }, { badge_id: badgeId });
        } catch (error) {
            console.error('Update verification record error:', error);
        }
    }

    async notifyVerificationTeam(badgeId) {
        try {
            // This would send notification to verification team
            console.log(`Badge ${badgeId} ready for verification review`);
        } catch (error) {
            console.error('Notify verification team error:', error);
        }
    }

    async notifyBadgeDecision(userId, data) {
        try {
            await supabaseService.insert(this.notificationsTable, {
                user_id: userId,
                type: 'badge_decision',
                title: data.approved ? 'Badge Approved!' : 'Badge Application Update',
                message: data.approved ? 
                    `Your ${this.badgeTypes[data.badge_type].name} badge has been approved and activated.` :
                    `Your ${this.badgeTypes[data.badge_type].name} badge application was not approved. ${data.notes || ''}`,
                data: data
            });
        } catch (error) {
            console.error('Notify badge decision error:', error);
        }
    }

    async activateBadgeFeatures(badgeId) {
        try {
            // This would activate badge-specific features
            // e.g., listing promotion, priority support, etc.
            console.log(`Activating features for badge ${badgeId}`);
        } catch (error) {
            console.error('Activate badge features error:', error);
        }
    }
}

// Export singleton instance
export const badgeManagementService = new BadgeManagementService();
