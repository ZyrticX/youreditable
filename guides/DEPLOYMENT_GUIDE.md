# 🚀 Deployment Guide - Video Review App

This guide will help you deploy your video review application to your own server with a custom domain.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ A server (VPS/dedicated server) with Ubuntu/CentOS/Debian
- ✅ A domain name pointing to your server's IP
- ✅ SSH access to your server
- ✅ Supabase account and project set up

## 🏗️ Server Requirements

**Minimum Requirements:**
- 2 CPU cores
- 4GB RAM  
- 20GB storage
- Ubuntu 20.04+ or similar Linux distribution

**Recommended:**
- 4 CPU cores
- 8GB RAM
- 50GB storage

## 🔧 Server Setup

### 1. Update Your Server

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Required Software

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker and Docker Compose
sudo apt-get install -y docker.io docker-compose
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Nginx (if not using Docker)
sudo apt-get install -y nginx

# Install certbot for SSL certificates
sudo apt-get install -y certbot python3-certbot-nginx
```

### 3. Configure Firewall

```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

## 📦 Application Deployment

### Option A: Automated Deployment (Recommended)

1. **Upload your project to the server:**

```bash
# On your local machine
scp -r . user@your-server-ip:/home/user/video-review-app
```

2. **SSH into your server:**

```bash
ssh user@your-server-ip
cd /home/user/video-review-app
```

3. **Set up environment variables:**

```bash
cp env.production .env
nano .env  # Edit with your actual values
```

4. **Run deployment script:**

```bash
# Make script executable
chmod +x deploy.sh

# Deploy with your domain
./deploy.sh yourdomain.com production
```

### Option B: Manual Deployment

1. **Install dependencies and build:**

```bash
npm ci
npm run build
```

2. **Configure Nginx:**

```bash
sudo nano /etc/nginx/sites-available/video-review-app
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /home/user/video-review-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **Enable the site:**

```bash
sudo ln -s /etc/nginx/sites-available/video-review-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

4. **Set up SSL certificate:**

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🗄️ Supabase Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your Project URL and anon key

### 2. Set up Database Schema

1. Open Supabase SQL Editor
2. Copy and run the contents of `supabase-schema.sql`
3. Enable real-time by running `setup-realtime.sql`

### 3. Configure Environment Variables

Update your `.env` file with actual Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_APP_URL=https://yourdomain.com
```

## 🌐 Domain Configuration

### 1. DNS Setup

Point your domain to your server's IP address:

```
Type: A
Name: @
Value: YOUR_SERVER_IP
TTL: 3600

Type: A  
Name: www
Value: YOUR_SERVER_IP
TTL: 3600
```

### 2. SSL Certificate

If using manual deployment, set up SSL:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

## 🔄 Data Migration (Optional)

If you have existing data from Base44:

1. **Prepare migration script:**

```bash
cp env.production .env.migration
nano .env.migration  # Add your Base44 API credentials
```

2. **Run migration:**

```bash
node migrate-to-supabase.js
```

## 🚀 Docker Deployment (Alternative)

### 1. Using Docker Compose

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### 2. Manual Docker Build

```bash
# Build image
docker build -t video-review-app .

# Run container
docker run -d -p 80:80 --name video-review-app video-review-app
```

## 🔍 Monitoring & Maintenance

### 1. Check Application Status

```bash
# Check if app is running
curl -f http://yourdomain.com/health

# View Docker logs
docker-compose logs -f

# Check Nginx status
sudo systemctl status nginx
```

### 2. Update Application

```bash
# Pull latest changes
git pull origin main

# Rebuild and deploy
npm run build
docker-compose up -d --build
```

### 3. Backup Database

Set up automatic Supabase backups in your Supabase dashboard.

## 🛠️ Troubleshooting

### Common Issues

1. **App not accessible:**
   - Check firewall: `sudo ufw status`
   - Check Nginx: `sudo nginx -t`
   - Check DNS propagation: `nslookup yourdomain.com`

2. **SSL certificate issues:**
   - Renew certificate: `sudo certbot renew`
   - Check certificate status: `sudo certbot certificates`

3. **Build failures:**
   - Clear cache: `rm -rf node_modules/.cache`
   - Reinstall dependencies: `rm -rf node_modules && npm ci`

4. **Database connection issues:**
   - Verify Supabase credentials in `.env`
   - Check Supabase project status
   - Review RLS policies

### Log Files

- Nginx logs: `/var/log/nginx/`
- Application logs: `docker-compose logs`
- System logs: `journalctl -u nginx`

## 📊 Performance Optimization

### 1. Enable Gzip Compression

Already configured in the provided `nginx.conf`.

### 2. Set up CDN (Optional)

Consider using Cloudflare or similar CDN for better performance.

### 3. Database Optimization

- Enable connection pooling in Supabase
- Add appropriate indexes
- Monitor query performance

## 🔒 Security Checklist

- ✅ SSL certificate installed
- ✅ Firewall configured
- ✅ Regular security updates
- ✅ Strong passwords for server access
- ✅ Supabase RLS policies enabled
- ✅ Environment variables secured

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review application logs
3. Verify all configuration files
4. Check Supabase project status

## 🎉 Success!

Once deployed successfully:

1. ✅ Your app will be available at `https://yourdomain.com`
2. ✅ SSL certificate will auto-renew
3. ✅ All data will be stored in Supabase
4. ✅ Users can access the application with your custom domain

**Next Steps:**
- Test all functionality
- Set up monitoring
- Configure backups
- Add your custom branding

