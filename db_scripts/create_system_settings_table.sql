-- Create system_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hostelName TEXT DEFAULT 'Student Hostel',
    emailNotifications BOOLEAN DEFAULT true,
    semesterStartDate TIMESTAMP WITH TIME ZONE,
    semesterEndDate TIMESTAMP WITH TIME ZONE,
    defaultRoomPrice DECIMAL DEFAULT 5000,
    bookingEnabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Only admins can access system settings" 
ON system_settings
USING (
    EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON system_settings TO authenticated;

-- Insert default values if table is empty
INSERT INTO system_settings (
    hostelName, 
    emailNotifications, 
    semesterStartDate, 
    semesterEndDate, 
    defaultRoomPrice, 
    bookingEnabled
)
SELECT 
    'Student Hostel' as hostelName,
    true as emailNotifications,
    NOW() as semesterStartDate,
    (NOW() + INTERVAL '4 months') as semesterEndDate,
    5000 as defaultRoomPrice,
    true as bookingEnabled
WHERE NOT EXISTS (SELECT 1 FROM system_settings); 