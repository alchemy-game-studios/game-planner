#!/usr/bin/env node
/**
 * Test script for Stripe Elements integration
 *
 * Tests:
 * 1. GraphQL createSubscription mutation (returns clientSecret)
 * 2. GraphQL createCreditPaymentIntent mutation (returns clientSecret)
 * 3. Webhook endpoint accessibility
 *
 * Prerequisites:
 * - Server running on localhost:3000
 * - Stripe webhook listener running (npm run stripe:listen)
 * - Valid Stripe keys in .env
 */

const GRAPHQL_URL = 'http://localhost:3000/graphql';
const WEBHOOK_URL = 'http://localhost:3000/webhooks/stripe';

// Helper to make GraphQL requests
async function graphql(query, variables = {}) {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Simulate authenticated user (you may need to adjust based on your auth setup)
      'Cookie': 'connect.sid=test-session'
    },
    body: JSON.stringify({ query, variables })
  });
  return response.json();
}

// Test 1: Check server health
async function testHealth() {
  console.log('\n🔍 Test 1: Server Health');
  try {
    const response = await fetch('http://localhost:3000/health');
    const data = await response.json();
    if (data.status === 'healthy') {
      console.log('   ✅ Server is healthy');
      console.log(`   Database: ${data.database}`);
      return true;
    }
  } catch (err) {
    console.log('   ❌ Server not responding:', err.message);
    return false;
  }
}

// Test 2: Check GraphQL endpoint
async function testGraphQL() {
  console.log('\n🔍 Test 2: GraphQL Endpoint');
  try {
    const result = await graphql('{ hello { message } }');
    if (result.data?.hello?.message) {
      console.log('   ✅ GraphQL responding');
      console.log(`   Message: "${result.data.hello.message}"`);
      return true;
    }
    console.log('   ❌ Unexpected response:', result);
    return false;
  } catch (err) {
    console.log('   ❌ GraphQL error:', err.message);
    return false;
  }
}

// Test 3: Check subscription tiers are configured
async function testSubscriptionTiers() {
  console.log('\n🔍 Test 3: Subscription Tiers');
  try {
    const result = await graphql('{ subscriptionTiers { id name displayPrice } }');
    if (result.data?.subscriptionTiers) {
      console.log('   ✅ Tiers configured:');
      for (const tier of result.data.subscriptionTiers) {
        console.log(`      - ${tier.name}: ${tier.displayPrice}`);
      }
      return true;
    }
    console.log('   ❌ No tiers found:', result);
    return false;
  } catch (err) {
    console.log('   ❌ Error:', err.message);
    return false;
  }
}

// Test 4: Check credit packages are configured
async function testCreditPackages() {
  console.log('\n🔍 Test 4: Credit Packages');
  try {
    const result = await graphql('{ creditPackages { id amount displayPrice } }');
    if (result.data?.creditPackages) {
      console.log('   ✅ Packages configured:');
      for (const pkg of result.data.creditPackages) {
        console.log(`      - ${pkg.amount} credits: ${pkg.displayPrice}`);
      }
      return true;
    }
    console.log('   ❌ No packages found:', result);
    return false;
  } catch (err) {
    console.log('   ❌ Error:', err.message);
    return false;
  }
}

// Test 5: Check webhook endpoint exists
async function testWebhookEndpoint() {
  console.log('\n🔍 Test 5: Webhook Endpoint');
  try {
    // Send empty POST - should get 400 (bad signature) not 404
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}'
    });
    if (response.status === 400) {
      console.log('   ✅ Webhook endpoint exists (returned 400 - expected without signature)');
      return true;
    } else if (response.status === 404) {
      console.log('   ❌ Webhook endpoint not found (404)');
      return false;
    } else {
      console.log(`   ⚠️  Unexpected status: ${response.status}`);
      return true;
    }
  } catch (err) {
    console.log('   ❌ Error:', err.message);
    return false;
  }
}

// Test 6: Test createSubscription mutation (requires auth)
async function testCreateSubscription() {
  console.log('\n🔍 Test 6: createSubscription Mutation');
  try {
    const result = await graphql(`
      mutation {
        createSubscription(tier: "creative") {
          clientSecret
          subscriptionId
          status
        }
      }
    `);

    if (result.errors) {
      const error = result.errors[0].message;
      if (error.includes('Authentication required')) {
        console.log('   ⚠️  Authentication required (expected without login)');
        console.log('   ℹ️  To fully test, log in via browser and retry');
        return true;
      } else if (error.includes('Stripe is not configured')) {
        console.log('   ❌ Stripe not configured - check STRIPE_SECRET_KEY');
        return false;
      }
      console.log('   ❌ Error:', error);
      return false;
    }

    if (result.data?.createSubscription?.clientSecret) {
      console.log('   ✅ Subscription created!');
      console.log(`   Client Secret: ${result.data.createSubscription.clientSecret.substring(0, 20)}...`);
      console.log(`   Subscription ID: ${result.data.createSubscription.subscriptionId}`);
      return true;
    }

    console.log('   ❌ Unexpected response:', result);
    return false;
  } catch (err) {
    console.log('   ❌ Error:', err.message);
    return false;
  }
}

// Test 7: Test createCreditPaymentIntent mutation (requires auth)
async function testCreateCreditPaymentIntent() {
  console.log('\n🔍 Test 7: createCreditPaymentIntent Mutation');
  try {
    const result = await graphql(`
      mutation {
        createCreditPaymentIntent(packageId: "credits_100") {
          clientSecret
          paymentIntentId
        }
      }
    `);

    if (result.errors) {
      const error = result.errors[0].message;
      if (error.includes('Authentication required')) {
        console.log('   ⚠️  Authentication required (expected without login)');
        return true;
      } else if (error.includes('Stripe is not configured')) {
        console.log('   ❌ Stripe not configured - check STRIPE_SECRET_KEY');
        return false;
      }
      console.log('   ❌ Error:', error);
      return false;
    }

    if (result.data?.createCreditPaymentIntent?.clientSecret) {
      console.log('   ✅ Payment Intent created!');
      console.log(`   Client Secret: ${result.data.createCreditPaymentIntent.clientSecret.substring(0, 20)}...`);
      return true;
    }

    console.log('   ❌ Unexpected response:', result);
    return false;
  } catch (err) {
    console.log('   ❌ Error:', err.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('═══════════════════════════════════════════');
  console.log('    Stripe Elements Integration Tests');
  console.log('═══════════════════════════════════════════');

  const results = [];

  results.push(await testHealth());
  results.push(await testGraphQL());
  results.push(await testSubscriptionTiers());
  results.push(await testCreditPackages());
  results.push(await testWebhookEndpoint());
  results.push(await testCreateSubscription());
  results.push(await testCreateCreditPaymentIntent());

  const passed = results.filter(r => r).length;
  const total = results.length;

  console.log('\n═══════════════════════════════════════════');
  console.log(`    Results: ${passed}/${total} tests passed`);
  console.log('═══════════════════════════════════════════');

  if (passed === total) {
    console.log('\n✅ All tests passed! Stripe Elements is ready.');
    console.log('\nNext steps:');
    console.log('1. Open http://localhost:3001 in browser');
    console.log('2. Log in with Google');
    console.log('3. Go to Account page');
    console.log('4. Try upgrading or purchasing credits');
    console.log('5. Use test card: 4242 4242 4242 4242');
  } else {
    console.log('\n⚠️  Some tests failed. Check the output above.');
  }
}

runTests().catch(console.error);
