-- UP MIGRATION: Create users table and add foreign key constraint
BEGIN;

-- Step 1: Create users table if it doesn't exist
-- This table will store user authentication data
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Delete orphan rows from profiles table
-- Remove any profiles that don't have corresponding users
DELETE FROM profiles 
WHERE id NOT IN (SELECT id FROM users);

-- Step 3: Add foreign key constraint
-- This ensures profiles.id must reference a valid users.id
ALTER TABLE profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE;

COMMIT;

-- DOWN MIGRATION: Rollback changes
BEGIN;

-- Step 1: Drop the foreign key constraint
-- This removes the relationship between profiles and users
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Step 2: Drop users table if it was created by this migration
-- Note: This will remove all user data - use with caution
DROP TABLE IF EXISTS users;

COMMIT;