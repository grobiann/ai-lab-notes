# Production Server Setup Guide

This guide covers setting up a fresh Ubuntu server for deploying AI Lab Notes.

## Initial Server Setup

### 1. System Updates

```bash
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y curl wget git nano htop
```

### 2. Install Docker

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install -y docker-compose-plugin

# Verify installation
docker --version
docker compose version

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Install Additional Tools

```bash
# Node.js (optional, for direct Node.js deployments)
sudo apt-get install -y nodejs npm

# PostgreSQL client
sudo apt-get install -y postgresql-client

# Nginx (if not using Docker)
sudo apt-get install -y nginx

# Certbot for SSL certificates
sudo apt-get install -y certbot python3-certbot-nginx
```

### 4. Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH, HTTP, HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Check rules
sudo ufw status

# Optional: Allow specific IPs for SSH
# sudo ufw allow from 192.168.1.0/24 to any port 22
```

### 5. Create Deploy User

```bash
# Create deploy user
sudo useradd -m -s /bin/bash deploy

# Add to sudo group (optional)
sudo usermod -aG sudo deploy

# Add to docker group
sudo usermod -aG docker deploy

# Setup SSH key authentication
sudo -u deploy mkdir -p /home/deploy/.ssh
# Add your public key to /home/deploy/.ssh/authorized_keys
echo "your-public-key" | sudo -u deploy tee /home/deploy/.ssh/authorized_keys
sudo -u deploy chmod 700 /home/deploy/.ssh
sudo -u deploy chmod 600 /home/deploy/.ssh/authorized_keys

# Test login
ssh -i your-private-key deploy@your.server.com
```

## Application Directory Setup

```bash
# Create application directory
sudo mkdir -p /opt/ai-lab-notes
sudo chown deploy:deploy /opt/ai-lab-notes
cd /opt/ai-lab-notes

# Create necessary subdirectories
mkdir -p ssl
mkdir -p backups
mkdir -p logs

# Set permissions
chmod 700 ssl
chmod 700 backups
```

## Docker Registry Authentication

```bash
# Login to Docker registry
docker login docker.io  # or your registry

# Or create .docker/config.json
mkdir -p ~/.docker
cat > ~/.docker/config.json << EOF
{
  "auths": {
    "docker.io": {
      "auth": "base64-encoded-username-password"
    }
  }
}
EOF
chmod 600 ~/.docker/config.json
```

## SSL Certificate Setup

### Option 1: Let's Encrypt with Certbot

```bash
# Obtain certificate
sudo certbot certonly --standalone \
  -d yourdomain.com \
  -d www.yourdomain.com \
  -n \
  --agree-tos \
  -m your-email@example.com

# Copy to application directory
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/ai-lab-notes/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/ai-lab-notes/ssl/key.pem

# Fix permissions
sudo chown deploy:deploy /opt/ai-lab-notes/ssl/cert.pem
sudo chown deploy:deploy /opt/ai-lab-notes/ssl/key.pem
chmod 644 /opt/ai-lab-notes/ssl/cert.pem
chmod 600 /opt/ai-lab-notes/ssl/key.pem

# Setup auto-renewal (runs twice daily)
sudo certbot renew --quiet
```

### Option 2: Self-Signed Certificate (Development Only)

```bash
cd /opt/ai-lab-notes/ssl

# Generate private key
openssl genrsa -out key.pem 2048

# Generate certificate
openssl req -new -x509 -key key.pem -out cert.pem -days 365
```

## Git Repository Setup

```bash
cd /opt/ai-lab-notes

# Initialize git (if not cloning)
git init
git remote add origin https://github.com/yourusername/ai-lab-notes.git

# Or clone
git clone https://github.com/yourusername/ai-lab-notes.git .

# Create environment file
cp .env.production.example .env.production
# Edit with production values
nano .env.production
```

## Docker Images and Registry

### Setup Private Registry (Optional)

```bash
# Run private registry
docker run -d \
  --name registry \
  --restart always \
  -p 5000:5000 \
  -v /opt/registry:/var/lib/registry \
  registry:2

# Tag and push images
docker tag ai-lab-notes-backend:latest localhost:5000/ai-lab-notes-backend:latest
docker push localhost:5000/ai-lab-notes-backend:latest
```

## Database Configuration

### PostgreSQL Backup Setup

```bash
# Create backup directory
sudo mkdir -p /opt/ai-lab-notes/backups
sudo chown deploy:deploy /opt/ai-lab-notes/backups

