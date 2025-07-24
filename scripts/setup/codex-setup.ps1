# =============================================================================
# Bradley AI - Codex Automated Setup Script (PowerShell)
# =============================================================================

param(
    [switch]$SkipInteractive,
    [switch]$Force
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Bradley AI setup for Codex..." -ForegroundColor Cyan

# Functions for colored output
function Write-Status {
    param($Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param($Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param($Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param($Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Node.js is installed and version is correct
function Test-NodeVersion {
    Write-Status "Checking Node.js version..."

    try {
        $nodeVersion = node --version
        $versionNumber = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')

        if ($versionNumber -lt 20) {
            Write-Error "Node.js version 20.x or higher is required. Current version: $nodeVersion"
            exit 1
        }

        Write-Success "Node.js version $nodeVersion is compatible"
    }
    catch {
        Write-Error "Node.js is not installed. Please install Node.js 20.x or higher."
        exit 1
    }
}

# Check if npm is available
function Test-Npm {
    Write-Status "Checking npm..."

    try {
        $npmVersion = npm --version
        Write-Success "npm version $npmVersion is available"
    }
    catch {
        Write-Error "npm is not installed. Please install npm."
        exit 1
    }
}

# Install dependencies
function Install-Dependencies {
    Write-Status "Installing Node.js dependencies..."

    try {
        if (Test-Path "package-lock.json") {
            npm ci
        } else {
            npm install
        }
        Write-Success "Dependencies installed successfully"
    }
    catch {
        Write-Error "Failed to install dependencies: $_"
        exit 1
    }
}

# Generate Prisma client
function Initialize-Prisma {
    Write-Status "Setting up Prisma client..."

    try {
        npx prisma generate
        Write-Success "Prisma client generated successfully"
    }
    catch {
        Write-Error "Failed to generate Prisma client: $_"
        exit 1
    }
}

# Check environment variables
function Test-EnvironmentVariables {
    Write-Status "Checking environment variables..."

    # Check if .env.local exists
    if (-not (Test-Path ".env.local")) {
        Write-Warning ".env.local file not found. Creating example file..."
        New-EnvironmentFile
    }

    # Load environment variables from file
    $envVars = @{}
    if (Test-Path ".env.local") {
        Get-Content ".env.local" | ForEach-Object {
            if ($_ -match "^([^#][^=]+)=(.*)$") {
                $envVars[$matches[1]] = $matches[2] -replace '"', ''
            }
        }
    }

    # Critical environment variables
    $criticalVars = @("DATABASE_URL", "NEXTAUTH_SECRET")
    $missingCritical = @()

    foreach ($var in $criticalVars) {
        if (-not $envVars.ContainsKey($var) -or [string]::IsNullOrWhiteSpace($envVars[$var])) {
            $missingCritical += $var
        }
    }

    # Important environment variables
    $importantVars = @("ALCHEMY_API_KEY", "ANTHROPIC_API_KEY", "COINGECKO_API_KEY")
    $missingImportant = @()

    foreach ($var in $importantVars) {
        if (-not $envVars.ContainsKey($var) -or [string]::IsNullOrWhiteSpace($envVars[$var])) {
            $missingImportant += $var
        }
    }

    # Report results
    if ($missingCritical.Count -eq 0) {
        Write-Success "All critical environment variables are set"
    } else {
        Write-Error "Missing critical environment variables: $($missingCritical -join ', ')"
        Write-Error "The application will not function without these variables."
        return $false
    }

    if ($missingImportant.Count -eq 0) {
        Write-Success "All important environment variables are set"
    } else {
        Write-Warning "Missing important environment variables: $($missingImportant -join ', ')"
        Write-Warning "Some features may not work without these variables."
    }

    return $true
}

# Create example environment file
function New-EnvironmentFile {
    $envContent = @"
# =============================================================================
# Bradley AI Environment Configuration for Codex
# =============================================================================

# Core Application
NODE_ENV=development
NEXT_PUBLIC_APP_ENV=development

# Database Configuration (REQUIRED)
DATABASE_URL="postgresql://username:password@localhost:5432/bradley_ai?schema=public"

# Authentication (REQUIRED)
NEXTAUTH_SECRET="please-change-this-to-a-secure-32-character-secret"
NEXTAUTH_URL="http://localhost:3000"

# Redis Cache (Optional but recommended)
# REDIS_URL="redis://localhost:6379"

# API Keys (Add your actual keys here)
# ALCHEMY_API_KEY="your_alchemy_api_key"
# ANTHROPIC_API_KEY="your_anthropic_api_key"
# COINGECKO_API_KEY="your_coingecko_api_key"
# OPENSEA_API_KEY="your_opensea_api_key"
# MORALIS_API_KEY="your_moralis_api_key"

# Development Settings
DEBUG="bradley:*"
NEXT_TELEMETRY_DISABLED=1
"@

    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Success "Created .env.local example file. Please update with your actual values."
}

# Check database connectivity
function Test-Database {
    Write-Status "Checking database connectivity..."

    # Load DATABASE_URL from .env.local
    $databaseUrl = ""
    if (Test-Path ".env.local") {
        $envContent = Get-Content ".env.local"
        $databaseLine = $envContent | Where-Object { $_ -match "^DATABASE_URL=" }
        if ($databaseLine) {
            $databaseUrl = ($databaseLine -split "=", 2)[1] -replace '"', ''
        }
    }

    if ([string]::IsNullOrWhiteSpace($databaseUrl)) {
        Write-Warning "DATABASE_URL not set. Skipping database check."
        return
    }

    try {
        npx prisma db push --preview-feature 2>$null
        Write-Success "Database connection successful"
    }
    catch {
        Write-Warning "Database connection failed. Please check your DATABASE_URL and ensure PostgreSQL is running."
    }
}

# Build the application
function Build-Application {
    Write-Status "Building the application..."

    try {
        npm run build
        Write-Success "Application built successfully"
    }
    catch {
        Write-Error "Failed to build application: $_"
        exit 1
    }
}

# Run basic tests
function Invoke-Tests {
    Write-Status "Running linting checks..."

    try {
        npm run lint
        Write-Success "Linting passed"
    }
    catch {
        Write-Warning "Linting issues found. Application may still work."
    }

    Write-Status "Running type checking..."

    try {
        npx tsc --noEmit
        Write-Success "Type checking passed"
    }
    catch {
        Write-Warning "TypeScript issues found. Application may still work."
    }
}

# Health check function
function Test-ApplicationHealth {
    Write-Status "Running health checks..."

    # Check critical files exist
    $criticalFiles = @("package.json", "next.config.js", "prisma/schema.prisma", "src/app/layout.tsx")

    foreach ($file in $criticalFiles) {
        if (Test-Path $file) {
            Write-Success "✓ $file exists"
        } else {
            Write-Error "✗ $file is missing"
            return $false
        }
    }

    # Check if node_modules exists
    if (Test-Path "node_modules") {
        Write-Success "✓ Dependencies are installed"
    } else {
        Write-Error "✗ Dependencies not installed"
        return $false
    }

    # Check Prisma client
    if (Test-Path "node_modules/.prisma") {
        Write-Success "✓ Prisma client is generated"
    } else {
        Write-Warning "✗ Prisma client may not be generated"
    }

    return $true
}

# Start development server for testing
function Start-DevelopmentServer {
    Write-Status "Starting development server for testing..."
    Write-Status "Server will start on http://localhost:3000"
    Write-Status "Press Ctrl+C to stop the server"

    try {
        # Start server as background job
        $job = Start-Job -ScriptBlock { npm run dev }

        # Wait for server to start
        Start-Sleep -Seconds 5

        # Test if server is responding
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                Write-Success "Development server is running successfully!"
                Write-Status "You can access the application at http://localhost:3000"
            } else {
                Write-Warning "Development server may not be responding correctly"
            }
        }
        catch {
            Write-Warning "Could not test server response: $_"
        }

        # Clean up
        Stop-Job $job -ErrorAction SilentlyContinue
        Remove-Job $job -ErrorAction SilentlyContinue
    }
    catch {
        Write-Error "Failed to start development server: $_"
    }
}

# Main setup function
function main {
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host "  Bradley AI - Codex Setup Script" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""

    try {
        # Run all checks and setup steps
        Test-NodeVersion
        Test-Npm
        Install-Dependencies
        Initialize-Prisma

        if (-not (Test-EnvironmentVariables)) {
            Write-Error "Environment setup failed. Please configure your .env.local file."
            exit 1
        }

        Test-Database
        Build-Application
        Invoke-Tests

        if (-not (Test-ApplicationHealth)) {
            Write-Error "Health check failed."
            exit 1
        }

        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Green
        Write-Success "Setup completed successfully!"
        Write-Host "===============================================" -ForegroundColor Green
        Write-Host ""

        Write-Status "Next steps:"
        Write-Host "1. Configure your .env.local file with actual API keys"
        Write-Host "2. Ensure PostgreSQL database is running"
        Write-Host "3. Run 'npm run dev' to start development server"
        Write-Host "4. Access the application at http://localhost:3000"
        Write-Host ""
        Write-Status "For production deployment, run 'npm run build && npm start'"
        Write-Host ""

        # Ask if user wants to start dev server
        if (-not $SkipInteractive) {
            $startServer = Read-Host "Would you like to start the development server now? (y/n)"
            if ($startServer -eq "y" -or $startServer -eq "Y") {
                Start-DevelopmentServer
            }
        }
    }
    catch {
        Write-Error "Setup failed: $_"
        exit 1
    }
}

# Run main function
main
