/**
 * Deal Management Service
 * Handles core business acquisition deal processing and lifecycle management
 * Supports 34-day acquisition timeline and comprehensive deal tracking
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class DealManagementService {
    constructor() {
        this.tableName = 'deals';
        this.documentsTable = 'deal_documents';
        this.milestonesTable = 'deal_milestones';
        this.activitiesTable = 'deal_activities';
    }

    /**
     * Create a new deal
     */
    async createDeal(dealData) {
        try {
            // Validate required fields
            const requiredFields = ['buyer_id', 'seller_id', 'listing_id', 'initial_offer'];
            for (const field of requiredFields) {
                if (!dealData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            // Set default dates for 34-day timeline
            const offerDate = dealData.offer_date || new Date();
            const closingDate = new Date(offerDate);
            closingDate.setDate(closingDate.getDate() + 34);

            const dealPayload = {
                ...dealData,
                offer_date: offerDate.toISOString().split('T')[0],
                closing_date: closingDate.toISOString().split('T')[0],
                due_diligence_deadline: this.calculateDueDiligenceDeadline(offerDate),
                financing_deadline: this.calculateFinancingDeadline(offerDate),
                status: dealData.status || 'initial_interest',
                priority: dealData.priority || 'medium',
                completion_percentage: 0
            };

            const result = await supabaseService.insert(this.tableName, dealPayload);

            if (result.success) {
                // Log deal creation activity
                await this.logActivity(result.data.id, 'deal_created', 'Deal created', {
                    initial_offer: dealData.initial_offer,
                    listing_id: dealData.listing_id
                });

                // Get full deal data with relationships
                return await this.getDealById(result.data.id);
            }

            return result;
        } catch (error) {
            console.error('Create deal error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get deal by ID with full relationships
     */
    async getDealById(dealId) {
        try {
            const result = await supabaseService.select(this.tableName, {
                select: `
                    *,
                    listing:listings (
                        id, title, asking_price, business_type, location, city, state
                    ),
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, company, email
                    ),
                    seller:profiles!seller_id (
                        id, first_name, last_name, company, email
                    ),
                    assigned:profiles!assigned_to (
                        id, first_name, last_name, company
                    )
                `,
                eq: { id: dealId },
                single: true
            });

            if (result.success) {
                // Get milestones and documents
                const [milestonesResult, documentsResult] = await Promise.all([
                    this.getDealMilestones(dealId),
                    this.getDealDocuments(dealId)
                ]);

                result.data.milestones = milestonesResult.success ? milestonesResult.data : [];
                result.data.documents = documentsResult.success ? documentsResult.data : [];
            }

            return result;
        } catch (error) {
            console.error('Get deal error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update deal status and progress
     */
    async updateDealStatus(dealId, newStatus, notes = null) {
        try {
            const updateData = {
                status: newStatus,
                updated_at: new Date().toISOString()
            };

            if (notes) {
                updateData.notes = notes;
            }

            // Update completion percentage based on status
            updateData.completion_percentage = this.getCompletionPercentageForStatus(newStatus);

            const result = await supabaseService.update(this.tableName, updateData, { id: dealId });

            if (result.success) {
                // Log status change activity
                await this.logActivity(dealId, 'status_change', `Deal status changed to ${newStatus}`, {
                    new_status: newStatus,
                    notes: notes
                });
            }

            return result;
        } catch (error) {
            console.error('Update deal status error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get deals for a user (buyer or seller)
     */
    async getUserDeals(userId, role = null) {
        try {
            let filter = {};
            
            if (role === 'buyer') {
                filter.buyer_id = userId;
            } else if (role === 'seller') {
                filter.seller_id = userId;
            } else {
                // Get deals where user is buyer, seller, or assigned
                const result = await supabaseService.select(this.tableName, {
                    select: `
                        *,
                        listing:listings (
                            id, title, asking_price, business_type, location
                        ),
                        buyer:profiles!buyer_id (
                            id, first_name, last_name, company
                        ),
                        seller:profiles!seller_id (
                            id, first_name, last_name, company
                        )
                    `,
                    or: `buyer_id.eq.${userId},seller_id.eq.${userId},assigned_to.eq.${userId}`,
                    order: { column: 'created_at', ascending: false }
                });
                return result;
            }

            const result = await supabaseService.select(this.tableName, {
                select: `
                    *,
                    listing:listings (
                        id, title, asking_price, business_type, location
                    ),
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, company
                    ),
                    seller:profiles!seller_id (
                        id, first_name, last_name, company
                    )
                `,
                ...filter,
                order: { column: 'created_at', ascending: false }
            });

            return result;
        } catch (error) {
            console.error('Get user deals error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get deal milestones
     */
    async getDealMilestones(dealId) {
        try {
            return await supabaseService.select(this.milestonesTable, {
                eq: { deal_id: dealId },
                order: { column: 'due_date', ascending: true }
            });
        } catch (error) {
            console.error('Get deal milestones error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Update milestone completion
     */
    async updateMilestone(milestoneId, updateData) {
        try {
            const payload = {
                ...updateData,
                updated_at: new Date().toISOString()
            };

            if (updateData.is_completed && !updateData.completed_date) {
                payload.completed_date = new Date().toISOString().split('T')[0];
            }

            const result = await supabaseService.update(this.milestonesTable, payload, { id: milestoneId });

            if (result.success && updateData.is_completed) {
                // Log milestone completion
                const milestone = await supabaseService.select(this.milestonesTable, {
                    eq: { id: milestoneId },
                    single: true
                });

                if (milestone.success) {
                    await this.logActivity(
                        milestone.data.deal_id,
                        'milestone_completed',
                        `Milestone completed: ${milestone.data.milestone_name}`,
                        { milestone_id: milestoneId }
                    );
                }
            }

            return result;
        } catch (error) {
            console.error('Update milestone error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get deal documents
     */
    async getDealDocuments(dealId) {
        try {
            return await supabaseService.select(this.documentsTable, {
                select: `
                    *,
                    uploader:profiles!uploaded_by (
                        id, first_name, last_name
                    )
                `,
                eq: { deal_id: dealId },
                order: { column: 'uploaded_at', ascending: false }
            });
        } catch (error) {
            console.error('Get deal documents error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Log deal activity
     */
    async logActivity(dealId, activityType, title, metadata = {}) {
        try {
            const user = await supabaseService.getCurrentUser();
            const userProfile = user ? await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            }) : null;

            const activityData = {
                deal_id: dealId,
                user_id: userProfile?.success ? userProfile.data.id : null,
                activity_type: activityType,
                title: title,
                metadata: metadata
            };

            return await supabaseService.insert(this.activitiesTable, activityData);
        } catch (error) {
            console.error('Log activity error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate due diligence deadline (14 days from offer)
     */
    calculateDueDiligenceDeadline(offerDate) {
        const deadline = new Date(offerDate);
        deadline.setDate(deadline.getDate() + 14);
        return deadline.toISOString().split('T')[0];
    }

    /**
     * Calculate financing deadline (28 days from offer)
     */
    calculateFinancingDeadline(offerDate) {
        const deadline = new Date(offerDate);
        deadline.setDate(deadline.getDate() + 28);
        return deadline.toISOString().split('T')[0];
    }

    /**
     * Get completion percentage based on status
     */
    getCompletionPercentageForStatus(status) {
        const statusPercentages = {
            'initial_interest': 10,
            'nda_signed': 20,
            'due_diligence': 40,
            'negotiation': 60,
            'financing': 75,
            'legal_review': 85,
            'closing': 95,
            'completed': 100,
            'cancelled': 0,
            'expired': 0
        };
        return statusPercentages[status] || 0;
    }

    /**
     * Get active deals (not completed, cancelled, or expired)
     */
    async getActiveDeals(userId = null) {
        try {
            let query = {
                select: `
                    *,
                    listing:listings (
                        id, title, asking_price, business_type, location
                    ),
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, company
                    ),
                    seller:profiles!seller_id (
                        id, first_name, last_name, company
                    )
                `,
                not: { status: 'in.(completed,cancelled,expired)' },
                order: { column: 'created_at', ascending: false }
            };

            if (userId) {
                query.or = `buyer_id.eq.${userId},seller_id.eq.${userId},assigned_to.eq.${userId}`;
            }

            return await supabaseService.select(this.tableName, query);
        } catch (error) {
            console.error('Get active deals error:', error);
            return { success: false, error: error.message };
        }
    }
}

// Export singleton instance
export const dealManagementService = new DealManagementService();
