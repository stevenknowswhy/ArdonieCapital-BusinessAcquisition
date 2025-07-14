/**
 * Listing Analytics Service
 * Provides comprehensive analytics and insights for marketplace listings
 * Tracks views, engagement, conversion rates, and performance metrics
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';

class ListingAnalyticsService {
    constructor() {
        this.analyticsTable = 'listing_analytics';
        this.viewsTable = 'listing_views';
        this.engagementTable = 'listing_engagement';
        this.performanceTable = 'listing_performance';
    }

    /**
     * Track listing view
     */
    async trackView(listingId, viewData = {}) {
        try {
            const user = await supabaseService.getCurrentUser();
            const userProfile = user ? await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            }) : null;

            const viewRecord = {
                listing_id: listingId,
                viewer_id: userProfile?.success ? userProfile.data.id : null,
                session_id: this.getSessionId(),
                ip_address: await this.getClientIP(),
                user_agent: navigator.userAgent,
                referrer: document.referrer || null,
                page_url: window.location.href,
                view_duration: viewData.duration || null,
                device_type: this.getDeviceType(),
                browser: this.getBrowser(),
                location: viewData.location || null,
                metadata: {
                    timestamp: new Date().toISOString(),
                    viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight
                    },
                    ...viewData.metadata
                }
            };

            const result = await supabaseService.insert(this.viewsTable, viewRecord);

            if (result.success) {
                // Update listing view count
                await this.incrementViewCount(listingId);
                
                // Update daily analytics
                await this.updateDailyAnalytics(listingId, 'view');
            }

            return result;
        } catch (error) {
            console.error('Track view error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Track listing engagement (clicks, saves, shares, etc.)
     */
    async trackEngagement(listingId, engagementType, engagementData = {}) {
        try {
            const user = await supabaseService.getCurrentUser();
            const userProfile = user ? await supabaseService.select('profiles', {
                eq: { user_id: user.id },
                single: true
            }) : null;

            const engagementRecord = {
                listing_id: listingId,
                user_id: userProfile?.success ? userProfile.data.id : null,
                engagement_type: engagementType, // 'save', 'share', 'contact', 'phone_click', 'email_click', etc.
                session_id: this.getSessionId(),
                metadata: {
                    timestamp: new Date().toISOString(),
                    ...engagementData
                }
            };

            const result = await supabaseService.insert(this.engagementTable, engagementRecord);

            if (result.success) {
                // Update daily analytics
                await this.updateDailyAnalytics(listingId, engagementType);
                
                // Update engagement metrics
                await this.updateEngagementMetrics(listingId, engagementType);
            }

            return result;
        } catch (error) {
            console.error('Track engagement error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get comprehensive analytics for a listing
     */
    async getListingAnalytics(listingId, dateRange = null) {
        try {
            const endDate = dateRange?.end || new Date();
            const startDate = dateRange?.start || new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago

            // Get view analytics
            const viewsResult = await this.getViewAnalytics(listingId, { start: startDate, end: endDate });
            
            // Get engagement analytics
            const engagementResult = await this.getEngagementAnalytics(listingId, { start: startDate, end: endDate });
            
            // Get conversion analytics
            const conversionResult = await this.getConversionAnalytics(listingId, { start: startDate, end: endDate });
            
            // Get performance metrics
            const performanceResult = await this.getPerformanceMetrics(listingId);

            return {
                success: true,
                data: {
                    listing_id: listingId,
                    date_range: { start: startDate, end: endDate },
                    views: viewsResult.success ? viewsResult.data : {},
                    engagement: engagementResult.success ? engagementResult.data : {},
                    conversion: conversionResult.success ? conversionResult.data : {},
                    performance: performanceResult.success ? performanceResult.data : {},
                    summary: await this.generateAnalyticsSummary(listingId, { start: startDate, end: endDate })
                }
            };
        } catch (error) {
            console.error('Get listing analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get view analytics
     */
    async getViewAnalytics(listingId, dateRange) {
        try {
            const viewsQuery = {
                eq: { listing_id: listingId },
                gte: { created_at: dateRange.start.toISOString() },
                lte: { created_at: dateRange.end.toISOString() }
            };

            const viewsResult = await supabaseService.select(this.viewsTable, viewsQuery);

            if (viewsResult.success) {
                const views = viewsResult.data;
                
                const analytics = {
                    total_views: views.length,
                    unique_views: new Set(views.map(v => v.viewer_id || v.session_id)).size,
                    average_duration: this.calculateAverageDuration(views),
                    views_by_day: this.groupViewsByDay(views),
                    views_by_device: this.groupViewsByDevice(views),
                    views_by_source: this.groupViewsBySource(views),
                    top_referrers: this.getTopReferrers(views),
                    bounce_rate: this.calculateBounceRate(views),
                    return_visitor_rate: this.calculateReturnVisitorRate(views)
                };

                return { success: true, data: analytics };
            }

            return viewsResult;
        } catch (error) {
            console.error('Get view analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get engagement analytics
     */
    async getEngagementAnalytics(listingId, dateRange) {
        try {
            const engagementQuery = {
                eq: { listing_id: listingId },
                gte: { created_at: dateRange.start.toISOString() },
                lte: { created_at: dateRange.end.toISOString() }
            };

            const engagementResult = await supabaseService.select(this.engagementTable, engagementQuery);

            if (engagementResult.success) {
                const engagements = engagementResult.data;
                
                const analytics = {
                    total_engagements: engagements.length,
                    engagement_rate: await this.calculateEngagementRate(listingId, dateRange),
                    engagements_by_type: this.groupEngagementsByType(engagements),
                    engagements_by_day: this.groupEngagementsByDay(engagements),
                    most_engaged_users: this.getMostEngagedUsers(engagements),
                    engagement_funnel: await this.getEngagementFunnel(listingId, dateRange)
                };

                return { success: true, data: analytics };
            }

            return engagementResult;
        } catch (error) {
            console.error('Get engagement analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get conversion analytics
     */
    async getConversionAnalytics(listingId, dateRange) {
        try {
            // Get inquiries for this listing
            const inquiriesResult = await supabaseService.select('listing_inquiries', {
                eq: { listing_id: listingId },
                gte: { created_at: dateRange.start.toISOString() },
                lte: { created_at: dateRange.end.toISOString() }
            });

            // Get deals for this listing
            const dealsResult = await supabaseService.select('deals', {
                eq: { listing_id: listingId },
                gte: { created_at: dateRange.start.toISOString() },
                lte: { created_at: dateRange.end.toISOString() }
            });

            // Get views for conversion rate calculation
            const viewsResult = await supabaseService.select(this.viewsTable, {
                eq: { listing_id: listingId },
                gte: { created_at: dateRange.start.toISOString() },
                lte: { created_at: dateRange.end.toISOString() }
            });

            const inquiries = inquiriesResult.success ? inquiriesResult.data : [];
            const deals = dealsResult.success ? dealsResult.data : [];
            const totalViews = viewsResult.success ? viewsResult.data.length : 0;

            const analytics = {
                total_inquiries: inquiries.length,
                total_deals: deals.length,
                inquiry_conversion_rate: totalViews > 0 ? (inquiries.length / totalViews) * 100 : 0,
                deal_conversion_rate: inquiries.length > 0 ? (deals.length / inquiries.length) * 100 : 0,
                overall_conversion_rate: totalViews > 0 ? (deals.length / totalViews) * 100 : 0,
                inquiries_by_type: this.groupInquiriesByType(inquiries),
                deals_by_status: this.groupDealsByStatus(deals),
                conversion_funnel: {
                    views: totalViews,
                    inquiries: inquiries.length,
                    deals: deals.length,
                    completed_deals: deals.filter(d => d.status === 'completed').length
                }
            };

            return { success: true, data: analytics };
        } catch (error) {
            console.error('Get conversion analytics error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get performance metrics
     */
    async getPerformanceMetrics(listingId) {
        try {
            const listing = await supabaseService.select('listings', {
                eq: { id: listingId },
                single: true
            });

            if (!listing.success) {
                throw new Error('Listing not found');
            }

            const listingData = listing.data;
            const daysListed = Math.ceil((new Date() - new Date(listingData.created_at)) / (1000 * 60 * 60 * 24));

            // Get recent performance data
            const recentViews = await supabaseService.select(this.viewsTable, {
                eq: { listing_id: listingId },
                gte: { created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
            });

            const recentInquiries = await supabaseService.select('listing_inquiries', {
                eq: { listing_id: listingId },
                gte: { created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() }
            });

            const metrics = {
                days_listed: daysListed,
                total_views: listingData.views_count || 0,
                total_inquiries: listingData.inquiries_count || 0,
                views_per_day: daysListed > 0 ? (listingData.views_count || 0) / daysListed : 0,
                inquiries_per_day: daysListed > 0 ? (listingData.inquiries_count || 0) / daysListed : 0,
                recent_views_7d: recentViews.success ? recentViews.data.length : 0,
                recent_inquiries_7d: recentInquiries.success ? recentInquiries.data.length : 0,
                performance_score: await this.calculatePerformanceScore(listingId),
                market_position: await this.getMarketPosition(listingId),
                optimization_suggestions: await this.getOptimizationSuggestions(listingId)
            };

            return { success: true, data: metrics };
        } catch (error) {
            console.error('Get performance metrics error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate analytics summary
     */
    async generateAnalyticsSummary(listingId, dateRange) {
        try {
            const [views, engagements, conversions] = await Promise.all([
                this.getViewAnalytics(listingId, dateRange),
                this.getEngagementAnalytics(listingId, dateRange),
                this.getConversionAnalytics(listingId, dateRange)
            ]);

            const summary = {
                total_views: views.success ? views.data.total_views : 0,
                unique_views: views.success ? views.data.unique_views : 0,
                total_engagements: engagements.success ? engagements.data.total_engagements : 0,
                total_inquiries: conversions.success ? conversions.data.total_inquiries : 0,
                conversion_rate: conversions.success ? conversions.data.inquiry_conversion_rate : 0,
                engagement_rate: engagements.success ? engagements.data.engagement_rate : 0,
                performance_trend: await this.getPerformanceTrend(listingId),
                key_insights: await this.generateKeyInsights(listingId, dateRange)
            };

            return summary;
        } catch (error) {
            console.error('Generate analytics summary error:', error);
            return {};
        }
    }

    /**
     * Helper methods for analytics calculations
     */
    calculateAverageDuration(views) {
        const durationsWithValues = views.filter(v => v.view_duration && v.view_duration > 0);
        if (durationsWithValues.length === 0) return 0;
        
        const totalDuration = durationsWithValues.reduce((sum, v) => sum + v.view_duration, 0);
        return Math.round(totalDuration / durationsWithValues.length);
    }

    groupViewsByDay(views) {
        const grouped = {};
        views.forEach(view => {
            const date = new Date(view.created_at).toISOString().split('T')[0];
            grouped[date] = (grouped[date] || 0) + 1;
        });
        return grouped;
    }

    groupViewsByDevice(views) {
        const grouped = {};
        views.forEach(view => {
            const device = view.device_type || 'unknown';
            grouped[device] = (grouped[device] || 0) + 1;
        });
        return grouped;
    }

    groupViewsBySource(views) {
        const grouped = {};
        views.forEach(view => {
            const source = this.getSourceFromReferrer(view.referrer);
            grouped[source] = (grouped[source] || 0) + 1;
        });
        return grouped;
    }

    getTopReferrers(views) {
        const referrers = {};
        views.forEach(view => {
            if (view.referrer) {
                const domain = new URL(view.referrer).hostname;
                referrers[domain] = (referrers[domain] || 0) + 1;
            }
        });
        
        return Object.entries(referrers)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([domain, count]) => ({ domain, count }));
    }

    calculateBounceRate(views) {
        const shortViews = views.filter(v => v.view_duration && v.view_duration < 30); // Less than 30 seconds
        return views.length > 0 ? (shortViews.length / views.length) * 100 : 0;
    }

    calculateReturnVisitorRate(views) {
        const viewerCounts = {};
        views.forEach(view => {
            const viewerId = view.viewer_id || view.session_id;
            viewerCounts[viewerId] = (viewerCounts[viewerId] || 0) + 1;
        });
        
        const returnVisitors = Object.values(viewerCounts).filter(count => count > 1).length;
        const totalVisitors = Object.keys(viewerCounts).length;
        
        return totalVisitors > 0 ? (returnVisitors / totalVisitors) * 100 : 0;
    }

    async calculateEngagementRate(listingId, dateRange) {
        const viewsResult = await supabaseService.select(this.viewsTable, {
            eq: { listing_id: listingId },
            gte: { created_at: dateRange.start.toISOString() },
            lte: { created_at: dateRange.end.toISOString() }
        });

        const engagementsResult = await supabaseService.select(this.engagementTable, {
            eq: { listing_id: listingId },
            gte: { created_at: dateRange.start.toISOString() },
            lte: { created_at: dateRange.end.toISOString() }
        });

        const totalViews = viewsResult.success ? viewsResult.data.length : 0;
        const totalEngagements = engagementsResult.success ? engagementsResult.data.length : 0;

        return totalViews > 0 ? (totalEngagements / totalViews) * 100 : 0;
    }

    /**
     * Utility methods
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
            sessionStorage.setItem('session_id', sessionId);
        }
        return sessionId;
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return null;
        }
    }

    getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/tablet|ipad|playbook|silk/i.test(userAgent)) return 'tablet';
        if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) return 'mobile';
        return 'desktop';
    }

    getBrowser() {
        const userAgent = navigator.userAgent;
        if (userAgent.includes('Chrome')) return 'Chrome';
        if (userAgent.includes('Firefox')) return 'Firefox';
        if (userAgent.includes('Safari')) return 'Safari';
        if (userAgent.includes('Edge')) return 'Edge';
        return 'Other';
    }

    getSourceFromReferrer(referrer) {
        if (!referrer) return 'direct';
        
        try {
            const domain = new URL(referrer).hostname;
            if (domain.includes('google')) return 'google';
            if (domain.includes('facebook')) return 'facebook';
            if (domain.includes('linkedin')) return 'linkedin';
            if (domain.includes('twitter')) return 'twitter';
            return 'referral';
        } catch (error) {
            return 'unknown';
        }
    }

    async updateDailyAnalytics(listingId, eventType) {
        // Update daily analytics aggregation
        // This would typically be handled by a background job
    }

    async updateEngagementMetrics(listingId, engagementType) {
        // Update engagement metrics on the listing
        // This would increment specific engagement counters
    }

    async incrementViewCount(listingId) {
        try {
            const listing = await supabaseService.select('listings', {
                eq: { id: listingId },
                single: true
            });

            if (listing.success) {
                await supabaseService.update('listings', {
                    views_count: (listing.data.views_count || 0) + 1,
                    last_viewed_at: new Date().toISOString()
                }, { id: listingId });
            }
        } catch (error) {
            console.error('Increment view count error:', error);
        }
    }

    // Additional helper methods would be implemented here...
    groupEngagementsByType(engagements) { /* Implementation */ }
    groupEngagementsByDay(engagements) { /* Implementation */ }
    getMostEngagedUsers(engagements) { /* Implementation */ }
    async getEngagementFunnel(listingId, dateRange) { /* Implementation */ }
    groupInquiriesByType(inquiries) { /* Implementation */ }
    groupDealsByStatus(deals) { /* Implementation */ }
    async calculatePerformanceScore(listingId) { /* Implementation */ }
    async getMarketPosition(listingId) { /* Implementation */ }
    async getOptimizationSuggestions(listingId) { /* Implementation */ }
    async getPerformanceTrend(listingId) { /* Implementation */ }
    async generateKeyInsights(listingId, dateRange) { /* Implementation */ }
}

// Export singleton instance
export const listingAnalyticsService = new ListingAnalyticsService();
