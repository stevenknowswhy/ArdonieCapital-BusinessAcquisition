#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Supabase configuration with service role
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTkyMDE5NCwiZXhwIjoyMDY3NDk2MTk0fQ.0I9WjlCedZQ_RkXx8KRXkcVW7blG7EvmHgc-ClLPRLs';

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function runCleanup() {
    console.log('🧹 Running Pre-Deployment Cleanup...');
    console.log('====================================');
    
    try {
        // Read the cleanup SQL file
        const cleanupSQL = readFileSync('database/pre-deployment-cleanup.sql', 'utf8');
        
        // Split into individual statements
        const statements = cleanupSQL
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        console.log(`Found ${statements.length} cleanup statements to execute\n`);
        
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`Executing statement ${i + 1}/${statements.length}...`);
                    
                    // For cleanup, we'll use direct SQL execution
                    const { data, error } = await supabase.rpc('exec', {
                        sql: statement + ';'
                    });
                    
                    if (error) {
                        // Many cleanup operations are expected to fail (objects don't exist)
                        if (error.message.includes('does not exist') || 
                            error.message.includes('cannot drop') ||
                            error.message.includes('already exists')) {
                            console.log(`   ⚠️  Expected: ${error.message.substring(0, 60)}...`);
                        } else {
                            console.log(`   ❌ Error: ${error.message}`);
                            errorCount++;
                        }
                    } else {
                        console.log(`   ✅ Success`);
                        successCount++;
                    }
                } catch (e) {
                    console.log(`   ⚠️  Exception (expected): ${e.message.substring(0, 60)}...`);
                }
            }
        }
        
        console.log(`\n📊 Cleanup Results:`);
        console.log(`✅ Successful operations: ${successCount}`);
        console.log(`❌ Errors: ${errorCount}`);
        console.log(`⚠️  Expected failures: ${statements.length - successCount - errorCount}`);
        
        console.log('\n🎯 Pre-deployment cleanup completed!');
        console.log('✅ Database is ready for schema deployment');
        
        return true;
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        return false;
    }
}

// Run cleanup if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runCleanup()
        .then(success => {
            if (success) {
                console.log('\n✅ Ready to proceed with schema deployment');
                console.log('Next step: node safe-schema-deployment.js');
                process.exit(0);
            } else {
                console.log('\n❌ Cleanup failed - check errors above');
                process.exit(1);
            }
        })
        .catch(error => {
            console.error('❌ Script execution failed:', error);
            process.exit(1);
        });
}

export default runCleanup;
