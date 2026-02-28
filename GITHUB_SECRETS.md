# GitHub Actions Secrets Configuration

This guide explains how to configure GitHub Actions secrets for automated CI/CD deployment.

## How to Add Secrets

1. Navigate to your GitHub repository
2. Go to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Enter the secret name and value
5. Click **Add secret**

## Required Secrets

### Container Registry Secrets

These secrets are needed to push Docker images to your registry.

#### `REGISTRY_URL`
- **Type:** String
- **Example:** `docker.io/yourusername` or `ghcr.io/yourusername`
- **Description:** Your Docker registry URL (Docker Hub or GitHub Container Registry)

#### `REGISTRY_USERNAME`
- **Type:** String
- **Example:** `yourusername`
- **Description:** Docker registry username

#### `REGISTRY_PASSWORD`
- **Type:** Secret string
- **Example:** `dckr_pat_xxxxxxxxxxxxxx`
- **Description:** Docker registry password or Personal Access Token

### Production Server Secrets

These secrets are used for SSH deployment to your production server.

#### `DEPLOY_HOST`
- **Type:** String
- **Example:** `your.server.com` or `192.168.1.100`
- **Description:** Production server IP or hostname

#### `DEPLOY_USER`
- **Type:** String
- **Example:** `deploy`
- **Description:** SSH user on production server

#### `DEPLOY_KEY`
- **Type:** Secret string (Multiline)
- **Description:** SSH private key for authentication
- **How to generate:**
  ```bash
  ssh-keygen -t rsa -b 4096 -f deploy_key
  # Copy contents of deploy_key (without .pub extension)
  ```

#### `DEPLOY_PORT`
- **Type:** String
- **Example:** `22`
- **Description:** SSH port on production server

#### `DEPLOY_PATH`
- **Type:** String
- **Example:** `/opt/ai-lab-notes`
- **Description:** Path to application directory on server

### Database Secrets

These secrets configure database connection in production.

#### `DB_HOST`
- **Type:** String
- **Example:** `postgres` or `db.example.com`
- **Description:** Database hostname

#### `DB_PORT`
- **Type:** String
- **Example:** `5432`
- **Description:** Database port

#### `DB_USER`
- **Type:** String
- **Example:** `postgres`
- **Description:** Database user

#### `DB_PASSWORD`
- **Type:** Secret string
- **Example:** `SecurePassword123!@#`
- **Description:** Database password (must be complex)

#### `DB_NAME`
- **Type:** String
- **Example:** `ai_lab_notes`
- **Description:** Database name

### Application Secrets

These secrets are application-specific tokens and keys.

#### `JWT_SECRET`
- **Type:** Secret string
- **Length:** At least 32 characters
- **How to generate:**
  ```bash
  openssl rand -base64 32
  ```
- **Description:** JWT signing secret for authentication tokens

#### `REFRESH_TOKEN_SECRET`
- **Type:** Secret string
- **Length:** At least 32 characters
- **How to generate:**
  ```bash
  openssl rand -base64 32
  ```
- **Description:** Secret for refresh token signing

### Optional Notification Secrets

#### `SLACK_WEBHOOK_URL`
- **Type:** Secret string
- **Example:** `https://hooks.slack.com/services/<WORKSPACE_ID>/<CHANNEL_ID>/<TOKEN>`
- **Description:** Slack webhook URL for deployment notifications
- **How to get:**
  1. Create a Slack app at https://api.slack.com/apps
  2. Enable Incoming Webhooks
  3. Create a new webhook for your channel
  4. Copy the webhook URL

## Example Secret Values

### For Local Testing (Change for Production!)

```
REGISTRY_URL=docker.io/myusername
REGISTRY_USERNAME=myusername
REGISTRY_PASSWORD=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

DEPLOY_HOST=deploy.example.com
DEPLOY_USER=deploy
DEPLOY_PORT=22
DEPLOY_PATH=/opt/ai-lab-notes

DB_HOST=postgres
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=SuperSecurePassword123!@#
DB_NAME=ai_lab_notes

JWT_SECRET=your-super-secret-jwt-key-32-chars-minimum
REFRESH_TOKEN_SECRET=your-refresh-secret-32-chars-minimum
```

