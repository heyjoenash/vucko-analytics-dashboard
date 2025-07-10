# Deployment Guide

Complete deployment guide for the Signals & Actions LinkedIn analytics platform.

## 🏗️ Deployment Overview

The application consists of three main components:
1. **Frontend**: Static HTML/JS/CSS files
2. **API Proxy**: Node.js Express server for LinkedIn API
3. **Database**: PostgreSQL via Supabase (already hosted)

## 🖥️ Local Development Deployment

### Current Setup (Working)
```bash
# Frontend: Python HTTP server
cd app && python3 -m http.server 4200

# API Proxy: Node.js server  
cd api-proxy && npm start

# Database: Supabase hosted
# URLs, tokens in app/config.js
```

### Prerequisites
- Python 3.x
- Node.js 16+ and npm
- Git
- Supabase account
- Apify account
- LinkedIn Developer access (optional)

### Environment Variables
```bash
# Create api-proxy/.env
LINKEDIN_ACCESS_TOKEN=your_linkedin_token
LINKEDIN_REFRESH_TOKEN=your_refresh_token
PORT=3001
NODE_ENV=development
```

## ☁️ Production Deployment Options

### Option 1: Static Hosting + Serverless Functions

#### Frontend: Vercel/Netlify
```bash
# 1. Build configuration
# Create vercel.json or netlify.toml

# 2. Environment variables
SUPABASE_URL=your_production_url
SUPABASE_ANON_KEY=your_service_role_key
APIFY_TOKEN=your_apify_token

# 3. Deploy
vercel --prod
# or
netlify deploy --prod
```

#### API Proxy: Vercel Functions
```javascript
// api/linkedin/[...proxy].js
export default async function handler(req, res) {
    // LinkedIn API proxy logic
    // Port existing api-proxy/server.js functionality
}
```

### Option 2: Container Deployment

#### Docker Configuration
```dockerfile
# Dockerfile.frontend
FROM nginx:alpine
COPY app/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

# Dockerfile.api
FROM node:18-alpine
WORKDIR /app
COPY api-proxy/package*.json ./
RUN npm ci --only=production
COPY api-proxy/ ./
EXPOSE 3001
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    ports:
      - "80:80"
    environment:
      - API_URL=http://api:3001

  api:
    build:
      context: .
      dockerfile: Dockerfile.api
    ports:
      - "3001:3001"
    environment:
      - LINKEDIN_ACCESS_TOKEN=${LINKEDIN_ACCESS_TOKEN}
      - SUPABASE_URL=${SUPABASE_URL}
```

### Option 3: VPS/Cloud Server

#### Server Setup (Ubuntu 22.04)
```bash
# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install dependencies
sudo apt install nginx nodejs npm python3 git -y

# 3. Install PM2 for process management
sudo npm install -g pm2

# 4. Clone repository
git clone https://github.com/heyjoenash/signals-actions-lite.git
cd signals-actions-lite

# 5. Set up API proxy
cd api-proxy
npm install
cp .env.example .env
# Edit .env with production values

# 6. Configure PM2
pm2 start npm --name "signals-api" -- start
pm2 startup
pm2 save
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/signals-actions
server {
    listen 80;
    server_name your-domain.com;
    
    # Frontend
    location / {
        root /path/to/signals-actions-lite/app;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
    
    # API Proxy
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Production Security Setup

### Environment Variables
```bash
# Production .env file
NODE_ENV=production
LINKEDIN_ACCESS_TOKEN=prod_token_here
LINKEDIN_REFRESH_TOKEN=prod_refresh_token
SUPABASE_URL=https://your-prod-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_prod_service_role_key
APIFY_TOKEN=your_prod_apify_token
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

### Security Headers
```javascript
// Add to api-proxy/server.js
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
```

### CORS Configuration
```javascript
// Production CORS setup
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:4200'],
    credentials: true,
    optionsSuccessStatus: 200
}));
```

## 📊 Database Production Setup

