#!/bin/bash

# =============================================================================
# Bradley AI - Codex Automated Setup Script
# =============================================================================

set -e  # Exit on any error

echo "🚀 Starting Bradley AI setup for Codex..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed and version is correct
check_node() {
    print_status "Checking Node.js version..."
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 20.x or higher."
        exit 1
    fi

    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 20 ]; then
        print_error "Node.js version 20.x or higher is required. Current version: $(node -v)"
        exit 1
    fi

    print_success "Node.js version $(node -v) is compatible"
}

# Check if npm is available
check_npm() {
    print_status "Checking npm..."
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm."
        exit 1
    fi
    print_success "npm version $(npm -v) is available"
}

# Install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."
    npm ci || npm install
    print_success "Dependencies installed successfully"
}

# Generate Prisma client
setup_prisma() {
    print_status "Setting up Prisma client..."
    npx prisma generate
    print_success "Prisma client generated successfully"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."

    # Check if .env.local exists
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local file not found. Creating example file..."
        create_env_example
    fi

    # Load environment variables
    if [ -f ".env.local" ]; then
        export $(grep -v '^#' .env.local | xargs)
    fi

    # Critical environment variables
    CRITICAL_VARS=("DATABASE_URL" "NEXTAUTH_SECRET")
    MISSING_CRITICAL=()

    for var in "${CRITICAL_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_CRITICAL+=("$var")
        fi
    done

    # Important environment variables
    IMPORTANT_VARS=("ALCHEMY_API_KEY" "ANTHROPIC_API_KEY" "COINGECKO_API_KEY")
    MISSING_IMPORTANT=()

    for var in "${IMPORTANT_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            MISSING_IMPORTANT+=("$var")
        fi
    done

    # Report results
    if [ ${#MISSING_CRITICAL[@]} -eq 0 ]; then
        print_success "All critical environment variables are set"
    else
        print_error "Missing critical environment variables: ${MISSING_CRITICAL[*]}"
        print_error "The application will not function without these variables."
        return 1
    fi

    if [ ${#MISSING_IMPORTANT[@]} -eq 0 ]; then
        print_success "All important environment variables are set"
    else
        print_warning "Missing important environment variables: ${MISSING_IMPORTANT[*]}"
        print_warning "Some features may not work without these variables."
    fi
}

# Create example environment file
create_env_example() {
    cat > .env.local << 'EOF'
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
EOF
    print_success "Created .env.local example file. Please update with your actual values."
}

# Check database connectivity
check_database() {
    print_status "Checking database connectivity..."

    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set. Skipping database check."
        return 0
    fi

    # Try to connect to database using Prisma
    if npx prisma db push --preview-feature 2>/dev/null; then
        print_success "Database connection successful"
    else
        print_warning "Database connection failed. Please check your DATABASE_URL and ensure PostgreSQL is running."
    fi
}

# Build the application
build_app() {
    print_status "Building the application..."
    npm run build
    print_success "Application built successfully"
}

# Run basic tests
run_tests() {
    print_status "Running linting checks..."
    npm run lint || print_warning "Linting issues found. Application may still work."

    print_status "Running type checking..."
    npx tsc --noEmit || print_warning "TypeScript issues found. Application may still work."
}

# Start development server for testing
start_dev_server() {
    print_status "Starting development server for testing..."
    print_status "Server will start on http://localhost:3000"
    print_status "Press Ctrl+C to stop the server"

    # Start server in background
    npm run dev &
    DEV_PID=$!

    # Wait a moment for server to start
    sleep 5

    # Test if server is responding
    if curl -s http://localhost:3000 > /dev/null; then
        print_success "Development server is running successfully!"
        print_status "You can access the application at http://localhost:3000"
    else
        print_warning "Development server may not be responding correctly"
    fi

    # Clean up
    kill $DEV_PID 2>/dev/null || true
}

# Health check function
health_check() {
    print_status "Running health checks..."

    # Check critical files exist
    CRITICAL_FILES=("package.json" "next.config.js" "prisma/schema.prisma" "src/app/layout.tsx")
    for file in "${CRITICAL_FILES[@]}"; do
        if [ -f "$file" ]; then
            print_success "✓ $file exists"
        else
            print_error "✗ $file is missing"
            return 1
        fi
    done

    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        print_success "✓ Dependencies are installed"
    else
        print_error "✗ Dependencies not installed"
        return 1
    fi

    # Check Prisma client
    if [ -d "node_modules/.prisma" ]; then
        print_success "✓ Prisma client is generated"
    else
        print_warning "✗ Prisma client may not be generated"
    fi
}

# Main setup function
main() {
    echo "=============================================="
    echo "  Bradley AI - Codex Setup Script"
    echo "=============================================="
    echo

    # Run all checks and setup steps
    check_node
    check_npm
    install_dependencies
    setup_prisma
    check_env_vars || {
        print_error "Environment setup failed. Please configure your .env.local file."
        exit 1
    }
    check_database
    build_app
    run_tests
    health_check

    echo
    echo "=============================================="
    print_success "Setup completed successfully!"
    echo "=============================================="
    echo
    print_status "Next steps:"
    echo "1. Configure your .env.local file with actual API keys"
    echo "2. Ensure PostgreSQL database is running"
    echo "3. Run 'npm run dev' to start development server"
    echo "4. Access the application at http://localhost:3000"
    echo
    print_status "For production deployment, run 'npm run build && npm start'"
    echo

    # Ask if user wants to start dev server
    read -p "Would you like to start the development server now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        start_dev_server
    fi
}

# Run main function
main "$@"
