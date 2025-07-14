/**
 * Timeline Tracking Service
 * Manages 34-day acquisition timeline and milestone tracking
 * Provides automated notifications and progress monitoring
 */

import { supabaseService } from '../../../shared/services/supabase/supabase.service.js';
import { dealManagementService } from './deal-management.service.js';

class TimelineTrackingService {
    constructor() {
        this.milestonesTable = 'deal_milestones';
        this.dealsTable = 'deals';
        this.notificationsTable = 'notifications';
    }

    /**
     * Get timeline for a deal with progress tracking
     */
    async getDealTimeline(dealId) {
        try {
            const [dealResult, milestonesResult] = await Promise.all([
                supabaseService.select(this.dealsTable, {
                    eq: { id: dealId },
                    single: true
                }),
                supabaseService.select(this.milestonesTable, {
                    eq: { deal_id: dealId },
                    order: { column: 'due_date', ascending: true }
                })
            ]);

            if (!dealResult.success || !milestonesResult.success) {
                return { success: false, error: 'Failed to fetch timeline data' };
            }

            const deal = dealResult.data;
            const milestones = milestonesResult.data;

            // Calculate timeline metrics
            const timelineMetrics = this.calculateTimelineMetrics(deal, milestones);

            return {
                success: true,
                data: {
                    deal: deal,
                    milestones: milestones,
                    metrics: timelineMetrics,
                    timeline_status: this.getTimelineStatus(deal, milestones),
                    critical_path: this.getCriticalPath(milestones),
                    upcoming_deadlines: this.getUpcomingDeadlines(milestones)
                }
            };
        } catch (error) {
            console.error('Get deal timeline error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate timeline metrics and progress
     */
    calculateTimelineMetrics(deal, milestones) {
        const totalMilestones = milestones.length;
        const completedMilestones = milestones.filter(m => m.is_completed).length;
        const overdueMilestones = milestones.filter(m => 
            !m.is_completed && new Date(m.due_date) < new Date()
        ).length;

        const startDate = new Date(deal.offer_date);
        const targetCloseDate = new Date(deal.closing_date);
        const today = new Date();
        
        const totalDays = Math.ceil((targetCloseDate - startDate) / (1000 * 60 * 60 * 24));
        const elapsedDays = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
        const remainingDays = Math.max(0, totalDays - elapsedDays);

        const progressPercentage = totalMilestones > 0 ? 
            Math.round((completedMilestones / totalMilestones) * 100) : 0;

        const timeProgressPercentage = totalDays > 0 ? 
            Math.min(100, Math.round((elapsedDays / totalDays) * 100)) : 0;

        return {
            total_milestones: totalMilestones,
            completed_milestones: completedMilestones,
            overdue_milestones: overdueMilestones,
            progress_percentage: progressPercentage,
            time_progress_percentage: timeProgressPercentage,
            total_days: totalDays,
            elapsed_days: elapsedDays,
            remaining_days: remainingDays,
            is_on_track: progressPercentage >= timeProgressPercentage - 10, // 10% tolerance
            start_date: deal.offer_date,
            target_close_date: deal.closing_date
        };
    }

    /**
     * Get timeline status (on_track, at_risk, delayed)
     */
    getTimelineStatus(deal, milestones) {
        const metrics = this.calculateTimelineMetrics(deal, milestones);
        
        if (metrics.overdue_milestones > 0) {
            return 'delayed';
        } else if (metrics.progress_percentage < metrics.time_progress_percentage - 15) {
            return 'at_risk';
        } else {
            return 'on_track';
        }
    }

    /**
     * Get critical path milestones
     */
    getCriticalPath(milestones) {
        return milestones
            .filter(m => m.is_critical)
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }

    /**
     * Get upcoming deadlines (next 7 days)
     */
    getUpcomingDeadlines(milestones) {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        return milestones
            .filter(m => {
                if (m.is_completed) return false;
                const dueDate = new Date(m.due_date);
                return dueDate >= today && dueDate <= nextWeek;
            })
            .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    }

    /**
     * Update milestone and recalculate timeline
     */
    async updateMilestoneProgress(milestoneId, progressData) {
        try {
            // Update the milestone
            const updateResult = await dealManagementService.updateMilestone(milestoneId, progressData);
            
            if (!updateResult.success) {
                return updateResult;
            }

            // Get the milestone to find the deal ID
            const milestoneResult = await supabaseService.select(this.milestonesTable, {
                eq: { id: milestoneId },
                single: true
            });

            if (milestoneResult.success) {
                const dealId = milestoneResult.data.deal_id;
                
                // Recalculate deal completion percentage
                await this.recalculateDealProgress(dealId);
                
                // Check for timeline alerts
                await this.checkTimelineAlerts(dealId);
                
                // Return updated timeline
                return await this.getDealTimeline(dealId);
            }

            return updateResult;
        } catch (error) {
            console.error('Update milestone progress error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Recalculate deal progress based on milestones
     */
    async recalculateDealProgress(dealId) {
        try {
            const milestonesResult = await supabaseService.select(this.milestonesTable, {
                eq: { deal_id: dealId }
            });

            if (milestonesResult.success) {
                const milestones = milestonesResult.data;
                const totalMilestones = milestones.length;
                const completedMilestones = milestones.filter(m => m.is_completed).length;
                
                const completionPercentage = totalMilestones > 0 ? 
                    Math.round((completedMilestones / totalMilestones) * 100) : 0;

                // Update deal completion percentage
                await supabaseService.update(this.dealsTable, {
                    completion_percentage: completionPercentage,
                    updated_at: new Date().toISOString()
                }, { id: dealId });

                // Check if deal should be marked as completed
                if (completionPercentage === 100) {
                    await supabaseService.update(this.dealsTable, {
                        status: 'completed',
                        actual_closing_date: new Date().toISOString().split('T')[0]
                    }, { id: dealId });
                }
            }
        } catch (error) {
            console.error('Recalculate deal progress error:', error);
        }
    }

    /**
     * Check for timeline alerts and send notifications
     */
    async checkTimelineAlerts(dealId) {
        try {
            const timelineResult = await this.getDealTimeline(dealId);
            
            if (!timelineResult.success) return;

            const { deal, metrics, upcoming_deadlines } = timelineResult.data;
            
            // Alert for overdue milestones
            if (metrics.overdue_milestones > 0) {
                await this.sendTimelineAlert(dealId, 'overdue_milestones', {
                    count: metrics.overdue_milestones,
                    deal_number: deal.deal_number
                });
            }

            // Alert for upcoming deadlines
            if (upcoming_deadlines.length > 0) {
                await this.sendTimelineAlert(dealId, 'upcoming_deadlines', {
                    deadlines: upcoming_deadlines,
                    deal_number: deal.deal_number
                });
            }

            // Alert if deal is at risk
            if (metrics.progress_percentage < metrics.time_progress_percentage - 15) {
                await this.sendTimelineAlert(dealId, 'deal_at_risk', {
                    progress_gap: metrics.time_progress_percentage - metrics.progress_percentage,
                    deal_number: deal.deal_number
                });
            }
        } catch (error) {
            console.error('Check timeline alerts error:', error);
        }
    }

    /**
     * Send timeline alert notification
     */
    async sendTimelineAlert(dealId, alertType, alertData) {
        try {
            // Get deal participants
            const dealResult = await supabaseService.select(this.dealsTable, {
                eq: { id: dealId },
                single: true
            });

            if (!dealResult.success) return;

            const deal = dealResult.data;
            const recipients = [deal.buyer_id, deal.seller_id];
            
            if (deal.assigned_to) {
                recipients.push(deal.assigned_to);
            }

            // Create notification for each participant
            const notifications = recipients.map(userId => ({
                user_id: userId,
                type: `timeline_${alertType}`,
                title: this.getAlertTitle(alertType, alertData),
                message: this.getAlertMessage(alertType, alertData),
                data: {
                    deal_id: dealId,
                    alert_type: alertType,
                    ...alertData
                }
            }));

            // Insert notifications
            await supabaseService.insert(this.notificationsTable, notifications);
        } catch (error) {
            console.error('Send timeline alert error:', error);
        }
    }

    /**
     * Get alert title based on type
     */
    getAlertTitle(alertType, data) {
        switch (alertType) {
            case 'overdue_milestones':
                return `${data.count} Overdue Milestone${data.count > 1 ? 's' : ''}`;
            case 'upcoming_deadlines':
                return `${data.deadlines.length} Upcoming Deadline${data.deadlines.length > 1 ? 's' : ''}`;
            case 'deal_at_risk':
                return 'Deal Timeline At Risk';
            default:
                return 'Timeline Alert';
        }
    }

    /**
     * Get alert message based on type
     */
    getAlertMessage(alertType, data) {
        switch (alertType) {
            case 'overdue_milestones':
                return `Deal ${data.deal_number} has ${data.count} overdue milestone${data.count > 1 ? 's' : ''}. Please review and update progress.`;
            case 'upcoming_deadlines':
                return `Deal ${data.deal_number} has ${data.deadlines.length} deadline${data.deadlines.length > 1 ? 's' : ''} coming up in the next 7 days.`;
            case 'deal_at_risk':
                return `Deal ${data.deal_number} is ${data.progress_gap}% behind schedule. Consider reviewing timeline and priorities.`;
            default:
                return 'Please check your deal timeline for updates.';
        }
    }

    /**
     * Get timeline summary for dashboard
     */
    async getTimelineSummary(userId) {
        try {
            // Get user's active deals
            const dealsResult = await dealManagementService.getActiveDeals(userId);
            
            if (!dealsResult.success) {
                return dealsResult;
            }

            const deals = dealsResult.data;
            let totalOverdue = 0;
            let totalUpcoming = 0;
            let dealsAtRisk = 0;

            // Analyze each deal's timeline
            for (const deal of deals) {
                const timelineResult = await this.getDealTimeline(deal.id);
                if (timelineResult.success) {
                    const { metrics, upcoming_deadlines } = timelineResult.data;
                    totalOverdue += metrics.overdue_milestones;
                    totalUpcoming += upcoming_deadlines.length;
                    
                    if (metrics.progress_percentage < metrics.time_progress_percentage - 15) {
                        dealsAtRisk++;
                    }
                }
            }

            return {
                success: true,
                data: {
                    total_active_deals: deals.length,
                    total_overdue_milestones: totalOverdue,
                    total_upcoming_deadlines: totalUpcoming,
                    deals_at_risk: dealsAtRisk,
                    timeline_health: this.calculateTimelineHealth(deals.length, totalOverdue, dealsAtRisk)
                }
            };
        } catch (error) {
            console.error('Get timeline summary error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Calculate overall timeline health score
     */
    calculateTimelineHealth(totalDeals, overdueCount, atRiskCount) {
        if (totalDeals === 0) return 'excellent';
        
        const overdueRatio = overdueCount / totalDeals;
        const riskRatio = atRiskCount / totalDeals;
        
        if (overdueRatio > 0.3 || riskRatio > 0.5) return 'poor';
        if (overdueRatio > 0.1 || riskRatio > 0.3) return 'fair';
        if (overdueRatio > 0 || riskRatio > 0.1) return 'good';
        return 'excellent';
    }
}

// Export singleton instance
export const timelineTrackingService = new TimelineTrackingService();
