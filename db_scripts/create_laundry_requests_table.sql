-- Create laundry_requests table if it doesn't exist
CREATE TABLE IF NOT EXISTS laundry_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id),
    room_number TEXT NOT NULL,
    number_of_clothes INTEGER NOT NULL,
    special_instructions TEXT,
    pickup_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'ready', 'collected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE laundry_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for laundry_requests
DO $$
BEGIN
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Admins can view all laundry requests" ON laundry_requests;
    DROP POLICY IF EXISTS "Admins can update all laundry requests" ON laundry_requests;
    DROP POLICY IF EXISTS "Students can view their own laundry requests" ON laundry_requests;
    DROP POLICY IF EXISTS "Students can insert their own laundry requests" ON laundry_requests;

    -- Create policies
    CREATE POLICY "Admins can view all laundry requests"
    ON laundry_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

    CREATE POLICY "Admins can update all laundry requests"
    ON laundry_requests
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

    CREATE POLICY "Students can view their own laundry requests"
    ON laundry_requests
    FOR SELECT
    TO authenticated
    USING (
        student_id = auth.uid()
    );

    CREATE POLICY "Students can insert their own laundry requests"
    ON laundry_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (
        student_id = auth.uid()
    );
END
$$;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON laundry_requests TO authenticated;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_laundry_requests_updated_at
    BEFORE UPDATE ON laundry_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 