-- Add created_at column to users table
ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Update existing records to have a created_at timestamp
-- (This will set created_at to current timestamp for existing users)
UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL;
