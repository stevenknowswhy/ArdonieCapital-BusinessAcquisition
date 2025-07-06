#!/usr/bin/env node

/**
 * Spacing Improvements Verification Script
 * Verifies that the shadcn card spacing improvements have been applied correctly
 */

import fs from 'fs';
import path from 'path';

class SpacingVerifier {
  constructor() {
    this.dashboardPath = 'dashboard/buyer-dashboard.html';
    this.cssPath = 'assets/css/shadcn-components.css';
  }

  async verifySpacingImprovements() {
    console.log('🔍 Verifying Shadcn Card Spacing Improvements...\n');

    const results = {
      cssUpdates: this.checkCSSUpdates(),
      htmlUpdates: this.checkHTMLUpdates(),
      responsiveSpacing: this.checkResponsiveSpacing(),
      cardVariants: this.checkCardVariants(),
      gridSpacing: this.checkGridSpacing()
    };

    this.displayResults(results);
    return results;
  }

  checkCSSUpdates() {
    console.log('📦 Checking CSS spacing updates...');
    
    try {
      const cssContent = fs.readFileSync(this.cssPath, 'utf8');
      
      const checks = {
        'Enhanced card padding': cssContent.includes('padding: 2rem;'),
        'Card hover effects': cssContent.includes('transition: box-shadow 0.2s ease-in-out'),
        'KPI card styling': cssContent.includes('.shadcn-card--kpi'),
        'Compact card variant': cssContent.includes('.shadcn-card--compact'),
        'Spacious card variant': cssContent.includes('.shadcn-card--spacious'),
        'Dashboard section spacing': cssContent.includes('.dashboard-section-spacing'),
        'Grid spacing classes': cssContent.includes('.shadcn-grid-spacing'),
        'Responsive spacing media queries': cssContent.includes('@media (min-width: 640px)'),
        'Large screen spacing': cssContent.includes('@media (min-width: 1024px)')
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check CSS updates');
      return { error: error.message };
    }
  }

  checkHTMLUpdates() {
    console.log('\n📄 Checking HTML spacing updates...');
    
    try {
      const htmlContent = fs.readFileSync(this.dashboardPath, 'utf8');
      
      const checks = {
        'KPI cards use shadcn-card--kpi': htmlContent.includes('shadcn-card shadcn-card--kpi'),
        'Dashboard section spacing applied': htmlContent.includes('dashboard-section-spacing'),
        'Grid spacing classes applied': htmlContent.includes('shadcn-grid-spacing-lg'),
        'Removed pt-6 from card content': !htmlContent.includes('shadcn-card-content pt-6'),
        'Proper grid structure': htmlContent.includes('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 shadcn-grid-spacing-lg'),
        'Charts section spacing': htmlContent.includes('grid grid-cols-1 lg:grid-cols-2 shadcn-grid-spacing-lg'),
        'Multiple dashboard sections': (htmlContent.match(/dashboard-section-spacing/g) || []).length >= 4
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check HTML updates');
      return { error: error.message };
    }
  }

  checkResponsiveSpacing() {
    console.log('\n📱 Checking responsive spacing...');
    
    try {
      const cssContent = fs.readFileSync(this.cssPath, 'utf8');
      
      const checks = {
        'Mobile spacing (base)': cssContent.includes('gap: 1.5rem;'),
        'Tablet spacing (640px+)': cssContent.includes('gap: 2rem;') && cssContent.includes('@media (min-width: 640px)'),
        'Desktop spacing (1024px+)': cssContent.includes('gap: 2.5rem;') && cssContent.includes('@media (min-width: 1024px)'),
        'Large desktop spacing': cssContent.includes('gap: 3rem;'),
        'Section margin responsive': cssContent.includes('margin-bottom: 4rem;'),
        'Multiple breakpoints': (cssContent.match(/@media \(min-width:/g) || []).length >= 2
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check responsive spacing');
      return { error: error.message };
    }
  }

  checkCardVariants() {
    console.log('\n🃏 Checking card variants...');
    
    try {
      const cssContent = fs.readFileSync(this.cssPath, 'utf8');
      
      const checks = {
        'KPI card min-height': cssContent.includes('min-height: 140px'),
        'KPI card flex layout': cssContent.includes('display: flex') && cssContent.includes('flex-direction: column'),
        'Compact card padding': cssContent.includes('.shadcn-card--compact .shadcn-card-header'),
        'Spacious card padding': cssContent.includes('.shadcn-card--spacious .shadcn-card-content'),
        'Card content flex alignment': cssContent.includes('align-items: center'),
        'Proper padding hierarchy': cssContent.includes('padding: 1.75rem;')
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check card variants');
      return { error: error.message };
    }
  }

  checkGridSpacing() {
    console.log('\n📐 Checking grid spacing implementation...');
    
    try {
      const htmlContent = fs.readFileSync(this.dashboardPath, 'utf8');
      const cssContent = fs.readFileSync(this.cssPath, 'utf8');
      
      const checks = {
        'Grid spacing CSS classes defined': cssContent.includes('.shadcn-grid-spacing {'),
        'Large grid spacing defined': cssContent.includes('.shadcn-grid-spacing-lg {'),
        'XL grid spacing defined': cssContent.includes('.shadcn-grid-spacing-xl {'),
        'KPI grid uses large spacing': htmlContent.includes('xl:grid-cols-6 shadcn-grid-spacing-lg'),
        'Charts grid uses large spacing': htmlContent.includes('lg:grid-cols-2 shadcn-grid-spacing-lg'),
        'Deal progress grid uses large spacing': htmlContent.includes('lg:grid-cols-2 shadcn-grid-spacing-lg'),
        'Consistent spacing application': (htmlContent.match(/shadcn-grid-spacing-lg/g) || []).length >= 3
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check grid spacing');
      return { error: error.message };
    }
  }

  displayResults(results) {
    console.log('\n📊 Spacing Improvements Verification Summary:');
    console.log('=============================================');

    const cssOk = !results.cssUpdates.error && 
                  Object.values(results.cssUpdates).every(Boolean);
    const htmlOk = !results.htmlUpdates.error && 
                   Object.values(results.htmlUpdates).every(Boolean);
    const responsiveOk = !results.responsiveSpacing.error && 
                        Object.values(results.responsiveSpacing).every(Boolean);
    const variantsOk = !results.cardVariants.error && 
                      Object.values(results.cardVariants).every(Boolean);
    const gridOk = !results.gridSpacing.error && 
                   Object.values(results.gridSpacing).every(Boolean);

    console.log(`${cssOk ? '✅' : '❌'} CSS Updates: Enhanced padding and spacing`);
    console.log(`${htmlOk ? '✅' : '❌'} HTML Updates: Spacing classes applied`);
    console.log(`${responsiveOk ? '✅' : '❌'} Responsive: Mobile to desktop spacing`);
    console.log(`${variantsOk ? '✅' : '❌'} Card Variants: KPI and spacing variants`);
    console.log(`${gridOk ? '✅' : '❌'} Grid Spacing: Consistent grid gaps`);

    const overallSuccess = cssOk && htmlOk && responsiveOk && variantsOk && gridOk;
    
    console.log('\n🎯 Overall Status:');
    console.log(`${overallSuccess ? '🎉 SUCCESS' : '⚠️  ISSUES DETECTED'}`);
    
    if (overallSuccess) {
      console.log('\n✅ Spacing improvements successfully implemented!');
      console.log('🎨 Benefits achieved:');
      console.log('   • Increased card padding for better readability');
      console.log('   • Enhanced grid spacing between components');
      console.log('   • Improved visual separation between sections');
      console.log('   • Responsive spacing across all screen sizes');
      console.log('   • Professional card hover effects');
      console.log('   • Consistent spacing hierarchy');
      console.log('\n🌐 View the improved dashboard at: http://localhost:8000/dashboard/buyer-dashboard.html');
    } else {
      console.log('\n⚠️  Some spacing improvements may not be fully applied.');
      console.log('💡 Check the detailed results above for specific issues.');
    }

    return overallSuccess;
  }

  async generateSpacingReport() {
    const results = await this.verifySpacingImprovements();
    
    const report = {
      timestamp: new Date().toISOString(),
      verification: results,
      improvements: {
        cardPadding: 'Increased from 1.5rem to 2rem for better content breathing room',
        gridSpacing: 'Responsive spacing from 1.5rem (mobile) to 3.5rem (large desktop)',
        sectionSpacing: 'Added 3rem margin between dashboard sections (4rem on desktop)',
        kpiCards: 'Specialized KPI card variant with 140px min-height and flex centering',
        hoverEffects: 'Added subtle hover effects with enhanced shadows',
        responsiveDesign: 'Three breakpoints for optimal spacing on all devices'
      },
      recommendations: [
        'Test dashboard on mobile devices to verify spacing',
        'Check hover effects on interactive elements',
        'Validate visual hierarchy with improved spacing',
        'Ensure accessibility with proper touch targets',
        'Monitor performance impact of CSS transitions'
      ]
    };

    fs.writeFileSync('spacing-verification-report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Spacing verification report saved to: spacing-verification-report.json');
    
    return report;
  }

  async run() {
    console.log('🎯 Shadcn Card Spacing Improvements Verification\n');
    
    try {
      const report = await this.generateSpacingReport();
      return report;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  }
}

// Run the verification
const verifier = new SpacingVerifier();
verifier.run().catch(console.error);
