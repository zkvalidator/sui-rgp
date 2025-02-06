# Sui Gas Price Updater

A Node.js script that monitors Sui network epochs and automatically updates validator gas price based on SUI token price changes.

## Features

- Monitors Sui network epoch status every hour
- Fetches current SUI price from CoinMarketCap
- Calculates optimal mist value based on price changes
- Automatically executes validator gas price updates when epoch is ending (< 1 hour remaining)
- Provides detailed logging of epoch status and price calculations

## Prerequisites

1. **Node.js Installation**
   - Download and install Node.js from [official website](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version  # Should be v14.0.0 or higher
     npm --version
     ```

2. **CoinMarketCap API Key**
   - Sign up at [CoinMarketCap](https://pro.coinmarketcap.com/signup)
   - Choose "Basic" plan (Free basic access for personal use)
   - After signing up, get your API key from the dashboard

3. **Sui CLI**
   - Ensure Sui CLI is installed and accessible
   - Verify installation: `sui --version`

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/yourusername/sui-gas-price.git
   cd sui-gas-price
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a .env file with the following:
   ```
   CMC_API_KEY=your_coinmarketcap_api_key
   SUI_PATH=/usr/local/bin
   SUI_RPC_URL=https://fullnode.mainnet.sui.io/
   ```
   Replace values with your actual configuration:
   - CMC_API_KEY: Your CoinMarketCap API key
   - SUI_PATH: Path to the directory containing the sui binary
   - SUI_RPC_URL: Sui RPC endpoint (default provided)

4. **Configure Reference Values**
   Update reference.json with your baseline values:
   ```json
   {
     "sui_price": 1,
     "mist": 750
   }
   ```
   - sui_price: Reference SUI price in USD
   - mist: Reference mist value

## Running the Script

1. **Start the Script**
   ```bash
   node index.js
   ```

2. **Using PM2 (Recommended for Production)**
   ```bash
   npm install -g pm2
   pm2 start index.js --name "sui-gas-price"
   pm2 save
   ```

## How It Works

1. **Hourly Checks**
   - Script runs every hour at minute 0
   - Fetches current epoch information
   - Displays remaining time until epoch end

2. **Price Updates**
   When less than 1 hour remains in the current epoch:
   - Fetches current SUI price from CoinMarketCap
   - Calculates new mist value based on price change ratio
   - Executes validator gas price update command

3. **Mist Calculation**
   ```
   new_mist = reference_mist * (reference_price / current_price)
   ```
   Example:
   - If SUI price doubles (1.00 → 2.00), mist halves (750 → 375)
   - If SUI price halves (1.00 → 0.50), mist doubles (750 → 1000, capped)

## Output Example

```
=== Sui Epoch Information ===
Current Epoch: 666
Time Remaining: 0 hours, 45 minutes, 30 seconds
=========================

=== Price Update ===
Current SUI Price: $1.25 (25% change)
Reference Price: $1.00
New Mist Value: 600 (-20% change)
Reference Mist: 750
=========================

Updating validator gas price...
Successfully updated validator gas price
```

## Troubleshooting

1. **Script Not Running**
   - Check environment variables are set correctly
   - Verify Sui CLI is installed and accessible
   - Check CoinMarketCap API key is valid

2. **Command Execution Errors**
   - Verify SUI_PATH points to correct directory
   - Ensure sui binary has execute permissions
   - Check validator credentials are properly set up

3. **Price Update Issues**
   - Verify CMC_API_KEY is valid
   - Check internet connectivity
   - Review API response errors in logs

## Support

For issues and feature requests, please open an issue in the GitHub repository.
