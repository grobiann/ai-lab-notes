# Deployment Guide

This guide covers deploying the AI Lab Notes application to production.

## Prerequisites

- Docker and Docker Compose
- GitHub repository with secrets configured
- SSH access to production server
- Domain name with DNS configured
- SSL certificate (Let's Encrypt recommended)

## Local Development

Start all services locally:

```bash
docker-compose up -d
```

Services:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000
- Database: localhost:5432

## GitHub Actions Setup

### Secrets Configuration

Set these secrets in your GitHub repository settings:

**Container Registry:**
- `REGISTRY_URL`: Your Docker registry URL (e.g., `docker.io/username`)
- `REGISTRY_USERNAME`: Docker registry username
- `REGISTRY_PASSWORD`: Docker registry password or access token

**Production Server:**
- `DEPLOY_HOST`: Server IP or hostname
- `DEPLOY_USER`: SSH user (e.g., `deploy`)
- `DEPLOY_KEY`: SSH private key (multiline)
- `DEPLOY_PORT`: SSH port (default: 22)
- `DEPLOY_PATH`: Path to app on server (e.g., `/opt/ai-lab-notes`)

**Database:**
- `DB_HOST`: Database hostname (or `postgres` if using Docker)
- `DB_PORT`: Database port (default: 5432)
- `DB_USER`: Database user (default: postgres)
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name (default: ai_lab_notes)

**Application:**
- `JWT_SECRET`: JWT signing secret (generate a strong random string)
- `REFRESH_TOKEN_SECRET`: Refresh token secret

**Notifications (optional):**
- `SLACK_WEBHOOK_URL`: Slack webhook for deployment notifications

## Manual Deployment

### 1. Prepare Server

```bash
# SSH into production server
ssh -i ~/.ssh/deploy_key deploy@yourdomain.com

# Create application directory
mkdir -p /opt/ai-lab-notes
cd /opt/ai-lab-notes

# Create SSL directory
mkdir -p ssl

# Create environment file
cp .env.production.example .env.production
# Edit with production values
nano .env.production
```

### 2. Copy Certificates

Place your SSL certificates in the `ssl/` directory:
```bash
# Copy certificate and key
scp cert.pem deploy@yourdomain.com:/opt/ai-lab-notes/ssl/
scp key.pem deploy@yourdomain.com:/opt/ai-lab-notes/ssl/
```

### 3. Deploy Application

```bash
# Pull latest images
docker pull your-registry/ai-lab-notes-backend:latest
docker pull your-registry/ai-lab-notes-frontend:latest

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Verify services
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Run Migrations

```bash
docker run --rm \
  --network host \
  -e DATABASE_HOST=localhost \
  -e DATABASE_PORT=5432 \
  -e DATABASE_USER=postgres \
  -e DATABASE_PASSWORD=your-password \
  -e DATABASE_NAME=ai_lab_notes \
  your-registry/ai-lab-notes-backend:latest \
  npm run typeorm migration:run
```

## Automated Deployment (GitHub Actions)

The deployment workflow automatically triggers on push to `main` branch.

### Workflow Steps

1. **Test & Build**
   - Runs tests for backend and frontend
   - Builds Docker images
   - Pushes images to registry

2. **Deploy**
   - SSHs into production server
   - Pulls latest images
   - Runs database migrations
   - Restarts services with docker-compose

3. **Notify**
   - Sends Slack notification on success/failure

### Manual Trigger

To manually trigger deployment:

```bash
# Via GitHub CLI
gh workflow run deploy.yml

# Or via GitHub web interface
# Navigate to Actions → Deploy to Production → Run workflow
```

## Backup Strategy

### Database Backup

```bash
# Manual backup
docker exec ai_lab_notes_db_prod pg_dump -U postgres ai_lab_notes > backup.sql

# Restore backup
docker exec -i ai_lab_notes_db_prod psql -U postgres ai_lab_notes < backup.sql

# Automated backup (add to crontab)
0 2 * * * docker exec ai_lab_notes_db_prod pg_dump -U postgres ai_lab_notes | gzip > /backups/db-$(date +\%Y\%m\%d).sql.gz
```

### Docker Volumes

Keep PostgreSQL data in named volumes:
```bash
docker volume ls
docker volume inspect ai_lab_notes_postgres_data_prod
```

## Monitoring & Logs

### View Logs

```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
docker-compose -f docker-compose.prod.yml logs -f nginx

# Last 100 lines
docker-compose -f docker-compose.prod.yml logs --tail 100 backend
```

### Health Checks

```bash
# API health
curl https://yourdomain.com/api/health

# Frontend
curl https://yourdomain.com/health

# Database
docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U postgres
```

### Resource Usage

```bash
docker stats
```

## Scaling & Performance

### Database Optimization

```sql
-- Analyze and vacuum database
ANALYZE;
VACUUM;

-- Check index usage
SELECT * FROM pg_stat_user_indexes;
```

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://yourdomain.com/

# Using wrk
wrk -t4 -c100 -d30s https://yourdomain.com/
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Verify images are pulled
docker images

# Check port conflicts
sudo netstat -tlnp | grep LISTEN
```

### Database Connection Errors

```bash
# Test database connection
docker-compose -f docker-compose.prod.yml exec backend \
  npm run typeorm query "SELECT 1"

# Check database status
docker-compose -f docker-compose.prod.yml ps postgres
```

### High CPU/Memory Usage

```bash
# Check container stats
docker stats

# Limit resources in docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
```

## Updating Application

### Simple Update

```bash
# Pull new images
docker pull registry/ai-lab-notes-backend:latest
docker pull registry/ai-lab-notes-frontend:latest

# Restart services
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### Update with Downtime Mitigation

```bash
# Update one service at a time
docker-compose -f docker-compose.prod.yml up -d backend
docker-compose -f docker-compose.prod.yml up -d frontend
```

## SSL Certificate Renewal

### Using Let's Encrypt (Certbot)

```bash
# Install certbot
apt-get install certbot python3-certbot-nginx

# Obtain certificate
certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates stored in /etc/letsencrypt/live/yourdomain.com/
# Copy to nginx ssl directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/ai-lab-notes/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/ai-lab-notes/ssl/key.pem

# Restart nginx
docker-compose -f docker-compose.prod.yml restart nginx
```

## Rollback Procedure

```bash
# Restore previous image version
docker-compose -f docker-compose.prod.yml down

# Update docker-compose.prod.yml with previous image tags
sed -i 's/:latest/:previous-tag/' docker-compose.prod.yml

# Restart with previous version
docker-compose -f docker-compose.prod.yml up -d

# Verify
docker-compose -f docker-compose.prod.yml ps
```

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