## Step-by-Step Setup

### 1. Generate SSH Keys

```bash
# Generate SSH key pair (use for DEPLOY_KEY)
ssh-keygen -t rsa -b 4096 -N "" -f ./deploy_key

# View private key (copy this as DEPLOY_KEY)
cat deploy_key

# Add public key to server
cat deploy_key.pub

# On server:
# mkdir -p ~/.ssh
# echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys
# chmod 600 ~/.ssh/authorized_keys
```

### 2. Generate Application Secrets

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate refresh token secret
openssl rand -base64 32

# Example output:
# rX3z7vQ9mK2pL5nJ8bX1wA4cF6hG9iD2mL5oP8qR1sT4u
```

### 3. Docker Registry Setup

**For Docker Hub:**
```bash
# Create Personal Access Token at https://hub.docker.com/settings/security
# REGISTRY_URL: docker.io/yourusername
# REGISTRY_USERNAME: yourusername
# REGISTRY_PASSWORD: <your PAT>
```

**For GitHub Container Registry:**
```bash
# Create PAT at https://github.com/settings/tokens
# Scopes: write:packages, read:packages, delete:packages
# REGISTRY_URL: ghcr.io/yourusername
# REGISTRY_USERNAME: yourusername
# REGISTRY_PASSWORD: <your PAT>
```

### 4. Production Server Secrets

```bash
# SSH command to test connection
ssh -i deploy_key -p 22 deploy@your.server.com

# Database command to test
psql -h db.host -U postgres -d ai_lab_notes
```

### 5. Slack Integration (Optional)

```bash
# Test webhook
curl -X POST -H 'Content-type: application/json' \
    --data '{"text":"Test message"}' \
    YOUR_SLACK_WEBHOOK_URL
```

## Verification Checklist

- [ ] All required secrets are added
- [ ] Secrets don't contain quotes or extra whitespace
- [ ] SSH key is private key (-----BEGIN PRIVATE KEY-----)
- [ ] JWT secrets are at least 32 characters
- [ ] Database credentials are correct
- [ ] Docker registry credentials work
- [ ] SSH connection to server succeeds
- [ ] Database connection succeeds

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Change JWT secrets every 6 months
   - Rotate database passwords quarterly
   - Update SSH keys annually

2. **Use Strong Passwords**
   - Database: 16+ characters, mixed case, numbers, symbols
   - Tokens: 32+ characters, use openssl to generate

3. **Limit Access**
   - Use service accounts for deployments
   - Restrict SSH keys to specific IP ranges
   - Use read-only database users where possible

4. **Monitor Usage**
   - Check GitHub Actions logs for errors
   - Review deployment history
   - Monitor failed login attempts

5. **Never Commit Secrets**
   - Add `.env.production` to `.gitignore`
   - Review commits before pushing
   - Use GitHub's secret scanning

## Troubleshooting

### GitHub Actions Won't Deploy

1. Check secret names match workflow file exactly
2. Verify no extra spaces or quotes in secrets
3. Check GitHub Actions logs for error messages
4. Test credentials manually first

### Database Connection Failed

```bash
# Test connection from local machine
psql -h $DB_HOST -U $DB_USER -d $DB_NAME

# Check connection string format
postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME
```

### Docker Push Failed

```bash
# Test Docker login locally
docker login docker.io -u $REGISTRY_USERNAME -p $REGISTRY_PASSWORD

# Test push
docker tag test:latest docker.io/$REGISTRY_USERNAME/test:latest
docker push docker.io/$REGISTRY_USERNAME/test:latest
```

### SSH Connection Failed

```bash
# Test SSH connection
ssh -i deploy_key -p $DEPLOY_PORT $DEPLOY_USER@$DEPLOY_HOST

# Check server firewall
sudo ufw status

# Check SSH service
sudo systemctl status ssh
```

## Updating Secrets

To update an existing secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Find the secret and click **Update**
3. Enter the new value
4. Click **Update secret**

**Note:** Next workflow run will use the updated secret.

## Removing Secrets

To remove a secret:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Find the secret and click **Delete**
3. Confirm deletion

Removed secrets cannot be recovered. Ensure you have backups before deleting.

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Container Registry Documentation](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
