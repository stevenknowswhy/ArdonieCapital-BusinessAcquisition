#!/usr/bin/env node

/**
 * Development Server for Ardonie Capital Platform
 * Serves static files with proper MIME types and CORS headers
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

class DevServer {
    constructor(port = 3000) {
        this.port = port;
        this.mimeTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.ico': 'image/x-icon',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf',
            '.eot': 'application/vnd.ms-fontobject'
        };
    }

    /**
     * Get MIME type for file extension
     */
    getMimeType(filePath) {
        const ext = path.extname(filePath).toLowerCase();
        return this.mimeTypes[ext] || 'application/octet-stream';
    }

    /**
     * Serve static files
     */
    serveFile(req, res, filePath) {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <title>404 - Page Not Found</title>
                        <style>
                            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
                            h1 { color: #e74c3c; }
                            a { color: #3498db; text-decoration: none; }
                            a:hover { text-decoration: underline; }
                        </style>
                    </head>
                    <body>
                        <h1>404 - Page Not Found</h1>
                        <p>The requested file <code>${req.url}</code> was not found.</p>
                        <p><a href="/">← Back to Home</a></p>
                    </body>
                    </html>
                `);
                return;
            }

            const mimeType = this.getMimeType(filePath);
            res.writeHead(200, {
                'Content-Type': mimeType,
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Cache-Control': 'no-cache'
            });
            res.end(data);
        });
    }

    /**
     * Handle requests
     */
    handleRequest(req, res) {
        let urlPath = req.url;
        
        // Remove query parameters
        const queryIndex = urlPath.indexOf('?');
        if (queryIndex !== -1) {
            urlPath = urlPath.substring(0, queryIndex);
        }

        // Default to index.html for root
        if (urlPath === '/') {
            urlPath = '/index.html';
        }

        // Add .html extension if missing and not a file with extension
        if (!path.extname(urlPath) && !urlPath.includes('.')) {
            urlPath += '.html';
        }

        const filePath = path.join(projectRoot, urlPath);
        
        // Security check - ensure file is within project root
        const resolvedPath = path.resolve(filePath);
        if (!resolvedPath.startsWith(projectRoot)) {
            res.writeHead(403, { 'Content-Type': 'text/html' });
            res.end('<h1>403 - Forbidden</h1><p>Access denied.</p>');
            return;
        }

        // Check if file exists
        fs.access(resolvedPath, fs.constants.F_OK, (err) => {
            if (err) {
                // Try with .html extension if it doesn't exist
                const htmlPath = resolvedPath + '.html';
                fs.access(htmlPath, fs.constants.F_OK, (htmlErr) => {
                    if (htmlErr) {
                        this.serveFile(req, res, resolvedPath); // This will show 404
                    } else {
                        this.serveFile(req, res, htmlPath);
                    }
                });
            } else {
                this.serveFile(req, res, resolvedPath);
            }
        });
    }

    /**
     * Start the development server
     */
    start() {
        const server = http.createServer((req, res) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
            this.handleRequest(req, res);
        });

        server.listen(this.port, () => {
            console.log('🚀 Ardonie Capital Development Server Started!');
            console.log('');
            console.log(`📍 Server running at: http://localhost:${this.port}`);
            console.log(`📁 Serving files from: ${projectRoot}`);
            console.log('');
            console.log('🔗 Quick Links:');
            console.log(`   🏠 Home Page: http://localhost:${this.port}/`);
            console.log(`   🏪 Marketplace: http://localhost:${this.port}/marketplace/listings`);
            console.log(`   👥 Buyer Portal: http://localhost:${this.port}/portals/buyer-portal`);
            console.log(`   💼 Seller Portal: http://localhost:${this.port}/portals/seller-portal`);
            console.log(`   📞 Contact: http://localhost:${this.port}/contact`);
            console.log(`   📝 Blog: http://localhost:${this.port}/blog`);
            console.log(`   💼 Careers: http://localhost:${this.port}/careers`);
            console.log('');
            console.log('🛠️ Testing Features:');
            console.log('   ✅ Navigation between pages');
            console.log('   ✅ Interactive filtering and search');
            console.log('   ✅ Contact forms and modals');
            console.log('   ✅ Theme switching (dark/light)');
            console.log('   ✅ Responsive design');
            console.log('   ✅ Footer consistency');
            console.log('');
            console.log('Press Ctrl+C to stop the server');
        });

        // Handle server shutdown gracefully
        process.on('SIGINT', () => {
            console.log('\n🛑 Shutting down development server...');
            server.close(() => {
                console.log('✅ Server stopped successfully');
                process.exit(0);
            });
        });

        return server;
    }
}

// Start the development server
const port = process.env.PORT || 3000;
const devServer = new DevServer(port);
devServer.start();

export default DevServer;
