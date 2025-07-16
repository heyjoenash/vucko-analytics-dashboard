# Port Assignment Rules

## STRICT PORT ASSIGNMENTS

### Frontend Applications
- **Port 4200**: ALWAYS used for frontend web applications
  - Main app: `http://localhost:4200`
  - All HTML/JS/CSS served from this port

### API Services
- **Port 8001**: LinkedIn API Proxy Server
  - Proxy endpoint: `http://localhost:8001/api/linkedin`
  - Health check: `http://localhost:8001/health`

### FORBIDDEN PORTS
- **Ports 3000-3999**: NEVER USE ANY PORT IN THIS RANGE
  - This includes 3000, 3001, 3002, etc.
  - These ports are reserved for other applications

## Implementation

### Starting Services

```bash
# Frontend (always on 4200)
cd app && python3 -m http.server 4200

# LinkedIn API Proxy (always on 8001)
cd api-proxy && PORT=8001 npm start
```

### Configuration
- All services must respect these port assignments
- Update any hardcoded ports to follow these rules
- Environment variables should default to these ports