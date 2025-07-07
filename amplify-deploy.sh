#!/bin/bash

# Ardonie Capital AWS Amplify Deployment Script
# This script prepares and triggers deployment to AWS Amplify

set -e  # Exit on any error

# Configuration
AMPLIFY_APP_ID="d13g8yncb9utus"
REGION="us-east-2"
BRANCH="main"
CONSOLE_URL="https://us-east-2.console.aws.amazon.com/amplify/apps/d13g8yncb9utus/branches/main/deploy-updates"

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

# Function to check if AWS CLI is installed
check_aws_cli() {
    print_status "Checking AWS CLI installation..."
    if ! command -v aws &> /dev/null; then
        print_error "AWS CLI is not installed. Please install AWS CLI v2 first."
        echo "Installation instructions: https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    
    AWS_VERSION=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
    print_success "AWS CLI version $AWS_VERSION is installed"
}

# Function to check AWS credentials
check_aws_credentials() {
    print_status "Checking AWS credentials..."
    if ! aws sts get-caller-identity &> /dev/null; then
        print_error "AWS credentials not configured or invalid."
        echo "Please run: aws configure"
        exit 1
    fi
    
    AWS_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    AWS_USER=$(aws sts get-caller-identity --query Arn --output text)
    print_success "AWS credentials configured for account: $AWS_ACCOUNT"
    print_status "User: $AWS_USER"
}

# Function to validate project structure
validate_project() {
    print_status "Validating project structure for Amplify deployment..."
    
    # Check critical files
    if [ ! -f "index.html" ]; then
        print_error "index.html not found in current directory"
        exit 1
    fi
    
    if [ ! -f "amplify.yml" ]; then
        print_error "amplify.yml not found. This file is required for Amplify deployment."
        exit 1
    fi
    
    # Check recent CSS fixes
    print_status "Verifying recent CSS styling fixes..."
    if [ ! -f "about.html" ]; then
        print_warning "about.html not found"
    fi
    
    if [ ! -f "tools/due-diligence-checklist.html" ]; then
        print_warning "tools/due-diligence-checklist.html not found"
    fi
    
    if [ ! -f "tools/valuation.html" ]; then
        print_warning "tools/valuation.html not found"
    fi
    
    # Check assets directory
    if [ ! -d "assets" ]; then
        print_warning "assets directory not found"
    else
        print_status "Assets directory structure:"
        ls -la assets/ | head -10
    fi
    
    print_success "Project structure validated"
}

# Function to check git status
check_git_status() {
    print_status "Checking git repository status..."
    
    # Check if we're in a git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        print_error "Not in a git repository"
        exit 1
    fi
    
    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    print_status "Current branch: $CURRENT_BRANCH"
    
    if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
        print_warning "Current branch ($CURRENT_BRANCH) is not the deployment branch ($BRANCH)"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    fi
    
    # Check if there are uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        print_warning "There are uncommitted changes in the repository"
        git status --porcelain
        read -p "Continue with deployment? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_error "Deployment cancelled"
            exit 1
        fi
    fi
    
    # Check if local branch is up to date with remote
    git fetch origin
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$BRANCH)
    
    if [ "$LOCAL" != "$REMOTE" ]; then
        print_warning "Local branch is not up to date with remote"
        print_status "Local: $LOCAL"
        print_status "Remote: $REMOTE"
        read -p "Push local changes and continue? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git push origin $BRANCH
            print_success "Changes pushed to remote"
        else
            print_error "Deployment cancelled"
            exit 1
        fi
    fi
    
    print_success "Git repository is ready for deployment"
}

# Function to trigger Amplify deployment
trigger_amplify_deployment() {
    print_status "Triggering AWS Amplify deployment..."
    
    # Start a new build
    BUILD_ID=$(aws amplify start-job \
        --app-id "$AMPLIFY_APP_ID" \
        --branch-name "$BRANCH" \
        --job-type RELEASE \
        --region "$REGION" \
        --query 'jobSummary.jobId' \
        --output text)
    
    if [ $? -eq 0 ]; then
        print_success "Amplify deployment triggered successfully"
        print_status "Build ID: $BUILD_ID"
        print_status "App ID: $AMPLIFY_APP_ID"
        print_status "Branch: $BRANCH"
        print_status "Region: $REGION"
    else
        print_error "Failed to trigger Amplify deployment"
        exit 1
    fi
    
    return 0
}

# Function to monitor deployment
monitor_deployment() {
    print_status "Monitoring deployment progress..."
    print_status "You can also monitor the deployment in the AWS Console:"
    print_status "$CONSOLE_URL"
    echo
    
    # Wait a moment for the job to start
    sleep 5
    
    # Monitor the job status
    local max_attempts=60  # 30 minutes max (30 seconds * 60)
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        STATUS=$(aws amplify get-job \
            --app-id "$AMPLIFY_APP_ID" \
            --branch-name "$BRANCH" \
            --job-id "$BUILD_ID" \
            --region "$REGION" \
            --query 'job.summary.status' \
            --output text 2>/dev/null || echo "UNKNOWN")
        
        case $STATUS in
            "PENDING")
                print_status "Build status: Pending..."
                ;;
            "PROVISIONING")
                print_status "Build status: Provisioning..."
                ;;
            "RUNNING")
                print_status "Build status: Running..."
                ;;
            "SUCCEED")
                print_success "Build completed successfully!"
                return 0
                ;;
            "FAILED")
                print_error "Build failed!"
                return 1
                ;;
            "CANCELLED")
                print_warning "Build was cancelled"
                return 1
                ;;
            *)
                print_status "Build status: $STATUS"
                ;;
        esac
        
        sleep 30
        ((attempt++))
    done
    
    print_warning "Monitoring timeout reached. Check the AWS Console for current status."
    return 0
}

# Function to display deployment summary
show_summary() {
    print_success "Deployment process completed!"
    echo
    echo "=== DEPLOYMENT SUMMARY ==="
    echo "App ID: $AMPLIFY_APP_ID"
    echo "Region: $REGION"
    echo "Branch: $BRANCH"
    echo "Build ID: $BUILD_ID"
    echo "Console URL: $CONSOLE_URL"
    echo
    echo "=== NEXT STEPS ==="
    echo "1. Monitor the build progress in the AWS Amplify Console"
    echo "2. Once deployed, test the website functionality"
    echo "3. Verify CSS styling fixes are working correctly"
    echo "4. Test footer standardization across all pages"
    echo "5. Check mobile responsiveness and interactive elements"
    echo
}

# Main deployment function
main() {
    echo "=== ARDONIE CAPITAL AWS AMPLIFY DEPLOYMENT ==="
    echo "Starting deployment process..."
    echo
    
    # Run all checks and deployment steps
    check_aws_cli
    check_aws_credentials
    validate_project
    check_git_status
    trigger_amplify_deployment
    monitor_deployment
    show_summary
}

# Run main function
main "$@"
