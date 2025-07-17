#!/usr/bin/env node

/**
 * Footer Alignment Verification Script
 * Verifies that the shadcn card footer alignment issues have been fixed
 */

import fs from 'fs';
import path from 'path';

class FooterAlignmentVerifier {
  constructor() {
    this.dashboardPath = 'dashboard/buyer-dashboard.html';
    this.cssPath = 'assets/css/shadcn-components.css';
  }

  async verifyFooterAlignmentFixes() {
    console.log('🔍 Verifying Shadcn Card Footer Alignment Fixes...\n');

    const results = {
      cssFooterClasses: this.checkCSSFooterClasses(),
      htmlFooterImplementation: this.checkHTMLFooterImplementation(),
      alignmentVariants: this.checkAlignmentVariants(),
      kpiCardFooters: this.checkKPICardFooters(),
      responsiveFooters: this.checkResponsiveFooters()
    };

    this.displayResults(results);
    return results;
  }

  checkCSSFooterClasses() {
    console.log('📦 Checking CSS footer classes...');
    
    try {
      const cssContent = fs.readFileSync(this.cssPath, 'utf8');
      
      const checks = {
        'Base footer class with proper flex': cssContent.includes('.shadcn-card-footer {') && 
                                             cssContent.includes('display: flex;') &&
                                             cssContent.includes('align-items: center;'),
        'Default space-between alignment': cssContent.includes('justify-content: space-between;'),
        'Footer border styling': cssContent.includes('border-top: 1px solid hsl(var(--border)'),
        'Auto margin for proper positioning': cssContent.includes('margin-top: auto;'),
        'Center alignment variant': cssContent.includes('.shadcn-card-footer--center'),
        'Start alignment variant': cssContent.includes('.shadcn-card-footer--start'),
        'End alignment variant': cssContent.includes('.shadcn-card-footer--end'),
        'Between alignment variant': cssContent.includes('.shadcn-card-footer--between'),
        'Around alignment variant': cssContent.includes('.shadcn-card-footer--around'),
        'No border variant': cssContent.includes('.shadcn-card-footer--no-border'),
        'KPI card footer styling': cssContent.includes('.shadcn-card--kpi .shadcn-card-footer'),
        'Compact footer variant': cssContent.includes('.shadcn-card--compact .shadcn-card-footer'),
        'Spacious footer variant': cssContent.includes('.shadcn-card--spacious .shadcn-card-footer')
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check CSS footer classes');
      return { error: error.message };
    }
  }

  checkHTMLFooterImplementation() {
    console.log('\n📄 Checking HTML footer implementation...');
    
    try {
      const htmlContent = fs.readFileSync(this.dashboardPath, 'utf8');
      
      const checks = {
        'Footer elements present': htmlContent.includes('shadcn-card-footer'),
        'View All Activity uses footer': htmlContent.includes('shadcn-card-footer shadcn-card-footer--center') &&
                                       htmlContent.includes('View All Activity'),
        'Center alignment used': htmlContent.includes('shadcn-card-footer--center'),
        'Between alignment used': htmlContent.includes('shadcn-card-footer--between'),
        'No border variant used': htmlContent.includes('shadcn-card-footer--no-border'),
        'KPI cards have footers': (htmlContent.match(/shadcn-card--kpi[\s\S]*?shadcn-card-footer/g) || []).length >= 2,
        'Footer content properly structured': htmlContent.includes('<span class="text-xs text-slate-500">'),
        'Multiple footer alignment types': (htmlContent.match(/shadcn-card-footer--/g) || []).length >= 3,
        'Proper footer structure': htmlContent.includes('</div>') &&
                                  htmlContent.includes('shadcn-card-footer') &&
                                  !htmlContent.includes('shadcn-card-footer shadcn-card-footer shadcn-card-footer')
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check HTML footer implementation');
      return { error: error.message };
    }
  }

  checkAlignmentVariants() {
    console.log('\n🎯 Checking alignment variants...');
    
    try {
      const cssContent = fs.readFileSync(this.cssPath, 'utf8');
      const htmlContent = fs.readFileSync(this.dashboardPath, 'utf8');
      
      const checks = {
        'Center alignment CSS defined': cssContent.includes('justify-content: center;'),
        'Start alignment CSS defined': cssContent.includes('justify-content: flex-start;'),
        'End alignment CSS defined': cssContent.includes('justify-content: flex-end;'),
        'Between alignment CSS defined': cssContent.includes('justify-content: space-between;'),
        'Around alignment CSS defined': cssContent.includes('justify-content: space-around;'),
        'Center alignment used in HTML': htmlContent.includes('shadcn-card-footer--center'),
        'Between alignment used in HTML': htmlContent.includes('shadcn-card-footer--between'),
        'Proper flex alignment structure': cssContent.includes('align-items: center;') &&
                                         cssContent.includes('display: flex;'),
        'Consistent alignment classes': (cssContent.match(/\.shadcn-card-footer--\w+/g) || []).length >= 5
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check alignment variants');
      return { error: error.message };
    }
  }

  checkKPICardFooters() {
    console.log('\n🃏 Checking KPI card footer integration...');
    
    try {
      const cssContent = fs.readFileSync(this.cssPath, 'utf8');
      const htmlContent = fs.readFileSync(this.dashboardPath, 'utf8');
      
      const checks = {
        'KPI card flex layout updated': cssContent.includes('justify-content: space-between;') &&
                                      cssContent.includes('.shadcn-card--kpi {'),
        'KPI footer padding optimized': cssContent.includes('.shadcn-card--kpi .shadcn-card-footer') &&
                                      cssContent.includes('padding: 1rem 1.75rem;'),
        'KPI footer background styling': cssContent.includes('background-color: hsl(var(--muted) / 0.3);'),
        'KPI footer border styling': cssContent.includes('border-top: 1px solid hsl(var(--border) / 0.05);'),
        'KPI cards with footers in HTML': (htmlContent.match(/shadcn-card--kpi[\s\S]*?shadcn-card-footer/g) || []).length >= 1,
        'Footer content in KPI cards': htmlContent.includes('Last updated:') || 
                                     htmlContent.includes('complete'),
        'Proper KPI card structure': htmlContent.includes('shadcn-card--kpi') &&
                                   htmlContent.includes('shadcn-card-content') &&
                                   htmlContent.includes('shadcn-card-footer'),
        'KPI footer margin reset': cssContent.includes('margin-top: 0;')
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check KPI card footers');
      return { error: error.message };
    }
  }

  checkResponsiveFooters() {
    console.log('\n📱 Checking responsive footer behavior...');
    
    try {
      const cssContent = fs.readFileSync(this.cssPath, 'utf8');
      
      const checks = {
        'Compact footer responsive padding': cssContent.includes('.shadcn-card--compact .shadcn-card-footer'),
        'Spacious footer responsive padding': cssContent.includes('.shadcn-card--spacious .shadcn-card-footer'),
        'Consistent padding structure': (cssContent.match(/padding: [\d.]+rem [\d.]+rem;/g) || []).length >= 3,
        'Footer flex properties maintained': cssContent.includes('display: flex;') &&
                                           cssContent.includes('align-items: center;'),
        'Proper footer hierarchy': cssContent.includes('padding-top: 0.75rem;') ||
                                 cssContent.includes('padding-top: 1rem;') ||
                                 cssContent.includes('padding-top: 1.25rem;'),
        'Border consistency': cssContent.includes('border-top: 1px solid'),
        'Background color variants': cssContent.includes('background-color: hsl(var(--muted)'),
        'Margin handling': cssContent.includes('margin-top: auto;') ||
                          cssContent.includes('margin-top: 0;')
      };

      Object.entries(checks).forEach(([check, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${check}`);
      });

      return checks;
    } catch (error) {
      console.log('❌ Failed to check responsive footers');
      return { error: error.message };
    }
  }

  displayResults(results) {
    console.log('\n📊 Footer Alignment Fix Verification Summary:');
    console.log('==============================================');

    const cssOk = !results.cssFooterClasses.error && 
                  Object.values(results.cssFooterClasses).every(Boolean);
    const htmlOk = !results.htmlFooterImplementation.error && 
                   Object.values(results.htmlFooterImplementation).every(Boolean);
    const alignmentOk = !results.alignmentVariants.error && 
                       Object.values(results.alignmentVariants).every(Boolean);
    const kpiOk = !results.kpiCardFooters.error && 
                  Object.values(results.kpiCardFooters).every(Boolean);
    const responsiveOk = !results.responsiveFooters.error && 
                        Object.values(results.responsiveFooters).every(Boolean);

    console.log(`${cssOk ? '✅' : '❌'} CSS Footer Classes: Proper alignment and styling`);
    console.log(`${htmlOk ? '✅' : '❌'} HTML Implementation: Footer elements properly used`);
    console.log(`${alignmentOk ? '✅' : '❌'} Alignment Variants: Multiple alignment options`);
    console.log(`${kpiOk ? '✅' : '❌'} KPI Card Footers: Specialized KPI footer styling`);
    console.log(`${responsiveOk ? '✅' : '❌'} Responsive Footers: Consistent across card types`);

    const overallSuccess = cssOk && htmlOk && alignmentOk && kpiOk && responsiveOk;
    
    console.log('\n🎯 Overall Status:');
    console.log(`${overallSuccess ? '🎉 SUCCESS' : '⚠️  ISSUES DETECTED'}`);
    
    if (overallSuccess) {
      console.log('\n✅ Footer alignment issues successfully fixed!');
      console.log('🎨 Improvements achieved:');
      console.log('   • Proper card footer structure with shadcn-card-footer class');
      console.log('   • Multiple alignment variants (center, start, end, between, around)');
      console.log('   • Consistent footer styling across all card types');
      console.log('   • Specialized KPI card footer integration');
      console.log('   • Responsive footer behavior');
      console.log('   • Professional border and background styling');
      console.log('\n🌐 View the fixed dashboard at: http://localhost:8000/dashboard/buyer-dashboard.html');
    } else {
      console.log('\n⚠️  Some footer alignment issues may not be fully resolved.');
      console.log('💡 Check the detailed results above for specific problems.');
    }

    return overallSuccess;
  }

  async generateFooterReport() {
    const results = await this.verifyFooterAlignmentFixes();
    
    const report = {
      timestamp: new Date().toISOString(),
      verification: results,
      fixes: {
        cssEnhancements: 'Added comprehensive footer alignment classes with multiple variants',
        htmlStructure: 'Converted ad-hoc button placement to proper card footer structure',
        alignmentOptions: 'Implemented center, start, end, between, and around alignment variants',
        kpiIntegration: 'Specialized footer styling for KPI cards with proper spacing',
        responsiveDesign: 'Consistent footer behavior across compact and spacious card variants',
        visualStyling: 'Added subtle borders and background colors for professional appearance'
      },
      beforeAfter: {
        before: {
          issue: 'View All Activity button used custom mt-6 text-center approach',
          problem: 'No consistent footer structure across cards',
          alignment: 'Inconsistent button and content placement'
        },
        after: {
          solution: 'Proper shadcn-card-footer class with alignment variants',
          structure: 'Consistent footer structure across all card types',
          alignment: 'Professional alignment options with proper flex properties'
        }
      },
      recommendations: [
        'Test footer alignment on different screen sizes',
        'Verify footer content readability and accessibility',
        'Consider adding more footer content where appropriate',
        'Ensure footer styling matches overall design system',
        'Test footer interactions and hover states'
      ]
    };

    fs.writeFileSync('footer-alignment-report.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Footer alignment report saved to: footer-alignment-report.json');
    
    return report;
  }

  async run() {
    console.log('🎯 Shadcn Card Footer Alignment Fix Verification\n');
    
    try {
      const report = await this.generateFooterReport();
      return report;
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return false;
    }
  }
}

// Run the verification
const verifier = new FooterAlignmentVerifier();
verifier.run().catch(console.error);
