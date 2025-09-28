#!/bin/bash

# Deployment script for Video Review App

set -e

echo "🚀 Starting deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="video-review-app"
DOMAIN=${1:-"yourdomain.com"}
ENV=${2:-"production"}

echo -e "${YELLOW}Deploying $APP_NAME to $DOMAIN (Environment: $ENV)${NC}"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}❌ .env file not found!${NC}"
    echo -e "${YELLOW}📝 Creating .env from template...${NC}"
    
    if [ -f "env.production" ]; then
        cp env.production .env
        echo -e "${YELLOW}⚠️  Please edit .env with your actual values before continuing!${NC}"
        echo -e "${YELLOW}   - Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY${NC}"
        echo -e "${YELLOW}   - Update VITE_APP_URL to https://$DOMAIN${NC}"
        read -p "Press Enter after updating .env file..."
    else
        echo -e "${RED}❌ No environment template found!${NC}"
        exit 1
    fi
fi

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

# Run linting
echo -e "${YELLOW}🔍 Running linter...${NC}"
npm run lint

# Build the application
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build failed! No dist directory found.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Docker deployment
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Building Docker image...${NC}"
    docker build -t $APP_NAME:latest .
    
    echo -e "${YELLOW}🚀 Starting Docker container...${NC}"
    docker-compose down 2>/dev/null || true
    
    # Update docker-compose.yml with domain
    sed -i "s/yourdomain.com/$DOMAIN/g" docker-compose.yml
    sed -i "s/your-email@example.com/admin@$DOMAIN/g" docker-compose.yml
    
    docker-compose up -d
    
    echo -e "${GREEN}✅ Docker deployment completed!${NC}"
    echo -e "${GREEN}🌐 Your app should be available at: https://$DOMAIN${NC}"
else
    echo -e "${YELLOW}⚠️  Docker not found. Manual deployment required.${NC}"
    echo -e "${YELLOW}📁 Built files are in the 'dist' directory${NC}"
    echo -e "${YELLOW}📋 Manual deployment steps:${NC}"
    echo -e "${YELLOW}   1. Upload 'dist' contents to your web server${NC}"
    echo -e "${YELLOW}   2. Configure your web server (nginx/apache) to serve the files${NC}"
    echo -e "${YELLOW}   3. Set up SSL certificate for https://$DOMAIN${NC}"
    echo -e "${YELLOW}   4. Configure your domain's DNS to point to your server${NC}"
fi

# Health check
echo -e "${YELLOW}🏥 Performing health check...${NC}"
sleep 5

if command -v curl &> /dev/null; then
    if curl -f -s http://localhost/health > /dev/null; then
        echo -e "${GREEN}✅ Health check passed!${NC}"
    else
        echo -e "${RED}❌ Health check failed. Please check the deployment.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  curl not available for health check${NC}"
fi

echo -e "${GREEN}🎉 Deployment completed!${NC}"
echo ""
echo -e "${YELLOW}📋 Next steps:${NC}"
echo -e "${YELLOW}   1. Configure your domain DNS to point to this server${NC}"
echo -e "${YELLOW}   2. Set up your Supabase database using the migration files${NC}"
echo -e "${YELLOW}   3. Test the application at https://$DOMAIN${NC}"
echo -e "${YELLOW}   4. Monitor logs with: docker-compose logs -f${NC}"
