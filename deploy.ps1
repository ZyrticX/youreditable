# PowerShell deployment script for Video Review App

param(
    [string]$Domain = "yourdomain.com",
    [string]$Environment = "production"
)

Write-Host "🚀 Starting deployment..." -ForegroundColor Green

$AppName = "video-review-app"

Write-Host "Deploying $AppName to $Domain (Environment: $Environment)" -ForegroundColor Yellow

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "📝 Creating .env from template..." -ForegroundColor Yellow
    
    if (Test-Path "env.production") {
        Copy-Item "env.production" ".env"
        Write-Host "⚠️  Please edit .env with your actual values before continuing!" -ForegroundColor Yellow
        Write-Host "   - Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY" -ForegroundColor Yellow
        Write-Host "   - Update VITE_APP_URL to https://$Domain" -ForegroundColor Yellow
        Read-Host "Press Enter after updating .env file"
    } else {
        Write-Host "❌ No environment template found!" -ForegroundColor Red
        exit 1
    }
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm ci

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies!" -ForegroundColor Red
    exit 1
}

# Run linting
Write-Host "🔍 Running linter..." -ForegroundColor Yellow
npm run lint

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Linting issues found, but continuing..." -ForegroundColor Yellow
}

# Build the application
Write-Host "🏗️  Building application..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

# Check if build was successful
if (-not (Test-Path "dist")) {
    Write-Host "❌ Build failed! No dist directory found." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed successfully!" -ForegroundColor Green

# Check for Docker
$dockerInstalled = Get-Command docker -ErrorAction SilentlyContinue

if ($dockerInstalled) {
    Write-Host "🐳 Building Docker image..." -ForegroundColor Yellow
    docker build -t ${AppName}:latest .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "🚀 Starting Docker container..." -ForegroundColor Yellow
        docker-compose down 2>$null
        
        # Update docker-compose.yml with domain
        (Get-Content docker-compose.yml) -replace "yourdomain.com", $Domain | Set-Content docker-compose.yml
        (Get-Content docker-compose.yml) -replace "your-email@example.com", "admin@$Domain" | Set-Content docker-compose.yml
        
        docker-compose up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Docker deployment completed!" -ForegroundColor Green
            Write-Host "🌐 Your app should be available at: https://$Domain" -ForegroundColor Green
        } else {
            Write-Host "❌ Docker deployment failed!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Docker build failed!" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Docker not found. Manual deployment required." -ForegroundColor Yellow
    Write-Host "📁 Built files are in the 'dist' directory" -ForegroundColor Yellow
    Write-Host "📋 Manual deployment steps:" -ForegroundColor Yellow
    Write-Host "   1. Upload 'dist' contents to your web server" -ForegroundColor Yellow
    Write-Host "   2. Configure your web server (nginx/apache) to serve the files" -ForegroundColor Yellow
    Write-Host "   3. Set up SSL certificate for https://$Domain" -ForegroundColor Yellow
    Write-Host "   4. Configure your domain's DNS to point to your server" -ForegroundColor Yellow
}

# Health check
Write-Host "🏥 Performing health check..." -ForegroundColor Yellow
Start-Sleep 5

try {
    $response = Invoke-WebRequest -Uri "http://localhost/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health check passed!" -ForegroundColor Green
    } else {
        Write-Host "❌ Health check failed. Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Health check failed. Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Deployment completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Configure your domain DNS to point to this server" -ForegroundColor Yellow
Write-Host "   2. Set up your Supabase database using the migration files" -ForegroundColor Yellow
Write-Host "   3. Test the application at https://$Domain" -ForegroundColor Yellow
Write-Host "   4. Monitor logs with: docker-compose logs -f" -ForegroundColor Yellow

