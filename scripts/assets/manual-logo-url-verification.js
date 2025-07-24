#!/usr/bin/env node

/**
 * MANUAL LOGO URL VERIFICATION SCRIPT
 *
 * Purpose: Command-line testing of all token logo URLs
 * Usage: node scripts/manual-logo-url-verification.js [token_symbol]
 *
 * This script directly tests URL accessibility outside the browser environment
 * to isolate network issues from CORS/browser security restrictions
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Import the meme token database
const memeTokensPath = path.join(__dirname, '../src/lib/data/meme-token-logos.ts');
let memeTokenDatabase = null;

// Simple regex to extract token data from TypeScript file
function extractMemeTokens(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Extract the export const memeTokenLogos declaration
    const match = content.match(/export const memeTokenLogos[^{]*{([^}]+)}/s);
    if (!match) {
      console.error('❌ Could not parse meme token database structure');
      return null;
    }

    // Parse token entries (simplified parser)
    const tokensContent = match[1];
    const tokenEntries = [];

    // Look for symbol: { ... } patterns
    const tokenRegex = /(\w+):\s*{([^}]+)}/g;
    let tokenMatch;

    while ((tokenMatch = tokenRegex.exec(tokensContent)) !== null) {
      const symbol = tokenMatch[1];
      const props = tokenMatch[2];

      // Extract properties
      const logoURIMatch = props.match(/logoURI:\s*['"`]([^'"`]+)['"`]/);
      const addressMatch = props.match(/address:\s*['"`]([^'"`]+)['"`]/);
      const localPathMatch = props.match(/localPath:\s*['"`]([^'"`]+)['"`]/);
      const logoBackupMatch = props.match(/logoBackup:\s*['"`]([^'"`]+)['"`]/);

      tokenEntries.push({
        symbol,
        address: addressMatch ? addressMatch[1] : null,
        logoURI: logoURIMatch ? logoURIMatch[1] : null,
        localPath: localPathMatch ? localPathMatch[1] : null,
        logoBackup: logoBackupMatch ? logoBackupMatch[1] : null
      });
    }

    return tokenEntries;

  } catch (error) {
    console.error('❌ Error reading meme token database:', error.message);
    return null;
  }
}

// Test URL accessibility
function testUrl(url, timeout = 10000) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https:') ? https : http;

    console.log(`  🔍 Testing: ${url}`);

    const request = protocol.request(url, { method: 'HEAD' }, (response) => {
      const duration = Date.now() - startTime;
      const success = response.statusCode >= 200 && response.statusCode < 300;

      resolve({
        url,
        status: response.statusCode,
        success,
        duration,
        headers: {
          'content-type': response.headers['content-type'],
          'content-length': response.headers['content-length'],
          'access-control-allow-origin': response.headers['access-control-allow-origin']
        }
      });
    });

    request.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        url,
        status: null,
        success: false,
        duration,
        error: error.message
      });
    });

    request.setTimeout(timeout, () => {
      request.destroy();
      resolve({
        url,
        status: null,
        success: false,
        duration: timeout,
        error: 'Request timeout'
      });
    });

    request.end();
  });
}

// Test local file existence
function testLocalFile(filePath) {
  const fullPath = path.join(__dirname, '..', 'public', filePath.startsWith('/') ? filePath.slice(1) : filePath);

  try {
    const stats = fs.statSync(fullPath);
    return {
      path: filePath,
      exists: true,
      size: stats.size,
      fullPath
    };
  } catch (error) {
    return {
      path: filePath,
      exists: false,
      error: error.message,
      fullPath
    };
  }
}

// Main verification function
async function verifyToken(tokenData) {
  console.log(`\n🔍 VERIFYING: ${tokenData.symbol}`);
  console.log(`   Address: ${tokenData.address || 'N/A'}`);

  const results = {
    symbol: tokenData.symbol,
    address: tokenData.address,
    tests: [],
    summary: {
      total: 0,
      successful: 0,
      failed: 0
    }
  };

  // Test primary logo URL
  if (tokenData.logoURI) {
    console.log(`\n  📋 Primary Logo URL:`);
    const result = await testUrl(tokenData.logoURI);
    results.tests.push({ type: 'primary', ...result });

    if (result.success) {
      console.log(`    ✅ SUCCESS (${result.status}) - ${result.duration}ms`);
      if (result.headers['content-type']) {
        console.log(`       Content-Type: ${result.headers['content-type']}`);
      }
      if (result.headers['access-control-allow-origin']) {
        console.log(`       CORS: ${result.headers['access-control-allow-origin']}`);
      }
    } else {
      console.log(`    ❌ FAILED (${result.status || 'N/A'}) - ${result.error || 'Unknown error'}`);
    }
  }

  // Test backup logo URL
  if (tokenData.logoBackup) {
    console.log(`\n  📋 Backup Logo URL:`);
    const result = await testUrl(tokenData.logoBackup);
    results.tests.push({ type: 'backup', ...result });

    if (result.success) {
      console.log(`    ✅ SUCCESS (${result.status}) - ${result.duration}ms`);
    } else {
      console.log(`    ❌ FAILED (${result.status || 'N/A'}) - ${result.error || 'Unknown error'}`);
    }
  }

  // Test local file
  if (tokenData.localPath) {
    console.log(`\n  📋 Local File:`);
    const result = testLocalFile(tokenData.localPath);
    results.tests.push({ type: 'local', ...result });

    if (result.exists) {
      console.log(`    ✅ EXISTS - ${result.size} bytes`);
      console.log(`       Path: ${result.fullPath}`);
    } else {
      console.log(`    ❌ NOT FOUND - ${result.error}`);
      console.log(`       Expected: ${result.fullPath}`);
    }
  }

  // Calculate summary
  results.summary.total = results.tests.length;
  results.summary.successful = results.tests.filter(t => t.success || t.exists).length;
  results.summary.failed = results.summary.total - results.summary.successful;

  console.log(`\n  📊 SUMMARY: ${results.summary.successful}/${results.summary.total} successful`);

  return results;
}

// Main execution
async function main() {
  const targetToken = process.argv[2];

  console.log('🚀 MANUAL LOGO URL VERIFICATION SCRIPT');
  console.log('=====================================');

  // Load meme token database
  console.log('\n📂 Loading meme token database...');
  memeTokenDatabase = extractMemeTokens(memeTokensPath);

  if (!memeTokenDatabase) {
    console.log('❌ Failed to load token database');
    process.exit(1);
  }

  console.log(`✅ Loaded ${memeTokenDatabase.length} tokens from database`);

  if (targetToken) {
    // Test specific token
    const token = memeTokenDatabase.find(t =>
      t.symbol.toLowerCase() === targetToken.toLowerCase()
    );

    if (!token) {
      console.log(`❌ Token "${targetToken}" not found in database`);
      console.log('Available tokens:', memeTokenDatabase.map(t => t.symbol).join(', '));
      process.exit(1);
    }

    const result = await verifyToken(token);

    // Final summary
    console.log('\n' + '='.repeat(50));
    console.log(`FINAL RESULT FOR ${token.symbol}:`);
    console.log(`${result.summary.successful}/${result.summary.total} tests passed`);

    if (result.summary.failed > 0) {
      console.log('\n❌ FAILURES DETECTED - Logo display will likely fail');
      process.exit(1);
    } else {
      console.log('\n✅ ALL TESTS PASSED - Logo should display correctly');
    }

  } else {
    // Test all tokens (or first 10 for quick verification)
    console.log('\n🔍 Testing all tokens (showing first 10)...');

    const tokensToTest = memeTokenDatabase.slice(0, 10);
    const allResults = [];

    for (const token of tokensToTest) {
      const result = await verifyToken(token);
      allResults.push(result);

      // Small delay to avoid overwhelming servers
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // Overall summary
    const totalTests = allResults.reduce((sum, r) => sum + r.summary.total, 0);
    const totalSuccessful = allResults.reduce((sum, r) => sum + r.summary.successful, 0);
    const totalFailed = totalTests - totalSuccessful;

    console.log('\n' + '='.repeat(50));
    console.log('OVERALL SUMMARY:');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Successful: ${totalSuccessful}`);
    console.log(`Failed: ${totalFailed}`);
    console.log(`Success Rate: ${Math.round((totalSuccessful / totalTests) * 100)}%`);

    // Show tokens with failures
    const tokensWithFailures = allResults.filter(r => r.summary.failed > 0);
    if (tokensWithFailures.length > 0) {
      console.log('\n❌ TOKENS WITH FAILURES:');
      tokensWithFailures.forEach(result => {
        console.log(`  - ${result.symbol}: ${result.summary.failed} failures`);
      });
    }

    console.log('\n💡 To test a specific token: node scripts/manual-logo-url-verification.js SYMBOL');
  }
}

// Run the script
main().catch(error => {
  console.error('💥 Script failed:', error);
  process.exit(1);
});
