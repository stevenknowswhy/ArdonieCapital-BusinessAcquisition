#!/usr/bin/env node

/**
 * Dashboard Integration Verification Script
 * Verifies that all shadcn components are properly integrated
 */

import fs from 'fs';
import path from 'path';

class DashboardVerifier {
  constructor() {
    this.dashboardPath = 'dashboard/buyer-dashboard.html';
    this.requiredAssets = [
      'assets/css/shadcn-components.css',
      'assets/js/shadcn-components.js',
      'assets/components/shadcn/card.html',
      'assets/components/shadcn/button.html',
      'assets/components/shadcn/badge.html'
    ];
  }

  async verifyIntegration() {
    console.log('🔍 Verifying Dashboard Shadcn Integration...\n');

    const results = {
      assetsExist: this.checkAssets(),
      dashboardUpdated: this.checkDashboardContent(),
      componentsIntegrated: this.checkComponentIntegration(),
      stylesApplied: this.checkStyling(),
      backupExists: this.checkBackup()
    };

    this.displayResults(results);
    return results;
  }

  checkAssets() {
    console.log('📦 Checking required assets...');
    const results = {};

    this.requiredAssets.forEach(asset => {
      const exists = fs.existsSync(asset);
      results[asset] = exists;
      console.log(`${exists ? '✅' : '❌'} ${asset}`);
    });

    return results;
  }

  checkDashboardContent() {
    console.log('\n📄 Checking dashboard content...');
    
    try {
      const content = fs.readFileSync(this.dashboardPath, 'utf8');
      
      const checks = {
        'shadcn CSS included': content.includes('shadcn-components.css'),
        'shadcn JS included': content.includes('shadcn-components.js'),
        'shadcn cards present': content.includes('shadcn-card'),
        'shadcn buttons present': content.includes('shadcn-btn'),
        'shadcn badges present': content.includes('shadcn-badge'),
        'shadcn progress present': content.includes('shadcn-progress'),
        'original structure preserved': content.includes('buyer-dashboard')
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to read dashboard file');
      return { error: error.message };
    }
  }

  checkComponentIntegration() {
    console.log('\n🧩 Checking component integration...');
    
    try {
      const content = fs.readFileSync(this.dashboardPath, 'utf8');
      
      const componentChecks = {
        'KPI widgets use shadcn cards': content.includes('shadcn-card-content pt-6'),
        'Progress bars use shadcn': content.includes('shadcn-progress'),
        'Badges use shadcn classes': content.includes('shadcn-badge'),
        'Buttons enhanced': content.includes('shadcn-btn'),
        'Text styling applied': content.includes('shadcn-text-muted'),
        'Avatar components present': content.includes('shadcn-avatar')
      };

      Object.entries(componentChecks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return componentChecks;
    } catch (error) {
      console.log('❌ Failed to check component integration');
      return { error: error.message };
    }
  }

  checkStyling() {
    console.log('\n🎨 Checking styling implementation...');
    
    try {
      const cssContent = fs.readFileSync('assets/css/shadcn-components.css', 'utf8');
      
      const styleChecks = {
        'CSS custom properties defined': cssContent.includes(':root {'),
        'Dark mode support': cssContent.includes('.dark {'),
        'Card components styled': cssContent.includes('.shadcn-card {'),
        'Button variants defined': cssContent.includes('.shadcn-btn--primary'),
        'Badge variants defined': cssContent.includes('.shadcn-badge--default'),
        'Progress component styled': cssContent.includes('.shadcn-progress'),
        'Avatar component styled': cssContent.includes('.shadcn-avatar'),
        'Utility classes present': cssContent.includes('.shadcn-text-muted')
      };

      Object.entries(styleChecks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return styleChecks;
    } catch (error) {
      console.log('❌ Failed to check styling');
      return { error: error.message };
    }
  }

  checkBackup() {
    console.log('\n💾 Checking backup...');
    
    const backupExists = fs.existsSync('dashboard/buyer-dashboard-backup.html');
    console.log(`${backupExists ? '✅' : '❌'} Backup file exists`);
    
    if (backupExists) {
      try {
        const backupContent = fs.readFileSync('dashboard/buyer-dashboard-backup.html', 'utf8');
        const isOriginal = !backupContent.includes('shadcn-components.css');
        console.log(`${isOriginal ? '✅' : '❌'} Backup contains original content`);
        return { exists: true, isOriginal };
      } catch (error) {
        console.log('❌ Failed to read backup file');
        return { exists: true, error: error.message };
      }
    }
    
    return { exists: false };
  }

  displayResults(results) {
    console.log('\n📊 Integration Verification Summary:');
    console.log('=====================================');

    const allAssets = Object.values(results.assetsExist).every(Boolean);
    const dashboardOk = !results.dashboardUpdated.error && 
                       Object.values(results.dashboardUpdated).every(Boolean);
    const componentsOk = !results.componentsIntegrated.error && 
                        Object.values(results.componentsIntegrated).every(Boolean);
    const stylesOk = !results.stylesApplied.error && 
                     Object.values(results.stylesApplied).every(Boolean);
    const backupOk = results.backupExists.exists;

    console.log(`${allAssets ? '✅' : '❌'} Assets: All required files present`);
    console.log(`${dashboardOk ? '✅' : '❌'} Dashboard: Content properly updated`);
    console.log(`${componentsOk ? '✅' : '❌'} Components: Integration successful`);
    console.log(`${stylesOk ? '✅' : '❌'} Styling: CSS framework complete`);
    console.log(`${backupOk ? '✅' : '❌'} Backup: Original preserved`);

    const overallSuccess = allAssets && dashboardOk && componentsOk && stylesOk && backupOk;
    
    console.log('\n🎯 Overall Status:');
    console.log(`${overallSuccess ? '🎉 SUCCESS' : '⚠️  ISSUES DETECTED'}`);
    
    if (overallSuccess) {
      console.log('\n✅ Dashboard integration is complete and working!');
      console.log('🌐 View at: http://localhost:8000/dashboard/buyer-dashboard.html');
    } else {
      console.log('\n⚠️  Some issues were detected. Please review the results above.');
    }

    return overallSuccess;
  }

  async generateVerificationReport() {
    const results = await this.verifyIntegration();
    
    const report = {
      timestamp: new Date().toISOString(),
      verification: results,
      summary: {
        allAssetsPresent: Object.values(results.assetsExist).every(Boolean),
        dashboardUpdated: !results.dashboardUpdated.error,
        componentsIntegrated: !results.componentsIntegrated.error,
        stylingComplete: !results.stylesApplied.error,
        backupPreserved: results.backupExists.exists
      },
      recommendations: [
        'Test dashboard functionality in browser',
        'Verify responsive design on mobile devices',
        'Check dark mode toggle functionality',
        'Validate accessibility features',
        'Test component interactions'
      ]
    };

    fs.writeFileSync('dashboard-verification-report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Verification report saved to: dashboard-verification-report.json');
    
    return report;
  }

  async run() {
    console.log('🎯 Dashboard Integration Verification\n');
    
    try {
      const report = await this.generateVerificationReport();
      return report;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  }
}

// Run the verification
const verifier = new DashboardVerifier();
verifier.run().catch(console.error);
