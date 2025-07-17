#!/usr/bin/env node

/**
 * Directory-Specific Footer Template Generator
 * 
 * This script generates footer templates with correct relative paths
 * for different directory levels based on the master footer-embedded.html
 * 
 * Usage: node scripts/generate-directory-footer-templates.js
 */

import fs from 'fs';
import path from 'path';

class FooterTemplateGenerator {
  constructor() {
    this.masterTemplate = null;
    this.templates = {};
  }

  /**
   * Generate all directory-specific footer templates
   */
  async generateTemplates() {
    console.log('🏗️  Generating Directory-Specific Footer Templates...\n');
    console.log('📋 Master Template: footer-embedded.html');
    console.log('🎯 Goal: Create templates with correct relative paths for each directory level');
    console.log('=' .repeat(70));

    try {
      // Load master template
      await this.loadMasterTemplate();
      
      // Generate templates for different directory levels
      this.generateRootTemplate();
      this.generateSubdirectoryTemplate();
      this.generateDeepSubdirectoryTemplate();
      
      // Generate specific directory templates
      this.generateAuthTemplate();
      this.generatePortalsTemplate();
      this.generateVendorPortalTemplate();
      this.generateBlogTemplate();
      this.generateDashboardTemplate();
      this.generateDocumentsTemplate();
      
      // Save all templates
      await this.saveAllTemplates();
      
      console.log('\n🎉 All footer templates generated successfully!');
      return this.templates;
    } catch (error) {
      console.error('❌ Template generation failed:', error);
      throw error;
    }
  }

  /**
   * Load the master footer template
   */
  async loadMasterTemplate() {
    console.log('\n📄 Loading Master Footer Template...');
    
    if (!fs.existsSync('footer-embedded.html')) {
      throw new Error('Master template footer-embedded.html not found');
    }
    
    this.masterTemplate = fs.readFileSync('footer-embedded.html', 'utf8');
    
    // Fix social media links in master template
    this.masterTemplate = this.fixSocialMediaLinks(this.masterTemplate);
    
    console.log('✅ Master template loaded and social media links fixed');
  }

  /**
   * Fix social media links to use proper URLs
   */
  fixSocialMediaLinks(content) {
    return content
      .replace(/href="#" aria-label="Follow us on Twitter"/g, 
               'href="https://twitter.com/ardoniecapital" aria-label="Twitter"')
      .replace(/href="#" aria-label="Follow us on Facebook"/g, 
               'href="https://facebook.com/ardoniecapital" aria-label="Facebook"')
      .replace(/href="#" aria-label="Connect with us on LinkedIn"/g, 
               'href="https://linkedin.com/company/ardoniecapital" aria-label="LinkedIn"');
  }

  /**
   * Generate root directory template (no path adjustments needed)
   */
  generateRootTemplate() {
    console.log('📁 Generating Root Directory Template...');
    
    this.templates.root = {
      name: 'Root Directory Template',
      path: 'footer-templates/root-footer.html',
      content: this.masterTemplate,
      description: 'For pages in the root directory (index.html, about.html, etc.)'
    };
    
    console.log('✅ Root template generated');
  }

