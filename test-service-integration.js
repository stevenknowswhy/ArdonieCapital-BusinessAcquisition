#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://pbydepsqcypwqbicnsco.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBieWRlcHNxY3lwd3FiaWNuc2NvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5MjAxOTQsImV4cCI6MjA2NzQ5NjE5NH0.5aF46QcNOFN_vwXcHxCsVx_8a4EsqE1bL4fy4K7UXI0';

const supabase = createClient(supabaseUrl, supabaseKey);

// Test results tracking
const testResults = {
  dealManagement: {},
  paymentSystem: {},
  marketplace: {},
  matchmaking: {},
  cms: {},
  subscriptions: {}
};

async function testDealManagementService() {
  console.log('\n💼 Testing Deal Management Service...');
  
  try {
    // Test 1: Create a test deal
    const testDeal = {
      buyer_id: '00000000-0000-0000-0000-000000000001', // Mock UUID
      seller_id: '00000000-0000-0000-0000-000000000002', // Mock UUID
      listing_id: '00000000-0000-0000-0000-000000000003', // Mock UUID
      status: 'initial_interest',
      initial_offer: 250000,
      offer_date: new Date().toISOString().split('T')[0]
    };
    
    console.log('   Testing deal creation...');
    const { data: dealData, error: dealError } = await supabase
      .from('deals')
      .insert(testDeal)
      .select()
      .single();
    
    if (dealError) {
      console.log(`   ❌ Deal creation failed: ${dealError.message}`);
      testResults.dealManagement.createDeal = false;
    } else {
      console.log(`   ✅ Deal created successfully: ${dealData.deal_number}`);
      testResults.dealManagement.createDeal = true;
      
      // Test 2: Update deal status
      console.log('   Testing deal status update...');
      const { data: updateData, error: updateError } = await supabase
        .from('deals')
        .update({ status: 'nda_signed' })
        .eq('id', dealData.id)
        .select()
        .single();
      
      if (updateError) {
        console.log(`   ❌ Deal update failed: ${updateError.message}`);
        testResults.dealManagement.updateDeal = false;
      } else {
        console.log(`   ✅ Deal status updated to: ${updateData.status}`);
        testResults.dealManagement.updateDeal = true;
      }
      
      // Test 3: Add deal milestone
      console.log('   Testing deal milestone creation...');
      const testMilestone = {
        deal_id: dealData.id,
        milestone_name: 'Test Milestone',
        description: 'Test milestone for service validation',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      const { data: milestoneData, error: milestoneError } = await supabase
        .from('deal_milestones')
        .insert(testMilestone)
        .select()
        .single();
      
      if (milestoneError) {
        console.log(`   ❌ Milestone creation failed: ${milestoneError.message}`);
        testResults.dealManagement.createMilestone = false;
      } else {
        console.log(`   ✅ Milestone created: ${milestoneData.milestone_name}`);
        testResults.dealManagement.createMilestone = true;
      }
      
      // Cleanup
      await supabase.from('deals').delete().eq('id', dealData.id);
    }
    
  } catch (error) {
    console.log(`   ❌ Deal management service error: ${error.message}`);
    testResults.dealManagement.error = error.message;
  }
}

async function testPaymentService() {
  console.log('\n💳 Testing Payment Service...');
  
  try {
    // Test 1: Create a test payment
    const testPayment = {
      payment_type: 'badge',
      amount: 9900, // $99.00 in cents
      currency: 'USD',
      status: 'pending',
      user_id: '00000000-0000-0000-0000-000000000001',
      description: 'Test badge payment'
    };
    
    console.log('   Testing payment creation...');
    const { data: paymentData, error: paymentError } = await supabase
      .from('payments')
      .insert(testPayment)
      .select()
      .single();
    
    if (paymentError) {
      console.log(`   ❌ Payment creation failed: ${paymentError.message}`);
      testResults.paymentSystem.createPayment = false;
    } else {
      console.log(`   ✅ Payment created: ${paymentData.payment_number}`);
      testResults.paymentSystem.createPayment = true;
      
      // Test 2: Update payment status
      console.log('   Testing payment status update...');
      const { data: updateData, error: updateError } = await supabase
        .from('payments')
        .update({ status: 'succeeded' })
        .eq('id', paymentData.id)
        .select()
        .single();
      
      if (updateError) {
        console.log(`   ❌ Payment update failed: ${updateError.message}`);
        testResults.paymentSystem.updatePayment = false;
      } else {
        console.log(`   ✅ Payment status updated to: ${updateData.status}`);
        testResults.paymentSystem.updatePayment = true;
      }
      
      // Cleanup
      await supabase.from('payments').delete().eq('id', paymentData.id);
    }
    
  } catch (error) {
    console.log(`   ❌ Payment service error: ${error.message}`);
    testResults.paymentSystem.error = error.message;
  }
}

async function testMarketplaceService() {
  console.log('\n🏪 Testing Enhanced Marketplace Service...');
  
  try {
    // Test 1: Create a listing inquiry
    const testInquiry = {
      listing_id: '00000000-0000-0000-0000-000000000003',
      buyer_id: '00000000-0000-0000-0000-000000000001',
      seller_id: '00000000-0000-0000-0000-000000000002',
      inquiry_type: 'general',
      message: 'Test inquiry for service validation',
      subject: 'Test Inquiry'
    };
    
    console.log('   Testing inquiry creation...');
    const { data: inquiryData, error: inquiryError } = await supabase
      .from('listing_inquiries')
      .insert(testInquiry)
      .select()
      .single();
    
    if (inquiryError) {
      console.log(`   ❌ Inquiry creation failed: ${inquiryError.message}`);
      testResults.marketplace.createInquiry = false;
    } else {
      console.log(`   ✅ Inquiry created: ${inquiryData.inquiry_number}`);
      testResults.marketplace.createInquiry = true;
      
      // Test 2: Track listing view
      console.log('   Testing listing view tracking...');
      const testView = {
        listing_id: '00000000-0000-0000-0000-000000000003',
        viewer_id: '00000000-0000-0000-0000-000000000001',
        session_id: 'test-session-' + Date.now(),
        view_duration: 120
      };
      
      const { data: viewData, error: viewError } = await supabase
        .from('listing_views')
        .insert(testView)
        .select()
        .single();
      
      if (viewError) {
        console.log(`   ❌ View tracking failed: ${viewError.message}`);
        testResults.marketplace.trackView = false;
      } else {
        console.log(`   ✅ View tracked: ${viewData.session_id}`);
        testResults.marketplace.trackView = true;
      }
      
      // Cleanup
      await supabase.from('listing_inquiries').delete().eq('id', inquiryData.id);
    }
    
  } catch (error) {
    console.log(`   ❌ Marketplace service error: ${error.message}`);
    testResults.marketplace.error = error.message;
  }
}

async function testMatchmakingService() {
  console.log('\n🤝 Testing Matchmaking Service...');
  
  try {
    // Test 1: Create a match
    const testMatch = {
      buyer_id: '00000000-0000-0000-0000-000000000001',
      seller_id: '00000000-0000-0000-0000-000000000002',
      listing_id: '00000000-0000-0000-0000-000000000003',
      compatibility_score: 85,
      match_reasons: ['price_range', 'location', 'business_type']
    };
    
    console.log('   Testing match creation...');
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .insert(testMatch)
      .select()
      .single();
    
    if (matchError) {
      console.log(`   ❌ Match creation failed: ${matchError.message}`);
      testResults.matchmaking.createMatch = false;
    } else {
      console.log(`   ✅ Match created: ${matchData.match_number}`);
      testResults.matchmaking.createMatch = true;
      
      // Test 2: Record match interaction
      console.log('   Testing match interaction...');
      const testInteraction = {
        match_id: matchData.id,
        user_id: '00000000-0000-0000-0000-000000000001',
        interaction_type: 'viewed'
      };
      
      const { data: interactionData, error: interactionError } = await supabase
        .from('match_interactions')
        .insert(testInteraction)
        .select()
        .single();
      
      if (interactionError) {
        console.log(`   ❌ Interaction tracking failed: ${interactionError.message}`);
        testResults.matchmaking.trackInteraction = false;
      } else {
        console.log(`   ✅ Interaction tracked: ${interactionData.interaction_type}`);
        testResults.matchmaking.trackInteraction = true;
      }
      
      // Cleanup
      await supabase.from('matches').delete().eq('id', matchData.id);
    }
    
  } catch (error) {
    console.log(`   ❌ Matchmaking service error: ${error.message}`);
    testResults.matchmaking.error = error.message;
  }
}

async function testCMSService() {
  console.log('\n📝 Testing CMS Service...');
  
  try {
    // Test 1: Create a content category
    const testCategory = {
      name: 'Test Category',
      slug: 'test-category-' + Date.now(),
      content_type: 'blog',
      description: 'Test category for service validation'
    };
    
    console.log('   Testing category creation...');
    const { data: categoryData, error: categoryError } = await supabase
      .from('cms_categories')
      .insert(testCategory)
      .select()
      .single();
    
    if (categoryError) {
      console.log(`   ❌ Category creation failed: ${categoryError.message}`);
      testResults.cms.createCategory = false;
    } else {
      console.log(`   ✅ Category created: ${categoryData.name}`);
      testResults.cms.createCategory = true;
      
      // Test 2: Create content
      console.log('   Testing content creation...');
      const testContent = {
        title: 'Test Blog Post',
        slug: 'test-blog-post-' + Date.now(),
        content_type: 'blog',
        content: 'This is a test blog post for service validation.',
        excerpt: 'Test excerpt',
        author_id: '00000000-0000-0000-0000-000000000001',
        category_id: categoryData.id,
        status: 'draft'
      };
      
      const { data: contentData, error: contentError } = await supabase
        .from('cms_content')
        .insert(testContent)
        .select()
        .single();
      
      if (contentError) {
        console.log(`   ❌ Content creation failed: ${contentError.message}`);
        testResults.cms.createContent = false;
      } else {
        console.log(`   ✅ Content created: ${contentData.title}`);
        testResults.cms.createContent = true;
      }
      
      // Cleanup
      await supabase.from('cms_categories').delete().eq('id', categoryData.id);
    }
    
  } catch (error) {
    console.log(`   ❌ CMS service error: ${error.message}`);
    testResults.cms.error = error.message;
  }
}

async function generateServiceReport() {
  console.log('\n📈 Service Integration Test Report');
  console.log('==================================');
  
  const services = Object.keys(testResults);
  let totalTests = 0;
  let passedTests = 0;
  
  for (const service of services) {
    const serviceResults = testResults[service];
    const serviceTests = Object.keys(serviceResults).filter(key => key !== 'error');
    const servicePassed = serviceTests.filter(test => serviceResults[test] === true);
    
    totalTests += serviceTests.length;
    passedTests += servicePassed.length;
    
    console.log(`\n📊 ${service}:`);
    console.log(`   Tests: ${servicePassed.length}/${serviceTests.length} passed`);
    
    if (serviceResults.error) {
      console.log(`   ❌ Error: ${serviceResults.error}`);
    }
    
    for (const test of serviceTests) {
      const status = serviceResults[test] ? '✅' : '❌';
      console.log(`   ${status} ${test}`);
    }
  }
  
  const successRate = totalTests > 0 ? (passedTests / totalTests * 100).toFixed(1) : 0;
  
  console.log(`\n🎯 Overall Service Health: ${successRate}%`);
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  
  if (successRate >= 80) {
    console.log('🟢 Services are in excellent condition');
  } else if (successRate >= 60) {
    console.log('🟡 Services need some attention');
  } else {
    console.log('🔴 Services require significant work');
  }
  
  return successRate >= 60;
}

async function main() {
  console.log('🧪 Phase 2: Service Integration Testing');
  console.log('=======================================');
  
  try {
    await testDealManagementService();
    await testPaymentService();
    await testMarketplaceService();
    await testMatchmakingService();
    await testCMSService();
    
    const success = await generateServiceReport();
    
    if (success) {
      console.log('\n✅ Service integration testing completed successfully');
    } else {
      console.log('\n⚠️  Service integration testing completed with issues');
    }
    
  } catch (error) {
    console.error('❌ Service testing failed:', error.message);
    process.exit(1);
  }
}

main();
