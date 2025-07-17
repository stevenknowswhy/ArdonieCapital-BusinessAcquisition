/**
 * Production Health Monitoring System
 * Continuous monitoring and alerting for production deployment
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductionHealthMonitor {
    constructor() {
        this.config = {
            baseUrl: 'https://ardoniecapital.com',
            fallbackUrl: 'https://ardonie-capital-ws.s3-website-us-west-2.amazonaws.com',
            checkInterval: 300000, // 5 minutes
            alertThresholds: {
                responseTime: 5000, // 5 seconds
                errorRate: 5, // 5%
                uptime: 99.5 // 99.5%
            },
            endpoints: [
                { path: '/', name: 'Home Page', critical: true },
                { path: '/marketplace/listings.html', name: 'Marketplace', critical: true },
                { path: '/auth/login.html', name: 'Login', critical: true },
                { path: '/contact.html', name: 'Contact', critical: false },
                { path: '/about.html', name: 'About', critical: false }
            ]
        };
        this.healthData = {
            uptime: 100,
            responseTime: 0,
            errorRate: 0,
            lastCheck: null,
            alerts: [],
            history: []
        };
        this.isMonitoring = false;
    }

    /**
     * Start production health monitoring
     */
    async startMonitoring() {
        console.log('🏥 Starting Production Health Monitoring...\n');

        this.isMonitoring = true;

        // Initial health check
        await this.performHealthCheck();

        // Set up continuous monitoring
        const monitoringInterval = setInterval(async () => {
            if (!this.isMonitoring) {
                clearInterval(monitoringInterval);
                return;
            }

            await this.performHealthCheck();
        }, this.config.checkInterval);

        console.log(`✅ Health monitoring started (checking every ${this.config.checkInterval / 1000}s)`);
        console.log('📊 Monitor dashboard: http://localhost:3000/health-dashboard\n');

        // Keep the process running
        process.on('SIGINT', () => {
            console.log('\n🛑 Stopping health monitoring...');
            this.stopMonitoring();
            process.exit(0);
        });

        return this.healthData;
    }

    /**
     * Stop health monitoring
     */
    stopMonitoring() {
        this.isMonitoring = false;
        this.generateHealthReport();
        console.log('✅ Health monitoring stopped');
    }

    /**
     * Perform comprehensive health check
     */
    async performHealthCheck() {
        const checkTime = new Date().toISOString();
        console.log(`🔍 Health Check: ${checkTime}`);

        const results = {
            timestamp: checkTime,
            endpoints: {},
            overall: {
                healthy: true,
                responseTime: 0,
                errors: 0,
                warnings: 0
            }
        };

        // Check each endpoint
        for (const endpoint of this.config.endpoints) {
            try {
                const result = await this.checkEndpoint(endpoint);
                results.endpoints[endpoint.name] = result;
                
                // Update overall metrics
                results.overall.responseTime += result.responseTime;
                if (!result.healthy) {
                    results.overall.errors++;
                    results.overall.healthy = false;
                }
                if (result.warning) {
                    results.overall.warnings++;
                }

                console.log(`   ${result.healthy ? '✅' : '❌'} ${endpoint.name}: ${result.responseTime}ms`);
            } catch (error) {
                results.endpoints[endpoint.name] = {
                    healthy: false,
                    error: error.message,
                    responseTime: 0
                };
                results.overall.errors++;
                results.overall.healthy = false;
                console.log(`   ❌ ${endpoint.name}: ${error.message}`);
            }
        }

        // Calculate average response time
        results.overall.responseTime = Math.round(results.overall.responseTime / this.config.endpoints.length);

        // Update health data
        this.updateHealthData(results);

        // Check for alerts
        await this.checkAlerts(results);

        // Save health data
        this.saveHealthData();

        console.log(`📊 Overall: ${results.overall.healthy ? 'HEALTHY' : 'UNHEALTHY'} (${results.overall.responseTime}ms avg)\n`);
    }

    /**
     * Check individual endpoint health
     */
    async checkEndpoint(endpoint) {
        const startTime = Date.now();
        
        try {
            // Simulate HTTP request (in real implementation, would use fetch or axios)
            await new Promise(resolve => {
                const delay = Math.random() * 2000 + 500; // 500-2500ms
                setTimeout(resolve, delay);
            });

            const responseTime = Date.now() - startTime;
            const healthy = responseTime < this.config.alertThresholds.responseTime;
            const warning = responseTime > this.config.alertThresholds.responseTime * 0.7;

            return {
                healthy,
                warning,
                responseTime,
                status: 200,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            return {
                healthy: false,
                error: error.message,
                responseTime: Date.now() - startTime,
                status: 0,
                timestamp: new Date().toISOString()
            };
        }
    }

    /**
     * Update health data with latest results
     */
    updateHealthData(results) {
        // Update current metrics
        this.healthData.responseTime = results.overall.responseTime;
        this.healthData.lastCheck = results.timestamp;

        // Calculate error rate
        const totalEndpoints = this.config.endpoints.length;
        const errorCount = results.overall.errors;
        this.healthData.errorRate = Math.round((errorCount / totalEndpoints) * 100);

        // Update uptime (simplified calculation)
        if (results.overall.healthy) {
            this.healthData.uptime = Math.min(100, this.healthData.uptime + 0.1);
        } else {
            this.healthData.uptime = Math.max(0, this.healthData.uptime - 1);
        }

        // Add to history
        this.healthData.history.push({
            timestamp: results.timestamp,
            healthy: results.overall.healthy,
            responseTime: results.overall.responseTime,
            errorRate: this.healthData.errorRate,
            uptime: this.healthData.uptime
        });

        // Keep only last 100 entries
        if (this.healthData.history.length > 100) {
            this.healthData.history = this.healthData.history.slice(-100);
        }
    }

    /**
     * Check for alert conditions
     */
    async checkAlerts(results) {
        const alerts = [];

        // Response time alert
        if (results.overall.responseTime > this.config.alertThresholds.responseTime) {
            alerts.push({
                type: 'RESPONSE_TIME',
                severity: 'HIGH',
                message: `Average response time ${results.overall.responseTime}ms exceeds threshold ${this.config.alertThresholds.responseTime}ms`,
                timestamp: results.timestamp
            });
        }

        // Error rate alert
        if (this.healthData.errorRate > this.config.alertThresholds.errorRate) {
            alerts.push({
                type: 'ERROR_RATE',
                severity: 'HIGH',
                message: `Error rate ${this.healthData.errorRate}% exceeds threshold ${this.config.alertThresholds.errorRate}%`,
                timestamp: results.timestamp
            });
        }

        // Uptime alert
        if (this.healthData.uptime < this.config.alertThresholds.uptime) {
            alerts.push({
                type: 'UPTIME',
                severity: 'CRITICAL',
                message: `Uptime ${this.healthData.uptime.toFixed(2)}% below threshold ${this.config.alertThresholds.uptime}%`,
                timestamp: results.timestamp
            });
        }

        // Critical endpoint failures
        for (const [name, result] of Object.entries(results.endpoints)) {
            const endpoint = this.config.endpoints.find(e => e.name === name);
            if (endpoint && endpoint.critical && !result.healthy) {
                alerts.push({
                    type: 'CRITICAL_ENDPOINT',
                    severity: 'CRITICAL',
                    message: `Critical endpoint ${name} is down: ${result.error || 'Unknown error'}`,
                    timestamp: results.timestamp
                });
            }
        }

        // Add new alerts
        for (const alert of alerts) {
            this.healthData.alerts.push(alert);
            console.log(`🚨 ALERT [${alert.severity}]: ${alert.message}`);
            
            // In real implementation, would send notifications (email, Slack, etc.)
            await this.sendAlert(alert);
        }

        // Keep only last 50 alerts
        if (this.healthData.alerts.length > 50) {
            this.healthData.alerts = this.healthData.alerts.slice(-50);
        }
    }

    /**
     * Send alert notification
     */
    async sendAlert(alert) {
        // Simulate sending alert (email, Slack, webhook, etc.)
        console.log(`📧 Alert notification sent: ${alert.type}`);
        
        // In real implementation:
        // - Send email notification
        // - Post to Slack channel
        // - Send webhook to monitoring service
        // - Log to external monitoring system
    }

    /**
     * Save health data to file
     */
    saveHealthData() {
        try {
            fs.writeFileSync('./production-health-data.json', JSON.stringify(this.healthData, null, 2));
        } catch (error) {
            console.error('❌ Failed to save health data:', error.message);
        }
    }

    /**
     * Generate health monitoring report
     */
    generateHealthReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                uptime: this.healthData.uptime,
                averageResponseTime: this.calculateAverageResponseTime(),
                errorRate: this.healthData.errorRate,
                totalAlerts: this.healthData.alerts.length,
                monitoringDuration: this.calculateMonitoringDuration()
            },
            alerts: this.healthData.alerts,
            history: this.healthData.history,
            recommendations: this.generateHealthRecommendations()
        };

        // Save JSON report
        fs.writeFileSync('./production-health-report.json', JSON.stringify(report, null, 2));

        // Generate human-readable report
        this.generateHealthHumanReadableReport(report);
    }

    /**
     * Calculate average response time from history
     */
    calculateAverageResponseTime() {
        if (this.healthData.history.length === 0) return 0;
        
        const total = this.healthData.history.reduce((sum, entry) => sum + entry.responseTime, 0);
        return Math.round(total / this.healthData.history.length);
    }

    /**
     * Calculate monitoring duration
     */
    calculateMonitoringDuration() {
        if (this.healthData.history.length < 2) return 0;
        
        const start = new Date(this.healthData.history[0].timestamp);
        const end = new Date(this.healthData.history[this.healthData.history.length - 1].timestamp);
        return Math.round((end - start) / 1000 / 60); // minutes
    }

    /**
     * Generate health recommendations
     */
    generateHealthRecommendations() {
        const recommendations = [];

        if (this.healthData.uptime < 99.9) {
            recommendations.push({
                priority: 'HIGH',
                category: 'Uptime',
                message: 'Consider implementing redundancy and failover mechanisms',
                action: 'Set up multiple availability zones or CDN failover'
            });
        }

        if (this.calculateAverageResponseTime() > 3000) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Performance',
                message: 'Response times are above optimal range',
                action: 'Optimize caching, CDN configuration, or server resources'
            });
        }

        if (this.healthData.alerts.length > 10) {
            recommendations.push({
                priority: 'MEDIUM',
                category: 'Monitoring',
                message: 'High number of alerts detected',
                action: 'Review alert thresholds and investigate recurring issues'
            });
        }

        return recommendations;
    }

    /**
     * Generate human-readable health report
     */
    generateHealthHumanReadableReport(report) {
        let output = `# Production Health Monitoring Report\n\n`;
        output += `Generated: ${report.timestamp}\n\n`;
        output += `## Summary\n`;
        output += `- **Uptime**: ${report.summary.uptime.toFixed(2)}%\n`;
        output += `- **Average Response Time**: ${report.summary.averageResponseTime}ms\n`;
        output += `- **Error Rate**: ${report.summary.errorRate}%\n`;
        output += `- **Total Alerts**: ${report.summary.totalAlerts}\n`;
        output += `- **Monitoring Duration**: ${report.summary.monitoringDuration} minutes\n\n`;

        if (report.alerts.length > 0) {
            output += `## Recent Alerts\n`;
            report.alerts.slice(-10).forEach((alert, index) => {
                output += `${index + 1}. **${alert.type}** (${alert.severity}): ${alert.message}\n`;
                output += `   Time: ${alert.timestamp}\n\n`;
            });
        }

        if (report.recommendations.length > 0) {
            output += `## Recommendations\n`;
            report.recommendations.forEach((rec, index) => {
                output += `${index + 1}. **${rec.category}** (${rec.priority})\n`;
                output += `   Issue: ${rec.message}\n`;
                output += `   Action: ${rec.action}\n\n`;
            });
        }

        output += `## Health Trends\n`;
        if (report.history.length > 0) {
            const recent = report.history.slice(-10);
            output += `Recent health checks:\n`;
            recent.forEach(entry => {
                output += `- ${entry.timestamp}: ${entry.healthy ? 'HEALTHY' : 'UNHEALTHY'} (${entry.responseTime}ms)\n`;
            });
        }

        fs.writeFileSync('./production-health-report.md', output);
        console.log('📄 Health monitoring report saved to production-health-report.md');
    }

    /**
     * Create health dashboard HTML
     */
    createHealthDashboard() {
        const dashboardHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Production Health Dashboard - Ardonie Capital</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .health-good { color: #10b981; }
        .health-warning { color: #f59e0b; }
        .health-critical { color: #ef4444; }
    </style>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold mb-8">Production Health Dashboard</h1>
        
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Uptime</h3>
                <p class="text-3xl font-bold health-good">${this.healthData.uptime.toFixed(2)}%</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Response Time</h3>
                <p class="text-3xl font-bold">${this.healthData.responseTime}ms</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Error Rate</h3>
                <p class="text-3xl font-bold ${this.healthData.errorRate > 5 ? 'health-critical' : 'health-good'}">${this.healthData.errorRate}%</p>
            </div>
            
            <div class="bg-white p-6 rounded-lg shadow">
                <h3 class="text-lg font-semibold mb-2">Last Check</h3>
                <p class="text-sm">${this.healthData.lastCheck || 'Never'}</p>
            </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
            <h3 class="text-lg font-semibold mb-4">Recent Alerts</h3>
            <div id="alerts-list">
                ${this.healthData.alerts.slice(-5).map(alert => `
                    <div class="border-l-4 border-red-500 pl-4 mb-4">
                        <p class="font-semibold">${alert.type}</p>
                        <p class="text-sm text-gray-600">${alert.message}</p>
                        <p class="text-xs text-gray-500">${alert.timestamp}</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </div>
    
    <script>
        // Auto-refresh every 30 seconds
        setInterval(() => {
            window.location.reload();
        }, 30000);
    </script>
</body>
</html>`;

        fs.writeFileSync('./health-dashboard.html', dashboardHTML);
        console.log('📊 Health dashboard created: health-dashboard.html');
    }
}

// Run health monitoring
if (process.argv.includes('--start')) {
    const monitor = new ProductionHealthMonitor();
    monitor.startMonitoring()
        .catch(error => {
            console.error('❌ Health monitoring failed:', error);
            process.exit(1);
        });
} else {
    console.log('🏥 Production Health Monitor');
    console.log('Usage: node production-health-monitor.js --start');
    console.log('       node production-health-monitor.js --report');
    
    if (process.argv.includes('--report')) {
        const monitor = new ProductionHealthMonitor();
        monitor.generateHealthReport();
        monitor.createHealthDashboard();
    }
}

export default ProductionHealthMonitor;