  /**
   * Generate subdirectory template (one level deep)
   */
  generateSubdirectoryTemplate() {
    console.log('📁 Generating Subdirectory Template...');
    
    let content = this.masterTemplate;
    
    // Add ../ prefix to all relative paths that don't already have it
    content = content.replace(
      /href="(?!\.\.\/|https?:\/\/|#)([^"]+)"/g,
      'href="../$1"'
    );
    
    this.templates.subdirectory = {
      name: 'Subdirectory Template',
      path: 'footer-templates/subdirectory-footer.html',
      content: content,
      description: 'For pages one level deep (auth/, portals/, vendor-portal/, etc.)'
    };
    
    console.log('✅ Subdirectory template generated');
  }

  /**
   * Generate deep subdirectory template (two levels deep)
   */
  generateDeepSubdirectoryTemplate() {
    console.log('📁 Generating Deep Subdirectory Template...');
    
    let content = this.masterTemplate;
    
    // Add ../../ prefix to all relative paths
    content = content.replace(
      /href="(?!\.\.\/|https?:\/\/|#)([^"]+)"/g,
      'href="../../$1"'
    );
    
    this.templates.deepSubdirectory = {
      name: 'Deep Subdirectory Template',
      path: 'footer-templates/deep-subdirectory-footer.html',
      content: content,
      description: 'For pages two levels deep (portals/sections/, blog/posts/, etc.)'
    };
    
    console.log('✅ Deep subdirectory template generated');
  }

  /**
   * Generate auth directory specific template
   */
  generateAuthTemplate() {
    console.log('📁 Generating Auth Directory Template...');
    
    let content = this.templates.subdirectory.content;
    
    // Adjust auth-specific links to be relative within auth directory
    content = content.replace(/href="\.\.\/auth\/login\.html"/g, 'href="login.html"');
    content = content.replace(/href="\.\.\/auth\/register\.html"/g, 'href="register.html"');
    
    this.templates.auth = {
      name: 'Auth Directory Template',
      path: 'footer-templates/auth-footer.html',
      content: content,
      description: 'For pages in auth/ directory with auth-specific link adjustments'
    };
    
    console.log('✅ Auth template generated');
  }

  /**
   * Generate portals directory specific template
   */
  generatePortalsTemplate() {
    console.log('📁 Generating Portals Directory Template...');
    
    let content = this.templates.subdirectory.content;
    
    // Adjust portal-specific links to be relative within portals directory
    content = content.replace(/href="\.\.\/portals\/([^"]+)"/g, 'href="$1"');
    
    this.templates.portals = {
      name: 'Portals Directory Template',
      path: 'footer-templates/portals-footer.html',
      content: content,
      description: 'For pages in portals/ directory with portal-specific link adjustments'
    };
    
    console.log('✅ Portals template generated');
  }

  /**
   * Generate vendor-portal directory specific template
   */
  generateVendorPortalTemplate() {
    console.log('📁 Generating Vendor-Portal Directory Template...');
    
    let content = this.templates.subdirectory.content;
    
    // Adjust vendor-portal-specific links to be relative within vendor-portal directory
    content = content.replace(/href="\.\.\/vendor-portal\/([^"]+)"/g, 'href="$1"');
    
    this.templates.vendorPortal = {
      name: 'Vendor-Portal Directory Template',
      path: 'footer-templates/vendor-portal-footer.html',
      content: content,
      description: 'For pages in vendor-portal/ directory with vendor-portal-specific link adjustments'
    };
    
    console.log('✅ Vendor-Portal template generated');
  }

  /**
   * Generate blog directory specific template
   */
  generateBlogTemplate() {
    console.log('📁 Generating Blog Directory Template...');
    
    let content = this.templates.subdirectory.content;
    
    // Adjust blog-specific links
    content = content.replace(/href="\.\.\/blog\/index\.html"/g, 'href="index.html"');
    content = content.replace(/href="\.\.\/blog\/([^"]+)"/g, 'href="$1"');
    
    this.templates.blog = {
      name: 'Blog Directory Template',
      path: 'footer-templates/blog-footer.html',
      content: content,
      description: 'For pages in blog/ directory with blog-specific link adjustments'
    };
    
    console.log('✅ Blog template generated');
  }

  /**
   * Generate dashboard directory specific template
   */
  generateDashboardTemplate() {
    console.log('📁 Generating Dashboard Directory Template...');
    
    let content = this.templates.subdirectory.content;
    
    // Adjust dashboard-specific links
    content = content.replace(/href="\.\.\/dashboard\/([^"]+)"/g, 'href="$1"');
    
    this.templates.dashboard = {
      name: 'Dashboard Directory Template',
      path: 'footer-templates/dashboard-footer.html',
      content: content,
      description: 'For pages in dashboard/ directory with dashboard-specific link adjustments'
    };
    
    console.log('✅ Dashboard template generated');
  }

  /**
   * Generate documents directory specific template
   */
  generateDocumentsTemplate() {
    console.log('📁 Generating Documents Directory Template...');
    
    let content = this.templates.subdirectory.content;
    
    // Adjust documents-specific links
    content = content.replace(/href="\.\.\/documents\/([^"]+)"/g, 'href="$1"');
    
    this.templates.documents = {
      name: 'Documents Directory Template',
      path: 'footer-templates/documents-footer.html',
      content: content,
      description: 'For pages in documents/ directory with documents-specific link adjustments'
    };
    
    console.log('✅ Documents template generated');
  }

  /**
   * Save all generated templates to files
   */
  async saveAllTemplates() {
    console.log('\n💾 Saving Footer Templates...');
    
    // Create footer-templates directory if it doesn't exist
    if (!fs.existsSync('footer-templates')) {
      fs.mkdirSync('footer-templates');
    }
    
    // Save each template
    for (const [key, template] of Object.entries(this.templates)) {
      fs.writeFileSync(template.path, template.content, 'utf8');
      console.log(`✅ Saved: ${template.path}`);
    }
    
    // Generate template usage guide
    this.generateUsageGuide();
    
    console.log('\n📄 All templates saved to footer-templates/ directory');
  }

  /**
   * Generate usage guide for the templates
   */
  generateUsageGuide() {
    const guide = `# Footer Template Usage Guide

## Generated Footer Templates

This directory contains footer templates with correct relative paths for different directory levels.

### Template Files:

${Object.entries(this.templates).map(([key, template]) => 
  `- **${template.name}** (\`${template.path}\`)
  ${template.description}`
).join('\n\n')}

