#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Blog article files to fix (excluding index.html and dynamic-blog.html)
const blogFiles = [
    'due-diligence-checklist.html',
    'express-deal-success-stories.html', 
    'financing-options-auto-shops.html',
    'preparing-auto-shop-for-sale.html'
];

const blogDir = path.join(__dirname, '..', 'blog');

// Template for the new head section
const newHeadTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//images.unsplash.com">
    <link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" as="style">
    <meta charset="UTF-8">
    <link rel="icon" type="image/x-icon" href="../favicon.ico">

    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <meta name="description" content="{{DESCRIPTION}}">

    <!-- Tailwind CSS -->
    <link rel="stylesheet" href="../assets/css/tailwind.css">

    <!-- Theme System -->
    <script>
        // Initialize tailwind config with theme support
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: {
                            light: '#3B82F6',
                            DEFAULT: '#2563EB',
                            dark: '#1D4ED8'
                        },
                        secondary: {
                            light: '#F8FAFC',
                            DEFAULT: '#E2E8F0',
                            dark: '#64748B'
                        },
                        accent: {
                            light: '#10B981',
                            DEFAULT: '#059669',
                            dark: '#047857'
                        }
                    }
                }
            }
        };

        // Apply saved theme preference immediately to prevent flash
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    <!-- Custom CSS -->
    <link rel="stylesheet" media="print" onload="this.media='all'" href="../assets/css/common.css">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" media="print" onload="this.media='all'">

    <!-- Intersection Observer Polyfill for older browsers -->
    <script>
        if (!('IntersectionObserver' in window)) {
            const script = document.createElement('script');
            script.src = 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver';
            document.head.appendChild(script);
        }
    </script>
    
    <!-- Navigation Styles -->
    <link rel="stylesheet" href="../components/navigation-styles.css">
</head>`;

// Navigation component replacement
const navigationReplacement = `<body class="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
    <!-- Navigation -->
    <div id="main-navigation-container"></div>`;

// Navigation script template
const navigationScript = `    <!-- Load Navigation Component -->
    <script src="../components/main-navigation.js"></script>`;

function fixBlogFile(filename) {
    const filePath = path.join(blogDir, filename);
    
    if (!fs.existsSync(filePath)) {
        console.log(`❌ File not found: ${filename}`);
        return false;
    }

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Extract title and description from existing content
        const titleMatch = content.match(/<title>(.*?)<\/title>/);
        const descMatch = content.match(/<meta name="description" content="(.*?)"/);
        
        const title = titleMatch ? titleMatch[1] : 'Blog Article - Ardonie Capital';
        const description = descMatch ? descMatch[1] : 'Expert insights on auto repair shop transactions and business tips.';
        
        // Replace head section
        const headEndIndex = content.indexOf('</head>');
        if (headEndIndex === -1) {
            console.log(`❌ Could not find </head> in ${filename}`);
            return false;
        }
        
        const bodyStartIndex = content.indexOf('<body');
        if (bodyStartIndex === -1) {
            console.log(`❌ Could not find <body in ${filename}`);
            return false;
        }
        
        // Find the end of the hardcoded header section
        const headerEndIndex = content.indexOf('</header>', bodyStartIndex);
        if (headerEndIndex === -1) {
            console.log(`❌ Could not find header end in ${filename}`);
            return false;
        }
        
        // Get content after the header
        const afterHeaderIndex = content.indexOf('\n', headerEndIndex + 9);
        const afterHeaderContent = content.substring(afterHeaderIndex);
        
        // Replace head with new template
        let newHead = newHeadTemplate.replace('{{TITLE}}', title).replace('{{DESCRIPTION}}', description);
        
        // Combine new head with navigation and rest of content
        let newContent = newHead + '\n' + navigationReplacement + '\n' + afterHeaderContent;
        
        // Fix breadcrumb links
        newContent = newContent.replace(/href="\.\.\/blog\.html"/g, 'href="index.html"');
        
        // Fix "Back to Blog" links
        newContent = newContent.replace(/href="\.\.\/blog\.html"/g, 'href="index.html"');
        
        // Replace old mobile menu script with navigation script
        const scriptRegex = /<script>\s*\/\/\s*Mobile menu toggle[\s\S]*?<\/script>/;
        newContent = newContent.replace(scriptRegex, navigationScript);
        
        // Write the fixed content
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✅ Fixed ${filename}`);
        return true;
        
    } catch (error) {
        console.log(`❌ Error fixing ${filename}:`, error.message);
        return false;
    }
}

// Main execution
console.log('🔧 Fixing blog article CSS and navigation...\n');

let successCount = 0;
let totalCount = blogFiles.length;

for (const filename of blogFiles) {
    if (fixBlogFile(filename)) {
        successCount++;
    }
}

console.log(`\n📊 Results: ${successCount}/${totalCount} files fixed successfully`);

if (successCount === totalCount) {
    console.log('🎉 All blog article pages have been fixed!');
} else {
    console.log('⚠️  Some files could not be fixed. Please check the errors above.');
}
