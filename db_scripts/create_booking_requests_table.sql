-- Create booking_requests table if it doesn't exist
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

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_booking_requests_updated_at
BEFORE UPDATE ON booking_requests
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
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

-- Create policies for student access
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

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON booking_requests TO authenticated; 