### Supabase Production Configuration
```sql
-- Enable Row Level Security
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagements ENABLE ROW LEVEL SECURITY;

-- Create policies for tenant isolation
CREATE POLICY "Users can only see their tenant data" ON persons
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id'));

CREATE POLICY "Users can only see their tenant data" ON posts
    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id'));

-- Add indexes for production performance
CREATE INDEX idx_persons_tenant_engagement ON persons(tenant_id, engagement_score);
CREATE INDEX idx_engagements_tenant_post ON engagements(tenant_id, post_id);
CREATE INDEX idx_companies_tenant_name ON companies(tenant_id, name);
```

### Backup Strategy
```bash
# Automated daily backups
#!/bin/bash
# backup.sh
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$BACKUP_DATE.sql
aws s3 cp backup_$BACKUP_DATE.sql s3://your-backup-bucket/

# Add to crontab
0 2 * * * /path/to/backup.sh
```

## 🚀 CI/CD Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: cd api-proxy && npm ci
      
    - name: Run tests
      run: cd api-proxy && npm test
      
    - name: Deploy to Vercel
      uses: amondnet/vercel-action@v20
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
        vercel-args: '--prod'
```

### Deployment Scripts
```bash
#!/bin/bash
# deploy.sh
set -e

echo "🚀 Starting deployment..."

# Build and test
cd api-proxy
npm ci
npm test
cd ..

# Deploy frontend
echo "📱 Deploying frontend..."
vercel --prod

# Deploy API
echo "🔌 Deploying API..."
# Deploy to your preferred serverless platform

echo "✅ Deployment complete!"
```

## 📈 Performance Optimization

### Frontend Optimization
```html
<!-- Add to app/index.html -->
<link rel="preconnect" href="https://cdn.tailwindcss.com">
<link rel="preconnect" href="https://cdnjs.cloudflare.com">
<link rel="dns-prefetch" href="https://api.linkedin.com">
```

### API Caching
```javascript
// Add Redis caching to api-proxy
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache LinkedIn API responses
app.use('/api/linkedin', async (req, res, next) => {
    const cacheKey = `linkedin:${req.url}`;
    const cached = await client.get(cacheKey);
    
    if (cached) {
        return res.json(JSON.parse(cached));
    }
    
    next();
});
```

### Database Optimization
```sql
-- Add production indexes
CREATE INDEX CONCURRENTLY idx_engagements_created_at ON engagements(created_at);
CREATE INDEX CONCURRENTLY idx_persons_last_seen ON persons(last_seen);

-- Analyze table statistics
ANALYZE persons;
ANALYZE engagements;
ANALYZE companies;
```

## 🔍 Monitoring & Logging

### Application Monitoring
```javascript
// Add to api-proxy/server.js
const winston = require('winston');

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.url}`, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    next();
});
```

### Health Checks
```javascript
// Enhanced health check
app.get('/health', async (req, res) => {
    const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version,
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {}
    };
    
    // Check LinkedIn API
    try {
        await linkedInClient.makeRequest('/adAccounts?count=1');
        health.services.linkedin = 'healthy';
    } catch (error) {
        health.services.linkedin = 'unhealthy';
        health.status = 'degraded';
    }
    
    res.json(health);
});
```

## 🚨 Disaster Recovery

### Backup Procedures
```bash
# Database backup
pg_dump $SUPABASE_DATABASE_URL > backup.sql

# Application backup
tar -czf app-backup.tar.gz app/ api-proxy/ docs/

# Upload to cloud storage
aws s3 cp backup.sql s3://backups/signals-actions/
aws s3 cp app-backup.tar.gz s3://backups/signals-actions/
```

### Recovery Procedures
```bash
# 1. Restore database
psql $NEW_DATABASE_URL < backup.sql

# 2. Update configuration
cp app/config.example.js app/config.js
# Edit with new credentials

# 3. Restart services
pm2 restart all

# 4. Verify functionality
curl http://localhost:3001/health
```

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] Monitoring configured
- [ ] Backup system tested

### Post-Deployment
- [ ] Health checks passing
- [ ] Frontend accessible
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Monitoring alerts configured

### Security Verification
- [ ] HTTPS enforced
- [ ] API keys secured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Security headers added

---

This deployment guide covers everything from local development to production-ready hosting with security, monitoring, and disaster recovery considerations.