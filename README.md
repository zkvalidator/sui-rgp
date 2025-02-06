# Sui Gas Price Updater

This script automatically updates the Sui validator gas price based on the current SUI token price from CoinMarketCap. The script runs every 6 hours (at 00:00, 06:00, 12:00, and 18:00 UTC) to maintain optimal gas prices.

## Prerequisites

1. **Node.js Installation**
   - Download and install Node.js from [official website](https://nodejs.org/)
   - Verify installation:
     ```bash
     node --version
     npm --version
     ```

2. **CoinMarketCap API Key**
   - Sign up for a free API key at [CoinMarketCap](https://pro.coinmarketcap.com/signup)
   - Choose "Basic" plan (Free basic access for personal use)
   - After signing up, get your API key from the dashboard

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
     SUI_PATH=/path/to/sui
     ```
   - Replace `your_coinmarketcap_api_key` with your actual API key
   - Replace `/path/to/sui` with the path to your Sui executable

2. **Verify Configuration**
   - Ensure `reference.json` contains the base values:
     ```json
     {
         "sui_price": 1,
         "mist": 750
     }
     ```

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

## Operation Details

- The script runs every 6 hours (00:00, 06:00, 12:00, 18:00 UTC)
- It fetches the current SUI price from CoinMarketCap
- Calculates the new mist value based on price changes
- Maximum mist value is capped at 1000
- Automatically executes the validator gas price update command

## Monitoring and Maintenance

1. **View Logs**
   ```bash
   pm2 logs sui-gas-updater
   ```

2. **Restart Script**
   ```bash
   pm2 restart sui-gas-updater
   ```

3. **Stop Script**
   ```bash
   pm2 stop sui-gas-updater
   ```

## Troubleshooting

1. **API Issues**
   - Verify your API key in .env file
   - Check CoinMarketCap dashboard for API status
   - Ensure you haven't exceeded API rate limits

2. **Script Not Running**
   - Check PM2 status: `pm2 status`
   - Verify log files: `pm2 logs`
   - Ensure all environment variables are set correctly

3. **Permission Issues**
   - Ensure proper permissions for Sui executable
   - Verify write permissions in script directory

## Creating and Pushing to GitHub Repository

1. **Create a New Repository on GitHub**
   - Go to [GitHub](https://github.com)
   - Click the '+' icon in the top right and select 'New repository'
   - Name your repository (e.g., 'sui-gas-price')
   - Add a description (optional)
   - Choose 'Public' or 'Private'
   - Do NOT initialize with README, .gitignore, or license
   - Click 'Create repository'

2. **Initialize Local Git Repository**
   ```bash
   cd sui-gas-price
   git init
   git add .
   git commit -m "Initial commit"
   ```

3. **Link and Push to GitHub**
   ```bash
   git remote add origin https://github.com/yourusername/sui-gas-price.git
   git branch -M main
   git push -u origin main
   ```

4. **Update Repository (for future changes)**
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```

Note: Replace 'yourusername' with your actual GitHub username in the repository URL.

## Support

For issues and feature requests, please open an issue in the GitHub repository.
