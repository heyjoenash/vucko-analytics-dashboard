#!/bin/bash

# Digital Ocean Droplet Setup Script for Enrichment Service
# Run this script on the Ubuntu 22.04 droplet to set up the enrichment workflow

set -e

echo "🚀 Setting up Signals Enrichment Service on Digital Ocean Droplet"

# Update system packages
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18.x
echo "📦 Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install system dependencies
echo "📦 Installing system dependencies..."
sudo apt-get install -y git curl wget unzip htop

# Create enrichment user and directory
echo "👤 Creating enrichment user and directory..."
sudo useradd -m -s /bin/bash enrichment
sudo mkdir -p /opt/signals-enrichment
sudo chown enrichment:enrichment /opt/signals-enrichment

# Switch to enrichment user for the rest of the setup
echo "🔧 Switching to enrichment user..."
sudo -u enrichment bash << 'EOF'
cd /opt/signals-enrichment

# Create package.json
echo "📝 Creating package.json..."
cat > package.json << 'PACKAGE_JSON'
{
  "name": "signals-enrichment-service",
  "version": "1.0.0",
  "description": "Automated LinkedIn enrichment service",
  "main": "enrichment-scheduler.js",
  "scripts": {
    "start": "node enrichment-scheduler.js",
    "process": "node enrichment-scheduler.js --process",
    "auto-queue": "node enrichment-scheduler.js --auto-queue",
    "stats": "node enrichment-scheduler.js --stats"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
PACKAGE_JSON

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create environment file
echo "🔧 Creating environment file..."
cat > .env << 'ENV_FILE'
SUPABASE_URL=https://misuahtcociqkmkajvrw.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pc3VhaHRjb2NpcWtta2FqdnJ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTM4NzY4NCwiZXhwIjoyMDY2OTYzNjg0fQ.eI3NTRguummX2Fs4iaRA4a6vutDPV2av0at9pJRDlSc
APIFY_TOKEN=your_apify_api_token_here
APIFY_ACTOR_ID=curious_coder/linkedin-post-reactions-scraper
TENANT_ID=00000000-0000-0000-0000-000000000001
NODE_ENV=production
ENV_FILE

# Create logs directory
mkdir -p logs

echo "✅ Basic setup completed for enrichment user"
EOF

# Set up firewall
echo "🔒 Configuring firewall..."
sudo ufw allow ssh
sudo ufw allow 22
sudo ufw --force enable

# Set up log rotation
echo "📋 Setting up log rotation..."
sudo tee /etc/logrotate.d/signals-enrichment > /dev/null << 'LOGROTATE'
/opt/signals-enrichment/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 enrichment enrichment
}
LOGROTATE

# Display system information
echo "🖥️ System Information:"
echo "Node.js version: $(node --version)"
echo "NPM version: $(npm --version)"
echo "System uptime: $(uptime)"
echo "Memory usage: $(free -h)"
echo "Disk usage: $(df -h / | tail -1)"

echo "✅ Droplet setup completed successfully!"
echo "🔗 Next steps: Upload enrichment service files and set up cron jobs"
echo "📍 Service directory: /opt/signals-enrichment"
echo "👤 Service user: enrichment"