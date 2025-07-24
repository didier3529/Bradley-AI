const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * Script to download verified meme token logos for local hosting
 * Part of the Meme Coin Logo Loading Resolution PRD implementation
 */

// Create the output directory if it doesn't exist
const outputDir = path.join(__dirname, '..', 'public', 'meme-logos');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created directory: ${outputDir}`);
}

// Verified meme token logo URLs from our database
const memeTokenLogos = {
  'bonk': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263/logo.png',
  'wen': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/WENWENvqqNya429ubCdR81ZmD69brwQaaBYY6p3LCpk/logo.png',
  'popcat': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr/logo.png',
  'mew': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5/logo.png',
  'myro': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/HhJpBhRRn4g56VsyLuT8DL5Bv31HkXqsrahTTUCZeZg4/logo.png',
  'pnut': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/A8C3xuqscfmyLrte3VmTqrAq8kgMASius9AFNANwpump/logo.png',
  'michi': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzPJBY/logo.png',
  'bome': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82/logo.png',

  // Backup URLs for popular meme tokens
  'shib': 'https://assets.coingecko.com/coins/images/11939/large/shiba.png',
  'doge': 'https://assets.coingecko.com/coins/images/5/large/dogecoin.png'
};

/**
 * Downloads a file from a URL to a local path with error handling
 */
async function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outputDir, filename);
    const file = fs.createWriteStream(filePath);

    console.log(`Downloading ${filename} from ${url}...`);

    const request = https.get(url, response => {
      // Handle redirects
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        console.log(`Redirecting to: ${redirectUrl}`);

        https.get(redirectUrl, redirectResponse => {
          if (redirectResponse.statusCode !== 200) {
            reject(new Error(`Failed to download ${url}: HTTP status ${redirectResponse.statusCode}`));
            return;
          }

          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`✅ Downloaded: ${filename}`);
            resolve();
          });
        }).on('error', err => {
          fs.unlink(filePath, () => {}); // Clean up failed download
          reject(err);
        });

        return;
      }

      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: HTTP status ${response.statusCode}`));
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(filePath, () => {}); // Clean up failed download
      reject(err);
    });

    // Set timeout for downloads
    request.setTimeout(30000, () => {
      request.destroy();
      reject(new Error(`Download timeout for ${url}`));
    });
  });
}

/**
 * Download all meme token logos with retry logic
 */
async function downloadAllLogos() {
  console.log('🚀 Starting meme token logo download...');
  console.log(`Output directory: ${outputDir}`);

  const tokens = Object.keys(memeTokenLogos);
  let successCount = 0;
  let failureCount = 0;

  for (const token of tokens) {
    const url = memeTokenLogos[token];
    const filename = `${token}.png`;

    try {
      await downloadFile(url, filename);
      successCount++;

      // Add a small delay between downloads to be respectful
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(`❌ Failed to download ${token}:`, error.message);
      failureCount++;

      // Try backup strategy for critical tokens
      await tryBackupDownload(token);
    }
  }

  console.log('\n📊 Download Summary:');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`📁 Total files: ${tokens.length}`);

  if (successCount > 0) {
    console.log('\n🎉 Meme token logos are now available for local hosting!');
    console.log('Files saved to: public/meme-logos/');
  }
}

/**
 * Try backup download strategies for failed tokens
 */
async function tryBackupDownload(token) {
  const backupUrls = {
    'bonk': 'https://ucarecdn.com/8cc0746e-3c5d-4b2b-8c1c-5c0c9b0b3b3b/bonk.png',
    'wen': 'https://assets.coingecko.com/coins/images/34045/large/wen.png',
    'popcat': 'https://assets.coingecko.com/coins/images/30955/large/popcat.png',
    'mew': 'https://assets.coingecko.com/coins/images/34478/large/mew.png',
    'myro': 'https://assets.coingecko.com/coins/images/32658/large/myro.png',
    'pnut': 'https://assets.coingecko.com/coins/images/33557/large/pnut.png',
    'michi': 'https://assets.coingecko.com/coins/images/35249/large/michi.png',
    'bome': 'https://assets.coingecko.com/coins/images/33547/large/bome.png'
  };

  const backupUrl = backupUrls[token];
  if (backupUrl) {
    console.log(`🔄 Trying backup URL for ${token}...`);
    try {
      await downloadFile(backupUrl, `${token}.png`);
    } catch (error) {
      console.error(`❌ Backup download also failed for ${token}:`, error.message);
    }
  }
}

/**
 * Create a placeholder logo for tokens that fail to download
 */
function createPlaceholderLogo(token) {
  const placeholderSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
    <radialGradient id="grad" cx="50%" cy="30%" r="70%">
      <stop offset="0%" style="stop-color:#00ff41;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#000000;stop-opacity:1" />
    </radialGradient>
  </defs>
  <circle cx="128" cy="128" r="120" fill="url(#grad)" stroke="#00ff41" stroke-width="3"/>
  <text x="128" y="140" text-anchor="middle" fill="white" font-family="monospace" font-size="48" font-weight="bold">${token.charAt(0).toUpperCase()}</text>
  <circle cx="128" cy="128" r="120" fill="none" stroke="#00ff41" stroke-width="3" opacity="0.3"/>
</svg>`;

  const placeholderPath = path.join(outputDir, `${token}.svg`);
  fs.writeFileSync(placeholderPath, placeholderSvg);
  console.log(`📝 Created placeholder logo for ${token}`);
}

/**
 * Validate downloaded images
 */
function validateDownloads() {
  console.log('\n🔍 Validating downloaded files...');

  const tokens = Object.keys(memeTokenLogos);
  let validCount = 0;

  for (const token of tokens) {
    const filePath = path.join(outputDir, `${token}.png`);

    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        console.log(`✅ ${token}.png - ${Math.round(stats.size / 1024)}KB`);
        validCount++;
      } else {
        console.log(`⚠️  ${token}.png - File is empty`);
        fs.unlinkSync(filePath); // Remove empty file
        createPlaceholderLogo(token); // Create placeholder
      }
    } else {
      console.log(`❌ ${token}.png - Missing`);
      createPlaceholderLogo(token); // Create placeholder
    }
  }

  console.log(`\n📈 Validation Summary: ${validCount}/${tokens.length} files valid`);
}

// Main execution
if (require.main === module) {
  downloadAllLogos()
    .then(() => validateDownloads())
    .catch(error => {
      console.error('💥 Download script failed:', error);
      process.exit(1);
    });
}

module.exports = { downloadAllLogos, validateDownloads };
