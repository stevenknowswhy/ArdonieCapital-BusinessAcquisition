-- Migration: Add business_details field for seller profiles
-- Date: 2025-01-08
-- Description: Add JSONB field to store seller-specific business information

-- Add business_details column to profiles table
ALTER TABLE profiles 
ADD COLUMN business_details JSONB;

-- Add index for business_details queries
CREATE INDEX idx_profiles_business_details ON profiles USING GIN (business_details);

-- Add comment for documentation
COMMENT ON COLUMN profiles.business_details IS 'JSON field storing seller-specific business information including business_type, years_in_business, annual_revenue, employee_count, reason_for_selling';
