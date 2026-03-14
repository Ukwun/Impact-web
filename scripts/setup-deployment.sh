#!/bin/bash

# ImpactEdu Deployment Setup Script
# This script helps configure environment variables and prepare for Netlify deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}═══════════════════════════════════════════════${NC}"
echo -e "${BLUE}  ImpactEdu Netlify Deployment Setup${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════${NC}\n"

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local already exists${NC}"
    read -p "Do you want to overwrite it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Using existing .env.local${NC}"
        exit 0
    fi
fi

# Initialize .env.local
cat > .env.local << 'EOF'
# Database Configuration
DATABASE_URL=

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=

# Email Service Configuration
EMAIL_PROVIDER=resend
RESEND_API_KEY=
SENDGRID_API_KEY=

# SMTP Configuration (alternative to Resend/SendGrid)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
SMTP_FROM_EMAIL=

# JWT Configuration
JWT_SECRET=

# Next.js Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api
NODE_ENV=production

# Payment Gateway (Optional)
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=

# Monitoring (Optional)
NEXT_PUBLIC_SENTRY_DSN=
EOF

echo -e "${GREEN}✓ Created .env.local file${NC}\n"

# Function to prompt for environment variable
prompt_env() {
    local var_name=$1
    local description=$2
    local current_value=${!var_name:-}
    
    echo -e "${BLUE}${description}${NC}"
    if [ -n "$current_value" ]; then
        echo -e "Current value: ${YELLOW}${current_value:0:20}...${NC}"
    fi
    read -p "Enter $var_name (or press Enter to skip): " value
    
    if [ -n "$value" ]; then
        sed -i.bak "s|${var_name}=.*|${var_name}=${value}|" .env.local
        echo -e "${GREEN}✓ Set ${var_name}${NC}\n"
    fi
}

# Prompt for required variables
echo -e "${YELLOW}Please provide your configuration details:${NC}\n"

prompt_env "DATABASE_URL" "1. Enter PostgreSQL connection string (from Railway/Render/AWS RDS)"
prompt_env "AWS_ACCESS_KEY_ID" "2. Enter AWS Access Key ID"
prompt_env "AWS_SECRET_ACCESS_KEY" "3. Enter AWS Secret Access Key"
prompt_env "AWS_S3_BUCKET" "4. Enter AWS S3 Bucket name"
prompt_env "RESEND_API_KEY" "5. Enter Resend API Key (or skip if using SendGrid/SMTP)"
prompt_env "JWT_SECRET" "6. Enter JWT Secret (min 32 characters)"
prompt_env "NEXT_PUBLIC_API_BASE_URL" "7. Enter your production domain (e.g., https://yourdomain.com/api)"

# Generate JWT secret if not provided
if ! grep -q "JWT_SECRET=" .env.local || [ -z "$(grep 'JWT_SECRET=' .env.local | cut -d'=' -f2)" ]; then
    echo -e "${YELLOW}Generating secure JWT_SECRET...${NC}"
    SECRET=$(openssl rand -base64 32)
    sed -i.bak "s|JWT_SECRET=.*|JWT_SECRET=${SECRET}|" .env.local
    echo -e "${GREEN}✓ Generated JWT_SECRET${NC}\n"
fi

# Validate .env.local
echo -e "${YELLOW}Validating configuration...${NC}"
required_vars=("DATABASE_URL" "AWS_ACCESS_KEY_ID" "AWS_SECRET_ACCESS_KEY" "AWS_S3_BUCKET" "JWT_SECRET")

missing_vars=()
for var in "${required_vars[@]}"; do
    if ! grep -q "^${var}=[^$]" .env.local; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo -e "${RED}✗ Missing required variables:${NC}"
    printf '%s\n' "${missing_vars[@]}"
    echo -e "\n${YELLOW}Please edit .env.local manually and add the missing variables${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Configuration validated successfully${NC}\n"

# Build and test
echo -e "${YELLOW}Building application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Build successful${NC}\n"
else
    echo -e "${RED}✗ Build failed. Please check errors above.${NC}"
    exit 1
fi

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npm run db:migrate

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Migrations successful${NC}\n"
else
    echo -e "${RED}✗ Migration failed. Please check your DATABASE_URL.${NC}"
    exit 1
fi

# Final instructions
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Setup Complete! Ready for Netlify Deployment${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}Next Steps:${NC}"
echo "1. Verify .env.local looks correct (but don't commit it)"
echo "2. Login to Netlify: ${YELLOW}netlify login${NC}"
echo "3. Initialize Netlify site: ${YELLOW}netlify init${NC}"
echo "4. Set environment variables in Netlify dashboard"
echo "5. Trigger deployment: ${YELLOW}git push${NC}"
echo ""
echo -e "${YELLOW}For detailed instructions, see NETLIFY_DEPLOYMENT.md${NC}\n"

# Cleanup backup files
rm -f .env.local.bak
