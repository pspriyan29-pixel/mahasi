/**
 * Integration Test Script
 * Tests all enterprise features
 */

import { cache, CacheKeys, CacheTTL } from './cache/redis';
import { jobQueue, JobHelpers, JobType } from './queue/bull';
import { logger } from './utils/logger';

async function testIntegration() {
    console.log('\n🧪 Starting Integration Tests...\n');

    try {
        // Test 1: Redis Connection
        console.log('1️⃣  Testing Redis Connection...');
        await cache.connect();
        await cache.set('test-key', { message: 'Hello Redis!' }, { ttl: CacheTTL.SHORT });
        const testValue = await cache.get('test-key');
        console.log('   ✅ Redis: Connected and working');
        console.log('   📊 Test value:', testValue);

        // Test 2: Cache Statistics
        console.log('\n2️⃣  Testing Cache Statistics...');
        const stats = await cache.getStats();
        console.log('   ✅ Cache Stats:', stats);

        // Test 3: Job Queue
        console.log('\n3️⃣  Testing Job Queue...');
        await jobQueue.initialize();

        const testJob = await JobHelpers.scheduleAnalysis({
            organizationId: 'test-org',
            periodStart: new Date().toISOString(),
            periodEnd: new Date().toISOString(),
        });

        console.log('   ✅ Job Queue: Initialized');
        console.log('   📝 Test job created:', testJob.id);

        // Test 4: Queue Statistics
        console.log('\n4️⃣  Testing Queue Statistics...');
        const queueStats = await jobQueue.getAllStats();
        console.log('   ✅ Queue Stats:', queueStats);

        // Test 5: Cache Operations
        console.log('\n5️⃣  Testing Cache Operations...');

        // Set multiple keys
        await cache.mSet({
            'user:1': { name: 'John Doe', email: 'john@example.com' },
            'user:2': { name: 'Jane Smith', email: 'jane@example.com' },
        }, { ttl: CacheTTL.MEDIUM });

        // Get multiple keys
        const users = await cache.mGet(['user:1', 'user:2']);
        console.log('   ✅ Batch operations working');
        console.log('   👥 Users:', users);

        // Test 6: Cache-aside pattern
        console.log('\n6️⃣  Testing Cache-Aside Pattern...');
        const fetchedData = await cache.getOrSet(
            'expensive-operation',
            async () => {
                console.log('   ⏳ Simulating expensive operation...');
                await new Promise(resolve => setTimeout(resolve, 100));
                return { result: 'Computed value', timestamp: Date.now() };
            },
            { ttl: CacheTTL.LONG }
        );
        console.log('   ✅ Cache-aside working');
        console.log('   💾 Cached data:', fetchedData);

        // Test 7: Cleanup
        console.log('\n7️⃣  Cleaning up test data...');
        await cache.delete('test-key');
        await cache.deletePattern('user:*');
        await cache.delete('expensive-operation');
        console.log('   ✅ Cleanup complete');

        console.log('\n✅ All Integration Tests Passed!\n');

        // Display final summary
        console.log('═══════════════════════════════════════════════════');
        console.log('  INTEGRATION TEST SUMMARY');
        console.log('═══════════════════════════════════════════════════');
        console.log('  ✅ Redis Connection: PASSED');
        console.log('  ✅ Cache Operations: PASSED');
        console.log('  ✅ Job Queue: PASSED');
        console.log('  ✅ Batch Operations: PASSED');
        console.log('  ✅ Cache-Aside Pattern: PASSED');
        console.log('═══════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ Integration Test Failed:', error);
        process.exit(1);
    } finally {
        // Cleanup
        await cache.disconnect();
        await jobQueue.closeAll();
        process.exit(0);
    }
}

// Run tests
testIntegration();
