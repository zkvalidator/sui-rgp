require('dotenv').config();
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch').default;
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// Check required environment variables
if (!process.env.CMC_API_KEY || !process.env.SUI_PATH) {
    console.error('Error: Required environment variables are missing.');
    console.error('Please ensure CMC_API_KEY and SUI_PATH are set in .env file');
    process.exit(1);
}

const API_URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=${process.env.CMC_API_KEY}&symbol=SUI`;

// Function to read reference values
function readReferenceValues() {
    const filePath = path.join(__dirname, 'reference.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
}

// Function to get current SUI price from CoinMarketCap
async function getCurrentSuiPrice() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.status.error_code !== 0) {
            throw new Error(`API Error: ${data.status.error_message}`);
        }
        
        const price = data.data.SUI.quote.USD.price;
        return Number(price.toFixed(4)); // Round to 4 decimals
    } catch (error) {
        console.error('Error fetching SUI price:', error);
        throw error;
    }
}

// Function to calculate new mist value based on price change
function calculateNewMist(currentPrice, referencePrice, referenceMist) {
    const priceRatio = referencePrice / currentPrice;
    const calculatedMist = Math.round(referenceMist * priceRatio);
    return Math.min(calculatedMist, 1000); // Cap at 1000
}

// Function to update validator gas price
async function updateValidatorGasPrice(mistValue) {
    try {
        const command = `${process.env.SUI_PATH}/sui validator update-gas-price ${mistValue}`;
        console.log(`Executing command: ${command}`);
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            console.error('Command stderr:', stderr);
        }
        console.log('Command output:', stdout);
        return true;
    } catch (error) {
        console.error('Error updating validator gas price:', error);
        return false;
    }
}

// Main function to process price updates
async function processPriceUpdate() {
    try {
        // Read reference values
        const referenceData = readReferenceValues();
        
        // Get current SUI price from API
        const currentPrice = await getCurrentSuiPrice();
        
        // Calculate new mist value
        const newMist = calculateNewMist(
            currentPrice,
            referenceData.sui_price,
            referenceData.mist
        );
        
        // Calculate percentage change
        const priceChangePercent = ((currentPrice - referenceData.sui_price) / referenceData.sui_price * 100).toFixed(2);
        const mistChangePercent = ((newMist - referenceData.mist) / referenceData.mist * 100).toFixed(2);
        
        // Log results
        console.log('\n=== Price Update ===');
        console.log(`Timestamp: ${new Date().toLocaleTimeString()}`);
        console.log(`Current SUI Price: $${currentPrice} (${priceChangePercent}% change)`);
        console.log(`Reference Price: $${referenceData.sui_price}`);
        console.log(`New Mist Value: ${newMist} (${mistChangePercent}% change)`);
        console.log(`Reference Mist: ${referenceData.mist}`);
        console.log('=================\n');

        // Update validator gas price
        console.log('Updating validator gas price...');
        const updated = await updateValidatorGasPrice(newMist);
        if (updated) {
            console.log('Successfully updated validator gas price');
        } else {
            console.log('Failed to update validator gas price');
        }
    } catch (error) {
        console.error('Error processing price update:', error);
    }
}

// Start the cron job to run every 6 hours
console.log('Starting SUI price monitoring...');
console.log('Reference values:', readReferenceValues());
console.log('Will check price every 6 hours (at 00:00, 06:00, 12:00, 18:00 UTC)');
console.log('----------------------------------------\n');

// Schedule the job to run every 6 hours
const job = cron.schedule('0 */6 * * *', processPriceUpdate);

// Run first update immediately
processPriceUpdate();

// Cleanup on SIGINT
process.on('SIGINT', () => {
    job.stop();
    console.log('\nScript stopped by user');
    process.exit(0);
});
