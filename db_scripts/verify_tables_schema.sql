-- Verify rooms table schema and add missing columns if needed
DO $$
BEGIN
    -- Check if type column exists in rooms table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'type'
    ) THEN
        ALTER TABLE rooms ADD COLUMN type TEXT;
    END IF;

    -- Check if floor_number column exists in rooms table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'floor_number'
    ) THEN
        ALTER TABLE rooms ADD COLUMN floor_number INTEGER;
    END IF;

    -- Check if room_number column exists in rooms table
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'rooms' AND column_name = 'room_number'
    ) THEN
        ALTER TABLE rooms ADD COLUMN room_number TEXT;
    END IF;
END
$$;

-- Make sure booking_requests table exists
CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security if not already enabled
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Check if policies exist and create them if they don't
DO $$
BEGIN
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Admins can view all booking requests" ON booking_requests;
    DROP POLICY IF EXISTS "Admins can update all booking requests" ON booking_requests;
    DROP POLICY IF EXISTS "Students can view their own booking requests" ON booking_requests;
    DROP POLICY IF EXISTS "Students can insert their own booking requests" ON booking_requests;

    -- Create policies
    CREATE POLICY "Admins can view all booking requests"
    ON booking_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

    CREATE POLICY "Admins can update all booking requests"
    ON booking_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

    CREATE POLICY "Students can view their own booking requests"
    ON booking_requests
    FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
    );

    CREATE POLICY "Students can insert their own booking requests"
    ON booking_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid()
    );
END
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON booking_requests TO authenticated;

-- Insert sample data for testing if table is empty
INSERT INTO booking_requests (student_id, room_id, status, notes)
SELECT 
    p.id as student_id,
    r.id as room_id,
    'pending' as status,
    'Sample booking request for testing' as notes
FROM 
    profiles p, rooms r
WHERE 
    p.role = 'student' AND NOT r.is_occupied
    AND NOT EXISTS (SELECT 1 FROM booking_requests WHERE booking_requests.student_id = p.id)
LIMIT 3; 