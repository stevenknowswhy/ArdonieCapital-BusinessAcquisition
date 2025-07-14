/**
 * Inquiry Service
 * Handles buyer inquiries and seller responses for marketplace listings
 * Facilitates communication and transaction initiation between buyers and sellers
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';
import { messagingService } from '../../messaging/services/messaging.service.js';

class InquiryService {
    constructor() {
        this.inquiriesTable = 'listing_inquiries';
        this.responsesTable = 'inquiry_responses';
        this.notificationsTable = 'notifications';
        this.analyticsTable = 'analytics_events';
    }

    /**
     * Submit buyer inquiry for a listing
     */
    async submitInquiry(listingId, inquiryData) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to submit inquiries');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Get listing details
            const listingResult = await supabaseService.select('listings', {
                select: `
                    *,
                    seller:profiles!seller_id (
                        id, first_name, last_name, company, user_id
                    )
                `,
                eq: { id: listingId },
                single: true
            });

            if (!listingResult.success) {
                throw new Error('Listing not found');
            }

            const listing = listingResult.data;

            // Validate inquiry data
            const validatedData = this.validateInquiryData(inquiryData);
            if (!validatedData.valid) {
                throw new Error(validatedData.error);
            }

            // Create inquiry record
            const inquiryRecord = {
                listing_id: listingId,
                buyer_id: userProfile.data.id,
                seller_id: listing.seller_id,
                inquiry_type: inquiryData.inquiry_type || 'general',
                message: inquiryData.message,
                buyer_qualifications: inquiryData.buyer_qualifications || {},
                financing_details: inquiryData.financing_details || {},
                timeline: inquiryData.timeline || null,
                status: 'pending',
                priority: this.calculateInquiryPriority(inquiryData),
                metadata: {
                    user_agent: navigator.userAgent,
                    referrer: document.referrer,
                    timestamp: new Date().toISOString()
                }
            };

            const result = await supabaseService.insert(this.inquiriesTable, inquiryRecord);

            if (result.success) {
                // Send notification to seller
                await this.notifySeller(listing.seller.user_id, {
                    inquiry_id: result.data.id,
                    listing_title: listing.title,
                    buyer_name: `${userProfile.data.first_name} ${userProfile.data.last_name}`,
                    inquiry_type: inquiryData.inquiry_type
                });

                // Track analytics
                await this.trackInquiryEvent('inquiry_submitted', {
                    listing_id: listingId,
                    inquiry_id: result.data.id,
                    inquiry_type: inquiryData.inquiry_type
                });

                // Update listing inquiry count
                await this.incrementListingInquiryCount(listingId);

                return {
                    success: true,
                    data: {
                        inquiry_id: result.data.id,
                        status: 'submitted',
                        estimated_response_time: '24-48 hours'
                    }
                };
            }

            return result;
        } catch (error) {
            console.error('Submit inquiry error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get inquiries for a seller
     */
    async getSellerInquiries(sellerId, filters = {}) {
        try {
            let query = {
                select: `
                    *,
                    listing:listings (
                        id, title, asking_price, business_type, location
                    ),
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, company, phone
                    )
                `,
                eq: { seller_id: sellerId },
                order: { column: 'created_at', ascending: false }
            };

            // Apply filters
            if (filters.status) {
                query.eq.status = filters.status;
            }

            if (filters.inquiry_type) {
                query.eq.inquiry_type = filters.inquiry_type;
            }

            if (filters.priority) {
                query.eq.priority = filters.priority;
            }

            const result = await supabaseService.select(this.inquiriesTable, query);

            if (result.success) {
                // Get response counts for each inquiry
                for (const inquiry of result.data) {
                    const responseCount = await this.getInquiryResponseCount(inquiry.id);
                    inquiry.response_count = responseCount;
                    inquiry.has_unread_responses = await this.hasUnreadResponses(inquiry.id, sellerId);
                }
            }

            return result;
        } catch (error) {
            console.error('Get seller inquiries error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get inquiries for a buyer
     */
    async getBuyerInquiries(buyerId, filters = {}) {
        try {
            let query = {
                select: `
                    *,
                    listing:listings (
                        id, title, asking_price, business_type, location
                    ),
                    seller:profiles!seller_id (
                        id, first_name, last_name, company
                    )
                `,
                eq: { buyer_id: buyerId },
                order: { column: 'created_at', ascending: false }
            };

            // Apply filters
            if (filters.status) {
                query.eq.status = filters.status;
            }

            const result = await supabaseService.select(this.inquiriesTable, query);

            if (result.success) {
                // Get response counts and latest responses
                for (const inquiry of result.data) {
                    const responseCount = await this.getInquiryResponseCount(inquiry.id);
                    inquiry.response_count = responseCount;
                    
                    const latestResponse = await this.getLatestInquiryResponse(inquiry.id);
                    inquiry.latest_response = latestResponse;
                    inquiry.has_unread_responses = await this.hasUnreadResponses(inquiry.id, buyerId);
                }
            }

            return result;
        } catch (error) {
            console.error('Get buyer inquiries error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Respond to an inquiry
     */
    async respondToInquiry(inquiryId, responseData) {
        try {
            // Get current user
            const user = await supabaseService.getCurrentUser();
            if (!user) {
                throw new Error('User must be logged in to respond to inquiries');
            }

            const userProfile = await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            });

            if (!userProfile.success) {
                throw new Error('User profile not found');
            }

            // Get inquiry details
            const inquiryResult = await supabaseService.select(this.inquiriesTable, {
                select: `
                    *,
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, user_id
                    ),
                    listing:listings (
                        id, title
                    )
                `,
                eq: { id: inquiryId },
                single: true
            });

            if (!inquiryResult.success) {
                throw new Error('Inquiry not found');
            }

            const inquiry = inquiryResult.data;

            // Create response record
            const responseRecord = {
                inquiry_id: inquiryId,
                responder_id: userProfile.data.id,
                message: responseData.message,
                response_type: responseData.response_type || 'message',
                attachments: responseData.attachments || [],
                next_steps: responseData.next_steps || null,
                meeting_proposed: responseData.meeting_proposed || false,
                meeting_details: responseData.meeting_details || null
            };

            const result = await supabaseService.insert(this.responsesTable, responseRecord);

            if (result.success) {
                // Update inquiry status
                await supabaseService.update(this.inquiriesTable, {
                    status: 'responded',
                    last_response_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }, { id: inquiryId });

                // Send notification to buyer
                await this.notifyBuyer(inquiry.buyer.user_id, {
                    inquiry_id: inquiryId,
                    listing_title: inquiry.listing.title,
                    response_type: responseData.response_type
                });

                // Track analytics
                await this.trackInquiryEvent('inquiry_responded', {
                    inquiry_id: inquiryId,
                    response_id: result.data.id,
                    response_type: responseData.response_type
                });

                return {
                    success: true,
                    data: {
                        response_id: result.data.id,
                        inquiry_status: 'responded'
                    }
                };
            }

            return result;
        } catch (error) {
            console.error('Respond to inquiry error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get inquiry conversation (inquiry + all responses)
     */
    async getInquiryConversation(inquiryId) {
        try {
            // Get inquiry details
            const inquiryResult = await supabaseService.select(this.inquiriesTable, {
                select: `
                    *,
                    listing:listings (
                        id, title, asking_price, business_type, location
                    ),
                    buyer:profiles!buyer_id (
                        id, first_name, last_name, company, avatar_url
                    ),
                    seller:profiles!seller_id (
                        id, first_name, last_name, company, avatar_url
                    )
                `,
                eq: { id: inquiryId },
                single: true
            });

            if (!inquiryResult.success) {
                return inquiryResult;
            }

            // Get all responses
            const responsesResult = await supabaseService.select(this.responsesTable, {
                select: `
                    *,
                    responder:profiles!responder_id (
                        id, first_name, last_name, company, avatar_url
                    )
                `,
                eq: { inquiry_id: inquiryId },
                order: { column: 'created_at', ascending: true }
            });

            return {
                success: true,
                data: {
                    inquiry: inquiryResult.data,
                    responses: responsesResult.success ? responsesResult.data : [],
                    conversation_id: inquiryId
                }
            };
        } catch (error) {
            console.error('Get inquiry conversation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Mark inquiry as interested (move to next stage)
     */
    async markAsInterested(inquiryId, interestData) {
        try {
            const updateData = {
                status: 'interested',
                interest_level: interestData.interest_level || 'high',
                next_steps: interestData.next_steps || 'Schedule meeting',
                updated_at: new Date().toISOString()
            };

            const result = await supabaseService.update(this.inquiriesTable, updateData, { id: inquiryId });

            if (result.success) {
                // Track analytics
                await this.trackInquiryEvent('inquiry_interested', {
                    inquiry_id: inquiryId,
                    interest_level: interestData.interest_level
                });
            }

            return result;
        } catch (error) {
            console.error('Mark as interested error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Convert inquiry to deal
     */
    async convertToDeal(inquiryId, dealData) {
        try {
            // Get inquiry details
            const inquiryResult = await supabaseService.select(this.inquiriesTable, {
                eq: { id: inquiryId },
                single: true
            });

            if (!inquiryResult.success) {
                throw new Error('Inquiry not found');
            }

            const inquiry = inquiryResult.data;

            // Create deal using deal management service
            const { dealManagementService } = await import('../../deals/index.js');
            
            const dealResult = await dealManagementService.createDeal({
                buyer_id: inquiry.buyer_id,
                seller_id: inquiry.seller_id,
                listing_id: inquiry.listing_id,
                initial_offer: dealData.offer_amount,
                deal_terms: dealData.terms || {},
                notes: `Created from inquiry #${inquiryId}`,
                metadata: {
                    source: 'inquiry_conversion',
                    inquiry_id: inquiryId
                }
            });

            if (dealResult.success) {
                // Update inquiry status
                await supabaseService.update(this.inquiriesTable, {
                    status: 'converted_to_deal',
                    deal_id: dealResult.data.id,
                    updated_at: new Date().toISOString()
                }, { id: inquiryId });

                // Track analytics
                await this.trackInquiryEvent('inquiry_converted', {
                    inquiry_id: inquiryId,
                    deal_id: dealResult.data.id
                });

                return {
                    success: true,
                    data: {
                        deal_id: dealResult.data.id,
                        inquiry_status: 'converted_to_deal'
                    }
                };
            }

            return dealResult;
        } catch (error) {
            console.error('Convert to deal error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Validate inquiry data
     */
    validateInquiryData(data) {
        if (!data.message || data.message.trim().length < 10) {
            return { valid: false, error: 'Message must be at least 10 characters long' };
        }

        if (data.message.length > 2000) {
            return { valid: false, error: 'Message cannot exceed 2000 characters' };
        }

        const validInquiryTypes = ['general', 'pricing', 'financing', 'due_diligence', 'meeting_request'];
        if (data.inquiry_type && !validInquiryTypes.includes(data.inquiry_type)) {
            return { valid: false, error: 'Invalid inquiry type' };
        }

        return { valid: true };
    }

    /**
     * Calculate inquiry priority based on buyer qualifications
     */
    calculateInquiryPriority(inquiryData) {
        let priority = 'medium';

        // High priority factors
        if (inquiryData.financing_details?.pre_approved) priority = 'high';
        if (inquiryData.buyer_qualifications?.experience_years > 5) priority = 'high';
        if (inquiryData.timeline === 'immediate') priority = 'urgent';

        // Low priority factors
        if (!inquiryData.financing_details || Object.keys(inquiryData.financing_details).length === 0) {
            priority = 'low';
        }

        return priority;
    }

    /**
     * Helper methods
     */
    async getInquiryResponseCount(inquiryId) {
        try {
            const result = await supabaseService.select(this.responsesTable, {
                eq: { inquiry_id: inquiryId },
                count: 'exact'
            });
            return result.success ? result.count : 0;
        } catch (error) {
            return 0;
        }
    }

    async getLatestInquiryResponse(inquiryId) {
        try {
            const result = await supabaseService.select(this.responsesTable, {
                eq: { inquiry_id: inquiryId },
                order: { column: 'created_at', ascending: false },
                limit: 1,
                single: true
            });
            return result.success ? result.data : null;
        } catch (error) {
            return null;
        }
    }

    async hasUnreadResponses(inquiryId, userId) {
        // This would check for unread responses based on user's last read timestamp
        // Implementation depends on read tracking system
        return false; // Placeholder
    }

    async notifySeller(sellerUserId, notificationData) {
        try {
            await supabaseService.insert(this.notificationsTable, {
                user_id: sellerUserId,
                type: 'new_inquiry',
                title: 'New Buyer Inquiry',
                message: `${notificationData.buyer_name} is interested in "${notificationData.listing_title}"`,
                data: notificationData
            });
        } catch (error) {
            console.error('Notify seller error:', error);
        }
    }

    async notifyBuyer(buyerUserId, notificationData) {
        try {
            await supabaseService.insert(this.notificationsTable, {
                user_id: buyerUserId,
                type: 'inquiry_response',
                title: 'Seller Response Received',
                message: `The seller has responded to your inquiry about "${notificationData.listing_title}"`,
                data: notificationData
            });
        } catch (error) {
            console.error('Notify buyer error:', error);
        }
    }

    async trackInquiryEvent(eventType, eventData) {
        try {
            await supabaseService.insert(this.analyticsTable, {
                event_type: eventType,
                event_data: eventData,
                created_at: new Date().toISOString()
            });
        } catch (error) {
            console.error('Track inquiry event error:', error);
        }
    }

    async incrementListingInquiryCount(listingId) {
        try {
            // This would increment the inquiries_count field on the listing
            const listing = await supabaseService.select('listings', {
                eq: { id: listingId },
                single: true
            });

            if (listing.success) {
                await supabaseService.update('listings', {
                    inquiries_count: (listing.data.inquiries_count || 0) + 1
                }, { id: listingId });
            }
        } catch (error) {
            console.error('Increment inquiry count error:', error);
        }
    }
}

// Export singleton instance
export const inquiryService = new InquiryService();