### Usage Instructions:

1. **Identify Directory Level**: Determine how deep your HTML file is from the root
2. **Select Appropriate Template**: Choose the template that matches your directory level
3. **Copy Footer Content**: Copy the entire footer content from the template
4. **Replace Existing Footer**: Replace any existing footer in your HTML file

### Path Structure Examples:

- **Root Level**: \`index.html\`, \`about.html\` → Use \`root-footer.html\`
- **One Level Deep**: \`auth/login.html\`, \`portals/buyer-portal.html\` → Use \`subdirectory-footer.html\`
- **Two Levels Deep**: \`portals/sections/buyer-section.html\` → Use \`deep-subdirectory-footer.html\`

### Directory-Specific Templates:

For common directories, use the specific templates that have optimized internal links:
- **auth/** → Use \`auth-footer.html\`
- **portals/** → Use \`portals-footer.html\`
- **vendor-portal/** → Use \`vendor-portal-footer.html\`
- **blog/** → Use \`blog-footer.html\`
- **dashboard/** → Use \`dashboard-footer.html\`
- **documents/** → Use \`documents-footer.html\`

### Social Media Links:

All templates include the correct Ardonie Capital social media URLs:
- Twitter: https://twitter.com/ardoniecapital
- Facebook: https://facebook.com/ardoniecapital
- LinkedIn: https://linkedin.com/company/ardoniecapital

### Validation:

After implementing a footer, run the validation script to ensure all links work correctly:
\`\`\`bash
node scripts/footer-validation-comprehensive.js
\`\`\`

Generated on: ${new Date().toISOString()}
`;

    fs.writeFileSync('footer-templates/README.md', guide, 'utf8');
    console.log('✅ Saved: footer-templates/README.md');
  }
}

// Run template generation if called directly
if (import.meta.url.includes('generate-directory-footer-templates.js')) {
  const generator = new FooterTemplateGenerator();
  generator.generateTemplates()
    .then(templates => {
      console.log(`\n📊 Generated ${Object.keys(templates).length} footer templates`);
      console.log('📁 Templates saved to footer-templates/ directory');
      console.log('📖 Usage guide: footer-templates/README.md');
    })
    .catch(error => {
      console.error('❌ Template generation failed:', error);
      process.exit(1);
    });
}

export default FooterTemplateGenerator;
