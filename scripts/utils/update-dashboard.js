#!/usr/bin/env node

/**
 * Dashboard Update Script
 * Integrates shadcn-inspired components into the buyer dashboard
 */

import fs from 'fs';
import path from 'path';

class DashboardUpdater {
  constructor() {
    this.dashboardPath = 'dashboard/buyer-dashboard.html';
    this.backupPath = 'dashboard/buyer-dashboard-backup.html';
    this.componentsPath = 'assets/components/shadcn';
  }

  async updateDashboard() {
    console.log('🔄 Updating Buyer Dashboard with Shadcn Components...\n');

    try {
      // Create backup
      await this.createBackup();
      
      // Read current dashboard
      const dashboardContent = fs.readFileSync(this.dashboardPath, 'utf8');
      
      // Apply updates
      let updatedContent = dashboardContent;
      
      // Add shadcn CSS and JS
      updatedContent = this.addShadcnAssets(updatedContent);
      
      // Update KPI widgets
      updatedContent = this.updateKPIWidgets(updatedContent);
      
      // Update buttons
      updatedContent = this.updateButtons(updatedContent);
      
      // Update progress bars
      updatedContent = this.updateProgressBars(updatedContent);
      
      // Update badges
      updatedContent = this.updateBadges(updatedContent);
      
      // Update cards
      updatedContent = this.updateCards(updatedContent);
      
      // Write updated dashboard
      fs.writeFileSync(this.dashboardPath, updatedContent);
      
      console.log('✅ Dashboard updated successfully!');
      console.log(`📁 Backup saved to: ${this.backupPath}`);
      console.log(`📁 Updated dashboard: ${this.dashboardPath}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to update dashboard:', error);
      return false;
    }
  }

  async createBackup() {
    console.log('💾 Creating backup of current dashboard...');
    const content = fs.readFileSync(this.dashboardPath, 'utf8');
    fs.writeFileSync(this.backupPath, content);
    console.log('✅ Backup created');
  }

  addShadcnAssets(content) {
    console.log('📦 Adding Shadcn CSS and JavaScript...');
    
    // Add CSS after existing stylesheets
    const cssInsert = `    <!-- Shadcn Components CSS -->
    <link rel="stylesheet" href="../assets/css/shadcn-components.css">`;
    
    content = content.replace(
      '</style>',
      `</style>
${cssInsert}`
    );
    
    // Add JavaScript before closing body tag
    const jsInsert = `    <!-- Shadcn Components JavaScript -->
    <script src="../assets/js/shadcn-components.js"></script>`;
    
    content = content.replace(
      '</body>',
      `${jsInsert}
</body>`
    );
    
    return content;
  }

  updateKPIWidgets(content) {
    console.log('📊 Updating KPI widgets with shadcn cards...');
    
    // Replace the KPI widgets section with shadcn cards
    const kpiSection = `                <!-- Enhanced KPI Widgets with Shadcn Cards -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
                    <!-- Saved Listings -->
                    <div class="shadcn-card">
                        <div class="shadcn-card-content pt-6">
                            <div class="flex items-center justify-between">
                                <div class="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold">12</p>
                                    <p class="text-xs font-medium shadcn-text-muted">Saved Listings</p>
                                    <span class="shadcn-badge shadcn-badge--default bg-green-500 text-xs">+2 this week</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Active Matches -->
                    <div class="shadcn-card">
                        <div class="shadcn-card-content pt-6">
                            <div class="flex items-center justify-between">
                                <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold">5</p>
                                    <p class="text-xs font-medium shadcn-text-muted">Active Matches</p>
                                    <span class="shadcn-badge shadcn-badge--default bg-green-500 text-xs">+1 today</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Unread Messages -->
                    <div class="shadcn-card">
                        <div class="shadcn-card-content pt-6">
                            <div class="flex items-center justify-between">
                                <div class="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold">3</p>
                                    <p class="text-xs font-medium shadcn-text-muted">Unread Messages</p>
                                    <span class="shadcn-badge shadcn-badge--destructive text-xs">2 urgent</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Active Deals -->
                    <div class="shadcn-card">
                        <div class="shadcn-card-content pt-6">
                            <div class="flex items-center justify-between">
                                <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold">2</p>
                                    <p class="text-xs font-medium shadcn-text-muted">Active Deals</p>
                                    <span class="shadcn-badge shadcn-badge--default bg-blue-500 text-xs">1 closing soon</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Average Listing Price -->
                    <div class="shadcn-card">
                        <div class="shadcn-card-content pt-6">
                            <div class="flex items-center justify-between">
                                <div class="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                                    </svg>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold">$485K</p>
                                    <p class="text-xs font-medium shadcn-text-muted">Avg Listing Price</p>
                                    <span class="shadcn-badge shadcn-badge--default bg-green-500 text-xs">+5.2% vs market</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Time to Close -->
                    <div class="shadcn-card">
                        <div class="shadcn-card-content pt-6">
                            <div class="flex items-center justify-between">
                                <div class="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div class="text-right">
                                    <p class="text-2xl font-bold">34</p>
                                    <p class="text-xs font-medium shadcn-text-muted">Days to Close</p>
                                    <span class="shadcn-badge shadcn-badge--default bg-gradient-to-r from-green-500 to-green-600 text-xs">
                                        <span class="mr-1">🚖</span>Express avg
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

    // Find and replace the KPI widgets section
    const kpiRegex = /<!-- Enhanced KPI Widgets -->[\s\S]*?<\/div>\s*<\/div>/;
    content = content.replace(kpiRegex, kpiSection);
    
    return content;
  }

  updateButtons(content) {
    console.log('🔘 Updating buttons with shadcn styles...');
    
    // Update common button patterns
    content = content.replace(
      /class="([^"]*?)text-sm([^"]*?)text-accent([^"]*?)hover:text-accent-dark([^"]*?)"/g,
      'class="shadcn-btn shadcn-btn--ghost shadcn-btn--sm"'
    );
    
    return content;
  }

  updateProgressBars(content) {
    console.log('📈 Updating progress bars...');
    
    // Update progress bar in deal tracking
    const progressBarUpdate = `                            <div class="mb-3">
                                <div class="flex justify-between text-xs shadcn-text-muted mb-1">
                                    <span>Progress</span>
                                    <span>75%</span>
                                </div>
                                <div class="shadcn-progress" data-value="75">
                                    <div class="shadcn-progress-indicator"></div>
                                </div>
                            </div>`;
    
    // Replace existing progress bar
    content = content.replace(
      /<div class="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">\s*<div class="bg-green-500 h-2 rounded-full w-3\/4"><\/div>\s*<\/div>/,
      `<div class="shadcn-progress" data-value="75">
                                    <div class="shadcn-progress-indicator"></div>
                                </div>`
    );
    
    return content;
  }

  updateBadges(content) {
    console.log('🏷️ Updating badges...');
    
    // Update notification badges
    content = content.replace(
      /class="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">5</g,
      'class="shadcn-badge shadcn-badge--destructive">5'
    );
    
    content = content.replace(
      /class="ml-auto bg-accent text-white text-xs rounded-full px-2 py-1">5</g,
      'class="shadcn-badge shadcn-badge--default bg-green-500">5'
    );
    
    // Update status badges
    content = content.replace(
      /class="ml-auto bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-1">NEW</g,
      'class="shadcn-badge shadcn-badge--default bg-blue-500">NEW'
    );
    
    return content;
  }

  updateCards(content) {
    console.log('🃏 Updating card components...');
    
    // Update main content cards to use shadcn styling
    content = content.replace(
      /class="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700"/g,
      'class="shadcn-card"'
    );
    
    return content;
  }

  async generateUpdateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      updates: [
        'Added shadcn CSS and JavaScript assets',
        'Updated KPI widgets with shadcn card components',
        'Enhanced buttons with shadcn styling',
        'Improved progress bars with shadcn components',
        'Updated badges with shadcn variants',
        'Converted cards to shadcn card components'
      ],
      files: {
        backup: this.backupPath,
        updated: this.dashboardPath,
        assets: [
          'assets/css/shadcn-components.css',
          'assets/js/shadcn-components.js',
          'assets/components/shadcn/card.html',
          'assets/components/shadcn/button.html',
          'assets/components/shadcn/badge.html'
        ]
      }
    };

    fs.writeFileSync('dashboard-update-report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Update report saved to: dashboard-update-report.json');
    
    return report;
  }

  async run() {
    console.log('🎯 Dashboard Shadcn Integration\n');
    
    try {
      const success = await this.updateDashboard();
      
      if (success) {
        await this.generateUpdateReport();
        
        console.log('\n🎉 Dashboard update completed successfully!');
        console.log('\n📋 What was updated:');
        console.log('✅ KPI widgets now use shadcn cards');
        console.log('✅ Buttons enhanced with shadcn styling');
        console.log('✅ Progress bars use shadcn components');
        console.log('✅ Badges updated with shadcn variants');
        console.log('✅ Cards converted to shadcn components');
        console.log('\n🌐 View the updated dashboard at: http://localhost:8000/dashboard/buyer-dashboard.html');
      }
      
      return success;
    } catch (error) {
      console.error('❌ Dashboard update failed:', error);
      return false;
    }
  }
}

// Run the dashboard update
const updater = new DashboardUpdater();
updater.run().catch(console.error);
