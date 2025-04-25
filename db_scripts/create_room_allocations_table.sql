-- Verify and create room_allocations table if needed
CREATE TABLE IF NOT EXISTS room_allocations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES profiles(id),
    room_id UUID NOT NULL REFERENCES rooms(id),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE room_allocations ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access
CREATE POLICY IF NOT EXISTS "Admins can view all allocations" 
ON room_allocations FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY IF NOT EXISTS "Admins can insert allocations" 
ON room_allocations FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

CREATE POLICY IF NOT EXISTS "Admins can update allocations" 
ON room_allocations FOR UPDATE 
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Create policies for student access
CREATE POLICY IF NOT EXISTS "Students can view their own allocations" 
ON room_allocations FOR SELECT 
USING (
    student_id = auth.uid()
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON room_allocations TO authenticated; 