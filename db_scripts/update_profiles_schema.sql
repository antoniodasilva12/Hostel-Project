-- Check if columns exist and add them if they don't
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'phone_number') THEN
        ALTER TABLE profiles ADD COLUMN phone_number VARCHAR(15);
    END IF;
END $$;

-- Update existing records to split full_name into first_name and last_name
UPDATE profiles
SET 
  first_name = SPLIT_PART(full_name, ' ', 1),
  last_name = SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1)
WHERE first_name IS NULL OR last_name IS NULL;

-- Set a default phone number for existing records
UPDATE profiles
SET phone_number = '0700000000'
WHERE phone_number IS NULL;

-- Make the columns required after setting default values
ALTER TABLE profiles
ALTER COLUMN first_name SET NOT NULL,
ALTER COLUMN last_name SET NOT NULL,
ALTER COLUMN phone_number SET NOT NULL;

-- Temporarily remove NOT NULL constraint from full_name
ALTER TABLE profiles
ALTER COLUMN full_name DROP NOT NULL;

-- Add validation check for phone number format if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'phone_number_format') THEN
        ALTER TABLE profiles
        ADD CONSTRAINT phone_number_format CHECK (
          phone_number ~ '^(?:\+254|0)[17]\d{8}$'
        );
    END IF;
END $$;

-- Optionally, you can drop the full_name column if you no longer need it
-- ALTER TABLE profiles DROP COLUMN full_name;

-- Add indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_first_name') THEN
        CREATE INDEX idx_profiles_first_name ON profiles(first_name);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_last_name') THEN
        CREATE INDEX idx_profiles_last_name ON profiles(last_name);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_phone_number') THEN
        CREATE INDEX idx_profiles_phone_number ON profiles(phone_number);
    END IF;
END $$; 