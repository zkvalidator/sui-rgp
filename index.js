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

const CMC_API_URL = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?CMC_PRO_API_KEY=${process.env.CMC_API_KEY}&symbol=SUI`;
const SUI_RPC_URL = process.env.SUI_RPC_URL || 'https://fullnode.mainnet.sui.io/';

// Function to read reference values
function readReferenceValues() {
    const filePath = path.join(__dirname, 'reference.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return data;
}

// Function to get current SUI price from CoinMarketCap
async function getCurrentSuiPrice() {
    try {
        const response = await fetch(CMC_API_URL);
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

// Function to get epoch information
async function getEpochInfo() {
    try {
        const response = await fetch(SUI_RPC_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'suix_getLatestSuiSystemState',
                params: []
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data.result) {
            throw new Error('No system state data received');
        }

        const systemState = data.result;
        const currentEpoch = parseInt(systemState.epoch);
        const epochStartTimestampMs = parseInt(systemState.epochStartTimestampMs);
        const epochDurationMs = parseInt(systemState.epochDurationMs);
        
        const now = Date.now();
        const epochEndTimestamp = epochStartTimestampMs + epochDurationMs;
        const remainingMs = epochEndTimestamp - now;

        return {
            currentEpoch,
            remainingMs,
            epochEndTimestamp,
            epochStartTimestampMs,
            epochDurationMs
        };
    } catch (error) {
        console.error('Error fetching epoch information:', error);
        throw error;
    }
}

// Main function to process updates
async function processUpdates() {
    try {
        // Get epoch information first
        const epochInfo = await getEpochInfo();
        
        // Convert remaining time to hours, minutes, seconds
        const remainingHours = Math.floor(epochInfo.remainingMs / (1000 * 60 * 60));
        const remainingMinutes = Math.floor((epochInfo.remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        const remainingSeconds = Math.floor((epochInfo.remainingMs % (1000 * 60)) / 1000);

        // Display epoch information
        console.log('\n=== Sui Epoch Information ===');
        console.log(`Current Epoch: ${epochInfo.currentEpoch}`);
        console.log(`Time Remaining: ${remainingHours} hours, ${remainingMinutes} minutes, ${remainingSeconds} seconds`);
        console.log('=========================\n');

        // Process price update and execute command if less than 1 hour remains
        if (epochInfo.remainingMs < 60 * 60 * 1000) {
            try {
                // Read reference values
                const referenceData = readReferenceValues();
                
                // Get current SUI price
                const currentPrice = await getCurrentSuiPrice();
                
                // Calculate new mist value
                const newMist = calculateNewMist(
                    currentPrice,
                    referenceData.sui_price,
                    referenceData.mist
                );
                
                // Calculate percentage changes
                const priceChangePercent = ((currentPrice - referenceData.sui_price) / referenceData.sui_price * 100).toFixed(2);
                const mistChangePercent = ((newMist - referenceData.mist) / referenceData.mist * 100).toFixed(2);
                
                // Log price update information
                console.log('=== Price Update ===');
                console.log(`Current SUI Price: $${currentPrice} (${priceChangePercent}% change)`);
                console.log(`Reference Price: $${referenceData.sui_price}`);
                console.log(`New Mist Value: ${newMist} (${mistChangePercent}% change)`);
                console.log(`Reference Mist: ${referenceData.mist}`);
                console.log('=========================\n');

                // Execute validator update command
                console.log('Updating validator gas price...');
                const updated = await updateValidatorGasPrice(newMist);
                if (updated) {
                    console.log('Successfully updated validator gas price');
                } else {
                    console.log('Failed to update validator gas price');
                }
            } catch (priceError) {
                console.error('Error processing price update:', priceError);
            }
        }
    } catch (error) {
        console.error('Error in process updates:', error);
    }
}

// Start the monitoring
console.log('Starting SUI monitoring (checking every hour)...');
console.log('Reference values:', readReferenceValues());
console.log('----------------------------------------\n');

// Schedule the job to run every hour (at minute 0)
const job = cron.schedule('0 * * * *', processUpdates);

// Run first update immediately
processUpdates();

// Cleanup on SIGINT
process.on('SIGINT', () => {
    job.stop();
    console.log('\nScript stopped by user');
    process.exit(0);
});
