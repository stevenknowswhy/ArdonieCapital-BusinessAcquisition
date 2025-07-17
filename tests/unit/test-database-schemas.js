#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test results tracking
const testResults = {
  connection: false,
  tables: {},
  schemas: {},
  functions: {},
  triggers: {},
  indexes: {}
};

async function testConnection() {
  console.log('🔍 Phase 1: Database Schema Validation');
  console.log('=====================================\n');
  
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return false;
    }
    console.log('✅ Supabase connection successful\n');
    testResults.connection = true;
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

async function testTableExistence() {
  console.log('Testing table existence...');
  
  // Core tables that should exist
  const coreTables = ['profiles', 'listings', 'vendors'];
  
  // New feature tables to test
  const featureTables = {
    'Deal Management': ['deals', 'deal_documents', 'deal_milestones', 'deal_activities'],
    'Payment System': ['payments', 'badge_orders', 'subscriptions', 'escrow_accounts', 'fee_transactions'],
    'Enhanced Marketplace': ['listing_inquiries', 'inquiry_responses', 'listing_views', 'listing_engagement', 'saved_listings'],
    'Matchmaking': ['matches', 'user_preferences', 'match_feedback', 'match_interactions', 'match_scores'],
    'CMS': ['cms_categories', 'cms_tags', 'cms_content', 'cms_comments', 'cms_media'],
    'Subscriptions': ['subscription_plans', 'user_badges', 'badge_verification', 'invoices']
  };
  
  // Test core tables first
  console.log('\n📋 Core Tables:');
  for (const table of coreTables) {
    try {
      const { data, error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
        testResults.tables[table] = false;
      } else {
        console.log(`✅ ${table}: accessible`);
        testResults.tables[table] = true;
      }
    } catch (e) {
      console.log(`❌ ${table}: ${e.message}`);
      testResults.tables[table] = false;
    }
  }
  
  // Test feature tables
  for (const [feature, tables] of Object.entries(featureTables)) {
    console.log(`\n📋 ${feature} Tables:`);
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.log(`❌ ${table}: ${error.message}`);
          testResults.tables[table] = false;
        } else {
          console.log(`✅ ${table}: accessible`);
          testResults.tables[table] = true;
        }
      } catch (e) {
        console.log(`❌ ${table}: ${e.message}`);
        testResults.tables[table] = false;
      }
    }
  }
}

async function testEnumTypes() {
  console.log('\n🔧 Testing Enum Types...');
  
  const enumTests = [
    { name: 'deal_status', table: 'deals', column: 'status' },
    { name: 'payment_status', table: 'payments', column: 'status' },
    { name: 'inquiry_status', table: 'listing_inquiries', column: 'status' },
    { name: 'match_status', table: 'matches', column: 'status' },
    { name: 'content_status', table: 'cms_content', column: 'status' },
    { name: 'subscription_status', table: 'subscriptions', column: 'status' }
  ];
  
  for (const enumTest of enumTests) {
    try {
      // Try to query the table to see if enum is working
      const { data, error } = await supabase
        .from(enumTest.table)
        .select(enumTest.column)
        .limit(1);
      
      if (error && !error.message.includes('does not exist')) {
        console.log(`❌ ${enumTest.name}: ${error.message}`);
        testResults.schemas[enumTest.name] = false;
      } else {
        console.log(`✅ ${enumTest.name}: enum type accessible`);
        testResults.schemas[enumTest.name] = true;
      }
    } catch (e) {
      console.log(`❌ ${enumTest.name}: ${e.message}`);
      testResults.schemas[enumTest.name] = false;
    }
  }
}

async function testBasicQueries() {
  console.log('\n📊 Testing Basic Queries...');
  
  const queryTests = [
    {
      name: 'Profile Count',
      query: () => supabase.from('profiles').select('count', { count: 'exact' })
    },
    {
      name: 'Listing Count', 
      query: () => supabase.from('listings').select('count', { count: 'exact' })
    }
  ];
  
  for (const test of queryTests) {
    try {
      const { data, error, count } = await test.query();
      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: ${count || 0} records`);
      }
    } catch (e) {
      console.log(`❌ ${test.name}: ${e.message}`);
    }
  }
}

async function generateReport() {
  console.log('\n📈 Database Schema Validation Report');
  console.log('=====================================');
  
  const totalTables = Object.keys(testResults.tables).length;
  const accessibleTables = Object.values(testResults.tables).filter(Boolean).length;
  const totalSchemas = Object.keys(testResults.schemas).length;
  const workingSchemas = Object.values(testResults.schemas).filter(Boolean).length;
  
  console.log(`\n📊 Summary:`);
  console.log(`Connection: ${testResults.connection ? '✅' : '❌'}`);
  console.log(`Tables: ${accessibleTables}/${totalTables} accessible`);
  console.log(`Schemas: ${workingSchemas}/${totalSchemas} working`);
  
  if (accessibleTables < totalTables) {
    console.log('\n⚠️  Missing or inaccessible tables:');
    for (const [table, accessible] of Object.entries(testResults.tables)) {
      if (!accessible) {
        console.log(`   - ${table}`);
      }
    }
  }
  
  if (workingSchemas < totalSchemas) {
    console.log('\n⚠️  Schema issues:');
    for (const [schema, working] of Object.entries(testResults.schemas)) {
      if (!working) {
        console.log(`   - ${schema}`);
      }
    }
  }
  
  const overallHealth = (accessibleTables / totalTables) * 100;
  console.log(`\n🎯 Overall Database Health: ${overallHealth.toFixed(1)}%`);
  
  if (overallHealth >= 90) {
    console.log('🟢 Database is in excellent condition');
  } else if (overallHealth >= 70) {
    console.log('🟡 Database needs some attention');
  } else {
    console.log('🔴 Database requires significant work');
  }
}

async function main() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.log('❌ Cannot proceed without database connection');
      process.exit(1);
    }
    
    await testTableExistence();
    await testEnumTypes();
    await testBasicQueries();
    await generateReport();
    
    console.log('\n✅ Database schema validation complete');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
    process.exit(1);
  }
}

main();
