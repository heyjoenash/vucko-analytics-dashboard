# Scripts Directory

Utility scripts organized by purpose for development, database operations, deployment, and maintenance.

## 📁 Directory Structure

### Development Scripts (`development/`)
Tools for local development and testing:

- `serve.sh` - Start local Python HTTP server for frontend
- `start.sh` - Complete application startup script
- `open-in-cursor.sh` - Open project in Cursor editor

### Database Scripts (`database/`)
Database maintenance and migration utilities:

- `backfill.py` - Python script for data backfilling operations
- `run-backfill.js` - JavaScript backfill runner
- `fix-engagement-distribution.sql` - SQL script to fix engagement data issues

### Deployment Scripts (`deployment/`)
Production deployment and server setup:

- `setup-droplet.sh` - DigitalOcean droplet configuration script

### Maintenance Scripts (`maintenance/`)
Ongoing system maintenance and automation:

- `enrichment-scheduler.js` - Automated profile enrichment scheduling

## 🚀 Development Scripts

### Starting the Application
```bash
# Start frontend server (port 4200)
./scripts/development/serve.sh

# Start complete application stack
./scripts/development/start.sh
```

### Development Environment Setup
```bash
# Open project in Cursor editor
./scripts/development/open-in-cursor.sh
```

## 🗄️ Database Scripts

### Data Backfilling
```bash
# Python-based backfill (recommended)
python scripts/database/backfill.py

# JavaScript-based backfill
node scripts/database/run-backfill.js
```

### Database Fixes
```sql
-- Run in Supabase SQL Editor
-- Copy contents of scripts/database/fix-engagement-distribution.sql
```

## 🚀 Deployment Scripts

### Server Setup
```bash
# Set up new DigitalOcean droplet
./scripts/deployment/setup-droplet.sh
```

## 🔧 Maintenance Scripts

### Profile Enrichment
```bash
# Schedule profile enrichment jobs
node scripts/maintenance/enrichment-scheduler.js
```

## 📋 Script Usage Guidelines

### Making Scripts Executable
```bash
# Make development scripts executable
chmod +x scripts/development/*.sh
chmod +x scripts/deployment/*.sh
```

### Environment Variables
Some scripts require environment variables:
```bash
# For database scripts
export DATABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_ROLE_KEY="your_key"

# For enrichment scripts
export APIFY_TOKEN="your_apify_token"
```

### Common Patterns

#### Error Handling
All scripts should include proper error handling:
```bash
#!/bin/bash
set -e  # Exit on error

echo "Starting script..."
# Script content here
echo "Script completed successfully"
```

#### Logging
Include appropriate logging for debugging:
```bash
LOG_FILE="/tmp/script.log"
echo "$(date): Script started" >> $LOG_FILE
```

## 🔄 Script Dependencies

### Development Scripts
- **serve.sh**: Requires Python 3.x
- **start.sh**: Requires Python 3.x and Node.js
- **open-in-cursor.sh**: Requires Cursor editor installed

### Database Scripts
- **backfill.py**: Requires Python 3.x, psycopg2, requests
- **run-backfill.js**: Requires Node.js, @supabase/supabase-js
- **fix-engagement-distribution.sql**: Run in Supabase SQL Editor

### Deployment Scripts
- **setup-droplet.sh**: Requires Ubuntu 22.04, sudo access

### Maintenance Scripts
- **enrichment-scheduler.js**: Requires Node.js, Apify SDK

## 🚨 Critical Scripts

### Daily Operations
- `development/serve.sh` - Most commonly used for local development
- `database/backfill.py` - For data maintenance and updates

### Emergency Recovery
- `database/fix-engagement-distribution.sql` - Fix orphaned engagement data
- `development/start.sh` - Quick application restart

### Production Deployment
- `deployment/setup-droplet.sh` - Server provisioning
- `maintenance/enrichment-scheduler.js` - Automated data enrichment

## 📝 Adding New Scripts

### Naming Conventions
- Use descriptive names: `verb-noun.extension`
- Group by purpose in appropriate subdirectory
- Include file extension for clarity

### Documentation Requirements
1. Add script description to this README
2. Include usage examples
3. Document required dependencies
4. Add error handling and logging

### Testing
- Test scripts in development environment first
- Include dry-run options where applicable
- Verify with small datasets before production use

This script organization ensures maintainable, discoverable utilities while following standard conventions for different types of operations.