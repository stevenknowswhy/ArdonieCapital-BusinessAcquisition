/**
 * Dashboard Service Tests
 * Comprehensive tests for the dashboard service functionality
 */

import { DashboardService } from '../../../src/features/dashboard/services/dashboard.service.js';
import { TestUtils, TestAssertions } from '../../setup.js';

describe('DashboardService', () => {
    let dashboardService;
    let mockFetch;
    let mockLocalStorage;

    beforeEach(() => {
        TestUtils.resetMocks();
        dashboardService = new DashboardService();
        mockFetch = jest.fn();
        mockLocalStorage = TestUtils.mockLocalStorage();
        
        global.fetch = mockFetch;
        global.localStorage = mockLocalStorage;
    });

    describe('Analytics Data', () => {
        test('should fetch analytics data successfully', async () => {
            const mockAnalytics = TestUtils.createTestData('dashboard').analytics;
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockAnalytics 
            }));

            const result = await dashboardService.getAnalytics();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockAnalytics);
            expect(mockFetch).toHaveBeenCalledWith('/api/dashboard/analytics', expect.any(Object));
        });

        test('should handle analytics fetch failure', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: false, 
                error: 'Analytics unavailable' 
            }, 503));

            const result = await dashboardService.getAnalytics();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Analytics unavailable');
        });

        test('should cache analytics data', async () => {
            const mockAnalytics = TestUtils.createTestData('dashboard').analytics;
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockAnalytics 
            }));

            // First call
            await dashboardService.getAnalytics();
            // Second call should use cache
            await dashboardService.getAnalytics();

            expect(mockFetch).toHaveBeenCalledTimes(1);
        });

        test('should refresh analytics data when forced', async () => {
            const mockAnalytics = TestUtils.createTestData('dashboard').analytics;
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockAnalytics 
            }));

            await dashboardService.getAnalytics();
            await dashboardService.getAnalytics(true); // Force refresh

            expect(mockFetch).toHaveBeenCalledTimes(2);
        });
    });

    describe('KPI Management', () => {
        test('should calculate KPIs correctly', () => {
            const data = {
                totalViews: 1000,
                totalInquiries: 50,
                totalSales: 10,
                revenue: 100000
            };

            const kpis = dashboardService.calculateKPIs(data);

            expect(kpis.conversionRate).toBe(5.0); // 50/1000 * 100
            expect(kpis.salesConversionRate).toBe(20.0); // 10/50 * 100
            expect(kpis.averageOrderValue).toBe(10000); // 100000/10
        });

        test('should handle zero values in KPI calculations', () => {
            const data = {
                totalViews: 0,
                totalInquiries: 0,
                totalSales: 0,
                revenue: 0
            };

            const kpis = dashboardService.calculateKPIs(data);

            expect(kpis.conversionRate).toBe(0);
            expect(kpis.salesConversionRate).toBe(0);
            expect(kpis.averageOrderValue).toBe(0);
        });

        test('should format KPI values correctly', () => {
            const kpis = {
                conversionRate: 5.555,
                salesConversionRate: 20.123,
                averageOrderValue: 10000.99
            };

            const formatted = dashboardService.formatKPIs(kpis);

            expect(formatted.conversionRate).toBe('5.56%');
            expect(formatted.salesConversionRate).toBe('20.12%');
            expect(formatted.averageOrderValue).toBe('$10,001');
        });
    });

    describe('Notifications', () => {
        test('should fetch notifications successfully', async () => {
            const mockNotifications = TestUtils.createTestData('dashboard').notifications;
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockNotifications 
            }));

            const result = await dashboardService.getNotifications();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockNotifications);
        });

        test('should mark notification as read', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));

            const result = await dashboardService.markNotificationRead('notification-1');

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/dashboard/notifications/notification-1/read',
                expect.objectContaining({ method: 'PATCH' })
            );
        });

        test('should clear all notifications', async () => {
            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));

            const result = await dashboardService.clearAllNotifications();

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/dashboard/notifications/clear',
                expect.objectContaining({ method: 'DELETE' })
            );
        });

        test('should filter notifications by type', () => {
            const notifications = [
                { id: '1', type: 'info', message: 'Info message' },
                { id: '2', type: 'warning', message: 'Warning message' },
                { id: '3', type: 'error', message: 'Error message' },
                { id: '4', type: 'info', message: 'Another info' }
            ];

            const infoNotifications = dashboardService.filterNotifications(notifications, 'info');
            const warningNotifications = dashboardService.filterNotifications(notifications, 'warning');

            expect(infoNotifications).toHaveLength(2);
            expect(warningNotifications).toHaveLength(1);
            expect(infoNotifications[0].type).toBe('info');
            expect(warningNotifications[0].type).toBe('warning');
        });
    });

    describe('Widget Management', () => {
        test('should get available widgets', () => {
            const widgets = dashboardService.getAvailableWidgets();

            expect(widgets).toBeInstanceOf(Array);
            expect(widgets.length).toBeGreaterThan(0);
            expect(widgets[0]).toHaveProperty('id');
            expect(widgets[0]).toHaveProperty('name');
            expect(widgets[0]).toHaveProperty('component');
        });

        test('should save widget configuration', async () => {
            const config = {
                widgets: ['analytics', 'notifications', 'recent-activity'],
                layout: 'grid'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ success: true }));

            const result = await dashboardService.saveWidgetConfig(config);

            expect(result.success).toBe(true);
            expect(mockFetch).toHaveBeenCalledWith(
                '/api/dashboard/widgets/config',
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(config)
                })
            );
        });

        test('should load widget configuration', async () => {
            const mockConfig = {
                widgets: ['analytics', 'notifications'],
                layout: 'list'
            };

            mockFetch.mockResolvedValue(TestUtils.mockFetch({ 
                success: true, 
                data: mockConfig 
            }));

            const result = await dashboardService.loadWidgetConfig();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockConfig);
        });

        test('should validate widget configuration', () => {
            const validConfig = {
                widgets: ['analytics', 'notifications'],
                layout: 'grid'
            };

            const invalidConfig = {
                widgets: ['invalid-widget'],
                layout: 'invalid-layout'
            };

            expect(dashboardService.validateWidgetConfig(validConfig)).toBe(true);
            expect(dashboardService.validateWidgetConfig(invalidConfig)).toBe(false);
        });
    });

    describe('Data Export', () => {
        test('should export dashboard data as CSV', async () => {
            const mockData = {
                analytics: TestUtils.createTestData('dashboard').analytics,
                notifications: TestUtils.createTestData('dashboard').notifications
            };

            const csvData = await dashboardService.exportToCSV(mockData);

            expect(csvData).toContain('totalViews,totalInquiries');
            expect(csvData).toContain('1000,50');
        });

        test('should export dashboard data as JSON', async () => {
            const mockData = {
                analytics: TestUtils.createTestData('dashboard').analytics
            };

            const jsonData = await dashboardService.exportToJSON(mockData);
            const parsed = JSON.parse(jsonData);

            expect(parsed).toEqual(mockData);
            expect(parsed.analytics.totalViews).toBe(1000);
        });

        test('should handle export errors gracefully', async () => {
            const invalidData = { circular: {} };
            invalidData.circular.ref = invalidData;

            const result = await dashboardService.exportToJSON(invalidData);

            expect(result).toContain('error');
        });
    });

    describe('Real-time Updates', () => {
        test('should start real-time updates', () => {
            const mockCallback = jest.fn();
            
            dashboardService.startRealTimeUpdates(mockCallback);

            expect(dashboardService.isRealTimeActive).toBe(true);
            expect(dashboardService.updateCallback).toBe(mockCallback);
        });

        test('should stop real-time updates', () => {
            dashboardService.startRealTimeUpdates(jest.fn());
            dashboardService.stopRealTimeUpdates();

            expect(dashboardService.isRealTimeActive).toBe(false);
            expect(dashboardService.updateCallback).toBeNull();
        });

        test('should handle real-time data updates', () => {
            const mockCallback = jest.fn();
            const updateData = { totalViews: 1100 };

            dashboardService.startRealTimeUpdates(mockCallback);
            dashboardService.handleRealTimeUpdate(updateData);

            expect(mockCallback).toHaveBeenCalledWith(updateData);
        });
    });

    describe('Error Handling', () => {
        test('should handle network errors', async () => {
            mockFetch.mockRejectedValue(new Error('Network error'));

            const result = await dashboardService.getAnalytics();

            expect(result.success).toBe(false);
            expect(result.error).toContain('Network error');
        });

        test('should handle invalid API responses', async () => {
            mockFetch.mockResolvedValue({
                ok: false,
                status: 500,
                json: () => Promise.resolve({ error: 'Internal server error' })
            });

            const result = await dashboardService.getAnalytics();

            expect(result.success).toBe(false);
            expect(result.error).toBeTruthy();
        });

        test('should handle malformed JSON responses', async () => {
            mockFetch.mockResolvedValue({
                ok: true,
                json: () => Promise.reject(new Error('Invalid JSON'))
            });

            const result = await dashboardService.getAnalytics();

            expect(result.success).toBe(false);
            expect(result.error).toContain('Invalid JSON');
        });
    });

    describe('Caching', () => {
        test('should cache data with expiration', async () => {
            const mockData = { test: 'data' };
            
            dashboardService.setCacheData('test-key', mockData, 1000);
            const cachedData = dashboardService.getCacheData('test-key');

            expect(cachedData).toEqual(mockData);
        });

        test('should return null for expired cache', async () => {
            const mockData = { test: 'data' };
            
            dashboardService.setCacheData('test-key', mockData, -1000); // Expired
            const cachedData = dashboardService.getCacheData('test-key');

            expect(cachedData).toBeNull();
        });

        test('should clear cache', () => {
            dashboardService.setCacheData('test-key', { test: 'data' });
            dashboardService.clearCache();
            
            const cachedData = dashboardService.getCacheData('test-key');
            expect(cachedData).toBeNull();
        });
    });
});