# Create backup script
cat > /home/deploy/backup-db.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/ai-lab-notes/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/ai-lab-notes_$TIMESTAMP.sql.gz"

docker-compose -f /opt/ai-lab-notes/docker-compose.prod.yml \
  exec -T postgres \
  pg_dump -U postgres ai_lab_notes | gzip > "$BACKUP_FILE"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "ai-lab-notes_*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
EOF

chmod +x /home/deploy/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /home/deploy/backup-db.sh
```

## Log Rotation

```bash
# Create logrotate configuration
sudo cat > /etc/logrotate.d/ai-lab-notes << 'EOF'
/opt/ai-lab-notes/logs/*.log {
  daily
  rotate 7
  compress
  delaycompress
  notifempty
  create 0640 deploy deploy
  sharedscripts
}
EOF
```

## Monitoring Setup

### Install Node Exporter (Optional)

```bash
# Download and install
wget https://github.com/prometheus/node_exporter/releases/download/v1.6.1/node_exporter-1.6.1.linux-amd64.tar.gz
tar xvfz node_exporter-1.6.1.linux-amd64.tar.gz
sudo mv node_exporter-1.6.1.linux-amd64/node_exporter /usr/local/bin/

# Create systemd service
sudo cat > /etc/systemd/system/node_exporter.service << 'EOF'
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable node_exporter
sudo systemctl start node_exporter
```

## Systemd Service (Optional)

Create a systemd service to manage the application:

```bash
sudo cat > /etc/systemd/system/ai-lab-notes.service << 'EOF'
[Unit]
Description=AI Lab Notes
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
WorkingDirectory=/opt/ai-lab-notes
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
RemainAfterExit=yes
User=deploy

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl enable ai-lab-notes
sudo systemctl start ai-lab-notes
```

## Health Check Setup

```bash
# Create health check script
cat > /home/deploy/health-check.sh << 'EOF'
#!/bin/bash

# Check API health
API_HEALTH=$(curl -s https://yourdomain.com/api/health)
if [ "$API_HEALTH" != "healthy" ]; then
  echo "API health check failed"
  # Alert: send notification
fi

# Check frontend
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/)
if [ "$FRONTEND_STATUS" != "200" ]; then
  echo "Frontend health check failed: $FRONTEND_STATUS"
  # Alert: send notification
fi

# Check database
docker-compose -f /opt/ai-lab-notes/docker-compose.prod.yml \
  exec -T postgres pg_isready -U postgres > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Database health check failed"
  # Alert: send notification
fi

echo "All health checks passed at $(date)"
EOF

chmod +x /home/deploy/health-check.sh

# Add to crontab (every 5 minutes)
# */5 * * * * /home/deploy/health-check.sh
```

## Quick Verification

```bash
# Verify Docker is running
docker ps

# Verify Docker Compose
docker compose --version

# Verify application can access Docker
sudo -u deploy docker ps

# Test network connectivity
ping google.com
curl https://yourdomain.com
```

## Security Hardening

### SSH Hardening

```bash
# Edit SSH config
sudo nano /etc/ssh/sshd_config

# Changes to make:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes
# Port 22 (or change to non-standard port)

# Restart SSH
sudo systemctl restart sshd
```

### Automatic Security Updates

```bash
sudo apt-get install -y unattended-upgrades

# Enable automatic updates
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

### Fail2Ban Protection

```bash
sudo apt-get install -y fail2ban

# Configure
sudo nano /etc/fail2ban/jail.local

# Start service
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

## Documentation

Keep the following information in a secure location:

- SSH private key
- Database passwords
- JWT secrets
- Docker registry credentials
- SSL certificate renewal dates
- Backup locations and restore procedures
- Contact information for critical services

## Support and Troubleshooting

For issues, check:
1. `docker ps` - Are services running?
2. `docker logs <container>` - What are the errors?
3. `docker-compose -f docker-compose.prod.yml logs` - What's happening?
4. Firewall rules - Can traffic reach the server?
5. DNS - Is the domain pointing to the server?
6. SSL certificates - Are they valid and not expired?

## Next Steps

1. Test the deployment process
2. Set up monitoring and alerting
3. Create and test backup/restore procedures
4. Document your custom configurations
5. Set up log aggregation (ELK stack, etc.)
