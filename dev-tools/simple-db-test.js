#!/usr/bin/env node

/**
 * Simple Database Connection Test
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

console.log('🔧 Creating Supabase client...');
const supabase = createClient(supabaseUrl, supabaseKey);

console.log('✅ Supabase client created');

console.log('🔍 Testing database tables...');

const tables = ['profiles', 'listings', 'content_pages', 'blog_categories', 'documents', 'deals', 'vendors', 'vendor_reviews'];

for (const table of tables) {
    try {
        console.log(`Testing ${table}...`);
        const { data, error } = await supabase
            .from(table)
            .select('id')
            .limit(1);

        if (error) {
            console.log(`❌ ${table}: ${error.message}`);
        } else {
            console.log(`✅ ${table}: accessible (${data.length} records)`);
        }
    } catch (err) {
        console.log(`❌ ${table}: Exception - ${err.message}`);
    }
}

console.log('🏁 Test complete');
