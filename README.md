# Sui Gas Price Updater

A Node.js script that monitors Sui network epochs and automatically updates Sui gas price based on SUI token price before the Epoch change.

## Features

- Monitors Sui network epoch status every hour
- Fetches current SUI price from CoinMarketCap when epoch is ending (< 1 hour remaining) and executes the following steps.
- Calculates optimal mist value based on price changes
- Automatically updates Sui gas price
- Provides detailed logging of epoch status and price calculations

## NOTE:

- This script does NOT take the Sui stake subsidies into calcuations
- This script users the following reference point:
  
    ```
    SUI : 1 USD
    MIST : 750
    ```

## Prerequisites

1. **Ubuntu 22.04**

2. **SUI client**

3. **Sui Validator Keystore file**. In this case, we have the file at the following location:
     ```
     ~/.sui/sui_config
     ```

4. **Node.js Installation**
   - Download and install Node.js from [official website](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

5. **CoinMarketCap API Key**
   - Sign up for a free API key at [CoinMarketCap](https://pro.coinmarketcap.com/signup)
   - Choose "Basic" plan (Free basic access for personal use)
   - After signing up, get your API key from the dashboard

## Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/synergynodes/sui-rgp.git
   cd sui-rgp
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Install PM2 Globally**
   ```bash
   npm install -g pm2
   ```

## Configuration

1. **Create Environment File**
   - Create a `.env` file in the project root:
     ```bash
     touch .env
     ```
   - Add the following content:
     ```
     CMC_API_KEY=your_coinmarketcap_api_key
     SUI_PATH=/usr/local/bin
     SUI_RPC_URL=https://fullnode.mainnet.sui.io/
     ```
     Replace values with your actual configuration:
      - CMC_API_KEY: Your CoinMarketCap API key
      - SUI_PATH: Path to the directory containing the sui binary
      - SUI_RPC_URL: Sui RPC endpoint (default provided)

2. **Verify Configuration**
   - Ensure `reference.json` contains the base values:
     ```json
     {
         "sui_price": 1,
         "mist": 750
     }
     ```
     - sui_price: Reference SUI price in USD
     - mist: Reference mist value

## Running the Script

1. **Start with PM2**
   ```bash
   pm2 start index.js --name "sui-gas-updater"
   ```

2. **Monitor the Process**
   ```bash
   pm2 logs sui-gas-updater    # View logs
   pm2 status                  # Check status
   ```

3. **Auto-start on System Boot**
   ```bash
   pm2 startup               # Generate startup script
   pm2 save                  # Save current process list
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

**Feel free to change / update the code based on your requirements.**

## Support

For issues and feature requests, please open an issue in the GitHub repository.
